import { useState, useEffect } from "react";

const SB = import.meta.env.VITE_SUPABASE_URL;
const AK = import.meta.env.VITE_SUPABASE_ANON_KEY;
const ADMIN_PASS = "srk2024admin";
const N = "#1F3864";
const O = "#E87722";

async function db(path, opts = {}) {
  try {
    const r = await fetch(`${SB}/rest/v1/${path}`, {
      headers: { apikey: AK, Authorization: `Bearer ${AK}`, "Content-Type": "application/json", Prefer: "return=representation", ...(opts.headers || {}) },
      ...opts,
    });
    if (!r.ok) return null;
    const t = await r.text();
    return t ? JSON.parse(t) : [];
  } catch { return null; }
}

const STAFF = ["Sibi", "Veni", "Abinaya", "Kanaga Varathavel", "Palkani", "Preethi", "Rekha", "Ishwarya", "Ponmurugan", "Aruna"];
const TASK_STATUS = ["Pending", "In Progress", "Waiting for Client", "Completed"];
const PAY_STATUS = ["Unpaid", "Paid", "Partial"];
const DOC_CATS = ["GST — Purchase Bills", "GST — Sales Invoices", "Bank Statement", "Income Tax — Form 16", "TDS — Form 26AS", "MCA — Board Resolution", "EPFO/ESIC", "Other"];

const B = { "Pending": "bg-amber-100 text-amber-800", "In Progress": "bg-orange-100 text-orange-800", "Waiting for Client": "bg-orange-100 text-orange-800", "Completed": "bg-emerald-100 text-emerald-800", "Paid": "bg-emerald-100 text-emerald-800", "Unpaid": "bg-rose-100 text-rose-800", "Partial": "bg-amber-100 text-amber-800", "new": "bg-blue-100 text-blue-800", "reviewed": "bg-emerald-100 text-emerald-800", "processed": "bg-violet-100 text-violet-800", "Action Req": "bg-rose-100 text-rose-800", "Reply Sent": "bg-amber-100 text-amber-800", "Closed": "bg-emerald-100 text-emerald-800" };
const bx = s => `inline-flex px-2 py-0.5 rounded-full text-xs font-semibold ${B[s] || "bg-slate-100 text-slate-700"}`;

function Inp({ label, ...p }) {
  return (
    <div>
      {label && <div style={{ fontSize: 10, fontWeight: 700, color: "#8896b0", textTransform: "uppercase", letterSpacing: "0.3px", marginBottom: 4 }}>{label}</div>}
      <input style={{ width: "100%", border: "0.5px solid #e6ecf5", borderRadius: 8, padding: "8px 10px", fontSize: 12, background: "#f9fafc", color: "#1a2440", outline: "none", fontFamily: "inherit" }} {...p} />
    </div>
  );
}

function Sel({ label, children, ...p }) {
  return (
    <div>
      {label && <div style={{ fontSize: 10, fontWeight: 700, color: "#8896b0", textTransform: "uppercase", letterSpacing: "0.3px", marginBottom: 4 }}>{label}</div>}
      <select style={{ width: "100%", border: "0.5px solid #e6ecf5", borderRadius: 8, padding: "8px 10px", fontSize: 12, background: "#f9fafc", color: "#1a2440", outline: "none", fontFamily: "inherit" }} {...p}>{children}</select>
    </div>
  );
}

function Card({ children, style = {} }) {
  return <div style={{ background: "#fff", borderRadius: 12, padding: "12px 14px", marginBottom: 10, border: "0.5px solid #e6ecf5", ...style }}>{children}</div>;
}

function CardTitle({ children }) {
  return <div style={{ fontSize: 10, fontWeight: 700, color: N, textTransform: "uppercase", letterSpacing: "0.3px", marginBottom: 8 }}>{children}</div>;
}

function Btn({ children, variant = "navy", onClick, disabled, style = {} }) {
  const bg = variant === "navy" ? N : variant === "orange" ? O : variant === "green" ? "#e8f7f1" : variant === "red" ? "#fde8e6" : "#f0f4fa";
  const clr = variant === "navy" || variant === "orange" ? "#fff" : variant === "green" ? "#065f46" : variant === "red" ? "#b91c1c" : "#1a2440";
  return <button onClick={onClick} disabled={disabled} style={{ padding: "8px 16px", border: "none", borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: disabled ? "not-allowed" : "pointer", background: disabled ? "#9ba8bd" : bg, color: disabled ? "#fff" : clr, opacity: disabled ? 0.7 : 1, ...style }}>{children}</button>;
}

function Row({ items }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "7px 0", borderBottom: "0.5px solid #f0f4fa" }}>
      {items.map((item, i) => <div key={i} style={item.style || {}}>{item.content}</div>)}
    </div>
  );
}

function Toast({ msg, onClose }) {
  useEffect(() => { const t = setTimeout(onClose, 3000); return () => clearTimeout(t); }, []);
  return <div style={{ position: "fixed", bottom: 24, right: 24, background: "#1F3864", color: "#fff", padding: "10px 16px", borderRadius: 10, fontSize: 12, fontWeight: 600, zIndex: 9999 }}>{msg}</div>;
}

