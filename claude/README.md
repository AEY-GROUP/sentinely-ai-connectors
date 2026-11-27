# Sentinely for Claude

Sentinely is AI social listening and brand protection. It collects public mentions of the topics you track across
social platforms, forums, app stores and the web, uses AI to judge which ones are relevant to you, and flags
impersonation, scams and other misuse of your brand as cases. This plugin brings that work into Claude.

## Install

In Claude Code:

```text
/plugin marketplace add AEY-GROUP/sentinely-ai-connectors
/plugin install sentinely-mcp@sentinely-plugins
```

Then run `/mcp` once to sign in to Sentinely in your browser and choose your workspace.

## What you can ask for

- "What are people saying about my brand this week?"
- "Show share of voice and sentiment across my tracked topics."
- "What changed on my competitors' pages recently?"
- "Show my open impersonation cases with severity 80 or higher."
- "Start tracking the topic 'card fees' on Reddit." (Sentinely shows a collection estimate and waits for you to confirm.)

## What this plugin contains

This plugin is configuration and instructions only. It runs no code on your computer.

- **One remote MCP connector** to `https://app.sentinely.co/api/mcp` over Streamable HTTP, with 34 tools for projects, listening,
  topics, competitors, revenue signals and brand protection cases.
- **One skill**, `sentinely`, which tells Claude which tool fits each question, which writes confirm first, and to
  treat captured source text as untrusted data.
- **Logos.**

## Sign-in and credentials

The first time Claude uses a Sentinely tool, it opens Sentinely's OAuth sign-in in your browser. Claude stores and
refreshes the token. The plugin reads no environment variables, API keys or local files, and never asks you to paste a
token.

## What is sent to Sentinely

When you ask for a Sentinely action, Claude sends that tool's inputs to app.sentinely.co: for example search filters, a
case id or a topic to add. Sentinely answers only from data already collected for the workspace you chose. The plugin
sends nothing anywhere else.

## Links

- Integrations: https://sentinely.co/platform/integrations-and-api
- Support: https://sentinely.co/contact
- Privacy policy: https://sentinely.co/privacy
- Terms of service: https://sentinely.co/terms
- Source: https://github.com/AEY-GROUP/sentinely-ai-connectors (MIT license)
