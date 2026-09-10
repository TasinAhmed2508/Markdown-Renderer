import { DurableStore } from './core/storage.js';
import { PolicyEngine } from './core/policy.js';
import { BudgetManager } from './core/budget.js';
import { ModelGateway } from './core/model-gateway.js';
import { WorkflowEngine } from './core/workflow.js';
import { ContextFabric } from './core/context-fabric.js';
import { ContractRegistry } from './core/contracts.js';
import { Scheduler } from './core/scheduler.js';
import { IntegrationEngine } from './core/integration.js';
import { MODELS, DEFAULT_TASKS } from './core/sample-data.js';
import { indexFiles, detectFramework, freshness } from './core/repository-index.js';
import { evaluateAcceptance } from './core/qa.js';
import { sidebar, topbar, home, activity, agents, context, integration, qa, settings } from './ui/render.js';
import { projectModal } from './ui/project-modal.js';

const store = new DurableStore('ai-coding-studio-v2');
store.reconcileRuns();
const registry = new ContractRegistry();
const integrator = new IntegrationEngine();
const initial = {projects:[{id:'markdown',name:'Markdown Renderer',root:'C:/Projects/Markdown-Renderer'}],projectId:'markdown',view:'home',permissionMode:'Assisted',routing:'Automatic',branch:'master',budget:{limit:20},maxConcurrent:4,draft:'',running:false};
let state = {...initial, ...store.get('ui', {})};
let tasks = store.get('tasks', DEFAULT_TASKS);
let claims = store.get('claims', []), candidates = store.get('candidates', []);
let repoIndex = store.get('repoIndex', []);
let qaEvidence = store.get('qaEvidence', []);
const acceptanceCriteria = [{id:'ac1',text:'Workflow completes with policy enforcement',method:'Automated test'},{id:'ac2',text:'Context remains fresh after indexing',method:'Artifact inspection'},{id:'ac3',text:'Integration candidate has passing evidence',method:'Independent review'}];

const contextFabric = new ContextFabric(store);
const root = document.querySelector('#app');

function derived() {
  const scheduler = new Scheduler({maxConcurrent:state.maxConcurrent});
  const savedContracts = store.get('contracts', []);
  return {...state, tasks, readyTasks:scheduler.ready(tasks), events:store.get('events', []), ledger:store.get('ledger', []), contracts:savedContracts, claims, candidates, verifiedCandidates:candidates.filter(c=>c.status==='VERIFIED').length, repoIndex, framework:detectFramework(repoIndex.map(x=>x.path)), qaChecks:evaluateAcceptance(acceptanceCriteria,qaEvidence)};
}

function render() {
  const s = derived(); const views = {home,activity,agents,context,integration,qa,settings};
  root.innerHTML = `<div class="shell">${sidebar(s)}<main class="workspace">${topbar(s)}<div class="content">${views[s.view]?.(s) || home(s)}</div></main></div>`;
  bind();
}

function save() { store.set('ui', state); store.set('tasks', tasks); store.set('claims', claims); store.set('candidates', candidates); store.set('repoIndex',repoIndex); store.set('qaEvidence',qaEvidence); }
function event(type, message='') { store.append({type,message,at:new Date().toISOString()}); }

function bind() {
  document.querySelectorAll('[data-view]').forEach(el=>el.onclick=()=>{state.view=el.dataset.view;save();render();});
  document.querySelectorAll('[data-project]').forEach(el=>el.onclick=()=>{state.projectId=el.dataset.project;save();render();});
  document.querySelectorAll('[data-prompt]').forEach(el=>el.onclick=()=>{state.draft=el.dataset.prompt;save();render();document.querySelector('#prompt')?.focus();});
  document.querySelector('#prompt')?.addEventListener('input', e=>{state.draft=e.target.value;save();});
  document.querySelector('#routing')?.addEventListener('change', e=>{state.routing=e.target.value;save();});
  document.querySelector('#permission-select')?.addEventListener('change', e=>{state.permissionMode=e.target.value;save();render();});
  document.querySelector('#routing-setting')?.addEventListener('change', e=>{state.routing=e.target.value;save();});
  document.querySelector('#budget-limit')?.addEventListener('change', e=>{state.budget={limit:Number(e.target.value)||20};save();});
  document.querySelector('#max-concurrent')?.addEventListener('change', e=>{state.maxConcurrent=Number(e.target.value)||4;save();render();});
  document.querySelector('#repo-folder')?.addEventListener('change', indexFolder);
  document.querySelectorAll('[data-action]').forEach(el=>el.addEventListener('click', action));
}