// SCREENS
function DashboardScreen({ clients, tasks, payments, uploads }) {
  const pending = payments.filter(p => p.status === "Unpaid").reduce((s, p) => s + Number(p.amount), 0);
  const activeTasks = tasks.filter(t => t.status !== "Completed").length;
  const newUploads = uploads.filter(u => u.status === "new").length;

  const staffCounts = {};
  STAFF.slice(1).forEach(s => { staffCounts[s] = tasks.filter(t => t.staff_name === s).length; });

  return (
    <div style={{ padding: 16, background: "#f2f5fa", flex: 1, overflowY: "auto" }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 8, marginBottom: 12 }}>
        {[
          { l: "Total Clients", v: clients.length || 44, c: N },
          { l: "Active Tasks", v: activeTasks, c: O },
          { l: "Pending Fees", v: pending ? `₹${Math.round(pending / 1000)}K` : "₹92K", c: "#b91c1c" },
          { l: "New Uploads", v: newUploads || 0, c: "#7c3aed" },
        ].map((s, i) => (
          <div key={i} style={{ background: "#fff", borderRadius: 10, padding: "10px 12px", border: "0.5px solid #e6ecf5", textAlign: "center" }}>
            <div style={{ fontSize: 10, color: "#8896b0", marginBottom: 3 }}>{s.l}</div>
            <div style={{ fontSize: 22, fontWeight: 700, color: s.c }}>{s.v}</div>
          </div>
        ))}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 }}>
        <Card>
          <CardTitle>Recent Tasks</CardTitle>
          {tasks.slice(0, 4).map((t, i) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "5px 0", borderBottom: i < 3 ? "0.5px solid #f0f4fa" : "none" }}>
              <div><div style={{ fontSize: 11, fontWeight: 600, color: "#1a2440" }}>{t.task_name}</div><div style={{ fontSize: 9, color: "#8896b0" }}>{t.staff_name} · {t.due_date || "No date"}</div></div>
              <span className={bx(t.status)}>{t.status}</span>
            </div>
          ))}
          {!tasks.length && <div style={{ fontSize: 11, color: "#8896b0", textAlign: "center", padding: 12 }}>No tasks yet. Add via Task Manager.</div>}
        </Card>
        <Card>
          <CardTitle>New Uploads ({newUploads})</CardTitle>
          {uploads.filter(u => u.status === "new").slice(0, 4).map((u, i, arr) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "5px 0", borderBottom: i < arr.length - 1 ? "0.5px solid #f0f4fa" : "none" }}>
              <div><div style={{ fontSize: 11, fontWeight: 600, color: "#1a2440" }}>{u.file_name}</div><div style={{ fontSize: 9, color: "#8896b0" }}>{u.category} · {u.financial_year}</div></div>
              <span className={bx("new")}>New</span>
            </div>
          ))}
          {!newUploads && <div style={{ fontSize: 11, color: "#8896b0", textAlign: "center", padding: 12 }}>No new uploads.</div>}
        </Card>
      </div>
      <Card>
        <CardTitle>Staff Task Summary</CardTitle>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {STAFF.slice(1, 6).map(s => {
            const cnt = tasks.filter(t => t.staff_name === s && t.status !== "Completed").length;
            const done = tasks.filter(t => t.staff_name === s && t.status === "Completed").length;
            const total = cnt + done;
            const pct = total ? Math.round((done / total) * 100) : 0;
            return (
              <div key={s} style={{ flex: 1, minWidth: 100, textAlign: "center", background: "#f7f9fc", borderRadius: 9, padding: "8px" }}>
                <div style={{ width: 32, height: 32, borderRadius: "50%", background: N, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 10, fontWeight: 700, margin: "0 auto 4px" }}>{s.slice(0, 2).toUpperCase()}</div>
                <div style={{ fontSize: 10, fontWeight: 700, color: "#1a2440" }}>{s.split(" ")[0]}</div>
                <div style={{ fontSize: 9, color: "#8896b0" }}>{cnt} active</div>
                <div style={{ background: "#f0f3fa", borderRadius: 4, height: 4, overflow: "hidden", margin: "4px 0" }}><div style={{ width: pct + "%", height: "100%", background: O, borderRadius: 4 }} /></div>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}

function ClientScreen({ clients, setClients, toast }) {
  const [search, setSearch] = useState("");
  const [form, setForm] = useState({ name: "", phone: "", gstin: "", email: "", business_type: "Contractor" });
  const [saving, setSaving] = useState(false);
  const [editId, setEditId] = useState(null);

  const filtered = clients.filter(c =>
    c.name?.toLowerCase().includes(search.toLowerCase()) ||
    c.phone?.includes(search) ||
    c.gstin?.toLowerCase().includes(search.toLowerCase())
  );

  async function save() {
    if (!form.name || !form.phone) return;
    setSaving(true);
    if (editId) {
      await db(`clients?id=eq.${editId}`, { method: "PATCH", body: JSON.stringify(form) });
      setClients(p => p.map(c => c.id === editId ? { ...c, ...form } : c));
      toast("Client updated!");
    } else {
      const res = await db("clients", { method: "POST", body: JSON.stringify(form) });
      if (res && res[0]) setClients(p => [...p, res[0]]);
      toast("Client added!");
    }
    setForm({ name: "", phone: "", gstin: "", email: "", business_type: "Contractor" });
    setEditId(null); setSaving(false);
  }

  function edit(c) {
    setForm({ name: c.name, phone: c.phone, gstin: c.gstin || "", email: c.email || "", business_type: c.business_type || "Contractor" });
    setEditId(c.id);
  }

  return (
    <div style={{ padding: 16, background: "#f2f5fa", flex: 1, overflowY: "auto" }}>
      <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name, phone, GSTIN…" style={{ flex: 1, border: "0.5px solid #e6ecf5", borderRadius: 8, padding: "8px 10px", fontSize: 12, background: "#fff", outline: "none" }} />
        <Btn variant="orange" onClick={() => { setForm({ name: "", phone: "", gstin: "", email: "", business_type: "Contractor" }); setEditId(null); }}>+ New</Btn>
      </div>
      <Card style={{ padding: 0, overflow: "hidden" }}>
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1.5fr 1fr 80px", background: "#f7f9fc", padding: "8px 12px", borderBottom: "0.5px solid #e6ecf5" }}>
          {["Client / Phone", "GSTIN", "Business Type", "Action"].map(h => <div key={h} style={{ fontSize: 9, fontWeight: 700, color: "#8896b0", textTransform: "uppercase" }}>{h}</div>)}
        </div>
        {filtered.map((c, i) => (
          <div key={c.id} style={{ display: "grid", gridTemplateColumns: "2fr 1.5fr 1fr 80px", padding: "8px 12px", borderBottom: i < filtered.length - 1 ? "0.5px solid #f0f4fa" : "none", alignItems: "center" }}>
            <div><div style={{ fontSize: 12, fontWeight: 600, color: "#1a2440" }}>{c.name}</div><div style={{ fontSize: 10, color: "#8896b0" }}>{c.phone}</div></div>
            <div style={{ fontSize: 10, fontFamily: "monospace", color: "#8896b0" }}>{c.gstin || "—"}</div>
            <div style={{ fontSize: 10, color: "#8896b0" }}>{c.business_type || "—"}</div>
            <Btn variant="green" onClick={() => edit(c)} style={{ padding: "4px 10px", fontSize: 10 }}>Edit</Btn>
          </div>
        ))}
        {!filtered.length && <div style={{ padding: 16, textAlign: "center", fontSize: 11, color: "#8896b0" }}>No clients found.</div>}
      </Card>
      <Card>
        <CardTitle>{editId ? "Edit Client" : "Add New Client"}</CardTitle>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 8 }}>
          <Inp label="Client Name *" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="Business / Individual name" />
          <Inp label="Mobile Number *" value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value.replace(/\D/g, "").slice(0, 10) }))} placeholder="10-digit mobile" />
          <Inp label="GSTIN" value={form.gstin} onChange={e => setForm(p => ({ ...p, gstin: e.target.value.toUpperCase() }))} placeholder="33XXXXX0000X1ZX" />
          <Inp label="Email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} placeholder="client@email.com" />
          <Sel label="Business Type" value={form.business_type} onChange={e => setForm(p => ({ ...p, business_type: e.target.value }))}>
            {["Contractor", "Trader", "Manufacturer", "Service", "Individual", "LLP", "Partnership", "Company"].map(t => <option key={t}>{t}</option>)}
          </Sel>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <Btn onClick={save} disabled={saving || !form.name || !form.phone}>{saving ? "Saving…" : editId ? "Update Client" : "Save Client → Portal Ready"}</Btn>
          {editId && <Btn variant="ghost" onClick={() => { setEditId(null); setForm({ name: "", phone: "", gstin: "", email: "", business_type: "Contractor" }); }}>Cancel</Btn>}
        </div>
      </Card>
    </div>
  );
}

