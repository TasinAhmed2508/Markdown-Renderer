import { runSyntheticBenchmark, evaluateBenchmark } from '../core/benchmark.js';
const result=await runSyntheticBenchmark();
const evaluation=evaluateBenchmark(result);
console.log(JSON.stringify({result,evaluation},null,2));
if(!evaluation.passed) process.exitCode=1;
