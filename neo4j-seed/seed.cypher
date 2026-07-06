// ============================================================
// COGNITH — Neo4j AuraDB seed script
// ============================================================
// Populates Treatment, Outcome, Symptom, and Patient nodes plus
// their relationships, so the graph view and queries have real
// data to show.
//
// Effectiveness weights are illustrative approximations drawn
// from published ranges (NIMH MTA study, stimulant response-rate
// literature, neurofeedback remission studies, CBT/ADHD reviews).
// They are NOT exact trial results for any single study — treat
// them as reasonable midpoints for demo/teaching purposes, not
// as clinical fact. Replace with your own dataset's numbers if
// you have one.
//
// HOW TO RUN:
// 1. Open your AuraDB instance -> "Query" tab (Neo4j Browser/Workspace)
// 2. Paste this entire file and run it
//    (or: cypher-shell -a <uri> -u neo4j -p <password> -f seed.cypher)
// ============================================================

// Clear any existing data first (safe to run repeatedly)
MATCH (n) DETACH DELETE n;

// ---------- Symptoms ----------
CREATE (s1:Symptom {name: 'Inattention', category: 'Core'})
CREATE (s2:Symptom {name: 'Hyperactivity', category: 'Core'})
CREATE (s3:Symptom {name: 'Impulsivity', category: 'Core'})
CREATE (s4:Symptom {name: 'Daydreaming', category: 'Inattentive'})
CREATE (s5:Symptom {name: 'Restlessness', category: 'Hyperactive'})
CREATE (s6:Symptom {name: 'Fidgeting', category: 'Hyperactive'})
CREATE (s7:Symptom {name: 'Poor concentration', category: 'Inattentive'})
CREATE (s8:Symptom {name: 'Interrupting others', category: 'Impulsive'})
CREATE (s9:Symptom {name: 'Difficulty waiting turn', category: 'Impulsive'})
CREATE (s10:Symptom {name: 'Rejection Sensitivity Dysphoria', category: 'Emotional'});

// ---------- Treatments ----------
CREATE (t1:Treatment {name: 'Stimulant medication', category: 'Pharmacological'})
CREATE (t2:Treatment {name: 'Non-stimulant medication', category: 'Pharmacological'})
CREATE (t3:Treatment {name: 'Cognitive Behavioral Therapy', category: 'Psychosocial'})
CREATE (t4:Treatment {name: 'Behavioral therapy', category: 'Psychosocial'})
CREATE (t5:Treatment {name: 'Parent training', category: 'Psychosocial'})
CREATE (t6:Treatment {name: 'School-based intervention', category: 'Educational'})
CREATE (t7:Treatment {name: 'Neurofeedback', category: 'Neurophysiological'})
CREATE (t8:Treatment {name: 'Mindfulness training', category: 'Psychosocial'})
CREATE (t9:Treatment {name: 'Regular physical activity', category: 'Lifestyle'})
CREATE (t10:Treatment {name: 'Sleep management', category: 'Lifestyle'})
CREATE (t11:Treatment {name: 'Combined medication + behavioral therapy', category: 'Multimodal'})
CREATE (t12:Treatment {name: 'Social skills training', category: 'Psychosocial'});

// ---------- Outcomes ----------
CREATE (o1:Outcome {name: 'Improved attention', category: 'Cognitive'})
CREATE (o2:Outcome {name: 'Reduced hyperactivity', category: 'Behavioral'})
CREATE (o3:Outcome {name: 'Better impulse control', category: 'Behavioral'})
CREATE (o4:Outcome {name: 'Improved task completion', category: 'Functional'})
CREATE (o5:Outcome {name: 'Better academic performance', category: 'Functional'})
CREATE (o6:Outcome {name: 'Reduced anxiety', category: 'Emotional'})
CREATE (o7:Outcome {name: 'Better emotional regulation', category: 'Emotional'})
CREATE (o8:Outcome {name: 'Improved classroom behavior', category: 'Behavioral'})
CREATE (o9:Outcome {name: 'Reduced disruptive behavior', category: 'Behavioral'})
CREATE (o10:Outcome {name: 'Better peer relationships', category: 'Social'})
CREATE (o11:Outcome {name: 'Reduced stress levels', category: 'Emotional'})
CREATE (o12:Outcome {name: 'Improved sleep quality', category: 'Functional'});

