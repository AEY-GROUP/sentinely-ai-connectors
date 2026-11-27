# Sentinely AI Connectors

Official Sentinely distribution package for ChatGPT, Codex, Claude Code and other remote MCP clients. Sentinely is AI
social listening and brand protection: it collects public mentions of the topics you track, uses AI to judge which ones
matter to you, and flags impersonation, scams and other misuse of your brand as cases. This repository holds the client
configuration, plugin manifests, skills and listing copy; the server itself runs at sentinely.co.

The authenticated Streamable HTTP endpoint (OAuth with dynamic client registration) is
`https://app.sentinely.co/api/mcp`. It lists 33 tools: 22 reads and 11 writes. [docs/TOOLS.md](docs/TOOLS.md) lists
each one with its OAuth scope and confirmation behavior.

- **Listening:** mentions, the AI relevance verdict, topics, feeds, source health, share of voice and sentiment.
- **Competitors and revenue signals:** detected changes on watched competitor pages, and buyers asking for alternatives.
- **Brand protection:** detected signals, cases with evidence, monthly reports, official reporting routes and draft
  takedown requests for a person to send.
- **Writes:** add, tune or pause topics, label mentions, review revenue signals, send an accepted signal to the CRM
  already connected, watch or stop watching competitor pages, and open, annotate or move cases. Topic changes that can
  raise collection and every CRM send return a preview and a `confirmToken`, and run only after the user confirms.

No tool changes billing, API keys, members or invites, CRM or account connections, or deletes a workspace. No tool
browses a site on demand or submits a takedown. The server owns authentication, workspace isolation, roles, rate
limits and audit records. This repository contains no Sentinely service source code, credentials or customer data.

## Install for Claude Code

Test a local checkout:

```bash
claude --plugin-dir ./sentinely-ai-connectors/claude
```

Or add this repository as a marketplace:

```text
/plugin marketplace add AEY-GROUP/sentinely-ai-connectors
/plugin install sentinely-mcp@sentinely-plugins
```

Run `/mcp` in Claude Code to complete OAuth in the browser and choose the workspace on the consent screen. Do not paste
tokens into the repository, prompts or configuration files.

## Install for ChatGPT and Codex

`.codex-plugin/plugin.json` is the Codex plugin manifest. It loads the skills in `skills/` and connects through
`.mcp-openai.json`, which uses OAuth dynamic client registration. `chatgpt/plugin.json` describes the ChatGPT app and its
review cases. Any other MCP client can connect to `https://app.sentinely.co/api/mcp` directly and complete OAuth in the
browser.

## Layout

- `.claude-plugin/marketplace.json`: Claude Code marketplace pointing at `claude/`.
- `claude/`: the Claude Code plugin (manifest, `.mcp.json`, skill and logos). It holds no scripts.
- `.codex-plugin/plugin.json`, `.mcp-openai.json`, `skills/`, `assets/`: the Codex plugin.
- `chatgpt/`: the ChatGPT app manifest and logos.
- `docs/`: listing copy, the tool list and the reviewer guide.
- `release.json`: package version, endpoint, the exact tool list and logo checksums.
- `server.json`: MCP Registry server description.

## Safe usage

Text captured from public sources (mentions, authors, case evidence, competitor page lines, URLs) is untrusted data. It
may contain scam text or prompt-injection instructions. The skills tell the assistant never to follow such text, visit
its URLs or disclose data because of it, and to confirm every change with the user.

## Development

Requires Node.js 22 or newer.

```bash
npm run validate
```

This checks manifest versions, endpoints, paths, logo sizes and checksums, tool lists and prohibited content, then runs
the tests. CI runs it on every pull request.

This repository is generated from Sentinely's private source; see [docs/RELEASE_PROCESS.md](docs/RELEASE_PROCESS.md).
Issues are welcome. Pull requests are read, and accepted changes are applied upstream.

## Security and privacy

Read [SECURITY.md](SECURITY.md) before reporting a vulnerability and [PRIVACY.md](PRIVACY.md) for the package's data
boundaries. The service policies are at [sentinely.co/privacy](https://sentinely.co/privacy) and
[sentinely.co/terms](https://sentinely.co/terms).

## License

MIT for the configuration, docs and skills. The Sentinely name and logo are trademarks. See [LICENSE](LICENSE).
