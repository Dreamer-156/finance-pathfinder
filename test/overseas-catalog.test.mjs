import test from 'node:test';
import assert from 'node:assert/strict';
import {programs,rates,assess,defaultProfile} from '../lib/catalog.ts';
import {overseasPrograms} from '../lib/catalog-overseas.ts';

test('overseas expansion keeps unique projects with sourced, period-specific fees and funding conditions',()=>{
 assert(overseasPrograms.length>=40);
 assert.equal(new Set(programs.map(p=>p.id)).size,programs.length);
 for(const p of overseasPrograms){
  assert.notEqual(p.region,'内地',p.id);
  assert(['硕士','研究硕士','博士'].includes(p.degree),p.id);
  const fee=p.details.fee;
  assert(Number.isFinite(fee.amount)&&fee.amount>=0,p.id);
  assert(['每年','首年','全项目','每学期','每学分'].includes(fee.basis),p.id);
  assert(fee.year&&fee.note&&fee.url,p.id);
  assert([p.url,...p.references.map(r=>r.url)].includes(fee.url),p.id);
  assert(p.requirements.length>=2&&p.aidNote&&p.references.length>=1,p.id);
  assert(rates[fee.currency]>0,p.id);
  assert.equal(p.tuition,fee.amount,p.id+' budget lower bound must use the sourced billing period');
  assert.equal(p.currency,fee.currency,p.id);
  assert.equal(p.intake,null,p.id+' published references are not 2030 admissions');
 }
});

test('new awards never become confirmed personal funding; yen fees use an explicit planning rate',()=>{
 for(const p of overseasPrograms){assert.equal(assess(p,defaultProfile).total,null);assert.equal(assess(p,defaultProfile).strict,false);}
 const kyoto=programs.find(p=>p.id==='kyoto-ea-master');
 assert.equal(kyoto.details.fee.currency,'JPY');
 assert.equal(kyoto.details.fee.basis,'每年');
 assert.equal(kyoto.tuition,535800);
 assert.equal(kyoto.details.additionalFees[0].amount,282000);
 assert.equal(assess(kyoto,{...defaultProfile,budgetEnabled:true,budget:20000}).over,true);
 assert.equal(assess(kyoto,{...defaultProfile,budgetEnabled:true,budget:50000}).over,false);
});
