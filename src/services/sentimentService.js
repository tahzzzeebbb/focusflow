// Simple sentiment analysis for user queries
const positiveWords = ['improve', 'better', 'good', 'help', 'effective', 'working', 'success'];
const negativeWords = ['worse', 'bad', 'struggle', 'difficult', 'hard', 'issue', 'problem'];

export const analyzeSentiment = (text) => {
    const words = text.toLowerCase().split(/\s+/);
    let score = 0;

    words.forEach(word => {
        if (positiveWords.includes(word)) score += 1;
        if (negativeWords.includes(word)) score -= 1;
    });

    if (score > 0) return { sentiment: 'positive', confidence: Math.abs(score) / 5 };
    if (score < 0) return { sentiment: 'negative', confidence: Math.abs(score) / 5 };
    return { sentiment: 'neutral', confidence: 0.5 };
};

export const searchWithSentiment = async (query, neo4jSearch) => {
    const sentiment = analyzeSentiment(query);

    // Boost results based on sentiment
    const results = await neo4jSearch(query);

    return {
        results,
        sentiment,
        recommendation: sentiment.sentiment === 'negative'
            ? "It seems you're concerned. Consider consulting a specialist."
            : "Great! Continue with your treatment plan."
    };
};