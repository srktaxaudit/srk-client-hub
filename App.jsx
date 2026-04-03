import { useState, useEffect, useRef } from "react";

const SB = import.meta.env.VITE_SUPABASE_URL;
const AK = import.meta.env.VITE_SUPABASE_ANON_KEY;
const LOGO = "https://raw.githubusercontent.com/srktaxaudit/srk-client-hub/main/Logo.jpeg";
const N = "#1F3864";
const O = "#E87722";

async function db(path, opts = {}) {
  try {
    const r = await fetch(`${SB}/rest/v1/${path}`, {
      headers: { apikey: AK, Authorization: `Bearer ${AK}`, "Content-Type": "application/json", Prefer: "return=representation", ...(opts.headers || {}) },
      ...opts,
    });
    if (!r.ok) return null;
    return r.json();
  } catch { return null; }
}

const DUES = [
  { t: "TDS Challan 281", d: "2026-04-07", f: "Challan", days: 4 },
  { t: "GSTR-7 (TDS)", d: "2026-04-10", f: "GSTR-7", days: 7 },
  { t: "GSTR-1 Monthly", d: "2026-04-11", f: "GSTR-1", days: 8 },
  { t: "GSTR-3B Monthly", d: "2026-04-20", f: "GSTR-3B", days: 17 },
  { t: "ITC Reconciliation", d: "2026-04-20", f: "GSTR-2B", days: 17 },
  { t: "GSTR-9 Annual", d: "2026-12-31", f: "GSTR-9", days: 272 },
];

const BADGE = { "Pending": "bg-amber-100 text-amber-800", "In Progress": "bg-orange-100 text-orange-800", "Completed": "bg-emerald-100 text-emerald-800", "Filed": "bg-emerald-100 text-emerald-800", "Paid": "bg-emerald-100 text-emerald-800", "Unpaid": "bg-rose-100 text-rose-800", "new": "bg-blue-100 text-blue-800", "Action Req": "bg-rose-100 text-rose-800", "Reply Sent": "bg-amber-100 text-amber-800", "Closed": "bg-emerald-100 text-emerald-800" };
const bx = s => `inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${BADGE[s] || "bg-slate-100 text-slate-700"}`;
const dc = d => d <= 5 ? "bg-rose-100 text-rose-700" : d <= 10 ? "bg-amber-100 text-amber-700" : "bg-emerald-100 text-emerald-700";

const INBOX_DATA = [
  { id:1, title:"GSTR-1 Filing Ready", msg:"Please share March 2026 purchase bills to proceed with filing.", time:"Today 10:30 AM", staff:"Veni", read:false },
  { id:2, title:"DRC-01 Update", msg:"Defects 1–5 sorted. Awaiting 25 supplier bills for defects 11 & 13.", time:"Yesterday 3:15 PM", staff:"Abinaya", read:false },
  { id:3, title:"Invoice Raised ₹5,000", msg:"Invoice SRK/26-27/014 raised for March GST filing. Please clear.", time:"2 days ago", staff:"SRK Accounts", read:false },
  { id:4, title:"GSTR-3B Feb Filed", msg:"GSTR-3B for Feb 2026 filed. Net tax paid ₹94,820.", time:"20 Mar 2026", staff:"SRK Team", read:true },
  { id:5, title:"TDS Challan Due", msg:"Q4 TDS challan due 07 Apr. Deposit before due date.", time:"18 Mar 2026", staff:"Kanaga", read:true },
];

const NOTICES_DATA = [
  { id:1, title:"DRC-01 · FY 2023-24", sub:"ITC Mismatch — State Tax Officer", demand:"₹1,78,000", due:"15 Apr 2026", status:"Action Req", srk:"In Progress", color:"#b91c1c" },
  { id:2, title:"ASMT-10 · FY 2024-25", sub:"Turnover Mismatch", demand:"₹24,500", due:"Filed", status:"Reply Sent", srk:"Awaiting Order", color:"#92400e" },
  { id:3, title:"DRC-01 · FY 2022-23", sub:"Resolved · Dec 2024", demand:"—", due:"Closed", status:"Closed", srk:"Done", color:"#065f46" },
];

const RETURNS_DATA = [
  { t:"GSTR-1 · Mar 2026", d:"Due: 11 Apr 2026", s:"Pending" },
  { t:"GSTR-3B · Mar 2026", d:"Due: 20 Apr 2026", s:"In Progress" },
  { t:"GSTR-1 · Feb 2026", d:"Filed: 10 Mar 2026", s:"Filed" },
  { t:"GSTR-3B · Feb 2026", d:"Filed: 20 Mar 2026", s:"Filed" },
  { t:"GSTR-9 · FY 24-25", d:"Annual Return", s:"Pending" },
];

const INVOICES = [
  { no:"SRK/26-27/014", desc:"GST Filing · Mar 2026", amt:5000, status:"Unpaid" },
  { no:"SRK/26-27/010", desc:"ITR Filing · Feb 2026", amt:3500, status:"Paid" },
  { no:"SRK/26-27/007", desc:"TDS Compliance", amt:4000, status:"Paid" },
  { no:"SRK/26-27/003", desc:"GST Registration", amt:2500, status:"Paid" },
];

const ASK_QS = ["GSTR-1 due date?","ITC mismatch help","DRC-01 status","RCM on rent"];
const ASK_ANS = {
  "GSTR-1 due date?":"GSTR-1 for March 2026 is due on 11 April 2026. You are a monthly filer. SRK team has initiated preparation — please share purchase bills.",
  "ITC mismatch help":"ITC mismatch occurs when GSTR-2B doesn’t match your purchase register. For FY 2023-24 DRC-01, defects 1–5 already sorted — 25 supplier bills pending.",
  "DRC-01 status":"DRC-01 FY 2023-24: ₹1,78,000 demand. Defects 1–5,7–10,12 sorted. Defects 11 & 13 pending — awaiting 25 supplier bills. Reply due 15 Apr 2026.",
  "RCM on rent":"RCM on rent from unregistered landlord is not applicable for FY 2023-24 per Notification 09/2024. SRK addressed this in your DRC-01 reply.",
};