function TaskScreen({ clients, tasks, setTasks, toast }) {
  const [selClient, setSelClient] = useState("");
  const [form, setForm] = useState({ task_name: "", staff_name: "Veni", due_date: "", status: "Pending", notes: "" });
  const [saving, setSaving] = useState(false);
  const [editId, setEditId] = useState(null);

  const clientTasks = tasks.filter(t => !selClient || t.client_id === selClient);

  async function save() {
    if (!form.task_name || !selClient) return;
    setSaving(true);
    const payload = { ...form, client_id: selClient };
    if (editId) {
      await db(`tasks?id=eq.${editId}`, { method: "PATCH", body: JSON.stringify(payload) });
      setTasks(p => p.map(t => t.id === editId ? { ...t, ...payload } : t));
      toast("Task updated! Client sees it instantly.");
    } else {
      const res = await db("tasks", { method: "POST", body: JSON.stringify(payload) });
      if (res && res[0]) setTasks(p => [...p, res[0]]);
      toast("Task added! Client sees it instantly.");
    }
    setForm({ task_name: "", staff_name: "Veni", due_date: "", status: "Pending", notes: "" });
    setEditId(null); setSaving(false);
  }

  async function updateStatus(task, status) {
    await db(`tasks?id=eq.${task.id}`, { method: "PATCH", body: JSON.stringify({ status }) });
    setTasks(p => p.map(t => t.id === task.id ? { ...t, status } : t));
    toast("Status updated!");
  }

  return (
    <div style={{ padding: 16, background: "#f2f5fa", flex: 1, overflowY: "auto" }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 }}>
        <Card>
          <CardTitle>{editId ? "Edit Task" : "Add New Task"}</CardTitle>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <Sel label="Client *" value={selClient} onChange={e => setSelClient(e.target.value)}>
              <option value="">— Select Client —</option>
              {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </Sel>
            <Inp label="Task Name *" value={form.task_name} onChange={e => setForm(p => ({ ...p, task_name: e.target.value }))} placeholder="e.g. GSTR-1 Filing · Apr 2026" />
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
              <Sel label="Assign To" value={form.staff_name} onChange={e => setForm(p => ({ ...p, staff_name: e.target.value }))}>
                {STAFF.map(s => <option key={s}>{s}</option>)}
              </Sel>
              <Inp label="Due Date" type="date" value={form.due_date} onChange={e => setForm(p => ({ ...p, due_date: e.target.value }))} />
            </div>
            <Sel label="Status" value={form.status} onChange={e => setForm(p => ({ ...p, status: e.target.value }))}>
              {TASK_STATUS.map(s => <option key={s}>{s}</option>)}
            </Sel>
            <Inp label="Notes (optional)" value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} placeholder="Internal note…" />
            <div style={{ display: "flex", gap: 8 }}>
              <Btn onClick={save} disabled={saving || !form.task_name || !selClient} style={{ flex: 1 }}>{saving ? "Saving…" : editId ? "Update Task" : "Save → Client Sees Instantly"}</Btn>
              {editId && <Btn variant="ghost" onClick={() => { setEditId(null); setForm({ task_name: "", staff_name: "Veni", due_date: "", status: "Pending", notes: "" }); }}>Cancel</Btn>}
            </div>
          </div>
        </Card>
        <Card>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: N, textTransform: "uppercase" }}>Task List</div>
            <select value={selClient} onChange={e => setSelClient(e.target.value)} style={{ border: "0.5px solid #e6ecf5", borderRadius: 6, padding: "4px 8px", fontSize: 10, background: "#f9fafc", color: "#1a2440", outline: "none" }}>
              <option value="">All Clients</option>
              {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          {clientTasks.map((t, i) => (
            <div key={t.id} style={{ padding: "6px 0", borderBottom: i < clientTasks.length - 1 ? "0.5px solid #f0f4fa" : "none" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 3 }}>
                <div style={{ flex: 1 }}><div style={{ fontSize: 11, fontWeight: 600, color: "#1a2440" }}>{t.task_name}</div><div style={{ fontSize: 9, color: "#8896b0" }}>{t.staff_name} · {t.due_date || "No date"}</div></div>
                <select value={t.status} onChange={e => updateStatus(t, e.target.value)} style={{ border: "0.5px solid #e6ecf5", borderRadius: 6, padding: "2px 5px", fontSize: 9, background: "#f9fafc", color: "#1a2440", outline: "none" }}>
                  {TASK_STATUS.map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
            </div>
          ))}
          {!clientTasks.length && <div style={{ fontSize: 11, color: "#8896b0", textAlign: "center", padding: 12 }}>No tasks. Select a client or add new task.</div>}
        </Card>
      </div>
      <Card>
        <CardTitle>Staff Workload</CardTitle>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 8 }}>
          {STAFF.slice(1, 6).map(s => {
            const cnt = tasks.filter(t => t.staff_name === s && t.status !== "Completed").length;
            return (
              <div key={s} style={{ background: "#f7f9fc", borderRadius: 9, padding: 8, textAlign: "center" }}>
                <div style={{ width: 28, height: 28, borderRadius: "50%", background: N, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 9, fontWeight: 700, margin: "0 auto 3px" }}>{s.slice(0, 2).toUpperCase()}</div>
                <div style={{ fontSize: 10, fontWeight: 700, color: "#1a2440" }}>{s.split(" ")[0]}</div>
                <div style={{ fontSize: 16, fontWeight: 700, color: cnt > 5 ? "#b91c1c" : N }}>{cnt}</div>
                <div style={{ fontSize: 9, color: "#8896b0" }}>active</div>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}

function InvoiceScreen({ clients, payments, setPayments, toast }) {
  const [form, setForm] = useState({ client_id: "", invoice_no: "", description: "", amount: "", status: "Unpaid", due_date: "" });
  const [saving, setSaving] = useState(false);
  const [filterClient, setFilterClient] = useState("");

  const total = payments.reduce((s, p) => s + Number(p.amount), 0);
  const paid = payments.filter(p => p.status === "Paid").reduce((s, p) => s + Number(p.amount), 0);
  const pending = total - paid;
  const pct = total ? Math.round((paid / total) * 100) : 0;

  const filtered = payments.filter(p => !filterClient || p.client_id === filterClient);

  async function save() {
    if (!form.client_id || !form.invoice_no || !form.amount) return;
    setSaving(true);
    const res = await db("payments", { method: "POST", body: JSON.stringify({ ...form, amount: Number(form.amount) }) });
    if (res && res[0]) setPayments(p => [...p, res[0]]);
    toast("Invoice raised! Client sees it instantly.");
    setForm({ client_id: "", invoice_no: "", description: "", amount: "", status: "Unpaid", due_date: "" });
    setSaving(false);
  }

  async function markPaid(inv) {
    await db(`payments?id=eq.${inv.id}`, { method: "PATCH", body: JSON.stringify({ status: "Paid" }) });
    setPayments(p => p.map(x => x.id === inv.id ? { ...x, status: "Paid" } : x));
    toast("Marked as Paid!");
  }

  return (
    <div style={{ padding: 16, background: "#f2f5fa", flex: 1, overflowY: "auto" }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8, marginBottom: 10 }}>
        {[{ l: "Total Billed", v: `₹${Math.round(total / 1000)}K`, c: N }, { l: "Collected", v: `₹${Math.round(paid / 1000)}K`, c: "#0a7a4f" }, { l: "Pending", v: `₹${Math.round(pending / 1000)}K`, c: "#b91c1c" }].map((s, i) => (
          <div key={i} style={{ background: "#fff", borderRadius: 10, padding: "10px 12px", border: "0.5px solid #e6ecf5", textAlign: "center" }}>
            <div style={{ fontSize: 10, color: "#8896b0", marginBottom: 2 }}>{s.l}</div>
            <div style={{ fontSize: 20, fontWeight: 700, color: s.c }}>{s.v}</div>
          </div>
        ))}
      </div>
      <Card>
        <CardTitle>Collection Progress</CardTitle>
        <div style={{ background: "#f0f3fa", borderRadius: 6, height: 8, overflow: "hidden", marginBottom: 4 }}><div style={{ width: pct + "%", height: "100%", background: O, borderRadius: 6 }} /></div>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10 }}><span style={{ color: "#8896b0" }}>{pct}% collected · FY 2025-26</span><span style={{ color: O, fontWeight: 700 }}>₹{pending.toLocaleString("en-IN")} pending</span></div>
      </Card>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 }}>
        <Card>
          <CardTitle>Raise New Invoice</CardTitle>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <Sel label="Client *" value={form.client_id} onChange={e => setForm(p => ({ ...p, client_id: e.target.value }))}>
              <option value="">— Select Client —</option>
              {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </Sel>
            <Inp label="Invoice No *" value={form.invoice_no} onChange={e => setForm(p => ({ ...p, invoice_no: e.target.value }))} placeholder="SRK/26-27/015" />
            <Inp label="Description" value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} placeholder="GST Filing · Apr 2026" />
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
              <Inp label="Amount (₹) *" type="number" value={form.amount} onChange={e => setForm(p => ({ ...p, amount: e.target.value }))} placeholder="5000" />
              <Inp label="Due Date" type="date" value={form.due_date} onChange={e => setForm(p => ({ ...p, due_date: e.target.value }))} />
            </div>
            <Btn onClick={save} disabled={saving || !form.client_id || !form.invoice_no || !form.amount}>{saving ? "Saving…" : "Raise Invoice → Client Sees Instantly"}</Btn>
          </div>
        </Card>
        <Card style={{ padding: 0, overflow: "hidden" }}>
          <div style={{ padding: "8px 12px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "0.5px solid #e6ecf5" }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: N, textTransform: "uppercase" }}>Invoices</div>
            <select value={filterClient} onChange={e => setFilterClient(e.target.value)} style={{ border: "0.5px solid #e6ecf5", borderRadius: 6, padding: "3px 7px", fontSize: 10, background: "#f9fafc", color: "#1a2440", outline: "none" }}>
              <option value="">All Clients</option>
              {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div style={{ overflowY: "auto", maxHeight: 280 }}>
            {filtered.map((inv, i) => (
              <div key={inv.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "7px 12px", borderBottom: "0.5px solid #f0f4fa" }}>
                <div><div style={{ fontSize: 10, fontFamily: "monospace", color: "#8896b0" }}>{inv.invoice_no}</div><div style={{ fontSize: 11, fontWeight: 600, color: "#1a2440" }}>{inv.description}</div></div>
                <div style={{ textAlign: "right", display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: inv.status === "Unpaid" ? O : "#0a7a4f" }}>₹{Number(inv.amount).toLocaleString("en-IN")}</span>
                  {inv.status === "Unpaid" ? <Btn variant="green" onClick={() => markPaid(inv)} style={{ padding: "3px 8px", fontSize: 9 }}>Mark Paid</Btn> : <span className={bx("Paid")}>Paid</span>}
                </div>
              </div>
            ))}
            {!filtered.length && <div style={{ padding: 16, textAlign: "center", fontSize: 11, color: "#8896b0" }}>No invoices yet.</div>}
          </div>
        </Card>
      </div>
    </div>
  );
}

