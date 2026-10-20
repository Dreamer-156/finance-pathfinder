import type {Program} from './catalog.ts';

export type DepartmentGroup={name:string;programs:Program[]};
export type SchoolGroup={name:string;regions:string[];count:number;departments:DepartmentGroup[]};

// Keep the input's route ranking: a school's best matching project determines
// its position, and projects retain their relative order within each department.
export function groupPrograms(items:Program[]):SchoolGroup[]{
 const schools=new Map<string,SchoolGroup>();
 for(const p of items){
  const [school,...parts]=p.school.split(/\s*·\s*/).map(part=>part.trim());
  const department=parts.join(' · ');
  let group=schools.get(school);
  if(!group){group={name:school,regions:[],count:0,departments:[]};schools.set(school,group);}
  group.count++;
  if(!group.regions.includes(p.region))group.regions.push(p.region);
  let unit=group.departments.find(d=>d.name===department);
  if(!unit){unit={name:department,programs:[]};group.departments.push(unit);}
  // A jointly labelled department stays a single group; never duplicate a project.
  unit.programs.push(p);
 }
 return [...schools.values()];
}
