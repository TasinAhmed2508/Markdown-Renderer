const STATUSES = new Set(['passed','failed','skipped','blocked','flaky','not-run']);
const hash = value => {
  let h = 2166136261;
  for (const c of JSON.stringify(value ?? null)) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619); }
  return (h >>> 0).toString(16).padStart(8,'0');
};

export class EvidenceRegistry {
  constructor(items = [], protectedTests = []) {
    this.items = [...items];
    this.protectedTests = new Map(protectedTests.map(x => [x.id, {...x}]));
  }
  record(input) {
    const status = STATUSES.has(input.status) ? input.status : 'not-run';
    const item = {
      id: input.id || `ev-${Date.now()}-${this.items.length + 1}`,
      criterionId: input.criterionId,
      commit: input.commit || 'working-tree',
      environment: input.environment || 'local',
      environmentFingerprint: hash(input.environment || 'local'),
      tool: input.tool || 'AI Coding Studio QA',
      toolVersion: input.toolVersion || '0.9',
      procedure: input.procedure || '',
      startedAt: input.startedAt || new Date().toISOString(),
      endedAt: input.endedAt || new Date().toISOString(),
      status,
      exitStatus: input.exitStatus ?? (status === 'passed' ? 0 : status === 'failed' ? 1 : null),
      logs: [...(input.logs || [])],
      artifactHashes: (input.artifacts || []).map(hash),
      verifier: input.verifier || 'independent-qa',
      validity: 'CURRENT',
      invalidatedReason: null
    };
    this.items.push(item); return item;
  }
  invalidate({commit, criterionId, reason = 'relevant-input-changed'} = {}) {
    let count = 0;
    for (const item of this.items) {
      if (item.validity !== 'CURRENT') continue;
      if (commit && item.commit !== commit) continue;
      if (criterionId && item.criterionId !== criterionId) continue;
      item.validity = 'INVALIDATED'; item.invalidatedReason = reason; count++;
    }
    return count;
  }
  coverage(criteria = []) {
    return criteria.map(c => {
      const evidence = [...this.items].reverse().find(e => e.criterionId === c.id && e.validity === 'CURRENT');
      return {...c, status:evidence?.status || 'not-run', evidence:evidence || null};
    });
  }
  protect({id, content, rationale = 'release acceptance'}) {
    const item = {id, hash:hash(content), rationale}; this.protectedTests.set(id,item); return item;
  }
  authorizeProtectedChange(id, content, approval = {}) {
    const current = this.protectedTests.get(id); if (!current) return {ok:true, reason:'unprotected'};
    if (current.hash === hash(content)) return {ok:true, reason:'unchanged'};
    if (!approval.approved || !String(approval.rationale || '').trim()) return {ok:false, reason:'review-required'};
    return {ok:true, reason:'approved-change', rationale:approval.rationale};
  }
}
