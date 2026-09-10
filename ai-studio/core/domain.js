export const RUN_STATES = Object.freeze([
  'PENDING','READY','RUNNING','WAITING_DEPENDENCY','WAITING_CAPACITY',
  'WAITING_APPROVAL','WAITING_CHILDREN','PAUSING','PAUSED','VERIFYING',
  'SUCCEEDED','FAILED','CANCELLED','INTERRUPTED'
]);

export const CONTRACT_STATES = Object.freeze([
  'DRAFT','PROPOSED','VALIDATED','ACCEPTED','SUPERSEDED','DEPRECATED'
]);

export const EXECUTION_MODES = Object.freeze(['Direct','Coordinated','Program']);
export const PERMISSION_MODES = Object.freeze(['Supervised','Assisted','Autonomous','Custom']);

export function id(prefix = 'id') {
  const rand = Math.random().toString(36).slice(2, 9);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

export function now() { return new Date().toISOString(); }

export function makeTask(input = {}) {
  return {
    id: input.id || id('task'), objective: input.objective || 'Untitled task',
    status: input.status || 'PENDING', dependencies: input.dependencies || [],
    priority: input.priority ?? 50, risk: input.risk || 'low',
    writeScope: input.writeScope || [], acceptance: input.acceptance || [],
    owner: input.owner || null, version: input.version || 1,
    createdAt: input.createdAt || now(), result: input.result || null
  };
}
