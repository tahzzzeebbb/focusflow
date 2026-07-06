const ML_API_URL = 'http://localhost:5000';

// Real ML Model Integration
export const predictADHDRisk = async (patientData) => {
    try {
        // Add timeout to prevent hanging
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3000);

        const response = await fetch(`${ML_API_URL}/predict`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            signal: controller.signal,
            body: JSON.stringify({
                age: patientData.age,
                gender: patientData.gender,
                inattention: patientData.inattentionScore,
                hyperactivity: patientData.hyperactivityScore,
                impulsivity: patientData.impulsivityScore
            })
        });

        clearTimeout(timeoutId);

        if (response.ok) {
            const result = await response.json();
            console.log('ML Prediction from API:', result);
            return {
                probability: result.probability,
                risk_level: result.risk_level,
                recommendation: result.recommendation,
                source: 'ML Model'
            };
        } else {
            throw new Error(`ML API responded with status: ${response.status}`);
        }
    } catch (error) {
        console.log('ML API not available, using rule-based analysis:', error.message);
    }

    // Rule-based fallback (deterministic, no random numbers)
    const avgScore = (patientData.inattentionScore + patientData.hyperactivityScore + patientData.impulsivityScore) / 3;
    let probability, risk_level, recommendation;

    if (avgScore >= 7) {
        probability = 85;
        risk_level = 'High';
        recommendation = 'Immediate clinical evaluation recommended. Consult psychiatrist within 1 week.';
    } else if (avgScore >= 5) {
        probability = 55;
        risk_level = 'Moderate';
        recommendation = 'Monitor symptoms regularly. Schedule follow-up in 2-3 weeks. Consider behavioral interventions.';
    } else if (avgScore >= 3) {
        probability = 30;
        risk_level = 'Mild';
        recommendation = 'Regular monitoring recommended. Implement lifestyle changes and track progress.';
    } else {
        probability = 10;
        risk_level = 'Low';
        recommendation = 'Continue current management. Routine check-ups every 6 months.';
    }

    return {
        probability: probability,
        risk_level: risk_level,
        recommendation: recommendation,
        source: 'Rule-Based'
    };
};

