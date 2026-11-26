# 0004 — One configured Claude model for all AI services

**Status:** Accepted

## Context

More than 20 services hardcoded the same model ID. When that model was retired, every AI feature broke at once, and the fix touched every service. Newer models can also return non-text content blocks before the answer, so reading `content[0].text` is no longer safe.

## Decision

- The model is configured once with `anthropic.model` (env `ANTHROPIC_MODEL`) and injected into each service.
- Response text is read with `ClaudeResponses.text()`, which joins all `text` blocks and ignores other block types.
- Requests enable the server-side refusal fallback, so a refused request is retried on a fallback model.

## Consequences

- A model upgrade is now a configuration change.
- Request building is still repeated per service. A shared `ClaudeClient` would remove that and give one place for retries, timeouts, and metrics.
