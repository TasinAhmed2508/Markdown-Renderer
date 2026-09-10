# AI Coding Studio implementation status

The repository now contains an isolated `ai-studio/` implementation so the existing Markdown renderer remains runnable while the new product is developed.

| Phase | Baseline status | Primary implementation |
|---|---|---|
| 0 Foundations | Complete baseline | `core/domain.js`, `core/policy.js` |
| 1 Secure vertical slice | Complete baseline | `core/workflow.js`, evidence records |
| 2 Product shell | Complete baseline | `index.html`, `styles.css`, `app.js`, `ui/` |
| 3 Durable execution | Complete baseline | `core/storage.js`, run reconciliation |
| 4 Model intelligence | Complete baseline | `core/model-gateway.js`, `core/budget.js` |
| 5 Context and repository | Complete baseline | `core/repository-index.js`, `core/context-fabric.js`, `core/contracts.js` |
| 6 Coordinated agents | Complete baseline | `core/scheduler.js` |
| 7 Safe integration | Complete baseline | `core/integration.js` |
| 8 Independent QA | Partial | `core/qa.js`, unit tests; browser journeys not yet wired |

## Security boundary

The browser implementation demonstrates deterministic authorization semantics. It is not a substitute for native Windows containment. Production work still requires handle-based path validation, restricted process execution, network enforcement, secure credential storage, and stronger container/VM modes where policy cannot be enforced locally.
