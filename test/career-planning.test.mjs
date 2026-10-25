import test from 'node:test';
import assert from 'node:assert/strict';
import {programs,defaultProfile} from '../lib/catalog.ts';
import {careerPaths,careerSources} from '../lib/career-catalog.ts';
import {newCareerPlan,newCareerNote,parseCareerPlan,toggleCareer,filterCareers,careerSkillGaps,relatedCareerPrograms,careerReport,careerNextAction} from '../lib/career-planning.ts';
test('career catalogue separates markets, business roles, institutions and sourced job families',()=>{
 assert(careerPaths.length>=68);assert.equal(new Set(careerPaths.map(c=>c.id)).size,careerPaths.length);
 for(const c of careerPaths){assert(c.markets.length&&c.sides.length&&c.institutions.length);assert(c.sources.length);for(const id of c.sources)assert(careerSources.some(s=>s.id===id&&s.url.startsWith('https://')));assert(c.trial.task&&c.trial.deliverable&&c.trial.review);}
 assert.equal(careerPaths.find(c=>c.id==='bank-corporate').sides[0],'银行业务');
 assert(careerPaths.find(c=>c.id==='quant-research').sides.includes('买方'));assert(careerPaths.find(c=>c.id==='quant-research').sides.includes('卖方'));
 assert(careerSources.find(s=>s.id==='development').kind==='受限入口');assert.equal(careerSources.find(s=>s.id==='bank').kind,'历史招聘示例');
});
const filters={query:'',market:'all',side:'all',institution:'all',stateOnly:false};
test('independent filters intersect; NFKC search works and state focus is a curated lens',()=>{
 assert(filterCareers({...filters,query:'ＰＥ'}).some(c=>c.id==='pe-vc'));
 const selected=filterCareers({...filters,market:'一级市场',side:'买方'});assert(selected.some(c=>c.id==='pe-vc'));assert(selected.every(c=>c.markets.includes('一级市场')&&c.sides.includes('买方')));
 assert.equal(filterCareers({...filters,market:'一级市场',query:'量化开发'}).length,0);
 const state=filterCareers({...filters,stateOnly:true});assert(state.length>0&&state.length<careerPaths.length);assert(state.some(c=>c.id==='state-investment'));
});
test('planning preserves notes, limits choices, and does not infer skill suitability from unknowns',()=>{
 let p=newCareerPlan();p=toggleCareer(p,'quant-research');p.primary='quant-research';p.notes['quant-research'].reason='试做后再判断';
 assert(careerSkillGaps(careerPaths.find(c=>c.id==='quant-research'),p.skills).every(g=>g.status==='待评估'));
 p=toggleCareer(p,'quant-research');assert.equal(p.primary,null);assert.equal(p.notes['quant-research'].reason,'试做后再判断');p=toggleCareer(p,'quant-research');assert.equal(p.notes['quant-research'].reason,'试做后再判断');
 p=toggleCareer(toggleCareer(p,'ib-equity'),'bank-corporate');assert.throws(()=>toggleCareer(p,'fintech'));assert.deepEqual(parseCareerPlan(JSON.stringify(p)),p);
 for(const bad of [{...p,primary:'missing'},{...p,selected:['fintech','fintech']},{...p,skills:{...p.skills,math:5}},{...p,notes:{missing:newCareerNote()}}])assert.throws(()=>parseCareerPlan(JSON.stringify(bad)));
 assert.throws(()=>parseCareerPlan(JSON.stringify({version:1,options:[]})));
});
test('degree mapping excludes directories, preserves saved precedence and never invents employer outcomes',()=>{
 const c=careerPaths.find(c=>c.id==='financial-engineering'),items=relatedCareerPrograms(c,programs,'硕士');assert(items.length>0);assert(items.every(p=>p.degree!=='博士'&&p.degree!=='硕博'));
 const saved=items.at(-1).id;assert.equal(relatedCareerPrograms(c,programs,'硕士',[saved])[0].id,saved);
 assert(relatedCareerPrograms(c,programs,'博士').every(p=>p.degree==='博士'));
 const quant=careerPaths.find(c=>c.id==='quant-research');
 const synthetic={...programs[0],id:'unrelated',field:'经济学',name:'普通环境经济学',english:'Environmental Economics',details:{careers:{paths:['风险管理'],basis:'培养定位推断',note:''}}};
 assert(!relatedCareerPrograms(quant,[synthetic],'硕士').length,'generic risk text must not imply quantitative research relevance');
 const fintech=careerPaths.find(c=>c.id==='fintech');assert(relatedCareerPrograms(fintech,programs,'硕士').some(p=>p.id==='pku-phbs-quant'));
});
test('next action follows evidence checkpoints and export preserves uncertainty and source limitations',()=>{
 const c=careerPaths[0];let p=toggleCareer(newCareerPlan(),c.id);
 assert.match(careerNextAction(c,p),/官方岗位/);p.notes[c.id].done=['explore'];assert.equal(careerNextAction(c,p),c.trial.task);
 p.notes[c.id].done=['explore','build'];assert.match(careerNextAction(c,p),/反馈/);
 const report=careerReport(p,defaultProfile);assert.match(report,/尚未|未知|待填写/);assert.match(report,/历史招聘/);assert.match(report,/不是招聘统一门槛/);assert.match(report,/https:\/\//);assert.match(report,/2030/);
});
