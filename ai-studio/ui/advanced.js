const esc = s => String(s ?? '').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const record = (title,sub='') => `<div class="record"><b>${esc(title)}</b><span>${esc(sub)}</span></div>`;
const panel = (title,subtitle,body) => `<section class="panel-page"><h1>${title}</h1><p>${subtitle}</p>${body}</section>`;

export function impactView(state) {
  const r=state.impactReport;
  const body=r ? `<div class="stats"><div><b>${r.changedFiles.length}</b><small>Changed</small></div><div><b>${r.confirmed.length}</b><small>Confirmed impact</small></div><div><b>${r.predicted.length}</b><small>Predicted</small></div></div><div class="split"><div><h3>Confirmed</h3>${r.confirmed.map(x=>record(x,'dependency or direct change')).join('')||'<div class="empty">None detected.</div>'}</div><div><h3>Predicted</h3>${r.predicted.map(x=>record(x,'heuristic, not confirmed')).join('')||'<div class="empty">None predicted.</div>'}</div></div>` : '<div class="empty">Create or index repository state, then analyze a candidate.</div>';
  return panel('Change Impact Explorer','Confirmed dependencies are kept separate from predictions.',`${body}<button class="primary" data-action="analyze-impact">Analyze current candidate</button>`);
}

export function architectureView(state) {
  const lab=state.architectureLab;
  const selected=state.architectureDecision;
  return panel('Architecture Lab','Compare bounded options across delivery, complexity, security, maintenance, cost, compatibility, and operations.',`<div class="task-table">${lab.options.map((o,i)=>`<div class="task-row"><span class="status ${i===0?'succeeded':'pending'}"></span><div><b>${esc(o.name)}</b><small>weighted score ${o.score} · security ${o.security}/10 · complexity ${o.complexity}/10</small></div><span class="task-state">${selected?.id===o.id?'SELECTED':i===0?'RECOMMENDED':'OPTION'}</span></div>`).join('')}</div><button class="primary" data-action="choose-architecture">Select recommended option</button>${selected?record('Decision recorded',`${selected.name} · ${selected.decidedAt}`):''}`);
}

export function healthView(state) {
  const h=state.healthReport, f=state.forecast;
  return panel('Project Health Center','Build stability, contract risk, repeated failures, integration health, and delivery uncertainty.',`<div class="stats"><div><b>${h.score}</b><small>Health / 100</small></div><div><b>${h.buildStability}</b><small>Build stability</small></div><div><b>${h.integrationHealth}</b><small>Integration health</small></div></div><div class="split"><div><h3>Signals</h3>${record('Flaky tests',h.flakyTests)}${record('Contract risk',h.contractRisk)}${record('Repeated failures',h.repeatedFailures)}</div><div><h3>Delivery forecast</h3>${record('Remaining',f.remaining)}${record('Effort',f.effort)}${record('Uncertainty',`${f.uncertaintyPercent}%`)}${record('Drivers',f.drivers.join(', ')||'none')}</div></div><h3>Troubleshooting replay</h3><div class="timeline">${state.replay.slice(-12).reverse().map(x=>`<div class="event"><span class="event-dot"></span><div><b>${esc(x.type)}</b><small>${esc(x.message)}</small></div><time>${x.safeToReplay?'safe read/replay':'side effect protected'}</time></div>`).join('')||'<div class="empty">No recorded events.</div>'}</div>`);
}

export function releaseView(state) {
  const r=state.releasePlan;
  const status=r?.status || 'NOT PREPARED';
  const details=r ? `<div class="stats"><div><b>${esc(status)}</b><small>Status</small></div><div><b>${r.blockers.length}</b><small>Blockers</small></div><div><b>${r.artifacts.length}</b><small>Planned artifacts</small></div></div><div class="split"><div><h3>Blockers</h3>${r.blockers.map(x=>record(x)).join('')||'<div class="empty">No blockers.</div>'}</div><div><h3>Artifacts</h3>${r.artifacts.map(x=>record(x)).join('')}</div></div>` : '<div class="empty">Prepare a release from the exact verified candidate and current QA evidence.</div>';
  return panel('Release Workbench','Preparation is allowed locally; production actions still require explicit authorization.',`${details}<button class="primary" data-action="prepare-release">Prepare staging release</button><h3>Engineering playbooks</h3><div class="action-grid"><button class="action-card" data-playbook="feature"><b>Feature implementation</b><small>Architecture → implementation → QA</small></button><button class="action-card" data-playbook="incident"><b>Incident diagnosis</b><small>Reproduce → repair → regression</small></button><button class="action-card" data-playbook="accessibility"><b>Accessibility improvement</b><small>Keyboard and assistive checks</small></button></div>${state.playbookRuns.length?record('Last playbook',state.playbookRuns.at(-1).name):''}`);
}
