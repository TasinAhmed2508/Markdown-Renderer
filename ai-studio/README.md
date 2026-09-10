# AI Coding Studio baseline (Phases 0-9 + Phase 10/11 instrumentation)

This directory is a non-destructive integration inside the existing Markdown-Renderer repository. It implements the product shell and deterministic control-plane concepts from the AI Coding Studio PRD without replacing the existing renderer.

## Run and verify

```bash
npm install
npm run studio:start
npm run studio:test
npm run studio:test:e2e
npm run studio:benchmark
```

Open `http://127.0.0.1:4173` for the product shell. The e2e command starts its own server on port 4174 and runs a Chromium browser journey.

## Implemented baseline

- Phases 0-7: foundations, policy/workflow, product shell, durability, model routing/budgets, context/repository, DAG scheduling, and fenced safe integration.
- Phase 8: evidence registry, validity/invalidation, protected acceptance-test policy, explicit Playwright browser journey, and CI validation workflow.
- Phase 9: Change Impact Explorer, Architecture Lab, Project Health Center, troubleshooting replay, delivery forecasts, engineering playbooks, and Release Workbench baseline.
- Phase 10 instrumentation: synthetic 100-agent/50-request bookkeeping benchmark, 10,000-event workload, scheduler/routing p95 checks, and explicit `capacityClaim: false` reporting.
- Phase 11 instrumentation: 15 production release gates, fundamental-gate waiver prevention, platform capability unknown-state reporting, and recovery-drill evaluation.

## Important boundary

This remains an engineering baseline. The synthetic benchmark does not prove real 50-provider-request capacity. Windows-native sandbox/process containment, real provider credentials/adapters, production deployment authorization, signed distribution, complete SBOM/security tooling, native recovery drills, reference visual regression, and all GA release gates are not claimed complete.
