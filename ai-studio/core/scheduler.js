export class Scheduler {
  constructor({maxConcurrent = 4} = {}) { this.maxConcurrent = maxConcurrent; }
  validate(tasks) {
    const byId = new Map(tasks.map(t => [t.id,t]));
    for (const t of tasks) for (const dep of t.dependencies || []) if (!byId.has(dep)) return {ok:false, reason:`missing:${dep}`};
    const visiting = new Set(), done = new Set();
    const dfs = id => {
      if (visiting.has(id)) return false; if (done.has(id)) return true;
      visiting.add(id); for (const d of byId.get(id)?.dependencies || []) if (!dfs(d)) return false;
      visiting.delete(id); done.add(id); return true;
    };
    for (const t of tasks) if (!dfs(t.id)) return {ok:false, reason:'cycle'};
    return {ok:true};
  }
  ready(tasks) {
    const passed = new Set(tasks.filter(t => t.status === 'SUCCEEDED').map(t => t.id));
    return tasks.filter(t => ['PENDING','READY'].includes(t.status))
      .filter(t => (t.dependencies || []).every(d => passed.has(d)))
      .sort((a,b) => (b.priority || 0) - (a.priority || 0)).slice(0, this.maxConcurrent);
  }
}
