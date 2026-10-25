import test from 'node:test';
import assert from 'node:assert/strict';
import {programs,defaultProfile} from '../lib/catalog.ts';
import {exportProgramCsv,csvCell,costSummary} from '../lib/program-export.ts';

test('CSV keeps reference billing period, currencies, source and unknown personal totals distinct',()=>{
 const p=programs.find(p=>p.id==='utokyo-master-economics');
 const csv=exportProgramCsv([p],defaultProfile,{});
 assert(csv.startsWith('\uFEFF'));
 assert(csv.includes('"535800","JPY","每年"'));
 assert(csv.includes('JPY 282000 / 全项目'));
 assert(csv.includes('"缺少：总学费、住宿生活费、其他费用"'));
 assert(csv.includes(p.details.fee.url));
 assert.equal(costSummary(p,defaultProfile).total,null);
});
test('whole-degree comparison uses only complete user amounts and confirmed aid, including zero',()=>{
 const p=programs[0];
 assert.equal(costSummary(p,defaultProfile,{tuition:100000,living:50000}).total,null);
 assert.deepEqual(costSummary(p,defaultProfile,{tuition:100000,living:50000}).missing,['其他费用']);
 assert.equal(costSummary(p,defaultProfile,{tuition:100000,living:50000,other:0,confirmedAid:10000}).total,140000);
 assert.equal(costSummary(p,defaultProfile,{tuition:0,living:0,other:0}).total,0);
 const summary=costSummary(p,{...defaultProfile,budgetEnabled:true,budget:100000},{tuition:100000,living:50000,other:0});
 assert.equal(summary.budget,'超出预算');
 assert(costSummary(p,defaultProfile,undefined,{changed:true}).changed);
});
test('CSV escapes formulas, quotes, commas and multiline notes without changing numeric cells',()=>{
 assert.equal(csvCell(' =SUM(A1:A2)'), '"\' =SUM(A1:A2)"');
 assert.equal(csvCell('\t=1+1'),'"\'\t=1+1"');
 assert.equal(csvCell('院校,"项目"\n备注'),'"院校,""项目""\n备注"');
 assert.equal(csvCell(0),'"0"');assert.equal(csvCell(null),'""');
 const p=programs[0],cost={tuition:10,living:20,other:0,confirmedAid:5,note:'=HYPERLINK("test")'};
 const csv=exportProgramCsv([p],defaultProfile,{[p.id]:cost});
 assert(csv.includes('"25","完整自填费用；非校方报价"'));
 assert(csv.includes('"\'=HYPERLINK(""test"")"'));
});
