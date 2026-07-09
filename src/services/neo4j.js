import neo4j from 'neo4j-driver';

// Neo4j connection - configured via environment variables (see .env.example)
const NEO4J_URI = import.meta.env.VITE_NEO4J_URI || 'neo4j://localhost:7687';
const NEO4J_USER = import.meta.env.VITE_NEO4J_USER || 'neo4j';
const NEO4J_PASSWORD = import.meta.env.VITE_NEO4J_PASSWORD || '';

if (!NEO4J_PASSWORD) {
    console.warn(
        '[neo4j] VITE_NEO4J_PASSWORD is not set. Copy .env.example to .env and fill in your AuraDB credentials.'
    );
}

const driver = neo4j.driver(
    NEO4J_URI,
    neo4j.auth.basic(NEO4J_USER, NEO4J_PASSWORD)
);

export const testConnection = async () => {
    const session = driver.session();
    try {
        await session.run('RETURN 1');
        return true;
    } catch (error) {
        console.error('Connection failed:', error);
        return false;
    } finally {
        await session.close();
    }
};

export const getTreatmentOutcomeData = async () => {
    const session = driver.session();
    try {
        // Real graph: Treatment -[:IMPROVES]-> Outcome, and
        // Outcome -[:LEADS_TO]-> Outcome (cascading effects).
        // No numeric weight exists on these relationships — they are
        // qualitative, citation-based facts, not measured effect sizes.
        const result = await session.run(
            `MATCH (a)-[r:IMPROVES|LEADS_TO]->(b)
             RETURN a.name as source, b.name as target,
                    labels(a)[0] as sourceType, labels(b)[0] as targetType,
                    a.source as sourceCitation, b.source as targetCitation,
                    type(r) as relType
             LIMIT 60`
        );

        const nodes = [];
        const edges = [];
        const nodeSet = new Set();

        result.records.forEach(record => {
            const source = record.get('source');
            const target = record.get('target');
            const sourceType = record.get('sourceType');
            const targetType = record.get('targetType');
            const relType = record.get('relType');

            if (!nodeSet.has(source)) {
                nodes.push({
                    data: {
                        id: source,
                        name: source,
                        type: sourceType.toLowerCase(),
                        citation: record.get('sourceCitation'),
                    }
                });
                nodeSet.add(source);
            }
            if (!nodeSet.has(target)) {
                nodes.push({
                    data: {
                        id: target,
                        name: target,
                        type: targetType.toLowerCase(),
                        citation: record.get('targetCitation'),
                    }
                });
                nodeSet.add(target);
            }

            edges.push({ data: { source, target, relType } });
        });

        console.log('Graph data loaded:', nodes.length, 'nodes,', edges.length, 'edges');
        return { nodes, edges, error: null };
    } catch (error) {
        console.error('Error in getTreatmentOutcomeData:', error);
        return { nodes: [], edges: [], error: error.message || 'Unable to reach the graph database.' };
    } finally {
        await session.close();
    }
};

export const getPatientStats = async () => {
    const session = driver.session();
    try {
        const result = await session.run(
            `MATCH (p:Patient)
             RETURN count(p) as totalPatients,
                    avg(p.inattentionScore) as avgInattention,
                    avg(p.hyperactivityScore) as avgHyperactivity,
                    avg(p.impulsivityScore) as avgImpulsivity`
        );

        const record = result.records[0];
        return {
            totalPatients: record.get('totalPatients')?.toNumber?.() || 0,
            avgInattention: (record.get('avgInattention')?.toNumber?.() || 0).toFixed(1),
            avgHyperactivity: (record.get('avgHyperactivity')?.toNumber?.() || 0).toFixed(1),
            avgImpulsivity: (record.get('avgImpulsivity')?.toNumber?.() || 0).toFixed(1)
        };
    } catch (error) {
        console.error('Error fetching stats:', error);
        return null;
    } finally {
        await session.close();
    }
};

export const getGraphData = async () => {
    return await getTreatmentOutcomeData();
};

// Export driver for other services
export { driver };