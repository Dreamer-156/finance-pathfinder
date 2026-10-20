import {defaultProfile,programs,type Profile,type Cost,type SourceCheck} from './catalog.ts';
import {validateState} from './state-schema.ts';

export const browserStateKey='finance-pathfinder.pages.v1';
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
