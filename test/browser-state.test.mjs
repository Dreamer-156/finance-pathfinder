import test from 'node:test';
import assert from 'node:assert/strict';
import {readBrowserState,persistBrowserState,parseSourceSnapshot,browserStateKey,exportPersonalBackup,parsePersonalBackup,importPersonalRecords,restoreBeforeImport,importUndoKey} from '../lib/browser-state.ts';
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

test('personal backup roundtrips all records and excludes public monitoring state',()=>{
 const state={profile:{...defaultProfile,year:2031},saved:[programs[0].id],costs:{[programs[0].id]:{tuition:12000,living:30000,other:1000,confirmedAid:1000,note:'Test source'}}};
 const text=exportPersonalBackup({...state,checks:[{message:'not a personal record'}]});
 assert.deepEqual(parsePersonalBackup(text).state,state);
 assert.equal(JSON.parse(text).data.checks,undefined);
 assert.throws(()=>parsePersonalBackup(JSON.stringify({app:'other-app',version:1,exportedAt:new Date().toISOString(),data:state})));
 assert.throws(()=>parsePersonalBackup(JSON.stringify({app:'finance-pathfinder',version:1,exportedAt:new Date().toISOString(),data:{...state,saved:['nonexistent']}})));
 assert.throws(()=>parsePersonalBackup('x'.repeat(2*1024*1024+1)));
});

test('import merges favourites, adopts the route, preserves current costs and survives reload with undo',()=>{
 const storage=memoryStorage(),a=programs[0].id,b=programs[1].id;
 const original=persistBrowserState(storage,{saved:[a],costs:{[a]:{tuition:15000}}});
 const incoming={profile:{...defaultProfile,year:2031,route:'research'},saved:[b,a],costs:{[a]:{tuition:90000},[b]:{living:30000}}};
 const next=importPersonalRecords(storage,incoming);
 assert.equal(next.profile.year,2031);assert.deepEqual(next.saved,[a,b]);assert.equal(next.costs[a].tuition,15000);assert.equal(next.costs[b].living,30000);
 assert.deepEqual(readBrowserState(storage),next);
 assert(storage.getItem(importUndoKey));
 assert.deepEqual(restoreBeforeImport(storage),original);
 assert.deepEqual(readBrowserState(storage),original);
});

test('import does not alter the primary record when storing an undo copy or replacement fails',()=>{
 const storage=memoryStorage();persistBrowserState(storage,{saved:[programs[0].id]});
 const before=storage.getItem(browserStateKey),incoming={profile:defaultProfile,saved:[],costs:{}};
 for(const failedKey of [importUndoKey,browserStateKey]){
  const blocked={getItem:storage.getItem,setItem:(key,value)=>{if(key===failedKey)throw Error('Storage quota');storage.setItem(key,value);}};
  assert.throws(()=>importPersonalRecords(blocked,incoming));assert.equal(storage.getItem(browserStateKey),before);
 }
});
