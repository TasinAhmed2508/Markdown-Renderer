# AI Coding Studio Phase 10-11 continuation

## Phase 10 — Scale

A reproducible synthetic control-plane benchmark now exercises 100 logical-agent records, 50 concurrent request-accounting records, 10,000 event records, scheduler decisions, and local routing computations. Run it with `npm run studio:benchmark`.

The benchmark deliberately sets `capacityClaim: false`. It is not evidence that 50 real provider requests, shell processes, browser workloads, or indexing workloads are safe on an arbitrary machine. Those require published reference hardware and provider-capacity tests.

## Phase 11 — Production hardening

`core/hardening.js` encodes the production release gates, distinguishes fundamental gates from waivable non-fundamental gates, reports unknown platform capabilities honestly, and models recovery drills across database, workspaces, ambiguous side effects, and artifacts.

This is hardening instrumentation, not signed distribution or native sandbox completion. Installer signing, verified updates, Windows containment capability tests, credential-store integration, full recovery drills, visual regression, accessibility certification, and platform benchmark publication still require the native desktop implementation and release infrastructure.
