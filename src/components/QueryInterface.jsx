import React, { useState, useEffect, useRef } from 'react';
import { driver } from '../services/neo4j';
import {
    queryTemplates,
    executeQuery,
    getSymptoms,
    getTreatments,
    getOutcomes
} from '../services/queryService';
import { predictADHDRisk } from '../services/mlService';
import { saveAssessment } from '../services/userDataService';
import SpeechInput from './SpeechInput';
import LanguageToggle from './LanguageToggle';
import PDFReport from './PDFReport';
import { translate } from '../translations/urdu';
import './QueryInterface.css';

const QueryInterface = ({ onQueryResult }) => {
    const [mode, setMode] = useState('self');
    const [queryType, setQueryType] = useState('patientsBySymptom');
    const [selectedItem, setSelectedItem] = useState('');
    const [items, setItems] = useState([]);
    const [customQuery, setCustomQuery] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [minScore, setMinScore] = useState('5');
    const [recommendations, setRecommendations] = useState([]);
    const [results, setResults] = useState([]);
    const [severityTips, setSeverityTips] = useState([]);
    const [userReport, setUserReport] = useState(null);
    const [allSymptoms, setAllSymptoms] = useState([]);
    const [mlPrediction, setMlPrediction] = useState(null);
    const [language, setLanguage] = useState('english');
    const [speechFeedback, setSpeechFeedback] = useState(null);
    const symptomsLoaded = useRef(false);

    const [userSymptoms, setUserSymptoms] = useState({});
    const [userAge, setUserAge] = useState(25);
    const [userGender, setUserGender] = useState('Male');

    // MongoDB backend URL
    const BACKEND_URL = import.meta.env.VITE_API_URL?.replace(/\/api$/, '') || 'http://localhost:5001';
    const USER_ID = 'adhd_user_001';

    // Load all symptoms from Neo4j ONCE
    useEffect(() => {
        if (symptomsLoaded.current) return;
        symptomsLoaded.current = true;

        const loadAllSymptoms = async () => {
            try {
                const symptoms = await getSymptoms();
                const uniqueSymptoms = [...new Set(symptoms)];
                setAllSymptoms(uniqueSymptoms);
                const initialSymptoms = {};
                uniqueSymptoms.forEach(symptom => {
                    initialSymptoms[symptom] = 0;
                });
                setUserSymptoms(initialSymptoms);
                console.log('Unique symptoms loaded:', uniqueSymptoms.length);
            } catch (error) {
                console.error('Error loading symptoms:', error);
                const fallbackSymptoms = ['Inattention', 'Hyperactivity', 'Impulsivity', 'Daydreaming', 'Restlessness', 'Fidgeting', 'Poor concentration', 'Interrupting others', 'Difficulty waiting turn', 'Rejection Sensitivity Dysphoria'];
                const uniqueFallback = [...new Set(fallbackSymptoms)];
                setAllSymptoms(uniqueFallback);
                const initialSymptoms = {};
                uniqueFallback.forEach(symptom => {
                    initialSymptoms[symptom] = 0;
                });
                setUserSymptoms(initialSymptoms);
            }
        };
        loadAllSymptoms();
    }, []);

    useEffect(() => {
        const loadItems = async () => {
            try {
                if (queryType === 'treatmentsByOutcome') {
                    const outcomes = await getOutcomes();
                    setItems(outcomes);
                    if (outcomes.length > 0) setSelectedItem(outcomes[0]);
                }
                else if (queryType === 'outcomesBySymptom') {
                    const symptoms = await getSymptoms();
                    const uniqueSymptoms = [...new Set(symptoms)];
                    setItems(uniqueSymptoms);
                    if (uniqueSymptoms.length > 0) setSelectedItem(uniqueSymptoms[0]);
                }
                else if (queryType === 'patientsBySymptom') {
                    const symptoms = await getSymptoms();
                    const uniqueSymptoms = [...new Set(symptoms)];
                    setItems(uniqueSymptoms);
                    if (uniqueSymptoms.length > 0) setSelectedItem(uniqueSymptoms[0]);
                }
                else if (queryType === 'treatmentEffectiveness') {
                    const treatments = await getTreatments();
                    setItems(treatments);
                    if (treatments.length > 0) setSelectedItem(treatments[0]);
                }
                else {
                    setItems([]);
                    setSelectedItem('');
                }
            } catch (error) {
                console.error('Error loading items:', error);
            }
        };
        loadItems();
    }, [queryType]);

    // Handle speech transcript - NO AUTO INCREMENT
    const handleSpeechTranscript = (transcript) => {
        const lowerTranscript = transcript.toLowerCase();
        let detectedSymptoms = [];

        if (lowerTranscript.includes('inattention') || lowerTranscript.includes('focus') || lowerTranscript.includes('attention')) {
            detectedSymptoms.push('Inattention');
        }
        if (lowerTranscript.includes('hyperactivity') || lowerTranscript.includes('restless') || lowerTranscript.includes('hyper')) {
            detectedSymptoms.push('Hyperactivity');
        }
        if (lowerTranscript.includes('impulsivity') || lowerTranscript.includes('impulse') || lowerTranscript.includes('impulsive')) {
            detectedSymptoms.push('Impulsivity');
        }
        if (lowerTranscript.includes('daydream') || lowerTranscript.includes('daydreaming')) {
            detectedSymptoms.push('Daydreaming');
        }
        if (lowerTranscript.includes('restlessness') || lowerTranscript.includes('restless')) {
            detectedSymptoms.push('Restlessness');
        }
        if (lowerTranscript.includes('fidget') || lowerTranscript.includes('fidgeting')) {
            detectedSymptoms.push('Fidgeting');
        }
        if (lowerTranscript.includes('concentration') || lowerTranscript.includes('focus')) {
            detectedSymptoms.push('Poor concentration');
        }
        if (lowerTranscript.includes('interrupt') || lowerTranscript.includes('interrupting')) {
            detectedSymptoms.push('Interrupting others');
        }
        if (lowerTranscript.includes('waiting') || lowerTranscript.includes('turn')) {
            detectedSymptoms.push('Difficulty waiting turn');
        }
        if (lowerTranscript.includes('rejection') || lowerTranscript.includes('sensitivity')) {
            detectedSymptoms.push('Rejection Sensitivity Dysphoria');
        }

        if (detectedSymptoms.length > 0) {
            setSpeechFeedback({
                type: 'detected',
                detected: detectedSymptoms,
                transcript,
            });
        } else {
            setSpeechFeedback({
                type: 'none',
                transcript,
            });
        }
        setTimeout(() => setSpeechFeedback(null), 6000);
    };
    // Save query to MongoDB
    const saveQueryToMongoDB = async (queryText, responseText, tableData, queryType) => {
        try {
            const response = await fetch(`${BACKEND_URL}/api/query`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    query: queryText,
                    userId: USER_ID,
                    responseText: responseText,
                    tableData: tableData,
                    queryType: queryType
                })
            });

            if (response.ok) {
                console.log('✅ Query saved to MongoDB');
            } else {
                console.error('Failed to save query to MongoDB');
            }
        } catch (error) {
            console.error('Error saving to MongoDB:', error);
        }
    };

    // Load history from MongoDB
    const loadHistoryFromMongoDB = async () => {
        try {
            const response = await fetch(`${BACKEND_URL}/api/history/${USER_ID}`);
            if (response.ok) {
                const history = await response.json();
                console.log(`📚 Loaded ${history.length} previous queries from MongoDB`);
                return history;
            }
        } catch (error) {
            console.error('Error loading history:', error);
        }
        return [];
    };

    const getTopSymptoms = () => {
        const scores = [];
        for (const [symptom, score] of Object.entries(userSymptoms)) {
            if (score > 0) {
                scores.push({ name: symptom, score: score });
            }
        }
        scores.sort((a, b) => b.score - a.score);
        return scores;
    };

    const getPrimarySymptom = () => {
        const top = getTopSymptoms();
        return top.length > 0 ? top[0].name : 'None';
    };

    const getAvgSeverity = () => {
        const scores = Object.values(userSymptoms).filter(s => s > 0);
        if (scores.length === 0) return 0;
        return scores.reduce((a, b) => a + b, 0) / scores.length;
    };

    const getMaxSeverity = () => {
        const scores = Object.values(userSymptoms).filter(s => s > 0);
        if (scores.length === 0) return 0;
        return Math.max(...scores);
    };

    const getSeverityLevel = (score) => {
        if (score >= 9) return 'Critical';
        if (score >= 7) return 'Severe';
        if (score >= 5) return 'Moderate';
        if (score >= 3) return 'Mild';
        return 'Minimal';
    };

    const getRecommendationsForUser = () => {
        const topSymptoms = getTopSymptoms();
        const primarySymptom = getPrimarySymptom();
        const avgSeverity = getAvgSeverity();
        const maxSeverity = getMaxSeverity();
        const severityLevel = getSeverityLevel(maxSeverity);

        const treatments = {
            'Inattention': {
                firstLine: 'Stimulant medications (methylphenidate, amphetamines)',
                behavioral: 'Cognitive Behavioral Therapy, organizational skills training',
                lifestyle: 'Break tasks into 15-20 min chunks, use timers, checklists, eliminate distractions',
                monitoring: 'Follow-up in 4 weeks'
            },
            'Hyperactivity': {
                firstLine: 'Behavioral interventions, parent training, classroom management',
                behavioral: 'Physical activity programs (30-45 min daily), sensory integration',
                lifestyle: 'Structured routines, regular exercise, caffeine avoidance, adequate sleep',
                monitoring: 'Follow-up in 2-4 weeks'
            },
            'Impulsivity': {
                firstLine: 'Cognitive Behavioral Therapy, impulse control training',
                behavioral: 'Mindfulness training, social skills training',
                lifestyle: 'Stop-think-act method, planners, goal setting, count to 10 before responding',
                monitoring: 'Follow-up in 3-4 weeks'
            },
            'Daydreaming': {
                firstLine: 'Cognitive Behavioral Therapy, attention training',
                behavioral: 'Mindfulness exercises, grounding techniques',
                lifestyle: 'Set daily goals, use reminders, practice presence exercises',
                monitoring: 'Follow-up in 4 weeks'
            },
            'Restlessness': {
                firstLine: 'Physical activity, movement breaks',
                behavioral: 'Sensory integration therapy, fidget tools',
                lifestyle: 'Regular exercise, stretching routines, reduce caffeine',
                monitoring: 'Follow-up in 2-3 weeks'
            },
            'Fidgeting': {
                firstLine: 'Fidget tools, sensory strategies',
                behavioral: 'Occupational therapy, movement breaks',
                lifestyle: 'Allow controlled movement, use stress balls, standing desk',
                monitoring: 'Follow-up in 4 weeks'
            },
            'Poor concentration': {
                firstLine: 'Stimulant medications, cognitive training',
                behavioral: 'Organizational skills training, task breakdown',
                lifestyle: 'Minimize distractions, use timers, take breaks',
                monitoring: 'Follow-up in 4 weeks'
            },
            'Interrupting others': {
                firstLine: 'Social skills training, impulse control strategies',
                behavioral: 'Wait your turn practice, conversation scripts',
                lifestyle: 'Use visual cues, practice patience exercises',
                monitoring: 'Follow-up in 3-4 weeks'
            },
            'Difficulty waiting turn': {
                firstLine: 'Behavioral therapy, patience training',
                behavioral: 'Turn-taking games, structured activities',
                lifestyle: 'Use timers, practice waiting exercises',
                monitoring: 'Follow-up in 3-4 weeks'
            },
            'Rejection Sensitivity Dysphoria': {
                firstLine: 'Cognitive Behavioral Therapy, emotional regulation',
                behavioral: 'Dialectical Behavior Therapy (DBT), support groups',
                lifestyle: 'Validate feelings, build resilience, practice self-compassion',
                monitoring: 'Follow-up in 2-3 weeks'
            }
        };

        const guide = treatments[primarySymptom] || treatments['Inattention'];

        const getLabTests = () => {
            const tests = [];
            const highSymptoms = topSymptoms.filter(s => s.score >= 5);

            if (highSymptoms.some(s => s.name === 'Inattention')) {
                tests.push({ name: 'Continuous Performance Test (CPT-3)', source: 'NIMH', turnaround: 'Same day' });
                tests.push({ name: 'Vanderbilt ADHD Diagnostic Rating Scale', source: 'CDC', turnaround: '3-5 days' });
            }
            if (highSymptoms.some(s => s.name === 'Hyperactivity')) {
                tests.push({ name: 'Conners Comprehensive Behavior Rating Scale', source: 'APA', turnaround: '1-2 weeks' });
                tests.push({ name: 'Actigraphy', source: 'MayoClinic', turnaround: '1 week' });
            }
            if (highSymptoms.some(s => s.name === 'Impulsivity')) {
                tests.push({ name: 'Barratt Impulsiveness Scale (BIS-11)', source: 'APA', turnaround: 'Same day' });
                tests.push({ name: 'Go/No-Go Task', source: 'NIMH', turnaround: 'Same day' });
            }
            if (highSymptoms.some(s => s.name === 'Daydreaming')) {
                tests.push({ name: 'EEG / qEEG Brain Mapping', source: 'MayoClinic', turnaround: '1 week' });
            }
            if (highSymptoms.some(s => s.name === 'Rejection Sensitivity Dysphoria')) {
                tests.push({ name: 'Clinical Interview', source: 'APA', turnaround: '1-2 weeks' });
            }

            const uniqueTests = tests.filter((test, index, self) =>
                index === self.findIndex(t => t.name === test.name)
            );

            return uniqueTests.slice(0, 5);
        };

        const getNextSteps = () => {
            const steps = [];
            if (maxSeverity >= 9) {
                steps.push('URGENT: Schedule appointment with psychiatrist within 48 hours');
                steps.push('Start daily symptom journal immediately');
                steps.push('Crisis support available if needed');
                steps.push('Discuss intensive treatment options');
            } else if (maxSeverity >= 7) {
                steps.push('Schedule appointment with psychiatrist within 1 week');
                steps.push('Start daily symptom journal immediately');
                steps.push('Discuss medication options with specialist');
            } else if (maxSeverity >= 5) {
                steps.push('Schedule follow-up in 2-3 weeks');
                steps.push('Track symptoms daily');
                steps.push('Start recommended lifestyle changes');
            } else if (maxSeverity >= 3) {
                steps.push('Monitor symptoms for 2 weeks');
                steps.push('Implement behavioral strategies');
                steps.push('Follow up if symptoms worsen');
            } else {
                steps.push('Routine check-up in 3-6 months');
                steps.push('Maintain healthy habits');
            }
            return steps;
        };

        const whatToDoList = [];
        for (const symptom of topSymptoms) {
            if (symptom.score >= 5) {
                if (symptom.name === 'Inattention') whatToDoList.push(`📋 ${symptom.name}: Use checklists and timers, break tasks into chunks`);
                else if (symptom.name === 'Hyperactivity') whatToDoList.push(`🏃 ${symptom.name}: Daily exercise 30-45 mins, structured routine`);
                else if (symptom.name === 'Impulsivity') whatToDoList.push(`⚡ ${symptom.name}: Practice stop-think-act method`);
                else if (symptom.name === 'Daydreaming') whatToDoList.push(`💭 ${symptom.name}: Set daily goals, use reminders, practice grounding`);
                else if (symptom.name === 'Restlessness') whatToDoList.push(`🪑 ${symptom.name}: Movement breaks, fidget tools, reduce caffeine`);
                else if (symptom.name === 'Poor concentration') whatToDoList.push(`🎯 ${symptom.name}: Minimize distractions, use timers, take breaks`);
                else if (symptom.name === 'Interrupting others') whatToDoList.push(`🗣️ ${symptom.name}: Practice waiting, use visual cues`);
                else if (symptom.name === 'Rejection Sensitivity Dysphoria') whatToDoList.push(`💖 ${symptom.name}: Validate feelings, build resilience, therapy recommended`);
                else if (symptom.name === 'Fidgeting') whatToDoList.push(`✋ ${symptom.name}: Use fidget tools, allow controlled movement`);
                else if (symptom.name === 'Difficulty waiting turn') whatToDoList.push(`⏳ ${symptom.name}: Practice turn-taking games, use timers`);
            }
        }

        whatToDoList.push(`📅 ${guide.monitoring}`);

        return {
            primarySymptom: primarySymptom,
            avgSeverity: avgSeverity.toFixed(1),
            maxSeverity: maxSeverity,
            severityLevel: severityLevel,
            topSymptoms: topSymptoms,
            condition: `${severityLevel} symptoms detected - Primary: ${primarySymptom}`,
            treatments: guide,
            labTests: getLabTests(),
            nextSteps: getNextSteps(),
            whatToDo: [
                `🏥 First-Line Treatment: ${guide.firstLine}`,
                `📚 Behavioral: ${guide.behavioral}`,
                `🌿 Lifestyle Changes: ${guide.lifestyle}`,
                ...whatToDoList
            ]
        };
    };

    const handleUserAnalysis = async () => {
        const hasAnySymptom = Object.values(userSymptoms).some((s) => s > 0);
        if (!hasAnySymptom) {
            setError('Set at least one symptom slider above 0 before requesting a report.');
            return;
        }

        setLoading(true);
        setError('');

        try {
            // Calculate scores from ALL symptoms
            const allScores = Object.values(userSymptoms).filter(s => s > 0);
            const maxSeverity = Math.max(...allScores);
            const avgSeverity = allScores.length > 0 ? allScores.reduce((a, b) => a + b, 0) / allScores.length : 0;

            const inattentionScore = userSymptoms.Inattention || 0;
            const hyperactivityScore = userSymptoms.Hyperactivity || 0;
            const impulsivityScore = userSymptoms.Impulsivity || 0;
            const coreAvg = (inattentionScore + hyperactivityScore + impulsivityScore) / 3;

            // Enhanced risk calculation using ALL symptoms
            let mlResult;
            try {
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 3000);

                const response = await fetch(`${BACKEND_URL}/predict`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    signal: controller.signal,
                    body: JSON.stringify({
                        age: userAge,
                        gender: userGender,
                        inattention: inattentionScore,
                        hyperactivity: hyperactivityScore,
                        impulsivity: impulsivityScore
                    })
                });

                clearTimeout(timeoutId);

                if (response.ok) {
                    mlResult = await response.json();
                } else {
                    throw new Error('ML API error');
                }
            } catch (mlError) {
                console.log('ML API not available, using enhanced fallback');
                let probability, risk_level, recommendation;

                if (maxSeverity >= 9) {
                    probability = 95;
                    risk_level = 'Critical';
                    recommendation = 'URGENT: Immediate clinical evaluation required. Severe symptoms detected across multiple domains.';
                } else if (maxSeverity >= 7) {
                    probability = 85;
                    risk_level = 'High';
                    recommendation = 'Immediate clinical evaluation recommended. Multiple severe symptoms detected.';
                } else if (maxSeverity >= 5) {
                    probability = 65;
                    risk_level = 'Moderate-High';
                    recommendation = 'Schedule evaluation soon. Multiple moderate to severe symptoms present.';
                } else if (avgSeverity >= 5) {
                    probability = 55;
                    risk_level = 'Moderate';
                    recommendation = 'Monitor symptoms regularly. Consider behavioral interventions.';
                } else if (maxSeverity >= 3) {
                    probability = 35;
                    risk_level = 'Mild-Moderate';
                    recommendation = 'Regular monitoring recommended. Implement lifestyle changes.';
                } else {
                    probability = 15;
                    risk_level = 'Low';
                    recommendation = 'Continue current management. Routine check-ups.';
                }

                mlResult = { probability, risk_level, recommendation, source: 'Enhanced Rule-Based' };
            }

            if (maxSeverity >= 7 && mlResult.probability < 70) {
                mlResult = {
                    probability: maxSeverity >= 9 ? 95 : 85,
                    risk_level: maxSeverity >= 9 ? 'Critical' : 'High',
                    recommendation: maxSeverity >= 9 ? 'URGENT: Immediate clinical evaluation required.' : 'Immediate clinical evaluation recommended.',
                    source: 'Symptom-Overridden'
                };
            }

            setMlPrediction(mlResult);

            const report = getRecommendationsForUser();
            const enhancedReport = { ...report, mlPrediction: mlResult };
            setUserReport(enhancedReport);

            const assessmentData = {
                age: userAge,
                gender: userGender,
                symptoms: { ...userSymptoms },
                topSymptoms: getTopSymptoms().slice(0, 5),
                riskScore: mlResult.probability,
                riskLevel: mlResult.risk_level,
                recommendation: mlResult.recommendation,
                whatToDo: report.whatToDo,
                labTests: report.labTests
            };

            await saveQueryToMongoDB(
                `Self-assessment: Age ${userAge}, Gender ${userGender}`,
                `Risk Score: ${mlResult.probability}% (${mlResult.risk_level}) - ${mlResult.recommendation}`,
                { symptoms: assessmentData.topSymptoms, riskScore: mlResult.probability },
                'self-assessment'
            );

            const saved = saveAssessment(assessmentData);
            if (saved.success) {
                console.log('Assessment saved successfully');
            }

            const resultRecord = { age: userAge, gender: userGender };
            for (const [symptom, score] of Object.entries(userSymptoms)) {
                if (score > 0) {
                    resultRecord[symptom.toLowerCase()] = score;
                }
            }
            resultRecord.severity = maxSeverity;
            setResults([resultRecord]);

            let severityDisplayLevel = '';
            if (maxSeverity >= 9) {
                severityDisplayLevel = 'Critical';
            } else if (maxSeverity >= 7) {
                severityDisplayLevel = 'Severe';
            } else if (maxSeverity >= 5) {
                severityDisplayLevel = 'Moderate';
            } else if (maxSeverity >= 3) {
                severityDisplayLevel = 'Mild';
            } else {
                severityDisplayLevel = 'Minimal';
            }

            let tipText = '';
            if (mlResult.probability >= 80) {
                tipText = `🔴 CRITICAL: Very High risk (${mlResult.probability}%). ${mlResult.recommendation}`;
            } else if (mlResult.probability >= 70) {
                tipText = `⚠️ HIGH RISK: High risk (${mlResult.probability}%). ${mlResult.recommendation}`;
            } else if (mlResult.probability >= 50) {
                tipText = `📊 MODERATE RISK: Moderate risk (${mlResult.probability}%). ${mlResult.recommendation}`;
            } else if (mlResult.probability >= 30) {
                tipText = `✅ MILD RISK: Mild risk (${mlResult.probability}%). ${mlResult.recommendation}`;
            } else {
                tipText = `✅ LOW RISK: Low risk (${mlResult.probability}%). ${mlResult.recommendation}`;
            }

            setSeverityTips([{
                level: severityDisplayLevel,
                count: 1,
                tip: tipText,
            }]);

            if (onQueryResult) {
                onQueryResult([resultRecord], 'self', 'User Symptoms');
            }
        } catch (error) {
            console.error('Analysis error:', error);
            setError('Analysis failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleDatabaseQuerySubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setRecommendations([]);
        setResults([]);
        setSeverityTips([]);
        setUserReport(null);
        setMlPrediction(null);

        if (!selectedItem && queryType !== 'symptomCorrelation' && queryType !== 'custom') {
            setError('Please select an item');
            setLoading(false);
            return;
        }

        try {
            let query;
            let queryDescription = '';

            if (queryType === 'custom') {
                if (!customQuery.trim()) {
                    setError('Please enter a Cypher query');
                    setLoading(false);
                    return;
                }
                query = customQuery;
                queryDescription = `Custom query: ${customQuery.substring(0, 100)}`;
            } else if (queryType === 'patientsBySymptom') {
                query = queryTemplates[queryType](selectedItem, minScore);
                queryDescription = `Find patients with symptom: ${selectedItem}, min score: ${minScore}`;
            } else {
                query = queryTemplates[queryType](selectedItem);
                queryDescription = `${queryType} for: ${selectedItem}`;
            }

            const queryResults = await executeQuery(query);
            setResults(queryResults);

            await saveQueryToMongoDB(
                queryDescription,
                `Found ${queryResults.length} results`,
                { results: queryResults.slice(0, 10) },
                queryType
            );

            if (onQueryResult) {
                onQueryResult(queryResults, queryType, selectedItem);
            }
        } catch (err) {
            console.error('Query error:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const getSelectLabel = () => {
        if (queryType === 'treatmentsByOutcome') return 'Select Outcome';
        if (queryType === 'outcomesBySymptom') return 'Select Symptom';
        if (queryType === 'patientsBySymptom') return 'Select Symptom';
        if (queryType === 'treatmentEffectiveness') return 'Select Treatment';
        return 'Select';
    };

    const renderResultsTable = () => {
        if (!results.length) return null;
        const columns = Object.keys(results[0]);

        return (
            <div className="results-section">
                <h4>Query Results ({results.length} records)</h4>
                <div className="results-table-wrapper">
                    <table className="results-table">
                        <thead>
                            <tr>
                                {columns.map(col => (
                                    <th key={col}>{col}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {results.map((row, idx) => (
                                <tr key={idx}>
                                    {columns.map(col => (
                                        <td key={col}>
                                            {row[col] !== undefined && row[col] !== null ? String(row[col]) : 'N/A'}
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        );
    };

    const handleSymptomChange = (symptom, value) => {
        setUserSymptoms(prev => ({ ...prev, [symptom]: value }));
        if (error) setError('');
    };

    const getSymptomIcon = (symptom) => {
        const icons = {
            'Inattention': '🧠', 'Hyperactivity': '⚡', 'Impulsivity': '🎯',
            'Daydreaming': '💭', 'Restlessness': '🪑', 'Fidgeting': '✋',
            'Poor concentration': '📝', 'Interrupting others': '🗣️',
            'Difficulty waiting turn': '⏳', 'Rejection Sensitivity Dysphoria': '💔'
        };
        return icons[symptom] || '📋';
    };

    return (
        <div className="query-interface">
            <div className="top-bar">
                <h3>{translate('ADHD Clinical Assistant', language)}</h3>
                <LanguageToggle language={language} setLanguage={setLanguage} />
            </div>

            <div className="mode-toggle">
                <button className={mode === 'self' ? 'active' : ''} onClick={() => setMode('self')}>{translate('Check My Symptoms', language)}</button>
                <button className={mode === 'database' ? 'active' : ''} onClick={() => setMode('database')}>{translate('Browse Database', language)}</button>
            </div>

            {mode === 'self' ? (
                <div className="self-assessment">
                    <div className="self-assessment-header">
                        <SpeechInput onTranscript={handleSpeechTranscript} language={language === 'urdu' ? 'ur-PK' : 'en-US'} />
                    </div>

                    {speechFeedback && (
                        <div className={`speech-feedback speech-feedback--${speechFeedback.type}`}>
                            {speechFeedback.type === 'detected' ? (
                                <span>Detected: <strong>{speechFeedback.detected.join(', ')}</strong> — adjust the sliders below to set severity.</span>
                            ) : (
                                <span>Heard "{speechFeedback.transcript}" — no symptoms recognized. Try the sliders instead.</span>
                            )}
                        </div>
                    )}
                    <h4>{translate('Tell us about your symptoms', language)}</h4>
                    <div className="symptom-sliders">
                        {allSymptoms.map(symptom => (
                            <div key={symptom} className="slider-group">
                                <label>{getSymptomIcon(symptom)} {translate(symptom, language)}</label>
                                <input type="range" min="0" max="10" value={userSymptoms[symptom] || 0} onChange={(e) => handleSymptomChange(symptom, parseInt(e.target.value))} />
                                <span>{userSymptoms[symptom] || 0}/10</span>
                            </div>
                        ))}
                    </div>
                    <div className="user-details">
                        <div className="detail-group">
                            <label>{translate('Age', language)}</label>
                            <input type="number" value={userAge} onChange={(e) => setUserAge(parseInt(e.target.value))} placeholder="Enter age" />
                        </div>
                        <div className="detail-group">
                            <label>{translate('Gender', language)}</label>
                            <select value={userGender} onChange={(e) => setUserGender(e.target.value)}>
                                <option>{translate('Male', language)}</option>
                                <option>{translate('Female', language)}</option>
                                <option>{translate('Nonbinary', language)}</option>
                                <option>{translate('Prefer not to say', language)}</option>
                            </select>
                        </div>
                    </div>
                    <button className="analyze-btn" onClick={handleUserAnalysis} disabled={loading}>
                        {loading ? translate('Analyzing...', language) : translate('Get My Personalized Report', language)}
                    </button>
                    {error && <div className="error-message">{error}</div>}
                </div>
            ) : (
                <div>
                    <div className="query-type-selector">
                        <select value={queryType} onChange={(e) => setQueryType(e.target.value)}>
                            <option value="patientsBySymptom">{translate('Patients by Symptom', language)}</option>
                            <option value="treatmentsByOutcome">{translate('Treatments by Outcome', language)}</option>
                            <option value="outcomesBySymptom">{translate('Outcomes by Symptom', language)}</option>
                            <option value="treatmentEffectiveness">{translate('Treatment Effectiveness', language)}</option>
                            <option value="symptomCorrelation">{translate('Symptom Correlation', language)}</option>
                            <option value="custom">{translate('Custom Query', language)}</option>
                        </select>
                        <p className="query-description">
                            {queryType === 'patientsBySymptom' && translate('Find patients with specific symptom severity', language)}
                            {queryType === 'treatmentsByOutcome' && translate('Find treatments that improve a specific outcome', language)}
                            {queryType === 'outcomesBySymptom' && translate('Find outcomes related to a specific symptom', language)}
                            {queryType === 'treatmentEffectiveness' && translate('Check effectiveness of a specific treatment', language)}
                            {queryType === 'symptomCorrelation' && translate('Analyze correlation between symptoms', language)}
                            {queryType === 'custom' && translate('Write your own Cypher query', language)}
                        </p>
                    </div>

                    <form onSubmit={handleDatabaseQuerySubmit} className="query-form">
                        {queryType !== 'custom' && queryType !== 'symptomCorrelation' && items.length > 0 && (
                            <div className="form-group">
                                <label>{getSelectLabel()}:</label>
                                <select value={selectedItem} onChange={(e) => setSelectedItem(e.target.value)} required>
                                    {items.map(item => <option key={item} value={item}>{item}</option>)}
                                </select>
                            </div>
                        )}

                        {queryType === 'patientsBySymptom' && (
                            <div className="form-group">
                                <label>{translate('Minimum Severity Score (1-10)', language)}:</label>
                                <input type="number" min="1" max="10" value={minScore} onChange={(e) => setMinScore(e.target.value)} />
                            </div>
                        )}

                        {queryType === 'custom' && (
                            <div className="form-group">
                                <label>{translate('Write your Cypher query:', language)}</label>
                                <textarea value={customQuery} onChange={(e) => setCustomQuery(e.target.value)} rows="4" placeholder="MATCH (n)-[r]->(m) RETURN n,r,m LIMIT 25" required />
                            </div>
                        )}

                        {error && <div className="error-message">{error}</div>}
                        <button type="submit" disabled={loading} className="query-button">{loading ? translate('Executing...', language) : translate('Run Query', language)}</button>
                    </form>
                </div>
            )}

            {severityTips.length > 0 && (
                <div className="tips-section">
                    <h4>{translate('Quick Assessment', language)}</h4>
                    <div className="tips-grid">
                        {severityTips.map((tip, idx) => (
                            <div key={idx} className={`tip-card tip-card--${tip.level.toLowerCase()}`}>
                                <div className="tip-header"><span className={`tip-level tip-level--${tip.level.toLowerCase()}`}>{translate(tip.level, language)} {translate('Symptoms', language)}</span></div>
                                <div className="tip-content">{tip.tip}</div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {userReport && (
                <div className="user-report">
                    <div className="report-header">
                        <h4>{translate('Your Clinical Assessment Report', language)}</h4>
                        <div className={`severity-badge severity-badge--${userReport.severityLevel.toLowerCase()}`}>
                            {translate(userReport.severityLevel, language)} ({userReport.maxSeverity}/10)
                        </div>
                    </div>

                    {mlPrediction && (
                        <div className="ml-section">
                            <p><strong>{translate('AI Risk Score', language)}:</strong> {mlPrediction.probability}% ({translate(mlPrediction.risk_level, language)})</p>
                            <p><strong>{translate('AI Recommendation', language)}:</strong> {mlPrediction.recommendation}</p>
                        </div>
                    )}

                    <div className="report-section">
                        <p><strong>{translate('Primary Concern', language)}:</strong> {translate(userReport.condition, language)}</p>
                        {userReport.topSymptoms.length > 0 && (
                            <p><strong>{translate('Top Symptoms', language)}:</strong> {userReport.topSymptoms.slice(0, 5).map(s => `${translate(s.name, language)} (${s.score}/10)`).join(', ')}</p>
                        )}
                    </div>

                    <div className="report-section">
                        <p><strong>{translate('What You Should Do', language)}:</strong></p>
                        <ul>{userReport.whatToDo.map((item, i) => <li key={i}>{item}</li>)}</ul>
                    </div>

                    <div className="report-section">
                        <p><strong>{translate('Recommended Tests', language)}:</strong></p>
                        <ul>{userReport.labTests.map((test, i) => <li key={i}><strong>{test.name}</strong> - {test.source}<div className="test-meta">⏱️ Turnaround: {test.turnaround}</div></li>)}</ul>
                    </div>

                    <div className="report-section">
                        <p><strong>{translate('Next Steps', language)}:</strong></p>
                        <ul>{userReport.nextSteps.map((step, i) => <li key={i}>{step}</li>)}</ul>
                    </div>

                    <PDFReport
                        reportData={{
                            age: userAge,
                            gender: userGender,
                            riskScore: mlPrediction?.probability,
                            riskLevel: mlPrediction?.risk_level,
                            recommendation: mlPrediction?.recommendation,
                            topSymptoms: getTopSymptoms(),
                            whatToDo: userReport.whatToDo,
                            labTests: userReport.labTests,
                            nextSteps: userReport.nextSteps
                        }}
                        patientName={userGender === 'Female' ? 'خاتون' : 'صاحب'}
                    />

                    <div className="disclaimer">
                        <p>⚠️ This is an AI-assisted clinical decision support tool based on DSM-5 criteria and clinical guidelines. All recommendations should be reviewed by a qualified healthcare professional.</p>
                    </div>
                </div>
            )}

            {mode === 'database' && renderResultsTable()}

            <div className="query-help">
                <h4>{translate('Example Questions You Can Ask', language)}</h4>
                <ul>
                    <li>{translate('What treatments improve "Inattention"?', language)}</li>
                    <li>{translate('Which outcomes are associated with "Hyperactivity"?', language)}</li>
                    <li>{translate('How effective is "Cognitive Behavioral Therapy"?', language)}</li>
                    <li>{translate('What lab tests are recommended for severe symptoms?', language)}</li>
                </ul>
            </div>
        </div>
    );
};

export default QueryInterface;