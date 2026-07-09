import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import ADHDGraph from '../../components/ADHDGraph';
import { getTreatmentOutcomeData } from '../../services/neo4j';
import './Clinical.css';

export default function GraphPage() {
  const navigate = useNavigate();
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

  // Real counts computed from whatever Neo4j actually returns —
  // never hardcoded, so this can't drift out of sync with the seed data again.
  const stats = useMemo(() => {
    const treatments = graphData.nodes.filter(n => n.data.type === 'treatment').length;
    const outcomes    = graphData.nodes.filter(n => n.data.type === 'outcome').length;
    const improves     = graphData.edges.filter(e => e.data.relType === 'IMPROVES').length;
    const leadsTo       = graphData.edges.filter(e => e.data.relType === 'LEADS_TO').length;
    return { treatments, outcomes, improves, leadsTo };
  }, [graphData]);

  return (
    <div className="screen">
      <div className="clin-header sticky-header">
        <button className="clin-back" onClick={() => navigate('/home')}>←</button>
        <div>
          <div className="clin-title">Treatment → Outcome Graph</div>
          <div className="clin-subtitle">Neo4j AuraDB · NIMH, CDC, MayoClinic, APA</div>
        </div>
        <div className={`clin-dot ${connected ? 'green' : 'red'}`} />
      </div>

      <div className="real-data-banner">
        <span>🕸️</span>
        <span>This is a <strong>separate dataset</strong> from your assessment — documented treatment-outcome
        relationships from clinical guidelines, not the 2,000-patient survey.</span>
      </div>

      <div className="screen__scroll">
        {/* Stats row — computed live from the actual loaded graph, never hardcoded */}
        <div className="clin-stats-row">
          {[
            { n: loading ? '—' : stats.treatments, label: 'Treatments', color: 'var(--p500)' },
            { n: loading ? '—' : stats.outcomes,   label: 'Outcomes',   color: 'var(--g500)' },
            { n: loading ? '—' : stats.improves,   label: 'Improves',   color: 'var(--o500)' },
            { n: loading ? '—' : stats.leadsTo,    label: 'Leads to',   color: 'var(--b500,#4A90D9)' },
          ].map(s => (
            <div key={s.label} className="clin-stat">
              <div style={{ fontSize:22, fontWeight:900, color:s.color }}>{s.n}</div>
              <div style={{ fontSize:10, color:'var(--ink3)', textTransform:'uppercase', letterSpacing:'.4px' }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Legend — only the node types that actually exist in this graph */}
        <div className="clin-legend">
          <span><i style={{background:'var(--node-treatment)'}} /> Treatment</span>
          <span><i style={{background:'var(--node-outcome)'}} /> Outcome</span>
        </div>

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
          <p>
            Each <strong style={{color:'var(--node-treatment)'}}>Treatment</strong> node connects to
            a <strong style={{color:'var(--node-outcome)'}}>Outcome</strong> node it's documented to
            improve. Some outcomes also connect to each other — e.g. improved attention tends to lead
            to better task completion, which tends to lead to better academic performance.
          </p>
          <div style={{marginTop:14,display:'flex',gap:8,flexWrap:'wrap'}}>
            <span className="ui-badge ui-badge--purple">NIMH</span>
            <span className="ui-badge ui-badge--green">CDC</span>
            <span className="ui-badge ui-badge--orange">MayoClinic</span>
            <span className="ui-badge ui-badge--dark">APA</span>
          </div>
        </div>

        <div style={{ height:24 }} />
      </div>

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
