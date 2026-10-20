import {spawn} from 'node:child_process';
import {fileURLToPath} from 'node:url';

const worker=fileURLToPath(new URL('./source-check-worker.mjs',import.meta.url));
const children=new Set();
const queue=[];
let running=0;
let stopping=false;

function fallback(program,previous){
 const prior=previous?.url===program.url?previous:undefined;
 return {...prior,id:program.id,url:program.url,status:'访问受限',checkedAt:new Date().toISOString(),message:'官方页面读取暂时失败，已保留参考资料和上次成功记录。'};
}

export function runSourceWorker(program,previous,{workerPath=worker,timeoutMs=25000}={}){
 return new Promise(resolve=>{
  let child;
  try{child=spawn(process.execPath,['--use-env-proxy',workerPath],{windowsHide:true,stdio:['pipe','pipe','pipe']});}
  catch{resolve(fallback(program,previous));return;}
  children.add(child);
  let output='',settled=false,timedOut=false;
  const finish=value=>{if(settled)return;settled=true;clearTimeout(timer);children.delete(child);resolve(value);};
  const timer=setTimeout(()=>{timedOut=true;child.kill();finish(fallback(program,previous));},timeoutMs);
  child.stdout.on('data',chunk=>{output+=chunk;if(output.length>65536){child.kill();finish(fallback(program,previous));}});
  // Drain stderr; engine stack traces belong to this disposable process.
  child.stderr.resume();
  child.stdin.on('error',()=>{});
  child.on('error',()=>finish(fallback(program,previous)));
  child.on('close',code=>{
   if(settled)return;
   try{
    if(code!==0||timedOut)throw new Error('worker exited');
    const value=JSON.parse(output);
    if(value.id!==program.id||value.url!==program.url||!value.checkedAt||!value.status)throw new Error('invalid worker response');
    finish(value);
   }catch{console.warn('Source check isolated failure:',program.id,'exit',code);finish(fallback(program,previous));}
  });
  child.stdin.end(JSON.stringify({program,previous}));
 });
}

function drain(){
 while(!stopping&&running<3&&queue.length){
  const job=queue.shift();running++;
  runSourceWorker(job.program,job.previous).then(job.resolve,()=>job.resolve(fallback(job.program,job.previous))).finally(()=>{running--;drain();});
 }
}

export function monitorInWorker(program,previous){
 if(stopping)return Promise.resolve(fallback(program,previous));
 return new Promise(resolve=>{queue.push({program,previous,resolve});drain();});
}

export function stopSourceWorkers(){
 stopping=true;
 for(const child of children)child.kill();
 for(const job of queue.splice(0))job.resolve(fallback(job.program,job.previous));
}
process.once('exit',stopSourceWorkers);
