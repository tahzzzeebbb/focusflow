import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { getLabTestsForSymptom, getTreatmentGuidelines } from '../../services/labTestService';
import { DATASET, INN_RISK, HYP_RISK, IMP_RISK } from '../../services/adhdEngine';
import './Clinical.css';

const SYMPTOMS = ['Inattention','Hyperactivity','Impulsivity','Daydreaming','Restlessness','RSD'];
const PRIORITY_COLOR = { High:'var(--r500)', Medium:'var(--o500)', Routine:'var(--g500)' };
const CATEGORY_ICON  = { Psychological:'🧠', Neuropsychological:'🔬', Cognitive:'💡', Behavioral:'📋', Physical:'🏃', Neurological:'⚡' };

export default function LabTestPage() {
  const navigate = useNavigate();
  const { score, assessment } = useApp();
  const [symptom, setSymptom]       = useState('Inattention');
  const [severity, setSeverity]     = useState(5);
  const [tests, setTests]           = useState(null);
  const [guidelines, setGuidelines] = useState(null);
  const [loading, setLoading]       = useState(false);

  // Pre-fill from assessment if available
  const assessmentInn = assessment?.inattention ?? null;
  const riskForSymptom = symptom==='Inattention' && assessmentInn!==null ? INN_RISK[assessmentInn] : null;

  const run = async () => {
    setLoading(true);
    const [t, g] = await Promise.all([
      getLabTestsForSymptom(symptom, severity),
      getTreatmentGuidelines(symptom, severity),
    ]);
    setTests(t); setGuidelines(g);
    setLoading(false);
  };

  return (
    <div className="screen">
      <div className="clin-header sticky-header">
        <button className="clin-back" onClick={() => navigate('/home')}>←</button>
        <div>
          <div className="clin-title">Lab Test Recommendations</div>
          <div className="clin-subtitle">NIMH · CDC · APA · Mayo Clinic guidelines</div>
        </div>
        <span style={{fontSize:20}}>🔬</span>
      </div>

      <div className="real-data-banner">
        <span>📋</span>
        <span>Based on your <strong>{score}% ADHD risk score</strong> · Evidence-based clinical guidelines</span>
      </div>

      <div className="screen__scroll">
        {/* Your profile from CSV */}
        {score && (
          <div className="section" style={{marginTop:16}}>
            <div className="clin-profile-card">
              <div style={{fontWeight:800,fontSize:15,marginBottom:8}}>Your ADHD Profile (from assessment)</div>
              <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:8}}>
                {[
                  {label:'Inattention', val:assessment?.inattention??'—', risk: assessmentInn!==null?INN_RISK[assessmentInn]:null, color:'var(--p500)'},
                  {label:'Hyperactivity', val:assessment?.hyperactivity??'—', risk: assessment?.hyperactivity!=null?HYP_RISK[assessment.hyperactivity]:null, color:'var(--o500)'},
                  {label:'Impulsivity', val:assessment?.impulsivity??'—', risk: assessment?.impulsivity!=null?IMP_RISK[assessment.impulsivity]:null, color:'var(--r500)'},
                ].map(s=>(
                  <div key={s.label} style={{background:'var(--surf)',borderRadius:12,padding:'10px 8px',textAlign:'center',border:'1px solid var(--border)'}}>
                    <div style={{fontSize:18,fontWeight:900,color:s.color}}>{s.val}/9</div>
                    <div style={{fontSize:10,color:'var(--ink3)',marginTop:2}}>{s.label}</div>
                    {s.risk!==null && <div style={{fontSize:10,color:s.color,fontWeight:700,marginTop:2}}>{s.risk}% ADHD rate</div>}
                  </div>
                ))}
              </div>
              <div style={{marginTop:10,fontSize:12,color:'var(--ink3)'}}>
                ← Scores from your assessment · Compared against {DATASET.total.toLocaleString()} real patients
              </div>
            </div>
          </div>
        )}

        {/* Symptom selector */}
        <div className="section">
          <div className="section-title" style={{marginBottom:12}}>Select Symptom to Investigate</div>
          <div className="scroll-row">
            {SYMPTOMS.map(s=>(
              <button key={s}
                className={`option-chip ${symptom===s?'active':''}`}
                style={symptom===s?{background:'var(--p500)',color:'#fff',borderColor:'var(--p500)'}:{}}
                onClick={()=>{setSymptom(s);setTests(null);setGuidelines(null);}}>
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Severity slider */}
        <div className="section">
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:12}}>
            <div className="section-title">Severity Level</div>
            <span style={{fontSize:20,fontWeight:900,color:severity>=7?'var(--r500)':severity>=4?'var(--o500)':'var(--g500)'}}>
              {severity}/10
            </span>
          </div>
          <div style={{background:'var(--surf2)',borderRadius:16,padding:'16px'}}>
            <div style={{display:'flex',justifyContent:'space-between',fontSize:12,color:'var(--ink3)',marginBottom:10}}>
              <span>Mild</span><span>Moderate</span><span>Severe</span>
            </div>
            <input type="range" min={1} max={10} value={severity}
              onChange={e=>setSeverity(parseInt(e.target.value))}
              style={{width:'100%',height:7,borderRadius:999,appearance:'none',
                background:`linear-gradient(to right, ${severity>=7?'var(--r500)':severity>=4?'var(--o500)':'var(--g500)'} ${severity*10}%, var(--border) ${severity*10}%)`,outline:'none'}}/>
            <div style={{marginTop:12,fontSize:13,color:'var(--ink2)',textAlign:'center'}}>
              {severity>=8?'🔴 Severe — immediate specialist referral recommended':
               severity>=6?'🟠 Moderate-high — clinical evaluation advised':
               severity>=4?'🟡 Moderate — monitoring and assessment recommended':
               '🟢 Mild — lifestyle modifications as first step'}
            </div>
          </div>
        </div>

        {/* Get recommendations button */}
        <div className="section">
          <button className="clin-run-btn" onClick={run} disabled={loading}>
            {loading ? '⏳ Loading recommendations…' : `🔬 Get Lab Tests for ${symptom} (Severity ${severity})`}
          </button>
        </div>

        {/* Results */}
        {tests && tests.length > 0 && (
          <>
            <div className="section">
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:12}}>
                <div className="section-title">Recommended Tests</div>
                <span className="ui-badge ui-badge--purple">{tests.length} tests</span>
              </div>
              {tests.map((test,i) => (
                <div key={i} className="lab-test-card">
                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:8}}>
                    <div style={{fontSize:16,fontWeight:800,color:'var(--ink)',flex:1,marginRight:8}}>{test.name}</div>
                    <span style={{fontSize:11,fontWeight:700,padding:'3px 10px',borderRadius:99,
                      background: PRIORITY_COLOR[test.priority]+'22', color:PRIORITY_COLOR[test.priority],
                      flexShrink:0}}>
                      {test.priority}
                    </span>
                  </div>
                  <div style={{display:'flex',gap:6,marginBottom:8,flexWrap:'wrap'}}>
                    <span className="ui-badge ui-badge--purple" style={{fontSize:11}}>
                      {CATEGORY_ICON[test.category]||'🔬'} {test.category}
                    </span>
                    <span className="ui-badge ui-badge--dark" style={{fontSize:11}}>
                      Source: {test.source}
                    </span>
                  </div>
                  <div style={{fontSize:13,color:'var(--ink2)',lineHeight:1.5}}>{test.description}</div>
                </div>
              ))}
            </div>

            {/* Treatment guidelines */}
            {guidelines && (
              <div className="section">
                <div className="section-title" style={{marginBottom:12}}>Clinical Guidelines for {symptom}</div>
                {[
                  {label:'First-line treatment', val:guidelines.firstLine,  icon:'🥇', color:'var(--g500)'},
                  {label:'Second-line treatment',val:guidelines.secondLine, icon:'🥈', color:'var(--p500)'},
                  {label:'Behavioral approach',  val:guidelines.behavioral, icon:'🧠', color:'var(--o500)'},
                  {label:'Lifestyle changes',    val:guidelines.lifestyle,  icon:'🌱', color:'var(--g600,#009468)'},
                  {label:'Follow-up',            val:guidelines.monitoring, icon:'📅', color:'var(--b500,#4A90D9)'},
                ].map(g=>(
                  <div key={g.label} style={{marginBottom:10,padding:'14px 16px',
                    background:'var(--surf)',border:'1px solid var(--border)',borderLeft:`4px solid ${g.color}`,
                    borderRadius:'0 14px 14px 0'}}>
                    <div style={{fontSize:12,fontWeight:700,color:g.color,marginBottom:4}}>{g.icon} {g.label}</div>
                    <div style={{fontSize:13,color:'var(--ink2)',lineHeight:1.5}}>{g.val}</div>
                  </div>
                ))}
              </div>
            )}

            {/* Disclaimer */}
            <div className="section">
              <div style={{background:'var(--o50)',borderRadius:14,padding:'14px 16px',fontSize:13,color:'#854D0E',lineHeight:1.55}}>
                ⚠️ These recommendations are informational only and based on clinical guidelines.
                Consult a qualified healthcare professional for personalized medical advice.
                Sourced from: NIMH, CDC, APA, and Mayo Clinic.
              </div>
            </div>
          </>
        )}

        <div style={{height:24}}/>
      </div>

      <div className="clin-bottom-tabs sticky-footer" style={{padding:'12px 20px 34px'}}>
        {[
          {path:'/graph',     label:'Graph',     icon:'🕸️'},
          {path:'/query',     label:'Query',     icon:'🔍'},
          {path:'/labtest',   label:'Lab Tests', icon:'🔬', active:true},
          {path:'/analytics', label:'Analytics', icon:'📊'},
        ].map(t=>(
          <button key={t.path} className={`clin-tab ${t.active?'active':''}`} onClick={()=>navigate(t.path)}>
            <span>{t.icon}</span><span>{t.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
