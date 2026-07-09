// ============================================================
// COGNITH / FocusFlow — Neo4j AuraDB seed script
// ============================================================
// Built directly from real source files: nodes.csv, outcome.csv,
// relationships.csv — 16 Treatments, 13 Outcomes, 39 relationships
// (IMPROVES: Treatment -> Outcome, LEADS_TO: Outcome -> Outcome
// cascading effects), each citing its clinical source
// (NIMH / CDC / MayoClinic / APA).
//
// IMPORTANT: there is no numeric "effectiveness %" in the source
// data. Relationships are qualitative — "this treatment is
// documented to improve this outcome" — not a measured percentage.
// The app does NOT display a fabricated effectiveness score for
// this graph; it shows the relationship and its citation instead.
//
// HOW TO RUN:
// 1. console.neo4j.io -> your instance -> "Query"
// 2. Paste this whole file, click Run
// ============================================================

MATCH (n) DETACH DELETE n;

// ---------- Treatments (16) ----------
CREATE (:Treatment {name:'Medication', source:'NIMH'})
CREATE (:Treatment {name:'Stimulant medication', source:'NIMH'})
CREATE (:Treatment {name:'Non-stimulant medication', source:'NIMH'})
CREATE (:Treatment {name:'Behavioral therapy', source:'NIMH'})
CREATE (:Treatment {name:'Psychotherapy', source:'NIMH'})
CREATE (:Treatment {name:'Parent training', source:'NIMH'})
CREATE (:Treatment {name:'Cognitive Behavioral Therapy', source:'CDC'})
CREATE (:Treatment {name:'School-based intervention', source:'CDC'})
CREATE (:Treatment {name:'Special education support', source:'CDC'})
CREATE (:Treatment {name:'Lifestyle changes', source:'MayoClinic'})
CREATE (:Treatment {name:'Diet modification', source:'MayoClinic'})
CREATE (:Treatment {name:'Regular physical activity', source:'MayoClinic'})
CREATE (:Treatment {name:'Sleep management', source:'MayoClinic'})
CREATE (:Treatment {name:'Mindfulness training', source:'APA'})
CREATE (:Treatment {name:'Social skills training', source:'APA'})
CREATE (:Treatment {name:'Teacher behavioral strategies', source:'CDC'});

// ---------- Outcomes (13) ----------
CREATE (:Outcome {name:'Improved attention', source:'NIMH'})
CREATE (:Outcome {name:'Reduced hyperactivity', source:'NIMH'})
CREATE (:Outcome {name:'Better impulse control', source:'NIMH'})
CREATE (:Outcome {name:'Improved task completion', source:'NIMH'})
CREATE (:Outcome {name:'Better academic performance', source:'NIMH'})
CREATE (:Outcome {name:'Improved social functioning', source:'NIMH'})
CREATE (:Outcome {name:'Reduced disruptive behavior', source:'CDC'})
CREATE (:Outcome {name:'Better emotional regulation', source:'MayoClinic'})
CREATE (:Outcome {name:'Improved self-esteem', source:'APA'})
CREATE (:Outcome {name:'Reduced anxiety', source:'APA'})
CREATE (:Outcome {name:'Improved classroom behavior', source:'CDC'})
CREATE (:Outcome {name:'Better peer relationships', source:'APA'})
CREATE (:Outcome {name:'Reduced stress levels', source:'MayoClinic'});

