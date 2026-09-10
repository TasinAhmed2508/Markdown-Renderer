import test from 'node:test';
import assert from 'node:assert/strict';
import { PolicyEngine } from '../core/policy.js';
import { BudgetManager } from '../core/budget.js';
import { ModelGateway } from '../core/model-gateway.js';
import { Scheduler } from '../core/scheduler.js';
import { indexFiles, freshness } from '../core/repository-index.js';
import { ContractRegistry } from '../core/contracts.js';
import { IntegrationEngine } from '../core/integration.js';
import { DurableStore } from '../core/storage.js';
import { WorkflowEngine } from '../core/workflow.js';
import { evaluateAcceptance, completionReport } from '../core/qa.js';

test('policy blocks path escapes and unknown network destinations',()=>{
  const p=new PolicyEngine({roots:['C:/repo'],network:['provider:openai']});
  assert.equal(p.authorize({kind:'read',path:'C:/repo/a.js'}).ok,true);
  assert.equal(p.authorize({kind:'read',path:'C:/other/a.js'}).ok,false);
  assert.equal(p.authorize({kind:'research',destination:'https://evil.test'}).ok,false);
});

test('budget reserves atomically',()=>{
  const b=new BudgetManager(1); assert.equal(b.reserve(.7).ok,true); assert.equal(b.reserve(.4).ok,false);
  assert.equal(b.reconcile(.7,.5).remaining,.5);
});

test('model routing enforces privacy before scoring',()=>{
  const g=new ModelGateway([{id:'cheap',cost:.1,latency:50,quality:80,tools:true,privateAllowed:false,context:10000},{id:'safe',cost:.9,latency:500,quality:90,tools:true,privateAllowed:true,context:10000}]);
  assert.equal(g.route({private:true,toolUse:true,tokens:100},'Lowest cost').model.id,'safe');
});

test('scheduler detects cycles and exposes ready work',()=>{
  const s=new Scheduler({maxConcurrent:2});
  assert.equal(s.validate([{id:'a',dependencies:['b']},{id:'b',dependencies:['a']}]).reason,'cycle');
  const ready=s.ready([{id:'a',dependencies:[],status:'SUCCEEDED'},{id:'b',dependencies:['a'],status:'READY',priority:10}]);
  assert.equal(ready[0].id,'b');
});

test('repository freshness notices content change',()=>{
  const a=indexFiles([{path:'a.js',content:'const x=1'}]); const b=indexFiles([{path:'a.js',content:'const x=2'}]);
  assert.equal(freshness(a,b).fresh,false);
});

test('contract lifecycle rejects invalid jumps',()=>{
  const r=new ContractRegistry(); r.create({id:'api',name:'API'});
  assert.equal(r.transition('api','ACCEPTED').ok,false); assert.equal(r.transition('api','PROPOSED').ok,true);
});

test('fencing rejects stale writer and integration detects overlap',()=>{
  const i=new IntegrationEngine(); const c1=i.claim('package.json','a'); const c2=i.claim('package.json','b');
  assert.equal(i.writeAllowed('package.json','a',c1.token),false); assert.equal(i.writeAllowed('package.json','b',c2.token),true);
  const result=i.candidate({base:'abc',artifacts:[{changedFiles:['x.js']},{changedFiles:['x.js']}]}); assert.equal(result.ok,false);
});

test('workflow records evidence and succeeds',async()=>{
  const store=new DurableStore(`test-${Date.now()}`); const p=new PolicyEngine({roots:['C:/repo']}); const b=new BudgetManager(3);
  const w=new WorkflowEngine({store,policy:p,budget:b}); const run=w.createRun('test'); const result=await w.execute(run,[{kind:'read',path:'C:/repo/a.js'}]);
  assert.equal(result.state,'SUCCEEDED'); assert.equal(result.evidence.length,1);
});

test('QA maps evidence and reports incomplete work honestly',()=>{
  const checks=evaluateAcceptance([{id:'a',text:'A'}],[{criterionId:'a',status:'passed'}]);
  assert.equal(checks[0].status,'passed'); const report=completionReport([{objective:'x',status:'READY'}],checks); assert.equal(report.complete,false);
});
