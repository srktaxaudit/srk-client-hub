# SRK TAX AUDIT — Client Hub

## Go Live in 3 Hours (No Coding Needed)

---

## STEP 1 — Create GitHub Account (5 mins)

1. Go to https://github.com
2. Click "Sign up" → use email: srktaxaudit@yahoo.com
3. Verify email
4. Click "New repository"
5. Name it: srk-client-hub
6. Choose "Public"
7. Click "Create repository"
8. Upload ALL files from this folder by dragging them into GitHub

---

## STEP 2 — Deploy on Vercel (10 mins)

1. Go to https://vercel.com
2. Click "Sign up with GitHub"
3. Click "Add New Project"
4. Select "srk-client-hub" from your GitHub list
5. Framework: select "Vite"
6. Click "Deploy"
7. Wait 2 mins → your app is LIVE at:
   https://srk-client-hub.vercel.app

---

## STEP 3 — Supabase Database (30 mins)

1. Go to https://supabase.com
2. Click "Start for free" → sign in with GitHub
3. Click "New Project"
   - Name: srk-tax-audit
   - Password: (save this securely)
   - Region: Southeast Asia (Singapore)
4. Go to SQL Editor → paste and run this SQL:

CREATE TABLE clients (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  gstin TEXT,
  phone TEXT,
  email TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE uploads (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID REFERENCES clients(id),
  category TEXT,
  financial_year TEXT,
  filename TEXT,
  file_url TEXT,
  remarks TEXT,
  status TEXT DEFAULT 'new',
  uploaded_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE tasks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID REFERENCES clients(id),
  task_name TEXT,
  status TEXT,
  due_date DATE,
  staff_name TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE payments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID REFERENCES clients(id),
  invoice_no TEXT,
  description TEXT,
  amount NUMERIC,
  status TEXT DEFAULT 'Unpaid',
  created_at TIMESTAMP DEFAULT NOW()
);

5. Go to Settings → API
   - Copy "Project URL" → this is your SUPABASE_URL
   - Copy "anon public" key → this is your SUPABASE_ANON_KEY

6. Go back to Vercel → your project → Settings → Environment Variables
   Add:
   VITE_SUPABASE_URL = (paste your URL)
   VITE_SUPABASE_ANON_KEY = (paste your key)

7. Redeploy from Vercel dashboard

---

## STEP 4 — Custom Domain (15 mins)

If you have srktaxaudit.com:
1. Go to Vercel → your project → Settings → Domains
2. Add: client.srktaxaudit.com
3. Go to your domain provider (GoDaddy / BigRock)
4. Add CNAME record:
   Name: client
   Value: cname.vercel-dns.com
5. Wait 10 mins → your app is live at:
   https://client.srktaxaudit.com

---

## STEP 5 — Connect n8n WhatsApp (30 mins)

Your n8n is already at: srktaxaudit.app.n8n.cloud

Create a new workflow:
1. Trigger: Supabase → On Insert (uploads table)
2. Action: WhatsApp Cloud API → Send Message
   Phone Number ID: 963752300153091
   Message: "New document uploaded by {{client_name}} — {{category}} for {{financial_year}}. Login to review."

---

## STEP 6 — Share with Your 44 Clients

Send this WhatsApp to all clients:

*SRK TAX AUDIT — Client Portal Launch*

Dear {{Client Name}},

We have launched our new Client Portal for secure document sharing and compliance tracking.

Access your portal here:
https://client.srktaxaudit.com

Features:
✅ Upload documents from mobile
✅ Track compliance due dates
✅ View your task status
✅ Check payment invoices

Login with your mobile number (OTP will be sent).

— SRK TAX AUDIT Team
📞 7418040882

---

## Total Cost

| Service  | Cost        |
|----------|-------------|
| Vercel   | FREE        |
| Supabase | FREE        |
| GitHub   | FREE        |
| Domain   | ₹800/year (optional) |

**Total: ₹0 to start. ₹800/year maximum.**

