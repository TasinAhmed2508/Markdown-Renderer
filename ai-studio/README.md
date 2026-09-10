# AI Coding Studio baseline (Phases 0-7)

This directory is a non-destructive integration inside the existing Markdown-Renderer repository. It implements the product shell and deterministic control-plane concepts from the AI Coding Studio PRD without replacing the existing renderer.

## Run

```bash
npm run studio:start
```

Open `http://127.0.0.1:4173`.

## Test

```bash
npm run studio:test
```

## Implemented baseline

- Phase 0: domain states, task model, policy boundaries.
- Phase 1: policy-enforced workflow, evidence, bounded side effects.
- Phase 2: Windows/Codex-inspired project shell, composer, settings, activity, project modal.
- Phase 3: durable browser-local runs, events, interruption reconciliation, cancellation/pause semantics.
- Phase 4: provider metadata, privacy-aware routing, budget reservation/reconciliation.
- Phase 5: repository hashing/indexing primitives, Context Fabric ledger, provenance and contract registry.
- Phase 6: DAG validation, ready-work scheduling and bounded concurrency.
- Phase 7: resource claims with fencing tokens, conflict-aware immutable integration candidates.
- Phase 8: acceptance/evidence evaluation primitives are present, but browser automation and protected acceptance suites remain follow-up work.

This is an engineering baseline, not a claim that Windows-native sandbox, signed distribution, real provider credentials, or all production release gates are complete.