// ---------- Treatment -> Symptom relationships ----------
MATCH (t:Treatment {name: 'Stimulant medication'}), (s:Symptom {name: 'Inattention'})
CREATE (t)-[:TREATS_SYMPTOM]->(s);
MATCH (t:Treatment {name: 'Stimulant medication'}), (s:Symptom {name: 'Hyperactivity'})
CREATE (t)-[:TREATS_SYMPTOM]->(s);
MATCH (t:Treatment {name: 'Stimulant medication'}), (s:Symptom {name: 'Impulsivity'})
CREATE (t)-[:TREATS_SYMPTOM]->(s);
MATCH (t:Treatment {name: 'Non-stimulant medication'}), (s:Symptom {name: 'Inattention'})
CREATE (t)-[:TREATS_SYMPTOM]->(s);
MATCH (t:Treatment {name: 'Cognitive Behavioral Therapy'}), (s:Symptom {name: 'Rejection Sensitivity Dysphoria'})
CREATE (t)-[:TREATS_SYMPTOM]->(s);
MATCH (t:Treatment {name: 'Behavioral therapy'}), (s:Symptom {name: 'Impulsivity'})
CREATE (t)-[:TREATS_SYMPTOM]->(s);
MATCH (t:Treatment {name: 'Behavioral therapy'}), (s:Symptom {name: 'Interrupting others'})
CREATE (t)-[:TREATS_SYMPTOM]->(s);
MATCH (t:Treatment {name: 'Parent training'}), (s:Symptom {name: 'Difficulty waiting turn'})
CREATE (t)-[:TREATS_SYMPTOM]->(s);
MATCH (t:Treatment {name: 'School-based intervention'}), (s:Symptom {name: 'Poor concentration'})
CREATE (t)-[:TREATS_SYMPTOM]->(s);
MATCH (t:Treatment {name: 'Neurofeedback'}), (s:Symptom {name: 'Daydreaming'})
CREATE (t)-[:TREATS_SYMPTOM]->(s);
MATCH (t:Treatment {name: 'Mindfulness training'}), (s:Symptom {name: 'Restlessness'})
CREATE (t)-[:TREATS_SYMPTOM]->(s);
MATCH (t:Treatment {name: 'Regular physical activity'}), (s:Symptom {name: 'Fidgeting'})
CREATE (t)-[:TREATS_SYMPTOM]->(s);
MATCH (t:Treatment {name: 'Sleep management'}), (s:Symptom {name: 'Restlessness'})
CREATE (t)-[:TREATS_SYMPTOM]->(s);
MATCH (t:Treatment {name: 'Combined medication + behavioral therapy'}), (s:Symptom {name: 'Inattention'})
CREATE (t)-[:TREATS_SYMPTOM]->(s);
MATCH (t:Treatment {name: 'Combined medication + behavioral therapy'}), (s:Symptom {name: 'Hyperactivity'})
CREATE (t)-[:TREATS_SYMPTOM]->(s);
MATCH (t:Treatment {name: 'Social skills training'}), (s:Symptom {name: 'Interrupting others'})
CREATE (t)-[:TREATS_SYMPTOM]->(s);

// ---------- Treatment -> Outcome (IMPROVES) relationships ----------
// weight is a 0.0-1.0 effectiveness approximation (see header note)
MATCH (t:Treatment {name: 'Stimulant medication'}), (o:Outcome {name: 'Improved attention'})
CREATE (t)-[:IMPROVES {weight: 0.70}]->(o);
MATCH (t:Treatment {name: 'Stimulant medication'}), (o:Outcome {name: 'Reduced hyperactivity'})
CREATE (t)-[:IMPROVES {weight: 0.68}]->(o);
MATCH (t:Treatment {name: 'Stimulant medication'}), (o:Outcome {name: 'Improved task completion'})
CREATE (t)-[:IMPROVES {weight: 0.62}]->(o);
MATCH (t:Treatment {name: 'Stimulant medication'}), (o:Outcome {name: 'Better academic performance'})
CREATE (t)-[:IMPROVES {weight: 0.55}]->(o);

