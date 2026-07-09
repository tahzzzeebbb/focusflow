import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { executeQuery, queryTemplates, getTreatments, getOutcomes, getAllOutcomes } from '../../services/queryService';
import './Clinical.css';

// Only 3 query types — matched exactly to what the real graph contains
// (Treatment, Outcome, IMPROVES, LEADS_TO). No fabricated "effectiveness %",
// no Symptom/Patient lookups that don't exist in this graph.
const QUERY_TYPES = [
  { id:'treatmentsByOutcome', label:'Treatments for an Outcome', icon:'💊', desc:'Which treatments are documented to improve this?', color:'var(--p500)' },
  { id:'treatmentEffectiveness', label:'What a Treatment Improves', icon:'📋', desc:'Which outcomes does this treatment target?', color:'var(--b500,#4A90D9)' },
  { id:'outcomeCascade', label:'Outcome Chain', icon:'🔗', desc:'What leads to this, and what does it lead to?', color:'var(--g500)' },
];

export default function QueryPage() {
  const navigate = useNavigate();
  const [queryType, setQueryType] = useState('treatmentsByOutcome');
  const [param, setParam]         = useState('');
  const [results, setResults]     = useState(null);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState('');
  const [options, setOptions]     = useState([]);

  const selectedType = QUERY_TYPES.find(q => q.id === queryType);

  useEffect(() => {
    (async () => {
      setParam(''); setResults(null); setError('');
      if (queryType === 'treatmentsByOutcome') setOptions(await getOutcomes());
      else if (queryType === 'treatmentEffectiveness') setOptions(await getTreatments());
      else if (queryType === 'outcomeCascade') setOptions(await getAllOutcomes());
    })();
  }, [queryType]);

  const runQuery = async () => {
    if (!param) { setError('Please select or enter a value'); return; }
    setLoading(true); setError(''); setResults(null);
    try {
      let cypher = '';
      if (queryType === 'treatmentsByOutcome')       cypher = queryTemplates.treatmentsByOutcome(param);
      else if (queryType === 'treatmentEffectiveness') cypher = queryTemplates.treatmentEffectiveness(param);
      else cypher = queryTemplates.outcomeCascade(param);
      const data = await executeQuery(cypher);
      setResults(data);
      if (data.length === 0) setError('No results found. Try a different value.');
    } catch (e) {
      setError(e.message || 'Query failed — is Neo4j connected?');
    } finally { setLoading(false); }
  };

  const getColumns = () => (results?.length ? Object.keys(results[0]) : []);

  return (
    <div className="screen">
      <div className="clin-header sticky-header">
        <button className="clin-back" onClick={() => navigate('/home')}>←</button>
        <div>
          <div className="clin-title">Treatment-Outcome Query</div>
          <div className="clin-subtitle">Neo4j graph · From NIMH, CDC, MayoClinic, APA</div>
        </div>
        <span style={{fontSize:20}}>🔍</span>
      </div>

      <div className="real-data-banner">
        <span>🧠</span>
        <span>These are documented relationships from clinical guidelines — not a measured effectiveness score</span>
      </div>

      <div className="screen__scroll">
        {/* Query type selector */}
        <div className="section" style={{marginTop:16}}>
          <div className="section-title" style={{marginBottom:12}}>What do you want to know?</div>
          <div style={{display:'flex',flexDirection:'column',gap:8}}>
            {QUERY_TYPES.map(qt => (
              <button key={qt.id}
                className={`query-type-btn ${queryType === qt.id ? 'active' : ''}`}
                style={queryType===qt.id ? {borderColor:qt.color,background:qt.color+'15'} : {}}
                onClick={() => setQueryType(qt.id)}>
                <span style={{fontSize:22,flexShrink:0}}>{qt.icon}</span>
                <div style={{flex:1,textAlign:'left'}}>
                  <div style={{fontSize:14,fontWeight:700,color:queryType===qt.id?qt.color:'var(--ink)'}}>{qt.label}</div>
                  <div style={{fontSize:12,color:'var(--ink3)'}}>{qt.desc}</div>
                </div>
                {queryType===qt.id && <span style={{color:qt.color,fontSize:18}}>✓</span>}
              </button>
            ))}
          </div>
        </div>

        {/* Parameter input */}
        <div className="section">
          <div className="section-title" style={{marginBottom:12}}>
            {queryType === 'treatmentEffectiveness' ? 'Select a Treatment' : 'Select an Outcome'}
          </div>
          {options.length > 0 ? (
            <div className="scroll-row" style={{marginBottom:10}}>
              {options.map(opt => (
                <button key={opt}
                  className={`option-chip ${param===opt ? 'active' : ''}`}
                  style={param===opt ? {background:selectedType.color,color:'#fff',borderColor:selectedType.color} : {}}
                  onClick={() => setParam(opt)}>
                  {opt}
                </button>
              ))}
            </div>
          ) : (
            <div style={{fontSize:12,color:'var(--o500)',marginBottom:8,padding:'8px 12px',background:'var(--o50)',borderRadius:10}}>
              ⚠️ Could not load options from Neo4j. Check your connection, or type manually below.
            </div>
          )}
          <div style={{textAlign:'center',fontSize:12,color:'var(--ink3)',margin:'6px 0 10px'}}>— or type manually —</div>
          <input
            className="query-input"
            value={param}
            onChange={e => setParam(e.target.value)}
            placeholder={queryType==='treatmentEffectiveness' ? 'e.g. Stimulant medication' : 'e.g. Improved attention'}
            onKeyDown={e => e.key==='Enter' && runQuery()}
          />
        </div>

        {error && (
          <div className="section">
            <div className="clin-error-inline">{error}</div>
          </div>
        )}

        <div className="section">
          <button className="clin-run-btn"
            style={{background: selectedType.color, boxShadow:`0 8px 24px ${selectedType.color}44`}}
            onClick={runQuery} disabled={loading}>
            {loading ? '⏳ Querying Neo4j…' : `Run ${selectedType.icon} ${selectedType.label}`}
          </button>
        </div>

        {/* Results */}
        {results && results.length > 0 && (
          <div className="section">
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:12}}>
              <div className="section-title">{results.length} Result{results.length!==1?'s':''}</div>
              <span className="ui-badge ui-badge--green">Live from Neo4j</span>
            </div>

            {/* Cards with citation badges instead of fake effectiveness bars */}
            <div style={{display:'flex',flexDirection:'column',gap:10}}>
              {results.map((row,i) => (
                <div key={i} style={{background:'var(--surf)',border:'1px solid var(--border)',borderRadius:14,padding:'14px 16px'}}>
                  {Object.entries(row).map(([key,val]) => (
                    <div key={key} style={{marginBottom:6}}>
                      <div style={{fontSize:10,color:'var(--ink3)',textTransform:'uppercase',letterSpacing:'.5px',fontWeight:700}}>
                        {key === 'citedBy' ? 'Source' : key.replace(/([A-Z])/g, ' $1')}
                      </div>
                      <div style={{fontSize:14,color:'var(--ink)',fontWeight: key==='treatment'||key==='outcome' ? 700 : 500}}>
                        {key === 'citedBy'
                          ? <span className="ui-badge ui-badge--purple">{val}</span>
                          : String(val ?? '—')}
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>

            <div className="clin-attribution" style={{marginTop:12}}>
              <span>🔬</span>
              <span>Results from Neo4j AuraDB · Relationships sourced from NIMH, CDC, MayoClinic, and APA guidelines</span>
            </div>
          </div>
        )}

        <div style={{height:24}} />
      </div>

      <div className="clin-bottom-tabs sticky-footer" style={{padding:'12px 20px 34px'}}>
        {[
          { path:'/graph',     label:'Graph',     icon:'🕸️' },
          { path:'/query',     label:'Query',     icon:'🔍', active:true },
          { path:'/labtest',   label:'Lab Tests', icon:'🔬' },
          { path:'/analytics', label:'Analytics', icon:'📊' },
        ].map(t => (
          <button key={t.path}
            className={`clin-tab ${t.active ? 'active' : ''}`}
            onClick={() => navigate(t.path)}>
            <span>{t.icon}</span><span>{t.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
