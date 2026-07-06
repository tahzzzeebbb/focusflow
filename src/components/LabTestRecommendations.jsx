import React, { useState, useEffect } from 'react';
import './LabTestRecommendations.css';

const LabTestRecommendations = ({ queryResults, queryType }) => {
    const [analysis, setAnalysis] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!queryResults || queryResults.length === 0) {
            setAnalysis(null);
            return;
        }
        analyzeResults();
    }, [queryResults, queryType]);

    const analyzeResults = () => {
        setLoading(true);

        let result = null;

        // Patients by Symptom Query
        if (queryType === 'patientsBySymptom') {
            const avgSeverity = queryResults.reduce((sum, p) => sum + (p.severity || 0), 0) / queryResults.length;
            const highestSymptom = queryResults[0]?.symptom || 'Hyperactivity';

            result = {
                title: 'Patient Analysis',
                summary: `Found ${queryResults.length} patients with ${highestSymptom} symptoms`,
                condition: getConditionDescription(highestSymptom, avgSeverity),
                recommendations: getRecommendations(highestSymptom, avgSeverity),
                labTests: getLabTests(highestSymptom),
                nextSteps: getNextSteps(highestSymptom, avgSeverity)
            };
        }

        // Treatments by Outcome Query
        else if (queryType === 'treatmentsByOutcome') {
            const topTreatment = queryResults[0];
            result = {
                title: 'Treatment Analysis',
                summary: `Best treatment: ${topTreatment.treatment}`,
                condition: `This treatment is ${topTreatment.effectiveness}% effective for improving ${topTreatment.outcome}`,
                recommendations: [`Consider ${topTreatment.treatment} as first-line treatment`, `Follow up in 4-6 weeks`],
                labTests: ['Regular monitoring of symptoms', 'Review side effects if any'],
                nextSteps: ['Schedule follow-up appointment', 'Track symptom improvement']
            };
        }

        // Treatment Effectiveness Query
        else if (queryType === 'treatmentEffectiveness') {
            const avgEff = queryResults.reduce((sum, t) => sum + (t.effectiveness || 0), 0) / queryResults.length;
            result = {
                title: 'Effectiveness Analysis',
                summary: `Average effectiveness: ${avgEff.toFixed(0)}% across ${queryResults.length} outcomes`,
                condition: `This treatment shows ${avgEff >= 70 ? 'good' : 'moderate'} effectiveness`,
                recommendations: [
                    avgEff >= 80 ? 'Continue current treatment plan' : 'Consider combination with behavioral therapy',
                    'Monitor progress weekly'
                ],
                labTests: ['Regular symptom assessment', 'Effectiveness evaluation after 4 weeks'],
                nextSteps: ['Track progress daily', 'Report any side effects']
            };
        }

        // Outcomes by Symptom Query
        else if (queryType === 'outcomesBySymptom') {
            const topOutcome = queryResults[0];
            result = {
                title: 'Outcome Analysis',
                summary: `Top outcome: ${topOutcome.outcome}`,
                condition: `${topOutcome.outcome} can be achieved through ${topOutcome.viaTreatment}`,
                recommendations: [`Focus on ${topOutcome.viaTreatment} for best results`, `Set measurable goals`],
                labTests: ['Regular progress assessment', 'Outcome tracking sheet'],
                nextSteps: ['Set weekly goals', 'Review progress with doctor']
            };
        }

        // Generic Analysis
        else {
            result = {
                title: 'Query Analysis',
                summary: `Found ${queryResults.length} records`,
                condition: 'Based on your query results',
                recommendations: ['Review the data above', 'Run specific queries for detailed analysis'],
                labTests: ['Consult specialist for personalized recommendations'],
                nextSteps: ['Explore Graph View for relationships', 'Try different query types']
            };
        }

        setAnalysis(result);
        setLoading(false);
    };

    const getConditionDescription = (symptom, severity) => {
        if (severity >= 8) {
            return `Severe ${symptom} detected. This requires immediate attention and clinical evaluation.`;
        } else if (severity >= 5) {
            return `Moderate ${symptom} detected. Regular monitoring and behavioral interventions recommended.`;
        } else {
            return `Mild ${symptom} detected. Maintain healthy habits and continue current management.`;
        }
    };

    const getRecommendations = (symptom, severity) => {
        const recommendations = [];

        if (symptom === 'Hyperactivity') {
            recommendations.push('Engage in 30-45 minutes of physical activity daily');
            recommendations.push('Practice deep breathing exercises when feeling restless');
            recommendations.push('Maintain a structured daily routine');
        } else if (symptom === 'Inattention') {
            recommendations.push('Break tasks into 15-20 minute chunks');
            recommendations.push('Use timers and reminders for important tasks');
            recommendations.push('Create checklists and prioritize tasks');
        } else if (symptom === 'Impulsivity') {
            recommendations.push('Practice "stop-think-act" method before responding');
            recommendations.push('Write down thoughts before speaking');
            recommendations.push('Set clear goals and rewards for controlled behavior');
        }

        if (severity >= 7) {
            recommendations.push('Consult a psychiatrist for medication evaluation');
            recommendations.push('Schedule follow-up in 2-3 weeks');
        } else if (severity >= 5) {
            recommendations.push('Schedule follow-up in 4-6 weeks');
            recommendations.push('Track symptoms daily using a journal');
        } else {
            recommendations.push('Continue current management strategies');
            recommendations.push('Routine check-up in 6 months');
        }

        return recommendations;
    };

    const getLabTests = (symptom) => {
        if (symptom === 'Hyperactivity') {
            return [
                'Conners Comprehensive Behavior Rating Scale — Questionnaire',
                'Actigraphy — Physical activity monitoring',
                'ADHD Rating Scale (ARS) — Symptom assessment'
            ];
        } else if (symptom === 'Inattention') {
            return [
                'ADHD Rating Scale (ARS) — 18-item questionnaire',
                'Continuous Performance Test (CPT) — Computerized attention test',
                'EEG / Brain Mapping — Neurological assessment (if severe)'
            ];
        } else if (symptom === 'Impulsivity') {
            return [
                'Continuous Performance Test (CPT) — Impulse control measurement',
                'Barratt Impulsiveness Scale — Questionnaire',
                'Go/No-Go Task — Cognitive assessment'
            ];
        }
        return [
            'Comprehensive ADHD Assessment',
            'Behavioral Rating Scales',
            'Clinical interview with specialist'
        ];
    };

    const getNextSteps = (symptom, severity) => {
        const steps = [];

        if (severity >= 7) {
            steps.push('Schedule appointment with psychiatrist within 1 week');
            steps.push('Start symptom journal immediately');
            steps.push('Involve family in treatment planning');
        } else if (severity >= 5) {
            steps.push('Schedule follow-up in 2-3 weeks');
            steps.push('Track symptoms daily');
            steps.push('Start recommended lifestyle changes');
        } else {
            steps.push('Continue current management');
            steps.push('Routine check-up in 3-6 months');
            steps.push('Maintain healthy habits');
        }

        steps.push('Contact clinic for appointment scheduling');
        steps.push('Bring symptom journal to next visit');

        return steps;
    };

    if (!queryResults || queryResults.length === 0) {
        return (
            <div className="lab-recommendations">
                <h3>Clinical recommendations</h3>
                <div className="info-box">
                    <p>Run a query first to get personalized recommendations.</p>
                    <ul>
                        <li>Patients by Symptom → symptom analysis & recommendations</li>
                        <li>Treatments by Outcome → treatment effectiveness</li>
                        <li>Treatment Effectiveness → outcome analysis</li>
                    </ul>
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="lab-recommendations">
                <h3>Clinical recommendations</h3>
                <div className="card">
                    <div className="skeleton" style={{ height: '100px' }} />
                </div>
            </div>
        );
    }

    return (
        <div className="lab-recommendations">
            <h3>Clinical recommendations</h3>

            {analysis && (
                <>
                    <div className="analysis-summary">
                        <h4>{analysis.title}</h4>
                        <p>{analysis.summary}</p>
                    </div>

                    <div className="condition-box">
                        <h4>Your condition</h4>
                        <p>{analysis.condition}</p>
                    </div>

                    <div className="recommendations-box">
                        <h4>What you should do</h4>
                        <ul>
                            {analysis.recommendations.map((rec, i) => (
                                <li key={i}>{rec}</li>
                            ))}
                        </ul>
                    </div>

                    <div className="lab-tests-box">
                        <h4>Recommended tests</h4>
                        <ul>
                            {analysis.labTests.map((test, i) => (
                                <li key={i}>{test}</li>
                            ))}
                        </ul>
                    </div>

                    <div className="next-steps-box">
                        <h4>Next steps</h4>
                        <ul>
                            {analysis.nextSteps.map((step, i) => (
                                <li key={i}>{step}</li>
                            ))}
                        </ul>
                    </div>

                    <div className="disclaimer">
                        <p>This is for informational purposes only. Please consult a qualified healthcare professional for medical advice.</p>
                    </div>
                </>
            )}
        </div>
    );
};

export default LabTestRecommendations;