# Ramaibot Production Audit Status

Updated: 2026-08-23

## Fixed in source

- Removed the Home UI implementation-prompt/debug injection source.
- Moved provider calls to server-only adapters.
- Added bounded provider fallback and plan-aware model selection.
- Added real model inference health checks with short server-side caching.
- Added safe calculator execution and bounded tool loops.
- Added live Tavily search routing with an explicit unavailable state.
- Added real image generation persistence and attachment handling.
- Assistant messages are now persisted by the trusted server path rather than the browser.
- Database message constraints reject empty/invalid messages.
- Added owner-scoped message update/delete policies.
- Added server-enforced Free/Pro/Ultra usage limits.
- Added owner-scoped file/storage policies and file-count limits.
- Added pgvector memory storage, embedding, similarity retrieval, and authenticated memory management.
- Custom instructions are persisted to the authenticated profile and injected as system context.
- Environment files are ignored and the previously committed `.env` file was removed.
- Added CI for typecheck, lint, and production build.

## Provider configuration required

The application intentionally does not commit provider secrets. Configure these only in the deployment secret manager:

- `OPENAI_API_KEY` — GPT models and memory embeddings.
- `ANTHROPIC_API_KEY` + `ANTHROPIC_MODEL_ID` — Claude.
- `NVIDIA_API_KEY` + `NVIDIA_MODEL_ID` — NVIDIA NIM.
- `TAVILY_API_KEY` — live Web Search.
- `LOVABLE_AI_API_KEY` + optional `LOVABLE_IMAGE_MODEL` — image generation.

## Verification limitation

Repository source and CI configuration can be audited here, but production deployment credentials and an authenticated production URL are not available through the repository connector. Therefore provider runtime tests and a deployed mobile/desktop smoke test must be confirmed by the deployment CI/runtime before declaring production-ready.

Do not treat this file as a claim that external providers are currently online.
