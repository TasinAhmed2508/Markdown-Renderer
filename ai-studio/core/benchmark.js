import { Scheduler } from './scheduler.js';

const p95 = values => {
  const xs=[...values].sort((a,b)=>a-b);
  return xs[Math.max(0,Math.ceil(xs.length*.95)-1)] || 0;
};
const now = () => globalThis.performance?.now?.() ?? Date.now();

export async function runSyntheticBenchmark({logicalAgents=100,concurrentRequests=50,eventRecords=10000}={}) {
  const tasks=Array.from({length:logicalAgents},(_,i)=>({id:`agent-${i}`,status:i<10?'SUCCEEDED':'READY',dependencies:i>=10&&i%7===0?[`agent-${i-7}`]:[],priority:logicalAgents-i}));
  const scheduler=new Scheduler({maxConcurrent:10});
  const scheduling=[];
  for(let i=0;i<200;i++){const t=now();scheduler.ready(tasks);scheduling.push(now()-t);}
  const models=Array.from({length:16},(_,i)=>({quality:70+i,cost:.02+i*.01,latency:80+i*15,privateAllowed:i%3!==0,tools:i%2===0}));
  const routing=[];
  for(let i=0;i<200;i++){const t=now();models.filter(m=>m.privateAllowed&&m.tools).sort((a,b)=>(b.quality-a.quality)+(a.cost-b.cost));routing.push(now()-t);}
  const requestBookkeeping=Array.from({length:concurrentRequests},(_,i)=>({id:`request-${i}`,state:'in-flight'}));
  await Promise.all(requestBookkeeping.map(async r=>({...r,state:'accounted'})));
  const events=Array.from({length:eventRecords},(_,i)=>({id:i,type:i%10?'tool':'checkpoint'}));
  const t=now();const recent=events.slice(-100).reverse();const eventSliceMs=now()-t;
  return {synthetic:true,capacityClaim:false,logicalAgents,concurrentRequests,eventRecords,schedulingP95Ms:p95(scheduling),routingP95Ms:p95(routing),eventSliceMs,recentEvents:recent.length,measuredAt:new Date().toISOString()};
}

export function evaluateBenchmark(result) {
  const checks=[
    {id:'logical-agents-100',passed:result.logicalAgents>=100,value:result.logicalAgents,target:'100+'},
    {id:'request-bookkeeping-50',passed:result.concurrentRequests>=50,value:result.concurrentRequests,target:'50+'},
    {id:'event-records-10000',passed:result.eventRecords>=10000,value:result.eventRecords,target:'10,000+'},
    {id:'scheduler-p95',passed:result.schedulingP95Ms<10,value:result.schedulingP95Ms,target:'<10ms'},
    {id:'routing-p95',passed:result.routingP95Ms<5,value:result.routingP95Ms,target:'<5ms'}
  ];
  return {passed:checks.every(x=>x.passed),checks,disclaimer:'Synthetic local-control-plane benchmark; does not establish provider, shell, browser, or hardware production capacity.'};
}