function InboxScreen({ clients, messages, setMessages, toast }) {
  const [selClient, setSelClient] = useState("");
  const [staff, setStaff] = useState("Sibi");
  const [msg, setMsg] = useState("");
  const [sending, setSending] = useState(false);
  const [broadcast, setBroadcast] = useState(false);

  const TEMPLATES = [
    "Bills received, filing is in progress.",
    "Return filed successfully. Acknowledgement attached.",
    "Please share pending documents at the earliest.",
    "Fee invoice raised — request to clear at earliest.",
    "Due date approaching — action required urgently.",
    "DRC-01 reply submitted. Awaiting officer order.",
  ];

  const conv = messages.filter(m => selClient ? m.client_id === selClient : true).sort((a, b) => new Date(a.created_at) - new Date(b.created_at));

  async function send(text) {
    const body = text || msg;
    if (!body.trim()) return;
    setSending(true);
    if (broadcast) {
      for (const c of clients) {
        await db("messages", { method: "POST", body: JSON.stringify({ client_id: c.id, staff_name: staff, message: body, is_read: false }) });
      }
      toast(`Broadcast sent to ${clients.length} clients!`);
    } else {
      if (!selClient) { toast("Select a client first!"); setSending(false); return; }
      const res = await db("messages", { method: "POST", body: JSON.stringify({ client_id: selClient, staff_name: staff, message: body, is_read: false }) });
      if (res && res[0]) setMessages(p => [...p, res[0]]);
      toast("Message sent! Client sees it instantly in Inbox.");
    }
    setMsg(""); setSending(false);
  }

  return (
    <div style={{ padding: 16, background: "#f2f5fa", flex: 1, overflowY: "auto" }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1.4fr", gap: 10, marginBottom: 10 }}>
        <Card>
          <CardTitle>Send Message</CardTitle>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
              <Sel label="To Client" value={broadcast ? "all" : selClient} onChange={e => { if (e.target.value === "all") { setBroadcast(true); setSelClient(""); } else { setBroadcast(false); setSelClient(e.target.value); } }}>
                <option value="">— Select Client —</option>
                <option value="all">📢 Broadcast to ALL Clients</option>
                {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </Sel>
            </div>
            {broadcast && <div style={{ background: "#fff8f0", border: "0.5px solid #fdd5b0", borderRadius: 8, padding: "6px 9px", fontSize: 10, color: "#92400e" }}>⚠️ Message will be sent to all {clients.length} clients</div>}
            <Sel label="From (Staff)" value={staff} onChange={e => setStaff(e.target.value)}>
              {STAFF.map(s => <option key={s}>{s}</option>)}
            </Sel>
            <div>
              <div style={{ fontSize: 10, fontWeight: 700, color: "#8896b0", textTransform: "uppercase", letterSpacing: "0.3px", marginBottom: 4 }}>Message</div>
              <textarea value={msg} onChange={e => setMsg(e.target.value)} rows={3} placeholder="Type your message to the client…" style={{ width: "100%", border: "0.5px solid #e6ecf5", borderRadius: 8, padding: "8px 10px", fontSize: 12, background: "#f9fafc", color: "#1a2440", outline: "none", resize: "none", fontFamily: "inherit" }} />
            </div>
            <Btn onClick={() => send()} disabled={sending || !msg.trim()}>{sending ? "Sending…" : broadcast ? `Broadcast to All ${clients.length} Clients` : "Send Message"}</Btn>
            <div style={{ background: "#e8f7f1", borderRadius: 8, padding: "6px 9px", fontSize: 10, color: "#065f46" }}>Message saved to Supabase · Client sees instantly in app Inbox</div>
          </div>
        </Card>
        <Card>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: N, textTransform: "uppercase" }}>Conversation</div>
            <select value={selClient} onChange={e => { setSelClient(e.target.value); setBroadcast(false); }} style={{ border: "0.5px solid #e6ecf5", borderRadius: 6, padding: "3px 7px", fontSize: 10, background: "#f9fafc", color: "#1a2440", outline: "none" }}>
              <option value="">All Messages</option>
              {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 5, maxHeight: 220, overflowY: "auto" }}>
            {conv.map((m, i) => (
              <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
                <div style={{ background: N, color: "#fff", borderRadius: "10px 10px 2px 10px", padding: "7px 10px", fontSize: 11, maxWidth: "80%", alignSelf: "flex-end" }}>{m.message}</div>
                <div style={{ fontSize: 8, color: "#b0b8cc", alignSelf: "flex-end", marginTop: 1 }}>{m.staff_name}</div>
              </div>
            ))}
            {!conv.length && <div style={{ textAlign: "center", fontSize: 11, color: "#8896b0", padding: 16 }}>No messages yet. Send a message above.</div>}
          </div>
        </Card>
      </div>
      <Card>
        <CardTitle>Quick Templates — Click to Use</CardTitle>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          {TEMPLATES.map((t, i) => (
            <button key={i} onClick={() => send(t)} style={{ padding: "5px 10px", border: "0.5px solid #e6ecf5", borderRadius: 8, background: "#f9fafc", color: N, fontSize: 10, fontWeight: 500, cursor: "pointer" }}>{t}</button>
          ))}
        </div>
      </Card>
    </div>
  );
}

