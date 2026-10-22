import test from 'node:test';
import assert from 'node:assert/strict';
import {programs,rates,assess,defaultProfile} from '../lib/catalog.ts';
import {octoberExpansionPrograms as added} from '../lib/catalog-expansion-20261022.ts';
import {groupPrograms} from '../lib/program-groups.ts';

test('October expansion includes sourced fees, eligible entry routes and careers for every project',()=>{
 assert.equal(added.length,44);
 assert.equal(new Set(programs.map(p=>p.id)).size,programs.length);
 for(const p of added){
  assert(programs.some(x=>x.id===p.id),p.id);
  const f=p.details.fee;
  assert(Number.isFinite(f.amount)&&f.amount>0,p.id);
  assert(['每年','首年','全项目','每学期','每学分'].includes(f.basis),p.id);
  assert(f.year&&f.note&&new URL(f.url).protocol==='https:',p.id);
  assert.equal(p.tuition,f.amount,p.id);
  assert.equal(p.currency,f.currency,p.id);
  assert(rates[f.currency]>0,p.id);
  assert(p.requirements.length>=2&&p.aidNote&&p.details.careers.paths.length>=2,p.id);
  if(p.degree==='博士')assert(['bachelor','master'].includes(p.phdEntry)&&p.entryNote,p.id);
  assert.equal(p.intake,null,p.id);
  assert.equal(assess(p,defaultProfile).total,null,p.id+' awards are not confirmed personal funding');
 }
});

test('multiple departments and degrees stay in one school group without dropping projects',()=>{
 const grouped=groupPrograms(added);
 assert.equal(grouped.length,26);
 assert.equal(grouped.flatMap(s=>s.departments.flatMap(d=>d.programs)).length,added.length);
 assert.equal(grouped.find(s=>s.name==='康奈尔大学').count,3);
 assert.equal(grouped.find(s=>s.name==='中国人民大学').count,3);
});

test('different fee categories and scholarship nationality restrictions stay explicit',()=>{
 const get=id=>added.find(p=>p.id===id);
 assert.equal(get('utokyo-master-economics').tuition,535800);
 assert.equal(get('utokyo-phd-economics').tuition,520800);
 assert.equal(get('utokyo-phd-economics').phdEntry,'master');
 assert.match(get('hkbu-msc-applied-economics').aidNote,/排除中国内地/);
 assert.equal(get('polyu-phd-accounting-finance').tuition,99000);
 assert.match(get('polyu-phd-accounting-finance').details.tuitionPolicy,/49,500/);
 assert.match(get('hitotsubashi-master-economics').requirements.join(' '),/不能仅靠英语/);
 assert.equal(get('nankai-mf').details.fee.year,'2027级');
});
