import {expandedPractice} from './career-expansion.ts';
import {careerPaths,careerSources} from './career-catalog.ts';
import {entrySources,pathEntries,schoolSignalsForPath,samplesForPath} from './career-entry.ts';
import {schoolEvidenceMeta} from './career-entry-extra.ts';
export const evidenceReviewedAt='2026-10-24';
export type EvidenceClaim={claim:string;source:string;limit:string};
export const routePractice:Record<string,EvidenceClaim>={...expandedPractice,
 'pe-vc':{claim:'前序研究应能支持项目分析与尽调；相关产业或金融经历是国新该岗位的优先项。',source:'crhc-invest',limit:'未规定必须先做投行或完成固定段数；PE/VC不同阶段的机会需分开核对。'},
 'ib-equity':{claim:'投行路径示例从实习与分析岗积累，工作涉及财务模型、尽调与交易材料。',source:'cfa-path',limit:'国际职业示例不是中国统一晋升表，MBA/CFA不是本站必经节点。'},
 'dcm':{claim:'债券承做实习样本涉及发行、融资方案与材料审核；有前序实习是优先项。',source:'cj-debt',limit:'2025历史岗位样本，不能据此保证留用或特殊远程安排。'},
 'sell-research':{claim:'研究训练应覆盖行业与公司研究、预测、估值偏差及有依据的建议。',source:'cfa-analyst-training',limit:'培养内容支持作品设计，不证明学完一门课就满足雇主要求。'},
 'buy-fundamental':{claim:'买方与卖方权益研究都需要行业公司研究与预测能力；作品应能解释判断。',source:'cfa-analyst-training',limit:'共享技能不等于可直接转岗；卖方、RA不是进入买方的唯一前序。'},
 'fixed-income':{claim:'信用研究实习考核涉及发行人跟踪、研究报告与风险提示。',source:'htam-2026',limit:'2026保险资管岗位样本；与2027宏观量化研究的1个月考核不可混用。'},
 'sales-trading':{claim:'机构销售实习快览强调客户、路演与关系维护，和交易执行的任务不同。',source:'kaiyuan-research',limit:'快览不是完整JD，不能将销售资格或排期当成交易岗要求。'},
 'bank-corporate':{claim:'银行校招业务发展与其他条线分列专业条件，先核对入口再决定实习。',source:'boc-2027',limit:'总行管培不保证最终进入对公授信，分行与子岗位另核。'},
 'bank-markets':{claim:'总行金融市场条线单独列专业范围；市场研究作品只能作为准备证据。',source:'boc-2027',limit:'旧届次资格不沿用未来；总行条件不外推分行或衍生品定价岗。'},
 'risk-compliance':{claim:'模型验证需要理解模型假设与业务情境，并在工作中积累判断。',source:'garp-model',limit:'受访者职业观点只支持模型方向，不替代法律合规岗位条件。'},
 'wealth':{claim:'财富业务需区分客户服务、产品和交易等职责，再核对实习任务。',source:'wealth',limit:'机构业务介绍没有实习学历或名单；渠道岗只是相邻样本。'},
 'state-investment':{claim:'国新投资实习样本偏好金融或产业经历，并要求在校硕博。',source:'crhc-invest',limit:'一家基金的条件不代表全部金融国企，不证明国有性质带来编制或稳定性。'},
 'development':{claim:'国开深圳分行将经济金融、产业投融和综合保障分列，本硕入口不同。',source:'cdb-shenzhen',limit:'2027届深圳短公告已截止，未披露项目研究分配；总公告接受本科不等于所有岗位接受。'},
 'quant-research':{claim:'WorldQuant内地研究实习接受相关本硕博，明确既往金融经验不是必需；编程和研究准备仍重要。',source:'worldquant-cn',limit:'只对该北京／上海届次样本成立，不代表其他量化团队或美国PhD岗位。'},
 'quant-dev':{claim:'交易系统校招重视Linux、并发、数据结构、算法和网络等工程能力。',source:'wizard-dev',limit:'宽德该子岗另列FPGA要求，不外推所有量化开发；社招5年经验不适用于校招。'},
 'financial-engineering':{claim:'衍生品交易助理样本涉及定价模型、统计分析与编程，适合用于区分模型工作与基本面投研。',source:'everbright-derivatives',limit:'2023旧附件只支持历史职责与条件，不证明当下可投或通用门槛。'},
 'fintech':{claim:'银联数据与技术开发岗位分别列技能和经历偏好，先选择职能再找金融场景实习。',source:'unionpay',limit:'开发／项目／竞赛偏好不是必须有金融实习；产品岗位不能直接照搬。'},
};
export function evidenceSource(id:string){const e=entrySources.find(s=>s.id===id);if(e)return {id:e.id,title:e.title,url:e.url,kind:e.access,period:e.period,locator:e.locator??e.title,note:e.note};const c=careerSources.find(s=>s.id===id);if(!c)throw new Error('引用来源不存在：'+id);return {...c,period:'职业／业务资料；核验日见路线',locator:c.title};}
export function evidenceSummary(id:string){
 const samples=samplesForPath(id),direct=samples.filter(s=>s.relation==='直接岗位样本'),outcomes=schoolSignalsForPath(id).filter(s=>schoolEvidenceMeta[s.id]?.strength==='项目就业结果');
 const gaps=['未发现该岗位公开的统一校名白名单；项目就业结果不能估计个人录用概率。','阶段顺序、作品与转向条件为规划建议；没有逐条晋升或转岗成功率证据。'];
 if(!direct.some(s=>s.kind!=='校招'&&s.region==='中国内地'))gaps.push('暂无中国内地直接实习要求样本；相邻岗位或校招要求不可代替。');
 if(!direct.some(s=>s.kind!=='实习'))gaps.push('暂无直接正式校招条件样本；不得用实习要求代替。');
 if(id==='financial-engineering')gaps.push('直接衍生品实习样本为2023旧资料，当前学历、时间与岗位余缺须重核。');
 if(id==='wealth')gaps.push('目前招聘样本主要是相邻渠道／业务发展，缺少直接投顾岗位要求。');
 const sourceIds=[...new Set([...careerPaths.find(c=>c.id===id)!.sources,...(id==='development'?['cdb-general']:[]),routePractice[id].source,...samples.map(s=>s.source),...schoolSignalsForPath(id).map(s=>s.source)])];
 return {directIntern:direct.filter(s=>s.kind!=='校招').length,directEntry:direct.filter(s=>s.kind!=='实习').length,adjacent:samples.length-direct.length,outcomes:outcomes.length,sourceIds,gaps};
}
export function stageClaims(id:string,stage:string):EvidenceClaim[]{
 if(stage==='education')return schoolSignalsForPath(id).filter(s=>schoolEvidenceMeta[s.id]?.strength==='项目就业结果').map(s=>({claim:s.meaning,source:s.source,limit:s.scope}));
 if(stage==='target-internship'||stage==='entry')return samplesForPath(id).filter(s=>stage==='entry'?s.kind!=='实习':s.kind!=='校招').map(s=>({claim:`${s.employer} · ${s.role}：${s.degree}；${s.priorExperience}`,source:s.source,limit:`${s.relation}；${s.status}。${entrySources.find(e=>e.id===s.source)!.note}`}));
 if(stage==='early-career'||stage==='development'){const path=careerPaths.find(p=>p.id===id)!;return [routePractice[id],...path.sources.filter(id=>careerSources.find(s=>s.id===id)?.kind!=='受限入口').map(source=>({claim:'用于理解该方向的工作职责与能力积累。',source,limit:'不能由职责说明推导固定晋升年限、必然转岗或管理职位；本阶段顺序为规划建议。'}))];}
 return [routePractice[id]];
}
export const excludedEvidence=[
 {title:'首创证券2026校招转发',url:'https://career.cuhk.edu.cn/job/view/id/466512',reason:'标题及岗位写2026，通用条件却写2025应届；届次冲突未解决，不用于资格判断。'},
 {title:'国投证券模型开发·国聘动态页',url:'https://www.iguopin.com/job/detail?active=jobfair&active_id=204258815011455930&id=205024085506261918',reason:'检索摘要含条件，打开仅见JavaScript壳；不把摘要当作已核验完整JD。'},
 {title:'HKUST MFin校友页面',url:'https://mfin.hkust.edu.hk/student-n-alumni/testimonial',reason:'主页与校友页对同一案例职称口径不同，且正文读取超时；暂不作为岗位级target school证据。'},
];
export function evidenceReport(id:string){const s=evidenceSummary(id);return ['### 来源审查与证据边界',`核验日：${evidenceReviewedAt}；直接实习／考核样本${s.directIntern}，直接校招／考核样本${s.directEntry}，相邻样本${s.adjacent}（实习考核可同时属于两个阶段）；${s.outcomes}份项目去向材料。`,'规划依据：'+routePractice[id].claim+' '+routePractice[id].limit,...s.sourceIds.map(id=>{const r=evidenceSource(id);return `来源：${r.title}；${r.kind}；${r.period}；定位：${r.locator}；${r.url}；边界：${r.note}`;}),'未解决缺口：'+s.gaps.join('；'),'实习选择核对：确认实际任务、反馈导师、可展示产出、每周到岗与学业冲突、是否有留用考核；未写的条件先问雇主，不推算。'].join('\n\n');}
