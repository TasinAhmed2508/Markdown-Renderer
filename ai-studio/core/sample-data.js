export const MODELS = [
  {id:'gpt-5.6-sol', name:'GPT-5.6 Sol', provider:'OpenAI', quality:99, latency:900, cost:0.9, context:200000, tools:true, privateAllowed:true, quota:100},
  {id:'gpt-5.6-luna', name:'GPT-5.6 Luna', provider:'OpenAI', quality:92, latency:350, cost:0.3, context:128000, tools:true, privateAllowed:true, quota:100},
  {id:'gemini-pro', name:'Gemini Pro', provider:'Google', quality:94, latency:600, cost:0.45, context:1000000, tools:true, privateAllowed:false, quota:100},
  {id:'openrouter-auto', name:'OpenRouter Auto', provider:'OpenRouter', quality:90, latency:700, cost:0.25, context:128000, tools:true, privateAllowed:false, quota:100}
];

export const DEFAULT_TASKS = [
  {id:'discover', objective:'Discover repository structure', dependencies:[], priority:100, status:'SUCCEEDED'},
  {id:'plan', objective:'Create architecture and acceptance plan', dependencies:['discover'], priority:95, status:'SUCCEEDED'},
  {id:'frontend', objective:'Implement product shell', dependencies:['plan'], priority:80, status:'READY'},
  {id:'runtime', objective:'Implement durable workflow runtime', dependencies:['plan'], priority:90, status:'READY'},
  {id:'qa', objective:'Run independent verification', dependencies:['frontend','runtime'], priority:70, status:'PENDING'}
];
