import {Bookmark,ArrowUpRight,Wallet,BriefcaseBusiness,Library,Scale,Check,FileCheck2,ExternalLink} from 'lucide-react';
import {Button} from '@/components/ui/button';
import {Dialog,DialogContent,DialogHeader,DialogTitle,DialogDescription} from '@/components/ui/dialog';
import {assess,phdEntryLabels,type Program,type Profile,type SourceCheck,type Cost} from '@/lib/catalog';
import {careerProfile,feePresentation} from '@/lib/program-details';
import {costSummary} from '@/lib/program-export';

function schoolMark(school:string){
 const marks:[string,string][]=[['北京大学','PKU'],['清华','THU'],['上海交通','SJTU'],['香港中文','CUHK'],['香港科技','HKUST'],['香港大学','HKU'],['新加坡国立','NUS'],['南洋','NTU'],['新加坡管理','SMU'],['斯坦福','GSB'],['麻省','MIT'],['牛津','OX'],['剑桥','CAM'],['伦敦商','LBS'],['伦敦政','LSE'],['帝国','ICL'],['哥伦比亚','COL'],['普林斯顿','PRI'],['芝加哥','CHI'],['哈佛','HBS'],['宾夕法尼亚','PENN'],['纽约大学','NYU'],['卡内基','CMU'],['伯克利','UCB'],['墨尔本','MEL'],['多伦多','TOR'],['滑铁卢','UW'],['不列颠','UBC'],['斯德哥尔摩','SSE'],['博科尼','BOC'],['圣加仑','HSG'],['曼海姆','MAN'],['巴塞罗那','BSE'],['Baruch','BAR'],['高等商','HEC'],['INSEAD','INSEAD'],['新南威尔士','UNSW']];
 return marks.find(([name])=>school.includes(name))?.[1]??school.split(' · ')[0].slice(0,2);
}

export function ProgramCard({grouped=false,p,profile,check,cost,saved,compared,disabled,compareFull,onSave,onCompare,onOpen}:{grouped?:boolean;p:Program;profile:Profile;check?:SourceCheck;cost?:Cost;saved:boolean;compared:boolean;disabled:boolean;compareFull:boolean;onSave:()=>void;onCompare:()=>void;onOpen:()=>void}){
 const a=assess(p,profile,check,cost),fee=feePresentation(p,check),career=careerProfile(p);
 const aidSource=p.references?.find(r=>r.label==='官方奖助金额与申请资格')??p.references?.find(r=>/津贴|资助|奖助|fellowship/i.test(r.label));
 return <article className="program-card">
  <div className="card-identity"><div className="card-top">{!grouped&&<><div className={'school-monogram '+p.accent}>{schoolMark(p.school)}</div><div className="school-info"><span>{p.region} <i/> {p.degree}</span><h3>{p.school}</h3></div></>}<button className={'save-icon '+(saved?'is-saved':'')} disabled={disabled} onClick={onSave} aria-label={`${saved?'取消收藏':'收藏'} ${p.school} ${p.name}`}><Bookmark size={19} fill={saved?'currentColor':'none'}/></button></div>
  <div className="program-heading"><div className="program-title"><h4>{p.name}</h4><p className="english-name">{p.english}</p></div>
  <div className="tags"><span>{p.field}</span><span>{p.duration}</span>{p.degree==='博士'&&<span className="entry-tag">{phdEntryLabels[p.phdEntry??'verify']}</span>}</div></div></div>
  {p.admissionNote&&<p className="admission-note">{p.admissionNote}</p>}
  <div className="facts-block">
   <section className="fact-row fee-row"><Wallet size={17}/><div><span className="fact-label">参考学费</span><strong>{fee.value}</strong><p title={fee.context}>{fee.context}</p>{fee.policy&&p.details?.fee&&<p className="policy-inline">{fee.policy}</p>}<a className="fee-source-link" href={fee.url} target="_blank" rel="noreferrer">官方费用依据 <ExternalLink size={11}/></a></div></section>
   <section className="fact-row aid-row"><FileCheck2 size={17}/><div><span className="fact-label">资助政策</span><strong>{p.funding}</strong><p>{p.details?.fundingTerm??p.aidNote}</p>{p.details?.stipend&&<p className="stipend">{p.details.stipend}</p>}{aidSource&&<a className="fee-source-link" href={aidSource.url} target="_blank" rel="noreferrer">官方资助依据 <ExternalLink size={11}/></a>}</div></section>
   <section className="fact-row career-row"><BriefcaseBusiness size={17}/><div><span className="fact-label">主要对口就业</span><div className="career-tags">{career.paths.map(path=><span key={path}>{path}</span>)}</div><small>{career.basis==='官网披露'?'官方培养 / 去向信息':'按培养定位推断 · 非就业统计'}</small></div></section>
  </div>
  <footer><div className="card-bottom-meta"><span className={a.over?'danger':''}>{a.budget}</span><span>{p.intake===profile.year&&p.deadline&&!check?.changed?`截止 ${p.deadline.slice(0,10)}`:`${profile.year} 届待发布`}</span></div>
  <div className="card-actions"><button className={'compare-toggle '+(compared?'selected':'')} disabled={!compared&&compareFull} onClick={onCompare} aria-pressed={compared} aria-label={`${compared?'移出对比':'加入对比'} ${p.school} ${p.name}`}>{compared?<Check size={16}/>:<Scale size={16}/>}<span>{compared?'已加入对比':'加入对比'}</span></button><Button variant="outline" className="detail-button" onClick={onOpen}>项目详情 <ArrowUpRight size={15}/></Button></div></footer>
 </article>;
}

