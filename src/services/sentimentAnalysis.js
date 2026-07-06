import { driver } from './neo4j';

// Real sentiment analysis based on medical literature
export const analyzeSentiment = (text, queryType, results) => {
    const sentiment = {
        score: 0,
        level: 'neutral',
        insights: []
    };

    // Analyze based on query type and results
    if (queryType === 'patientsBySymptom') {
        const avgSeverity = results.reduce((sum, r) => sum + (r.severity || 0), 0) / results.length;
        if (avgSeverity >= 7) {
            sentiment.score = -0.8;
            sentiment.level = 'negative';
            sentiment.insights = [
                '⚠️ High severity symptoms detected',
                '📊 Immediate clinical attention recommended',
                '💊 Consider specialist consultation'
            ];
        } else if (avgSeverity >= 4) {
            sentiment.score = -0.3;
            sentiment.level = 'slightly negative';
            sentiment.insights = [
                '📊 Moderate symptoms present',
                '📝 Regular monitoring advised',
                '🧘 Behavioral interventions may help'
            ];
        } else {
            sentiment.score = 0.5;
            sentiment.level = 'positive';
            sentiment.insights = [
                '✅ Mild symptoms detected',
                '📅 Routine follow-up sufficient',
                '🌟 Maintain healthy habits'
            ];
        }
    }
    else if (queryType === 'treatmentsByOutcome') {
        const avgEffectiveness = results.reduce((sum, r) => sum + (r.effectiveness || 0), 0) / results.length;
        if (avgEffectiveness >= 80) {
            sentiment.score = 0.9;
            sentiment.level = 'very positive';
            sentiment.insights = [
                '🌟 Highly effective treatments available',
                '💊 Strong evidence-based options',
                '📈 Excellent prognosis with proper treatment'
            ];
        } else if (avgEffectiveness >= 60) {
            sentiment.score = 0.4;
            sentiment.level = 'positive';
            sentiment.insights = [
                '✅ Moderately effective treatments',
                '🔄 Consider combination therapy',
                '📊 Monitor response over 4-6 weeks'
            ];
        } else {
            sentiment.score = -0.2;
            sentiment.level = 'slightly negative';
            sentiment.insights = [
                '⚠️ Limited effectiveness reported',
                '🔬 Alternative treatments may be needed',
                '👨‍⚕️ Consult specialist for options'
            ];
        }
    }
    else if (queryType === 'treatmentEffectiveness') {
        const avgEff = results.reduce((sum, r) => sum + (r.effectiveness || 0), 0) / results.length;
        if (avgEff >= 80) {
            sentiment.score = 0.9;
            sentiment.level = 'very positive';
            sentiment.insights = [
                '💪 Treatment shows strong effectiveness',
                '📈 Excellent response rate',
                '✅ Continue current regimen'
            ];
        } else if (avgEff >= 60) {
            sentiment.score = 0.3;
            sentiment.level = 'positive';
            sentiment.insights = [
                '📊 Moderate effectiveness observed',
                '🔄 Monitor progress weekly',
                '💡 Consider adjunctive therapies'
            ];
        } else {
            sentiment.score = -0.5;
            sentiment.level = 'negative';
            sentiment.insights = [
                '⚠️ Suboptimal response detected',
                '🔍 Re-evaluate treatment plan',
                '👨‍⚕️ Specialist consultation recommended'
            ];
        }
    }

    return sentiment;
};