// Get lab tests from medical guidelines
export const getLabRecommendations = async (symptom, severity = 5) => {
    const labTests = {
        'Inattention': [
            { name: 'ADHD Rating Scale (ARS-5)', category: 'Questionnaire', source: 'NIMH', description: '18-item scale based on DSM-5 criteria', turnaround: 'Immediate', priority: severity >= 7 ? 'High' : 'Medium' },
            { name: 'Continuous Performance Test (CPT-3)', category: 'Computerized', source: 'NIMH', description: 'Measures sustained attention and vigilance', turnaround: 'Same day', priority: severity >= 7 ? 'High' : 'Medium' },
            { name: 'Vanderbilt Assessment Scale', category: 'Questionnaire', source: 'CDC', description: 'Parent and teacher rating scales', turnaround: '3-5 days', priority: 'Medium' },
            { name: 'EEG / Brain Mapping', category: 'Neurological', source: 'MayoClinic', description: 'Brain wave pattern analysis for ADHD subtypes', turnaround: '1 week', priority: severity >= 7 ? 'High' : 'Low' }
        ],
        'Hyperactivity': [
            { name: 'Conners Comprehensive Behavior Rating Scale', category: 'Questionnaire', source: 'APA', description: 'Comprehensive ADHD assessment', turnaround: '1-2 weeks', priority: severity >= 7 ? 'High' : 'Medium' },
            { name: 'Actigraphy', category: 'Physical', source: 'MayoClinic', description: '7-day movement and activity monitoring', turnaround: '1 week', priority: severity >= 5 ? 'Medium' : 'Low' },
            { name: 'Child Behavior Checklist', category: 'Questionnaire', source: 'CDC', description: 'Behavioral assessment', turnaround: '3-5 days', priority: 'Medium' },
            { name: 'ADHD Rating Scale (ARS-5)', category: 'Questionnaire', source: 'NIMH', description: '18-item scale for ADHD symptoms', turnaround: 'Immediate', priority: 'High' }
        ],
        'Impulsivity': [
            { name: 'Continuous Performance Test (CPT-3)', category: 'Computerized', source: 'NIMH', description: 'Impulse control measurement', turnaround: 'Same day', priority: 'High' },
            { name: 'Go/No-Go Task', category: 'Cognitive', source: 'APA', description: 'Response inhibition assessment', turnaround: 'Same day', priority: 'High' },
            { name: 'Barratt Impulsiveness Scale (BIS-11)', category: 'Questionnaire', source: 'APA', description: '30-item impulsivity trait measurement', turnaround: 'Immediate', priority: 'Medium' },
            { name: 'Stop Signal Task', category: 'Cognitive', source: 'NIMH', description: 'Measures ability to inhibit responses', turnaround: 'Same day', priority: 'High' }
        ],
        'Daydreaming': [
            { name: 'EEG / qEEG Brain Mapping', category: 'Neurological', source: 'MayoClinic', description: 'Brain wave pattern analysis', turnaround: '1 week', priority: severity >= 7 ? 'High' : 'Medium' },
            { name: 'Cognitive Assessment', category: 'Cognitive', source: 'APA', description: 'Attention and focus evaluation', turnaround: '1-2 weeks', priority: 'Medium' }
        ],
        'Restlessness': [
            { name: 'Actigraphy', category: 'Physical', source: 'MayoClinic', description: 'Movement and activity monitoring', turnaround: '1 week', priority: 'Medium' },
            { name: 'Physical Examination', category: 'Medical', source: 'CDC', description: 'Rule out other causes', turnaround: 'Same day', priority: 'High' }
        ],
        'Poor concentration': [
            { name: 'Continuous Performance Test (CPT-3)', category: 'Computerized', source: 'NIMH', description: 'Attention measurement', turnaround: 'Same day', priority: 'High' },
            { name: 'Cognitive Assessment', category: 'Cognitive', source: 'APA', description: 'Executive function evaluation', turnaround: '1-2 weeks', priority: 'Medium' }
        ],
        'Rejection Sensitivity Dysphoria': [
            { name: 'Clinical Interview', category: 'Psychological', source: 'APA', description: 'Assessment of emotional sensitivity patterns', turnaround: '1-2 weeks', priority: 'High' },
            { name: 'Beck Depression Inventory', category: 'Questionnaire', source: 'APA', description: 'Screening for mood disorders', turnaround: 'Same day', priority: 'Medium' }
        ],
        'Fidgeting': [
            { name: 'Actigraphy', category: 'Physical', source: 'MayoClinic', description: 'Movement pattern analysis', turnaround: '1 week', priority: 'Medium' },
            { name: 'Physical Examination', category: 'Medical', source: 'CDC', description: 'Rule out neurological causes', turnaround: 'Same day', priority: 'High' }
        ],
        'Difficulty waiting turn': [
            { name: 'Social Skills Assessment', category: 'Behavioral', source: 'APA', description: 'Evaluation of turn-taking behavior', turnaround: '1-2 weeks', priority: 'High' },
            { name: 'Continuous Performance Test (CPT-3)', category: 'Computerized', source: 'NIMH', description: 'Impulse control measurement', turnaround: 'Same day', priority: 'High' }
        ],
        'Interrupting others': [
            { name: 'Social Skills Assessment', category: 'Behavioral', source: 'APA', description: 'Communication pattern evaluation', turnaround: '1-2 weeks', priority: 'High' },
            { name: 'Behavioral Observation', category: 'Clinical', source: 'APA', description: 'Direct observation of social interactions', turnaround: 'Same day', priority: 'High' }
        ]
    };

    let tests = labTests[symptom] || labTests['Inattention'];

    // Add priority based on severity
    tests = tests.map(test => ({
        ...test,
        priority: severity >= 7 ? 'High' : (severity >= 5 ? 'Medium' : 'Routine')
    }));

    return tests;
};

// Get treatment recommendations based on outcome
export const getTreatmentRecommendations = async (outcome, severity = 5) => {
    const recommendations = {
        'Improved attention': [
            { name: 'Stimulant Medication', effectiveness: 85, description: 'First-line treatment, 70-80% response rate. Start with low dose.', timeline: '2-4 weeks' },
            { name: 'Cognitive Behavioral Therapy', effectiveness: 75, description: '8-12 sessions focusing on attention strategies', timeline: '8-12 weeks' },
            { name: 'Mindfulness Training', effectiveness: 65, description: 'Daily practice recommended, 5-10 minutes', timeline: '4-6 weeks' }
        ],
        'Reduced hyperactivity': [
            { name: 'Regular Physical Activity', effectiveness: 70, description: '30-45 mins daily exercise', timeline: '2-4 weeks' },
            { name: 'Behavioral Therapy', effectiveness: 75, description: 'Weekly sessions with behavior modification', timeline: '8-12 weeks' },
            { name: 'Parent Training', effectiveness: 80, description: 'Family involvement and positive reinforcement', timeline: '6-8 weeks' }
        ],
        'Better impulse control': [
            { name: 'Cognitive Behavioral Therapy', effectiveness: 80, description: 'Focus on stop-think-act method', timeline: '8-12 weeks' },
            { name: 'Social Skills Training', effectiveness: 70, description: 'Group sessions for impulse control', timeline: '10-12 weeks' },
            { name: 'Medication Management', effectiveness: 75, description: 'Consult psychiatrist for evaluation', timeline: '2-4 weeks' }
        ],
        'Better emotional regulation': [
            { name: 'Dialectical Behavior Therapy (DBT)', effectiveness: 85, description: 'Skills training for emotion regulation', timeline: '12-16 weeks' },
            { name: 'Mindfulness Training', effectiveness: 70, description: 'Daily mindfulness practice', timeline: '4-6 weeks' },
            { name: 'CBT for Emotional Regulation', effectiveness: 80, description: 'Cognitive restructuring techniques', timeline: '8-10 weeks' }
        ],
        'Reduced anxiety': [
            { name: 'Cognitive Behavioral Therapy', effectiveness: 85, description: 'Anxiety-focused CBT', timeline: '8-12 weeks' },
            { name: 'Mindfulness-Based Stress Reduction', effectiveness: 75, description: '8-week program', timeline: '8 weeks' },
            { name: 'Medication (SSRIs)', effectiveness: 70, description: 'Consult psychiatrist', timeline: '4-6 weeks' }
        ]
    };

    return recommendations[outcome] || [
        { name: 'Comprehensive Evaluation', effectiveness: 90, description: 'Complete diagnostic assessment', timeline: '1-2 weeks' },
        { name: 'Multimodal Treatment', effectiveness: 85, description: 'Combination of medication and therapy', timeline: '8-12 weeks' }
    ];
};

