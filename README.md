# 🧠 FocusFlow – AI-Powered ADHD Assessment & Management Platform

<p align="center">
  <strong>An intelligent full-stack healthcare application that combines clinical data analytics, knowledge graphs, and interactive visualizations to support ADHD assessment and management.</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-18-blue?logo=react">
  <img src="https://img.shields.io/badge/Node.js-Express-green?logo=node.js">
  <img src="https://img.shields.io/badge/MongoDB-Atlas-success?logo=mongodb">
  <img src="https://img.shields.io/badge/Neo4j-Aura-008CC1?logo=neo4j">
  <img src="https://img.shields.io/badge/Vite-Latest-purple?logo=vite">
  <img src="https://img.shields.io/badge/License-MIT-yellow">
</p>

---

## 📖 Overview

FocusFlow is a comprehensive ADHD assessment and management platform designed to deliver evidence-based insights using **2,000 real ADHD patient records**.

The platform integrates **Neo4j Knowledge Graphs**, **MongoDB**, **React**, and **interactive clinical analytics** to provide users with personalized assessments, symptom exploration, treatment recommendations, and progress tracking.

---

# ✨ Features

## 🧠 ADHD Assessment

- 7-step ADHD screening questionnaire
- Real-time score calculation
- Personalized assessment report
- Similar patient matching
- Academic performance insights
- Evidence-based symptom analysis

---

## 📊 Clinical Analytics

Powered by **2,000 real-world patient records**

- Live diagnosis statistics
- Symptom distribution analysis
- Academic impact visualization
- Dynamic charts
- Treatment outcome analysis
- Interactive dashboards

---

## 🌐 Knowledge Graph

Built using **Neo4j AuraDB**

Visualizes relationships between:

- Symptoms
- Patients
- Treatments
- Outcomes
- Lab Tests
- Clinical Guidelines

Supports intelligent graph traversal and advanced healthcare queries.

---

## 💡 Intelligent Clinical Tools

- Interactive Knowledge Graph
- Cypher Query Explorer
- Lab Test Recommendation Engine
- Treatment Guideline Lookup
- Clinical Analytics Dashboard
- Outcome Prediction Visualization

---

# 🚀 User Flow

```text
Splash
   ↓
Welcome
   ↓
Authentication
   ↓
ADHD Assessment
(Q1 → Q7)
   ↓
Score Calculation
   ↓
Assessment Result
   ↓
Dashboard
   ├── Tasks
   ├── Focus Timer
   ├── Mood Tracker
   ├── Journal
   ├── AI Chat
   ├── Progress
   ├── Knowledge Graph
   ├── Analytics
   ├── Query System
   └── Lab Recommendations
```

---

# 🏗️ Project Architecture

```
Frontend (React + Vite)
        │
        ▼
REST API (Node.js + Express)
        │
 ┌──────┴────────┐
 ▼               ▼
MongoDB      Neo4j Aura
(Patient)   (Knowledge Graph)
```

---

# 🛠 Tech Stack

## Frontend

- React.js
- Vite
- JavaScript (ES6)
- CSS
- Cytoscape.js

## Backend

- Node.js
- Express.js

## Databases

- MongoDB Atlas
- Neo4j AuraDB

## Data

- CSV Dataset (2,000 ADHD Patients)

---

# 📂 Project Structure

```
FocusFlow
│
├── src/
├── public/
├── backend-mongodb/
├── neo4j-seed/
├── assets/
├── package.json
├── vite.config.js
└── README.md
```

---

# ⚙️ Installation

Clone the repository

```bash
git clone https://github.com/YOUR_USERNAME/focusflow.git

cd focusflow
```

Install dependencies

```bash
npm install
```

Create environment file

```env
VITE_NEO4J_URI=
VITE_NEO4J_USER=
VITE_NEO4J_PASSWORD=
VITE_API_URL=
```

Run Frontend

```bash
npm run dev
```

Run Backend

```bash
cd backend-mongodb

npm install

node server.js
```

---

# 🌍 Deployment

## Frontend

Deploy using **Vercel**

Required Environment Variables

```env
VITE_NEO4J_URI=
VITE_NEO4J_USER=
VITE_NEO4J_PASSWORD=
VITE_API_URL=
```

---

## Backend

Deploy using **Render**

Environment Variables

```env
MONGODB_URI=
PORT=5002
CORS_ORIGIN=
```

---

# 📊 Dataset

- 2,000 ADHD Patient Records
- 18 Clinical Features
- Real Assessment Scores
- Academic Performance Data
- Behavioral Indicators
- Live Analytics

---

# 🧩 Neo4j Knowledge Graph

The graph database models relationships between:

- 👤 Patients
- 🧠 Symptoms
- 💊 Treatments
- 📈 Outcomes
- 🧪 Lab Tests
- 📚 Clinical Guidelines

Import graph data by running:

```
neo4j-seed/seed.cypher
```

---

# 🔒 Security

- Environment variables are excluded from Git.
- Credentials should never be committed.
- Rotate Neo4j credentials before deployment.

---

# 🔑 Demo Login

```
Email:
admin@adhd.com

Password:
admin123
```

---

# 🌟 Highlights

- ✅ Built a complete healthcare management platform
- ✅ Processed 2,000 real patient records
- ✅ Integrated Neo4j Knowledge Graph
- ✅ Connected MongoDB & Neo4j
- ✅ Interactive Cytoscape.js visualizations
- ✅ Dynamic clinical analytics
- ✅ Multi-page React application
- ✅ Full-stack deployment ready

---

# 🚀 Future Improvements

- AI-powered treatment recommendations
- Machine Learning risk prediction
- Doctor Dashboard
- Patient Dashboard
- Appointment Scheduling
- PDF Report Generation
- Role-based Authentication
- Notification System

---

# 👩‍💻 Author

**Tehzeeb Masood**

Software Engineer
https://vercel.com/tahzeeb-masood/focusflow


---

## ⭐ If you found this project useful, don't forget to star the repository!
