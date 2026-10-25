'use client';
import {careerFamilies,careerFamily} from '@/lib/career-expansion';
import {careerPaths} from '@/lib/career-catalog';
export function CareerFamilyOverview({onChoose}:{onChoose:(id:string)=>void}){return <section className="career-breadth" aria-label="泛金融岗位覆盖"><div><strong>{careerFamilies.length} 大类 · {careerPaths.length} 个目标方向</strong><p>按业务与职能浏览；同一机构可跨大类。每条方向都有连续路线，岗位名称可能交叉，具体资格仍看真实公告。</p></div><details><summary>查看大类覆盖，选择要探索的方向</summary><div className="career-family-grid">{careerFamilies.map(f=><button type="button" key={f.id} onClick={()=>onChoose(f.id)}><b>{f.name}<span>{careerPaths.filter(p=>careerFamily(p.id).id===f.id).length}</span></b><small>{f.scope}</small></button>)}</div></details></section>;}