async function action(e) {
  const action = e.currentTarget.dataset.action;
  if (action==='new-task') return openProjectModal();
  if (action==='close-modal') return document.querySelector('#project-modal')?.remove();
  if (action==='create-project') return createProject();
  if (action==='run') return runGoal();
  if (action==='stop') { state.running=false; event('run.cancelled','User requested stop'); save(); return render(); }
  if (action==='pause') { state.running=false; event('run.paused','Paused at UI checkpoint'); save(); return render(); }
  if (action==='permission') { state.view='settings'; save(); return render(); }
  if (action==='add-contract') return addContract();
  if (action==='demo-integration') return demoIntegration();
  if (action==='run-qa') return runQa();
}

function openProjectModal() { document.body.insertAdjacentHTML('beforeend', projectModal()); document.querySelectorAll('#project-modal [data-action]').forEach(el=>el.addEventListener('click', action)); }
function createProject() {
  const name=document.querySelector('#project-name')?.value.trim(); if(!name) return;
  const id=name.toLowerCase().replace(/[^a-z0-9]+/g,'-'); const rootPath=document.querySelector('#project-root')?.value.trim()||`C:/Projects/${name}`;
  state.projects=[...state.projects,{id,name,root:rootPath}]; state.projectId=id; state.permissionMode=document.querySelector('#project-permission')?.value||'Assisted';
  contextFabric.record('decision',`Created project ${name}`,{source:'user'}); save(); document.querySelector('#project-modal')?.remove(); render();
}

async function runGoal() {
  const goal=(document.querySelector('#prompt')?.value||state.draft||'Inspect project').trim(); const project=state.projects.find(p=>p.id===state.projectId);
  const policy=new PolicyEngine({mode:state.permissionMode,roots:[project?.root||'C:/Projects'],network:['provider:openai']}); const budget=new BudgetManager(state.budget.limit);
  const gateway=new ModelGateway(MODELS); const route=gateway.route({toolUse:true,private:true,tokens:4000},state.routing);
  if(!route.ok){event('provider.blocked',route.reason);return render();}
  const engine=new WorkflowEngine({store,policy,budget}); const run=engine.createRun(goal); state.running=true; event('provider.routed',`${route.model.name} via ${route.model.provider}`); save(); render();
  const result=await engine.execute(run,[{kind:'read',path:`${project.root}/README.md`},{kind:'write',path:`${project.root}/.studio/checkpoint.json`}]);
  contextFabric.record('task-summary',{goal,status:result.state,model:route.model.id},{source:'workflow'}); state.running=false; state.draft=''; save(); render();
}

function addContract() {
  const item=registry.create({id:`contract-${Date.now()}`,name:'Workspace API',version:'0.1.0'}); registry.transition(item.id,'PROPOSED');
  const current=registry.items.get(item.id); store.update('contracts',[],xs=>[...xs,current]); contextFabric.record('contract',current,{source:'registry'}); render();
}

function demoIntegration() {
  const claim=integrator.claim('js/core/state.js','runtime-agent'); claims=[...claims,claim];
  const result=integrator.candidate({base:state.branch,artifacts:[{id:'runtime',changedFiles:['js/core/state.js']},{id:'ui',changedFiles:['css/layout.css']} ]});
  if(result.ok){integrator.candidates=[result.candidate]; integrator.verify(result.candidate.id,[{status:'passed'},{status:'passed'}]); candidates=[...candidates,integrator.candidates[0]];event('integration.verified',result.candidate.id);}
  save(); render();
}

render();

async function indexFolder(e) {
  const prior=repoIndex; const files=[];
  for (const file of [...e.target.files].slice(0,500)) { if(file.size>500000) continue; try{files.push({path:file.webkitRelativePath||file.name,content:await file.text()});}catch{} }
  repoIndex=indexFiles(files); const delta=freshness(prior,repoIndex); contextFabric.record('repository-index',{files:repoIndex.length,framework:detectFramework(repoIndex.map(x=>x.path)),changed:delta.changed.length},{source:'folder-picker'}); event('repository.indexed',`${repoIndex.length} files indexed`); save(); render();
}

function runQa() {
  qaEvidence=[{criterionId:'ac1',status:store.get('runs',[]).some(r=>r.state==='SUCCEEDED')?'passed':'not-run'},{criterionId:'ac2',status:repoIndex.length?'passed':'not-run'},{criterionId:'ac3',status:candidates.some(c=>c.status==='VERIFIED')?'passed':'not-run'}];
  event('qa.completed',`${qaEvidence.filter(x=>x.status==='passed').length}/${qaEvidence.length} checks passed`); save(); render();
}