// Get outcome analysis for symptoms
export const getOutcomeAnalysis = async (symptom, severity = 5) => {
    const outcomes = {
        'Inattention': [
            { outcome: 'Improved attention', probability: 85, timeline: '4-6 weeks', description: 'With proper treatment' },
            { outcome: 'Better academic performance', probability: 75, timeline: '8-12 weeks', description: 'Consistent intervention' },
            { outcome: 'Improved task completion', probability: 80, timeline: '6-8 weeks', description: 'Behavioral strategies' }
        ],
        'Hyperactivity': [
            { outcome: 'Reduced hyperactivity', probability: 80, timeline: '4-6 weeks', description: 'With daily exercise and routine' },
            { outcome: 'Better impulse control', probability: 75, timeline: '6-8 weeks', description: 'Behavioral therapy' },
            { outcome: 'Improved classroom behavior', probability: 85, timeline: '8-10 weeks', description: 'Consistent interventions' }
        ],
        'Impulsivity': [
            { outcome: 'Better impulse control', probability: 82, timeline: '6-8 weeks', description: 'CBT and mindfulness' },
            { outcome: 'Improved decision making', probability: 78, timeline: '8-10 weeks', description: 'Cognitive training' },
            { outcome: 'Reduced risky behavior', probability: 75, timeline: '10-12 weeks', description: 'Long-term therapy' }
        ],
        'Daydreaming': [
            { outcome: 'Improved focus', probability: 70, timeline: '4-6 weeks', description: 'Attention training' },
            { outcome: 'Better task engagement', probability: 75, timeline: '6-8 weeks', description: 'Structured activities' }
        ],
        'Restlessness': [
            { outcome: 'Reduced restlessness', probability: 80, timeline: '2-4 weeks', description: 'Physical activity' },
            { outcome: 'Better sleep', probability: 70, timeline: '4-6 weeks', description: 'Sleep hygiene' }
        ],
        'Rejection Sensitivity Dysphoria': [
            { outcome: 'Reduced emotional reactivity', probability: 75, timeline: '8-12 weeks', description: 'DBT skills training' },
            { outcome: 'Improved self-esteem', probability: 70, timeline: '10-14 weeks', description: 'CBT and validation' }
        ],
        'Fidgeting': [
            { outcome: 'Reduced fidgeting', probability: 65, timeline: '2-4 weeks', description: 'Fidget tools and movement breaks' },
            { outcome: 'Better focus', probability: 60, timeline: '4-6 weeks', description: 'Sensory strategies' }
        ],
        'Difficulty waiting turn': [
            { outcome: 'Improved patience', probability: 75, timeline: '6-8 weeks', description: 'Social skills training' },
            { outcome: 'Better turn-taking', probability: 80, timeline: '8-10 weeks', description: 'Structured practice' }
        ],
        'Interrupting others': [
            { outcome: 'Reduced interruptions', probability: 70, timeline: '6-8 weeks', description: 'Impulse control training' },
            { outcome: 'Improved conversation skills', probability: 75, timeline: '8-10 weeks', description: 'Social skills practice' }
        ],
        'Poor concentration': [
            { outcome: 'Improved focus', probability: 80, timeline: '4-6 weeks', description: 'Cognitive training and medication' },
            { outcome: 'Better task completion', probability: 75, timeline: '6-8 weeks', description: 'Organizational strategies' }
        ]
    };

    let outcomesList = outcomes[symptom] || outcomes['Inattention'];

    // Adjust probability based on severity
    outcomesList = outcomesList.map(o => ({
        ...o,
        probability: severity >= 7 ? Math.min(o.probability + 10, 95) : (severity <= 3 ? Math.max(o.probability - 15, 40) : o.probability)
    }));

    return outcomesList;
};