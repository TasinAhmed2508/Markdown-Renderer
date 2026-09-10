function normalize(path) {
  return String(path || '').replace(/\\/g, '/').replace(/\/+$/, '');
}

export class PolicyEngine {
  constructor(policy = {}) {
    this.mode = policy.mode || 'Assisted';
    this.roots = (policy.roots || []).map(normalize);
    this.network = new Set(policy.network || []);
    this.maxDelete = policy.maxDelete ?? 20;
  }
  allowsPath(path) {
    const p = normalize(path);
    return this.roots.some(root => p === root || p.startsWith(`${root}/`));
  }
  authorize(action) {
    if (action.path && !this.allowsPath(action.path)) return {ok:false, reason:'outside-approved-root'};
    if (action.kind === 'delete' && (action.count || 1) > this.maxDelete) return {ok:false, reason:'large-delete-needs-approval'};
    if (action.destination && !this.network.has(action.destination)) return {ok:false, reason:'network-destination-not-approved'};
    const sensitive = new Set(['deploy','push','publish','system-install','secret-write']);
    if (sensitive.has(action.kind) && this.mode !== 'Autonomous') return {ok:false, reason:'approval-required'};
    return {ok:true};
  }
}
