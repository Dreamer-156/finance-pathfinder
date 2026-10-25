import {z} from 'zod';
import {assess,type Program,type Profile,type Cost,type SourceCheck} from './catalog.ts';

export const criteria={career:'就业与个人适配',research:'研究与学习价值',cost:'时间与资金负担',options:'未来选择空间'};
export type Criterion=keyof typeof criteria;
const text=z.string().max(3000);
const gate=z.enum(['unknown','yes','no']);
const optionSchema=z.object({id:z.string(),stage:z.enum(['candidate','applied','offer']),eligibility:gate,constraints:gate,scores:z.object({career:z.number().min(1).max(10).optional(),research:z.number().min(1).max(10).optional(),cost:z.number().min(1).max(10).optional(),options:z.number().min(1).max(10).optional()}),evidence:text,opportunity:text,reversibility:z.enum(['unknown','high','partial','low']),best:text,base:text,worst:text,tolerable:gate,assumption:text,warning:text,mitigation:text});
export const decisionSchema=z.object({version:z.literal(1),question:text,deadline:z.string().max(10),inaction:text,priorities:text,hardConstraints:text,weights:z.object({career:z.number().int().min(0).max(100),research:z.number().int().min(0).max(100),cost:z.number().int().min(0).max(100),options:z.number().int().min(0).max(100)}),options:z.array(optionSchema).max(3).refine(a=>new Set(a.map(o=>o.id)).size===a.length),nextAction:text,reviewDate:z.string().max(10)});
export type Decision=z.infer<typeof decisionSchema>;
export type DecisionOption=Decision['options'][number];
export const decisionKey='finance-pathfinder.decision.v1';
export function newDecision():Decision{return {version:1,question:'下一阶段优先为哪些升学项目投入准备？',deadline:'',inaction:'继续当前课程与准备，暂不新增申请投入。请补充这样做的收益和损失。',priorities:'',hardConstraints:'',weights:{career:25,research:25,cost:25,options:25},options:[],nextAction:'',reviewDate:''};}
export function newOption(id:string):DecisionOption{return {id,stage:'candidate',eligibility:'unknown',constraints:'unknown',scores:{},evidence:'',opportunity:'',reversibility:'unknown',best:'',base:'',worst:'',tolerable:'unknown',assumption:'',warning:'',mitigation:''};}
export function parseDecision(raw:string,items:Program[]):Decision{
 if(raw.length>100000)throw new Error('决策记录过大。');
 const d=decisionSchema.parse(JSON.parse(raw));
 if(d.options.some(o=>!items.some(p=>p.id===o.id&&p.degree!=='硕博')))throw new Error('决策中包含当前项目库无法识别的项目。');
 return d;
}
const keys=Object.keys(criteria) as Criterion[];
export function evaluateDecision(d:Decision,items:Program[],profile:Profile,costs:Record<string,Cost>,checks:Record<string,SourceCheck>){
 const validWeights=keys.reduce((n,k)=>n+d.weights[k],0)===100;
 const rows=d.options.map(o=>{
  const p=items.find(p=>p.id===o.id)!;
  const a=assess(p,profile,checks[o.id],costs[o.id]);
  const failures:string[]=[],unknowns:string[]=[];
  // Historical tuition, annual fees and assumed FX never establish this hard gate.
  if(profile.budgetEnabled){if(a.total===null)unknowns.push('全学制人民币自付费用未填完整');else if(a.total>profile.budget)failures.push('完整自填费用超过预算上限');}
  if(o.eligibility==='no')failures.push('申请资格不满足');else if(o.eligibility==='unknown')unknowns.push('目标届次申请资格未确认');
  if(o.constraints==='no')failures.push('其他硬约束不满足');else if(o.constraints==='unknown')unknowns.push('其他硬约束未确认');
  if(checks[o.id]?.changed||checks[o.id]?.status==='结构变化')unknowns.push('官方资料变化待复核');
  if(o.tolerable==='no')failures.push('无法承受最坏合理情景');else if(o.tolerable==='unknown'||!o.worst.trim())unknowns.push('最坏合理情景及承受能力未评估');
  if(!o.evidence.trim())unknowns.push('尚无判断依据与核验日期');
  if(o.reversibility==='unknown')unknowns.push('转向成本未评估');
  if(!o.opportunity.trim())unknowns.push('机会成本未评估');
  if(!o.best.trim()||!o.base.trim())unknowns.push('最好与基准情景未补齐');
  if(!o.assumption.trim())unknowns.push('会推翻判断的关键假设未填写');
  if(o.reversibility==='low'&&!o.mitigation.trim())unknowns.push('难撤回选择的风险应对未填写');
  const complete=keys.every(k=>d.weights[k]===0||o.scores[k]!==undefined);
  const score=validWeights&&complete?keys.reduce((n,k)=>n+(o.scores[k]??0)*d.weights[k]/100,0):null;
  return {p,o,total:a.total,failures,unknowns,score,gate:failures.length?'blocked':unknowns.length?'pending':'pass'};
 });
 const ranked=rows.filter(r=>r.gate==='pass'&&r.score!==null).sort((a,b)=>b.score!-a.score!);
 let sensitivity='尚未形成可比较结果';
 let leader:typeof rows[number]|undefined;
 const ready=rows.length>=2&&rows.every(r=>r.gate==='blocked'||(r.gate==='pass'&&r.score!==null))&&validWeights&&d.priorities.trim()&&d.hardConstraints.trim();
 if(ready&&ranked.length>=2){
  if(Math.abs(ranked[0].score!-ranked[1].score!)<0.05)sensitivity='接近并列，暂不区分优先级';
  else {
   leader=ranked[0];let flips=false;
   for(const key of keys){
    // Shift each weight by ten percentage points; proportionally rebalance others.
    for(const delta of [-10,10]){
     const original=d.weights[key],changed=original+delta;if(changed<0||changed>100||original===100)continue;
     const weights={...d.weights};for(const k of keys)weights[k]=k===key?changed:d.weights[k]*(100-changed)/(100-original);
     const scores=ranked.map(r=>({id:r.o.id,value:keys.reduce((n,k)=>n+(r.o.scores[k]??0)*weights[k]/100,0)})).sort((a,b)=>b.value-a.value);
     if(scores[0].id!==leader.o.id||Math.abs(scores[0].value-scores[1].value)<0.05)flips=true;
    }
   }
   sensitivity=ranked.some(r=>keys.some(k=>r.o.scores[k]===undefined))?'零权重维度未评分，无法完整检验权重变化；先补评分':flips?'脆弱：调整单项权重 ±10 个百分点会改变领先项目':'在单项权重 ±10 个百分点测试内稳定；未检验事实或评分变化';
  }
 }
 const conclusion=leader?`在你填写的约束、依据与评分成立时，优先继续核验「${leader.p.school} · ${leader.p.name}」。这表示准备优先级；不构成接受录取建议。`:ready&&ranked.length===1?'只有一个项目通过当前检查，尚无两个可行项目供比较；先补充现实备选。':'暂不推荐项目：先解决待核验约束、补齐有依据的评分，或重新比较接近并列的选项。';
 const pending=rows.find(r=>r.gate==='pending');
 const nextAction=d.nextAction.trim()||(pending?`先核验「${pending.p.school} · ${pending.p.name}」：${pending.unknowns[0]}。`:leader?`用一次小规模查证或试验检验关键假设：${leader.o.assumption}。`:!validWeights?'先把比较权重调整至 100%。':'先选出至少两个现实可行备选，再补齐评分与依据。');
 return {rows,validWeights,leader,sensitivity,conclusion,nextAction,confidence:leader?'低：依据主要来自自填信息，且未估计录取概率':'不足以判断'};
}
export function decisionReport(d:Decision,result:ReturnType<typeof evaluateDecision>,profile:Profile){
 const lines=['# 升学决策备忘录',`导出时间：${new Date().toISOString()}`,`决策：${d.question}`,`目标入学：${profile.year}；自己的决策期限：${d.deadline||'未填'}`,`目标：${d.priorities||'未填'}`,`硬约束：${d.hardConstraints||'未填'}`,`预算：${profile.budgetEnabled?`全学制自付上限 ¥${profile.budget}`:'未启用，不能据此认定可负担'}`,`暂不决定：${d.inaction}`,'',result.conclusion,`判断把握：${result.confidence}`,`敏感性：${result.sensitivity}`,'',`权重：${keys.map(k=>`${criteria[k]} ${d.weights[k]}%`).join('；')}`];
 for(const r of result.rows)lines.push('',`## ${r.p.school} · ${r.p.name}`,`状态（自填）：${{candidate:'候选机会',applied:'已申请',offer:'已收到录取通知'}[r.o.stage]}`,`费用：${r.total===null?'全学制费用未知':`¥${r.total}（自填人民币全学制）`}`,`检查：${[...r.failures,...r.unknowns].join('；')||'按自填信息通过'}`,`评分：${r.score===null?'未完成':r.score.toFixed(2)} / 10`,...keys.map(k=>`${criteria[k]}：${r.o.scores[k]??'未评'}`),`依据、类型及日期：${r.o.evidence}`,`机会成本：${r.o.opportunity}`,`可逆性：${r.o.reversibility}`,`最好 / 基准 / 最坏合理情景：${r.o.best} / ${r.o.base} / ${r.o.worst}`,`会推翻判断的关键假设：${r.o.assumption}`,`一年后后悔的早期信号：${r.o.warning}`,`应对办法：${r.o.mitigation}`,`项目资料核验日：${r.p.verified}（不等于 ${profile.year} 届已确认）`,`官方入口：${r.p.url}`);
 lines.push('',`下一步：${result.nextAction}`,`复盘日期：${d.reviewDate||'未填写'}`,'本报告是结构化自评，未调用 AI 或实时核验招生事实；权重与分数不代表录取概率。决策草稿与原有个人记录分别备份。');return lines.join('\n\n');
}
