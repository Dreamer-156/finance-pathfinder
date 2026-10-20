import {expandedPrograms} from './catalog-expanded.ts';
import {phdPrograms} from './catalog-phd.ts';
import {overseasPrograms} from './catalog-overseas.ts';
import {enrichProgram} from './program-details.ts';
export type FeeFact={amount:number;currency:string;basis:'每年'|'首年'|'全项目'|'每学期'|'每学分';year:string;note:string;url:string;waived?:boolean};
export type ProgramDetails={fee?:FeeFact;additionalFees?:FeeFact[];tuitionPolicy?:string;fundingTerm?:string;stipend?:string;exam?:string;materials?:string[];research?:string[];careers?:{paths:string[];basis:'官网披露'|'培养定位推断';note:string;url?:string}};
export type Profile={year:number;budget:number;budgetEnabled:boolean;route:string;degree:string;region:string;field:string;gpa:string;ielts:string;math:string;research:string;recommendation:string};
export const defaultProfile:Profile={year:2030,budget:200000,budgetEnabled:false,route:'employment',degree:'all',region:'all',field:'all',gpa:'',ielts:'',math:'unknown',research:'unknown',recommendation:'unknown'};
export type Program={id:string;school:string;name:string;english:string;region:string;degree:string;field:string;duration:string;route:string;funding:string;fundingType:'package'|'competitive'|'assistantship'|'unknown';tuition:number|null;currency:string;tuitionNote:string;aidNote:string;deadline:string|null;intake:number|null;deadlineNote:string;requirements:string[];ielts?:number;reason:string;url:string;extra?:string;verified:string;accent:string;phdEntry?:'bachelor'|'master'|'verify';entryNote?:string;admissionNote?:string;references?:{label:string;url:string}[];details?:ProgramDetails};
export const phdEntryLabels={bachelor:'可本科申请',master:'需硕士 / 研究生训练',verify:'入学路径待核验'};
const base={verified:'2026-10-04',deadline:null,intake:null,deadlineNote:'目标年份尚未发布；以当年招生简章为准',tuition:null,currency:'CNY',tuitionNote:'学费待核验',aidNote:'未计入任何个人已获奖助',funding:'金额待核验',fundingType:'unknown' as const,accent:'navy'};
const rawPrograms:Program[]=[
 {...base,id:'tsinghua-mim',school:'清华大学 · 经管学院',name:'管理硕士 MiM',english:'Master in Management',region:'内地',degree:'硕士',field:'管理与商业分析',duration:'以当年培养方案为准',route:'domestic',funding:'奖助须另行确认',tuitionNote:'现行项目页未列明确学费，不沿用旧金额',requirements:['本校推免资格及成绩排名','两封教师推荐信','托福 100 / 雅思 7 以上优先考虑（不是硬性最低线）'],reason:'与你此前的国内推免主线一致；适合咨询、企业分析与金融相关就业。属于管理大类。',url:'https://masters.sem.tsinghua.edu.cn/glssxm11.htm',accent:'purple'},
 {...base,id:'tsinghua-mf',school:'清华大学 · 经管学院',name:'金融硕士',english:'Master of Finance',region:'内地',degree:'硕士',field:'金融',duration:'以当年简章为准',route:'domestic',funding:'竞争性奖学金',fundingType:'competitive',requirements:['推免资格或当年允许的招生方式','数学、统计与金融基础','成绩排名和英语能力待核验'],reason:'金融就业方向相关；需要先核实学费、生活费和实际奖助，不能直接按预算可行处理。',url:'https://masters.sem.tsinghua.edu.cn/jrss1/xfyjiangxu.htm',accent:'purple'},
 {...base,id:'saif-mf',school:'上海交通大学 · 高金',name:'金融硕士 MF / FinTech',english:'Master of Finance',region:'内地',degree:'硕士',field:'金融',duration:'2 年',route:'domestic',tuition:158000,tuitionNote:'26 级及以前国内学生总学费；未来届次待发布',funding:'竞争性奖学金',fundingType:'competitive',requirements:['2026 级国内招生仅通过推免；未来规则待发布','数理基础、英语与综合面试'],reason:'金融及金融科技相关性高；当前参考学费为 15.8 万元，还需加上完整生活费并核实实际奖助。',url:'https://mf.saif.sjtu.edu.cn/feesandfinancing',extra:'https://mf.saif.sjtu.edu.cn/faq',accent:'red'},
 {...base,id:'pku-nsd',school:'北京大学 · 国家发展研究院',name:'经济学硕博招生监测',english:'Economics Graduate Admissions',region:'内地',degree:'硕博',field:'经济学',duration:'具体项目待当年简章',route:'domestic',requirements:['按当年招生目录确认学位与资格','推免资格、成绩或申请考核要求'],reason:'与你的国发院经济学背景直接相关。目前是招生入口监测，尚未接入具体项目费用和当届名额。',url:'https://nsd.pku.edu.cn/',accent:'red'},
 {...base,id:'cuhk-mphil',school:'香港中文大学',name:'经济学 MPhil',english:'MPhil in Economics',region:'港澳',degree:'研究硕士',field:'经济学',duration:'2 年',route:'research',currency:'HKD',tuition:99000,tuitionNote:'每年 HK$49,500（暂定），2 年合计推算',funding:'录取后配助教岗位',fundingType:'assistantship',aidNote:'官方称全日制成功申请者获助教岗位，近年约 HK$19,100/月。不是你个人已获资助；本地生学费减免不默认适用于内地生。',deadline:'2026-12-01T23:59:00+08:00',intake:2027,deadlineNote:'2027 入学申请截止；推荐信另行核对',ielts:6.5,requirements:['相关本科学位，平均成绩至少 B 或同等','数学与统计基础；两封学术推荐','GRE 建议提交，未提交可能处于劣势'],reason:'研究训练与经济学本科衔接较好；有明确助教政策，仍须核对住房、发放时间和首期资金。',url:'https://admission.econ.cuhk.edu.hk/pg/mphil-economics/',accent:'gold'},
 {...base,id:'cuhk-msc',school:'香港中文大学',name:'经济学 MSc',english:'MSc in Economics',region:'港澳',degree:'硕士',field:'经济学',duration:'以项目页为准',route:'employment',currency:'HKD',tuition:358000,tuitionNote:'2027/28 全项目学费，待大学批准；分两期缴纳',ielts:6.5,deadline:'2026-10-12T23:59:00+08:00',intake:2027,deadlineNote:'第一轮 2026-10-12，后续轮次须打开官网核对；截止时刻未明确',funding:'竞争性入学奖学金',fundingType:'competitive',requirements:['成绩与英文要求按当年页面','国发院特别通道须核验届次与名额'],reason:'与你的经济学背景相关；历史定向渠道仅作为线索，实际资助和费用尚未确认。',url:'https://admission.econ.cuhk.edu.hk/pg/master-economics/',accent:'gold'},
 {...base,id:'hkust-phd',school:'香港科技大学',name:'金融学 PhD',english:'PhD in Finance',region:'港澳',degree:'博士',field:'金融',duration:'资助政策参考 5 年',route:'research',funding:'附学业进展条件的资助',fundingType:'package',aidNote:'系官网预计向成绩合格的录取学生提供覆盖学费、生活等的 5 年资助；具体条款以资助信为准。',requirements:['明确金融研究兴趣','扎实数理、计量基础与研究经历','确认直接 PhD 或 MPhil 衔接路径'],reason:'金融研究与资助方向值得跟踪；读博需要先用 RA 和论文经历验证研究兴趣。',url:'https://fina.hkust.edu.hk/programs/phd/financial-aid',extra:'https://prog-crs.hkust.edu.hk/pgprog/2025-26/mphil-phd-fina',accent:'blue'},
 {...base,id:'stanford-phd',school:'斯坦福大学 · GSB',name:'金融学 PhD',english:'PhD · Finance',region:'美国',degree:'博士',field:'金融',duration:'通常 5–6 年',route:'research',funding:'全额资助政策',fundingType:'package',aidNote:'学费、健康费用与生活津贴；2026–27 新生津贴 US$59,500/年。前 5 年资助附学业进展条件，第 6 年延长须符合规定。',requirements:['强研究经历与学术推荐信','高水平数学、计量与研究匹配','GRE / GMAT 及英语按申请页核验'],reason:'研究路线长期候选；资助政策明确不代表容易录取，也不替代研究适配判断。',url:'https://www.gsb.stanford.edu/programs/phd/financial-aid',extra:'https://www.gsb.stanford.edu/programs/phd/admission',accent:'red'},
 {...base,id:'baruch-mfe',school:'纽约市立大学 · Baruch',name:'金融工程硕士 MFE',english:'Master of Financial Engineering',region:'美国',degree:'硕士',field:'量化与金融工程',duration:'3 学期',route:'employment',currency:'USD',tuition:45090,tuitionNote:'当前项目主页国际生全项目学费；旧 FAQ 金额不同，采用主页并保留差异提示',funding:'入学资助不保证',requirements:['微积分、线代、概率和编程基础','定量背景与英语；核验当年考试要求'],deadline:'2026-11-01T23:59:00-05:00',intake:2027,deadlineNote:'第一轮 2026-11-01；第二轮 2026-12-01；时刻未明确，展示日期仅供准备参考',reason:'量化金融相关；不因国发院历史定向渠道而默认满足预算。',url:'https://mfe.baruch.cuny.edu/',accent:'blue'},
 {...base,id:'oxford-mfe',school:'牛津大学 · Saïd',name:'金融经济学 MSc',english:'MSc Financial Economics',region:'英国',degree:'硕士',field:'金融',duration:'9 个月',route:'employment',currency:'GBP',tuition:66690,tuitionNote:'2027 入学项目费用；不含生活费',funding:'Clarendon 等竞争性奖学金',fundingType:'competitive',aidNote:'Clarendon 可覆盖学费与生活补助，但竞争性强，不能提前计入已获资助。押金 £10,000，通常录取信后 30 天内缴纳。',deadline:'2026-10-21T23:59:00+01:00',intake:2027,deadlineNote:'第一轮；第二轮 2027-01-06，第三轮 2027-03-03；奖学金须核对对应轮次',requirements:['成绩、定量能力和 GRE / GMAT 按项目页','三封推荐信；视频评估另有截止日'],reason:'金融与经济学结合较强；只有实际获得足够资助，才可能进入预算范围。',url:'https://www.sbs.ox.ac.uk/programmes/degrees/msc-financial-economics',extra:'https://www.ox.ac.uk/admissions/graduate/fees-and-funding/funding/clarendon/applicants',accent:'navy'},
 {...base,id:'bse-finance',school:'巴塞罗那经济学院 BSE',name:'金融经济学硕士',english:'Master’s · Financial Economics',region:'欧洲',degree:'硕士',field:'金融',duration:'1 年（9 月至次年 7 月）',route:'employment',currency:'EUR',tuition:18500,tuitionNote:'当前项目页学费 €18,500，不含生活费用；目标年份待发布',ielts:6.5,funding:'竞争性学费减免 / 少量全奖',fundingType:'competitive',aidNote:'可有 25%–100% 学费减免，少量奖学金含补助。一般 1 月 15 日前完整申请可考虑全部资助；不等同已获奖。',requirements:['本科成绩、英文证明、两封推荐','GRE 须区分普通项目与 PhD Track'],reason:'欧洲金融方向备选；需要同时核实学费、生活费与奖学金金额。',url:'https://bse.eu/masters-degrees/economics-finance/financial-economics',extra:'https://bse.eu/masters-degrees/admissions',accent:'blue'},
 {...base,id:'mannheim-econ',school:'曼海姆大学',name:'经济学 MSc',english:'MSc Economics',region:'欧洲',degree:'硕士',field:'经济学',duration:'以当年课程目录为准',route:'research',currency:'EUR',tuitionNote:'非欧盟国际生 €1,500/学期，另收学期费；总额须结合实际学制',funding:'竞争性奖学金',fundingType:'competitive',requirements:['经济学及数学课程学分按招生规则','英文证明；适用时核验 APS'],reason:'经济学与金融研究相关；较低学费仍须加上全学制生活费。',url:'https://www.vwl.uni-mannheim.de/en/academics/msc-economics/faq/',extra:'https://www.uni-mannheim.de/en/academics/during-your-studies/organizing-your-studies/fees/tuition-fees-for-international-students/',accent:'navy'},
 {...base,id:'nus-finance',phdEntry:'bachelor',entryNote:'当前官方要求入学前持认可院校至少本科学位并有优秀成绩；无需先有硕士，但须有金融研究兴趣与研究准备。',school:'新加坡国立大学',name:'金融学 PhD',english:'PhD in Finance',region:'新加坡',degree:'博士',field:'金融',duration:'以当年培养与资助信为准',route:'research',funding:'项目称提供全额奖学金',fundingType:'package',aidNote:'金融系申请页称覆盖学费和生活费；商学院资金页对年限、进展与第五年支持另有说明，须合并核对。',deadline:'2026-12-15T23:59:00+08:00',intake:2027,deadlineNote:'2027 年 8 月入学；时刻未明确，展示日期供准备参考',requirements:['认可院校本科学位与优秀成绩','研究计划、两封教授推荐和研究经历','英语证明；GMAT/GRE 当前可选，未来待核验'],reason:'亚洲金融研究与资助路线备选；研究适配比名校标签更重要。',url:'https://bschool.nus.edu.sg/finance/phd/phd-how-to-apply/',extra:'https://bschool.nus.edu.sg/phd/financial-support/',accent:'gold'},
 ...expandedPrograms,
 ...phdPrograms,
 ...overseasPrograms
];
export const programs:Program[]=rawPrograms.map(enrichProgram);
export type SourceCheck={id:string;status:string;checkedAt:string;lastSuccess?:string;hash?:string;changed?:boolean;message:string;tuition?:number;deadline?:string;intake?:number;url:string};
export type Cost={tuition?:number;living?:number;other?:number;confirmedAid?:number;note?:string};
export const rates:Record<string,number>={CNY:1,HKD:.92,USD:7.2,GBP:9.5,EUR:8,SGD:5.5,CAD:5.3,AUD:4.8,CHF:8.5,SEK:.7,JPY:.05};
export function assess(p:Program,profile:Profile,check?:SourceCheck,cost?:Cost){
 const known=cost?.tuition!=null&&cost?.living!=null&&cost?.other!=null;
 const total=known?Math.max(0,cost!.tuition!+cost!.living!+cost!.other!-(cost?.confirmedAid??0)):null;
 const additional=(p.details?.additionalFees??[]).filter(f=>f.basis==='全项目'&&!f.waived).reduce((sum,f)=>sum+f.amount*(rates[f.currency]??1),0);
 // Audited period-specific facts take precedence over cached extraction of older cohorts.
 const tuition=p.details?.fee?p.tuition:(check?.tuition??p.tuition);
 const lower=(tuition??0)*(rates[p.currency]??1)+additional-(cost?.confirmedAid??0);
 const blocked=check?.changed||check?.status==='结构变化';
 let budget=total!==null?(total>profile.budget?'超出预算':'预算内（自填）'):lower>profile.budget?'学费已超预算':'总成本待确认';
 if(!profile.budgetEnabled)budget=total!==null?'费用已算清（自填）':'总成本待确认';
 if(blocked&&!known)budget='数据变化待复核';
 const gaps:string[]=[];
 if(!profile.gpa)gaps.push('成绩 / 排名未填写');
 if(p.region!=='内地'&&!profile.ielts)gaps.push('英语成绩未填写');
 if(p.ielts&&profile.ielts&&Number(profile.ielts)<p.ielts)gaps.push('IELTS 低于当前最低要求');
 if(p.route==='research'&&profile.research!=='strong')gaps.push('研究经历需评估');
 if((p.route==='research'||p.field==='量化与金融工程')&&profile.math!=='advanced')gaps.push('数理课程需核对');
 if(p.route==='domestic'&&profile.recommendation!=='yes')gaps.push('推免资格待确认');
 const primary=profile.route==='employment'?p.degree==='硕士'&&p.route!=='research':p.route===profile.route;
 const rank=primary?0:profile.route==='domestic'&&p.fundingType==='package'?1:2;
 return {total,budget,gaps,rank,priority:primary?'路线优先':p.fundingType==='package'?'有资助备选':'条件候选',over:profile.budgetEnabled&&(lower>profile.budget&&total===null||total!==null&&total>profile.budget),strict:total!==null&&(!profile.budgetEnabled||total<=profile.budget)&&!blocked};
}



