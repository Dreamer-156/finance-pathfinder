import type {Program,ProgramDetails,SourceCheck} from './catalog.ts';
import {financialFacts} from './financial-facts.ts';
import {aidFacts} from './aid-facts.ts';

const pkuFee='https://admission.pku.edu.cn/docs/20251010134140836566.pdf';
const pkuAid='https://grs.pku.edu.cn/jzgz/dtxx1/tzgg1/5910ab8ed3f343c99a5603fe29a60deb.htm';
const hkuFee='https://gradsch.hku.hk/prospective_students/admitted_students';
const hkuPgs='https://gradsch.hku.hk/prospective_students/fees_scholarships_and_financial_support/postgraduate_scholarships';
const cuhkFee='https://www.gs.cuhk.edu.hk/programmes/business-administration/mphil-phd-finance';
const cuhkFunding='https://grad.bschool.cuhk.edu.hk/programmes/';
type Update={details:ProgramDetails;patch?:Partial<Program>;sources?:{label:string;url:string}[]};
const facts:Record<string,Update>={
 'pku-nsd-phd':{details:{fee:{amount:10000,currency:'CNY',basis:'每年',year:'2026 校本部',note:'科学学位全日制博士；总额随 4–5 年学制变化，住宿另计。',url:pkuFee},fundingTerm:'评定岗位后按校内规则发放',stipend:'金额依获评岗位与院系，未确认个人额度',research:['金融与发展','宏观经济','应用经济学']},sources:[{label:'校本部博士学费标准',url:pkuFee},{label:'2026/27 博士岗位奖学金发放办法',url:pkuAid}]},
 'pku-gsm-phd':{details:{fee:{amount:10000,currency:'CNY',basis:'每年',year:'2026 校本部',note:'全日制科学学位博士参考；2030 及实际学制待核。',url:pkuFee},fundingTerm:'岗位奖学金按评定与学业规则',stipend:'不预设个人奖助额度',research:['公司金融','资产定价','金融市场']},sources:[{label:'校本部博士学费标准',url:pkuFee},{label:'2026/27 博士岗位奖学金发放办法',url:pkuAid}]},
 'pku-econ-phd':{details:{fee:{amount:10000,currency:'CNY',basis:'每年',year:'2026 校本部',note:'科学学位全日制博士参考，不套用金融专硕收费。',url:pkuFee},fundingTerm:'岗位奖学金须经评定',stipend:'实际岗位与额度待确认',research:['金融学','金融经济学']},sources:[{label:'校本部博士学费标准',url:pkuFee},{label:'2026/27 博士岗位奖学金发放办法',url:pkuAid}]},
 'pku-phbs-phd':{details:{fundingTerm:'深圳研究生院适用政策待核',research:['西方经济学','金融经济学相关研究'],materials:['本科成绩单与推免资格','中英文简历、个人陈述','学术推荐及有效英语证明']},patch:{tuitionNote:'深圳汇丰学费待核验；校本部 ¥10,000/年标准不直接套用深圳项目。'}},
 'saif-phd-finance':{details:{tuitionPolicy:'2025 直博简章称提供全额奖学金',fundingTerm:'历史简章有每月津贴；当前额度与年限待确认',stipend:'每月津贴 + 可另获 TA/RA 报酬；金额待核',research:['公司金融','资产定价','金融中介','金融计量'],materials:['推免资格或申请考核学历材料','成绩单与研究计划','推荐、英语及当年专业测试材料']},patch:{entryNote:'现行 FAQ 仅招本科直博和申请考核博士，不招硕博连读。国内本科直博须推免资格；普通申请考核一般需硕士。',aidNote:'2025 直博简章称全额奖学金、每月津贴及按工作量支付的助教助研报酬。属于历史政策，2027/2030 实际额度、覆盖项目和年限须以当届通知确认。',funding:'全额奖学金与月津贴（历史政策）',fundingType:'competitive'},sources:[{label:'现行申请路径与 FAQ',url:'https://phd.saif.sjtu.edu.cn/faq'},{label:'2025 直博奖助参考',url:'https://saif.sjtu.edu.cn/show-204-349.html'}]},
 'hku-phd-finance':{details:{fee:{amount:49500,currency:'HKD',basis:'每年',year:'2027/28',note:'非本地全日制研究生参考；HKPFS/HKU-PS 获奖者的学费豁免另核。',url:hkuFee},fundingTerm:'PGS 通常覆盖规范学制；受资格和资金可用性约束',stipend:'2026/27 基础 PGS HKD 19,135/月；确认候选资格后 HKD 19,655/月',research:['资产定价','公司金融','中国金融市场'],exam:'英语、GRE / GMAT 要求与豁免按经管学院当届规则',materials:['成绩单与学历文件','学术推荐、研究陈述','英语和考试成绩']},sources:[{label:'HKU 学费及豁免政策',url:hkuFee},{label:'HKU PGS 津贴及资格',url:hkuPgs}]},
 'hku-phd-econ':{details:{fee:{amount:49500,currency:'HKD',basis:'每年',year:'2027/28',note:'非本地全日制参考；研究硕士背景影响 3 / 4 年学制。',url:hkuFee},fundingTerm:'PGS 按规范学制、资格与资金情况',stipend:'2026/27 PGS 基础 HKD 19,135/月；候选资格确认后 HKD 19,655/月',research:['金融经济学','宏观与货币','应用计量']},sources:[{label:'HKU 学费及豁免政策',url:hkuFee},{label:'HKU PGS 津贴及资格',url:hkuPgs}]},
 'cuhk-phd-finance':{details:{fee:{amount:49500,currency:'HKD',basis:'每年',year:'2027/28',note:'常规学费；本地生减免不默认适用于内地申请者。',url:cuhkFee},fundingTerm:'PGS 与博士候选资格进展挂钩',stipend:'额度按当届资助通知，不套用经济学系数额',research:['行为金融','公司金融','金融市场与机构'],exam:'商学院及研究生院的英语、GRE / GMAT 规则另核'},patch:{funding:'PGS / HKPFS（附资格条件）',fundingType:'competitive',aidNote:'商学院设 PGS；前 24 个月未完成博士候选资格要求时，第 25 月起暂停，完成后按规定恢复。HKPFS 为竞争性；政府本地生学费豁免不默认适用于内地生。'},sources:[{label:'2027/28 金融博士学费',url:cuhkFee},{label:'商学院 PGS 与候选资格条件',url:cuhkFunding}]},
 'cuhk-phd-econ':{details:{fundingTerm:'助教政策明确；实际期限以资助信为准',research:['微观与宏观经济学','计量经济学','金融经济学'],materials:['成绩单、推荐信','数学与经济学训练材料','研究陈述与英语证明']}},
 'hkust-phd':{details:{tuitionPolicy:'合格录取生资助预计覆盖学费',fundingTerm:'5 年；须维持合格学业进展',research:['公司金融','资产定价','金融市场'],stipend:'具体津贴以项目资助信确认'}},
 'nus-finance':{details:{tuitionPolicy:'金融系称全额奖学金覆盖学费',fundingTerm:'商学院年限、第五年支持与进展条款另核',research:['资产定价','公司金融','家庭金融','宏观金融'],exam:'GMAT/GRE 当前可选；须有英语证明',materials:['CV、研究目的与研究计划','两封教授推荐信','全部大学成绩单与英语成绩']}},
 'ntu-phd-finance':{details:{fundingTerm:'NTU Research Scholarship 最长 4 年',research:['金融学研究'],stipend:'额度随国籍与候选资格按 RSS 规则；不作已获奖助'}},
 'stanford-phd':{details:{tuitionPolicy:'录取生学费由资助包覆盖',fundingTerm:'前 5 年附学业条件；第 6 年延长须审核',stipend:'2026/27 新生参考 USD 59,500/年',research:['资产定价','公司金融','金融经济学']}},
 'wharton-phd-finance':{details:{tuitionPolicy:'录取博士 fellowship 覆盖学费',fundingTerm:'年限、续领和医保按资助信确认',research:['资产定价','公司金融','金融机构','宏观金融'],exam:'考试与英语按当届方向要求',materials:['成绩单与学历文件','研究目的陈述、推荐信','GRE / GMAT 和适用英语成绩']}},
 'wharton-phd-applied-econ':{details:{tuitionPolicy:'博士 fellowship 覆盖学费',fundingTerm:'5 年政策；续领按学业要求',research:['风险与保险','城市与房地产','行为经济学']}},
 'chicago-phd-finance':{details:{tuitionPolicy:'录取博士获学费资助',fundingTerm:'5 年保证期；第 6 年支持按条件',research:['资产定价','公司金融','金融中介'],exam:'GRE 优先，GMAT 可接受；英语按豁免规定',materials:['至少两封学术推荐','研究目的陈述与成绩单','GRE / GMAT、CV；写作样本可选'],careers:{paths:['高校 / 商学院教研','量化研究','金融机构研究'],basis:'官网披露',note:'官方近年去向含学术教研和金融机构量化、风险研究；个别历史去向不代表个人就业结果。',url:'https://www.chicagobooth.edu/phd/career-outcomes'}}},
 'chicago-phd-financial-econ':{details:{fundingTerm:'由经济学所属部门或 Booth 按安排管理',research:['金融经济学','资产定价','宏观金融'],exam:'联合项目必须 GRE；需两部门录取',materials:['本科及经济学数理训练材料','推荐、研究陈述、GRE','同时满足两部门资格要求']}},
 'mit-sloan-phd-finance':{details:{tuitionPolicy:'5 年资助包覆盖学费',fundingTerm:'5 年；须保持良好学业状态',stipend:'现行页面 USD 4,806/月；15 学期中 12 期 fellowship、3 期 TA/RA',research:['公司金融','资产定价','理论与实证金融'],careers:{paths:['高校 / 商学院教研','金融学研究'],basis:'官网披露',note:'培养定位以学术研究为主；可直接查官方近年学术去向。',url:'https://mitsloan.mit.edu/programs/phd/program-overview/recent-academic-placements'}},patch:{funding:'5 年学费、医保与生活资助',fundingType:'package',aidNote:'MIT Sloan 保证良好学业状态学生 5 年学费、医疗及 fellowship / TA/RA 支持。当前月度参考 USD 4,806；学位平均约 6 年，不能假定资助覆盖全部实际学习年限。',duration:'平均约 6 年；资助保证期为 5 年'},sources:[{label:'MIT Sloan 学费与资助细则',url:'https://mitsloan.mit.edu/programs/phd/funding-information'},{label:'MIT Sloan 学制与 FAQ',url:'https://mitsloan.mit.edu/programs/phd/resources-and-faqs'}]},
 'hbs-phd-business-econ-finance':{details:{tuitionPolicy:'录取博士 fellowship 覆盖学费',fundingTerm:'5 年；第 6 年延长另核',research:['金融经济学','公司金融','应用经济学'],stipend:'生活津贴及单人医疗费用；当届金额按官方通知'}},
 'nyu-stern-phd-finance':{details:{tuitionPolicy:'录取生学费由资助包覆盖',fundingTerm:'5 年；满意学业进展，每年驻校 11 个月',research:['资产定价','公司金融','金融中介','宏观金融']}},
 'columbia-phd-finance':{details:{tuitionPolicy:'FAQ 称博士前 4 年全额资助',fundingTerm:'FAQ 明确前 4 年；后续年限待资助信核对',research:['资产定价','连续时间金融','银行与市场微观结构'],exam:'Finance 可提交 GRE 或 GMAT；英语豁免按授课语言规则',materials:['不超过 1,000 词的 Finance 研究目的陈述','大学成绩单、推荐信','GRE / GMAT 及适用 TOEFL / IELTS']},patch:{funding:'前 4 年全额资助（FAQ 口径）',fundingType:'package',aidNote:'CBS 招生 FAQ 表示博士前 4 年 full funding；不能推断第 5/6 年保证。实际覆盖项、金额和续领必须以资助信确认。',phdEntry:'bachelor',entryNote:'官方培养规则允许仅本科学位进入博士的学生；完整学历等同性和招生要求按当届招生规则。'},sources:[{label:'CBS 资助年限 FAQ',url:'https://academics.business.columbia.edu/admissions/phd/frequently-asked-questions'},{label:'CBS 申请材料与考试',url:'https://academics.business.columbia.edu/admissions/phd/application-requirements'},{label:'CBS 本科入学培养规则',url:'https://academics.business.columbia.edu/phd/academics/degree-requirements'}]},
 'berkeley-haas-phd-finance':{details:{tuitionPolicy:'博士项目为全额资助',fundingTerm:'5 年制项目；2030 招生待发布',research:['金融中介','公司金融','家庭金融']}},
 'lse-phd-finance':{details:{fee:{amount:24400,currency:'GBP',basis:'首年',year:'2026/27 国际生',note:'后续年学费可能上涨；不是 5–6 年总额，生活费另计。',url:'https://www.lse.ac.uk/study-at-lse/graduate/mresphd-finance'},fundingTerm:'LSE PhD Studentships / ESRC / 系奖，竞争性',research:['资产定价','公司金融','金融计量'],exam:'GRE / GMAT 必需，GRE 优先',materials:['定量相关硕士成绩','研究目的、学术推荐','GRE / GMAT 和英语证明']},patch:{aidNote:'可申请 LSE PhD Studentships、ESRC 与系级奖学金，需核验国际生资格、评选与资助期限；不能默认覆盖全部 5–6 年。'}},
 'lbs-phd-finance':{details:{tuitionPolicy:'全部录取博士学费全免',fundingTerm:'最长 5 年；满意学业进展',research:['金融学研究'],stipend:'免税年度津贴，金额按当届通知'}},
 'oxford-dphil-finance':{details:{tuitionPolicy:'多数名额有全额资助；须确认获奖',fundingTerm:'实际资助年限与覆盖项按个人资助信',research:['金融经济学','公司金融','资产定价'],exam:'GMAT / GRE；英语按申请要求',materials:['三封学术推荐','CV 与研究方向陈述','成绩单、考试与英语材料']}},
 'oxford-dphil-econ':{details:{fundingTerm:'Clarendon 等竞争性资助，资格和年限另核',research:['经济学理论','应用经济学','金融经济学'],materials:['严格经济学硕士课程与成绩','学术推荐、研究计划','所需 GRE 和英语材料']}},
 'cambridge-phd-finance':{details:{fundingTerm:'研究硕士与博士阶段须分别核对',research:['公司金融','资本市场','金融经济学']}},
 'hec-phd-finance':{details:{tuitionPolicy:'全部博士学费减免；第 3 年起另有注册费',fundingTerm:'最长 5 年生活奖学金与学费减免',stipend:'现行官网 EUR 26,500/年；注册费和个人额外支出另计',research:['资产定价','公司金融','金融中介'],exam:'GMAT / GRE 与英语按当届要求',materials:['最多 3 页研究提案','成绩单与学历材料','两位推荐人、研究目的与考试成绩']},patch:{phdEntry:'bachelor',entryNote:'HEC 当前明确接受成绩优秀的本科或硕士申请；无需强制先有硕士。',funding:'5 年生活奖学金与学费减免',fundingType:'package',duration:'5 年培养路线',aidNote:'HEC 全部博士获最长 5 年学费减免与生活奖学金，现行参考 EUR 26,500/年；第 3 年起须向联合 Doctoral School 支付注册费。不是所有费用自动为零。'},sources:[{label:'HEC 学费减免与生活奖学金',url:'https://www.hec.edu/en/phd-program/financing'},{label:'HEC 学历与申请材料',url:'https://www.hec.edu/en/phd-program/admissions'}]},
 'insead-phd-finance':{details:{tuitionPolicy:'录取生 fellowship 含学费减免',fundingTerm:'前 5 年，每年续领附满意学业进展',research:['金融研究'],stipend:'生活津贴、医保与研究会议预算；金额按校区通知'}},
 'bocconi-phd-econ-finance':{details:{fundingTerm:'竞争性 fellowship；年度进阶决定续领',stipend:'2026/27 参考：首年 EUR 27,000；第 2–4 年 EUR 23,000，涉及 INPS 扣缴',research:['经济学','金融学','会计研究'],careers:{paths:['高校 / 学术研究','央行 / 国际组织','政府经济研究'],basis:'官网披露',note:'官网明确学术职业主线及央行、政府、国际组织等去向；研究轨与个人技能影响具体岗位。',url:'https://www.unibocconi.it/en/programs/phd/phd-economics-and-finance'}},patch:{funding:'竞争性 fellowship / 部分学费减免',fundingType:'competitive',duration:'现行 4 年制参考',aidNote:'2026/27 参考 fellowship 首年 EUR 27,000，第 2–4 年 EUR 23,000；按排名和名额评定，续领需满足年度要求，涉及 INPS 社保缴款。存在自费名额，不默认所有录取生获奖。'},sources:[{label:'Bocconi 博士 fellowship 与续领规则',url:'https://www.unibocconi.it/en/programs/phd/admission-phd-programs/financial-matters'}]},
 'sse-phd-finance':{details:{tuitionPolicy:'博士录取生获全程资助；具体学费条款另核',fundingTerm:'5 年培养，全程资助附学业进展条件',stipend:'2027 入学现行页面：入学时 SEK 26,000/月，免税；后续水平可变化',research:['金融学研究'],exam:'现行申请页要求 GRE General，无最低申请分数'},patch:{funding:'录取生全程资助政策',fundingType:'package',duration:'5 年',aidNote:'SSE 现行官网保证录取博士全程资助，入学参考免税奖学金 SEK 26,000/月；后续年金额可变化，续领附学业进展条件。'},sources:[{label:'SSE 博士资助与学制',url:'https://www.hhs.se/education/phd/finance/'}]},
 'ubc-phd-finance':{details:{tuitionPolicy:'资助另覆盖学费与费用',fundingTerm:'5 年保证；第 6 年不自动保证',stipend:'2024/25 历史参考 CAD 40,000/年（前 4 年）；第 5 年 CAD 30,000，当前额度待确认',research:['金融契约','资产定价','公司金融']},sources:[{label:'UBC 保证资助及学制说明',url:'https://org-www.sauder.ubc.ca/programs/phd/phd-business-administration/admission-finance/letter-to-applicants'}]},
 'toronto-phd-finance':{details:{fee:{amount:6330,currency:'CAD',basis:'每年',year:'2026/27',note:'学术学费；另列附加费 CAD 2,292.39 与单人 UHIP CAD 862.43。',url:'https://rotman.utoronto.ca/programs/phd-program/financial-information/'},tuitionPolicy:'第 1–5 年 tuition scholarship 覆盖学术学费',fundingTerm:'第 1–5 年，第 6 年起不保证',stipend:'首年 CAD 41,200；第 2–4 年 CAD 34,300，另加学费；第 5 年依 job market 条件',research:['风险管理','公司治理','资产管理']},patch:{funding:'5 年津贴 + 学术学费资助',fundingType:'package',aidNote:'Rotman 合格全日制博士第 1–5 年获最低资助包：首年 CAD 41,200 + 学费，第 2–4 年 CAD 34,300 + 学费，第 5 年依学术 job market 状态区分金额，第 6 年起不保证。附加费、保险和 TA/RA 工作要求须另核。'},sources:[{label:'Rotman 学费、津贴与保证期',url:'https://rotman.utoronto.ca/programs/phd-program/financial-information/'},{label:'Rotman TA/RA 与考试要求',url:'https://rotman.utoronto.ca/programs/phd-program/faqs/'}]},
 'melbourne-doctoral-finance':{details:{fundingTerm:'MCom 与 PhD 两阶段分别核对覆盖期',research:['资产定价','公司金融','市场微观结构'],stipend:'竞争性学费减免及年度津贴；按获奖通知，不自动扣减成本'}},
 'baruch-mfe':{details:{careers:{paths:['量化建模 / 研究','风险管理','结构化金融 / 交易'],basis:'官网披露',note:'官方 Careers 页面列出的历史岗位类型；就业统计另列年份、样本，不能换算个人就业概率。',url:'https://mfe.baruch.cuny.edu/careers/'},exam:'当前 GRE/GMAT 不再要求；申请者需 Quant Background Assessment'}},
 'pku-gsm-ba':{details:{careers:{paths:['商业 / 数据分析','金融数据分析','咨询 / 企业策略'],basis:'培养定位推断',note:'按商业分析方向的培养定位推断，未核验该方向独立就业统计。'}}},
 'pku-econ-insurance':{details:{careers:{paths:['保险 / 风险管理','精算与风险分析','保险行业研究'],basis:'培养定位推断',note:'精算岗位通常还需相关考试与数理训练；并非完成学位即具备资格。'}}},
 'pku-econ-tax':{details:{careers:{paths:['税务咨询','企业税务 / 财务','财政税收研究'],basis:'培养定位推断',note:'按税务专业培养方向推断，执业及招聘资格需分别核对。'}}}
};

