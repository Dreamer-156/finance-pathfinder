import {z} from 'zod';
import {programs} from './catalog.ts';
const profileSchema=z.object({year:z.number().int().min(2026).max(2040),budget:z.number().finite().min(0).max(10000000),budgetEnabled:z.boolean().default(false),route:z.enum(['domestic','employment','research']),degree:z.string().max(40),region:z.string().max(40),field:z.string().max(40),gpa:z.string().max(200),ielts:z.string().max(10).refine(v=>v===''||(Number.isFinite(Number(v))&&Number(v)>=0&&Number(v)<=9)),math:z.enum(['unknown','core','advanced']),research:z.enum(['unknown','basic','strong']),recommendation:z.enum(['unknown','yes','no'])});
const amount=z.number().finite().min(0).max(100000000);
const requestSchema=z.object({profile:profileSchema.optional(),saved:z.array(z.string()).max(200).optional(),costs:z.record(z.object({tuition:amount.optional(),living:amount.optional(),other:amount.optional(),confirmedAid:amount.optional(),note:z.string().max(1000).optional()}).strict()).optional()}).strict();
export function validateState(value:unknown){
 const payload=requestSchema.parse(value);
 if(payload.saved?.some(id=>!programs.some(p=>p.id===id)))throw new Error('收藏项目不正确');
 if(Object.keys(payload.costs??{}).some(id=>!programs.some(p=>p.id===id)))throw new Error('费用项目不正确');
 return payload;
}
