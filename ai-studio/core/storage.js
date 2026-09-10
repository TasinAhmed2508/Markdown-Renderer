const memory = new Map();

export class DurableStore {
  constructor(namespace = 'ai-studio') { this.ns = namespace; }
  key(name) { return `${this.ns}:${name}`; }
  get(name, fallback = null) {
    const key = this.key(name);
    try {
      const raw = globalThis.localStorage?.getItem(key);
      if (raw != null) return JSON.parse(raw);
    } catch {}
    return memory.has(key) ? structuredClone(memory.get(key)) : fallback;
  }
  set(name, value) {
    const key = this.key(name);
    memory.set(key, structuredClone(value));
    try { globalThis.localStorage?.setItem(key, JSON.stringify(value)); } catch {}
    return value;
  }
  update(name, fallback, mutate) {
    const next = mutate(structuredClone(this.get(name, fallback)));
    return this.set(name, next);
  }
  append(event) {
    return this.update('events', [], items => [...items, event].slice(-2000));
  }
  reconcileRuns() {
    return this.update('runs', [], runs => runs.map(run =>
      run.state === 'RUNNING' ? {...run, state:'INTERRUPTED', recoveredAt:new Date().toISOString()} : run
    ));
  }
}
