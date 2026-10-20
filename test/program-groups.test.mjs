import test from 'node:test';
import assert from 'node:assert/strict';
import {programs} from '../lib/catalog.ts';
import {programsForDegree} from '../lib/program-views.ts';
import {groupPrograms} from '../lib/program-groups.ts';

test('school aggregation preserves every filtered project exactly once in each degree section',()=>{
 for(const degree of ['硕士','博士']){
  const items=programsForDegree(programs,degree),groups=groupPrograms(items);
  const flattened=groups.flatMap(s=>s.departments.flatMap(d=>d.programs));
  assert.equal(flattened.length,items.length);
  assert.deepEqual(flattened.map(p=>p.id).sort(),items.map(p=>p.id).sort());
  assert.equal(new Set(flattened.map(p=>p.id)).size,items.length);
  assert.equal(new Set(groups.map(g=>g.name)).size,groups.length);
  for(const group of groups)assert.equal(group.count,group.departments.reduce((sum,d)=>sum+d.programs.length,0));
 }
});

test('interleaved schools and PKU departments become adjacent without losing route priority',()=>{
 const masters=programsForDegree(programs,'硕士');
 const gsm=masters.filter(p=>p.school==='北京大学 · 光华管理学院');
 const econ=masters.find(p=>p.school==='北京大学 · 经济学院');
 const thu=masters.find(p=>p.school.startsWith('清华大学'));
 const groups=groupPrograms([gsm[1],thu,econ,gsm[0]]);
 assert.deepEqual(groups.map(g=>g.name),['北京大学','清华大学']);
 assert.deepEqual(groups[0].departments.map(d=>d.name),['光华管理学院','经济学院']);
 assert.deepEqual(groups[0].departments[0].programs.map(p=>p.id),[gsm[1].id,gsm[0].id]);
 assert.equal(groups[0].count,3);
 const filtered=groupPrograms([econ]);
 assert.equal(filtered.length,1);assert.equal(filtered[0].count,1);
 assert.deepEqual(groupPrograms([]),[]);
});

test('school-only and named departments share a university; joint department labels are not duplicated',()=>{
 const hku=groupPrograms(programs.filter(p=>p.school.split(' · ')[0]==='香港大学'));
 assert.equal(hku.length,1);
 assert(hku[0].departments.some(d=>d.name===''));
 assert(hku[0].departments.some(d=>d.name==='经管学院'));
 const joint=programs.find(p=>p.school==='芝加哥大学 · Booth / 经济学系');
 const grouped=groupPrograms([joint]);
 assert.equal(grouped[0].count,1);
 assert.equal(grouped[0].departments.length,1);
 assert.equal(grouped[0].departments[0].name,'Booth / 经济学系');
});
