export const ARCHITECTURE_OPTIONS = [
  {id:'tauri-modular',name:'Tauri 2 modular desktop',delivery:8,complexity:4,security:9,maintainability:9,runtimeCost:2,compatibility:8,operations:3},
  {id:'electron-monolith',name:'Electron monolith',delivery:9,complexity:5,security:6,maintainability:7,runtimeCost:6,compatibility:9,operations:4},
  {id:'service-heavy',name:'Local microservices',delivery:4,complexity:9,security:7,maintainability:5,runtimeCost:7,compatibility:6,operations:9}
];

const clamp = n => Math.max(0, Math.min(100, Math.round(n)));

export function analyzeImpact({changedFiles = [], index = [], contracts = [], tasks = []} = {}) {
  const changed = new Set(changedFiles);
  const confirmed = new Set(); const predicted = new Set();
  for (const item of index) {
    if (changed.has(item.path)) confirmed.add(item.path);
    const imports = item.imports || [];
    if (imports.some(x => [...changed].some(c => x.includes(c.split('/').pop()?.replace(/\.[^.]+$/,''))))) confirmed.add(item.path);
    if ([...changed].some(c => item.path.split('/')[0] === c.split('/')[0])) predicted.add(item.path);
  }
  const affectedContracts = contracts.filter(c => [...changed].some(f => String(c.name || '').toLowerCase().includes(f.split('/').pop()?.split('.')[0]?.toLowerCase() || '!')));
  const affectedTasks = tasks.filter(t => (t.predictedWriteScope || []).some(f => changed.has(f)));
  return {changedFiles:[...changed], confirmed:[...confirmed], predicted:[...predicted].filter(x=>!confirmed.has(x)), contracts:affectedContracts, tasks:affectedTasks};
}

export function compareArchitectures(options = [], weights = {}) {
  const w = {delivery:1, complexity:1, security:1.3, maintainability:1.1, runtimeCost:.8, compatibility:1, operations:.8, ...weights};
  const scored = options.map(o => {
    const positive = o.delivery*w.delivery + o.security*w.security + o.maintainability*w.maintainability + o.compatibility*w.compatibility;
    const negative = o.complexity*w.complexity + o.runtimeCost*w.runtimeCost + o.operations*w.operations;
    return {...o, score:Number((positive-negative).toFixed(2))};
  }).sort((a,b)=>b.score-a.score);
  return {options:scored, recommended:scored[0] || null};
}

export function projectHealth({qaChecks = [], events = [], contracts = [], candidates = []} = {}) {
  const passed = qaChecks.filter(x=>x.status==='passed').length;
  const failed = qaChecks.filter(x=>x.status==='failed').length;
  const total = Math.max(1, qaChecks.length);
  const flaky = qaChecks.filter(x=>x.status==='flaky').length;
  const repeatedFailures = events.filter(e=>String(e.type).includes('failed')).length;
  const unresolvedContracts = contracts.filter(c=>!['ACCEPTED','SUPERSEDED','DEPRECATED'].includes(c.state)).length;
  const verified = candidates.filter(c=>c.status==='VERIFIED').length;
  const score = clamp(55 + (passed/total)*35 - failed*12 - flaky*5 - repeatedFailures*2 - unresolvedContracts*3 + verified*4);
  return {score, buildStability:clamp(100-(failed*20)-(flaky*8)), flakyTests:flaky, contractRisk:unresolvedContracts, repeatedFailures, integrationHealth:clamp(50+verified*15)};
}

export function deliveryForecast({tasks = [], budget = {}, health = {score:50}} = {}) {
  const remaining = tasks.filter(t=>t.status!=='SUCCEEDED').length;
  const ready = tasks.filter(t=>t.status==='READY').length;
  const uncertainty = Math.max(10, 45 - Math.round((health.score || 0)/3));
  const effort = remaining ? `${Math.max(1,remaining)}-${Math.max(2,remaining*2)} task units` : 'complete';
  return {remaining, ready, effort, uncertaintyPercent:uncertainty, budgetLimit:budget.limit ?? null, drivers:remaining?['remaining dependencies','provider latency','verification outcomes']:[]};
}

export function troubleshootingReplay(events = []) {
  return events.slice(-50).map((e,i)=>({sequence:i+1,type:e.type,at:e.at,message:e.message || '',safeToReplay:!/(deploy|publish|push|message|database)/i.test(String(e.type))}));
}