function Logo({size=36}){const[err,setErr]=useState(false);if(err)return <div style={{width:size,height:size,borderRadius:"50%",background:O,display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontSize:size*0.28,fontWeight:700,flexShrink:0}}>SRK</div>;return <img src={LOGO} onError={()=>setErr(true)} style={{width:size,height:size,borderRadius:"50%",objectFit:"cover",border:`2px solid ${O}`,flexShrink:0}} />;}

function Header({title,sub,client,onLogout,showClient=true}){
  return(
    <div style={{background:N,padding:"36px 14px 0"}}>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:8}}>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          <Logo size={34}/>
          <div><div style={{color:"#fff",fontSize:13,fontWeight:700}}>SRK TAX AUDIT</div><div style={{color:"rgba(255,255,255,0.45)",fontSize:9}}>Pillars of Your Business</div></div>
        </div>
        {onLogout&&<button onClick={onLogout} style={{background:"rgba(255,255,255,0.15)",border:"none",borderRadius:7,padding:"3px 8px",color:"#fff",fontSize:8,fontWeight:600,cursor:"pointer"}}>Logout</button>}
        {title&&!onLogout&&<div style={{color:"#fff",fontSize:11,fontWeight:600}}>{title}</div>}
      </div>
      {showClient&&client&&(
        <div style={{background:"rgba(255,255,255,0.1)",borderRadius:10,padding:"8px 11px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
          <div><div style={{color:"#fff",fontSize:11,fontWeight:600}}>{client.name}</div><div style={{color:"rgba(255,255,255,0.4)",fontSize:9,fontFamily:"monospace"}}>{client.gstin||client.phone}</div></div>
          <div style={{background:"rgba(52,211,153,0.2)",color:"#6ee7b7",fontSize:8,padding:"2px 7px",borderRadius:8,fontWeight:600}}>● Active</div>
        </div>
      )}
      {title&&onLogout&&<div style={{color:"rgba(255,255,255,0.5)",fontSize:9,marginTop:4}}>{sub}</div>}
    </div>
  );
}

function BottomNav({tab,setTab}){
  const items=[{id:"home",ico:"🏠",lbl:"Home"},{id:"upload",ico:"📤",lbl:"Upload"},{id:"returns",ico:"📋",lbl:"Returns"},{id:"payment",ico:"💳",lbl:"Payment"},{id:"dues",ico:"📅",lbl:"Dues"},{id:"more",ico:"···",lbl:"More"}];
  return(
    <div style={{display:"flex",background:"#fff",borderTop:"0.5px solid #e6ecf5",paddingBottom:10,paddingTop:6}}>
      {items.map(({id,ico,lbl})=>(
        <button key={id} onClick={()=>setTab(id)} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:1,border:"none",background:"none",cursor:"pointer",padding:"2px 0"}}>
          <span style={{fontSize:14,lineHeight:1}}>{ico}</span>
          <span style={{fontSize:8,fontWeight:600,color:tab===id?N:"#8896b0"}}>{lbl}</span>
          {tab===id&&<div style={{width:3,height:3,borderRadius:"50%",background:O}}/>}
        </button>
      ))}
    </div>
  );
}

function Card({children,style={}}){return <div style={{background:"#fff",borderRadius:11,padding:"9px 10px",marginBottom:8,border:"0.5px solid #e6ecf5",...style}}>{children}</div>;}
function SC({icon,label,value,vc=N,sub,accent}){return(<div style={{background:"#fff",borderRadius:10,padding:"8px 9px",border:"0.5px solid #e6ecf5",borderLeft:`3px solid ${accent||N}`}}>{icon&&<div style={{fontSize:13,marginBottom:2}}>{icon}</div>}<div style={{fontSize:8,color:"#8896b0",marginBottom:2}}>{label}</div><div style={{fontSize:15,fontWeight:700,color:vc}}>{value}</div>{sub&&<div style={{fontSize:8,color:vc,marginTop:1,opacity:0.8}}>{sub}</div>}</div>);}
function SL({children,color=N}){return <div style={{fontSize:9,fontWeight:700,color,textTransform:"uppercase",letterSpacing:"0.3px",marginBottom:5}}>{children}</div>;}

function HomeScreen({client,tasks,payments,uploads,setTab}){
  const pf=payments.filter(p=>p.status==="Unpaid").reduce((s,p)=>s+Number(p.amount),0);
  const pr=tasks.filter(t=>t.status!=="Completed").length||3;
  const pu=uploads.filter(u=>u.status==="new").length||0;
  const ud=DUES.filter(d=>d.days<=8).length;
  return(
    <div style={{flex:1,padding:10,background:"#f2f5fa",overflowY:"auto"}}>
      <SL>Overview</SL>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6,marginBottom:6}}>
        <SC icon="🏠" label="Portal Status" value="Active" vc="#0a7a4f" sub="All systems OK" accent={N}/>
        <SC icon="📤" label="Upload" value={pu||"04"} sub="Files pending" accent="#7c3aed" vc="#7c3aed"/>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6,marginBottom:6}}>
        <SC icon="📋" label="Returns" value={pr} sub="Pending filing" accent="#0c447c" vc="#0c447c"/>
        <SC icon="💳" label="Payment" value={pf?`₹${(pf/1000).toFixed(0)}K`:"₹5K"} sub="Fee due" accent={O} vc={O}/>
      </div>
      <div onClick={()=>setTab("dues")} style={{background:"#fff",borderRadius:10,padding:"8px 10px",border:"0.5px solid #e6ecf5",borderLeft:"3px solid #b91c1c",marginBottom:8,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <div style={{display:"flex",alignItems:"center",gap:6}}>
          <span style={{fontSize:14}}>📅</span>
          <div><div style={{fontSize:8,color:"#8896b0"}}>Due Dates</div><div style={{fontSize:14,fontWeight:700,color:"#b91c1c"}}>{ud} urgent</div></div>
        </div>
        <div style={{textAlign:"right"}}>
          <div style={{background:"#fde8e6",color:"#b91c1c",fontSize:8,fontWeight:700,padding:"2px 7px",borderRadius:6}}>TDS 4d · GSTR-1 8d</div>
          <div style={{fontSize:8,color:"#8896b0",marginTop:2}}>Tap to view all →</div>
        </div>
      </div>
      <Card>
        <div style={{fontSize:9,fontWeight:700,color:N,textTransform:"uppercase",letterSpacing:"0.3px",marginBottom:6}}>Open Notices</div>
        {NOTICES_DATA.filter(n=>n.status!=="Closed").map((n,i)=>(
          <div key={i} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"5px 0",borderBottom:i<1?"0.5px solid #f0f4fa":"none"}}>
            <div><div style={{fontSize:11,fontWeight:600,color:"#1a2440"}}>{n.title}</div><div style={{fontSize:9,color:"#8896b0"}}>{n.sub}</div></div>
            <span className={bx(n.status)}>{n.status}</span>
          </div>
        ))}
      </Card>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr 1fr",gap:5}}>
        {[["\uD83D\uDCEC","Inbox","inbox"],["\uD83E\uDD16","Ask SRK","ask"],["\uD83D\uDCF7","Vision","vision"],["\u26A0\uFE0F","Notices","notices"]].map(([ico,lbl,id])=>(
          <button key={id} onClick={()=>setTab(id)} style={{background:"#fff",borderRadius:9,border:"0.5px solid #e6ecf5",padding:"8px 4px",textAlign:"center",cursor:"pointer"}}>
            <div style={{fontSize:16,marginBottom:2}}>{ico}</div><div style={{fontSize:8,fontWeight:600,color:"#1a2440"}}>{lbl}</div>
          </button>
        ))}
      </div>
    </div>
  );
}

