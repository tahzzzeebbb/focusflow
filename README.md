# FocusFlow — ADHD Assessment & Management App

A complete ADHD management app using **2,000 real patient records** for scoring.

## What's inside

### User Journey (28 screens, button navigation)
```
/ Splash → /welcome (3 slides) → /auth (signup/login)
→ /q1 → /q2 → /q3 → /q4 → /q5 → /q6 → /q7 (assessment)
→ /calculating → /result (real score)
→ /home → /tasks → /focus → /progress → /profile
→ /mood → /journal → /chat
→ /graph → /query → /labtest → /analytics (Clinical Tools)
```

### Real Data Engine
- **ADHD.csv** — 2,000 patients, 18 columns loaded live in browser
- Q1 chart shows real diagnosis rates per score from actual data
- Result page finds your similar patients from the CSV
- Academic impact shows real avg score for your symptom total
- Analytics page computes all charts live from CSV on load

### Neo4j Services (all 4 connected)
- `neo4j.js` — getTreatmentOutcomeData → Cytoscape.js graph
- `queryService.js` — 5 Cypher query types
- `labTestService.js` — getLabTestsForSymptom, getTreatmentGuidelines
- `analysisService.js` — getSymptomDistribution, getOutcomeRates

---

## Step 1 — Run locally

```bash
cd adhd-app
npm install

# Copy env file and fill in your credentials
cp .env.example .env
```

# Start backend (new terminal)
cd backend-mongodb
npm install
cp .env.example .env
# Fill in MONGODB_URI with your rotated password
node server.js
# → http://localhost:5002
```

---

## Step 2 — Push to GitHub

```bash
cd adhd-app

# 1. Go to github.com → New repository
#    Name: focusflow
#    Public, NO readme, NO gitignore (already have both)
#    Click "Create repository"

# 2. Copy the URL shown, then:
git remote add origin https://github.com/YOUR_USERNAME/focusflow.git
git push -u origin main
```

Done — your code is live on GitHub.

---

## Step 3 — Deploy on Vercel (free, 3 minutes)

**Option A — Browser (easiest):**

1. Go to [vercel.com](https://vercel.com) → Sign up with GitHub
2. Click **"Add New Project"**
3. Find your `focusflow` repo → Click **"Import"**
4. Framework: **Vite** (auto-detected)
5. Click **"Environment Variables"** and add these 4:

| Key | Value |
|-----|-------|
| `VITE_NEO4J_URI` | `neo4j+s://72503925.databases.neo4j.io` |
| `VITE_NEO4J_USER` | `neo4j` |
| `VITE_NEO4J_PASSWORD` | your AuraDB password |
| `VITE_API_URL` | `https://YOUR_RENDER_URL/api` |

6. Click **"Deploy"**
7. In ~2 minutes you get a URL like `focusflow-xyz.vercel.app` ✅

**Option B — CLI:**
```bash
npm i -g vercel
vercel login
vercel --prod
# Follow prompts, then set env vars in Vercel dashboard
```

---

## Step 4 — Deploy backend on Render (free)

1. Go to [render.com](https://render.com) → New → **Web Service**
2. Connect GitHub → select `focusflow` repo
3. Settings:
   - Root directory: `backend-mongodb`
   - Build command: `npm install`
   - Start command: `node server.js`
4. Environment variables:
   - `MONGODB_URI` = your MongoDB Atlas connection string
   - `PORT` = `5002`
   - `CORS_ORIGIN` = `https://your-vercel-url.vercel.app`
5. Deploy → copy the Render URL
6. Go back to Vercel → update `VITE_API_URL` to your Render URL

---

## Neo4j: Load graph data

1. Go to [console.neo4j.io](https://console.neo4j.io) → Instance01 → **Query**
2. Open `neo4j-seed/seed.cypher` → copy all → paste → **▶ Run**
3. You should see: Treatment:12, Outcome:12, Symptom:10, Patient:8

---

## Important — Rotate credentials

Your AuraDB password was shared in chat. Regenerate it:
- console.neo4j.io → Instance01 → **Reset password**
- Update `.env` locally + Vercel env vars

## Demo login
```
Email:    admin@adhd.com
Password: admin123
```
