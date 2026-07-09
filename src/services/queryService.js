import { driver } from './neo4j';

/**
 * Query templates — matched to the REAL graph structure only.
 * The seeded graph has exactly two node types (Treatment, Outcome)
 * and two relationship types (IMPROVES, LEADS_TO), sourced from
 * nodes.csv / outcome.csv / relationships.csv. There is no Symptom
 * or Patient node in this graph, and no numeric effectiveness weight
 * on any relationship — so query types that would require those
 * (symptom correlation, patient lookups, effectiveness ranking) are
 * intentionally not offered here. Patient-level symptom data lives
 * in ADHD.csv and powers the Assessment/Analytics pages instead.
 */
export const queryTemplates = {
    // What treatments are documented to improve this outcome?
    treatmentsByOutcome: (outcome) => `
        MATCH (t:Treatment)-[:IMPROVES]->(o:Outcome)
        WHERE toLower(o.name) CONTAINS toLower('${outcome}')
           OR toLower(o.name) = toLower('${outcome}')
        RETURN DISTINCT t.name as treatment, t.source as citedBy, o.name as outcome
        ORDER BY t.name
        LIMIT 20
    `,

    // What outcomes does this treatment improve, directly?
    treatmentEffectiveness: (treatment) => `
        MATCH (t:Treatment)-[:IMPROVES]->(o:Outcome)
        WHERE toLower(t.name) CONTAINS toLower('${treatment}')
           OR toLower(t.name) = toLower('${treatment}')
        RETURN o.name as outcome, o.source as citedBy
        ORDER BY o.name
        LIMIT 15
    `,

    // Cascade: what outcomes does this outcome lead to, and what leads to it?
    outcomeCascade: (outcome) => `
        MATCH (o:Outcome)
        WHERE toLower(o.name) CONTAINS toLower('${outcome}')
           OR toLower(o.name) = toLower('${outcome}')
        OPTIONAL MATCH (o)-[:LEADS_TO]->(next:Outcome)
        OPTIONAL MATCH (prev:Outcome)-[:LEADS_TO]->(o)
        RETURN o.name as outcome,
               collect(DISTINCT next.name) as leadsTo,
               collect(DISTINCT prev.name) as causedBy
        LIMIT 10
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
                if (Array.isArray(value)) {
                    value = value.filter(Boolean).join(', ') || '—';
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
        return treatments.length ? treatments : [];
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
        return outcomes.length ? outcomes : [];
    } catch (error) {
        console.error('Error loading outcomes:', error);
        return [];
    } finally {
        await session.close();
    }
};

// All outcomes (used for the cascade query type, includes ones with no incoming treatment too)
export const getAllOutcomes = async () => {
    const session = driver.session();
    try {
        const result = await session.run(`MATCH (o:Outcome) RETURN o.name as name ORDER BY o.name`);
        return result.records.map(r => r.get('name'));
    } catch (error) {
        console.error('Error loading outcomes:', error);
        return [];
    } finally {
        await session.close();
    }
};
