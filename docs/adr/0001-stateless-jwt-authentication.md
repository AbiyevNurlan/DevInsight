# 0001 — Stateless JWT authentication

**Status:** Accepted

## Context

The API is consumed by a separate React SPA and by WebSocket clients. Server-side sessions would need sticky routing or a shared session store once the backend runs on more than one instance.

## Decision

Spring Security runs with `SessionCreationPolicy.STATELESS`. `JwtAuthenticationFilter` validates a bearer token on every request, and the refresh token has a longer lifetime than the access token. CSRF protection is disabled because no cookie carries authentication.

## Consequences

- Any instance can serve any request, with no session store to run.
- A token cannot be revoked before it expires without extra state, such as a deny-list.
- The signing secret is critical: it must come from `JWT_SECRET` in every non-local environment.