MATCH (t:Treatment {name: 'Non-stimulant medication'}), (o:Outcome {name: 'Improved attention'})
CREATE (t)-[:IMPROVES {weight: 0.45}]->(o);
MATCH (t:Treatment {name: 'Non-stimulant medication'}), (o:Outcome {name: 'Reduced anxiety'})
CREATE (t)-[:IMPROVES {weight: 0.50}]->(o);
MATCH (t:Treatment {name: 'Non-stimulant medication'}), (o:Outcome {name: 'Improved sleep quality'})
CREATE (t)-[:IMPROVES {weight: 0.48}]->(o);

MATCH (t:Treatment {name: 'Cognitive Behavioral Therapy'}), (o:Outcome {name: 'Better emotional regulation'})
CREATE (t)-[:IMPROVES {weight: 0.65}]->(o);
MATCH (t:Treatment {name: 'Cognitive Behavioral Therapy'}), (o:Outcome {name: 'Reduced anxiety'})
CREATE (t)-[:IMPROVES {weight: 0.60}]->(o);
MATCH (t:Treatment {name: 'Cognitive Behavioral Therapy'}), (o:Outcome {name: 'Reduced stress levels'})
CREATE (t)-[:IMPROVES {weight: 0.58}]->(o);

MATCH (t:Treatment {name: 'Behavioral therapy'}), (o:Outcome {name: 'Better impulse control'})
CREATE (t)-[:IMPROVES {weight: 0.62}]->(o);
MATCH (t:Treatment {name: 'Behavioral therapy'}), (o:Outcome {name: 'Reduced disruptive behavior'})
CREATE (t)-[:IMPROVES {weight: 0.60}]->(o);
MATCH (t:Treatment {name: 'Behavioral therapy'}), (o:Outcome {name: 'Improved classroom behavior'})
CREATE (t)-[:IMPROVES {weight: 0.57}]->(o);

MATCH (t:Treatment {name: 'Parent training'}), (o:Outcome {name: 'Improved classroom behavior'})
CREATE (t)-[:IMPROVES {weight: 0.52}]->(o);
MATCH (t:Treatment {name: 'Parent training'}), (o:Outcome {name: 'Better peer relationships'})
CREATE (t)-[:IMPROVES {weight: 0.48}]->(o);
MATCH (t:Treatment {name: 'Parent training'}), (o:Outcome {name: 'Reduced disruptive behavior'})
CREATE (t)-[:IMPROVES {weight: 0.50}]->(o);

MATCH (t:Treatment {name: 'School-based intervention'}), (o:Outcome {name: 'Better academic performance'})
CREATE (t)-[:IMPROVES {weight: 0.58}]->(o);
MATCH (t:Treatment {name: 'School-based intervention'}), (o:Outcome {name: 'Improved task completion'})
CREATE (t)-[:IMPROVES {weight: 0.55}]->(o);

MATCH (t:Treatment {name: 'Neurofeedback'}), (o:Outcome {name: 'Improved attention'})
CREATE (t)-[:IMPROVES {weight: 0.40}]->(o);
MATCH (t:Treatment {name: 'Neurofeedback'}), (o:Outcome {name: 'Reduced hyperactivity'})
CREATE (t)-[:IMPROVES {weight: 0.38}]->(o);

MATCH (t:Treatment {name: 'Mindfulness training'}), (o:Outcome {name: 'Better emotional regulation'})
CREATE (t)-[:IMPROVES {weight: 0.45}]->(o);
MATCH (t:Treatment {name: 'Mindfulness training'}), (o:Outcome {name: 'Reduced stress levels'})
CREATE (t)-[:IMPROVES {weight: 0.47}]->(o);

MATCH (t:Treatment {name: 'Regular physical activity'}), (o:Outcome {name: 'Reduced hyperactivity'})
CREATE (t)-[:IMPROVES {weight: 0.42}]->(o);
MATCH (t:Treatment {name: 'Regular physical activity'}), (o:Outcome {name: 'Reduced stress levels'})
CREATE (t)-[:IMPROVES {weight: 0.44}]->(o);

MATCH (t:Treatment {name: 'Sleep management'}), (o:Outcome {name: 'Improved sleep quality'})
CREATE (t)-[:IMPROVES {weight: 0.60}]->(o);
MATCH (t:Treatment {name: 'Sleep management'}), (o:Outcome {name: 'Improved attention'})
CREATE (t)-[:IMPROVES {weight: 0.35}]->(o);

