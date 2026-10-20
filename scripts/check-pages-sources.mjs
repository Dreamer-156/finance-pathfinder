import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {programs} from '../lib/catalog.ts';
import {monitorInWorker,stopSourceWorkers} from './source-worker-client.mjs';
import {parseSourceSnapshot} from '../lib/browser-state.ts';

const output=new URL('../pages/public/sources.json',import.meta.url);
let previous=[];
try{previous=parseSourceSnapshot(JSON.parse(await readFile(output,'utf8'))).checks;}catch{}
const checks=new Array(programs.length);
let cursor=0,completed=0;
async function worker(){
 while(cursor<programs.length){
  const index=cursor++,p=programs[index];
  checks[index]=await monitorInWorker(p,previous.find(c=>c.id===p.id));
  completed++;
  if(completed%10===0||completed===programs.length)console.log(`Official sources: ${completed}/${programs.length}`);
 }
}
try{
 await Promise.all([worker(),worker(),worker()]);
 const snapshot={generatedAt:new Date().toISOString(),checks};
 parseSourceSnapshot(snapshot);
 await mkdir(new URL('../pages/public/',import.meta.url),{recursive:true});
 await writeFile(output,JSON.stringify(snapshot,null,2)+'\n');
 const statusCounts={};for(const c of checks)statusCounts[c.status]=(statusCounts[c.status]??0)+1;
 console.log(JSON.stringify({generatedAt:snapshot.generatedAt,total:checks.length,statusCounts}));
}finally{stopSourceWorkers();}
