import test from 'node:test';
import assert from 'node:assert/strict';
import {programs} from '../lib/catalog.ts';
import {matchesProgramQuery} from '../lib/program-search.ts';

test('search matches official school domains, full-width acronyms and multiple keywords',()=>{
 const lse=programs.find(p=>p.id==='lse-msc-economics');
 assert(lse);assert(matchesProgramQuery(lse,' ＬＳＥ  经济学 '));
 assert(!matchesProgramQuery(lse,'LSE 不存在的方向'));
 assert(matchesProgramQuery(lse,'   '));
});

test('search finds careers and research directions even when they are absent from project names',()=>{
 const p=programs.find(p=>p.id==='duke-ma-econ');
 assert(p);assert(!p.name.includes('咨询'));assert(matchesProgramQuery(p,'Duke 咨询'));
 const research={...p,details:{...p.details,research:['货币政策与信贷市场']}};
 assert(matchesProgramQuery(research,'货币政策'));
 assert(!matchesProgramQuery(p,'不存在的研究专题'));
});
