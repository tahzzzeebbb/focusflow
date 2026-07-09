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
        ],
        'Daydreaming': [
            { name: 'Sluggish Cognitive Tempo Scale', category: 'Psychological', source: 'APA', description: 'Assesses excessive mind-wandering and mental fog, distinct from classic inattention' },
            { name: 'Continuous Performance Test (CPT-3)', category: 'Neuropsychological', source: 'NIMH', description: 'Computerized test measuring sustained attention lapses' },
            { name: 'Mind-Wandering Questionnaire (MWQ)', category: 'Psychological', source: 'APA', description: 'Self-report measure of spontaneous vs. deliberate mind-wandering' }
        ],
        'Restlessness': [
            { name: 'Actigraphy', category: 'Physical', source: 'MayoClinic', description: '7-day activity and sleep pattern monitoring — captures restlessness objectively' },
            { name: 'Conners Comprehensive Behavior Rating Scale', category: 'Behavioral', source: 'APA', description: 'Multi-informant assessment covering hyperactive-restless behavior' },
            { name: 'Sleep Study (Polysomnography)', category: 'Physical', source: 'MayoClinic', description: 'Rules out restless leg syndrome or sleep disorders as a contributing cause' }
        ],
        'RSD': [
            { name: 'Clinical Interview for Emotional Dysregulation', category: 'Psychological', source: 'APA', description: 'Structured interview assessing rejection sensitivity and emotional reactivity' },
            { name: 'Adult ADHD Self-Report Scale (ASRS) + Comorbidity Screen', category: 'Psychological', source: 'NIMH', description: 'Screens for ADHD alongside anxiety/mood conditions RSD often co-occurs with' },
            { name: 'Emotion Regulation Questionnaire (ERQ)', category: 'Psychological', source: 'APA', description: 'Assesses emotional response intensity and regulation strategies' }
        ]
    };

    const tests = labTests[symptom];
    if (!tests) {
        // Should not happen given the fixed symptom list, but never silently
        // substitute a different symptom's tests without saying so.
        return [];
    }
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
        },
        'Daydreaming': {
            firstLine: 'Behavioral strategies to re-anchor attention (external cues, timers, body doubling)',
            secondLine: 'Stimulant or non-stimulant medication if paired with significant inattention',
            behavioral: 'Mindfulness-based attention training, structured check-ins during tasks',
            lifestyle: 'Reduce multitasking, break tasks into short active segments',
            monitoring: 'Follow-up in 4 weeks, distinguish from sleep deprivation or mood-related causes'
        },
        'Restlessness': {
            firstLine: 'Regular vigorous physical activity, movement breaks built into the day',
            secondLine: 'Stimulant medication if restlessness significantly impairs function',
            behavioral: 'Fidget tools, standing/movement-friendly workspaces',
            lifestyle: 'Consistent sleep schedule, reduce stimulants like caffeine late in the day',
            monitoring: 'Follow-up in 2-4 weeks; rule out anxiety or sleep disorders as contributing causes'
        },
        'RSD': {
            firstLine: 'Psychoeducation about RSD, Dialectical Behavior Therapy (DBT) skills',
            secondLine: 'Alpha-agonists (guanfacine/clonidine) sometimes used off-label for emotional reactivity',
            behavioral: 'Cognitive reframing techniques, self-compassion practice',
            lifestyle: 'Identify and plan for known rejection triggers, build a support network',
            monitoring: 'Follow-up in 3-4 weeks; screen for co-occurring anxiety or depression'
        }
    };

    return guidelines[symptom] ?? null;
};