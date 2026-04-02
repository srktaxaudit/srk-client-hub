export default function SRKClientAppMVP() {
  const stats = [
    { label: 'Pending Tasks', value: '04' },
    { label: 'Documents Needed', value: '02' },
    { label: 'Upcoming Due Dates', value: '03' },
    { label: 'Pending Fees', value: '₹5,000' },
  ];

  const tasks = [
    {
      task: 'GSTR-1 Filing - Mar 2026',
      status: 'In Progress',
      due: '11 Apr 2026',
      staff: 'Accounts Team',
    },
    {
      task: 'GSTR-3B Filing - Mar 2026',
      status: 'Waiting for Client',
      due: '20 Apr 2026',
      staff: 'GST Team',
    },
    {
      task: 'IT Notice Reply',
      status: 'Pending',
      due: '15 Apr 2026',
      staff: 'IT Section',
    },
  ];

  const dues = [
    { title: 'GSTR-1', date: '11 Apr 2026', status: 'Pending' },
    { title: 'GSTR-3B', date: '20 Apr 2026', status: 'Pending' },
    { title: 'TDS Payment', date: '07 Apr 2026', status: 'Upcoming' },
  ];

  const docs = [
    'Upload purchase bills',
    'Upload bank statement',
    'Share notice copy',
  ];

  const payments = [
    { invoice: 'SRK/26-27/014', amount: '₹5,000', status: 'Unpaid' },
    { invoice: 'SRK/26-27/009', amount: '₹12,000', status: 'Paid' },
  ];

  const badge = (status) => {
    const map = {
      Pending: 'bg-amber-100 text-amber-800',
      Upcoming: 'bg-blue-100 text-blue-800',
      'In Progress': 'bg-violet-100 text-violet-800',
      'Waiting for Client': 'bg-orange-100 text-orange-800',
      Completed: 'bg-emerald-100 text-emerald-800',
      Paid: 'bg-emerald-100 text-emerald-800',
      Unpaid: 'bg-rose-100 text-rose-800',
    };
    return map[status] || 'bg-slate-100 text-slate-800';
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 md:px-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">SRK Client Hub</h1>
            <p className="text-sm text-slate-500">MVP dashboard for tax, GST, notices, and client uploads</p>
          </div>
          <button className="rounded-2xl bg-slate-900 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:opacity-90">
            Login / OTP
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6 md:px-6">
        <section className="mb-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {stats.map((item) => (
            <div key={item.label} className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
              <p className="text-sm text-slate-500">{item.label}</p>
              <p className="mt-2 text-3xl font-bold">{item.value}</p>
            </div>
          ))}
        </section>

        <section className="grid gap-6 xl:grid-cols-3">
          <div className="xl:col-span-2 space-y-6">
            <div className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold">Task Tracking</h2>
                  <p className="text-sm text-slate-500">Synced from ClickUp</p>
                </div>
                <button className="rounded-2xl border border-slate-300 px-3 py-2 text-sm font-medium">View All</button>
              </div>
              <div className="space-y-3">
                {tasks.map((item) => (
                  <div key={item.task} className="rounded-2xl border border-slate-200 p-4">
                    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                      <div>
                        <h3 className="font-semibold">{item.task}</h3>
                        <p className="mt-1 text-sm text-slate-500">Due: {item.due} • Assigned: {item.staff}</p>
                      </div>
                      <span className={`inline-flex w-fit rounded-full px-3 py-1 text-xs font-semibold ${badge(item.status)}`}>
                        {item.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
                <h2 className="text-xl font-semibold">Due Dates</h2>
                <p className="mb-4 text-sm text-slate-500">Current month compliance</p>
                <div className="space-y-3">
                  {dues.map((item) => (
                    <div key={item.title + item.date} className="flex items-center justify-between rounded-2xl border border-slate-200 p-3">
                      <div>
                        <p className="font-medium">{item.title}</p>
                        <p className="text-sm text-slate-500">{item.date}</p>
                      </div>
                      <span className={`rounded-full px-3 py-1 text-xs font-semibold ${badge(item.status)}`}>{item.status}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
                <h2 className="text-xl font-semibold">Document Upload</h2>
                <p className="mb-4 text-sm text-slate-500">Required from client</p>
                <div className="space-y-3">
                  {docs.map((doc) => (
                    <div key={doc} className="rounded-2xl border border-dashed border-slate-300 p-3">
                      <p className="font-medium">{doc}</p>
                    </div>
                  ))}
                </div>
                <button className="mt-4 w-full rounded-2xl bg-slate-900 px-4 py-3 text-sm font-medium text-white shadow-sm transition hover:opacity-90">
                  Upload File
                </button>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
              <h2 className="text-xl font-semibold">Payment Summary</h2>
              <p className="mb-4 text-sm text-slate-500">Invoices and fee status</p>
              <div className="space-y-3">
                {payments.map((item) => (
                  <div key={item.invoice} className="rounded-2xl border border-slate-200 p-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{item.invoice}</p>
                        <p className="text-sm text-slate-500">{item.amount}</p>
                      </div>
                      <span className={`rounded-full px-3 py-1 text-xs font-semibold ${badge(item.status)}`}>{item.status}</span>
                    </div>
                  </div>
                ))}
              </div>
              <button className="mt-4 w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm font-medium">
                Pay Now
              </button>
            </div>

            <div className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
              <h2 className="text-xl font-semibold">Support</h2>
              <p className="mb-4 text-sm text-slate-500">Quick actions for client help</p>
              <div className="grid gap-3">
                {['GST Filing', 'IT Return', 'Appeal Notice', 'Talk to Staff'].map((item) => (
                  <button key={item} className="rounded-2xl border border-slate-200 px-4 py-3 text-left text-sm font-medium transition hover:bg-slate-50">
                    {item}
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-3xl bg-slate-900 p-5 text-white shadow-sm">
              <h2 className="text-xl font-semibold">Automation Flow</h2>
              <p className="mt-2 text-sm text-slate-300">
                ClickUp → App DB → WhatsApp Alert → Client Dashboard
              </p>
              <p className="mt-3 text-sm text-slate-300">
                Best for MVP: Flutter frontend + Supabase + n8n + ClickUp API + WhatsApp Cloud API.
              </p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
