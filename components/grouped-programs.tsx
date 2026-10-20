import {useId,useState,type ReactNode} from 'react';
import {Building2,ChevronDown} from 'lucide-react';
import type {Program,SourceCheck} from '@/lib/catalog';
import type {SchoolGroup} from '@/lib/program-groups';
import {careerProfile,feePresentation} from '@/lib/program-details';

function SchoolStack({group,checks,renderProgram}:{group:SchoolGroup;checks:Record<string,SourceCheck>;renderProgram:(p:Program)=>ReactNode}){
 const id=useId();
 const [openId,setOpenId]=useState<string|null>(null);
 const items=group.departments.flatMap(unit=>unit.programs.map(p=>({p,department:unit.name})));
 return <section className="school-stack" aria-label={group.name+'项目堆叠'}>
  <div className="stack-school-heading"><span className="school-group-icon"><Building2 size={21}/></span><div className="stack-school-name"><h3>{group.name}</h3><p>{group.regions.join(' / ')}{group.departments.some(d=>d.name)&&' · '+group.departments.length+' 个院系分组'}</p></div><span className="stack-school-count">{items.length} 个项目 / 方向</span></div>
  <div className="program-stack">
   {items.map(({p,department},index)=>{
    const fee=feePresentation(p,checks[p.id]),career=careerProfile(p),open=openId===p.id,panelId=id+'-'+index;
    return <div className={'stack-item'+(open?' is-open':'')} key={p.id} data-program-id={p.id}>
     <button className="stack-toggle" aria-expanded={open} aria-controls={panelId} aria-label={(open?'收起 ':'展开 ')+p.school+' '+p.name} onClick={()=>setOpenId(open?null:p.id)}>
      <span className="stack-number">{String(index+1).padStart(2,'0')}</span><span className="stack-program-name"><span className="stack-department">{department||p.field} · {p.duration}</span><strong>{p.name}</strong><span className="stack-careers">方向参考 · {career.paths.slice(0,2).join(' / ')}</span></span>
      <span className="stack-money"><strong>{fee.value}</strong><span>{p.details?.fee?.year??'参考政策'}</span><span className="stack-funding">{p.funding}</span></span><span className="stack-action"><span>{open?'收起':'展开'}</span><ChevronDown size={17}/></span>
     </button>
     <div id={panelId} hidden={!open} className="stack-expanded">{open&&renderProgram(p)}</div>
    </div>;
   })}
  </div>
 </section>;
}

export function GroupedPrograms({groups,checks,renderProgram}:{groups:SchoolGroup[];checks:Record<string,SourceCheck>;renderProgram:(p:Program)=>ReactNode}){
 if(!groups.length)return null;
 return <div className="school-collection"><div className="group-toolbar"><span>{groups.length} 所院校 · 同校项目逐条堆叠，点击展开完整资料</span></div>{groups.map(group=><SchoolStack key={group.name} group={group} checks={checks} renderProgram={renderProgram}/>)}</div>;
}
