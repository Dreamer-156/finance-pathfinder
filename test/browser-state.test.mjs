import test from 'node:test';
import assert from 'node:assert/strict';
import {readBrowserState,persistBrowserState,parseSourceSnapshot,browserStateKey} from '../lib/browser-state.ts';
import {defaultProfile,programs} from '../lib/catalog.ts';

function memoryStorage(){const data=new Map();return {getItem:key=>data.get(key)??null,setItem:(key,value)=>data.set(key,value)};}

test('Pages keeps independent browser records and preserves them across new reads',()=>{
 const browserA=memoryStorage(),browserB=memoryStorage();
 const profile={...defaultProfile,year:2031,gpa:'3.8/4.0'};
 const costs={[programs[0].id]:{tuition:80000,living:50000,other:10000,confirmedAid:0,note:'Official tuition'}};
 persistBrowserState(browserA,{profile});
 persistBrowserState(browserA,{saved:[programs[0].id]});
 persistBrowserState(browserA,{costs});
 assert.deepEqual(readBrowserState(browserA),{profile,saved:[programs[0].id],costs});
 assert.deepEqual(readBrowserState(browserB),{profile:defaultProfile,saved:[],costs:{}});
});

test('Pages rejects invalid state without overwriting existing records',()=>{
 const storage=memoryStorage();persistBrowserState(storage,{saved:[programs[0].id]});
 const before=storage.getItem(browserStateKey);
 assert.throws(()=>persistBrowserState(storage,{saved:['unknown-program']}));
 assert.equal(storage.getItem(browserStateKey),before);
 const blocked={getItem:()=>before,setItem:()=>{throw new Error('QuotaExceededError');}};
 assert.throws(()=>persistBrowserState(blocked,{saved:[]}));
 assert.deepEqual(readBrowserState(storage).saved,[programs[0].id]);
});

test('Public source snapshots cannot substitute another URL or duplicate a project',()=>{
 const p=programs[0],generatedAt='2026-10-20T07:00:00.000Z';
 const check={id:p.id,url:p.url,checkedAt:generatedAt,status:'页面已读取',message:'Official page was read'};
 assert.equal(parseSourceSnapshot({generatedAt,checks:[check]}).checks.length,1);
 assert.throws(()=>parseSourceSnapshot({generatedAt,checks:[{...check,url:'https://example.invalid/'}]}));
 assert.throws(()=>parseSourceSnapshot({generatedAt,checks:[check,check]}));
});