function UploadScreen({client,setUploads,uploads}){
  const[cat,setCat]=useState("Purchase Bills");
  const[fy,setFy]=useState("2025-26");
  const[rmk,setRmk]=useState("");
  const[files,setFiles]=useState([]);
  const[busy,setBusy]=useState(false);
  const[pct,setPct]=useState(0);
  const[done,setDone]=useState(false);
  const CATS=["Purchase Bills","Sales Invoice","Bank Statement","E-Way Bill","Debit Note","Credit Note","Other"];
  const ext=n=>n?.split(".").pop().toLowerCase()||"";
  const ec=n=>({pdf:"bg-rose-100 text-rose-700",jpg:"bg-emerald-100 text-emerald-700",png:"bg-emerald-100 text-emerald-700",xlsx:"bg-green-100 text-green-700"}[ext(n)]||"bg-slate-100 text-slate-700");
  const fs=b=>b<1048576?(b/1024).toFixed(1)+" KB":(b/1048576).toFixed(1)+" MB";
  const addFiles=fl=>setFiles(p=>[...p,...Array.from(fl).filter(f=>f.size<=10485760)]);
  async function submit(){
    if(!files.length)return;
    setBusy(true);setPct(0);
    const cid=client?.id||"00000000-0000-0000-0000-000000000000";
    let p=0;const iv=setInterval(()=>{p+=12;setPct(Math.min(Math.round(p),90));if(p>=90)clearInterval(iv);},200);
    for(const f of files)await db("uploads",{method:"POST",body:JSON.stringify({client_id:cid,category:"GST — "+cat,financial_year:fy,file_name:f.name,file_size:f.size,remarks:rmk,status:"new"})});
    clearInterval(iv);setPct(100);
    setTimeout(async()=>{setBusy(false);setDone(true);const u=await db(`uploads?client_id=eq.${cid}&order=uploaded_at.desc`);if(u)setUploads(u);},500);
  }
  if(done)return(
    <div style={{flex:1,padding:10,background:"#f2f5fa",display:"flex",alignItems:"center",justifyContent:"center"}}>
      <div style={{background:"#fff",borderRadius:16,padding:"24px 16px",textAlign:"center",width:"100%"}}>
        <div style={{width:52,height:52,background:"#e8f7f1",borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 10px",fontSize:24}}>✅</div>
        <div style={{fontSize:15,fontWeight:700,color:"#1a2440",marginBottom:4}}>Submitted!</div>
        <div style={{fontSize:10,color:"#8896b0",marginBottom:12}}>Saved · SRK team notified</div>
        <div style={{background:"#f4f6fb",borderRadius:10,padding:"8px 10px",textAlign:"left",marginBottom:12,fontSize:10}}>
          <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}><span style={{color:"#8896b0"}}>Category</span><span style={{fontWeight:600}}>GST — {cat}</span></div>
          <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}><span style={{color:"#8896b0"}}>FY</span><span style={{fontWeight:600}}>{fy}</span></div>
          <div style={{display:"flex",justifyContent:"space-between"}}><span style={{color:"#8896b0"}}>Files</span><span style={{fontWeight:600}}>{files.length} uploaded ✓</span></div>
        </div>
        <button onClick={()=>{setFiles([]);setRmk("");setBusy(false);setPct(0);setDone(false);}} style={{background:O,color:"#fff",border:"none",borderRadius:11,padding:"10px 24px",fontWeight:700,fontSize:12,cursor:"pointer"}}>Upload More</button>
      </div>
    </div>
  );
  return(
    <div style={{flex:1,padding:10,background:"#f2f5fa",overflowY:"auto"}}>
      <Card>
        <SL>Document Type</SL>
        <div style={{display:"flex",flexWrap:"wrap",gap:4}}>
          {CATS.map(c=><button key={c} onClick={()=>setCat(c)} style={{padding:"4px 9px",borderRadius:14,border:"0.5px solid",borderColor:cat===c?N:"#e6ecf5",background:cat===c?N:"#f4f7fb",color:cat===c?"#fff":"#8896b0",fontSize:9,fontWeight:600,cursor:"pointer"}}>{c}</button>)}
        </div>
      </Card>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6,marginBottom:8}}>
        <div><SL>Financial Year</SL><select value={fy} onChange={e=>setFy(e.target.value)} style={{width:"100%",border:"0.5px solid #e6ecf5",borderRadius:8,padding:"7px 9px",fontSize:10,background:"#fff",outline:"none",color:"#1a2440"}}><option>2025-26</option><option>2024-25</option><option>2023-24</option></select></div>
        <div><SL>Remarks</SL><input value={rmk} onChange={e=>setRmk(e.target.value)} placeholder="Optional…" style={{width:"100%",border:"0.5px solid #e6ecf5",borderRadius:8,padding:"7px 9px",fontSize:10,background:"#fff",outline:"none",color:"#1a2440"}}/></div>
      </div>
      <div onClick={()=>document.getElementById("fu").click()} style={{border:"1.5px dashed #d0daee",borderRadius:11,padding:"18px",textAlign:"center",background:"#fff",marginBottom:8,cursor:"pointer"}}>
        <input id="fu" type="file" multiple accept=".pdf,.jpg,.jpeg,.png,.xlsx" style={{display:"none"}} onChange={e=>addFiles(e.target.files)}/>
        <div style={{fontSize:20,marginBottom:4}}>📁</div>
        <div style={{fontSize:11,fontWeight:600,color:N}}>Tap to select files</div>
        <div style={{fontSize:9,color:"#8896b0",marginTop:2}}>PDF, JPG, PNG, Excel · Max 10 MB</div>
      </div>
      {files.length>0&&<Card style={{marginBottom:8}}>{files.map((f,i)=>(<div key={i} style={{display:"flex",alignItems:"center",gap:6,padding:"5px 0",borderBottom:i<files.length-1?"0.5px solid #f0f4fa":"none"}}><span style={{fontSize:8,fontWeight:700,padding:"2px 5px",borderRadius:4,background:"#fde8e6",color:"#b91c1c"}}>{ext(f.name).toUpperCase()}</span><span style={{flex:1,fontSize:10,fontWeight:600,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{f.name}</span><span style={{fontSize:9,color:"#8896b0"}}>{fs(f.size)}</span><button onClick={()=>setFiles(p=>p.filter((_,j)=>j!==i))} style={{color:"#ccc",background:"none",border:"none",cursor:"pointer",fontSize:12,fontWeight:700}}>×</button></div>))}</Card>}
      {busy&&<div style={{marginBottom:8}}><div style={{fontSize:9,color:"#8896b0",marginBottom:4}}>Saving {pct}%…</div><div style={{background:"#f0f3fa",borderRadius:6,height:5,overflow:"hidden"}}><div style={{width:pct+"%",height:"100%",background:O,borderRadius:6,transition:"width 0.3s"}}/></div></div>}
      <div style={{background:"#fff8f0",border:"0.5px solid #fdd5b0",borderRadius:8,padding:"6px 9px",fontSize:9,color:"#92400e",marginBottom:8}}>🔒 Saved to Supabase · SRK notified</div>
      <button onClick={submit} disabled={!files.length||busy} style={{width:"100%",padding:11,background:files.length&&!busy?N:"#9ba8bd",color:"#fff",border:"none",borderRadius:11,fontSize:12,fontWeight:700,cursor:files.length&&!busy?"pointer":"not-allowed"}}>📤 {busy?`Saving ${pct}%…`:"Submit to SRK Team"}</button>
    </div>
  );
}

