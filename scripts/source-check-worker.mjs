// A network parser failure must never terminate the local website or SQLite owner.
import {monitor} from '../lib/source-monitor.ts';

let input='';
for await(const chunk of process.stdin){input+=chunk;if(input.length>262144)throw new Error('Source-check input too large');}
const {program,previous}=JSON.parse(input);
const result=await monitor(program,previous);
process.stdout.write(JSON.stringify(result),()=>process.exit(0));
