export const RELEASE_GATES = [
  ['threat-model','Approved threat model',true],['sandbox-matrix','Tested sandbox capability matrix',true],['critical-containment','No unresolved critical containment vulnerability',true],
  ['recovery-restore','Recovery and restore tests passing',true],['exact-candidate','Exact-candidate integration protection',true],['provider-privacy','Provider privacy enforcement',true],
  ['budget-reservation','Budget reservation enforcement',true],['cancellation','Verified cancellation behavior',true],['credential-storage','Protected credential storage',true],
  ['signed-distribution','Signed application distribution and verified updates',false],['accessible-core','Accessible core workflows',false],['visual-regression','Reference visual regression acceptance',false],
  ['platform-matrix','Published supported-platform matrix',false],['scale-methodology','Published scale benchmark methodology',false],['honest-completion','Accurate completion and partial-completion reporting',true]
].map(([id,name,fundamental])=>({id,name,fundamental}));

export function evaluateReleaseGates(status = {}) {
  const gates=RELEASE_GATES.map(g=>{
    const value=status[g.id] || 'pending';
    const accepted=value==='passed'||(value==='waived'&&!g.fundamental);
    return {...g,status:value,accepted};
  });
  return {ready:gates.every(g=>g.accepted),passed:gates.filter(g=>g.accepted).length,total:gates.length,blocked:gates.filter(g=>!g.accepted),gates};
}

export function platformCapabilities(input = {}) {
  const fields=['webview2','git','restrictedTokens','jobObjects','appContainer','containerOrVm','playwright','credentialStore'];
  return Object.fromEntries(fields.map(k=>[k,input[k]??'unknown']));
}

export function recoveryDrill({database='not-run',workspaces='not-run',sideEffects='not-run',artifacts='not-run'}={}) {
  const checks={database,workspaces,sideEffects,artifacts};
  return {checks,passed:Object.values(checks).every(x=>x==='passed'),ambiguous:Object.entries(checks).filter(([,v])=>v!=='passed').map(([k])=>k)};
}