export function DetailOverview({p,check}:{p:Program;check?:SourceCheck}){
 const fee=feePresentation(p,check),career=careerProfile(p);
 return <div className="detail-overview">
  <div className="detail-fact-heading"><Wallet size={17}/><h3>学费与资助</h3><span>参考政策</span></div>
  <section className="detail-fee"><small>参考学费</small><strong>{fee.value}</strong><p>{fee.context}</p>{fee.policy&&<p>{fee.policy}</p>}<a href={fee.url} target="_blank" rel="noreferrer">学费 / 资助依据 <ExternalLink size={12}/></a></section>
  <section className="detail-funding"><b>{p.funding}</b>{p.details?.fundingTerm&&<p>期限与条件：{p.details.fundingTerm}</p>}{p.details?.stipend&&<p>津贴参考：{p.details.stipend}</p>}{p.aidNote!==p.details?.fundingTerm&&p.aidNote!==p.details?.stipend&&p.aidNote!==`${p.details?.stipend} ${p.details?.fundingTerm}`&&<p>{p.aidNote}</p>}</section>
  <div className="detail-fact-heading"><BriefcaseBusiness size={17}/><h3>主要对口就业方向</h3><span>{career.basis}</span></div><div className="career-tags">{career.paths.map(path=><span key={path}>{path}</span>)}</div><p className="career-evidence-note">{career.note}</p>{career.url&&<a className="official-link" href={career.url} target="_blank" rel="noreferrer">查看官方培养 / 就业依据 <ExternalLink size={14}/></a>}
  {p.details?.research&&<><div className="detail-fact-heading"><Library size={17}/><h3>研究与课程方向</h3></div><div className="research-tags">{p.details.research.map(v=><span key={v}>{v}</span>)}</div></>}
  {p.details?.exam&&<><h3>考试与语言</h3><p>{p.details.exam}</p></>}
  {p.details?.materials&&<><h3>主要准备材料</h3><ul>{p.details.materials.map(v=><li key={v}>{v}</li>)}</ul></>}
 </div>;
}

export function ProgramComparison({items,open,onOpenChange,checks,costs,profile,onRemove}:{items:Program[];open:boolean;onOpenChange:(open:boolean)=>void;checks:Record<string,SourceCheck>;costs:Record<string,Cost>;profile:Profile;onRemove:(id:string)=>void}){
 const rows:{label:string;render:(p:Program)=>React.ReactNode}[]=[
  {label:'自填全学制自付',render:p=>{const c=costSummary(p,profile,costs[p.id],checks[p.id]);return <><b>{c.total===null?'尚未算清':`¥${c.total.toLocaleString()}`}</b><p>{c.missing.length?`缺少：${c.missing.join('、')}`:c.budget}</p><small>人民币全学制 · 仅扣已确认奖助</small>{c.changed&&<p>官方来源有变化，参考资料须复核。</p>}</>;}},
  ...([['tuition','自填总学费'],['living','自填住宿生活'],['other','自填其他费用'],['confirmedAid','已确认奖助']] as const).map(([key,label])=>({label,render:(p:Program)=>{const value=costs[p.id]?.[key];return <><b>{value==null?'未填写':`¥${value.toLocaleString()}`}</b><small>人民币 · 全学制{key==='confirmedAid'?'；未填写不抵扣':''}</small></>;}})),
  {label:'参考学费',render:p=>{const f=feePresentation(p,checks[p.id]);return <><b>{f.value}</b><p>{f.context}</p>{f.policy&&<p>{f.policy}</p>}</>;}},
  {label:'资助政策',render:p=><><b>{p.funding}</b><p>{p.details?.fundingTerm??p.aidNote}</p>{p.details?.stipend&&<p>{p.details.stipend}</p>}</>},
  {label:'主要对口就业',render:p=><><div className="career-tags">{careerProfile(p).paths.map(v=><span key={v}>{v}</span>)}</div><small>{careerProfile(p).basis}</small></>},
  {label:'学制与入学路径',render:p=><><b>{p.duration}</b><p>{p.degree==='博士'?(p.entryNote??phdEntryLabels[p.phdEntry??'verify']):p.requirements[0]}</p></>},
  {label:'需要准备',render:p=><ul>{(p.details?.materials??p.requirements).map(v=><li key={v}>{v}</li>)}</ul>},
  {label:'官方依据',render:p=><><a href={p.url} target="_blank" rel="noreferrer">项目 / 招生页 <ExternalLink size={12}/></a>{p.references?.map(r=><a key={r.url} href={r.url} target="_blank" rel="noreferrer">{r.label} <ExternalLink size={12}/></a>)}</>}
 ];
 return <Dialog open={open} onOpenChange={onOpenChange}><DialogContent className="comparison-dialog"><DialogHeader><DialogTitle>项目并排对比</DialogTitle><DialogDescription>按相同口径比较费用、资助和就业方向。每年费用与全项目费用分别注明，奖助未计入个人已获金额。</DialogDescription></DialogHeader><div className="comparison-scroll"><table><thead><tr><th>比较维度</th>{items.map(p=><th key={p.id}><span>{p.region} · {p.degree}</span><strong>{p.school}</strong><p>{p.name}</p><button onClick={()=>onRemove(p.id)}>移出对比</button></th>)}</tr></thead><tbody>{rows.map(row=><tr key={row.label}><th>{row.label}</th>{items.map(p=><td key={p.id}>{row.render(p)}</td>)}</tr>)}</tbody></table>{items.length===0&&<p className="comparison-empty">已移出所有项目。关闭后可重新选择。</p>}</div></DialogContent></Dialog>;
}
