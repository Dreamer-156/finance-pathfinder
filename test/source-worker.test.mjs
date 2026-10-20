import test from 'node:test';
import assert from 'node:assert/strict';
import {fileURLToPath} from 'node:url';
import {runSourceWorker} from '../scripts/source-worker-client.mjs';

const program={id:'isolated-source',url:'https://example.edu/program'};
const previous={...program,status:'页面已读取',checkedAt:'2026-10-14T00:00:00Z',lastSuccess:'2026-10-14T00:00:00Z',changed:true,hash:'prior-evidence',message:'Earlier evidence'};
const fixture=name=>fileURLToPath(new URL('./fixtures/source-worker-'+name+'.mjs',import.meta.url));

test('a crashed network process returns a failure record and preserves earlier evidence',async()=>{
 const value=await runSourceWorker(program,previous,{workerPath:fixture('crash')});
 assert.equal(value.status,'访问受限');assert.equal(value.lastSuccess,previous.lastSuccess);assert.equal(value.hash,previous.hash);assert.equal(value.changed,true);
 assert.notEqual(value.checkedAt,previous.checkedAt);
});

test('a stalled source is terminated without stalling the website request',async()=>{
 const value=await runSourceWorker(program,undefined,{workerPath:fixture('timeout'),timeoutMs:150});
 assert.equal(value.status,'访问受限');assert.equal(value.id,program.id);
});

test('a successful isolated read returns the source status unchanged',async()=>{
 const value=await runSourceWorker(program,previous,{workerPath:fixture('success')});
 assert.equal(value.status,'页面已读取');assert.equal(value.id,program.id);assert.equal(value.url,program.url);assert.equal(value.message,'Fixture response');
});
