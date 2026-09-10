import { icon } from './icons.js';

const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

export function sidebar(state) {
  const nav = [['home','Home'],['activity','Activity'],['agents','Agents'],['context','Context'],['integration','Integration'],['qa','QA'],['settings','Settings']];
  return `<aside class="sidebar"><div class="brand"><span class="brand-mark">◔</span><b>AI Coding Studio</b></div>
    <button class="new-task" data-action="new-task">${icon('plus')} New task</button>
    <div class="nav-section">Workspace</div>${nav.map(([id,label])=>`<button class="nav-item ${state.view===id?'active':''}" data-view="${id}">${icon(id==='integration'?'merge':id)}<span>${label}</span></button>`).join('')}
    <div class="nav-section">Projects</div><div class="project-list">${state.projects.map(p=>`<button class="project-item ${p.id===state.projectId?'active':''}" data-project="${p.id}">${icon('folder')}<span>${esc(p.name)}</span></button>`).join('')}</div>
    <div class="account"><div class="avatar">TA</div><div><b>Local workspace</b><small>${state.permissionMode}</small></div></div></aside>`;
}

export function topbar(state) {
  const project = state.projects.find(p=>p.id===state.projectId);
  return `<header class="topbar"><div><b>${esc(project?.name || 'Choose project')}</b><small>${esc(state.branch)}</small></div>
    <div class="top-actions"><span class="pill ${state.running?'running':''}">${state.running?'Running':'Ready'}</span><button data-action="pause">Pause</button><button class="danger-ghost" data-action="stop">Stop</button></div></header>`;
}

export function home(state) {
  const project = state.projects.find(p=>p.id===state.projectId);
  return `<section class="home"><div class="hero-icon">◔</div><h1>What should we build${project ? ` in <u>${esc(project.name)}</u>` : ''}?</h1>
    <div class="action-grid">${[['Explore and understand code','Read-only discovery'],['Build a feature, app, or tool','Plan and implement'],['Review code and suggest changes','Independent review'],['Fix issues and failures','Reproduce and repair']].map((x,i)=>`<button class="action-card" data-prompt="${esc(x[0])}"><span class="card-icon c${i}">${['⚑','⚒','↻','♙'][i]}</span><b>${x[0]}</b><small>${x[1]}</small></button>`).join('')}</div>
    ${composer(state)}</section>`;
}

export function composer(state) {
  return `<div class="composer"><textarea id="prompt" placeholder="Do anything">${esc(state.draft || '')}</textarea><div class="composer-foot"><div><button class="round">${icon('plus')}</button><button class="permission" data-action="permission">◉ ${state.permissionMode}</button></div><div><select id="routing">${['Automatic','Fast','Balanced','Best quality','Lowest cost'].map(x=>`<option ${x===state.routing?'selected':''}>${x}</option>`).join('')}</select><button class="send" data-action="run">${state.running?icon('stop'):icon('play')}</button></div></div></div>`;
}

export function activity(state) {
  const rows = [...state.events].reverse().slice(0,80);
  return panel('Activity', 'Durable execution timeline', `<div class="timeline">${rows.length?rows.map(e=>`<div class="event"><span class="event-dot"></span><div><b>${esc(e.type)}</b><small>${esc(e.message || e.runId || '')}</small></div><time>${new Date(e.at || Date.now()).toLocaleTimeString()}</time></div>`).join(''):'<div class="empty">No activity yet.</div>'}</div>`);
}

export function agents(state) {
  return panel('Agents', 'Bounded delegation and DAG scheduling', `<div class="stats"><div><b>${state.tasks.length}</b><small>Logical tasks</small></div><div><b>${state.readyTasks.length}</b><small>Ready now</small></div><div><b>${state.maxConcurrent}</b><small>Concurrency cap</small></div></div><div class="task-table">${state.tasks.map(t=>`<div class="task-row"><span class="status ${t.status.toLowerCase()}"></span><div><b>${esc(t.objective)}</b><small>${esc(t.id)} · deps: ${(t.dependencies||[]).join(', ')||'none'}</small></div><span class="task-state">${t.status}</span></div>`).join('')}</div>`);
}

