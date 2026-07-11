<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Repository architecture rules

- Keep route handlers thin: validate input, authenticate/authorize, apply request policy, call a feature service, and map the result to HTTP.
- Put business workflows in `src/features/<domain>/service.ts`. Routes and React components must not query Drizzle, Redis, or external APIs directly.
- Put external clients and persistence adapters in `src/infrastructure/`. Modules containing credentials must import `server-only`.
- Put shared public configuration in `src/config/`; do not duplicate release versions or download URLs.
- Keep Client Components as small interactive islands. Extract components that own asynchronous state or are reused.
- Validate untrusted input at the HTTP boundary and validate external identifiers before caching them.
- Every authenticated public API needs short-window abuse protection. Add long-term quota policy where usage is billable or limited.
- Cache legitimate empty/not-found responses explicitly with a shorter TTL; do not confuse them with malformed legacy entries.
- If compatibility requires monitoring-only security, document the risk and exit condition in `docs/operations/security.md`.

## Required verification

Before completing application changes, run `npm run lint`, `npm run build`, and `git diff --check`. Review the final diff for secret exposure, duplicated constants, and direct infrastructure access from pages/routes.

Do not update database schema without a matching Drizzle migration. Do not weaken authentication, authorization, binary verification, rate limits, or input validation merely to make a test pass.
