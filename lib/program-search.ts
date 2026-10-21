import type {Program} from './catalog.ts';
import {careerProfile} from './program-details.ts';

function normalize(value:string){return value.normalize('NFKC').toLocaleLowerCase().trim();}
export function matchesProgramQuery(program:Program,query:string){
 const terms=normalize(query).split(/\s+/).filter(Boolean);
 if(!terms.length)return true;
 let domain='';try{domain=new URL(program.url).hostname;}catch{}
 const text=normalize([
  program.school,program.name,program.english,program.field,program.region,program.degree,
  program.id.replace(/[-_]/g,' '),domain,...careerProfile(program).paths,
  ...(program.details?.research??[]),...program.requirements,
 ].join(' '));
 return terms.every(term=>text.includes(term));
}
