import type {Program,SourceCheck} from './catalog';
export function plainText(html:string){return html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi,' ').replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi,' ').replace(/<[^>]+>/g,' ').replace(/&nbsp;|&#160;/g,' ').replace(/&amp;/g,'&').replace(/\s+/g,' ').trim();}
export function extractTuition(id:string,text:string):number|undefined{
 if(id==='saif-mf'){
  // Adjustment table: old annual fee, new annual fee, duration. Use the domestic row only.
  const adjustment=text.match(/国内学生\s*[（(]包含港澳台[）)]\s*([\d,]+)\s+([\d,]+)\s+(\d+)\s*年/);
  if(adjustment)return Number(adjustment[2].replaceAll(',',''))*Number(adjustment[3]);
  const m=text.match(/国内学生[\s\S]{0,50}?(\d+(?:\.\d+)?)\s*万元/);return m?Number(m[1])*10000:undefined;
 }
 if(id==='baruch-mfe'){const m=text.match(/\$([\d,]+)\s+for out-of-state students/i);return m?Number(m[1].replaceAll(',','')):undefined;}
 if(id==='cuhk-mphil'){const m=text.match(/Annual Programme Fee[\s\S]{0,180}?HK\$\s*([\d,]+)/i);return m?Number(m[1].replaceAll(',',''))*2:undefined;}
 if(id==='oxford-mfe'){const m=text.match(/Cost\s*£\s*([\d,]+)/i);return m?Number(m[1].replaceAll(',','')):undefined;}
 if(id==='cuhk-msc'){const m=text.match(/tuition fee for the entire programme[\s\S]{0,160}?HK\$\s*([\d,]+)/i);return m?Number(m[1].replaceAll(',','')):undefined;}
 if(id==='bse-finance'){const m=text.match(/Student Fee:\s*€\s*([\d,]+)/i);return m?Number(m[1].replaceAll(',','')):undefined;}
 return undefined;
}
function robotsBlocked(text:string,path:string){let applies=false;let rules:{allow:boolean;path:string}[]=[];for(const line of text.split(/\r?\n/)){const l=line.replace(/#.*/,'').trim();if(/^user-agent:/i.test(l)){applies=/^user-agent:\s*\*\s*$/i.test(l);continue;}if(applies&&/^(disallow|allow):/i.test(l)){const [key,...parts]=l.split(':');const value=parts.join(':').trim();if(value)rules.push({allow:key.toLowerCase()==='allow',path:value});}}const matches=rules.filter(r=>{const pattern=r.path.replace(/[.+?^${}()|[\]\\]/g,'\\$&').replaceAll('*','.*');try{return new RegExp('^'+pattern).test(path);}catch{return false;}}).sort((a,b)=>b.path.length-a.path.length||Number(b.allow)-Number(a.allow));return matches.length>0&&!matches[0].allow;}
export async function monitor(p:Program,previous?:SourceCheck):Promise<SourceCheck>{
 if(previous?.url!==p.url)previous=undefined;
 const checkedAt=new Date().toISOString();const result:SourceCheck={id:p.id,url:p.url,checkedAt,status:'访问受限',message:'',lastSuccess:previous?.lastSuccess,hash:previous?.hash,changed:previous?.changed};
 try{
  const target=new URL(p.url);const robots=await fetch(target.origin+'/robots.txt',{signal:AbortSignal.timeout(5000),redirect:'follow',headers:{'User-Agent':'GraduateRouteMonitor/1.0'}});
  if(robots.ok&&robotsBlocked(await robots.text(),target.pathname)){return {...result,status:'访问受限',message:'官方站点 robots 规则限制自动读取；可手动打开官方来源。'};}
  if(!robots.ok&&robots.status!==404)return {...result,status:'访问受限',message:'未能确认站点自动读取规则，保留已核验参考资料。'};
  const response=await fetch(p.url,{signal:AbortSignal.timeout(10000),redirect:'follow',headers:{'User-Agent':'GraduateRouteMonitor/1.0','Accept':'text/html'}});
  if(!response.ok)return {...result,message:'官方页面返回 HTTP '+response.status+'；保留参考资料。'};
  const type=response.headers.get('content-type')??'';
  if(type.includes('application/pdf')){
   const bytes=await response.arrayBuffer();if(bytes.byteLength>8000000)return {...result,message:'官方 PDF 超过读取上限，保留人工核验资料。'};
   const digest=await crypto.subtle.digest('SHA-256',bytes);const hash=Array.from(new Uint8Array(digest),v=>v.toString(16).padStart(2,'0')).join('');
   const changed=Boolean(previous?.changed||(previous?.hash&&previous.hash!==hash));
   return {...result,hash,lastSuccess:checkedAt,changed,status:changed?'文件变化待复核':'文件已读取',message:changed?'官方 PDF 文件发生变化，请打开招生目录核对。':'已检查官方 PDF 文件；学费、资格和当届截止日期仍需人工核验。'};
  }
  if(!type.includes('text/html'))return {...result,status:'结构变化',changed:true,message:'官方页面格式变化，需要人工复核。'};
  const html=await response.text();if(html.length>2000000)return {...result,status:'结构变化',changed:true,message:'页面过大，未自动解析。'};
  const text=plainText(html);if(text.length<400||/just a moment|verify you are human|access denied/i.test(text))return {...result,message:'页面未返回可读招生内容，保留参考资料。'};
  const terms=/学费|奖学金|招生|助学金|推免|tuition|deadline|fellowship|stipend|scholarship|application|financial aid|cost/ig;
  const excerpts:string[]=[];let m;while((m=terms.exec(text))&&excerpts.length<60){excerpts.push(text.slice(Math.max(0,m.index-35),m.index+170));}
  const relevant=excerpts.join('|');if(!relevant)return {...result,status:'结构变化',changed:true,message:'未识别招生或资助内容，需要人工复核。'};
  const digest=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(relevant));const hash=Array.from(new Uint8Array(digest),v=>v.toString(16).padStart(2,'0')).join('');
  const tuition=extractTuition(p.id,text);const changed=Boolean(previous?.changed||(previous?.hash&&previous.hash!==hash)||(tuition!=null&&p.tuition!=null&&tuition!==p.tuition));
  return {...result,hash,tuition,lastSuccess:checkedAt,changed,status:changed?'内容变化待复核':p.id==='pku-nsd'?'入口监测':'页面已读取',message:changed?'招生或资助相关内容有变化；费用和截止日期需打开官网复核。':tuition!=null?'已提取参考学费；申请条件与目标年份仍需核验。':'已读取官方页面；本来源尚未自动解析完整费用和当届截止日期。'};
 }catch(e){console.error('Official source fetch failed',p.id,e instanceof Error?e.message:'unknown');return {...result,message:e instanceof Error&&/timeout|abort/i.test(e.message)?'官方读取超时，保留上次资料。':'暂时无法读取官方来源，保留上次资料。'};}
}
