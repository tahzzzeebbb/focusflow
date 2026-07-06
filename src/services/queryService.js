import { driver } from './neo4j';

export const queryTemplates = {
    treatmentsByOutcome: (outcome) => `
        MATCH (t:Treatment)-[r:IMPROVES]->(o:Outcome)
        WHERE toLower(o.name) CONTAINS toLower('${outcome}') 
           OR toLower(o.name) = toLower('${outcome}')
        RETURN DISTINCT t.name as treatment, t.category as category, 
               round(r.weight * 100) as effectiveness
        ORDER BY effectiveness DESC
        LIMIT 20
    `,

    outcomesBySymptom: (symptom) => `
        MATCH (s:Symptom)<-[:TREATS_SYMPTOM]-(t:Treatment)-[r:IMPROVES]->(o:Outcome)
        WHERE toLower(s.name) CONTAINS toLower('${symptom}') 
           OR toLower(s.name) = toLower('${symptom}')
        RETURN DISTINCT o.name as outcome, o.category as category,
               t.name as viaTreatment,
               round(r.weight * 100) as effectiveness
        ORDER BY effectiveness DESC
        LIMIT 20
    `,

    patientsBySymptom: (symptom, minScore = 5) => `
        MATCH (p:Patient)-[h:HAS_SYMPTOM]->(s:Symptom)
        WHERE (toLower(s.name) CONTAINS toLower('${symptom}') 
            OR toLower(s.name) = toLower('${symptom}'))
          AND h.score >= ${minScore}
        RETURN p.age as age,
               p.gender as gender,
               p.inattentionScore as inattention,
               p.hyperactivityScore as hyperactivity,
               p.impulsivityScore as impulsivity,
               h.score as severity
        ORDER BY h.score DESC
        LIMIT 20
    `,

    symptomCorrelation: () => `
        MATCH (p:Patient)
        WHERE p.inattentionScore IS NOT NULL
        RETURN p.age, p.gender, 
               p.inattentionScore, p.hyperactivityScore, p.impulsivityScore,
               CASE WHEN p.adhd = 1 THEN 'Yes' ELSE 'No' END as hasADHD
        LIMIT 30
    `,

    treatmentEffectiveness: (treatment) => `
        MATCH (t:Treatment)-[r:IMPROVES]->(o:Outcome)
        WHERE toLower(t.name) CONTAINS toLower('${treatment}') 
           OR toLower(t.name) = toLower('${treatment}')
        RETURN o.name as outcome, o.category as category,
               round(r.weight * 100) as effectiveness
        ORDER BY effectiveness DESC
        LIMIT 15
    `,

    custom: (query) => query
};

export const executeQuery = async (query) => {
    const session = driver.session();
    try {
        console.log('Executing query...');
        const result = await session.run(query);
        console.log('Query result:', result.records.length, 'records');

        return result.records.map(record => {
            const obj = {};
            record.keys.forEach(key => {
                let value = record.get(key);
                if (value && typeof value === 'object' && value.toNumber) {
                    value = value.toNumber();
                }
                obj[key] = value;
            });
            return obj;
        });
    } catch (error) {
        console.error('Query execution error:', error);
        throw new Error(`Query failed: ${error.message}`);
    } finally {
        await session.close();
    }
};

// Get ALL symptoms from Neo4j (all symptoms, not just those with patient data)
export const getSymptoms = async () => {
    const session = driver.session();
    try {
        const result = await session.run(
            `MATCH (s:Symptom) RETURN s.name as name ORDER BY s.name`
        );
        const symptoms = result.records.map(r => r.get('name'));

        console.log('Symptoms loaded from Neo4j:', symptoms);

        // Fallback symptoms if none found
        if (symptoms.length === 0) {
            return ['Inattention', 'Hyperactivity', 'Impulsivity', 'Daydreaming', 'Restlessness', 'Fidgeting', 'Poor concentration', 'Interrupting others', 'Difficulty waiting turn', 'Rejection Sensitivity Dysphoria'];
        }
        return symptoms;
    } catch (error) {
        console.error('Error loading symptoms:', error);
        return ['Inattention', 'Hyperactivity', 'Impulsivity', 'Daydreaming', 'Restlessness', 'Fidgeting', 'Poor concentration', 'Interrupting others', 'Difficulty waiting turn', 'Rejection Sensitivity Dysphoria'];
    } finally {
        await session.close();
    }
};

// Show treatments that have IMPROVES relationships
export const getTreatments = async () => {
    const session = driver.session();
    try {
        const result = await session.run(
            `MATCH (t:Treatment)-[:IMPROVES]->(:Outcome)
             RETURN DISTINCT t.name as name
             ORDER BY t.name`
        );
        const treatments = result.records.map(r => r.get('name'));

        if (treatments.length === 0) {
            return [
                'Medication', 'Stimulant medication', 'Non-stimulant medication',
                'Cognitive Behavioral Therapy', 'Behavioral therapy', 'Parent training',
                'Psychotherapy', 'School-based intervention', 'Special education support',
                '504 Plan', 'IEP', 'Accommodations', 'Therapy', 'Mindfulness training',
                'Social skills training', 'Teacher behavioral strategies', 'Lifestyle changes',
                'Sleep management', 'Regular physical activity', 'Diet modification'
            ];
        }
        return treatments;
    } catch (error) {
        console.error('Error loading treatments:', error);
        return [];
    } finally {
        await session.close();
    }
};

// Show outcomes that have IMPROVES relationships
export const getOutcomes = async () => {
    const session = driver.session();
    try {
        const result = await session.run(
            `MATCH (t:Treatment)-[:IMPROVES]->(o:Outcome)
             RETURN DISTINCT o.name as name
             ORDER BY o.name`
        );
        const outcomes = result.records.map(r => r.get('name'));

        if (outcomes.length === 0) {
            return [
                'Improved attention', 'Reduced hyperactivity', 'Better impulse control',
                'Improved task completion', 'Better academic performance', 'Reduced anxiety',
                'Better emotional regulation', 'Improved classroom behavior', 'Reduced disruptive behavior',
                'Better peer relationships', 'Reduced stress levels', 'Improved social functioning'
            ];
        }
        return outcomes;
    } catch (error) {
        console.error('Error loading outcomes:', error);
        return [];
    } finally {
        await session.close();
    }
};