# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev       # Start with nodemon (auto-reload)
npm start         # Start production server
npm run migrate   # Apply database migrations (src/db/schema.sql)
```

No test or lint scripts are configured yet.

## Environment Setup

Copy `.env.example` to `.env` and set:

```
PORT=3000
API_KEY=<secret>
NODE_ENV=development
OLLAMA_MODEL=gemma4:e4b
OLLAMA_HOST=http://localhost:11434
OLLAMA_KEEP_ALIVE=60m
DATABASE_URL=postgresql://code_review_user:<password>@localhost:5432/code_review_db
```

Ollama must be running locally with the configured model pulled before starting the server. The server performs a health check against Ollama on startup.

## Architecture

Self-hosted REST API that accepts code diffs and returns AI-generated code reviews using a local Ollama LLM — no external AI APIs.

**Request flow:**

```
POST /api/v1/review
  → auth middleware (X-Api-Key header)
  → validate middleware (Zod schema)
  → ollamaService.reviewCode() — sends structured prompt, retries 3x
  → response returned immediately
  → async: reviewRepository.saveReview() — persists to PostgreSQL
```

**Key modules:**

- `src/app.js` — Express app, middleware stack, route mounting, global error handler
- `src/services/ollamaService.js` — Ollama HTTP client with retry logic; normalizes severity values; prompt versioning lives in `src/version.js`
- `src/db/reviewRepository.js` — All DB access; `saveReview` uses a transaction to write `reviews` + `review_issues` atomically
- `src/db/pool.js` — Shared `pg` connection pool
- `src/middleware/` — `auth.js` (API key check), `validate.js` (Zod), `ratelimiter.js` (50 req/15 min), `errorHandler.js`

**Routes:**

| Method | Path | Notes |
|--------|------|-------|
| POST | `/api/v1/review` | Submit diff for review |
| GET | `/api/v1/reviews` | Paginated history (`?limit`, `?offset`, `?filename`) |
| GET | `/api/v1/reviews/:reviewId` | Single review with all issues |
| GET | `/api/v1/models` | List available Ollama models |
| GET | `/health` | No auth; probes Ollama + PostgreSQL |

**Database schema** (`src/db/schema.sql`): two tables — `reviews` (metadata + summary) and `review_issues` (FK → `reviews`, cascade delete). Migrations are idempotent (`IF NOT EXISTS`). Run `npm run migrate` after schema changes.

**Prompt versioning:** `src/version.js` exports `PROMPT_VERSION` (currently `v1.0`). Bump this whenever the review prompt changes so stored reviews can be correlated with the prompt that generated them.
