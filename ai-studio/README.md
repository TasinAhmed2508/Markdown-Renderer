# AI Coding Studio baseline (Phases 0-9)

This directory is a non-destructive integration inside the existing Markdown-Renderer repository. It implements the product shell and deterministic control-plane concepts from the AI Coding Studio PRD without replacing the existing renderer.

## Run and verify

```bash
npm install
npm run studio:start
npm run studio:test
npm run studio:test:e2e
```

Open `http://127.0.0.1:4173` for the product shell. The e2e command starts its own server on port 4174 and runs a Chromium browser journey.

## Implemented baseline

- Phase 0: domain states, task model, policy boundaries.
- Phase 1: policy-enforced workflow, evidence, bounded side effects.
- Phase 2: Windows/Codex-inspired project shell, composer, settings, activity, project modal.
- Phase 3: durable browser-local runs, events, interruption reconciliation, cancellation/pause semantics.
- Phase 4: provider metadata, privacy-aware routing, budget reservation/reconciliation.
- Phase 5: repository hashing/indexing primitives, Context Fabric ledger, provenance and contract registry.
- Phase 6: DAG validation, ready-work scheduling and bounded concurrency.
- Phase 7: resource claims with fencing tokens, conflict-aware immutable integration candidates.
- Phase 8: evidence registry, validity/invalidation, protected acceptance-test policy, explicit Playwright browser journey, and CI validation workflow.
- Phase 9: Change Impact Explorer, Architecture Lab, Project Health Center, troubleshooting replay, delivery forecasts, engineering playbooks, and Release Workbench baseline.

## Important boundary

This remains an engineering baseline. Windows-native sandbox/process containment, real provider credentials/adapters, production deployment authorization, signed distribution, complete SBOM/security tooling, and all GA release gates are not claimed complete.
