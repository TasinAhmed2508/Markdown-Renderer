export function evaluateAcceptance(criteria = [], evidence = []) {
  const byCriterion = new Map(evidence.map(e => [e.criterionId, e]));
  return criteria.map(c => {
    const ev = byCriterion.get(c.id);
    return {...c, status:ev?.status || 'not-run', evidence:ev || null};
  });
}

export function completionReport(tasks = [], acceptance = []) {
  const complete = tasks.every(t => t.status === 'SUCCEEDED') && acceptance.every(a => a.status === 'passed');
  return {
    complete,
    delivered:tasks.filter(t=>t.status==='SUCCEEDED').map(t=>t.objective),
    remaining:tasks.filter(t=>t.status!=='SUCCEEDED').map(t=>t.objective),
    checks:acceptance
  };
}
