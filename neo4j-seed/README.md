# Seeding your Neo4j AuraDB instance

`seed.cypher` populates your graph directly from the real source files
(`nodes.csv`, `outcome.csv`, `relationships.csv`) — 16 Treatments,
13 Outcomes, and 39 relationships, each citing NIMH, CDC, MayoClinic,
or APA as its source.

## What's in the graph

- `(:Treatment)-[:IMPROVES]->(:Outcome)` — a treatment documented to
  improve an outcome (28 relationships)
- `(:Outcome)-[:LEADS_TO]->(:Outcome)` — cascading effects, e.g.
  "Improved attention" leads to "Improved task completion" leads to
  "Better academic performance" (10 relationships)

**There is no numeric effectiveness percentage in this data.** The
source files describe *documented, qualitative* relationships from
clinical guidelines — not measured effect sizes from a trial. The app
does not invent a fake "72% effective" number for this graph; it shows
the relationship and its citation instead.

(Separately, `ADHD.csv` — the 2,000-patient survey dataset — powers the
ADHD risk assessment and its own real statistics. The two datasets are
independent; don't confuse a citation-graph relationship with a
patient-survey statistic.)

## How to run this against AuraDB

1. Go to [console.neo4j.io](https://console.neo4j.io) and open your instance.
2. Click **"Query"**.
3. Open `seed.cypher`, copy all, paste into the query editor, run (▶ or `Ctrl+Enter`).
4. You should see a result table: Treatment: 16, Outcome: 13.

### Alternative: cypher-shell

```bash
cypher-shell -a neo4j+s://<your-instance-id>.databases.neo4j.io \
  -u neo4j -p <your-password> \
  -f seed.cypher
```

## Re-running

Line 1 wipes all existing nodes before recreating them — safe to
re-run while experimenting, but don't run against a database with
real data you want to keep.
