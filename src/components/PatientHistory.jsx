import React, { useState, useEffect } from 'react';
import { getAssessments, getRiskProfileSummary, deleteAssessment } from '../services/userDataService';
import './PatientHistory.css';

const PatientHistory = () => {
  const [assessments, setAssessments] = useState([]);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedAssessment, setSelectedAssessment] = useState(null);
  const [pendingDeleteId, setPendingDeleteId] = useState(null);

  const loadData = () => {
    const history = getAssessments();
    setAssessments(history);
    setProfile(getRiskProfileSummary());
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleDeleteClick = (id) => {
    if (pendingDeleteId === id) {
      deleteAssessment(id);
      setPendingDeleteId(null);
      loadData();
    } else {
      setPendingDeleteId(id);
      setTimeout(() => setPendingDeleteId((current) => (current === id ? null : current)), 4000);
    }
  };

  if (loading) {
    return (
      <div className="card patient-history-loading">
        <div className="skeleton" style={{ height: '140px' }} />
      </div>
    );
  }

  return (
    <div className="patient-history">
      <h3>My health records</h3>

      {/* Risk Profile Summary */}
      {profile && profile.totalAssessments > 0 && (
        <div className="profile-summary">
          <h4>Risk profile summary</h4>
          <div className="profile-stats">
            <div className="profile-stat">
              <span>Total assessments</span>
              <strong>{profile.totalAssessments}</strong>
            </div>
            <div className="profile-stat">
              <span>Latest risk score</span>
              <strong className={`risk-${profile.latestRiskLevel?.toLowerCase()}`}>
                {profile.latestRiskScore}% ({profile.latestRiskLevel})
              </strong>
            </div>
            <div className="profile-stat">
              <span>Average risk</span>
              <strong>{profile.averageRiskScore}%</strong>
            </div>
          </div>

          {Object.keys(profile.averageSymptomScores).length > 0 && (
            <div className="avg-symptoms">
              <h5>Your average symptom scores</h5>
              <div className="avg-symptom-list">
                {Object.entries(profile.averageSymptomScores).map(([symptom, score]) => (
                  <div key={symptom} className="avg-symptom-item">
                    <span>{symptom}</span>
                    <div className="avg-bar">
                      <div className="avg-fill" style={{ width: `${(score / 10) * 100}%` }}></div>
                      <span>{score}/10</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Assessment History List */}
      <h4>Assessment history</h4>
      {assessments.length === 0 ? (
        <div className="card empty-state">
          <div className="empty-state__icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M4 19.5A2.5 2.5 0 016.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" />
            </svg>
          </div>
          <h3>No assessments yet</h3>
          <p>Go to the Query view and use "Check My Symptoms" to create your first assessment.</p>
        </div>
      ) : (
        <div className="history-list">
          {assessments.map((assessment) => (
            <div key={assessment.id} className="history-card">
              <div className="history-header">
                <div className="history-date">
                  {new Date(assessment.date).toLocaleDateString()}
                  <small>{new Date(assessment.date).toLocaleTimeString()}</small>
                </div>
                <div className="history-risk">
                  <span className={`risk-badge risk-${assessment.riskLevel?.toLowerCase()}`}>
                    {assessment.riskLevel} ({assessment.riskScore}%)
                  </span>
                </div>
                <button
                  className={`delete-btn ${pendingDeleteId === assessment.id ? 'delete-btn--confirm' : ''}`}
                  onClick={() => handleDeleteClick(assessment.id)}
                  title={pendingDeleteId === assessment.id ? 'Click again to confirm' : 'Delete assessment'}
                >
                  {pendingDeleteId === assessment.id ? 'Confirm delete?' : (
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2m3 0l-1 14a2 2 0 01-2 2H7a2 2 0 01-2-2L4 6h16z" />
                    </svg>
                  )}
                </button>
              </div>

              {/* Symptoms */}
              <div className="history-symptoms">
                <strong>Symptoms:</strong>
                <div className="symptoms-list">
                  {Object.entries(assessment.symptoms)
                    .filter(([, score]) => score > 0)
                    .sort((a, b) => b[1] - a[1])
                    .map(([symptom, score]) => (
                      <span key={symptom} className="symptom-tag">
                        {symptom}: {score}/10
                      </span>
                    ))}
                </div>
              </div>

              <button
                className="view-details-btn"
                onClick={() => setSelectedAssessment(selectedAssessment === assessment.id ? null : assessment.id)}
              >
                {selectedAssessment === assessment.id ? 'Hide details' : 'View full report'}
                <svg
                  width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
                  style={{ transform: selectedAssessment === assessment.id ? 'rotate(180deg)' : 'none', transition: 'transform 200ms' }}
                >
                  <path d="M6 9l6 6 6-6" />
                </svg>
              </button>

              {selectedAssessment === assessment.id && (
                <div className="assessment-details">
                  <div className="detail-section">
                    <strong>Top symptoms</strong>
                    <div className="top-symptoms">
                      {assessment.topSymptoms?.slice(0, 5).map((s, i) => (
                        <span key={i} className="top-symptom">
                          {s.name} <span className="symptom-score">{s.score}/10</span>
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="detail-section">
                    <strong>What you should do</strong>
                    <ul>
                      {assessment.whatToDo?.slice(0, 4).map((item, i) => (
                        <li key={i}>{item}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="detail-section">
                    <strong>Recommended tests</strong>
                    <ul>
                      {assessment.labTests?.slice(0, 4).map((test, i) => (
                        <li key={i}>
                          <span className="test-name">{test.name}</span>
                          <span className="test-source"> — {test.source}</span>
                          <span className="test-turnaround"> ({test.turnaround})</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="detail-section">
                    <strong>AI recommendation</strong>
                    <p className="ai-recommendation">{assessment.recommendation}</p>
                  </div>

                  <div className="detail-section">
                    <strong>Next steps</strong>
                    <ul>
                      {assessment.nextSteps?.slice(0, 3).map((step, i) => (
                        <li key={i}>{step}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PatientHistory;