MATCH (t:Treatment {name: 'Combined medication + behavioral therapy'}), (o:Outcome {name: 'Improved attention'})
CREATE (t)-[:IMPROVES {weight: 0.82}]->(o);
MATCH (t:Treatment {name: 'Combined medication + behavioral therapy'}), (o:Outcome {name: 'Reduced hyperactivity'})
CREATE (t)-[:IMPROVES {weight: 0.80}]->(o);
MATCH (t:Treatment {name: 'Combined medication + behavioral therapy'}), (o:Outcome {name: 'Better academic performance'})
CREATE (t)-[:IMPROVES {weight: 0.72}]->(o);
MATCH (t:Treatment {name: 'Combined medication + behavioral therapy'}), (o:Outcome {name: 'Better impulse control'})
CREATE (t)-[:IMPROVES {weight: 0.75}]->(o);

MATCH (t:Treatment {name: 'Social skills training'}), (o:Outcome {name: 'Better peer relationships'})
CREATE (t)-[:IMPROVES {weight: 0.55}]->(o);
MATCH (t:Treatment {name: 'Social skills training'}), (o:Outcome {name: 'Improved classroom behavior'})
CREATE (t)-[:IMPROVES {weight: 0.46}]->(o);

// ---------- Sample patients (synthetic, illustrative only) ----------
CREATE (p1:Patient {age: 8, gender: 'Male', inattentionScore: 8, hyperactivityScore: 7, impulsivityScore: 6, adhd: 1})
CREATE (p2:Patient {age: 10, gender: 'Female', inattentionScore: 7, hyperactivityScore: 5, impulsivityScore: 4, adhd: 1})
CREATE (p3:Patient {age: 15, gender: 'Male', inattentionScore: 6, hyperactivityScore: 8, impulsivityScore: 7, adhd: 1})
CREATE (p4:Patient {age: 25, gender: 'Female', inattentionScore: 4, hyperactivityScore: 3, impulsivityScore: 2, adhd: 0})
CREATE (p5:Patient {age: 12, gender: 'Male', inattentionScore: 9, hyperactivityScore: 6, impulsivityScore: 8, adhd: 1})
CREATE (p6:Patient {age: 9, gender: 'Female', inattentionScore: 5, hyperactivityScore: 4, impulsivityScore: 3, adhd: 0})
CREATE (p7:Patient {age: 17, gender: 'Male', inattentionScore: 7, hyperactivityScore: 7, impulsivityScore: 6, adhd: 1})
CREATE (p8:Patient {age: 30, gender: 'Female', inattentionScore: 3, hyperactivityScore: 2, impulsivityScore: 2, adhd: 0});

// ---------- Patient -> Symptom (HAS_SYMPTOM) relationships ----------
MATCH (p:Patient {age: 8, gender: 'Male'}), (s:Symptom {name: 'Inattention'})
CREATE (p)-[:HAS_SYMPTOM {score: 8}]->(s);
MATCH (p:Patient {age: 8, gender: 'Male'}), (s:Symptom {name: 'Hyperactivity'})
CREATE (p)-[:HAS_SYMPTOM {score: 7}]->(s);
MATCH (p:Patient {age: 10, gender: 'Female'}), (s:Symptom {name: 'Inattention'})
CREATE (p)-[:HAS_SYMPTOM {score: 7}]->(s);
MATCH (p:Patient {age: 15, gender: 'Male'}), (s:Symptom {name: 'Hyperactivity'})
CREATE (p)-[:HAS_SYMPTOM {score: 8}]->(s);
MATCH (p:Patient {age: 15, gender: 'Male'}), (s:Symptom {name: 'Impulsivity'})
CREATE (p)-[:HAS_SYMPTOM {score: 7}]->(s);
MATCH (p:Patient {age: 12, gender: 'Male'}), (s:Symptom {name: 'Inattention'})
CREATE (p)-[:HAS_SYMPTOM {score: 9}]->(s);
MATCH (p:Patient {age: 12, gender: 'Male'}), (s:Symptom {name: 'Impulsivity'})
CREATE (p)-[:HAS_SYMPTOM {score: 8}]->(s);
MATCH (p:Patient {age: 17, gender: 'Male'}), (s:Symptom {name: 'Hyperactivity'})
CREATE (p)-[:HAS_SYMPTOM {score: 7}]->(s);

// ---------- Done ----------
MATCH (n) RETURN labels(n)[0] AS nodeType, count(*) AS count;
