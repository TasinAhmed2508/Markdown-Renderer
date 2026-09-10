export class IntegrationEngine {
  constructor() { this.fences = new Map(); this.candidates = []; }
  claim(resource, owner) {
    const token = (this.fences.get(resource)?.token || 0) + 1;
    const claim = {resource, owner, token, active:true}; this.fences.set(resource, claim); return claim;
  }
  writeAllowed(resource, owner, token) {
    const active = this.fences.get(resource);
    return !!active && active.active && active.owner===owner && active.token===token;
  }
  candidate({base, artifacts}) {
    const files = new Set();
    for (const a of artifacts) for (const f of a.changedFiles || []) {
      if (files.has(f)) return {ok:false, reason:`conflict:${f}`}; files.add(f);
    }
    const c = {id:`candidate_${this.candidates.length+1}`, base, artifacts, status:'VERIFYING'};
    this.candidates.push(c); return {ok:true, candidate:c};
  }
  verify(id, evidence = []) {
    const c = this.candidates.find(x => x.id===id); if (!c) return {ok:false, reason:'missing-candidate'};
    c.status = evidence.every(e => e.status==='passed') ? 'VERIFIED' : 'FAILED'; c.evidence = evidence; return {ok:c.status==='VERIFIED', candidate:c};
  }
}
