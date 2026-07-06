// User-specific storage using localStorage with user ID from backend
const getStorageKey = () => {
    // Try to get user from AuthContext
    const userStr = localStorage.getItem('adhd_user');
    if (userStr) {
        try {
            const user = JSON.parse(userStr);
            if (user && user.id) {
                return `adhd_assessments_${user.id}`;
            }
        } catch (e) {
            console.error('Error parsing user:', e);
        }
    }

    // Fallback to token-based key
    const token = localStorage.getItem('token');
    if (token) {
        // Use token hash as identifier (first 10 chars)
        const tokenHash = token.substring(0, 10);
        return `adhd_assessments_token_${tokenHash}`;
    }

    // Guest mode
    return 'adhd_assessments_guest';
};

// Save assessment to history (user-specific)
export const saveAssessment = (assessmentData) => {
    try {
        const storageKey = getStorageKey();
        const existing = localStorage.getItem(storageKey);
        const assessments = existing ? JSON.parse(existing) : [];

        const newAssessment = {
            id: Date.now(),
            date: new Date().toISOString(),
            ...assessmentData
        };

        assessments.unshift(newAssessment); // Add to beginning
        localStorage.setItem(storageKey, JSON.stringify(assessments));

        console.log(`✅ Assessment saved to ${storageKey}`);
        return { success: true, id: newAssessment.id };
    } catch (error) {
        console.error('Save error:', error);
        return { success: false, error: error.message };
    }
};

// Get all assessments for current user
export const getAssessments = () => {
    try {
        const storageKey = getStorageKey();
        const existing = localStorage.getItem(storageKey);
        const assessments = existing ? JSON.parse(existing) : [];
        console.log(`📋 Loaded ${assessments.length} assessments from ${storageKey}`);
        return assessments;
    } catch (error) {
        console.error('Load error:', error);
        return [];
    }
};

// Get latest assessment
export const getLatestAssessment = () => {
    const assessments = getAssessments();
    return assessments.length > 0 ? assessments[0] : null;
};

// Get risk profile summary for current user
export const getRiskProfileSummary = () => {
    const assessments = getAssessments();
    if (assessments.length === 0) return null;

    const latest = assessments[0];
    const avgScores = {};
    let totalRisk = 0;

    assessments.forEach(a => {
        totalRisk += a.riskScore || 0;
        if (a.symptoms) {
            Object.entries(a.symptoms).forEach(([symptom, score]) => {
                if (!avgScores[symptom]) avgScores[symptom] = { total: 0, count: 0 };
                avgScores[symptom].total += score;
                avgScores[symptom].count += 1;
            });
        }
    });

    const averages = {};
    Object.entries(avgScores).forEach(([symptom, data]) => {
        averages[symptom] = (data.total / data.count).toFixed(1);
    });

    return {
        totalAssessments: assessments.length,
        latestRiskScore: latest.riskScore,
        latestRiskLevel: latest.riskLevel,
        averageSymptomScores: averages,
        averageRiskScore: (totalRisk / assessments.length).toFixed(1),
        history: assessments
    };
};

// Delete assessment for current user
export const deleteAssessment = (id) => {
    try {
        const storageKey = getStorageKey();
        const assessments = getAssessments();
        const filtered = assessments.filter(a => a.id !== id);
        localStorage.setItem(storageKey, JSON.stringify(filtered));
        console.log(`🗑️ Deleted assessment ${id} from ${storageKey}`);
        return { success: true };
    } catch (error) {
        console.error('Delete error:', error);
        return { success: false, error: error.message };
    }
};

// Clear all assessments for current user (called on logout)
export const clearUserAssessments = () => {
    try {
        const storageKey = getStorageKey();
        localStorage.removeItem(storageKey);
        console.log(`🧹 Cleared all assessments from ${storageKey}`);
        return { success: true };
    } catch (error) {
        console.error('Clear error:', error);
        return { success: false, error: error.message };
    }
};

// Get all users' assessment keys (for admin - optional)
export const getAllUserAssessmentKeys = () => {
    const keys = [];
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('adhd_assessments_')) {
            keys.push(key);
        }
    }
    return keys;
};