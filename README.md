# FocusFlow — ADHD Assessment & Management App

A production-grade React app that uses a **real 2,000-patient clinical dataset** (ADHD.csv) to calculate your ADHD risk score — not a generic quiz.

## Features

- **Real ADHD Assessment** — 7-question flow with live data charts showing actual diagnosis rates per score
- **Similar Patients Finder** — finds real patients from the CSV with matching profiles
- **Academic Impact** — shows your predicted academic score vs population based on symptom total  
- **Pomodoro Timer** — working focus sessions with XP rewards
- **Task Manager** — ADHD-friendly one-task-at-a-time design
- **Mood Check-in** — daily emotional baseline tracking
- **AI Chat** — ADHD-aware coaching responses
- **Journal** — daily reflection with prompts
- **Progress Analytics** — recharts visualizations
- **Neo4j Graph** — treatment/outcome relationship explorer

## Tech Stack

| Layer | Tech |
|---|---|
| Frontend | React 19, Vite, React Router |
| Charts | Recharts |
| Graph DB | Neo4j AuraDB |
| Auth/Backend | Express + MongoDB |
| Data | 2,000-patient ADHD.csv |

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Set up environment
cp .env.example .env
# Fill in your Neo4j AuraDB credentials

# 3. Start frontend
npm run dev          # → http://localhost:5735

# 4. Start backend (separate terminal)
cd backend-mongodb
npm install
cp .env.example .env
node server.js       # → http://localhost:5002
```

## Deploy to Vercel

```bash
# 1. Install Vercel CLI
npm i -g vercel

# 2. Push to GitHub first (see below)

# 3. Deploy
vercel --prod
```

Set these environment variables in Vercel dashboard:
- `VITE_NEO4J_URI`
- `VITE_NEO4J_USER`  
- `VITE_NEO4J_PASSWORD`
- `VITE_API_URL` (your Render backend URL)

## Push to GitHub

```bash
# First time:
git init
git add .
git commit -m "Initial commit: FocusFlow ADHD App"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/focusflow.git
git push -u origin main

# Updates:
git add .
git commit -m "your message"
git push
```

## About the Dataset

`public/ADHD.csv` — 2,000 real patient records with:
- Age, Gender, Education Stage
- Inattention, Hyperactivity, Impulsivity scores (0-9)
- Sleep hours, Screen time, Academic score
- RSD, Daydreaming, Family history, Comorbidities
- Medication type, School support
- **ADHD diagnosis label (ground truth)**

The scoring engine uses weighted lookup tables derived directly from this data — no made-up numbers.

## Disclaimer

This app is a statistical screening tool — not a clinical diagnosis. Consult a psychiatrist or clinical psychologist for formal evaluation.
