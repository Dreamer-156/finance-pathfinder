import test from 'node:test';
import assert from 'node:assert/strict';
import {programs,defaultProfile} from '../lib/catalog.ts';
import {newDecision,newOption,evaluateDecision,parseDecision,decisionReport} from '../lib/decision-advisor.ts';
const ids=['cuhk-mphil','oxford-mfe'];
function fixture(){const d=newDecision();d.priorities='控制费用与就业适配';d.hardConstraints='全学制预算20万元';d.options=ids.map((id,i)=>({...newOption(id),eligibility:'yes',constraints:'yes',best:'学到适用技能',base:'按计划准备',worst:'未录取但仍可继续当前准备',opportunity:'少一次短期实习',assumption:'研究和就业方向适配',tolerable:'yes',reversibility:'high',evidence:'测试用自填依据，不代表实际资格',scores:{career:8-i,research:8-i,cost:8-i,options:8-i}}));return d;}
const profile={...defaultProfile,budgetEnabled:true};
const costs=Object.fromEntries(ids.map(id=>[id,{tuition:50000,living:50000,other:10000,confirmedAid:0}]));
test('high scores cannot override a failed hard budget, eligibility or worst-case tolerance',()=>{
 for(const patch of [{eligibility:'no'},{constraints:'no'},{tolerable:'no'}]){const d=fixture();Object.assign(d.options[0],patch);const r=evaluateDecision(d,programs,profile,costs,{});assert.equal(r.rows[0].gate,'blocked');assert.equal(r.leader,undefined);}
 const r=evaluateDecision(fixture(),programs,profile,{...costs,[ids[0]]:{tuition:300000,living:50000,other:0}},{});assert.equal(r.rows[0].gate,'blocked');assert.equal(r.leader,undefined);
});
test('unknown costs and changed sources prevent recommendations despite known annual tuition or funding policy',()=>{
 for(const [c,checks] of [[{},{}],[costs,{[ids[0]]:{changed:true}}]]){const r=evaluateDecision(fixture(),programs,profile,c,checks);assert.equal(r.rows[0].gate,'pending');assert.equal(r.leader,undefined);}
});
test('only complete ratings and weights summing to 100 yield a conditional comparison',()=>{
 let d=fixture();assert.equal(evaluateDecision(d,programs,profile,costs,{}).leader.o.id,ids[0]);
 d.weights.career=40;assert.equal(evaluateDecision(d,programs,profile,costs,{}).rows[0].score,null);
 d=fixture();delete d.options[0].scores.research;assert.equal(evaluateDecision(d,programs,profile,costs,{}).leader,undefined);
 d=fixture();d.options[1].scores={...d.options[0].scores};assert.equal(evaluateDecision(d,programs,profile,costs,{}).leader,undefined);
});
test('sensitivity flags a preference reversal under a plausible weight shift',()=>{
 const d=fixture();d.options[0].scores={career:10,research:6,cost:6,options:6};d.options[1].scores={career:6,research:7,cost:7,options:7};const r=evaluateDecision(d,programs,profile,costs,{});assert.equal(r.leader.o.id,ids[0]);assert.match(r.sensitivity,/脆弱/);
});
test('records validate across reload and reject unknown projects, duplicates and nonfinite scores',()=>{
 const d=fixture();assert.deepEqual(parseDecision(JSON.stringify(d),programs),d);
 for(const bad of [{...d,options:[d.options[0],d.options[0]]},{...d,options:[{...d.options[0],id:'missing'}]},{...d,options:[{...d.options[0],scores:{career:null}}]}])assert.throws(()=>parseDecision(JSON.stringify(bad),programs));
 const report=decisionReport(d,evaluateDecision(d,programs,profile,costs,{}),profile);assert.match(report,/候选机会/);assert.match(report,/不构成接受录取建议/);assert.match(report,/https:\/\//);
});
