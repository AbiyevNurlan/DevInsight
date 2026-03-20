# DevInsight2 Frontend

Vite + React + TypeScript frontend scaffold for DevInsight2.

Quick start:

```bash
cd frontend
npm install
npm run dev
```

Environment:
- `VITE_API_BASE` can be used to override API base URL (default http://localhost:8080/api)

Tests:
- Unit: `npm run test:unit` (Jest)
- E2E: `npm run test:e2e` (Playwright)
 
Notes for running tests:

- Unit tests use `jest` + `ts-jest` and run quickly on the dev machine.
- E2E tests use Playwright and expect the frontend dev server (`npm run dev`) and backend (`http://localhost:8080/api`) to be reachable.

Example test run (PowerShell):
```powershell
cd frontend
npm install
npx playwright install
npm run dev # in separate terminal
npm run test:unit
npm run test:e2e
```

Notes:
- API service implements retry + exponential backoff and refresh-token queueing.