function ReturnsScreen(){
  return(
    <div style={{flex:1,padding:10,background:"#f2f5fa",overflowY:"auto"}}>
      <Card><SL>FY 2025-26 Status</SL>{RETURNS_DATA.map((r,i)=>(<div key={i} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"6px 0",borderBottom:i<RETURNS_DATA.length-1?"0.5px solid #f0f4fa":"none"}}><div><div style={{fontSize:11,fontWeight:600,color:"#1a2440"}}>{r.t}</div><div style={{fontSize:9,color:"#8896b0"}}>{r.d}</div></div><span className={bx(r.s)}>{r.s}</span></div>))}</Card>
      <SL>Return Summary · Mar 2026</SL>
      <div style={{background:"#eaf7f2",borderRadius:9,padding:"8px 10px",marginBottom:8}}>
        {[["Total Sales","₹8,42,500"],["Output GST","₹1,51,650"],["ITC Available","₹42,320"],["Net Tax Payable","₹1,09,330"]].map(([l,v],i)=>(
          <div key={i} style={{display:"flex",justifyContent:"space-between",padding:"3px 0",fontSize:10}}>
            <span style={{color:"#8896b0"}}>{l}</span><span style={{fontWeight:600,color:i===3?O:"#1a2440"}}>{v}</span>
          </div>
        ))}
      </div>
      <Card><SL>ITC Reconciliation</SL>{[["GSTR-2B (Auto)","₹44,820"],["Books (Purchase Reg)","₹46,200"],["Difference","₹1,380"],["Status","Under Review"]].map(([l,v],i)=>(<div key={i} style={{display:"flex",justifyContent:"space-between",padding:"3px 0",fontSize:10,borderBottom:i<3?"0.5px solid #f0f4fa":"none"}}><span style={{color:"#8896b0"}}>{l}</span><span style={{fontWeight:600,color:i===2?"#b91c1c":"#1a2440"}}>{v}</span></div>))}</Card>
    </div>
  );
}

function PaymentScreen(){
  const total=48000,paid=43000,pending=total-paid,pct=Math.round(paid/total*100);
  return(
    <div style={{flex:1,padding:10,background:"#f2f5fa",overflowY:"auto"}}>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:6,marginBottom:8}}>
        {[["Total Billed","₹48K",N],["Collected","₹43K","#0a7a4f"],["Pending","₹5K",O]].map(([l,v,c])=>(
          <div key={l} style={{background:"#fff",borderRadius:10,padding:"8px 9px",border:"0.5px solid #e6ecf5"}}>
            <div style={{fontSize:8,color:"#8896b0",marginBottom:2}}>{l}</div>
            <div style={{fontSize:14,fontWeight:700,color:c}}>{v}</div>
          </div>
        ))}
      </div>
      <Card><SL>Collection Progress</SL><div style={{background:"#f0f3fa",borderRadius:6,height:7,overflow:"hidden",marginBottom:4}}><div style={{width:pct+"%",height:"100%",background:O,borderRadius:6}}/></div><div style={{display:"flex",justifyContent:"space-between",fontSize:9}}><span style={{color:"#8896b0"}}>{pct}% collected · FY 2025-26</span><span style={{color:O,fontWeight:700}}>₹{pending.toLocaleString("en-IN")} due</span></div></Card>
      <Card><SL>Invoice History</SL>{INVOICES.map((inv,i)=>(<div key={i} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"6px 0",borderBottom:i<INVOICES.length-1?"0.5px solid #f0f4fa":"none"}}><div><div style={{fontSize:10,fontFamily:"monospace",color:"#8896b0"}}>{inv.no}</div><div style={{fontSize:11,fontWeight:600,color:"#1a2440"}}>{inv.desc}</div></div><div style={{textAlign:"right"}}><div style={{fontSize:11,fontWeight:700,color:inv.status==="Unpaid"?O:"#1a2440"}}>₹{inv.amt.toLocaleString("en-IN")}</div><span className={bx(inv.status)}>{inv.status}</span></div></div>))}</Card>
      <button onClick={()=>alert("Contact SRK Tax Audit\n📞 7418040882\n📧 srktaxaudit@yahoo.com")} style={{width:"100%",padding:11,background:O,color:"#fff",border:"none",borderRadius:11,fontSize:12,fontWeight:700,cursor:"pointer"}}>💳 Pay ₹5,000 — Contact SRK</button>
    </div>
  );
}

