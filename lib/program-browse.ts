import type {Program,assess} from './catalog.ts';
import {groupPrograms} from './program-groups.ts';

export type BrowseOrder='route'|'school'|'verified'|'cost';
type Row={p:Program;a:ReturnType<typeof assess>};
export const browseOrderLabels:Record<BrowseOrder,string>={route:'按升学路线优先',school:'按院校名称',verified:'按最近资料核验',cost:'按自填全学制自付费用'};
export function schoolName(p:Program){return p.school.split(/\s*·\s*/)[0].trim();}
export function schoolChoices(items:Program[]):[string,string][]{
 return groupPrograms(items).sort((a,b)=>a.name.localeCompare(b.name,'zh-CN')).map(g=>[g.name,`${g.name} · ${g.count} 项`]);
}
export function sortProgramRows(rows:Row[],order:BrowseOrder):Row[]{
 return [...rows].sort((x,y)=>{
  let difference=0;
  if(order==='school')difference=schoolName(x.p).localeCompare(schoolName(y.p),'zh-CN');
  if(order==='verified')difference=y.p.verified.localeCompare(x.p.verified);
  if(order==='cost'){
   // Only complete, user-entered whole-degree RMB costs are comparable.
   if(x.a.total===null&&y.a.total!==null)return 1;
   if(x.a.total!==null&&y.a.total===null)return -1;
   if(x.a.total!==null&&y.a.total!==null)difference=x.a.total-y.a.total;
  }
  return difference||x.a.rank-y.a.rank;
 });
}
