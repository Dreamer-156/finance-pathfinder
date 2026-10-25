import {careerFamily} from './career-expansion.ts';
import {evidenceReport} from './career-evidence.ts';
import {entryReport} from './career-entry.ts';
import {z} from 'zod';
import {journeyRecordSchema,journeyText,newJourney} from './career-journeys.ts';
import type {Profile,Program} from './catalog.ts';
import {matchesCareer} from './program-details.ts';
import {careerPaths,careerSources,careerCheckedAt,skillLabels,type CareerPath,type Skill} from './career-catalog.ts';
export const careerPlanKey='finance-pathfinder.career.v1';
const text=z.string().max(3000),level=z.union([z.literal('unknown'),z.number().int().min(0).max(3)]);
export const milestoneLabels={explore:'确认工作内容与一个真实岗位要求',build:'完成试做作品并保留证据',feedback:'获得反馈后决定继续、调整或暂停'};
const noteSchema=z.object({reason:text,evidence:text,downside:text,assumption:text,result:text,nextAction:text,reviewDate:z.string().max(10),done:z.array(z.enum(['explore','build','feedback'])).max(3).refine(v=>new Set(v).size===v.length)});
const schema=z.object({app:z.literal('finance-pathfinder-career'),version:z.literal(1),selected:z.array(z.string()).max(3).refine(v=>new Set(v).size===v.length),primary:z.string().nullable(),goals:text,location:text,constraints:text,hours:z.number().int().min(0).max(40).nullable(),skills:z.object({accounting:level,math:level,coding:level,research:level,communication:level}),notes:z.record(noteSchema),journeys:z.record(journeyRecordSchema).default({})}).strict();
export type CareerPlan=z.infer<typeof schema>;
export type CareerNote=z.infer<typeof noteSchema>;
export function newCareerPlan():CareerPlan{return {app:'finance-pathfinder-career',version:1,selected:[],primary:null,goals:'',location:'',constraints:'',hours:null,skills:{accounting:'unknown',math:'unknown',coding:'unknown',research:'unknown',communication:'unknown'},notes:{},journeys:{}};}
export function newCareerNote():CareerNote{return {reason:'',evidence:'',downside:'',assumption:'',result:'',nextAction:'',reviewDate:'',done:[]};}
export function parseCareerPlan(raw:string):CareerPlan{
 if(new TextEncoder().encode(raw).length>3*1024*1024)throw new Error('职业规划备份不能超过3 MB。');
 const p=schema.parse(JSON.parse(raw)),ids=new Set(careerPaths.map(c=>c.id));
 if(p.selected.some(id=>!ids.has(id))||Object.keys(p.notes).some(id=>!ids.has(id))||Object.keys(p.journeys).some(id=>!ids.has(id)))throw new Error('含有当前不支持的职业路径。');
 if(p.primary!==null&&!p.selected.includes(p.primary))throw new Error('主线必须在所选路径中。');
 return p;
}
export function toggleCareer(plan:CareerPlan,id:string):CareerPlan{
 if(!careerPaths.some(p=>p.id===id))throw new Error('路径不存在。');
 if(plan.selected.includes(id))return {...plan,selected:plan.selected.filter(x=>x!==id),primary:plan.primary===id?null:plan.primary};
 if(plan.selected.length>=3)throw new Error('最多选择3条路径；请先移除一条。');
 return {...plan,selected:[...plan.selected,id],notes:{...plan.notes,[id]:plan.notes[id]??newCareerNote()}};
}
export type CareerFilters={query:string;market:string;side:string;institution:string;stateOnly:boolean;family?:string};
export function filterCareers(filters:CareerFilters){
 const words=filters.query.normalize('NFKC').toLowerCase().trim().split(/\s+/).filter(Boolean);
 return careerPaths.filter(c=>(!filters.family||filters.family==='all'||careerFamily(c.id).id===filters.family)&&(filters.market==='all'||c.markets.includes(filters.market))&&(filters.side==='all'||c.sides.includes(filters.side))&&(filters.institution==='all'||c.institutions.includes(filters.institution))&&(!filters.stateOnly||c.stateLens)&&words.every(w=>[c.name,c.english,careerFamily(c.id).name,...c.tags,...c.markets,...c.sides,...c.institutions,c.work].join(' ').normalize('NFKC').toLowerCase().includes(w)));
}
export function careerSkillGaps(c:CareerPath,skills:CareerPlan['skills']){
 return (Object.entries(c.skills) as [Skill,number][]).map(([key,target])=>({key,label:skillLabels[key],target,current:skills[key],status:skills[key]==='unknown'?'待评估':(skills[key] as number)<target?'先补基础':'用作品核验'}));
}
export function relatedCareerPrograms(c:CareerPath,items:Program[],degree:string,saved:string[]=[]){
 return items.filter(p=>{
  if(!(degree==='博士'?p.degree==='博士':['硕士','研究硕士'].includes(p.degree))||!c.programFields.includes(p.field))return false;
  const text=[p.name,p.english,...(p.details?.research??[])].join(' ');
  if(c.id==='quant-research')return p.field==='量化与金融工程'||/量化|计量|数量|数理|统计|quant|econometric/i.test(text);
  if(c.id==='fintech')return /金融科技|商业分析|数据|fintech|business analytics|data science/i.test(text);
  return matchesCareer(p,c.programGroup);
 }).sort((a,b)=>Number(saved.includes(b.id))-Number(saved.includes(a.id))||a.school.localeCompare(b.school,'zh-CN')||a.name.localeCompare(b.name,'zh-CN'));
}
export function careerNextAction(c:CareerPath,plan:CareerPlan){
 const n=plan.notes[c.id]??newCareerNote();if(n.nextAction.trim())return n.nextAction;
 if(!n.done.includes('explore'))return '找一份官方岗位说明，核对具体条线、日常任务、资格和工作地点；不要把历史招聘当作正在开放。';
 if(!n.done.includes('build'))return c.trial.task;
 if(!n.done.includes('feedback'))return '找课程教师或有相关经历的人评阅试做作品，记录反馈与一个反面证据；网站不会代你联系。';
 return '结合试做体验、外部反馈与机会成本，决定继续、调整或暂停，并设置复盘日期。';
}
export function careerReport(plan:CareerPlan,profile:Profile){
 const lines=['# 金融职业路径规划',`导出时间：${new Date().toISOString()}`,`目标入学：${profile.year}（沿用升学路线，不代表毕业时间）`,`目标：${plan.goals||'待填写'}`,`地点：${plan.location||'待填写'}`,`每周可投入：${plan.hours===null?'待填写':plan.hours+' 小时'}`,`硬约束：${plan.constraints||'待填写'}`,`升学预算：${profile.budgetEnabled?'全学制自付上限 ¥'+profile.budget:'未启用；不代表可负担'}`,'技能自评：'+Object.entries(plan.skills).map(([k,v])=>`${skillLabels[k as Skill]} ${v==='unknown'?'未知':v}`).join('；'),'市场、买卖方、机构所有制和岗位是不同维度。所有能力层级、准备顺序和转向建议均为规划假设，不是招聘统一门槛或就业保证。'];
 for(const id of plan.selected){const c=careerPaths.find(c=>c.id===id)!,n=plan.notes[id]??newCareerNote();lines.push('',`## ${c.name}${plan.primary===id?'（自选主线）':'（自选备选）'}`,`岗位大类：${careerFamily(c.id).name}`,`工作概述：${c.work}`,`市场：${c.markets.join(' / ')}；角色：${c.sides.join(' / ')}；机构：${c.institutions.join(' / ')}`,`吸引我的原因：${n.reason||'待填写'}`,`已核验事实/估计/偏好及来源日期：${n.evidence||'待填写'}`,`技能提示：${careerSkillGaps(c,plan.skills).map(g=>g.label+' '+g.status).join('；')}`,`课程方向：${c.courses.join('、')}`,`升学关联（规划建议）：${c.education}`,`机会成本与最坏合理情景：${n.downside||'待填写'}`,`会改变主线选择的假设：${n.assumption||'待填写'}`,`可逆性与转向条件（规划建议）：${c.transition}`,`试做任务：${c.trial.task}`,`交付物：${c.trial.deliverable}`,`复盘问题：${c.trial.review}`,`试做体验与反馈：${n.result||'待填写'}`,`已完成检查点：${n.done.map(k=>milestoneLabels[k]).join('；')||'无'}`,`下一步：${careerNextAction(c,plan)}`,`复盘日期：${n.reviewDate||'待填写'}`,...c.sources.map(id=>{const s=careerSources.find(s=>s.id===id)!;return `来源：${s.title} (${s.kind}) ${s.url}；${s.note}`;}));}
 lines.push('',`来源核查日：${careerCheckedAt}；职责概述是官方材料的归纳，规划建议为人工整理。历史招聘仅作职位结构示例，受限页面不当作完整核验。`,`相关升学项目仅按专业与培养方向映射，未核验岗位录用结果；所有制不代表编制、稳定性或薪资。本报告不包含当前岗位开放、统一学历要求或录取概率。`);for(const id of plan.selected){const c=careerPaths.find(c=>c.id===id)!;lines.push('',journeyText(c,plan.journeys?.[id]??newJourney()),entryReport(id),evidenceReport(id));}return lines.join('\n\n');
}