export const careerGroups={academic:'学术与教研',quant:'量化与风控',markets:'投研与融资',policy:'经济与政策研究',business:'咨询与商业分析'};
export function careerProfile(p:Program):NonNullable<ProgramDetails['careers']>{
 if(p.details?.careers)return p.details.careers;
 const research=p.degree==='博士'||p.degree==='研究硕士'||p.route==='research';
 let paths:string[];
 if(p.degree==='博士')paths=p.field==='经济学'?['高校 / 学术研究','经济与政策研究','金融机构研究']:['高校 / 商学院教研','金融机构研究','量化研究（需编程）'];
 else if(research)paths=['博士 / RA 衔接','经济与金融研究','政策 / 数据分析'];
 else if(p.field==='量化与金融工程')paths=['量化研究 / 策略','金融风险管理','衍生品定价'];
 else if(p.field==='经济学')paths=['经济 / 行业研究','咨询 / 数据分析','政策与机构研究'];
 else if(p.field==='管理与商业分析')paths=['咨询 / 商业分析','企业策略 / 财务','金融机构业务'];
 else paths=['投研 / 资产管理','投行 / 企业融资','银行 / 风险管理'];
 return {paths,basis:'培养定位推断',note:'按学位类型、课程方向与培养定位推断；未核验本项目独立就业统计，具体岗位还受实习、技能、签证与招聘要求影响。'};
}
export function matchesCareer(p:Program,group:string){
 if(group==='all')return true;
 const text=careerProfile(p).paths.join(' ');
 const patterns:Record<string,RegExp>={academic:/高校|学术|教研|博士|RA/,quant:/量化|风险|衍生品|精算/,markets:/投研|资产|融资|投行|交易|金融机构研究/,policy:/经济|政策|央行|政府|国际组织|行业研究/,business:/咨询|商业|企业|财务|税务/};
 return patterns[group]?.test(text)??false;
}
export function enrichProgram(p:Program):Program{
 const f=facts[p.id],money=financialFacts[p.id],aid=aidFacts[p.id];if(!f&&!money&&!aid)return p;
 const refs=[...(p.references??[]),...(f?.sources??[]),...(money?.sources??[]),...(aid?.sources??[])];
 return {...p,...f?.patch,...money?.patch,...aid?.patch,details:{...p.details,...f?.details,...money?.details,...aid?.details},references:refs.filter((r,i)=>refs.findIndex(x=>x.url===r.url)===i)};
}
export function feePresentation(p:Program,check?:SourceCheck){
 const fee=p.details?.fee;
 if(fee)return {value:`${fee.currency} ${fee.amount.toLocaleString()} / ${fee.basis}${fee.waived?'（获资助后）':''}${(p.details?.additionalFees??[]).map(f=>` + ${f.currency} ${f.amount.toLocaleString()} / ${f.basis}`).join('')}`,context:[`${fee.year} · ${fee.note}`,...(p.details?.additionalFees??[]).map(f=>`${f.year} · ${f.note}`)].join(' '),url:fee.url,policy:p.details?.tuitionPolicy};
 if(p.tuition!=null)return {value:`${p.currency} ${(check?.tuition??p.tuition).toLocaleString()} / 全项目${/推算|估算/.test(p.tuitionNote)?'（估算）':''}`,context:p.tuitionNote,url:p.url,policy:p.details?.tuitionPolicy};
 if(p.details?.tuitionPolicy)return {value:'见学费资助政策',context:p.details.tuitionPolicy,url:p.references?.find(r=>/资助|学费|fellowship/.test(r.label))?.url??p.url,policy:p.details.tuitionPolicy};
 return {value:p.id==='pku-nsd'?'招生目录入口':'官方收费说明',context:p.tuitionNote,url:p.url,policy:undefined};
}
