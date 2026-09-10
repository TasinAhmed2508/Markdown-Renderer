export class ContextFabric {
  constructor(store) { this.store = store; }
  record(kind, value, meta = {}) {
    const item = {kind, value, meta:{...meta, createdAt:new Date().toISOString(), trust:meta.trust || 'project'}};
    this.store.update('ledger', [], xs => [...xs, item]);
    return item;
  }
  packet({goal, task, limit = 20} = {}) {
    const ledger = this.store.get('ledger', []);
    const selected = ledger.filter(x => !x.meta.sensitive || x.meta.allowProvider).slice(-limit);
    return {goal, task, context:selected, generatedAt:new Date().toISOString()};
  }
  decisions() { return this.store.get('ledger', []).filter(x => x.kind === 'decision'); }
}
