import test from 'node:test';
import assert from 'node:assert/strict';
import {programs,assess,defaultProfile} from '../lib/catalog.ts';
import {schoolName,schoolChoices,sortProgramRows} from '../lib/program-browse.ts';
import {groupPrograms} from '../lib/program-groups.ts';

test('school choices aggregate departments and count only supplied degree projects',()=>{
 const items=programs.filter(p=>p.school.startsWith('中国人民大学')&&p.degree==='硕士');
 assert.equal(schoolName(items[0]),'中国人民大学');
 assert.deepEqual(schoolChoices(items),[['中国人民大学','中国人民大学 · 3 项']]);
 assert.deepEqual(schoolChoices([]),[]);
});
test('whole-degree cost sorting never substitutes annual, currency or partial fees for unknown totals',()=>{
 const items=programs.filter(p=>['cornell-mps-aem','bu-ms-finance','utokyo-master-economics','ucl-msc-finance'].includes(p.id));
 const costs={
  'cornell-mps-aem':{tuition:300000,living:100000,other:10000,confirmedAid:150000},
  'bu-ms-finance':{tuition:200000,living:100000,other:0},
  'utokyo-master-economics':{tuition:10000},
 };
 const rows=items.map(p=>({p,a:assess(p,defaultProfile,undefined,costs[p.id])}));
 const original=rows.map(r=>r.p.id);
 const sorted=sortProgramRows(rows,'cost');
 assert.deepEqual(sorted.slice(0,2).map(r=>r.p.id),['cornell-mps-aem','bu-ms-finance']);
 assert(sorted.slice(2).every(r=>r.a.total===null));
 assert.deepEqual(rows.map(r=>r.p.id),original,'sorting must not mutate source order');
 const grouped=groupPrograms(sorted.map(r=>r.p));
 assert.equal(grouped.flatMap(g=>g.departments.flatMap(d=>d.programs)).length,items.length);
});
test('reference date sorting uses manual verification, not a successful source request',()=>{
 const p=programs[0];
 const rows=[{p:{...p,id:'old',verified:'2025-12-01'},a:assess(p,defaultProfile)},{p:{...p,id:'new',verified:'2026-10-22'},a:assess(p,defaultProfile)}];
 assert.deepEqual(sortProgramRows(rows,'verified').map(r=>r.p.id),['new','old']);
});
