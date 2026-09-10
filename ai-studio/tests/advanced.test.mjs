import test from 'node:test';
import assert from 'node:assert/strict';
import { EvidenceRegistry } from '../core/evidence-registry.js';
import { analyzeImpact, compareArchitectures, projectHealth, deliveryForecast, troubleshootingReplay } from '../core/advanced-workspaces.js';
import { instantiatePlaybook } from '../core/playbooks.js';
import { prepareRelease } from '../core/release-workbench.js';

test('evidence registry records current evidence and invalidates it',()=>{
  const r=new EvidenceRegistry(); r.record({criterionId:'ac1',status:'passed',commit:'abc',artifacts:['log']});
  assert.equal(r.coverage([{id:'ac1'}])[0].status,'passed');
  assert.equal(r.invalidate({commit:'abc',reason:'code changed'}),1);
  assert.equal(r.coverage([{id:'ac1'}])[0].status,'not-run');
});

test('protected acceptance tests require approval for weakening changes',()=>{
  const r=new EvidenceRegistry(); r.protect({id:'critical',content:'expect secure'});
  assert.equal(r.authorizeProtectedChange('critical','expect true').ok,false);
  assert.equal(r.authorizeProtectedChange('critical','expect true',{approved:true,rationale:'intentional migration'}).ok,true);
});

test('impact explorer separates confirmed and predicted impact',()=>{
  const report=analyzeImpact({changedFiles:['src/api.js'],index:[{path:'src/api.js',imports:[]},{path:'src/view.js',imports:['./api.js']},{path:'tests/x.js',imports:[]}]});
  assert.ok(report.confirmed.includes('src/api.js')); assert.ok(report.confirmed.includes('src/view.js'));
});

test('architecture lab recommends highest weighted option',()=>{
  const r=compareArchitectures([{id:'a',delivery:8,complexity:3,security:9,maintainability:8,runtimeCost:2,compatibility:8,operations:3},{id:'b',delivery:5,complexity:8,security:5,maintainability:5,runtimeCost:7,compatibility:5,operations:8}]);
  assert.equal(r.recommended.id,'a');
});

test('health and forecast are bounded and explain uncertainty',()=>{
  const health=projectHealth({qaChecks:[{status:'passed'},{status:'failed'}]});
  assert.ok(health.score>=0&&health.score<=100);
  const forecast=deliveryForecast({tasks:[{status:'READY'}],health,budget:{limit:20}}); assert.equal(forecast.remaining,1); assert.ok(forecast.uncertaintyPercent>0);
});

test('troubleshooting replay marks external side effects unsafe',()=>{
  const replay=troubleshootingReplay([{type:'tool.read'},{type:'deploy.production'}]);
  assert.equal(replay[0].safeToReplay,true); assert.equal(replay[1].safeToReplay,false);
});

test('playbook instantiation creates bounded dependent tasks',()=>{
  const p=instantiatePlaybook('feature',{goal:'add search'}); assert.equal(p.ok,true); assert.ok(p.playbook.tasks.length>=2); assert.equal(p.playbook.tasks[1].dependencies.length,1);
});

test('release workbench blocks unverified or incomplete candidates',()=>{
  const blocked=prepareRelease({candidate:{id:'c',status:'READY'},qaChecks:[{status:'not-run'}]}); assert.equal(blocked.status,'BLOCKED');
  const ready=prepareRelease({candidate:{id:'c',status:'VERIFIED'},qaChecks:[{status:'passed',evidence:{validity:'CURRENT'}}]}); assert.equal(ready.status,'READY_FOR_APPROVAL');
});