// ---------- IMPROVES relationships (Treatment -> Outcome), 28 total ----------
MATCH (t:Treatment {name:'Medication'}), (o:Outcome {name:'Improved attention'}) CREATE (t)-[:IMPROVES]->(o);
MATCH (t:Treatment {name:'Medication'}), (o:Outcome {name:'Reduced hyperactivity'}) CREATE (t)-[:IMPROVES]->(o);
MATCH (t:Treatment {name:'Stimulant medication'}), (o:Outcome {name:'Improved attention'}) CREATE (t)-[:IMPROVES]->(o);
MATCH (t:Treatment {name:'Stimulant medication'}), (o:Outcome {name:'Reduced hyperactivity'}) CREATE (t)-[:IMPROVES]->(o);
MATCH (t:Treatment {name:'Non-stimulant medication'}), (o:Outcome {name:'Better impulse control'}) CREATE (t)-[:IMPROVES]->(o);
MATCH (t:Treatment {name:'Behavioral therapy'}), (o:Outcome {name:'Improved task completion'}) CREATE (t)-[:IMPROVES]->(o);
MATCH (t:Treatment {name:'Behavioral therapy'}), (o:Outcome {name:'Improved classroom behavior'}) CREATE (t)-[:IMPROVES]->(o);
MATCH (t:Treatment {name:'Behavioral therapy'}), (o:Outcome {name:'Better impulse control'}) CREATE (t)-[:IMPROVES]->(o);
MATCH (t:Treatment {name:'Psychotherapy'}), (o:Outcome {name:'Improved social functioning'}) CREATE (t)-[:IMPROVES]->(o);
MATCH (t:Treatment {name:'Psychotherapy'}), (o:Outcome {name:'Reduced anxiety'}) CREATE (t)-[:IMPROVES]->(o);
MATCH (t:Treatment {name:'Psychotherapy'}), (o:Outcome {name:'Better peer relationships'}) CREATE (t)-[:IMPROVES]->(o);
MATCH (t:Treatment {name:'Parent training'}), (o:Outcome {name:'Better impulse control'}) CREATE (t)-[:IMPROVES]->(o);
MATCH (t:Treatment {name:'Parent training'}), (o:Outcome {name:'Reduced disruptive behavior'}) CREATE (t)-[:IMPROVES]->(o);
MATCH (t:Treatment {name:'Parent training'}), (o:Outcome {name:'Improved social functioning'}) CREATE (t)-[:IMPROVES]->(o);
MATCH (t:Treatment {name:'Cognitive Behavioral Therapy'}), (o:Outcome {name:'Better emotional regulation'}) CREATE (t)-[:IMPROVES]->(o);
MATCH (t:Treatment {name:'Cognitive Behavioral Therapy'}), (o:Outcome {name:'Reduced anxiety'}) CREATE (t)-[:IMPROVES]->(o);
MATCH (t:Treatment {name:'School-based intervention'}), (o:Outcome {name:'Better academic performance'}) CREATE (t)-[:IMPROVES]->(o);
MATCH (t:Treatment {name:'School-based intervention'}), (o:Outcome {name:'Improved classroom behavior'}) CREATE (t)-[:IMPROVES]->(o);
MATCH (t:Treatment {name:'Special education support'}), (o:Outcome {name:'Better academic performance'}) CREATE (t)-[:IMPROVES]->(o);
MATCH (t:Treatment {name:'Lifestyle changes'}), (o:Outcome {name:'Reduced stress levels'}) CREATE (t)-[:IMPROVES]->(o);
MATCH (t:Treatment {name:'Lifestyle changes'}), (o:Outcome {name:'Better emotional regulation'}) CREATE (t)-[:IMPROVES]->(o);
MATCH (t:Treatment {name:'Diet modification'}), (o:Outcome {name:'Improved attention'}) CREATE (t)-[:IMPROVES]->(o);
MATCH (t:Treatment {name:'Regular physical activity'}), (o:Outcome {name:'Reduced hyperactivity'}) CREATE (t)-[:IMPROVES]->(o);
MATCH (t:Treatment {name:'Sleep management'}), (o:Outcome {name:'Improved attention'}) CREATE (t)-[:IMPROVES]->(o);
MATCH (t:Treatment {name:'Mindfulness training'}), (o:Outcome {name:'Better emotional regulation'}) CREATE (t)-[:IMPROVES]->(o);
MATCH (t:Treatment {name:'Mindfulness training'}), (o:Outcome {name:'Improved self-esteem'}) CREATE (t)-[:IMPROVES]->(o);
MATCH (t:Treatment {name:'Social skills training'}), (o:Outcome {name:'Better peer relationships'}) CREATE (t)-[:IMPROVES]->(o);
MATCH (t:Treatment {name:'Teacher behavioral strategies'}), (o:Outcome {name:'Improved classroom behavior'}) CREATE (t)-[:IMPROVES]->(o);

// ---------- LEADS_TO relationships (Outcome -> Outcome cascades), 10 total ----------
MATCH (a:Outcome {name:'Improved attention'}), (b:Outcome {name:'Improved task completion'}) CREATE (a)-[:LEADS_TO]->(b);
MATCH (a:Outcome {name:'Improved task completion'}), (b:Outcome {name:'Better academic performance'}) CREATE (a)-[:LEADS_TO]->(b);
MATCH (a:Outcome {name:'Reduced hyperactivity'}), (b:Outcome {name:'Better impulse control'}) CREATE (a)-[:LEADS_TO]->(b);
MATCH (a:Outcome {name:'Better impulse control'}), (b:Outcome {name:'Improved classroom behavior'}) CREATE (a)-[:LEADS_TO]->(b);
MATCH (a:Outcome {name:'Improved classroom behavior'}), (b:Outcome {name:'Better academic performance'}) CREATE (a)-[:LEADS_TO]->(b);
MATCH (a:Outcome {name:'Improved social functioning'}), (b:Outcome {name:'Better peer relationships'}) CREATE (a)-[:LEADS_TO]->(b);
MATCH (a:Outcome {name:'Better peer relationships'}), (b:Outcome {name:'Improved self-esteem'}) CREATE (a)-[:LEADS_TO]->(b);
MATCH (a:Outcome {name:'Improved self-esteem'}), (b:Outcome {name:'Reduced anxiety'}) CREATE (a)-[:LEADS_TO]->(b);
MATCH (a:Outcome {name:'Better emotional regulation'}), (b:Outcome {name:'Improved social functioning'}) CREATE (a)-[:LEADS_TO]->(b);
MATCH (a:Outcome {name:'Reduced stress levels'}), (b:Outcome {name:'Better emotional regulation'}) CREATE (a)-[:LEADS_TO]->(b);

// ---------- Done ----------
MATCH (n) RETURN labels(n)[0] AS nodeType, count(*) AS count;
