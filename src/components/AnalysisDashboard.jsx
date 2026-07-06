import React, { useState, useEffect } from 'react';
import {
    getSymptomDistribution,
    getOutcomeRates,
    getTreatmentOutcomeCorrelation,
    getPatientRiskAnalysis
} from '../services/analysisService';
import BarChart from './BarChart';
import './AnalysisDashboard.css';

const AnalysisDashboard = () => {
    const [activeTab, setActiveTab] = useState('symptoms');
    const [symptoms, setSymptoms] = useState([]);
    const [outcomes, setOutcomes] = useState([]);
    const [correlations, setCorrelations] = useState([]);
    const [riskData, setRiskData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        loadAllData();
    }, []);

    const loadAllData = async () => {
        setLoading(true);
        setError('');
        try {
            const symp = await getSymptomDistribution();
            const out = await getOutcomeRates();
            const corr = await getTreatmentOutcomeCorrelation();
            const risk = await getPatientRiskAnalysis();

            console.log('Symptoms loaded:', symp);
            console.log('Outcomes loaded:', out);
            console.log('Correlations loaded:', corr.length);
            console.log('Risk data loaded:', risk.length);

            setSymptoms(symp);
            setOutcomes(out);
            setCorrelations(corr);
            setRiskData(risk);
        } catch (err) {
            console.error('Error loading data:', err);
            setError('Failed to load analysis data');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="card analysis-loading">
                <div className="skeleton" style={{ height: '32px', width: '50%', marginBottom: '16px' }} />
                <div className="skeleton" style={{ height: '180px' }} />
            </div>
        );
    }

    if (error) {
        return (
            <div className="card empty-state">
                <div className="empty-state__icon">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                        <path d="M12 9v4M12 17h.01M10.3 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L14.7 3.86a2 2 0 00-3.4 0z" />
                    </svg>
                </div>
                <h3>Couldn't load analysis data</h3>
                <p>{error}</p>
                <button className="btn btn-ghost btn-sm" onClick={loadAllData}>Retry</button>
            </div>
        );
    }

    // Prepare chart data
    const symptomChartData = symptoms.map(s => ({
        label: s.symptom,
        value: parseFloat(s.avgSeverity),
        unit: '/10'
    }));

    const outcomeChartData = outcomes.map(o => ({
        label: o.outcome.length > 25 ? o.outcome.slice(0, 22) + '...' : o.outcome,
        value: o.effectiveness,
        unit: '%'
    }));

    const treatmentChartData = correlations.slice(0, 10).map(c => ({
        label: c.treatment.length > 20 ? c.treatment.slice(0, 17) + '...' : c.treatment,
        value: c.effectiveness,
        unit: '%'
    }));

    return (
        <div className="analysis-dashboard">
            <div className="analysis-tabs">
                <button className={activeTab === 'symptoms' ? 'active' : ''} onClick={() => setActiveTab('symptoms')}>
                    Symptoms
                </button>
                <button className={activeTab === 'outcomes' ? 'active' : ''} onClick={() => setActiveTab('outcomes')}>
                    Outcomes
                </button>
                <button className={activeTab === 'correlations' ? 'active' : ''} onClick={() => setActiveTab('correlations')}>
                    Treatment → Outcome
                </button>
                <button className={activeTab === 'risk' ? 'active' : ''} onClick={() => setActiveTab('risk')}>
                    Risk profile
                </button>
            </div>

            <div className="analysis-content">
                {/* Symptoms Tab */}
                {activeTab === 'symptoms' && (
                    symptoms.length === 0 ? (
                        <div className="empty-state">
                            <p>No symptom data found.</p>
                        </div>
                    ) : (
                    <>
                        <div className="symptoms-grid">
                            {symptoms.map((item, idx) => (
                                <div key={idx} className="symptom-card">
                                    <h3>{item.symptom}</h3>
                                    <div className="score">{item.avgSeverity}/10</div>
                                    <div className="progress">
                                        <div style={{ width: `${(parseFloat(item.avgSeverity) / 10) * 100}%` }}></div>
                                    </div>
                                    <div className="count">Patients: {item.patientCount}</div>
                                </div>
                            ))}
                        </div>
                        <BarChart
                            data={symptomChartData}
                            title="Symptom Severity Distribution"
                            xLabel="Symptom"
                            yLabel="Severity (0-10)"
                            color="#C99A4A"
                        />
                    </>
                    )
                )}

                {/* Outcomes Tab */}
                {activeTab === 'outcomes' && (
                    <>
                        <div className="outcomes-grid">
                            {outcomes.map((item, idx) => (
                                <div key={idx} className="outcome-card">
                                    <h4>{item.outcome}</h4>
                                    <span className="category">{item.category}</span>
                                    <div className="stats">
                                        <span>Treatments: {item.treatmentCount}</span>
                                        <span>Effectiveness: {item.effectiveness}%</span>
                                    </div>
                                    <div className="progress">
                                        <div style={{ width: `${item.effectiveness}%` }}></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <BarChart
                            data={outcomeChartData}
                            title="Treatment Effectiveness by Outcome"
                            xLabel="Outcome"
                            yLabel="Effectiveness (%)"
                            color="#7A9B8A"
                        />
                    </>
                )}

                {/* Correlations Tab */}
                {activeTab === 'correlations' && (
                    <>
                        <div className="correlations-table">
                            <table className="correlation-table">
                                <thead>
                                    <tr>
                                        <th>Treatment</th>
                                        <th>Outcome</th>
                                        <th>Effectiveness</th>
                                        </tr>
                                </thead>
                                <tbody>
                                    {correlations.map((item, idx) => (
                                        <tr key={idx}>
                                            <td className="treatment-cell">{item.treatment}</td>
                                            <td className="outcome-cell">{item.outcome}</td>
                                            <td className="effectiveness-cell">
                                                <div className="small-bar">
                                                    <div style={{ width: `${item.effectiveness}%` }}></div>
                                                </div>
                                                {item.effectiveness}%
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <BarChart
                            data={treatmentChartData}
                            title="Top 10 Treatments by Effectiveness"
                            xLabel="Treatment"
                            yLabel="Effectiveness (%)"
                            color="#D97757"
                        />
                    </>
                )}

                {/* Risk Tab */}
                {activeTab === 'risk' && (
                    <div className="risk-grid">
                        {riskData.map((patient, idx) => (
                            <div key={idx} className={`risk-card ${patient.riskLevel === 'High' ? 'high' : patient.riskLevel === 'Moderate' ? 'moderate' : 'low'}`}>
                                <div className="header">
                                    <span>{patient.age} yrs</span>
                                    <span>{patient.gender}</span>
                                    <span className="badge">{patient.riskLevel}</span>
                                </div>
                                <div className="scores">
                                    <div>Inattention: {patient.inattention}/10</div>
                                    <div>Hyperactivity: {patient.hyperactivity}/10</div>
                                    <div>Impulsivity: {patient.impulsivity}/10</div>
                                </div>
                                <div className={`adhd-status ${patient.hasADHD === 'Yes' ? 'adhd-status--confirmed' : 'adhd-status--clear'}`}>
                                    {patient.hasADHD === 'Yes' ? 'ADHD confirmed' : 'No ADHD'}
                                </div>
                                <div className="advice">
                                    {patient.riskLevel === 'High' && 'Immediate specialist consultation'}
                                    {patient.riskLevel === 'Moderate' && 'Regular monitoring & behavioral therapy'}
                                    {patient.riskLevel === 'Low' && 'Maintain healthy habits'}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default AnalysisDashboard;