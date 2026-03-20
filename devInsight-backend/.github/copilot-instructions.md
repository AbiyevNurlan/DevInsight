# DevInsight2 Copilot Instructions

## Getting oriented
- Read the high-level diagram before touching code so you understand the client/backend/data layers and multi-tenant flow in [ARCHITECTURE_DIAGRAM.md](ARCHITECTURE_DIAGRAM.md).
- The Spring Boot backend lives under `src/main/java/az/edu/itbrains/devinsight2`; the React Vite frontend is in `frontend/` and mounts on `/` while the API is hosted at `/api` (see [application.yml](src/main/resources/application.yml) and [frontend/src/services/api.ts](frontend/src/services/api.ts)).
- Everything assumes JWT authentication, role-based guards, and a `company`/tenant context; refreshing tokens happens via the `/auth/refresh` endpoint and the standing `ApiService` interceptors.

## Backend conventions
- Maintain tenant isolation by using [`TenantContext`](src/main/java/az/edu/itbrains/devinsight2/config/TenantContext.java) and setting it in [`TenantContextFilter`](src/main/java/az/edu/itbrains/devinsight2/config/TenantContextFilter.java). Every new controller/service that talks to company-owned tables should respect `TenantContext.getCurrentTenant()` when building queries or assigning `company` relationships.
- JWT setup lives in [SecurityConfig.java](src/main/java/az/edu/itbrains/devinsight2/config/SecurityConfig.java); keep the filter chain, public path list (`/auth/**`, actuator, swagger) and `@PreAuthorize` annotations aligned with that file, and keep the BCrypt strength at 12.
- Registration/login logic is centralized in [`AuthService`](src/main/java/az/edu/itbrains/devinsight2/service/AuthService.java); note that ADMIN credentials are hard-coded for now, so new workflows should reuse that path or extend it carefully instead of duplicating token generation logic.
- `InterviewService`, `SubmissionService`, and `UserService` layer in extra auditing/role checks (see [InterviewService.java](src/main/java/az/edu/itbrains/devinsight2/service/InterviewService.java) and [SubmissionService.java](src/main/java/az/edu/itbrains/devinsight2/service/SubmissionService.java)). Follow their examples when adding new endpoints: enforce role checks, fetch the current user once, and prefer transactional service methods over controller logic.

## AI & integration patterns
- `AIAnalysisService` ([.../service/AIAnalysisService.java](src/main/java/az/edu/itbrains/devinsight2/service/AIAnalysisService.java)) posts to Anthropic/Claude via `WebClient`, parses JSON wrapped in Markdown, and falls back to safe default scores if parsing fails—keep its timeout/key headers and prompt structure intact when adjusting AI calls.
- External integrations read from `application.yml` (`ai.anthropic.*`, `aws.*`, `google.*`). When wiring new services, mirror how this file centralizes secrets, timeouts, and feature flags (e.g., `ai.analysis.code.enabled`, `interview.time-between-questions`).
- The hi-level `build.gradle` registers `buildDocker` and configures `bootJar` metadata; reuse those tasks when preparing container images and keep `java.toolchain` at Java 21.

## Frontend conventions
- `frontend/src/services/api.ts` is the single Axios instance: it handles exponential-backoff retries, refresh queues, and logs every request/response. Always use this instance instead of `fetch` so tokens stay synchronized, and never bypass `api.getToken()/setToken()` when changing authentication behavior.
- Client role gating happens via `AdminRoute.tsx` and `HRRoute.tsx`; they redirect to `/login` or `/forbidden` using localStorage keys `devinsight_jwt`, `devinsight_refresh`, and `devinsight_role`. Keep this pattern so the `App.tsx` route definitions stay predictable.
- The submission journey lives in [`SubmissionForm.tsx`](frontend/src/pages/SubmissionForm.tsx): it loads interview data, starts a submission, saves answers one-by-one, and auto-submits when time runs out. Refer to its timers/toast handling when building similar multi-question flows.
- Environment-specific API hosts come from `VITE_API_BASE` (see [frontend/package.json](frontend/package.json) and the `api` helper). Mirror that env var when adding new frontend services so Vite dev and production builds hit the correct backend via `/api`.

## Developer workflows
- Quick start: run `start-devinsight.bat` (calls `gradlew bootRun` and `npm run dev`). Individual steps are `.











Please review this guidance and let me know if any section needs more detail or clarification.- The backend exposes `/swagger-ui.html` and `/actuator` without auth; the frontend hits `/api/interviews`, `/api/submissions`, etc., so keep the base path `/api` consistent.- CORS origins default to `http://localhost:3000`/`5173`; update `SecurityConfig.cs` and `application.yml` simultaneously when allowing new UIs.- Secrets are expected as environment variables (see `application.yml` keys like `JWT_SECRET`, `ANTHROPIC_API_KEY`, `AWS_ACCESS_KEY`, `GOOGLE_SPEECH_API_KEY`). For local dev, the defaults in `application.yml` are acceptable but replacement is required before production.## Environment & verification- Docker: `./gradlew buildDocker` builds the backend image tagged `devinsight:${version}`, and the frontend can be packaged separately by running `npm run build` and serving via `frontend/nginx.conf`.- Testing: `.
un-backend.bat` plus `.
un-frontend.bat` are a good smoke test; to run just the backend tests, execute `.
un-backend.bat` or `.uild.gradle test` (it uses Testcontainers + PostgreSQL). Frontend suites live under `frontend/__tests__` and `frontend/tests`.- Frontend: run `npm install` once, then use `npm run dev` for local stories, `npm run build` for production, `npm run preview` to sanity-check builds, `npm test:unit` for Jest suites, and `npm test:e2e` for Playwright scenarios.- Backend: use `.uild.gradle bootRun` or `.
un-backend.bat` to hit APIs on `http://localhost:8080/api`; rely on `.
un-backend.bat` to also populate logs in `logs/`.un-backend.bat` / `.
un-frontend.bat`; `run-all.bat` will execute both in the usual dev shell pairs.