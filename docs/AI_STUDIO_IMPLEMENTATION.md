# AI Coding Studio implementation status

The repository contains an isolated `ai-studio/` implementation so the existing Markdown renderer remains runnable while the new product is developed.

| Phase | Baseline status | Primary implementation |
|---|---|---|
| 0 Foundations | Complete baseline | `core/domain.js`, `core/policy.js` |
| 1 Secure vertical slice | Complete baseline | `core/workflow.js`, evidence records |
| 2 Product shell | Complete baseline | `index.html`, `styles.css`, `app.js`, `ui/` |
| 3 Durable execution | Complete baseline | `core/storage.js`, run reconciliation |
| 4 Model intelligence | Complete baseline | `core/model-gateway.js`, `core/budget.js` |
| 5 Context and repository | Complete baseline | repository index, Context Fabric, contracts |
| 6 Coordinated agents | Complete baseline | `core/scheduler.js` |
| 7 Safe integration | Complete baseline | `core/integration.js` |
| 8 Independent QA | Functional baseline | evidence registry, invalidation, protected-test gate, Playwright journey, CI workflow |
| 9 Advanced workspaces | Functional baseline | impact, architecture, health, replay, forecast, playbooks, release workbench |
| 10 Scale | Instrumented, synthetic only | `core/benchmark.js`, `benchmarks/scale.mjs` |
| 11 Production hardening | Instrumented, not certified | `core/hardening.js`, release-gate and recovery-drill evaluators |

## Phase 8 evidence behavior

Evidence records carry acceptance criterion, commit, environment fingerprint, tool/version, procedure, timestamps, exit status, logs, artifact hashes, verifier, and validity. Relevant repository or contract changes invalidate prior evidence rather than silently carrying it forward. Protected acceptance checks require an approved rationale before their content may change.

The in-app QA view deliberately leaves the Playwright browser criterion as `not-run`; `npm run studio:test:e2e` is the executable browser journey. GitHub Actions installs Chromium and runs unit, benchmark, syntax, and browser checks for changes to this implementation.

## Phase 9 behavior

Advanced workspaces expose confirmed versus predicted change impact, weighted architecture comparison with a durable decision record, health signals, safe troubleshooting replay classification, uncertainty-aware delivery forecasts, bounded playbook task generation, and a release plan that blocks on missing verified candidates, incomplete QA, or production authorization.

## Phase 10-11 boundary

The scale harness measures local synthetic control-plane work only and refuses to claim provider/hardware capacity. Production hardening currently encodes gates and capability/recovery status without claiming signed distribution, native sandboxing, credential-store integration, or completed certification.

## Security boundary

The browser implementation demonstrates deterministic authorization semantics. It is not a substitute for native Windows containment. Production work still requires handle-based path validation, restricted process execution, network enforcement, secure credential storage, and stronger container/VM modes where policy cannot be enforced locally.
