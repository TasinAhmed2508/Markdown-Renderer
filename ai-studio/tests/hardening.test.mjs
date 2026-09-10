import test from 'node:test';
import assert from 'node:assert/strict';
import { runSyntheticBenchmark, evaluateBenchmark } from '../core/benchmark.js';
import { RELEASE_GATES, evaluateReleaseGates, platformCapabilities, recoveryDrill } from '../core/hardening.js';

test('synthetic scale benchmark exercises roadmap counts without claiming real provider capacity',async()=>{
  const result=await runSyntheticBenchmark({logicalAgents:100,concurrentRequests:50,eventRecords:10000});
  assert.equal(result.synthetic,true); assert.equal(result.capacityClaim,false);
  const evaluation=evaluateBenchmark(result); assert.equal(evaluation.checks[0].passed,true); assert.equal(evaluation.checks[1].passed,true);
});

test('fundamental release gates cannot be waived',()=>{
  const statuses=Object.fromEntries(RELEASE_GATES.map(g=>[g.id,'passed']));
  statuses['provider-privacy']='waived';
  const report=evaluateReleaseGates(statuses); assert.equal(report.ready,false); assert.equal(report.blocked[0].id,'provider-privacy');
});

test('non-fundamental gate may be explicitly waived while defaults remain pending',()=>{
  const report=evaluateReleaseGates({'signed-distribution':'waived'});
  assert.equal(report.gates.find(g=>g.id==='signed-distribution').accepted,true); assert.equal(report.ready,false);
});

test('capability matrix reports unknown instead of inventing support',()=>{
  const matrix=platformCapabilities({git:'available'}); assert.equal(matrix.git,'available'); assert.equal(matrix.appContainer,'unknown');
});

test('recovery drill stays incomplete until every reconciliation class passes',()=>{
  assert.equal(recoveryDrill({database:'passed',workspaces:'passed',sideEffects:'blocked',artifacts:'passed'}).passed,false);
  assert.equal(recoveryDrill({database:'passed',workspaces:'passed',sideEffects:'passed',artifacts:'passed'}).passed,true);
});
