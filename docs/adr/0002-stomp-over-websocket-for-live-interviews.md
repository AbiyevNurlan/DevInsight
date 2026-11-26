# 0002 — STOMP over WebSocket for live interview events

**Status:** Accepted

## Context

During a live interview, the candidate and the reviewer both need events (code changes, questions, status) without polling.

## Decision

Use Spring's STOMP support with the in-memory simple broker (`/topic`, `/queue`) and the `/app` prefix for application destinations. Two endpoints are exposed: `/ws-interview` with a SockJS fallback, and `/ws-interview-native` for plain WebSocket clients.

## Consequences

- Topic-based messaging comes with little code, and SockJS covers restrictive networks.
- The simple broker lives in process memory, so horizontal scaling needs an external broker relay (RabbitMQ or ActiveMQ).
