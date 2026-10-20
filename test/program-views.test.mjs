import test from 'node:test';
import assert from 'node:assert/strict';
import {programs} from '../lib/catalog.ts';
import {programsForDegree,resolveProgramPage,programPageHash} from '../lib/program-views.ts';

test('degree sections cover concrete programmes without mixing degrees or directory entries',()=>{
 const masters=programsForDegree(programs,'硕士'),doctors=programsForDegree(programs,'博士');
 assert(masters.length>=52);assert(doctors.length>=34);
 assert.equal(masters.length+doctors.length,programs.filter(p=>p.id!=='pku-nsd').length);
 assert(masters.some(p=>p.degree==='研究硕士'));
 assert(masters.every(p=>p.degree==='硕士'||p.degree==='研究硕士'));
 assert(doctors.every(p=>p.degree==='博士'));
 assert(!masters.some(p=>doctors.some(d=>d.id===p.id)));
 assert(![...masters,...doctors].some(p=>p.id==='pku-nsd'));
});

test('default navigation opens masters and URLs restore degree-specific saved and source pages',()=>{
 assert.deepEqual(resolveProgramPage(''),{view:'masters',degree:'硕士'});
 for(const degree of ['硕士','博士']){
  for(const view of [degree==='硕士'?'masters':'doctorates','saved','sources']){
   assert.deepEqual(resolveProgramPage('#'+programPageHash(view,degree)),{view,degree});
  }
 }
 assert.deepEqual(resolveProgramPage('#unknown'),{view:'masters',degree:'硕士'});
});
