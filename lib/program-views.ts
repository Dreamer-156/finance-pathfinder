import type {Program} from './catalog.ts';

export type DegreeGroup='硕士'|'博士';
export type View='masters'|'doctorates'|'saved'|'sources'|'profile';

export function programsForDegree(items:Program[],degree:DegreeGroup){
 return items.filter(p=>degree==='博士'?p.degree==='博士':['硕士','研究硕士'].includes(p.degree));
}

export function resolveProgramPage(hash:string):{view:View;degree:DegreeGroup}{
 const key=hash.replace(/^#/,'');
 if(key==='doctorates')return {view:'doctorates',degree:'博士'};
 if(key==='saved-doctorates')return {view:'saved',degree:'博士'};
 if(key==='sources-doctorates')return {view:'sources',degree:'博士'};
 if(key==='saved-masters')return {view:'saved',degree:'硕士'};
 if(key==='sources-masters')return {view:'sources',degree:'硕士'};
 if(key==='profile')return {view:'profile',degree:'硕士'};
 return {view:'masters',degree:'硕士'};
}

export function programPageHash(view:View,degree:DegreeGroup){
 if(view==='saved'||view==='sources')return `${view}-${degree==='博士'?'doctorates':'masters'}`;
 return view;
}
