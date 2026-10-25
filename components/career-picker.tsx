'use client';
import {useEffect,useState} from 'react';
import {careerPaths} from '@/lib/career-catalog';
import {careerFamilies,careerFamily} from '@/lib/career-expansion';
export function CareerPicker({value,onChange,allowAll=false}:{value:string;onChange:(id:string)=>void;allowAll?:boolean}){
 const [family,setFamily]=useState(value==='all'?'all':careerFamily(value).id),[search,setSearch]=useState('');
 useEffect(()=>{setFamily(value==='all'?'all':careerFamily(value).id);setSearch('');},[value]);
 const words=search.trim().toLowerCase().split(/\s+/).filter(Boolean);
 const roles=careerPaths.filter(c=>words.length?words.every(w=>(c.name+' '+c.work+' '+careerFamily(c.id).name).toLowerCase().includes(w)):family!=='all'&&careerFamily(c.id).id===family);
 const current=careerPaths.find(c=>c.id===value);
 return <section className="career-picker" aria-label="选择职业方向"><header><div><span>职业方向</span><h2>{current?.name??'你想探索哪条职业路？'}</h2><p>{current?'当前正在查看的方向；点击下方卡片即可切换。':'先点一个大类，再选具体方向；也可以直接搜索。'}</p></div><label>搜索职业<input aria-label="搜索职业方向" placeholder="例如：投行、买方、量化、银行" value={search} onChange={e=>setSearch(e.target.value)}/></label></header><div className="career-picker-families" aria-label="职业大类">{allowAll&&<button type="button" aria-pressed={value==='all'&&family==='all'&&!search} onClick={()=>{setFamily('all');setSearch('');onChange('all');}}>全部方向</button>}{careerFamilies.map(f=><button type="button" key={f.id} aria-pressed={family===f.id&&!search} onClick={()=>{setFamily(f.id);setSearch('');}}>{f.name}</button>)}</div>{roles.length>0?<><div className="career-picker-caption">{search?'搜索结果':careerFamilies.find(f=>f.id===family)?.name}<span>{roles.length} 个方向 · 点击查看</span></div><div className="career-picker-roles">{roles.map(c=><button type="button" key={c.id} aria-pressed={value===c.id} onClick={()=>onChange(c.id)}><span>{value===c.id?'✓ 当前方向':'查看方向 →'}</span><strong>{c.name}</strong><p>{c.work}</p></button>)}</div></>:<p className="career-picker-hint">{search?'没有找到这个职业，试试更短的关键词。':'点击上方大类，展开具体职业。'}</p>}</section>;
}
