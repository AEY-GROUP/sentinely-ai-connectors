#!/usr/bin/env node
// Checks the release invariants of this package. Prints each problem and exits 1 if there are any.

import { createHash } from 'node:crypto';
import { readFile, readdir } from 'node:fs/promises';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

export const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
export const ENDPOINT = 'https://app.sentinely.co/api/mcp';
export const REPOSITORY = 'https://github.com/AEY-GROUP/sentinely-ai-connectors';

const SKIP_DIRS = new Set(['.git', 'node_modules', 'dist']);
const TEXT = /\.(md|json|ya?ml|mjs|txt)$|(^|\/)(LICENSE|\.gitignore)$/;
// The scanner and the CI workflow hold the patterns themselves.
const SCAN_EXEMPT = new Set(['scripts/validate-package.mjs', '.github/workflows/validate.yml']);
const PROHIBITED = [
  [/BEGIN [A-Z ]*PRIVATE KEY/, 'private key'],
  [/sk_(live|test)_[A-Za-z0-9]/, 'Stripe key'],
  [/gh[pousr]_[A-Za-z0-9]{20,}/, 'GitHub token'],
  [/Bearer\s+[A-Za-z0-9._-]{20,}/, 'bearer token'],
  [/"(authorization|headers|client_secret|clientSecret|access_token)"\s*:/i, 'static authorization material'],
  [/\.env\b/, 'env file reference'],
  [/(^|[^a-z])apps\/(mcp|web|worker)\//, 'private source path'],
  [/pnpm\s--filter|@sentinel\//, 'private build command'],
];

const read = (path) => readFile(join(ROOT, path), 'utf8');
const json = async (path) => JSON.parse(await read(path));

async function files(directory = ROOT) {
  const out = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    if (SKIP_DIRS.has(entry.name)) continue;
    const path = join(directory, entry.name);
    if (entry.isDirectory()) out.push(...(await files(path)));
    else out.push(relative(ROOT, path));
  }
  return out.sort();
}

function pngSize(buffer) {
  if (buffer.subarray(1, 4).toString() !== 'PNG') return null;
  return [buffer.readUInt32BE(16), buffer.readUInt32BE(20)];
}

const sha256 = (buffer) => createHash('sha256').update(buffer).digest('hex');
const backticked = (text) => [...text.matchAll(/`([a-z]+(?:_[a-z]+)+)`/g)].map((m) => m[1]);

export async function validatePackage() {
  const errors = [];
  const check = (ok, message) => {
    if (!ok) errors.push(message);
  };
  const all = await files();
  const exists = (path) => all.includes(path.replace(/^\.\//, ''));

  const pkg = await json('package.json');
  const release = await json('release.json');
  const server = await json('server.json');
  const marketplace = await json('.claude-plugin/marketplace.json');
  const claude = await json('claude/.claude-plugin/plugin.json');
  const codex = await json('.codex-plugin/plugin.json');
  const chatgpt = await json('chatgpt/plugin.json');

  // One version everywhere.
  const version = pkg.version;
  const versions = {
    'release.json': release.packageVersion,
    'server.json': server.version,
    'marketplace.json': marketplace.version,
    'marketplace.json plugin': marketplace.plugins[0].version,
    'claude plugin.json': claude.version,
    'codex plugin.json': codex.version,
  };
  for (const [where, v] of Object.entries(versions)) check(v === version, `${where} version ${v} != ${version}`);
  check((await read('CHANGELOG.md')).includes(`## ${version} - `), `CHANGELOG.md has no entry for ${version}`);

  // Repository, license and description agree.
  for (const [where, m] of [
    ['claude', claude],
    ['codex', codex],
    ['marketplace plugin', marketplace.plugins[0]],
  ]) {
    check(m.repository === REPOSITORY, `${where} repository is ${m.repository}`);
    check(m.license === 'MIT', `${where} license is ${m.license}`);
    check(m.description === server.description, `${where} description differs from server.json`);
  }
  check(chatgpt.description === server.description, 'chatgpt description differs from server.json');
  check(server.repository.url === REPOSITORY, 'server.json repository url');
  check(marketplace.plugins[0].source === './claude', 'marketplace plugin source must be ./claude');
  check(marketplace.plugins[0].name === claude.name, 'marketplace plugin name differs from claude plugin');

  // Every MCP config is the bare HTTPS endpoint; OAuth only, no static credentials.
  check(
    JSON.stringify(await json('claude/.mcp.json')) ===
      JSON.stringify({ mcpServers: { sentinely: { type: 'http', url: ENDPOINT } } }),
    'claude/.mcp.json must hold only the endpoint',
  );
  const openai = await json('.mcp-openai.json');
  check(
    JSON.stringify(openai) ===
      JSON.stringify({
        mcpServers: {
          sentinely: {
            type: 'http',
            url: ENDPOINT,
            extensions: { 'com.openai': { auth: { type: 'oauth', client: { mode: 'dcr' } } } },
          },
        },
      }),
    '.mcp-openai.json must hold only the endpoint and OAuth DCR',
  );
  check(chatgpt.mcp?.url === ENDPOINT && chatgpt.mcp?.auth === 'oauth', 'chatgpt mcp must be the endpoint with oauth');
  check(release.server?.endpoint === ENDPOINT, 'release.json endpoint');
  check(server.remotes?.[0]?.url === ENDPOINT, 'server.json remote endpoint');

  // Paths referenced by manifests exist.
  const refs = [
    ['claude', claude.mcpServers],
    ['', codex.mcpServers],
    ['', codex.skills],
    ['', codex.interface.composerIcon],
    ['', codex.interface.logo],
    ['', codex.extensions['com.openai'].onboardingSkill],
    ...Object.values(chatgpt.logos).map((logo) => ['chatgpt', logo]),
  ];
  for (const [base, ref] of refs) {
    const path = join(base, ref).replace(/\/$/, '');
    check(exists(path) || all.some((f) => f.startsWith(`${path}/`)), `missing referenced path ${path}`);
  }

  // Logos are the right size and match release.json checksums.
  for (const file of all.filter((f) => f.endsWith('.png'))) {
    const buffer = await readFile(join(ROOT, file));
    const size = pngSize(buffer);
    const expected = Number(file.match(/logo-(\d+)\.png$/)?.[1]);
    check(size && size[0] === expected && size[1] === expected, `${file} is ${size} not ${expected}x${expected}`);
    const name = file.split('/').pop();
    check(release.assets?.[name] === sha256(buffer), `${file} checksum differs from release.json`);
  }

  // One tool list everywhere.
  const tools = release.tools;
  check(Array.isArray(tools) && tools.length > 0 && new Set(tools).size === tools.length, 'release.json tools');
  const yaml = await read('skills/sentinely/agents/openai.yaml');
  const yamlTools = [...yaml.slice(yaml.indexOf('  tools:')).matchAll(/^ {4}- (\S+)$/gm)].map((m) => m[1]);
  check(JSON.stringify(yamlTools) === JSON.stringify(tools), 'openai.yaml tools differ from release.json');
  const toolsDoc = await read('docs/TOOLS.md');
  const docTools = [...toolsDoc.matchAll(/^- `([a-z_]+)` \(/gm)].map((m) => m[1]);
  check(
    JSON.stringify([...docTools].sort()) === JSON.stringify([...tools].sort()),
    'docs/TOOLS.md tools differ from release.json',
  );
  check(
    (await read('README.md')).includes(`lists ${tools.length} tools`),
    `README.md tool count is not ${tools.length}`,
  );
  const known = new Set([...tools, 'needs_review', 'create_deal', 'attach_note']);
  const skills = ['skills/sentinely/SKILL.md', 'claude/skills/sentinely/SKILL.md'];
  const skillText = await Promise.all(skills.map(read));
  check(skillText[0] === skillText[1], 'the Claude and Codex sentinely skills differ');
  for (const name of tools) check(skillText[0].includes(`\`${name}\``), `skill does not cover ${name}`);
  for (const file of [...skills, 'docs/REVIEWER_GUIDE.md', 'docs/LISTING.md', 'README.md', 'claude/README.md']) {
    for (const name of backticked(await read(file))) check(known.has(name), `${file} names unknown tool ${name}`);
  }

  // Review cases agree between ChatGPT and Codex.
  const review = chatgpt.extensions['com.openai.review'];
  const cases = codex.extensions['com.openai'].review.test_cases;
  const same = (a, b) =>
    JSON.stringify(a.map((c) => [c.prompt, c.toolsTriggered.join(', ')])) ===
    JSON.stringify(b.map((c) => [c.prompt, c.tools_triggered]));
  check(same(review.positiveCases, cases.positive), 'positive review cases differ between ChatGPT and Codex');
  check(same(review.negativeCases, cases.negative), 'negative review cases differ between ChatGPT and Codex');

  // The Claude plugin ships configuration only.
  for (const file of all.filter((f) => f.startsWith('claude/')))
    check(!/package(-lock)?\.json$|\.(m?js|cjs|ts|sh|py)$/.test(file), `claude/ must not ship ${file}`);

  // No secrets or private source references.
  for (const file of all.filter((f) => TEXT.test(f) && !SCAN_EXEMPT.has(f))) {
    const text = await read(file);
    for (const [pattern, label] of PROHIBITED) check(!pattern.test(text), `${file} contains ${label}`);
  }

  return errors;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const errors = await validatePackage();
  for (const error of errors) console.error(`- ${error}`);
  if (errors.length) process.exit(1);
  console.log('package valid');
}
