export function prepareRelease({version = '0.1.0', candidate, qaChecks = [], environment = 'staging'} = {}) {
  const currentChecks = qaChecks.filter(x=>x.evidence?.validity !== 'INVALIDATED');
  const failed = currentChecks.filter(x=>x.status==='failed');
  const incomplete = currentChecks.filter(x=>!['passed','skipped'].includes(x.status));
  const candidateOk = candidate?.status === 'VERIFIED';
  const authorizedEnvironment = environment !== 'production';
  const blockers = [];
  if (!candidateOk) blockers.push('verified integration candidate required');
  if (failed.length) blockers.push(`${failed.length} required checks failed`);
  if (incomplete.length) blockers.push(`${incomplete.length} checks are incomplete`);
  if (!authorizedEnvironment) blockers.push('production authorization required');
  return {
    id:`release-${version}-${Date.now()}`, version, environment, candidateId:candidate?.id || null,
    status:blockers.length?'BLOCKED':'READY_FOR_APPROVAL', blockers,
    artifacts:['release notes','reproducibility metadata','SBOM placeholder','security results','deployment plan','rollback plan','approval checklist'],
    generatedAt:new Date().toISOString()
  };
}