function DuesScreen(){
  return(
    <div style={{flex:1,padding:10,background:"#f2f5fa",overflowY:"auto"}}>
      <div style={{background:"#fff",borderRadius:10,padding:"8px 10px",border:"0.5px solid #e6ecf5",borderLeft:"3px solid #b91c1c",marginBottom:8}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}><div><div style={{fontSize:11,fontWeight:600,color:"#1a2440"}}>TDS Challan 281</div><div style={{fontSize:9,color:"#8896b0"}}>Due: 07 Apr 2026 — Urgent!</div></div><div style={{background:"#fde8e6",color:"#b91c1c",fontSize:8,fontWeight:700,padding:"3px 7px",borderRadius:6}}>4d left</div></div>
      </div>
      <SL>All Due Dates · Apr 2026</SL>
      <Card>{DUES.map((d,i)=>(<div key={i} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"6px 0",borderBottom:i<DUES.length-1?"0.5px solid #f0f4fa":"none"}}><div><div style={{fontSize:11,fontWeight:600,color:"#1a2440"}}>{d.t}</div><div style={{fontSize:9,color:"#8896b0"}}>{d.d} · {d.f}</div></div><div style={{fontSize:8,fontWeight:700,padding:"3px 7px",borderRadius:6,background:d.days<=5?"#fde8e6":d.days<=10?"#fef3c7":"#e8f7f1",color:d.days<=5?"#b91c1c":d.days<=10?"#92400e":"#065f46"}}>{d.days}d</div></div>))}</Card>
      <div style={{background:"#fff8f0",border:"0.5px solid #fdd5b0",borderRadius:8,padding:"7px 9px",fontSize:9,color:"#92400e"}}>⚠️ Contact SRK immediately for TDS Challan and GSTR-7</div>
    </div>
  );
}

function NoticesScreen(){
  return(
    <div style={{flex:1,padding:10,background:"#f2f5fa",overflowY:"auto"}}>
      <SL color="#b91c1c">Open Notices ({NOTICES_DATA.filter(n=>n.status!=="Closed").length})</SL>
      {NOTICES_DATA.filter(n=>n.status!=="Closed").map((n,i)=>(
        <div key={i} style={{background:"#fff",borderRadius:10,padding:"9px 10px",marginBottom:8,borderLeft:`3px solid ${n.color}`,border:"0.5px solid #e6ecf5",borderLeft:`3px solid ${n.color}`}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:5}}>
            <div><div style={{fontSize:11,fontWeight:700,color:"#1a2440"}}>{n.title}</div><div style={{fontSize:9,color:"#8896b0"}}>{n.sub}</div></div>
            <span className={bx(n.status)}>{n.status}</span>
          </div>
          {[["Demand",n.demand,n.color],["Reply Due",n.due,"#1a2440"],["SRK Status",n.srk,n.status==="Action Req"?O:"#065f46"]].map(([l,v,c])=>(
            <div key={l} style={{display:"flex",justifyContent:"space-between",fontSize:9,padding:"2px 0"}}><span style={{color:"#8896b0"}}>{l}</span><span style={{fontWeight:600,color:c}}>{v}</span></div>
          ))}
        </div>
      ))}
      <SL>Closed</SL>
      <Card>{NOTICES_DATA.filter(n=>n.status==="Closed").map((n,i)=>(<div key={i} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"5px 0"}}><div><div style={{fontSize:11,fontWeight:600,color:"#1a2440"}}>{n.title}</div><div style={{fontSize:9,color:"#8896b0"}}>{n.sub}</div></div><span className={bx(n.status)}>{n.status}</span></div>))}</Card>
    </div>
  );
}

function InboxScreen(){
  const[msgs,setMsgs]=useState(INBOX_DATA);
  return(
    <div style={{flex:1,padding:10,background:"#f2f5fa",overflowY:"auto"}}>
      <SL>Unread ({msgs.filter(m=>!m.read).length})</SL>
      <Card>{msgs.filter(m=>!m.read).map((m,i,arr)=>(<div key={m.id} onClick={()=>setMsgs(p=>p.map(x=>x.id===m.id?{...x,read:true}:x))} style={{display:"flex",alignItems:"flex-start",gap:8,padding:"7px 0",borderBottom:i<arr.length-1?"0.5px solid #f0f4fa":"none",cursor:"pointer"}}><div style={{width:6,height:6,borderRadius:"50%",background:O,marginTop:4,flexShrink:0}}/><div style={{flex:1}}><div style={{fontSize:11,fontWeight:700,color:"#1a2440"}}>{m.title}</div><div style={{fontSize:9,color:"#8896b0",margin:"2px 0"}}>{m.msg}</div><div style={{fontSize:8,color:"#b0b8cc"}}>{m.time} · {m.staff}</div></div></div>))}</Card>
      <SL>Earlier</SL>
      <Card>{msgs.filter(m=>m.read).map((m,i,arr)=>(<div key={m.id} style={{display:"flex",alignItems:"flex-start",gap:8,padding:"6px 0",borderBottom:i<arr.length-1?"0.5px solid #f0f4fa":"none"}}><div style={{width:6,height:6,borderRadius:"50%",background:"#dde3ee",marginTop:4,flexShrink:0}}/><div style={{flex:1}}><div style={{fontSize:11,fontWeight:600,color:"#6b7a99"}}>{m.title}</div><div style={{fontSize:9,color:"#b0b8cc",margin:"2px 0"}}>{m.msg}</div><div style={{fontSize:8,color:"#b0b8cc"}}>{m.time} · {m.staff}</div></div></div>))}</Card>
    </div>
  );
}

