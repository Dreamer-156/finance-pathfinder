import {defaultProfile,programs,type Profile,type Cost,type SourceCheck} from './catalog.ts';
import {validateState} from './state-schema.ts';

export const browserStateKey='finance-pathfinder.pages.v1';
export const importUndoKey=browserStateKey+'.before-import';
type StoragePort=Pick<Storage,'getItem'|'setItem'>;
export type BrowserState={profile:Profile;saved:string[];costs:Record<string,Cost>};

export function readBrowserState(storage:StoragePort):BrowserState{
 const raw=storage.getItem(browserStateKey);
 if(!raw)return {profile:{...defaultProfile},saved:[],costs:{}};
 const stored=JSON.parse(raw);
 if(stored.version!==1)throw new Error('浏览器记录版本不受支持，原记录已保留。');
 const value=validateState(stored.data);
 return {profile:{...defaultProfile,...value.profile},saved:value.saved??[],costs:value.costs??{}};
}

export function persistBrowserState(storage:StoragePort,updates:unknown):BrowserState{
 const update=validateState(updates);
 const value={...readBrowserState(storage),...update};
 storage.setItem(browserStateKey,JSON.stringify({version:1,data:value}));
 return value;
}

function completeState(value:unknown):BrowserState{
 const state=validateState(value);
 if(!state.profile||!state.saved||!state.costs)throw new Error('备份缺少路线、收藏或费用记录，未导入。');
 return {profile:state.profile,saved:[...new Set(state.saved)],costs:state.costs};
}

export function exportPersonalBackup(state:BrowserState){
 return JSON.stringify({app:'finance-pathfinder',version:1,exportedAt:new Date().toISOString(),data:completeState({profile:state.profile,saved:state.saved,costs:state.costs})},null,2);
}

export function parsePersonalBackup(text:string):{state:BrowserState;exportedAt:string}{
 if(new TextEncoder().encode(text).length>2*1024*1024)throw new Error('备份文件不能超过 2 MB。');
 let value;try{value=JSON.parse(text);}catch{throw new Error('无法读取 JSON 备份，当前记录未改变。');}
 if(!value||value.app!=='finance-pathfinder'||value.version!==1||typeof value.exportedAt!=='string'||!Number.isFinite(Date.parse(value.exportedAt)))throw new Error('这不是受支持的升学雷达备份，当前记录未改变。');
 try{return {state:completeState(value.data),exportedAt:value.exportedAt};}catch{throw new Error('备份记录不完整，或含有当前项目库不支持的数据；当前记录未改变。');}
}

export function mergePersonalRecords(current:BrowserState,incoming:BrowserState):BrowserState{
 const next=completeState(incoming);
 return {profile:next.profile,saved:[...new Set([...current.saved,...next.saved])],costs:{...next.costs,...current.costs}};
}

export function importPersonalRecords(storage:StoragePort,incoming:BrowserState):BrowserState{
 const current=readBrowserState(storage),next=mergePersonalRecords(current,incoming);
 // Write the undo copy first: if it fails, the current record is untouched.
 storage.setItem(importUndoKey,JSON.stringify({version:1,data:current}));
 storage.setItem(browserStateKey,JSON.stringify({version:1,data:next}));
 return next;
}

export function restoreBeforeImport(storage:StoragePort):BrowserState{
 const raw=storage.getItem(importUndoKey);
 if(!raw)throw new Error('当前浏览器没有导入前的备份。');
 const value=JSON.parse(raw);if(value.version!==1)throw new Error('导入前备份版本不匹配。');
 const state=completeState(value.data);
 storage.setItem(browserStateKey,JSON.stringify({version:1,data:state}));
 return state;
}

export function parseSourceSnapshot(value:unknown):{generatedAt:string;checks:SourceCheck[]}{
 const snapshot=value as {generatedAt?:unknown;checks?:unknown};
 if(!snapshot||typeof snapshot.generatedAt!=='string'||!Number.isFinite(Date.parse(snapshot.generatedAt))||!Array.isArray(snapshot.checks))throw new Error('来源记录格式不正确');
 const statuses=new Set(['页面已读取','内容变化待复核','访问受限','入口监测','文件已读取','文件变化待复核','结构变化']);
 const ids=new Set<string>();
 const checks=snapshot.checks.map((item:SourceCheck)=>{
  const p=programs.find(p=>p.id===item?.id);
  if(!p||p.url!==item.url||ids.has(item.id)||!statuses.has(item.status)||!Number.isFinite(Date.parse(item.checkedAt))||typeof item.message!=='string')throw new Error('来源记录不匹配');
  ids.add(item.id);
  return item;
 });
 return {generatedAt:snapshot.generatedAt,checks};
}
