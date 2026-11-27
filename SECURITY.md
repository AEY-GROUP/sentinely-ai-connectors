# Security policy

## Supported versions

Security fixes are made for the latest released version.

## Report a vulnerability

Do not open a public issue for a suspected vulnerability. Report it privately through GitHub's
[private vulnerability reporting](https://github.com/AEY-GROUP/sentinely-ai-connectors/security/advisories/new) or
through [sentinely.co/contact](https://sentinely.co/contact). Never include customer content, passwords, bearer tokens,
OAuth client secrets, cookies or signed URLs in a report; use a synthetic workspace to reproduce.

Include the affected package and version, the host (ChatGPT, Claude, Codex or another MCP client), a minimal
reproduction, the expected and observed behavior, and the potential impact.

## Package trust boundary

This package contains declarative manifests, documentation, logos and skills. It ships no executable hooks,
installation scripts, embedded credentials, local `stdio` server, telemetry or customer data. The only scripts are the
repository's own validator and tests, which are not part of any plugin.

Every MCP configuration points at `https://app.sentinely.co/api/mcp`. OAuth credentials are obtained and stored by the
host. Never add static authorization headers or secrets to an MCP configuration in this repository.

## What the service enforces

- HTTPS and OAuth token validation on every request.
- Every call scoped to the workspace chosen during OAuth; records from other workspaces answer exactly as missing.
- Writes limited to what the user's role can do in the dashboard; collection-raising topic changes and CRM sends need a
  confirmation token.
- No tool for billing, API keys, members, CRM or account connections, or workspace deletion.

Directory review is not a substitute for these controls.