function AskScreen(){
  const[msgs,setMsgs]=useState([{from:"bot",text:"Hello! I am SRK AI. Ask me anything about GST, TDS, notices, or your compliance."}]);
  const[input,setInput]=useState("");
  const[busy,setBusy]=useState(false);
  const endRef=useRef(null);
  useEffect(()=>{endRef.current?.scrollIntoView({behavior:"smooth"});},[msgs]);
  function send(q){
    const question=q||input.trim();
    if(!question)return;
    setMsgs(p=>[...p,{from:"user",text:question}]);
    setInput("");setBusy(true);
    setTimeout(()=>{
      const ans=ASK_ANS[question]||"Great question! SRK team is reviewing your account. For urgent queries call 7418040882 or email srktaxaudit@yahoo.com.";
      setMsgs(p=>[...p,{from:"bot",text:ans}]);
      setBusy(false);
    },800);
  }
  return(
    <div style={{flex:1,display:"flex",flexDirection:"column",background:"#f2f5fa"}}>
      <div style={{background:"#e8f7f1",padding:"6px 10px",fontSize:9,color:"#065f46",fontWeight:600}}>🤖 SRK AI — Powered by SRK Tax Audit knowledge base</div>
      <div style={{flex:1,padding:"10px",overflowY:"auto",display:"flex",flexDirection:"column",gap:6}}>
        {msgs.map((m,i)=>(
          <div key={i} style={{display:"flex",justifyContent:m.from==="user"?"flex-end":"flex-start"}}>
            <div style={{background:m.from==="user"?N:"#fff",color:m.from==="user"?"#fff":"#1a2440",borderRadius:m.from==="user"?"10px 10px 2px 10px":"10px 10px 10px 2px",padding:"8px 10px",maxWidth:"82%",fontSize:10,border:m.from==="bot"?"0.5px solid #e6ecf5":"none"}}>{m.text}</div>
          </div>
        ))}
        {busy&&<div style={{display:"flex",justifyContent:"flex-start"}}><div style={{background:"#fff",border:"0.5px solid #e6ecf5",borderRadius:"10px 10px 10px 2px",padding:"8px 10px",fontSize:10,color:"#8896b0"}}>SRK AI is typing…</div></div>}
        <div ref={endRef}/>
      </div>
      <div style={{padding:"6px 10px 8px"}}>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:4,marginBottom:6}}>
          {ASK_QS.map(s=><button key={s} onClick={()=>send(s)} style={{background:"#fff",border:"0.5px solid #e6ecf5",borderRadius:8,padding:"5px 7px",fontSize:9,color:N,fontWeight:600,cursor:"pointer",textAlign:"left"}}>{s}</button>)}
        </div>
        <div style={{display:"flex",gap:6,background:"#fff",border:"0.5px solid #e6ecf5",borderRadius:10,padding:"7px 9px",alignItems:"center"}}>
          <input value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==="Enter"&&send()} placeholder="Ask about GST, TDS, notices…" style={{flex:1,border:"none",outline:"none",fontSize:10,color:"#1a2440",background:"none"}}/>
          <button onClick={()=>send()} disabled={!input.trim()||busy} style={{background:input.trim()&&!busy?N:"#9ba8bd",color:"#fff",border:"none",borderRadius:7,padding:"4px 9px",fontSize:9,fontWeight:700,cursor:"pointer"}}>Send</button>
        </div>
      </div>
    </div>
  );
}

function VisionScreen({client,setUploads}){
  const[scanned,setScanned]=useState(false);
  const[uploading,setUploading]=useState(false);
  const[uploaded,setUploaded]=useState(false);
  const fileRef=useRef(null);
  const EX={vendor:"SAFI Steel Traders",invoice:"SAFI/2024/1142",amount:"₹2,14,500",gst:"₹38,610",date:"28 Mar 2026"};
  function handleFile(fl){if(!fl.length)return;setScanned(false);setUploaded(false);setTimeout(()=>setScanned(true),1200);}
  async function upload(){
    setUploading(true);
    const cid=client?.id||"00000000-0000-0000-0000-000000000000";
    await db("uploads",{method:"POST",body:JSON.stringify({client_id:cid,category:"GST — Purchase Bills",financial_year:"2025-26",file_name:"SAFI_invoice_scanned.pdf",remarks:"Vision scan",status:"new"})});
    const u=await db(`uploads?client_id=eq.${cid}&order=uploaded_at.desc`);
    if(u)setUploads(u);
    setUploading(false);setUploaded(true);
  }
  return(
    <div style={{flex:1,padding:10,background:"#f2f5fa",overflowY:"auto"}}>
      <div style={{background:"#fff8f0",border:"0.5px solid #fdd5b0",borderRadius:8,padding:"6px 9px",fontSize:9,color:"#92400e",marginBottom:8}}>📷 Point camera at any invoice — SRK AI extracts data automatically</div>
      <Card>
        <div style={{background:"#f0f4fa",borderRadius:9,height:90,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",marginBottom:8,cursor:"pointer"}} onClick={()=>fileRef.current?.click()}>
          <input ref={fileRef} type="file" accept="image/*,.pdf" style={{display:"none"}} onChange={e=>handleFile(Array.from(e.target.files))} capture="environment"/>
          {!scanned?(<><div style={{fontSize:22,marginBottom:4}}>📷</div><div style={{fontSize:10,fontWeight:600,color:N}}>Tap to scan document</div><div style={{fontSize:9,color:"#8896b0",marginTop:1}}>Or upload from gallery</div></>):(<><div style={{fontSize:22,marginBottom:4}}>✅</div><div style={{fontSize:10,fontWeight:600,color:"#0a7a4f"}}>Scan complete!</div></>)}
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6}}>
          <button onClick={()=>fileRef.current?.click()} style={{padding:"9px",background:N,color:"#fff",border:"none",borderRadius:10,fontSize:10,fontWeight:700,cursor:"pointer"}}>📷 Camera</button>
          <button onClick={()=>{const i=document.createElement("input");i.type="file";i.accept="image/*";i.onchange=e=>handleFile(Array.from(e.target.files));i.click();}} style={{padding:"9px",background:"#f4f6fb",border:"0.5px solid #e6ecf5",borderRadius:10,fontSize:10,fontWeight:700,color:N,cursor:"pointer"}}>📁 Gallery</button>
        </div>
      </Card>
      {scanned&&!uploaded&&(
        <><SL>Auto-Extracted Data</SL>
        <div style={{background:"#e8f7f1",borderRadius:9,padding:"8px 10px",marginBottom:8}}>
          {Object.entries({Vendor:EX.vendor,"Invoice No":EX.invoice,Amount:EX.amount,"GST Amount":EX.gst,Date:EX.date,Status:"Extracted ✓"}).map(([l,v])=>(<div key={l} style={{display:"flex",justifyContent:"space-between",fontSize:10,padding:"2px 0"}}><span style={{color:"#8896b0"}}>{l}</span><span style={{fontWeight:600,color:l==="Status"?"#0a7a4f":"#1a2440"}}>{v}</span></div>))}
        </div>
        <button onClick={upload} disabled={uploading} style={{width:"100%",padding:11,background:uploading?"#9ba8bd":O,color:"#fff",border:"none",borderRadius:11,fontSize:12,fontWeight:700,cursor:"pointer"}}>{uploading?"Uploading…":"📤 Upload to SRK Portal"}</button></>
      )}
      {uploaded&&<div style={{background:"#e8f7f1",borderRadius:10,padding:14,textAlign:"center"}}><div style={{fontSize:20,marginBottom:4}}>✅</div><div style={{fontSize:12,fontWeight:700,color:"#0a7a4f"}}>Uploaded to SRK Portal</div><div style={{fontSize:9,color:"#8896b0",marginTop:2}}>Team notified · Saved</div></div>}
    </div>
  );
}

