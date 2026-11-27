# Release process

## Source of truth

The files in this repository are generated from Sentinely's private source, where they are checked against the
server's tool registry on every change. Do not hand-edit generated files here; a change is made upstream and synced.
Generated files: `.claude-plugin/`, `.codex-plugin/`, `.mcp-openai.json`, `assets/`, `chatgpt/`,
`claude/.claude-plugin/`, `claude/.mcp.json`, `claude/assets/`, `claude/skills/`, `skills/`, `release.json` and
`docs/LISTING.md`, `docs/TOOLS.md`, `docs/REVIEWER_GUIDE.md`.

## Versioning

Semantic Versioning. `package.json`, `release.json`, `server.json`, `.codex-plugin/plugin.json`,
`claude/.claude-plugin/plugin.json`, `.claude-plugin/marketplace.json` and `CHANGELOG.md` carry the same version, and
`npm run validate` fails if they differ. A new tool or changed tool behavior ships in a minor release.

## Publishing a version

1. Sync from upstream on a branch and open a pull request.
2. CI runs `npm run validate`. Merge only when it passes.
3. Tag the merge commit `v<version>`. Never move or rebuild an existing tag; fix a release with a new patch version.

## Emergency response

Server-side controls can turn off tools without a package change. A package update follows only if the published
configuration itself needs to change.
