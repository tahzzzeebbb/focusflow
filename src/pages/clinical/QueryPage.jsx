import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { executeQuery, queryTemplates, getSymptoms, getTreatments, getOutcomes } from '../../services/queryService';
import { DATASET } from '../../services/adhdEngine';
import './Clinical.css';

const QUERY_TYPES = [
  { id:'treatmentsByOutcome', label:'Treatments by Outcome',    icon:'💊', desc:'What treats a specific outcome?',      color:'var(--p500)' },
  { id:'outcomesBySymptom',   label:'Outcomes by Symptom',      icon:'🎯', desc:'What improves when a symptom is treated?', color:'var(--g500)' },
  { id:'patientsBySymptom',   label:'Patients by Symptom',      icon:'👥', desc:'Real patients with this symptom',     color:'var(--o500)' },
  { id:'treatmentEffectiveness', label:'Treatment Effectiveness', icon:'📈', desc:'How effective is a treatment?',      color:'var(--b500,#4A90D9)' },
  { id:'symptomCorrelation',  label:'Symptom Correlation',      icon:'🔗', desc:'Correlate symptoms across patients',  color:'var(--r500)' },
];

export default function QueryPage() {
  const navigate = useNavigate();
  const { showToast } = useApp();
  const [queryType, setQueryType] = useState('treatmentsByOutcome');
  const [param, setParam]         = useState('');
  const [results, setResults]     = useState(null);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState('');
  const [options, setOptions]     = useState([]);

  const selectedType = QUERY_TYPES.find(q => q.id === queryType);

  useEffect(() => {
    (async () => {
      setParam('');
      setResults(null);
      setError('');
      if (queryType === 'treatmentsByOutcome') setOptions(await getOutcomes());
      else if (queryType === 'outcomesBySymptom' || queryType === 'patientsBySymptom') setOptions(await getSymptoms());
      else if (queryType === 'treatmentEffectiveness') setOptions(await getTreatments());
      else setOptions([]);
    })();
  }, [queryType]);

  const runQuery = async () => {
    if (!param && queryType !== 'symptomCorrelation') {
      setError('Please select or enter a value'); return;
    }
    setLoading(true); setError(''); setResults(null);
    try {
      let cypher = '';
      if (queryType === 'treatmentsByOutcome')    cypher = queryTemplates.treatmentsByOutcome(param);
      else if (queryType === 'outcomesBySymptom') cypher = queryTemplates.outcomesBySymptom(param);
      else if (queryType === 'patientsBySymptom') cypher = queryTemplates.patientsBySymptom(param);
      else if (queryType === 'treatmentEffectiveness') cypher = queryTemplates.treatmentEffectiveness(param);
      else cypher = queryTemplates.symptomCorrelation();
      const data = await executeQuery(cypher);
      setResults(data);
      if (data.length === 0) setError('No results found. Try a different query.');
    } catch (e) {
      setError(e.message || 'Query failed — is Neo4j connected?');
    } finally { setLoading(false); }
  };

  const getColumns = () => {
    if (!results?.length) return [];
    return Object.keys(results[0]);
  };

  return (
    <div className="screen">
      <div className="clin-header sticky-header">
        <button className="clin-back" onClick={() => navigate('/home')}>←</button>
        <div>
          <div className="clin-title">Neo4j Query Engine</div>
          <div className="clin-subtitle">5 query types · Real graph data</div>
        </div>
        <span style={{fontSize:20}}>🔍</span>
      </div>

      <div className="real-data-banner">
        <span>🧠</span>
        <span>Queries run directly on <strong>Neo4j AuraDB</strong> · Results from real treatment-outcome graph</span>
      </div>

      <div className="screen__scroll">
        {/* Query type selector */}
        <div className="section" style={{marginTop:16}}>
          <div className="section-title" style={{marginBottom:12}}>Select Query Type</div>
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
        {queryType !== 'symptomCorrelation' && (
          <div className="section">
            <div className="section-title" style={{marginBottom:12}}>
              {queryType === 'treatmentsByOutcome' ? 'Select Outcome' :
               queryType === 'treatmentEffectiveness' ? 'Select Treatment' : 'Select Symptom'}
            </div>
            {options.length > 0 ? (
              <>
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
                <div style={{textAlign:'center',fontSize:12,color:'var(--ink3)',marginBottom:8}}>— or type manually —</div>
              </>
            ) : (
              <div style={{fontSize:12,color:'var(--o500)',marginBottom:8,padding:'8px 12px',background:'var(--o50)',borderRadius:10}}>
                ⚠️ Could not load options from Neo4j. Type manually below.
              </div>
            )}
            <input
              className="query-input"
              value={param}
              onChange={e => setParam(e.target.value)}
              placeholder={queryType==='treatmentsByOutcome' ? 'e.g. Improved attention' :
                           queryType==='treatmentEffectiveness' ? 'e.g. Stimulant medication' :
                           'e.g. Inattention'}
              onKeyDown={e => e.key==='Enter' && runQuery()}
            />
          </div>
        )}

        {error && (
          <div className="section">
            <div className="clin-error-inline">{error}</div>
          </div>
        )}

        {/* Run button */}
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
              <div className="section-title">{results.length} Results</div>
              <span className="ui-badge ui-badge--green">From Neo4j AuraDB</span>
            </div>

            {/* Effectiveness bars for treatment queries */}
            {(queryType==='treatmentsByOutcome' || queryType==='treatmentEffectiveness') && results[0]?.effectiveness && (
              <div className="results-bars">
                {results.slice(0,8).map((r,i) => (
                  <div key={i} className="result-bar-row">
                    <div className="result-bar-label">{r.treatment || r.outcome}</div>
                    <div className="result-bar-track">
                      <div className="result-bar-fill"
                        style={{width:`${r.effectiveness}%`, background:selectedType.color}} />
                    </div>
                    <div className="result-bar-val"
                      style={{color:selectedType.color}}>{r.effectiveness}%</div>
                  </div>
                ))}
              </div>
            )}

            {/* Table for all results */}
            <div className="results-table-wrap">
              <table className="results-table">
                <thead>
                  <tr>
                    {getColumns().map(col => <th key={col}>{col}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {results.map((row,i) => (
                    <tr key={i}>
                      {getColumns().map(col => (
                        <td key={col}>
                          {col==='effectiveness' ? (
                            <span style={{fontWeight:700,color:selectedType.color}}>{row[col]}%</span>
                          ) : String(row[col] ?? '—')}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Data attribution */}
            <div className="clin-attribution">
              <span>🔬</span>
              <span>Results from Neo4j AuraDB · Relationship weights calibrated from {DATASET.total.toLocaleString()} patient records</span>
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
