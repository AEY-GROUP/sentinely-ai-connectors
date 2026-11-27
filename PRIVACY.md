# Privacy notice for the connector package

This repository is a client-side distribution package for the Sentinely service. Installing or reading it sends no
data. When a user connects Sentinely in an assistant and a tool runs, the host sends that tool's inputs to
`https://app.sentinely.co/api/mcp` using OAuth.

## Data handled by the service

Depending on the tool, Sentinely receives:

- the signed-in user and the workspace chosen on the OAuth consent screen;
- search filters, record ids and pagination cursors;
- for writes, the requested change (for example a topic, a mention label, a case note or a status); and
- service-generated security and reliability metadata.

Sentinely returns only data it has already collected for that workspace. Text captured from public sources is
returned as untrusted data. The package never asks users to put credentials in prompts or configuration; OAuth tokens
are held by the host and the service.

## Retention and controls

Retention, deletion, service providers, international transfers and data-subject rights are governed by the Sentinely
privacy policy at https://sentinely.co/privacy. Terms of use are at https://sentinely.co/terms. Users can disconnect
Sentinely at any time from their assistant's settings.

## Contact

Questions: https://sentinely.co/contact

This document explains the connector package and does not replace the service privacy policy.
