import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getOutcomeRates } from '../../services/analysisService';
import { DATASET, loadCSV } from '../../services/adhdEngine';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import './Clinical.css';

const COLORS = ['#6C5CE7','#00B37D','#FF8C00'];
const TABS = [
  { id:'overview',      label:'Overview' },
  { id:'symptoms',      label:'Symptoms' },
  { id:'education',     label:'Education' },
  { id:'medication',    label:'Medication' },
  { id:'comorbidities', label:'Related conditions' },
];

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background:'#1A1035', color:'#fff', padding:'10px 14px', borderRadius:12, fontSize:12 }}>
      <strong>{label}</strong>
      {payload.map((p,i) => <div key={i} style={{ color: p.color }}>{p.name}: <strong>{p.value}</strong></div>)}
    </div>
  );
};

export default function AnalyticsPage() {
  const navigate = useNavigate();
  const [outcomes, setOutcomes]   = useState([]);
  const [stats, setStats]         = useState(null);
  const [loading, setLoading]     = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const out = await getOutcomeRates();
        setOutcomes(out);

        const rows = await loadCSV();
        const adhdRows = rows.filter(r => r.ADHD === '1');
        const nonRows  = rows.filter(r => r.ADHD === '0');
        const avg = (arr, k) => (arr.reduce((s,r) => s + parseFloat(r[k] || 0), 0) / arr.length).toFixed(2);

        const eduGroups = {};
        ['Child','Teen','Undergrad','Adult'].forEach(stage => {
          const grp = rows.filter(r => r.EducationStage === stage);
          const adhdInGrp = grp.filter(r => r.ADHD === '1');
          eduGroups[stage] = {
            total: grp.length,
            adhdRate: grp.length ? Math.round(adhdInGrp.length / grp.length * 100) : 0,
            avgAcademic: grp.length ? (grp.reduce((s,r) => s+parseFloat(r.AcademicScore||0),0)/grp.length).toFixed(1) : 0,
          };
        });

        const medGroups = {};
        ['Stimulant','Non-stimulant','No'].forEach(med => {
          const grp = rows.filter(r => r.Medication === med);
          const adhdInGrp = grp.filter(r => r.ADHD === '1');
          medGroups[med] = {
            count: grp.length,
            adhdRate: grp.length ? Math.round(adhdInGrp.length / grp.length * 100) : 0,
            avgAcademic: grp.length ? (grp.reduce((s,r) => s+parseFloat(r.AcademicScore||0),0)/grp.length).toFixed(1) : 0,
          };
        });

        setStats({
          total: rows.length,
          adhdCount: adhdRows.length,
          nonCount: nonRows.length,
          adhdRate: Math.round(adhdRows.length / rows.length * 100),
          adhd: { inn: avg(adhdRows,'InattentionScore'), hyp: avg(adhdRows,'HyperactivityScore'), imp: avg(adhdRows,'ImpulsivityScore'), academic: avg(adhdRows,'AcademicScore') },
          nonAdhd: { inn: avg(nonRows,'InattentionScore'), hyp: avg(nonRows,'HyperactivityScore'), imp: avg(nonRows,'ImpulsivityScore'), academic: avg(nonRows,'AcademicScore') },
          edu: eduGroups,
          med: medGroups,
          rsd: { withRate: Math.round(rows.filter(r=>r.RSD==='1'&&r.ADHD==='1').length / rows.filter(r=>r.RSD==='1').length * 100) },
          family: { withRate: Math.round(rows.filter(r=>r.FamilyHistoryADHD==='1'&&r.ADHD==='1').length / rows.filter(r=>r.FamilyHistoryADHD==='1').length * 100) },
          anxiety: { rate: Math.round(adhdRows.filter(r=>r.ComorbidAnxiety==='1').length / adhdRows.length * 100) },
          depression: { rate: Math.round(adhdRows.filter(r=>r.ComorbidDepression==='1').length / adhdRows.length * 100) },
        });
      } catch(e) { console.error('Analytics error:', e); }
      setLoading(false);
    })();
  }, []);

  const eduChartData = stats ? Object.entries(stats.edu).map(([k,v]) => ({ name:k, rate:v.adhdRate, academic:parseFloat(v.avgAcademic), total:v.total })) : [];
  const medChartData = stats ? Object.entries(stats.med).map(([k,v]) => ({ name:k==='No'?'None':k, count:v.count, adhdRate:v.adhdRate, academic:parseFloat(v.avgAcademic) })) : [];
  const pieData = stats ? [
    { name:'ADHD', value:stats.adhdCount },
    { name:'Non-ADHD', value:stats.nonCount },
  ] : [];
  const comorbData = stats ? [
    { name:'Family history', value:stats.family.withRate },
    { name:'Anxiety', value:stats.anxiety.rate },
    { name:'RSD', value:stats.rsd.withRate },
    { name:'Depression', value:stats.depression.rate },
  ] : [];

  return (
    <div className="screen">
      <div className="clin-header sticky-header">
        <button className="clin-back" onClick={() => navigate('/home')}>←</button>
        <div>
          <div className="clin-title">Population Insights</div>
          <div className="clin-subtitle">Patterns across {DATASET.total.toLocaleString()} people</div>
        </div>
      </div>

      <div className="an-tabs">
        {TABS.map(t => (
          <button key={t.id} className={`an-tab ${activeTab===t.id ? 'active' : ''}`} onClick={() => setActiveTab(t.id)}>
            {t.label}
          </button>
        ))}
      </div>

      <div className="screen__scroll">
        {loading ? (
          <div className="clin-loading" style={{padding:'60px 20px'}}>
            <div className="clin-spinner"/>
            <p>Loading insights…</p>
          </div>
        ) : (
          <>
            {/* ── OVERVIEW ── */}
            {activeTab==='overview' && stats && (
              <div className="an-section">
                <div className="an-kpi-grid">
                  {[
                    { val:stats.total.toLocaleString(), label:'People in this data', color:'var(--p500)', icon:'👥' },
                    { val:`${stats.adhdRate}%`,          label:'ADHD diagnosis rate', color:'var(--r500)', icon:'🧠' },
                    { val:DATASET.adhd.academic,         label:'ADHD avg. score',     color:'var(--o500)', icon:'📚' },
                    { val:DATASET.nonAdhd.academic,      label:'Non-ADHD avg. score', color:'var(--g500)', icon:'🎓' },
                  ].map(s => (
                    <div key={s.label} className="an-kpi">
                      <div className="an-kpi__icon">{s.icon}</div>
                      <div className="an-kpi__val" style={{color:s.color}}>{s.val}</div>
                      <div className="an-kpi__label">{s.label}</div>
                    </div>
                  ))}
                </div>

                <div className="an-card">
                  <div className="an-card__title">ADHD vs. non-ADHD</div>
                  <div className="an-card__sub">{stats.adhdCount.toLocaleString()} diagnosed, {stats.nonCount.toLocaleString()} not</div>
                  <ResponsiveContainer width="100%" height={180}>
                    <PieChart>
                      <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value" label={({name,value})=>`${name}: ${value}`} labelLine={false}>
                        {pieData.map((_,i) => <Cell key={i} fill={['#FF5C5C','#E2DFFF'][i]}/>)}
                      </Pie>
                      <Tooltip content={<CustomTooltip/>}/>
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                <div className="an-card">
                  <div className="an-card__title">Symptom scores</div>
                  <div className="an-card__sub">ADHD group vs. non-ADHD group</div>
                  {[
                    { label:'Inattention',   adhd:parseFloat(stats.adhd.inn), non:parseFloat(stats.nonAdhd.inn), color:'var(--p500)' },
                    { label:'Hyperactivity', adhd:parseFloat(stats.adhd.hyp), non:parseFloat(stats.nonAdhd.hyp), color:'var(--o500)' },
                    { label:'Impulsivity',   adhd:parseFloat(stats.adhd.imp), non:parseFloat(stats.nonAdhd.imp), color:'var(--r500)' },
                  ].map(s => (
                    <div key={s.label} className="an-bar-row">
                      <div className="an-bar-row__top">
                        <span className="an-bar-row__label">{s.label}</span>
                        <span className="an-bar-row__val">{s.adhd} vs {s.non}</span>
                      </div>
                      <div className="an-bar-track"><div className="an-bar-fill" style={{width:`${(s.adhd/9)*100}%`, background:s.color}}/></div>
                    </div>
                  ))}
                </div>

                {outcomes.length > 0 && (
                  <div className="an-card">
                    <div className="an-card__title">Common treatment goals</div>
                    <div className="an-card__sub">How many documented treatments help with each outcome</div>
                    <ResponsiveContainer width="100%" height={200}>
                      <BarChart data={outcomes.slice(0,6)} margin={{top:5,right:0,bottom:20,left:-15}}>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false}/>
                        <XAxis dataKey="outcome" tick={{fontSize:9,fill:'var(--ink3)'}} angle={-30} textAnchor="end" interval={0}/>
                        <YAxis tick={{fontSize:10,fill:'var(--ink3)'}} allowDecimals={false}/>
                        <Tooltip content={<CustomTooltip/>}/>
                        <Bar dataKey="treatmentCount" name="Treatments" fill="var(--g500)" radius={[4,4,0,0]}/>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>
            )}

            {/* ── SYMPTOMS ── */}
            {activeTab==='symptoms' && stats && (
              <div className="an-section">
                <div className="an-card">
                  <div className="an-card__title">Average symptom severity</div>
                  <div className="an-card__sub">Among people diagnosed with ADHD</div>
                  {[
                    { label:'Inattention',   val:parseFloat(stats.adhd.inn), color:COLORS[0] },
                    { label:'Hyperactivity', val:parseFloat(stats.adhd.hyp), color:COLORS[1] },
                    { label:'Impulsivity',   val:parseFloat(stats.adhd.imp), color:COLORS[2] },
                  ].map(s => (
                    <div key={s.label} className="an-bar-row">
                      <div className="an-bar-row__top">
                        <span className="an-bar-row__label">{s.label}</span>
                        <span className="an-bar-row__val">{s.val.toFixed(1)}/9</span>
                      </div>
                      <div className="an-bar-track"><div className="an-bar-fill" style={{width:`${(s.val/9)*100}%`, background:s.color}}/></div>
                    </div>
                  ))}
                </div>

                <div className="an-note">
                  💡 People with ADHD score noticeably higher on inattention especially — that gap is
                  the single strongest signal in this data.
                </div>
              </div>
            )}

            {/* ── EDUCATION ── */}
            {activeTab==='education' && stats && (
              <div className="an-section">
                <div className="an-card">
                  <div className="an-card__title">ADHD rate by age group</div>
                  <ResponsiveContainer width="100%" height={160}>
                    <BarChart data={eduChartData} margin={{top:5,right:0,bottom:5,left:-15}}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false}/>
                      <XAxis dataKey="name" tick={{fontSize:11,fill:'var(--ink3)'}}/>
                      <YAxis tick={{fontSize:10}} domain={[58,70]} tickFormatter={v=>`${v}%`}/>
                      <Tooltip content={<CustomTooltip/>}/>
                      <Bar dataKey="rate" name="ADHD rate" fill="var(--p500)" radius={[6,6,0,0]}/>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                {eduChartData.map((e,i) => (
                  <div key={i} className="an-group-card">
                    <div className="an-group-card__head">
                      <div className="an-group-card__title">{e.name}</div>
                      <span className="ui-badge ui-badge--purple">{e.total} people</span>
                    </div>
                    <div className="an-split">
                      <div className="an-split__cell" style={{background:'var(--r50)'}}>
                        <div className="an-split__num" style={{color:'var(--r500)'}}>{e.rate}%</div>
                        <div className="an-split__label">ADHD rate</div>
                      </div>
                      <div className="an-split__cell" style={{background:'var(--g50)'}}>
                        <div className="an-split__num" style={{color:'var(--g500)'}}>{e.academic}</div>
                        <div className="an-split__label">Avg. score</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* ── MEDICATION ── */}
            {activeTab==='medication' && stats && (
              <div className="an-section">
                <div className="an-card">
                  <div className="an-card__title">Average score by medication</div>
                  <ResponsiveContainer width="100%" height={160}>
                    <BarChart data={medChartData} margin={{top:5,right:0,bottom:5,left:-15}}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false}/>
                      <XAxis dataKey="name" tick={{fontSize:11,fill:'var(--ink3)'}}/>
                      <YAxis domain={[74,80]} tick={{fontSize:10}}/>
                      <Tooltip content={<CustomTooltip/>}/>
                      <Bar dataKey="academic" name="Avg. score" fill="var(--o500)" radius={[6,6,0,0]}/>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                {medChartData.map((m,i) => (
                  <div key={i} className="an-group-card">
                    <div className="an-group-card__head">
                      <div className="an-group-card__title">{m.name}</div>
                      <span className="ui-badge ui-badge--dark">{m.count} people</span>
                    </div>
                    <div className="an-split">
                      <div className="an-split__cell" style={{background:'var(--r50)'}}>
                        <div className="an-split__num" style={{color:'var(--r500)'}}>{m.adhdRate}%</div>
                        <div className="an-split__label">ADHD rate</div>
                      </div>
                      <div className="an-split__cell" style={{background:'var(--g50)'}}>
                        <div className="an-split__num" style={{color:'var(--g500)'}}>{m.academic}</div>
                        <div className="an-split__label">Avg. score</div>
                      </div>
                    </div>
                  </div>
                ))}
                <div className="an-note">
                  💡 Score differences between medication groups are small — behavioral and
                  educational support seem to matter just as much as medication alone.
                </div>
              </div>
            )}

            {/* ── COMORBIDITIES ── */}
            {activeTab==='comorbidities' && stats && (
              <div className="an-section">
                <div className="an-card">
                  <div className="an-card__title">Related conditions</div>
                  <div className="an-card__sub">Among people diagnosed with ADHD</div>
                  <ResponsiveContainer width="100%" height={160}>
                    <BarChart data={comorbData} margin={{top:5,right:0,bottom:5,left:-15}}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false}/>
                      <XAxis dataKey="name" tick={{fontSize:10,fill:'var(--ink3)'}}/>
                      <YAxis tick={{fontSize:10}} tickFormatter={v=>`${v}%`}/>
                      <Tooltip content={<CustomTooltip/>}/>
                      <Bar dataKey="value" name="Rate" fill="var(--r500)" radius={[6,6,0,0]}/>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                {[
                  { title:'Family history', rate:stats.family.withRate, color:'var(--p600,#5A4BD1)', bg:'var(--p50)', insight:'ADHD often runs in families.' },
                  { title:'Anxiety',        rate:stats.anxiety.rate,    color:'#B8730E',              bg:'var(--o50)', insight:'Often shows up alongside ADHD.' },
                  { title:'Sensitivity to rejection', rate:stats.rsd.withRate, color:'var(--r500)', bg:'var(--r50)', insight:'A common but lesser-known ADHD trait.' },
                  { title:'Low mood',       rate:stats.depression.rate, color:'var(--ink2)',          bg:'var(--surf2)', insight:'Can develop from ongoing ADHD-related struggles.' },
                ].map(c => (
                  <div key={c.title} className="an-tinted-card" style={{background:c.bg}}>
                    <div className="an-tinted-card__head">
                      <div className="an-tinted-card__title" style={{color:c.color}}>{c.title}</div>
                      <div className="an-tinted-card__val" style={{color:c.color}}>{c.rate}%</div>
                    </div>
                    <p>{c.insight}</p>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
        <div style={{ height:24 }} />
      </div>

      <div className="clin-bottom-tabs sticky-footer" style={{padding:'12px 20px 34px'}}>
        {[
          { path:'/graph',     label:'Graph',     icon:'🕸️' },
          { path:'/query',     label:'Query',     icon:'🔍' },
          { path:'/labtest',   label:'Lab Tests', icon:'🔬' },
          { path:'/analytics', label:'Analytics', icon:'📊', active:true },
        ].map(t => (
          <button key={t.path} className={`clin-tab ${t.active ? 'active' : ''}`} onClick={() => navigate(t.path)}>
            <span>{t.icon}</span><span>{t.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
