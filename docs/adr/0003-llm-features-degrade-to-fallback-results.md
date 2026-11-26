# 0003 — LLM features degrade to fallback results

**Status:** Accepted

## Context

Scoring, CV analysis, question generation, and the other AI features call the Anthropic API. The key may be missing (local development, CI), and the API can fail or rate-limit. An interview should not fail because one analysis did.

## Decision

Each AI service checks for a configured key. When the key is missing or a call fails, the service logs a warning and returns a fallback result instead of throwing.

## Consequences

- The platform runs end-to-end without an API key, which keeps local setup and tests simple.
- A fallback result can be mistaken for a real one. Results should carry their source so the UI can label them; this is not done yet.
- The HTTP call is currently duplicated across services. Moving it into one client is the next step (see [0004](0004-single-configured-claude-model.md)).
