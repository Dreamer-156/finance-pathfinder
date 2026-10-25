import test from 'node:test';
import assert from 'node:assert/strict';
import {careerPaths} from '../lib/career-catalog.ts';
import {stageKeys,newJourney,journeyStages,journeyProgress,completeJourneyStage,changeJourneyStudy,careerBridges} from '../lib/career-journeys.ts';
import {newCareerPlan,parseCareerPlan,toggleCareer,careerReport} from '../lib/career-planning.ts';
import {defaultProfile} from '../lib/catalog.ts';
const research=careerPaths.find(c=>c.id==='sell-research');
test('all catalogue careers have a connected and role-specific preparation-to-development sequence',()=>{
 for(const c of careerPaths){const stages=journeyStages(c);assert.deepEqual(stages.map(s=>s.id),stageKeys);assert(stages.every(s=>s.action&&s.artifact&&s.gate&&s.fallback&&s.prerequisite));for(const b of careerBridges[c.id])assert(careerPaths.some(p=>p.id===b.to));}
 assert.notEqual(journeyStages(research)[4].title,journeyStages(careerPaths.find(c=>c.id==='quant-dev'))[4].title);
 assert.match(journeyStages(research)[2].action,/课程研究|RA/);
});
test('evidence and predecessor gates prevent jumping; undo invalidates downstream completion without discarding notes',()=>{
 let r=newJourney();assert.throws(()=>completeJourneyStage(research,r,'foundation',true));
 r.stages.portfolio={complete:false,evidence:'先有作品也不能直接跳过',due:''};assert.throws(()=>completeJourneyStage(research,r,'portfolio',true));
 r.stages.foundation={complete:false,evidence:'基础案例与反馈',due:''};r=completeJourneyStage(research,r,'foundation',true);r=completeJourneyStage(research,r,'portfolio',true);assert.equal(journeyProgress(research,r).active.id,'first-experience');
 r=completeJourneyStage(research,r,'foundation',false);assert.equal(r.stages.portfolio.complete,false);assert.equal(r.stages.portfolio.evidence,'先有作品也不能直接跳过');assert.equal(journeyProgress(research,r).active.id,'foundation');
});
test('later starting point requires explicit prior experience and never marks earlier stages as completed',()=>{
 let r={...newJourney(),start:'target-internship'};r.stages['target-internship']={evidence:'具体实习任务与复盘',due:'',complete:false};assert.equal(journeyProgress(research,r).baselineReady,false);assert.throws(()=>completeJourneyStage(research,r,'target-internship',true));
 r.startEvidence='已有研究作品与第一段经历的自述证据';r=completeJourneyStage(research,r,'target-internship',true);assert.equal(journeyProgress(research,r).active.id,'entry');assert(!r.stages.foundation);
});
test('education choice changes actual route content and reopens dependent stages',()=>{
 const undecided=journeyStages(research,'undecided'),masters=journeyStages(research,'masters'),direct=journeyStages(research,'direct');assert.notEqual(undecided[3].action,masters[3].action);assert.notEqual(masters[3].title,direct[3].title);
 let r={...newJourney(),study:'direct',stages:{education:{evidence:'核验本科入口',due:'',complete:true},entry:{evidence:'已做申请核验',due:'',complete:true}}};
 r=changeJourneyStudy(research,r,'masters');assert.equal(r.stages.education.complete,false);assert.equal(r.stages.entry.complete,false);assert.equal(r.stages.entry.evidence,'已做申请核验');
});
test('legacy career backups migrate without changing notes; journeys roundtrip and invalid stages reject',()=>{
 const old=newCareerPlan();delete old.journeys;const migrated=parseCareerPlan(JSON.stringify(old));assert.deepEqual(migrated.journeys,{});assert.deepEqual(migrated.notes,old.notes);
 let p=toggleCareer(migrated,'sell-research');p.journeys['sell-research']=newJourney();assert.deepEqual(parseCareerPlan(JSON.stringify(p)),p);assert.match(careerReport(p,defaultProfile),/连续路线/);
 const bad=structuredClone(p);bad.journeys['sell-research'].stages.missing={evidence:'',due:'',complete:false};assert.throws(()=>parseCareerPlan(JSON.stringify(bad)));
});

test('unselected route records survive backup, selection and removal independently for each career',()=>{
 let p=newCareerPlan();p.journeys['sell-research']={...newJourney(),start:'target-internship',startEvidence:'已有研究样本',study:'masters'};p.journeys['ib-equity']={...newJourney(),study:'direct'};
 p=parseCareerPlan(JSON.stringify(p));assert.deepEqual(p.selected,[]);assert.equal(p.journeys['sell-research'].start,'target-internship');assert.equal(p.journeys['ib-equity'].study,'direct');
 p=toggleCareer(p,'sell-research');p=toggleCareer(p,'sell-research');assert.equal(p.journeys['sell-research'].study,'masters');assert.equal(p.journeys['ib-equity'].study,'direct');
});
