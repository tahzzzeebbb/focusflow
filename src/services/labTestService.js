import { driver } from './neo4j';

// Evidence-based lab tests from NIMH, CDC, APA guidelines
export const getLabTestsForSymptom = async (symptom, severity) => {
    const session = driver.session();
    try {
        // First try to get from Neo4j
        const result = await session.run(
            `MATCH (s:Symptom {name: $symptom})-[:RECOMMENDS_TEST]->(l:LabTest)
             RETURN l.name as test, l.category as category, l.source as source, l.description as description`,
            { symptom }
        );

        if (result.records.length > 0) {
            return result.records.map(r => ({
                name: r.get('test'),
                category: r.get('category'),
                source: r.get('source'),
                description: r.get('description'),
                priority: severity >= 7 ? 'High' : severity >= 4 ? 'Medium' : 'Routine'
            }));
        }
    } finally {
        await session.close();
    }

    // Fallback evidence-based tests
    const labTests = {
        'Inattention': [
            { name: 'ADHD Rating Scale (ARS-IV)', category: 'Psychological', source: 'NIMH', description: '18-item validated questionnaire for ADHD symptoms' },
            { name: 'Continuous Performance Test (CPT-3)', category: 'Neuropsychological', source: 'NIMH', description: 'Computerized test measuring attention and impulsivity' },
            { name: 'Wechsler Intelligence Scale (WISC-V)', category: 'Cognitive', source: 'APA', description: 'IQ and cognitive function assessment' },
            { name: 'EEG / qEEG Brain Mapping', category: 'Neurological', source: 'MayoClinic', description: 'Brain wave pattern analysis for ADHD subtypes' }
        ],
        'Hyperactivity': [
            { name: 'Conners Comprehensive Behavior Rating Scale', category: 'Behavioral', source: 'APA', description: 'Multi-informant assessment for ADHD and comorbidities' },
            { name: 'Actigraphy', category: 'Physical', source: 'MayoClinic', description: '7-day activity and sleep pattern monitoring' },
            { name: 'Vanderbilt ADHD Diagnostic Rating Scale', category: 'Psychological', source: 'CDC', description: 'Parent and teacher rating scales' }
        ],
        'Impulsivity': [
            { name: 'Barratt Impulsiveness Scale (BIS-11)', category: 'Psychological', source: 'APA', description: '30-item impulsivity assessment' },
            { name: 'Go/No-Go Task', category: 'Neuropsychological', source: 'NIMH', description: 'Response inhibition and impulse control test' },
            { name: 'Stop Signal Task', category: 'Cognitive', source: 'NIMH', description: 'Measures ability to inhibit responses' }
        ]
    };

    const tests = labTests[symptom] || labTests['Inattention'];
    return tests.map(test => ({
        ...test,
        priority: severity >= 7 ? 'High' : severity >= 4 ? 'Medium' : 'Routine'
    }));
};

// Get treatment recommendations from clinical guidelines
export const getTreatmentGuidelines = async (symptom, severity) => {
    const guidelines = {
        'Inattention': {
            firstLine: 'Stimulant medications (methylphenidate, amphetamines)',
            secondLine: 'Non-stimulant medications (atomoxetine, guanfacine)',
            behavioral: 'Cognitive Behavioral Therapy, Organizational Skills Training',
            lifestyle: 'Structured routines, task breakdown, distraction elimination',
            monitoring: 'Follow-up in 4 weeks, monitor symptom improvement and side effects'
        },
        'Hyperactivity': {
            firstLine: 'Behavioral interventions, parent training, classroom management',
            secondLine: 'Stimulant medications if behavioral interventions insufficient',
            behavioral: 'Physical activity programs, sensory integration, fidget tools',
            lifestyle: 'Daily exercise (30-45 min), structured routines, caffeine avoidance',
            monitoring: 'Follow-up in 2-4 weeks, track activity levels and restlessness'
        },
        'Impulsivity': {
            firstLine: 'Cognitive Behavioral Therapy, impulse control training',
            secondLine: 'Medication (guanfacine, clonidine) for severe cases',
            behavioral: 'Stop-think-act technique, mindfulness training',
            lifestyle: 'Practice patience exercises, use planners, set reminders',
            monitoring: 'Follow-up in 3-4 weeks, monitor impulse control progress'
        }
    };

    return guidelines[symptom] || guidelines['Inattention'];
};