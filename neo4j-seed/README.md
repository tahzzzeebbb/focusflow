# Seeding your Neo4j AuraDB instance

`seed.cypher` populates your graph with Treatment, Outcome, Symptom, and
Patient nodes plus the relationships Cognith expects:

- `(:Treatment)-[:IMPROVES {weight}]->(:Outcome)`
- `(:Treatment)-[:TREATS_SYMPTOM]->(:Symptom)`
- `(:Patient)-[:HAS_SYMPTOM {score}]->(:Symptom)`

**Effectiveness weights are illustrative approximations**, drawn from
published ranges (NIMH's MTA study, stimulant response-rate literature,
neurofeedback remission studies, CBT/ADHD reviews) — not the exact result of
any single trial. They're a reasonable starting point for a demo or
teaching project, not a clinical dataset. Swap in your own numbers if you
have a real dataset to work from.

## How to run this against AuraDB

1. Go to [console.neo4j.io](https://console.neo4j.io) and open your instance.
2. Click **"Query"** (opens Neo4j's browser-based query workspace).
3. Open `seed.cypher` in a text editor, select all, copy.
4. Paste into the query editor and run it (▶ button, or `Ctrl+Enter`).
5. You should see a result table showing node counts by type
   (Treatment, Outcome, Symptom, Patient).

### Alternative: cypher-shell (if you have Neo4j tools installed locally)

```bash
cypher-shell -a neo4j+s://<your-instance-id>.databases.neo4j.io \
  -u neo4j -p <your-password> \
  -f seed.cypher
```

## Re-running

The first line of the script (`MATCH (n) DETACH DELETE n;`) wipes all
existing nodes before re-creating them — safe to run multiple times while
you're experimenting, but **don't run this against a database that has
real data you want to keep**.

## Verifying it worked

In the Cognith app, open the **Graph view** tab. You should see Treatment,
Outcome, and Patient nodes connected by edges instead of the "graph is
empty" message.