export function context(state) {
  return panel('Context Fabric', 'Ledger, provenance, contracts, and freshness', `<div class="split"><div><h3>Project Ledger</h3>${state.ledger.length?state.ledger.slice(-12).reverse().map(x=>`<div class="record"><b>${esc(x.kind)}</b><span>${esc(typeof x.value==='string'?x.value:JSON.stringify(x.value))}</span></div>`).join(''):'<div class="empty">No durable context recorded.</div>'}</div><div><h3>Contracts</h3>${state.contracts.length?state.contracts.map(c=>`<div class="record"><b>${esc(c.name)}</b><span>${c.state} · ${c.version}</span></div>`).join(''):'<div class="empty">No contracts yet.</div>'}<button class="primary" data-action="add-contract">Add sample contract</button><label class="file-button">Index repository folder<input id="repo-folder" type="file" webkitdirectory multiple hidden></label></div></div><div class="index-summary"><b>Repository index</b><span>${state.repoIndex.length} files · ${esc(state.framework)}</span></div>`);
}

export function integration(state) {
  return panel('Integration', 'Fenced claims and immutable candidates', `<div class="stats"><div><b>${state.claims.length}</b><small>Resource claims</small></div><div><b>${state.candidates.length}</b><small>Candidates</small></div><div><b>${state.verifiedCandidates}</b><small>Verified</small></div></div><div class="split"><div><h3>Claims</h3>${state.claims.map(c=>`<div class="record"><b>${esc(c.resource)}</b><span>${esc(c.owner)} · fence ${c.token}</span></div>`).join('')||'<div class="empty">No claims.</div>'}</div><div><h3>Candidates</h3>${state.candidates.map(c=>`<div class="record"><b>${esc(c.id)}</b><span>${c.status} · ${c.artifacts.length} artifacts</span></div>`).join('')||'<div class="empty">No candidates.</div>'}<button class="primary" data-action="demo-integration">Build demo candidate</button></div></div>`);
}

export function qa(state) {
  return panel('Independent QA', 'Acceptance criteria mapped to current evidence', `<div class="stats"><div><b>${state.qaChecks.filter(x=>x.status==='passed').length}</b><small>Passed</small></div><div><b>${state.qaChecks.filter(x=>x.status==='failed').length}</b><small>Failed</small></div><div><b>${state.qaChecks.filter(x=>x.status==='not-run').length}</b><small>Not run</small></div></div><div class="task-table">${state.qaChecks.map(c=>`<div class="task-row"><span class="status ${c.status==='passed'?'succeeded':c.status==='failed'?'failed':'pending'}"></span><div><b>${esc(c.text)}</b><small>${esc(c.method)}</small></div><span class="task-state">${c.status}</span></div>`).join('')}</div><button class="primary" data-action="run-qa">Run independent checks</button>`);
}

export function settings(state) {
  return panel('General', 'Permissions, routing, budgets, and execution defaults', `<div class="settings-card"><label><span><b>Default permissions</b><small>Routine scoped work follows the selected policy.</small></span><select id="permission-select">${['Supervised','Assisted','Autonomous','Custom'].map(x=>`<option ${x===state.permissionMode?'selected':''}>${x}</option>`).join('')}</select></label><label><span><b>Routing strategy</b><small>Choose capability, latency, privacy, and cost tradeoffs.</small></span><select id="routing-setting">${['Automatic','Fast','Balanced','Best quality','Lowest cost'].map(x=>`<option ${x===state.routing?'selected':''}>${x}</option>`).join('')}</select></label><label><span><b>Project budget</b><small>New spending blocks once the configured limit is exhausted.</small></span><input id="budget-limit" type="number" min="1" step="1" value="${state.budget.limit}"></label><label><span><b>Concurrent work</b><small>Global scheduler capacity for this demo workspace.</small></span><input id="max-concurrent" type="number" min="1" max="20" value="${state.maxConcurrent}"></label></div>`);
}

function panel(title, subtitle, body) { return `<section class="panel-page"><h1>${title}</h1><p>${subtitle}</p>${body}</section>`; }
