export const PLAYBOOKS = {
  feature:{name:'Feature implementation',roles:['Architecture Lead','Frontend Lead','QA Lead'],checks:['static analysis','unit tests','browser journey']},
  incident:{name:'Incident diagnosis',roles:['Diagnostic Specialist','QA Lead'],checks:['reproduction','regression test']},
  release:{name:'Release preparation',roles:['Integration Specialist','QA Lead','Security Reviewer'],checks:['required tests','artifact inspection','approval checklist']},
  accessibility:{name:'Accessibility improvement',roles:['UX Lead','Frontend Lead','QA Lead'],checks:['keyboard journey','screen-reader labels','contrast review']}
};

export function instantiatePlaybook(id, input = {}) {
  const p = PLAYBOOKS[id]; if (!p) return {ok:false, reason:'unknown-playbook'};
  const prefix = `${id}-${Date.now()}`;
  const tasks = p.checks.map((check,i)=>({id:`${prefix}-${i+1}`,objective:`${p.name}: ${check}`,status:i===0?'READY':'PENDING',dependencies:i?[`${prefix}-${i}`]:[],acceptanceCriteria:[check]}));
  return {ok:true, playbook:{id,name:p.name,input,roles:[...p.roles],tasks,verification:[...p.checks]}};
}