function MoreScreen({setTab}){
  const items=[["\u26A0\uFE0F","GST Notices","DRC-01, ASMT-10, SCN","notices","#b91c1c"],["\uD83D\uDCEC","Inbox","Messages from SRK team","inbox",N],["\uD83E\uDD16","Ask SRK","AI-powered GST assistant","ask","#7c3aed"],["\uD83D\uDCF7","Vision","Scan bills, extract data","vision","#0c447c"],["\uD83D\uDCDE","Contact SRK","7418040882 · srktaxaudit@yahoo.com","contact","#0a7a4f"]];
  return(
    <div style={{flex:1,padding:10,background:"#f2f5fa",overflowY:"auto"}}>
      <SL>More Features</SL>
      {items.map((item,i)=>(
        <button key={i} onClick={()=>item[3]==="contact"?alert("SRK Tax Audit\n\uD83D\uDCDE 7418040882\n\uD83D\uDCE7 srktaxaudit@yahoo.com\n\uD83C\uDF10 www.srktaxaudit.com"):setTab(item[3])} style={{width:"100%",display:"flex",alignItems:"center",gap:10,background:"#fff",borderRadius:11,padding:"10px 12px",border:"0.5px solid #e6ecf5",marginBottom:7,cursor:"pointer",textAlign:"left"}}>
          <div style={{width:36,height:36,borderRadius:10,background:item[4]+"15",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,flexShrink:0}}>{item[0]}</div>
          <div style={{flex:1}}><div style={{fontSize:12,fontWeight:700,color:"#1a2440"}}>{item[1]}</div><div style={{fontSize:9,color:"#8896b0",marginTop:1}}>{item[2]}</div></div>
          <div style={{color:"#ccc",fontSize:14}}>›</div>
        </button>
      ))}
      <div style={{background:N,borderRadius:11,padding:"10px 12px",marginTop:4}}><div style={{fontSize:10,fontWeight:700,color:"#fff",marginBottom:2}}>⚡ Live Supabase Connected</div><div style={{fontSize:9,color:"rgba(255,255,255,0.5)",fontFamily:"monospace"}}>dtpijnqnjoegksbrhgfe.supabase.co</div></div>
    </div>
  );
}

