# AI Content Testing Platform — MCP Integration (Claude Desktop) — Micro Case Study

**Context:** Browser automation for an AI content testing platform; Node.js/Playwright with a Claude Desktop MCP server.
**Objective:** Let AI agents run repeatable content simulations with persistent sessions and reliable Google SSO, without cloud costs.
**My Role:** Automation engineer (Playwright + MCP SDK); session persistence, OAuth flow handling, reliability hardening.

**What I Did**
- Built an **MCP server** exposing platform actions as a Claude Desktop tool with structured JSON outputs.
- Implemented **persistent Chromium profile** shared between CLI and Desktop (`~/.mcp-societies`-style user data dir).
- Hardened **Google SSO/OAuth**: robust selectors, redirect/consent handling, timeouts/retries, and state checks.
- Added **observability & safeguards**: 10-min global timeout, DOM stability checks, detailed logs.

**Outcomes (last 30+ runs)**
- Reduced login hangs from **~60% → <5%**; near-continuous runs without manual recovery.
- Saved **~3 minutes per test run** by skipping re-authentication via persisted sessions.
- **$0 ongoing infra** (local browser instead of hosted automation).
- Hands-off flow: simulations triggered directly via Claude Desktop tool calls.

**Artifacts / Evidence**
- MCP tool response sample (structured JSON).
- Session logs showing user-data-dir reuse (persisted profile).
- Desktop tool call screenshots with impact/attention outputs.

**Notes**
- Client anonymized (name available on request). Scope-based pricing. PKT timezone.
- Metrics are based on internal logs over the most recent test window.
