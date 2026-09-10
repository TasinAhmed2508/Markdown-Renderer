import { id, now } from './domain.js';

export class WorkflowEngine {
  constructor({store, policy, budget}) { this.store = store; this.policy = policy; this.budget = budget; }
  createRun(goal) {
    const run = {id:id('run'), goal, state:'READY', attempts:0, createdAt:now(), evidence:[]};
    this.store.update('runs', [], runs => [...runs, run]);
    this.store.append({type:'run.created', runId:run.id, at:now()});
    return run;
  }
  async execute(run, steps = []) {
    const reserve = this.budget.reserve(0.15 * Math.max(1, steps.length));
    if (!reserve.ok) return this.finish(run.id, 'FAILED', {error:'budget-exhausted'});
    this.patch(run.id, {state:'RUNNING', attempts:(run.attempts || 0)+1, startedAt:now()});
    const evidence = [];
    for (const step of steps) {
      const auth = this.policy.authorize(step);
      if (!auth.ok) return this.finish(run.id, 'WAITING_APPROVAL', {blocked:auth.reason, evidence});
      evidence.push({id:id('ev'), step:step.kind, status:'passed', at:now()});
    }
    this.budget.reconcile(reserve.amount, reserve.amount * 0.8);
    return this.finish(run.id, 'SUCCEEDED', {evidence, completedAt:now()});
  }
  patch(id, patch) { return this.store.update('runs', [], rs => rs.map(r => r.id===id ? {...r,...patch} : r)); }
  finish(id, state, patch={}) { this.patch(id, {state,...patch}); return this.store.get('runs', []).find(r=>r.id===id); }
  cancel(id) { return this.finish(id, 'CANCELLED', {cancelledAt:now()}); }
}