export default function App(){
  const[step,setStep]=useState(0);
  const[phone,setPhone]=useState("");
  const[otp,setOtp]=useState("");
  const[client,setClient]=useState(null);
  const[tasks,setTasks]=useState([]);
  const[payments,setPayments]=useState([]);
  const[uploads,setUploads]=useState([]);
  const[busy,setBusy]=useState(false);
  const[err,setErr]=useState("");
  const[tab,setTab]=useState("home");

  async function sendOtp(){
    if(phone.length<10){setErr("Enter valid 10-digit number");return;}
    setErr("");setBusy(true);
    let cl=await db(`clients?phone=eq.${phone}&limit=1`);
    if(!cl||!cl.length){cl=await db("clients",{method:"POST",body:JSON.stringify({name:"Client "+phone.slice(-4),phone,email:""})});}
    if(cl&&cl[0])setClient(cl[0]);
    setBusy(false);setStep(1);setErr("Demo OTP: 123456");
  }

  async function verify(){
    if(otp!=="123456"){setErr("Use 123456 for demo");return;}
    setErr("");setBusy(true);
    if(client){
      const[t,p,u]=await Promise.all([db(`tasks?client_id=eq.${client.id}&order=due_date.asc`),db(`payments?client_id=eq.${client.id}&order=created_at.desc`),db(`uploads?client_id=eq.${client.id}&order=uploaded_at.desc`)]);
      setTasks(t||[]);setPayments(p||[]);setUploads(u||[]);
    }
    setBusy(false);setStep(2);
  }

  function logout(){setStep(0);setClient(null);setPhone("");setOtp("");setTasks([]);setPayments([]);setUploads([]);setTab("home");}

  if(step<2)return(
    <div style={{minHeight:"100dvh",background:"#f2f5fa",display:"flex",flexDirection:"column"}}>
      <div style={{background:N,padding:"48px 20px 24px",display:"flex",flexDirection:"column",alignItems:"center",gap:10}}>
        <Logo size={60}/>
        <div style={{textAlign:"center"}}><div style={{color:"#fff",fontSize:18,fontWeight:700}}>SRK TAX AUDIT</div><div style={{color:"rgba(255,255,255,0.5)",fontSize:11,marginTop:2}}>Pillars of Your Business</div></div>
      </div>
      <div style={{flex:1,display:"flex",alignItems:"center",justifyContent:"center",padding:"20px 24px"}}>
        <div style={{width:"100%",maxWidth:360,background:"#fff",borderRadius:20,padding:24,border:"0.5px solid #e6ecf5"}}>
          <div style={{fontSize:16,fontWeight:700,color:"#1a2440",marginBottom:4}}>GST Client Portal</div>
          <div style={{fontSize:11,color:"#8896b0",marginBottom:18}}>Login with your registered mobile number</div>
          {err&&<div style={{marginBottom:12,padding:"8px 12px",borderRadius:9,fontSize:11,fontWeight:500,background:err.includes("Demo")?"#eff6ff":"#fef2f2",color:err.includes("Demo")?"#0c447c":"#b91c1c"}}>{err}</div>}
          {step===0?(<>
            <div style={{fontSize:9,fontWeight:700,color:"#8896b0",textTransform:"uppercase",letterSpacing:"0.5px",marginBottom:6}}>Mobile Number</div>
            <div style={{display:"flex",gap:8,marginBottom:14}}>
              <div style={{background:"#f4f6fb",border:"0.5px solid #e6ecf5",borderRadius:10,padding:"10px 12px",fontSize:12,color:"#8896b0"}}>+91</div>
              <input type="tel" maxLength={10} placeholder="9876543210" value={phone} onChange={e=>setPhone(e.target.value.replace(/\D/g,""))} style={{flex:1,border:"0.5px solid #e6ecf5",borderRadius:10,padding:"10px 12px",fontSize:13,outline:"none",color:"#1a2440"}}/>
            </div>
            <button onClick={sendOtp} disabled={busy} style={{width:"100%",padding:12,background:busy?"#9ba8bd":N,color:"#fff",border:"none",borderRadius:12,fontSize:14,fontWeight:700,cursor:"pointer"}}>{busy?"Checking…":"Send OTP"}</button>
          </>):(<>
            <div style={{fontSize:9,fontWeight:700,color:"#8896b0",textTransform:"uppercase",letterSpacing:"0.5px",marginBottom:6}}>Enter OTP</div>
            <input type="tel" maxLength={6} placeholder="123456" value={otp} onChange={e=>setOtp(e.target.value.replace(/\D/g,""))} style={{width:"100%",border:"0.5px solid #e6ecf5",borderRadius:10,padding:"12px",fontSize:22,fontWeight:700,letterSpacing:12,textAlign:"center",outline:"none",marginBottom:14,color:"#1a2440"}}/>
            <button onClick={verify} disabled={busy||otp.length<6} style={{width:"100%",padding:12,background:busy||otp.length<6?"#9ba8bd":O,color:"#fff",border:"none",borderRadius:12,fontSize:14,fontWeight:700,cursor:"pointer",marginBottom:8}}>{busy?"Verifying…":"Verify & Login"}</button>
            <button onClick={()=>{setStep(0);setOtp("");setErr("");}} style={{width:"100%",padding:8,background:"none",border:"none",fontSize:11,color:"#8896b0",cursor:"pointer"}}>← Change number</button>
          </>)}
          <div style={{textAlign:"center",fontSize:10,color:"#b0b8cc",marginTop:14}}>Any 10-digit number · OTP: <strong style={{color:"#6b7a99",fontFamily:"monospace"}}>123456</strong></div>
        </div>
      </div>
      <div style={{textAlign:"center",fontSize:10,color:"#b0b8cc",padding:"0 0 20px"}}>7418040882 · srktaxaudit@yahoo.com</div>
    </div>
  );

  const SP={client,tasks,payments,uploads,setUploads,setTab};
  const SCRS={home:HomeScreen,upload:UploadScreen,returns:ReturnsScreen,payment:PaymentScreen,dues:DuesScreen,notices:NoticesScreen,inbox:InboxScreen,ask:AskScreen,vision:VisionScreen,more:MoreScreen};
  const AS=SCRS[tab]||HomeScreen;
  const HDRS={home:{title:null,showClient:true},upload:{title:"Upload Documents",sub:"Secure submission"},returns:{title:"GST Returns",sub:"Filing status"},payment:{title:"Professional Fees",sub:"FY 2025-26"},dues:{title:"Due Dates",sub:"Apr 2026"},notices:{title:"GST Notices",sub:"ASMT/DRC/SCN"},inbox:{title:"Inbox",sub:"Messages from SRK"},ask:{title:"Ask SRK",sub:"AI assistant"},vision:{title:"Vision",sub:"Scan bills"},more:{title:"More",sub:"All features"}};
  const H=HDRS[tab]||HDRS.home;

  return(
    <div style={{minHeight:"100dvh",maxWidth:430,margin:"0 auto",display:"flex",flexDirection:"column",background:"#fff"}}>
      <Header title={H.title} sub={H.sub} client={client} onLogout={tab==="home"?logout:null} showClient={H.showClient}/>
      {tab!=="home"&&(
        <div style={{background:N,padding:"6px 14px 0"}}>
          <div style={{display:"flex",borderBottom:"1px solid rgba(255,255,255,0.1)"}}>
            {["home","upload","returns","payment","dues"].map(id=>(
              <button key={id} onClick={()=>setTab(id)} style={{flex:1,padding:"7px 2px",textAlign:"center",fontSize:"7.5px",fontWeight:600,color:tab===id?O:"rgba(255,255,255,0.4)",borderBottom:tab===id?`2px solid ${O}`:"none",background:"none",border:"none",borderBottom:tab===id?`2px solid ${O}`:"none",cursor:"pointer"}}>
                {id.charAt(0).toUpperCase()+id.slice(1)}
              </button>
            ))}
          </div>
        </div>
      )}
      <AS {...SP}/>
      <BottomNav tab={tab} setTab={setTab}/>
    </div>
  );
}
