'use client';
import {useRef,useState} from 'react';
import {Download,Upload,FolderHeart,Undo2} from 'lucide-react';
import {Button} from '@/components/ui/button';
import {Dialog,DialogContent,DialogHeader,DialogTitle,DialogDescription} from '@/components/ui/dialog';
import {exportPersonalBackup,parsePersonalBackup,type BrowserState} from '@/lib/browser-state';

type Pending={state:BrowserState;exportedAt:string};
export function PersonalRecords({state,disabled,canUndo,onImport,onUndo}:{state:BrowserState;disabled:boolean;canUndo:boolean;onImport:(state:BrowserState)=>Promise<boolean>;onUndo:()=>Promise<boolean>}){
 const fileInput=useRef<HTMLInputElement>(null);
 const [pending,setPending]=useState<Pending|null>(null),[error,setError]=useState(''),[reading,setReading]=useState(false),[applying,setApplying]=useState(false),[undoOpen,setUndoOpen]=useState(false);
 const newSaved=pending?.state.saved.filter(id=>!state.saved.includes(id)).length??0;
 const costIds=Object.keys(pending?.state.costs??{}),newCosts=costIds.filter(id=>!state.costs[id]).length,conflicts=costIds.length-newCosts;
 function download(){
  try{const blob=new Blob([exportPersonalBackup(state)],{type:'application/json'}),url=URL.createObjectURL(blob),link=document.createElement('a');link.href=url;link.download=`升学雷达备份-${new Date().toISOString().slice(0,10)}.json`;document.body.appendChild(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);setError('');}catch{setError('无法生成备份，请重试。');}
 }
 async function readFile(file?:File){
  if(!file)return;setError('');setReading(true);
  try{if(file.size>2*1024*1024)throw new Error('备份文件不能超过 2 MB。');setPending(parsePersonalBackup(await file.text()));}
  catch(e){setError(e instanceof Error?e.message:'备份读取失败，当前记录未改变。');}
  finally{setReading(false);if(fileInput.current)fileInput.current.value='';}
 }
 return <section className="personal-records" aria-labelledby="personal-records-title">
  <div className="records-heading"><span className="records-icon"><FolderHeart size={23}/></span><div><h2 id="personal-records-title">个人记录备份</h2><p>把升学路线、收藏和费用记录带到另一台设备。</p></div></div>
  <div className="records-summary"><span><b>{state.saved.length}</b> 个收藏</span><span><b>{Object.keys(state.costs).length}</b> 项费用记录</span><span>目标入学 <b>{state.profile.year}</b></span></div>
  <div className="records-actions"><Button variant="outline" disabled={disabled} onClick={download}><Download size={16}/>导出备份</Button><Button variant="outline" disabled={disabled||reading} onClick={()=>fileInput.current?.click()}><Upload size={16}/>{reading?'读取中…':'导入备份'}</Button>{canUndo&&<Button variant="ghost" disabled={disabled||applying} onClick={()=>setUndoOpen(true)}><Undo2 size={16}/>恢复导入前记录</Button>}</div>
  <input ref={fileInput} type="file" accept=".json,application/json" className="records-file-input" aria-label="选择升学雷达备份文件" onChange={event=>readFile(event.target.files?.[0])}/>
  <p className="records-note">文件由你保管，包含你填写的个人条件与费用备注。导入在当前浏览器完成，不上传到 GitHub；跨设备使用需要手动导出、导入。</p>
  {error&&<p role="alert" className="records-error">{error}</p>}
  <Dialog open={!!pending} onOpenChange={open=>{if(!open&&!applying)setPending(null);}}><DialogContent className="records-dialog"><DialogHeader><DialogTitle>核对备份，再导入</DialogTitle><DialogDescription>当前记录会先保留一份，导入后可在这里恢复。</DialogDescription></DialogHeader>{pending&&<>
   <p className="records-date">备份时间：{new Date(pending.exportedAt).toLocaleString('zh-CN',{timeZone:'Asia/Shanghai'})}</p>
   <dl className="records-preview"><div><dt>升学路线</dt><dd>采用备份中的 {pending.state.profile.year} 年路线和个人条件</dd></div><div><dt>收藏项目</dt><dd>新增 {newSaved} 个，保留当前全部收藏</dd></div><div><dt>费用记录</dt><dd>新增 {newCosts} 项；{conflicts} 项同项目记录保留当前版本</dd></div></dl>
   <p className="records-note">只合并个人记录，不改动项目学费、资助政策或官网检查结果。</p>
   <div className="records-actions"><Button variant="outline" disabled={applying} onClick={()=>setPending(null)}>取消</Button><Button disabled={applying} onClick={async()=>{setApplying(true);try{if(await onImport(pending.state))setPending(null);}finally{setApplying(false);}}}>{applying?'导入中…':'确认合并导入'}</Button></div>
  </>}</DialogContent></Dialog>
  <Dialog open={undoOpen} onOpenChange={open=>{if(!applying)setUndoOpen(open);}}><DialogContent className="records-dialog"><DialogHeader><DialogTitle>恢复导入前的个人记录</DialogTitle><DialogDescription>路线、收藏和费用将恢复到最近一次导入前。导入之后新增的修改不会保留；需要保留时，请先取消并导出当前备份。</DialogDescription></DialogHeader><div className="records-actions"><Button variant="outline" disabled={applying} onClick={()=>setUndoOpen(false)}>取消</Button><Button disabled={applying} onClick={async()=>{setApplying(true);try{if(await onUndo())setUndoOpen(false);}finally{setApplying(false);}}}>确认恢复</Button></div></DialogContent></Dialog>
 </section>;
}
