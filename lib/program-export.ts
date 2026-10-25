import {assess,type Program,type Profile,type Cost,type SourceCheck} from './catalog.ts';
import {careerProfile} from './program-details.ts';

export function costSummary(p:Program,profile:Profile,cost?:Cost,check?:SourceCheck){
 const result=assess(p,profile,check,cost);
 const missing=([['tuition','总学费'],['living','住宿生活费'],['other','其他费用']] as const).filter(([key])=>cost?.[key]==null).map(([,label])=>label);
 return {total:result.total,missing,budget:result.budget,changed:!!check?.changed||check?.status==='结构变化'};
}
export function csvCell(value:unknown){
 let text=value==null?'':String(value);
 // Keep user notes and imported text from being interpreted as spreadsheet formulas.
 if(/^[\s\uFEFF]*[=+@-]/u.test(text)||/^[\t\r\n]/.test(text))text="'"+text;
 return '"'+text.replaceAll('"','""')+'"';
}
export function exportProgramCsv(items:Program[],profile:Profile,costs:Record<string,Cost>,checks:Record<string,SourceCheck>={}){
 const headings=['目标入学年份','院校','院系','项目','英文名称','学位','地区','专业','学制','官方参考学费金额','币种','计费周期','费用适用年份','参考收费说明','其他官方收费说明','资助政策','资助条件','主要就业方向','就业方向依据','自填全学制学费_人民币','自填住宿生活费_人民币','自填其他费用_人民币','已确认奖助_人民币','自填自付总额_人民币','费用完整性','预算状态','费用备注','人工核验日期','自动来源状态','官方入口','官方费用依据'];
 const rows=items.map(p=>{
  const [school,...departments]=p.school.split(/\s*·\s*/);const fee=p.details?.fee,cost=costs[p.id],summary=costSummary(p,profile,cost,checks[p.id]),career=careerProfile(p);
  return [profile.year,school,departments.join(' · '),p.name,p.english,p.degree,p.region,p.field,p.duration,fee?.amount??p.tuition,fee?.currency??p.currency,fee?.basis??'',fee?.year??'',(fee?.waived?'附资助条件：':'')+(fee?.note??p.tuitionNote),(p.details?.additionalFees??[]).map(f=>`${f.currency} ${f.amount} / ${f.basis}（${f.year}；${f.note}）`).join('；'),p.funding,p.aidNote,career.paths.join(' / '),career.basis,cost?.tuition,cost?.living,cost?.other,cost?.confirmedAid,summary.total,summary.missing.length?'缺少：'+summary.missing.join('、'):'完整自填费用；非校方报价',summary.budget,cost?.note??'',p.verified,checks[p.id]?.status??'尚未自动检查',p.url,fee?.url??p.url];
 });
 return '\uFEFF'+[headings,...rows].map(row=>row.map(csvCell).join(',')).join('\r\n')+'\r\n';
}