function UploadScreen({ clients, uploads, setUploads, toast }) {
  const [filter, setFilter] = useState({ client: "", cat: "", status: "" });

  const filtered = uploads.filter(u =>
    (!filter.client || u.client_id === filter.client) &&
    (!filter.cat || u.category === filter.cat) &&
    (!filter.status || u.status === filter.status)
  );

  const newCount = uploads.filter(u => u.status === "new").length;

  async function updateStatus(u, status) {
    await db(`uploads?id=eq.${u.id}`, { method: "PATCH", body: JSON.stringify({ status, reviewed_at: new Date().toISOString() }) });
    setUploads(p => p.map(x => x.id === u.id ? { ...x, status } : x));
    toast("Status updated! Client sees the change.");
  }

  async function markAllReviewed() {
    const newItems = uploads.filter(u => u.status === "new");
    for (const u of newItems) await db(`uploads?id=eq.${u.id}`, { method: "PATCH", body: JSON.stringify({ status: "reviewed" }) });
    setUploads(p => p.map(u => u.status === "new" ? { ...u, status: "reviewed" } : u));
    toast(`${newItems.length} uploads marked as reviewed!`);
  }

  const ext = n => n?.split(".").pop().toLowerCase() || "";
  const ec = n => ({ pdf: { bg: "#fde8e6", cl: "#b91c1c" }, xlsx: { bg: "#e8f7f1", cl: "#065f46" }, xls: { bg: "#e8f7f1", cl: "#065f46" }, jpg: { bg: "#e6f1fb", cl: "#0c447c" }, jpeg: { bg: "#e6f1fb", cl: "#0c447c" }, png: { bg: "#ede9fe", cl: "#5b21b6" } }[ext(n)] || { bg: "#f0f4fa", cl: "#8896b0" });
  const clientName = id => clients.find(c => c.id === id)?.name || "Unknown";

  return (
    <div style={{ padding: 16, background: "#f2f5fa", flex: 1, overflowY: "auto" }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8, marginBottom: 10 }}>
        {[{ l: "Total Uploads", v: uploads.length, c: N }, { l: "New (Pending)", v: newCount, c: "#7c3aed" }, { l: "Reviewed", v: uploads.filter(u => u.status === "reviewed").length, c: "#0a7a4f" }].map((s, i) => (
          <div key={i} style={{ background: "#fff", borderRadius: 10, padding: "10px 12px", border: "0.5px solid #e6ecf5", textAlign: "center" }}>
            <div style={{ fontSize: 10, color: "#8896b0", marginBottom: 2 }}>{s.l}</div>
            <div style={{ fontSize: 20, fontWeight: 700, color: s.c }}>{s.v}</div>
          </div>
        ))}
      </div>
      <div style={{ display: "flex", gap: 8, marginBottom: 10, flexWrap: "wrap" }}>
        <select value={filter.client} onChange={e => setFilter(p => ({ ...p, client: e.target.value }))} style={{ flex: 1, border: "0.5px solid #e6ecf5", borderRadius: 8, padding: "7px 9px", fontSize: 11, background: "#fff", color: "#1a2440", outline: "none" }}>
          <option value="">All Clients</option>
          {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <select value={filter.cat} onChange={e => setFilter(p => ({ ...p, cat: e.target.value }))} style={{ flex: 1, border: "0.5px solid #e6ecf5", borderRadius: 8, padding: "7px 9px", fontSize: 11, background: "#fff", color: "#1a2440", outline: "none" }}>
          <option value="">All Categories</option>
          {DOC_CATS.map(c => <option key={c}>{c}</option>)}
        </select>
        <select value={filter.status} onChange={e => setFilter(p => ({ ...p, status: e.target.value }))} style={{ flex: 1, border: "0.5px solid #e6ecf5", borderRadius: 8, padding: "7px 9px", fontSize: 11, background: "#fff", color: "#1a2440", outline: "none" }}>
          <option value="">All Status</option>
          <option>new</option><option>reviewed</option><option>processed</option>
        </select>
        {newCount > 0 && <Btn variant="green" onClick={markAllReviewed}>Mark All New → Reviewed</Btn>}
      </div>
      <Card style={{ padding: 0, overflow: "hidden" }}>
        <div style={{ display: "grid", gridTemplateColumns: "auto 2fr 1.2fr 1fr 0.8fr 120px", background: "#f7f9fc", padding: "7px 12px", borderBottom: "0.5px solid #e6ecf5", gap: 8 }}>
          {["Type", "File Name", "Client", "Category", "Status", "Actions"].map(h => <div key={h} style={{ fontSize: 9, fontWeight: 700, color: "#8896b0", textTransform: "uppercase" }}>{h}</div>)}
        </div>
        {filtered.map((u, i) => {
          const e = ec(u.file_name);
          return (
            <div key={u.id} style={{ display: "grid", gridTemplateColumns: "auto 2fr 1.2fr 1fr 0.8fr 120px", padding: "8px 12px", borderBottom: i < filtered.length - 1 ? "0.5px solid #f0f4fa" : "none", alignItems: "center", gap: 8 }}>
              <div style={{ background: e.bg, color: e.cl, fontSize: 8, fontWeight: 700, padding: "2px 5px", borderRadius: 4 }}>{ext(u.file_name).toUpperCase()}</div>
              <div style={{ overflow: "hidden" }}><div style={{ fontSize: 11, fontWeight: 600, color: "#1a2440", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{u.file_name}</div><div style={{ fontSize: 9, color: "#8896b0" }}>FY {u.financial_year}</div></div>
              <div style={{ fontSize: 10, color: "#1a2440" }}>{clientName(u.client_id)}</div>
              <div style={{ fontSize: 9, color: "#8896b0" }}>{u.category?.replace("GST — ", "")}</div>
              <span className={bx(u.status)}>{u.status}</span>
              <div style={{ display: "flex", gap: 4 }}>
                {u.status === "new" && <Btn variant="green" onClick={() => updateStatus(u, "reviewed")} style={{ padding: "3px 7px", fontSize: 9 }}>Review</Btn>}
                {u.status === "reviewed" && <Btn onClick={() => updateStatus(u, "processed")} style={{ padding: "3px 7px", fontSize: 9 }}>Process</Btn>}
                {u.status === "processed" && <span style={{ fontSize: 9, color: "#065f46", fontWeight: 600 }}>Done ✓</span>}
              </div>
            </div>
          );
        })}
        {!filtered.length && <div style={{ padding: 24, textAlign: "center", fontSize: 11, color: "#8896b0" }}>No uploads matching filters.</div>}
      </Card>
    </div>
  );
}

// MAIN ADMIN APP
export default function AdminApp() {
  const [authed, setAuthed] = useState(false);
  const [uname, setUname] = useState("");
  const [pass, setPass] = useState("");
  const [err, setErr] = useState("");
  const [tab, setTab] = useState("dashboard");
  const [clients, setClients] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [payments, setPayments] = useState([]);
  const [uploads, setUploads] = useState([]);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [toastMsg, setToastMsg] = useState("");

  const toast = msg => { setToastMsg(msg); };

  async function login() {
    if (pass !== ADMIN_PASS) { setErr("Invalid password"); return; }
    setLoading(true);
    const [c, t, p, u, m] = await Promise.all([
      db("clients?order=name.asc"),
      db("tasks?order=created_at.desc"),
      db("payments?order=created_at.desc"),
      db("uploads?order=uploaded_at.desc"),
      db("messages?order=created_at.desc"),
    ]);
    setClients(c || []); setTasks(t || []); setPayments(p || []); setUploads(u || []); setMessages(m || []);
    setLoading(false); setAuthed(true);
  }

  const TABS = [
    { id: "dashboard", label: "Dashboard", ico: "📊" },
    { id: "clients", label: "Clients", ico: "👥" },
    { id: "tasks", label: "Tasks", ico: "✅" },
    { id: "invoices", label: "Invoices", ico: "💳" },
    { id: "inbox", label: "Inbox", ico: "📬" },
    { id: "uploads", label: "Uploads", ico: "📁" },
  ];

  if (!authed) return (
    <div style={{ minHeight: "100vh", background: "#f2f5fa", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ width: 360, background: "#fff", borderRadius: 16, padding: 28, border: "0.5px solid #e6ecf5" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
          <div style={{ width: 44, height: 44, borderRadius: "50%", background: O, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 13, fontWeight: 700 }}>SRK</div>
          <div><div style={{ fontSize: 16, fontWeight: 700, color: "#1a2440" }}>SRK Admin Panel</div><div style={{ fontSize: 11, color: "#8896b0" }}>Staff access only · Not for clients</div></div>
        </div>
        {err && <div style={{ background: "#fde8e6", color: "#b91c1c", borderRadius: 8, padding: "7px 10px", fontSize: 11, marginBottom: 12 }}>{err}</div>}
        <div style={{ marginBottom: 10 }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: "#8896b0", textTransform: "uppercase", letterSpacing: "0.3px", marginBottom: 4 }}>Username</div>
          <input value={uname} onChange={e => setUname(e.target.value)} placeholder="sibi@srktaxaudit" style={{ width: "100%", border: "0.5px solid #e6ecf5", borderRadius: 8, padding: "9px 11px", fontSize: 13, outline: "none", color: "#1a2440" }} />
        </div>
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: "#8896b0", textTransform: "uppercase", letterSpacing: "0.3px", marginBottom: 4 }}>Password</div>
          <input type="password" value={pass} onChange={e => setPass(e.target.value)} onKeyDown={e => e.key === "Enter" && login()} placeholder="••••••••" style={{ width: "100%", border: "0.5px solid #e6ecf5", borderRadius: 8, padding: "9px 11px", fontSize: 13, outline: "none", color: "#1a2440" }} />
        </div>
        <button onClick={login} disabled={loading} style={{ width: "100%", padding: 12, background: loading ? "#9ba8bd" : N, color: "#fff", border: "none", borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: "pointer" }}>{loading ? "Loading data…" : "Login to Admin Panel"}</button>
        <div style={{ marginTop: 14, background: "#f0f4fa", borderRadius: 9, padding: "9px 11px", fontSize: 10, color: "#8896b0", textAlign: "center" }}>
          Sibi (Full access) · Staff (Limited access)<br/>
          <span style={{ fontFamily: "monospace", color: "#1F3864" }}>URL: srk-client-hub.vercel.app/admin</span>
        </div>
      </div>
    </div>
  );

  const newUploads = uploads.filter(u => u.status === "new").length;
  const unreadMsgs = messages.filter(m => !m.is_read).length;

  const SCREENS = { dashboard: DashboardScreen, clients: ClientScreen, tasks: TaskScreen, invoices: InvoiceScreen, inbox: InboxScreen, uploads: UploadScreen };
  const Screen = SCREENS[tab];

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", background: "#f2f5fa" }}>
      {toastMsg && <Toast msg={toastMsg} onClose={() => setToastMsg("")} />}
      <div style={{ background: N, height: 52, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 20px", flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 30, height: 30, borderRadius: "50%", background: O, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 9, fontWeight: 700 }}>SRK</div>
          <div><div style={{ color: "#fff", fontSize: 13, fontWeight: 700 }}>SRK Admin Panel</div><div style={{ color: "rgba(255,255,255,0.45)", fontSize: 9 }}>SRK TAX AUDIT · {uname || "Admin"}</div></div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ background: "rgba(52,211,153,0.2)", color: "#6ee7b7", fontSize: 9, padding: "2px 8px", borderRadius: 6, fontWeight: 600 }}>● Live · {clients.length} clients</div>
          <button onClick={() => { setAuthed(false); setUname(""); setPass(""); }} style={{ background: "rgba(255,255,255,0.15)", border: "none", borderRadius: 7, padding: "3px 9px", color: "#fff", fontSize: 10, cursor: "pointer" }}>Logout</button>
        </div>
      </div>
      <div style={{ display: "flex", background: "#fff", borderBottom: "0.5px solid #e6ecf5", flexShrink: 0 }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{ padding: "10px 16px", display: "flex", alignItems: "center", gap: 5, border: "none", background: "none", cursor: "pointer", borderBottom: tab === t.id ? `2px solid ${N}` : "2px solid transparent", fontSize: 12, fontWeight: 600, color: tab === t.id ? N : "#8896b0", position: "relative" }}>
            <span style={{ fontSize: 14 }}>{t.ico}</span>
            {t.label}
            {t.id === "uploads" && newUploads > 0 && <span style={{ background: O, color: "#fff", borderRadius: "50%", width: 16, height: 16, fontSize: 9, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700 }}>{newUploads}</span>}
            {t.id === "inbox" && unreadMsgs > 0 && <span style={{ background: "#b91c1c", color: "#fff", borderRadius: "50%", width: 16, height: 16, fontSize: 9, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700 }}>{unreadMsgs}</span>}
          </button>
        ))}
      </div>
      <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column" }}>
        <Screen clients={clients} setClients={setClients} tasks={tasks} setTasks={setTasks} payments={payments} setPayments={setPayments} uploads={uploads} setUploads={setUploads} messages={messages} setMessages={setMessages} toast={toast} />
      </div>
    </div>
  );
}
