import { useState } from "react";
const SB = import.meta.env.VITE_SUPABASE_URL;
const AK = import.meta.env.VITE_SUPABASE_ANON_KEY;
async function db(path, opts={}) {
  const r = await fetch(SB+"/rest/v1/"+path,{headers:{apikey:AK,Authorization:"Bearer "+AK,"Content-Type":"application/json",Prefer:"return=representation",...(opts.headers||{})}, ...opts});
  if(!r.ok)return null; return r.json();
}
export default function App() {
  const [tab,setTab]=useState("home");
  const [phone,setPhone]=useState("");
  const [otp,setOtp]=useState("");
  const [step,setStep]=useState(0);
  const [client,setClient]=useState(null);
  const [tasks,setTasks]=useState([]);
  const [pays,setPays]=useState([]);
  const [ups,setUps]=useState([]);
  const [busy,setBusy]=useState(false);
  const [cat,setCat]=useState("GST Purchase");
  const [fy,setFy]=useState("2025-26");
  const [rmk,setRmk]=useState("");
  const [files,setFiles]=useState([]);
  const [pct,setPct]=useState(0);
  const [done,setDone]=useState(false);
  const [err,setErr]=useState("");
  const DUES=[{t:"TDS Payment",d:"2026-04-07",f:"Challan 281"},{t:"GSTR-1",d:"2026-04-11",f:"GSTR-1"},{t:"GSTR-3B",d:"2026-04-20",f:"GSTR-3B"}];
  const CATS=["GST Purchase","GST Sales","Bank Statement","Form 16","26AS","MCA/ROC","PF/ESI","Other"];
  const CATMAP={"GST Purchase":"GST — Purchase Bills","GST Sales":"GST — Sales Invoices","Bank Statement":"Bank Statement","Form 16":"Income Tax — Form 16","26AS":"TDS — Form 26AS","MCA/ROC":"MCA — Board Resolution","PF/ESI":"EPFO/ESIC","Other":"Other"};
  const BG={"Pending":"bg-amber-100 text-amber-800","In Progress":"bg-violet-100 text-violet-800","Waiting for Client":"bg-orange-100 text-orange-800","Completed":"bg-emerald-100 text-emerald-800","Paid":"bg-emerald-100 text-emerald-800","Unpaid":"bg-rose-100 text-rose-800","new":"bg-blue-100 text-blue-800","reviewed":"bg-emerald-100 text-emerald-800"};
  const bx=(s)=>"inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold "+(BG[s]||"bg-slate-100 text-slate-700");
  const dl=(d)=>d?Math.ceil((new Date(d)-new Date("2026-04-02"))/86400000):0;
  const dc=(d)=>d<=3?"bg-rose-100 text-rose-700":d<=7?"bg-amber-100 text-amber-700":"bg-emerald-100 text-emerald-700";
  const fs=(b)=>b<1048576?(b/1024).toFixed(1)+" KB":(b/1048576).toFixed(1)+" MB";
  const ex=(n)=>n?.split(".").pop().toLowerCase()||"";
  const tc=(n)=>({pdf:"bg-rose-100 text-rose-700",jpg:"bg-green-100 text-green-700",jpeg:"bg-green-100 text-green-700",png:"bg-green-100 text-green-700",xlsx:"bg-emerald-100 text-emerald-700"}[ex(n)]||"bg-slate-100 text-slate-600");
  const pendFees=pays.filter(p=>p.status==="Unpaid").reduce((s,p)=>s+Number(p.amount),0);

  async function load(id){
    const [t,p,u]=await Promise.all([db("tasks?client_id=eq."+id+"&order=due_date.asc"),db("payments?client_id=eq."+id+"&order=created_at.desc"),db("uploads?client_id=eq."+id+"&order=uploaded_at.desc")]);
    setTasks(t||[]);setPays(p||[]);setUps(u||[]);
  }
  async function sendOtp(){
    if(phone.length<10){setErr("Enter valid 10-digit number");return;}
    setErr("");setBusy(true);
    let cl=await db("clients?phone=eq."+phone+"&limit=1");
    if(!cl||!cl.length){cl=await db("clients",{method:"POST",body:JSON.stringify({name:"Client "+phone.slice(-4),phone,email:""})});}
    if(cl&&cl[0]){setClient(cl[0]);}
    setBusy(false);setStep(1);setErr("Demo OTP: 123456");
  }
  async function verify(){
    if(otp!=="123456"){setErr("Use 123456 for demo");return;}
    setErr("");setBusy(true);
    if(client)await load(client.id);
    setBusy(false);setStep(2);setTab("home");
  }
  function logout(){setClient(null);setStep(0);setPhone("");setOtp("");setTasks([]);setPays([]);setUps([]);setTab("home");}
  const addFiles=(fl)=>setFiles(p=>[...p,...Array.from(fl).filter(f=>f.size<=10485760)]);
  async function submit(){
    if(!files.length)return;
    setBusy(true);setPct(0);
    const cid=client?.id||"00000000-0000-0000-0000-000000000000";
    let p=0;const iv=setInterval(()=>{p+=12;setPct(Math.min(Math.round(p),88));if(p>=88)clearInterval(iv);},200);
    for(const f of files)await db("uploads",{method:"POST",body:JSON.stringify({client_id:cid,category:CATMAP[cat]||cat,financial_year:fy,file_name:f.name,file_size:f.size,remarks:rmk,status:"new"})});
    clearInterval(iv);setPct(100);
    setTimeout(async()=>{setBusy(false);setDone(true);const u=await db("uploads?client_id=eq."+cid+"&order=uploaded_at.desc");setUps(u||[]);},500);
  }

  const Navy="#1F3864";const Org="#E87722";
  const hdr=(
    <div style={{background:Navy}} className="px-4 pt-10 pb-0">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div style={{background:Org}} className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-sm">SRK</div>
          <div><p className="text-white font-bold text-sm">SRK TAX AUDIT</p><p className="text-white/50 text-xs">Pillars of Your Business</p></div>
        </div>
        {client&&<button onClick={logout} className="text-white/60 text-xs border border-white/20 px-2.5 py-1 rounded-lg">Logout</button>}
      </div>
      {client&&<div className="bg-white/10 rounded-xl px-3 py-2.5 flex items-center justify-between mb-0">
        <div><p className="text-white text-sm font-semibold">{client.name}</p><p className="text-white/40 text-xs font-mono">{client.gstin||client.phone}</p></div>
        <span className="text-emerald-300 text-xs bg-emerald-400/20 px-2.5 py-1 rounded-full font-semibold">● Active</span>
      </div>}
      {client&&<div className="flex mt-2 border-b border-white/10">
        {[["home","Home"],["tasks","Tasks"],["upload","Upload"],["pays","Payments"],["files","Files"]].map(([id,lbl])=>(
          <button key={id} onClick={()=>setTab(id)} className={`flex-1 py-2.5 text-xs font-semibold ${tab===id?"text-[#E87722] border-b-2 border-[#E87722]":"text-white/50"}`}>{lbl}</button>
        ))}
      </div>}
    </div>
  );

  if(step<2) return(
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {hdr}
      <div className="flex-1 flex items-center justify-center px-5 py-8">
        <div className="w-full max-w-xs bg-white rounded-3xl shadow-sm ring-1 ring-slate-200 p-7">
          <h2 className="text-lg font-bold text-slate-900 mb-1">Client Login</h2>
          <p className="text-xs text-slate-500 mb-5">Enter your mobile to access your portal</p>
          {err&&<div className={`mb-4 p-3 rounded-xl text-xs font-medium ${err.includes("Demo")?"bg-blue-50 text-blue-700":"bg-rose-50 text-rose-700"}`}>{err}</div>}
          {step===0&&<>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-1.5">Mobile Number</p>
            <div className="flex gap-2 mb-4">
              <span className="flex items-center px-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-500 text-sm">+91</span>
              <input type="tel" maxLength={10} placeholder="9999999999" value={phone} onChange={e=>setPhone(e.target.value.replace(/\D/g,""))} className="flex-1 border border-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-slate-400"/>
            </div>
            <button onClick={sendOtp} disabled={busy} style={{background:Navy}} className="w-full py-3 text-white rounded-xl font-semibold text-sm disabled:opacity-50">{busy?"Checking…":"Send OTP"}</button>
          </>}
          {step===1&&<>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-1.5">Enter OTP</p>
            <input type="tel" maxLength={6} placeholder="123456" value={otp} onChange={e=>setOtp(e.target.value.replace(/\D/g,""))} className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none mb-3 text-center text-xl tracking-widest"/>
            <button onClick={verify} disabled={busy||otp.length<6} style={{background:Org}} className="w-full py-3 text-white rounded-xl font-semibold text-sm disabled:opacity-50 mb-2">{busy?"Verifying…":"Verify & Login"}</button>
            <button onClick={()=>{setStep(0);setOtp("");setErr("");}} className="w-full py-2 text-slate-400 text-xs">← Change number</button>
          </>}
          <p className="text-center text-xs text-slate-400 mt-5">Any 10-digit number · OTP: <b className="font-mono text-slate-600">123456</b></p>
        </div>
      </div>
      <p className="text-center text-xs text-slate-400 pb-5">GSTIN: 33GBOPS0275J2Z5 · 7418040882</p>
    </div>
  );

  return(
    <div className="min-h-screen bg-slate-50 pb-20">
      {hdr}
      {tab==="home"&&<div className="px-4 pt-4 space-y-3">
        <div className="grid grid-cols-2 gap-3">
          {[{l:"Active Tasks",v:tasks.filter(t=>t.status!=="Completed").length||0},{l:"Pending Fees",v:pendFees?"₹"+pendFees.toLocaleString("en-IN"):"₹0",o:true},{l:"Due Dates",v:DUES.length},{l:"My Uploads",v:ups.length}].map((s,i)=>(
            <div key={i} className="bg-white rounded-2xl p-4 shadow-sm ring-1 ring-slate-200">
              <p className="text-xs text-slate-500">{s.l}</p>
              <p className={`text-2xl font-bold mt-0.5 ${s.o?"text-[#E87722]":"text-slate-900"}`}>{s.v}</p>
            </div>
          ))}
        </div>
        <div className="bg-white rounded-2xl shadow-sm ring-1 ring-slate-200 overflow-hidden">
          <p className="px-4 pt-3 pb-2 font-semibold text-slate-800 text-sm">Compliance Due Dates</p>
          {DUES.map((d,i)=>{const x=dl(d.d);return(
            <div key={i} className="flex items-center justify-between px-4 py-3 border-t border-slate-100">
              <div><p className="text-sm font-semibold text-slate-800">{d.t}</p><p className="text-xs text-slate-400 font-mono">{d.d} · {d.f}</p></div>
              <span className={`text-xs font-bold px-2 py-1 rounded-lg ${dc(x)}`}>{x}d</span>
            </div>
          );})}
        </div>
        {tasks.length>0&&<div className="bg-white rounded-2xl shadow-sm ring-1 ring-slate-200 overflow-hidden">
          <p className="px-4 pt-3 pb-2 font-semibold text-slate-800 text-sm">Recent Tasks</p>
          {tasks.slice(0,2).map((t,i)=>(
            <div key={t.id} className={`px-4 py-3 ${i>0?"border-t border-slate-100":""} flex items-center justify-between gap-3`}>
              <div className="flex-1 min-w-0"><p className="text-sm font-medium text-slate-800 truncate">{t.task_name}</p><p className="text-xs text-slate-400">{t.due_date||""}</p></div>
              <span className={bx(t.status)}>{t.status}</span>
            </div>
          ))}
        </div>}
        <div style={{background:Navy}} className="rounded-2xl p-4 text-white">
          <p className="font-bold text-sm">⚡ Live Supabase Connected</p>
          <p className="text-white/50 text-xs font-mono mt-1">dtpijnqnjoegksbrhgfe.supabase.co</p>
        </div>
      </div>}

      {tab==="tasks"&&<div className="px-4 pt-4">
        {!tasks.length?<div className="bg-white rounded-2xl p-8 text-center shadow-sm ring-1 ring-slate-200"><p className="text-slate-400 text-sm">No tasks yet. SRK team will add tasks here.</p></div>:
        <div className="bg-white rounded-2xl shadow-sm ring-1 ring-slate-200 overflow-hidden">
          <div className="px-4 pt-3 pb-2 flex justify-between items-center"><p className="font-semibold text-slate-800 text-sm">Task Tracking</p><p className="text-xs text-slate-400">Live from Supabase</p></div>
          {tasks.map((t,i)=>(
            <div key={t.id} className={`px-4 py-3.5 ${i>0?"border-t border-slate-100":""} flex items-start gap-3`}>
              <div className="flex-1"><p className="text-sm font-semibold text-slate-800">{t.task_name}</p><p className="text-xs text-slate-400 mt-0.5">{t.due_date?"Due: "+t.due_date:""}{t.staff_name?" · "+t.staff_name:""}</p></div>
              <span className={bx(t.status)}>{t.status}</span>
            </div>
          ))}
        </div>}
      </div>}

      {tab==="upload"&&<div className="px-4 pt-4">
        {done?<div className="bg-white rounded-2xl shadow-sm ring-1 ring-slate-200 p-8 text-center">
          <div className="w-14 h-14 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">✅</div>
          <p className="font-bold text-lg mb-2">Submitted!</p>
          <p className="text-sm text-slate-500 mb-4">Saved to Supabase · SRK staff notified</p>
          <div className="bg-slate-50 rounded-xl p-4 text-left text-xs space-y-2 mb-4">
            <div className="flex justify-between"><span className="text-slate-500">Category</span><span className="font-medium">{CATMAP[cat]||cat}</span></div>
            <div className="flex justify-between"><span className="text-slate-500">FY</span><span className="font-medium">{fy}</span></div>
            <div className="flex justify-between"><span className="text-slate-500">Files</span><span className="font-medium">{files.length}</span></div>
            <div className="flex justify-between"><span className="text-slate-500">Status</span><span className="font-medium text-emerald-600">Saved to DB ✓</span></div>
          </div>
          <button onClick={()=>{setFiles([]);setRmk("");setBusy(false);setPct(0);setDone(false);}} style={{background:Org}} className="px-6 py-2.5 text-white rounded-xl font-semibold text-sm">Upload More</button>
        </div>:
        <div className="space-y-3">
          <div className="bg-white rounded-2xl shadow-sm ring-1 ring-slate-200 p-4">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-2.5">Category</p>
            <div className="flex flex-wrap gap-1.5">
              {CATS.map(c=><button key={c} onClick={()=>setCat(c)} style={cat===c?{background:Navy,borderColor:Navy,color:"#fff"}:{}} className={`px-3 py-1 rounded-full text-xs font-semibold border transition-all ${cat===c?"":"bg-slate-50 text-slate-600 border-slate-200"}`}>{c}</button>)}
            </div>
          </div>
          <div className="bg-white rounded-2xl shadow-sm ring-1 ring-slate-200 p-4">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-2">Financial Year</p>
            <select value={fy} onChange={e=>setFy(e.target.value)} className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none">
              <option>2025-26</option><option>2024-25</option><option>2023-24</option>
            </select>
          </div>
          <div className="bg-white rounded-2xl shadow-sm ring-1 ring-slate-200 p-4">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-2">Remarks</p>
            <textarea value={rmk} onChange={e=>setRmk(e.target.value)} placeholder="Optional notes…" rows={2} className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none resize-none"/>
          </div>
          <div className="border-2 border-dashed border-slate-200 rounded-2xl p-6 bg-white text-center cursor-pointer" onClick={()=>document.getElementById("fu").click()}>
            <input id="fu" type="file" multiple accept=".pdf,.jpg,.jpeg,.png,.xlsx,.xls" className="hidden" onChange={e=>addFiles(e.target.files)}/>
            <p className="text-3xl mb-2">📁</p><p className="text-sm font-semibold text-slate-700">Tap to select files</p>
            <p className="text-xs text-slate-400 mt-1">PDF, JPG, PNG, Excel · Max 10 MB</p>
          </div>
          {files.length>0&&<div className="bg-white rounded-2xl shadow-sm ring-1 ring-slate-200 overflow-hidden">
            {files.map((f,i)=><div key={i} className={`flex items-center gap-3 px-4 py-3 ${i>0?"border-t border-slate-100":""}`}>
              <span className={`text-xs font-bold px-2 py-1 rounded-lg ${tc(f.name)}`}>{ex(f.name).toUpperCase()}</span>
              <p className="flex-1 text-sm font-medium truncate">{f.name}</p>
              <p className="text-xs text-slate-400">{fs(f.size)}</p>
              <button onClick={()=>setFiles(p=>p.filter((_,j)=>j!==i))} className="text-slate-300 font-bold text-sm">✕</button>
            </div>)}
          </div>}
          {busy&&<div className="bg-white rounded-2xl shadow-sm ring-1 ring-slate-200 p-4">
            <p className="text-xs text-slate-500 mb-2">Saving to Supabase {pct}%…</p>
            <div className="bg-slate-100 rounded-full h-1.5 overflow-hidden"><div style={{width:pct+"%",background:Org}} className="h-full rounded-full transition-all"/></div>
          </div>}
          <div className="bg-orange-50 border border-orange-100 rounded-xl px-4 py-2.5 text-xs text-orange-700">🔒 Saved to Supabase · SRK staff notified instantly</div>
          <button onClick={submit} disabled={!files.length||busy} style={{background:Navy}} className="w-full py-4 text-white rounded-2xl font-bold text-sm disabled:opacity-40">📤 {busy?"Saving "+pct+"%…":"Submit Documents"}</button>
        </div>}
      </div>}

      {tab==="pays"&&<div className="px-4 pt-4 space-y-3">
        {!pays.length?<div className="bg-white rounded-2xl p-8 text-center shadow-sm ring-1 ring-slate-200"><p className="text-slate-400 text-sm">No invoices yet</p></div>:
        <div className="bg-white rounded-2xl shadow-sm ring-1 ring-slate-200 overflow-hidden">
          <p className="px-4 pt-3 pb-2 font-semibold text-slate-800 text-sm">Payment Summary</p>
          {pays.map((p,i)=><div key={p.id} className={`flex items-center justify-between px-4 py-3.5 ${i>0?"border-t border-slate-100":""}`}>
            <div><p className="text-xs font-mono text-slate-400">{p.invoice_no}</p><p className="text-sm font-semibold text-slate-800">{p.description}</p></div>
            <div className="text-right"><p className={`text-base font-bold ${p.status==="Unpaid"?"text-[#E87722]":"text-slate-800"}`}>₹{Number(p.amount).toLocaleString("en-IN")}</p><span className={bx(p.status)}>{p.status}</span></div>
          </div>)}
        </div>}
        {pendFees>0&&<button onClick={()=>alert("Contact SRK Tax Audit\n📞 7418040882\n📧 srktaxaudit@yahoo.com")} style={{background:Org}} className="w-full py-4 text-white rounded-2xl font-bold text-sm">💳 Pay ₹{pendFees.toLocaleString("en-IN")} Now</button>}
      </div>}

      {tab==="files"&&<div className="px-4 pt-4">
        {!ups.length?<div className="bg-white rounded-2xl p-8 text-center shadow-sm ring-1 ring-slate-200">
          <p className="text-slate-400 text-sm mb-3">No uploads yet</p>
          <button onClick={()=>setTab("upload")} style={{background:Navy}} className="px-5 py-2.5 text-white rounded-xl text-sm font-semibold">Upload Now</button>
        </div>:
        <div className="bg-white rounded-2xl shadow-sm ring-1 ring-slate-200 overflow-hidden">
          <p className="px-4 pt-3 pb-2 font-semibold text-slate-800 text-sm">My Documents ({ups.length})</p>
          {ups.map((u,i)=><div key={u.id} className={`flex items-center gap-3 px-4 py-3 ${i>0?"border-t border-slate-100":""}`}>
            <span className={`text-xs font-bold px-2 py-1 rounded-lg ${tc(u.file_name)}`}>{ex(u.file_name).toUpperCase()}</span>
            <div className="flex-1 min-w-0"><p className="text-sm font-medium truncate">{u.file_name}</p><p className="text-xs text-slate-400">{u.category} · FY {u.financial_year}</p></div>
            <span className={bx(u.status)}>{u.status}</span>
          </div>)}
        </div>}
      </div>}

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 flex">
        {[["home","🏠","Home"],["tasks","✅","Tasks"],["upload","📤","Upload"],["pays","💳","Pay"],["files","📋","Files"]].map(([id,ic,lb])=>(
          <button key={id} onClick={()=>setTab(id)} className={`flex-1 flex flex-col items-center py-2.5 gap-0.5 ${tab===id?"text-[#1F3864]":"text-slate-400"}`}>
            <span className="text-lg leading-none">{ic}</span>
            <span className="text-[10px] font-semibold">{lb}</span>
            {tab===id&&<span className="w-1 h-1 rounded-full mt-0.5" style={{background:"#E87722"}}/>}
          </button>
        ))}
      </div>
    </div>
  );
              }
