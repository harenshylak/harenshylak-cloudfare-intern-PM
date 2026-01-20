# Feedback Insights (Cloudflare Workers + D1 + Workers AI)

A lightweight PM tool to collect user feedback, analyze it with AI (sentiment, themes, summary), and view an aggregated digest.

## Live Demo
- Deployed Worker: https://feedback-insights.haren-feedback-insights.workers.dev

## API Endpoints
- POST /api/feedback — submit feedback { source, text }
- GET /api/feedback — list latest feedback
- POST /api/analyze?id=<id> — run AI analysis and store results
- GET /api/digest — aggregate themes + sentiment mix + latest summaries

## Cloudflare Products Used
- Workers (API + UI)
- D1 (storage)
- Workers AI (analysis)

## Local Dev
Run:
  npm install
  npx wrangler dev

## Deploy
Run:
  npx wrangler deploy
