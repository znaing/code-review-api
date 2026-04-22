# Code Review API

A self-hosted REST API that uses a local LLM (Ollama + Mistral) to automatically
review code diffs and return structured feedback. No paid AI APIs required.

## Tech stack
- Node.js + Express
- Ollama (local LLM inference)
- PostgreSQL
- Jest (testing)
- AWS EC2 + RDS (deployment)

## Getting started

### Prerequisites
- Node.js v20+
- npm v10+

### Install
\```bash
git clone https://github.com/znaing/code-review-api.git
cd code-review-api
npm install
\```

### Run locally
\```bash
cp .env.example .env   # add your config
npm run dev
\```

### Test the API
\```bash
curl -X POST http://localhost:3000/api/v1/review \
  -H "Content-Type: application/json" \
  -d '{"diff": "- old\n+ new", "language": "javascript", "filename": "auth.js"}'
\```

## API endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | /health | Health check |
| POST | /api/v1/review | Submit a code diff for AI review |

## Project status
Under active development — see build plan for weekly milestones.