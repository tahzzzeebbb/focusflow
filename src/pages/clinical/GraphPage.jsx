import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import ADHDGraph from '../../components/ADHDGraph';
import { getTreatmentOutcomeData } from '../../services/neo4j';
import { DATASET } from '../../services/adhdEngine';
import './Clinical.css';

export default function GraphPage() {
  const navigate = useNavigate();
  const { showToast } = useApp();
  const [graphData, setGraphData]   = useState({ nodes:[], edges:[] });
  const [graphError, setGraphError] = useState(null);
  const [loading, setLoading]       = useState(true);
  const [connected, setConnected]   = useState(false);

  const load = useCallback(async () => {
    setLoading(true); setGraphError(null);
    const data = await getTreatmentOutcomeData();
    setGraphData(data);
    if (data.error) { setGraphError(data.error); setConnected(false); }
    else { setConnected(true); }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  return (
    <div className="screen">
      {/* Header */}
      <div className="clin-header sticky-header">
        <button className="clin-back" onClick={() => navigate('/home')}>←</button>
        <div>
          <div className="clin-title">Treatment → Outcome Graph</div>
          <div className="clin-subtitle">Neo4j AuraDB · Real relationship data</div>
        </div>
        <div className={`clin-dot ${connected ? 'green' : 'red'}`} />
      </div>

      {/* Real data banner */}
      <div className="real-data-banner">
        <span>📊</span>
        <span>Predicted from <strong>2,000 real patients</strong> · Treatments → Outcomes from clinical literature</span>
      </div>

      <div className="screen__scroll">
        {/* Stats row */}
        <div className="clin-stats-row">
          {[
            { n: '12', label: 'Treatments', color: 'var(--p500)' },
            { n: '12', label: 'Outcomes',   color: 'var(--g500)' },
            { n: '10', label: 'Symptoms',   color: 'var(--o500)' },
            { n: '8',  label: 'Patients',   color: 'var(--b500, #4A90D9)' },
          ].map(s => (
            <div key={s.label} className="clin-stat">
              <div style={{ fontSize:22, fontWeight:900, color:s.color }}>{s.n}</div>
              <div style={{ fontSize:10, color:'var(--ink3)', textTransform:'uppercase', letterSpacing:'.4px' }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Legend */}
        <div className="clin-legend">
          <span><i style={{background:'var(--node-treatment)'}} /> Treatment</span>
          <span><i style={{background:'var(--node-outcome)'}} /> Outcome</span>
          <span><i style={{background:'var(--node-symptom)'}} /> Symptom</span>
          <span><i style={{background:'var(--node-patient)'}} /> Patient</span>
        </div>

        {/* Graph */}
        {loading ? (
          <div className="clin-loading">
            <div className="clin-spinner" />
            <p>Connecting to Neo4j AuraDB…</p>
            <p className="clin-loading-sub">Fetching treatment-outcome relationships</p>
          </div>
        ) : graphError ? (
          <div className="clin-error-box">
            <div style={{ fontSize:48, marginBottom:12 }}>⚡</div>
            <h3>Neo4j Not Connected</h3>
            <p>{graphError}</p>
            <p style={{ marginTop:8, fontSize:12, color:'var(--ink3)' }}>
              Add your AuraDB credentials to .env and run the seed script in neo4j-seed/
            </p>
            <button className="clin-retry-btn" onClick={load}>Retry Connection</button>
          </div>
        ) : graphData.nodes.length === 0 ? (
          <div className="clin-error-box">
            <div style={{ fontSize:48, marginBottom:12 }}>🌱</div>
            <h3>Graph is empty</h3>
            <p>Connected to Neo4j but no data found. Run the seed script:</p>
            <code style={{ fontSize:12, background:'var(--surf2)', padding:'8px 12px', borderRadius:8, display:'block', marginTop:8 }}>
              neo4j-seed/seed.cypher
            </code>
          </div>
        ) : (
          <div className="clin-graph-wrap">
            <ADHDGraph elements={graphData} />
            <p className="clin-graph-tip">Tap a node to focus · Drag to explore · Pinch to zoom</p>
          </div>
        )}

        {/* How it works */}
        <div className="clin-info-card">
          <h3>How this graph works</h3>
          <p>Each <strong style={{color:'var(--node-treatment)'}}>Treatment</strong> node connects to <strong style={{color:'var(--node-outcome)'}}>Outcome</strong> nodes via IMPROVES relationships. Edge weights represent effectiveness percentages calibrated from clinical literature and our {DATASET.total.toLocaleString()}-patient dataset.</p>
          <div className="clin-info-grid">
            <div>
              <div style={{fontWeight:700,color:'var(--p500)',marginBottom:4}}>Stimulant medication</div>
              <div style={{fontSize:12,color:'var(--ink3)'}}>70% response rate · Strongest evidence</div>
            </div>
            <div>
              <div style={{fontWeight:700,color:'var(--g500)',marginBottom:4}}>CBT + Stimulant</div>
              <div style={{fontSize:12,color:'var(--ink3)'}}>82% combined effectiveness</div>
            </div>
          </div>
        </div>

        <div style={{ height:24 }} />
      </div>

      {/* Bottom nav */}
      <div className="clin-bottom-tabs sticky-footer" style={{padding:'12px 20px 34px'}}>
        {[
          { path:'/graph',     label:'Graph',     icon:'🕸️', active:true },
          { path:'/query',     label:'Query',     icon:'🔍' },
          { path:'/labtest',   label:'Lab Tests', icon:'🔬' },
          { path:'/analytics', label:'Analytics', icon:'📊' },
        ].map(t => (
          <button key={t.path}
            className={`clin-tab ${t.active ? 'active' : ''}`}
            onClick={() => navigate(t.path)}>
            <span>{t.icon}</span>
            <span>{t.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
