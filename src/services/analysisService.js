import { driver } from './neo4j';

/**
 * Real graph analytics — matched only to what the seeded graph
 * actually contains (Treatment, Outcome, IMPROVES, LEADS_TO).
 * There is no Symptom or Patient node here and no numeric
 * effectiveness weight, so this file no longer pretends otherwise.
 * Symptom-level statistics come from ADHD.csv via adhdEngine.js,
 * not from this graph.
 */

// How many distinct treatments target each outcome — a real,
// countable fact from the graph (not a fabricated percentage).
export const getOutcomeRates = async () => {
    const session = driver.session();
    try {
        const result = await session.run(
            `MATCH (t:Treatment)-[:IMPROVES]->(o:Outcome)
             RETURN o.name as outcome,
                    count(DISTINCT t) as treatmentCount,
                    o.source as citedBy
             ORDER BY treatmentCount DESC`
        );

        return result.records.map(record => ({
            outcome: record.get('outcome'),
            treatmentCount: record.get('treatmentCount')?.toNumber?.() ?? record.get('treatmentCount') ?? 0,
            citedBy: record.get('citedBy'),
        }));
    } catch (error) {
        console.error('Error in getOutcomeRates:', error);
        return [];
    } finally {
        await session.close();
    }
};

// Full cascade map — every LEADS_TO chain in the graph, for a
// bird's-eye view of how outcomes connect to each other.
export const getOutcomeCascades = async () => {
    const session = driver.session();
    try {
        const result = await session.run(
            `MATCH (a:Outcome)-[:LEADS_TO]->(b:Outcome)
             RETURN a.name as from, b.name as to`
        );
        return result.records.map(r => ({ from: r.get('from'), to: r.get('to') }));
    } catch (error) {
        console.error('Error in getOutcomeCascades:', error);
        return [];
    } finally {
        await session.close();
    }
};
