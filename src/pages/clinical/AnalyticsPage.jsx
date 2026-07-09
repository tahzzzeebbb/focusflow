import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { getOutcomeRates } from '../../services/analysisService';
import { DATASET, loadCSV } from '../../services/adhdEngine';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import './Clinical.css';

const COLORS = ['#6C5CE7','#00B37D','#FF8C00','#FF5C5C','#4A90D9','#C99A4A'];

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background:'#1A1035', color:'#fff', padding:'10px 14px', borderRadius:12, fontSize:12 }}>
      <strong>{label}</strong>
      {payload.map((p,i) => (
        <div key={i} style={{ color: p.color }}>{p.name}: <strong>{p.value}</strong></div>
      ))}
    </div>
  );
};

export default function AnalyticsPage() {
  const navigate = useNavigate();
  const { score, assessment } = useApp();
  const [outcomes, setOutcomes]     = useState([]);
  const [csvStats, setCsvStats]     = useState(null);
  const [loading, setLoading]       = useState(true);
  const [activeTab, setActiveTab]   = useState('overview');

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        // Load real graph data (outcome rates only — symptom stats come from CSV below)
        const out = await getOutcomeRates();
        setOutcomes(out);

        // Load real CSV stats
        const rows = await loadCSV();
        const adhdRows = rows.filter(r => r.ADHD === '1');
        const nonRows  = rows.filter(r => r.ADHD === '0');

        const avg = (arr, k) => (arr.reduce((s,r) => s + parseFloat(r[k] || 0), 0) / arr.length).toFixed(2);

        // Education breakdown
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

        // Medication effectiveness from CSV
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

        setCsvStats({
          total: rows.length,
          adhdCount: adhdRows.length,
          nonCount: nonRows.length,
          adhdRate: Math.round(adhdRows.length / rows.length * 100),
          adhd: { inn: avg(adhdRows,'InattentionScore'), hyp: avg(adhdRows,'HyperactivityScore'), imp: avg(adhdRows,'ImpulsivityScore'), academic: avg(adhdRows,'AcademicScore'), sleep: avg(adhdRows,'SleepHours'), screen: avg(adhdRows,'ScreenTimeHours') },
          nonAdhd: { inn: avg(nonRows,'InattentionScore'), hyp: avg(nonRows,'HyperactivityScore'), imp: avg(nonRows,'ImpulsivityScore'), academic: avg(nonRows,'AcademicScore'), sleep: avg(nonRows,'SleepHours'), screen: avg(nonRows,'ScreenTimeHours') },
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

  const eduChartData = csvStats ? Object.entries(csvStats.edu).map(([k,v]) => ({ name:k, rate:v.adhdRate, academic:parseFloat(v.avgAcademic), total:v.total })) : [];
  const medChartData = csvStats ? Object.entries(csvStats.med).map(([k,v]) => ({ name:k==='No'?'No Meds':k, count:v.count, adhdRate:v.adhdRate, academic:parseFloat(v.avgAcademic) })) : [];
  const pieData = csvStats ? [
    { name:'ADHD Diagnosed', value:csvStats.adhdCount },
    { name:'Non-ADHD', value:csvStats.nonCount },
  ] : [];
  const comorbData = csvStats ? [
    { name:'Family History', value:csvStats.family.withRate },
    { name:'Anxiety', value:csvStats.anxiety.rate },
    { name:'RSD', value:csvStats.rsd.withRate },
    { name:'Depression', value:csvStats.depression.rate },
  ] : [];

  const TABS = ['overview','symptoms','education','medication','comorbidities'];

  return (
    <div className="screen">
      <div className="clin-header sticky-header">
        <button className="clin-back" onClick={() => navigate('/home')}>←</button>
        <div>
          <div className="clin-title">Population Analytics</div>
          <div className="clin-subtitle">Live from ADHD.csv · 2,000 real patients</div>
        </div>
        <span style={{fontSize:20}}>📊</span>
      </div>

      <div className="real-data-banner">
        <span>🔬</span>
        <span><strong>All charts computed live</strong> from ADHD.csv — real patient records, not sample data</span>
      </div>

      {/* Tab bar */}
      <div style={{ display:'flex', overflowX:'auto', gap:4, padding:'12px 16px', borderBottom:'1px solid var(--border)', flexShrink:0 }}>
        {TABS.map(t => (
          <button key={t}
            onClick={() => setActiveTab(t)}
            style={{ padding:'8px 14px', borderRadius:999, border:'none', fontSize:12, fontWeight:700,
              whiteSpace:'nowrap', cursor:'pointer',
              background: activeTab===t ? 'var(--p500)' : 'var(--surf2)',
              color: activeTab===t ? '#fff' : 'var(--ink3)' }}>
            {t.charAt(0).toUpperCase()+t.slice(1)}
          </button>
        ))}
      </div>

      <div className="screen__scroll">
        {loading ? (
          <div className="clin-loading" style={{padding:'60px 20px'}}>
            <div className="clin-spinner"/>
            <p>Parsing 2,000 patient records from ADHD.csv…</p>
            <p className="clin-loading-sub">Computing real statistics</p>
          </div>
        ) : (
          <>
            {/* ── OVERVIEW TAB ── */}
            {activeTab==='overview' && csvStats && (
              <div style={{padding:'0 20px',marginTop:20,display:'flex',flexDirection:'column',gap:16}}>
                {/* Big numbers */}
                <div style={{display:'grid',gridTemplateColumns:'repeat(2,1fr)',gap:12}}>
                  {[
                    {val:csvStats.total.toLocaleString(), label:'Total Patients', color:'var(--p500)', icon:'👥'},
                    {val:`${csvStats.adhdRate}%`, label:'ADHD Diagnosis Rate', color:'var(--r500)', icon:'🧠'},
                    {val:`${DATASET.adhd.academic}`, label:'ADHD Avg Academic', color:'var(--o500)', icon:'📚'},
                    {val:`${DATASET.nonAdhd.academic}`, label:'Non-ADHD Academic', color:'var(--g500)', icon:'🎓'},
                  ].map(s=>(
                    <div key={s.label} style={{background:'var(--surf)',border:'1px solid var(--border)',borderRadius:18,padding:'16px',textAlign:'center'}}>
                      <div style={{fontSize:26}}>{s.icon}</div>
                      <div style={{fontSize:28,fontWeight:900,color:s.color,lineHeight:1.1}}>{s.val}</div>
                      <div style={{fontSize:11,color:'var(--ink3)',marginTop:4,lineHeight:1.3}}>{s.label}</div>
                    </div>
                  ))}
                </div>

                {/* Pie chart */}
                <div style={{background:'var(--surf)',border:'1px solid var(--border)',borderRadius:18,padding:20}}>
                  <div style={{fontSize:15,fontWeight:800,marginBottom:4}}>ADHD Prevalence (n={csvStats.total})</div>
                  <div style={{fontSize:12,color:'var(--ink3)',marginBottom:16}}>From real ADHD.csv — {csvStats.adhdCount} diagnosed, {csvStats.nonCount} non-ADHD</div>
                  <ResponsiveContainer width="100%" height={180}>
                    <PieChart>
                      <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value" label={({name,value})=>`${name}: ${value}`} labelLine={false}>
                        {pieData.map((_,i) => <Cell key={i} fill={['#FF5C5C','#E2DFFF'][i]}/>)}
                      </Pie>
                      <Tooltip content={<CustomTooltip/>}/>
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                {/* Symptom comparison ADHD vs Non */}
                <div style={{background:'var(--surf)',border:'1px solid var(--border)',borderRadius:18,padding:20}}>
                  <div style={{fontSize:15,fontWeight:800,marginBottom:4}}>Symptom Scores: ADHD vs Non-ADHD</div>
                  <div style={{fontSize:12,color:'var(--ink3)',marginBottom:16}}>Average scores from real CSV data</div>
                  {[
                    {label:'Inattention',   adhd:parseFloat(csvStats.adhd.inn),   non:parseFloat(csvStats.nonAdhd.inn),   color:'var(--p500)'},
                    {label:'Hyperactivity', adhd:parseFloat(csvStats.adhd.hyp),   non:parseFloat(csvStats.nonAdhd.hyp),   color:'var(--o500)'},
                    {label:'Impulsivity',   adhd:parseFloat(csvStats.adhd.imp),   non:parseFloat(csvStats.nonAdhd.imp),   color:'var(--r500)'},
                  ].map(s=>(
                    <div key={s.label} style={{marginBottom:14}}>
                      <div style={{display:'flex',justifyContent:'space-between',fontSize:13,fontWeight:700,marginBottom:6}}>
                        <span>{s.label}</span>
                        <span style={{fontSize:12,color:'var(--ink3)'}}>ADHD: <strong style={{color:s.color}}>{s.adhd}</strong> · Non: <strong style={{color:'var(--g500)'}}>{s.non}</strong></span>
                      </div>
                      <div style={{display:'flex',flexDirection:'column',gap:4}}>
                        <div style={{display:'flex',alignItems:'center',gap:8}}>
                          <span style={{fontSize:11,width:50,color:'var(--r500)',fontWeight:600}}>ADHD</span>
                          <div style={{flex:1,height:8,background:'var(--surf2)',borderRadius:99}}>
                            <div style={{height:'100%',width:`${(s.adhd/9)*100}%`,background:s.color,borderRadius:99,transition:'width .8s'}}/>
                          </div>
                        </div>
                        <div style={{display:'flex',alignItems:'center',gap:8}}>
                          <span style={{fontSize:11,width:50,color:'var(--g500)',fontWeight:600}}>Non</span>
                          <div style={{flex:1,height:8,background:'var(--surf2)',borderRadius:99}}>
                            <div style={{height:'100%',width:`${(s.non/9)*100}%`,background:'var(--g500)',borderRadius:99,transition:'width .8s'}}/>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Real graph data: how many treatments target each outcome */}
                {outcomes.length > 0 && (
                  <div style={{background:'var(--surf)',border:'1px solid var(--border)',borderRadius:18,padding:20}}>
                    <div style={{fontSize:15,fontWeight:800,marginBottom:4}}>Treatments per Outcome</div>
                    <div style={{fontSize:12,color:'var(--ink3)',marginBottom:16}}>How many documented treatments target each outcome — from Neo4j</div>
                    <ResponsiveContainer width="100%" height={200}>
                      <BarChart data={outcomes.slice(0,6)} margin={{top:5,right:0,bottom:20,left:-15}}>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false}/>
                        <XAxis dataKey="outcome" tick={{fontSize:9,fill:'var(--ink3)'}} angle={-30} textAnchor="end" interval={0}/>
                        <YAxis tick={{fontSize:10,fill:'var(--ink3)'}} allowDecimals={false}/>
                        <Tooltip content={<CustomTooltip/>}/>
                        <Bar dataKey="treatmentCount" name="Treatments" fill="var(--g500)" radius={[4,4,0,0]}/>
                      </BarChart>
                    </ResponsiveContainer>
                    <div style={{fontSize:11,color:'var(--ink3)',textAlign:'center',marginTop:8}}>Source: Neo4j AuraDB · IMPROVES relationships, from NIMH/CDC/MayoClinic/APA</div>
                  </div>
                )}
              </div>
            )}

            {/* ── SYMPTOMS TAB ── */}
            {activeTab==='symptoms' && (
              <div style={{padding:'0 20px',marginTop:20,display:'flex',flexDirection:'column',gap:16}}>
                {/* CSV symptom insight — the only source of symptom-level data */}
                {csvStats && (
                  <div style={{background:'var(--surf)',border:'1px solid var(--border)',borderRadius:18,padding:20}}>
                    <div style={{fontSize:15,fontWeight:800,marginBottom:4}}>Average Symptom Severity</div>
                    <div style={{fontSize:12,color:'var(--ink3)',marginBottom:16}}>From ADHD.csv · {csvStats.total.toLocaleString()} patients</div>
                    {[
                      {label:'Inattention',   val:parseFloat(csvStats.adhd.inn),   color:COLORS[0]},
                      {label:'Hyperactivity', val:parseFloat(csvStats.adhd.hyp),   color:COLORS[1]},
                      {label:'Impulsivity',   val:parseFloat(csvStats.adhd.imp),   color:COLORS[2]},
                    ].map((s,i)=>(
                      <div key={s.label} style={{marginBottom:16}}>
                        <div style={{display:'flex',justifyContent:'space-between',marginBottom:6}}>
                          <span style={{fontSize:14,fontWeight:700}}>{s.label}</span>
                          <span style={{fontFamily:'var(--font-mono,monospace)',fontSize:14,fontWeight:900,color:s.color}}>{s.val.toFixed(2)}/9</span>
                        </div>
                        <div style={{height:10,background:'var(--surf2)',borderRadius:99,overflow:'hidden'}}>
                          <div style={{height:'100%',width:`${(s.val/9)*100}%`,background:s.color,borderRadius:99,transition:'width 1s'}}/>
                        </div>
                        <div style={{fontSize:11,color:'var(--ink3)',marginTop:4}}>Among {csvStats.adhdCount.toLocaleString()} ADHD-diagnosed patients</div>
                      </div>
                    ))}
                  </div>
                )}

                {csvStats && (
                  <div style={{background:'var(--p50)',border:'1px solid var(--p100)',borderRadius:18,padding:20}}>
                    <div style={{fontSize:15,fontWeight:800,color:'var(--p600)',marginBottom:12}}>📊 From ADHD.csv (2,000 patients)</div>
                    {[
                      {label:'Inattention gap (ADHD vs non)', val:`${(parseFloat(csvStats.adhd.inn)-parseFloat(csvStats.nonAdhd.inn)).toFixed(2)} pts higher in ADHD`, color:'var(--p500)'},
                      {label:'Hyperactivity gap', val:`${(parseFloat(csvStats.adhd.hyp)-parseFloat(csvStats.nonAdhd.hyp)).toFixed(2)} pts higher in ADHD`, color:'var(--o500)'},
                      {label:'Impulsivity gap', val:`${(parseFloat(csvStats.adhd.imp)-parseFloat(csvStats.nonAdhd.imp)).toFixed(2)} pts higher in ADHD`, color:'var(--r500)'},
                      {label:'Academic score gap', val:`ADHD avg ${csvStats.adhd.academic} vs ${csvStats.nonAdhd.academic} (−${(parseFloat(csvStats.nonAdhd.academic)-parseFloat(csvStats.adhd.academic)).toFixed(1)} pts)`, color:'var(--g500)'},
                    ].map(row=>(
                      <div key={row.label} style={{padding:'10px 0',borderBottom:'1px solid var(--p100)'}}>
                        <div style={{fontSize:12,color:'var(--ink3)'}}>{row.label}</div>
                        <div style={{fontSize:14,fontWeight:700,color:row.color,marginTop:2}}>{row.val}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ── EDUCATION TAB ── */}
            {activeTab==='education' && csvStats && (
              <div style={{padding:'0 20px',marginTop:20,display:'flex',flexDirection:'column',gap:16}}>
                <div style={{background:'var(--surf)',border:'1px solid var(--border)',borderRadius:18,padding:20}}>
                  <div style={{fontSize:15,fontWeight:800,marginBottom:4}}>ADHD Rate by Education Stage</div>
                  <div style={{fontSize:12,color:'var(--ink3)',marginBottom:16}}>Computed live from ADHD.csv · n per group shown</div>
                  <ResponsiveContainer width="100%" height={160}>
                    <BarChart data={eduChartData} margin={{top:5,right:0,bottom:5,left:-15}}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false}/>
                      <XAxis dataKey="name" tick={{fontSize:11,fill:'var(--ink3)'}}/>
                      <YAxis tick={{fontSize:10}} domain={[58,70]} tickFormatter={v=>`${v}%`}/>
                      <Tooltip content={<CustomTooltip/>}/>
                      <Bar dataKey="rate" name="ADHD Rate %" fill="var(--p500)" radius={[6,6,0,0]} label={{position:'top',fontSize:11,fill:'var(--ink3)',formatter:v=>`${v}%`}}/>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                {eduChartData.map((e,i)=>(
                  <div key={i} style={{background:'var(--surf)',border:'1px solid var(--border)',borderRadius:16,padding:'16px 18px'}}>
                    <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:10}}>
                      <div style={{fontSize:15,fontWeight:800}}>{e.name}</div>
                      <span className="ui-badge ui-badge--purple">{e.total} patients</span>
                    </div>
                    <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
                      <div style={{background:'var(--r50)',borderRadius:12,padding:'10px',textAlign:'center'}}>
                        <div style={{fontSize:22,fontWeight:900,color:'var(--r500)'}}>{e.rate}%</div>
                        <div style={{fontSize:11,color:'var(--ink3)'}}>ADHD rate</div>
                      </div>
                      <div style={{background:'var(--g50)',borderRadius:12,padding:'10px',textAlign:'center'}}>
                        <div style={{fontSize:22,fontWeight:900,color:'var(--g500)'}}>{e.academic}</div>
                        <div style={{fontSize:11,color:'var(--ink3)'}}>Avg academic score</div>
                      </div>
                    </div>
                    <div style={{marginTop:10,fontSize:12,color:'var(--ink3)'}}>
                      Key insight: {e.rate >= 65 ? 'Above-average ADHD prevalence in this group.' : 'Slightly below-average ADHD prevalence.'} Academic impact: {(77.2 - e.academic).toFixed(1)} pts vs population mean.
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* ── MEDICATION TAB ── */}
            {activeTab==='medication' && csvStats && (
              <div style={{padding:'0 20px',marginTop:20,display:'flex',flexDirection:'column',gap:16}}>
                <div style={{background:'var(--surf)',border:'1px solid var(--border)',borderRadius:18,padding:20}}>
                  <div style={{fontSize:15,fontWeight:800,marginBottom:4}}>Academic Score by Medication Type</div>
                  <div style={{fontSize:12,color:'var(--ink3)',marginBottom:16}}>From ADHD.csv — real patient academic outcomes</div>
                  <ResponsiveContainer width="100%" height={160}>
                    <BarChart data={medChartData} margin={{top:5,right:0,bottom:5,left:-15}}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false}/>
                      <XAxis dataKey="name" tick={{fontSize:11,fill:'var(--ink3)'}}/>
                      <YAxis domain={[74,80]} tick={{fontSize:10}}/>
                      <Tooltip content={<CustomTooltip/>}/>
                      <Bar dataKey="academic" name="Avg Academic Score" fill="var(--o500)" radius={[6,6,0,0]} label={{position:'top',fontSize:11,fill:'var(--ink3)'}}/>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                {medChartData.map((m,i)=>(
                  <div key={i} style={{background:'var(--surf)',border:'1px solid var(--border)',borderRadius:16,padding:'16px 18px'}}>
                    <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:10}}>
                      <div style={{fontSize:15,fontWeight:800}}>{m.name}</div>
                      <span className="ui-badge ui-badge--dark">{m.count} patients</span>
                    </div>
                    <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
                      <div style={{background:'var(--r50)',borderRadius:12,padding:'10px',textAlign:'center'}}>
                        <div style={{fontSize:22,fontWeight:900,color:'var(--r500)'}}>{m.adhdRate}%</div>
                        <div style={{fontSize:11,color:'var(--ink3)'}}>ADHD rate in group</div>
                      </div>
                      <div style={{background:'var(--g50)',borderRadius:12,padding:'10px',textAlign:'center'}}>
                        <div style={{fontSize:22,fontWeight:900,color:'var(--g500)'}}>{m.academic}</div>
                        <div style={{fontSize:11,color:'var(--ink3)'}}>Avg academic score</div>
                      </div>
                    </div>
                  </div>
                ))}
                <div style={{background:'var(--p50)',borderRadius:14,padding:'14px 16px',fontSize:13,color:'var(--ink2)',lineHeight:1.55}}>
                  💡 Academic differences between medication groups are small in this dataset ({(parseFloat(medChartData[0]?.academic||77)-parseFloat(medChartData[2]?.academic||77)).toFixed(1)} pts max gap). This suggests that behavioral and educational interventions matter as much as medication alone.
                </div>
              </div>
            )}

            {/* ── COMORBIDITIES TAB ── */}
            {activeTab==='comorbidities' && csvStats && (
              <div style={{padding:'0 20px',marginTop:20,display:'flex',flexDirection:'column',gap:16}}>
                <div style={{background:'var(--surf)',border:'1px solid var(--border)',borderRadius:18,padding:20}}>
                  <div style={{fontSize:15,fontWeight:800,marginBottom:4}}>Comorbidity Rates Among ADHD Patients</div>
                  <div style={{fontSize:12,color:'var(--ink3)',marginBottom:16}}>% of {csvStats.adhdCount} diagnosed patients with each condition</div>
                  <ResponsiveContainer width="100%" height={160}>
                    <BarChart data={comorbData} margin={{top:5,right:0,bottom:5,left:-15}}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false}/>
                      <XAxis dataKey="name" tick={{fontSize:10,fill:'var(--ink3)'}}/>
                      <YAxis tick={{fontSize:10}} tickFormatter={v=>`${v}%`}/>
                      <Tooltip content={<CustomTooltip/>}/>
                      <Bar dataKey="value" name="Rate %" fill="var(--r500)" radius={[6,6,0,0]} label={{position:'top',fontSize:11,fill:'var(--ink3)',formatter:v=>`${v}%`}}/>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                {[
                  {title:'Family History of ADHD', rate:csvStats.family.withRate, color:'var(--p500)', bg:'var(--p50)', insight:`${csvStats.family.withRate}% of ADHD patients have a family member with ADHD — consistent with ADHD's ~74% heritability.`},
                  {title:'Comorbid Anxiety', rate:csvStats.anxiety.rate, color:'var(--o500)', bg:'var(--o50)', insight:`${csvStats.anxiety.rate}% of ADHD patients also have anxiety. Often secondary to ADHD — chronic frustration and failure experiences trigger anxiety.`},
                  {title:'Rejection Sensitivity (RSD)', rate:csvStats.rsd.withRate, color:'var(--r500)', bg:'var(--r50)', insight:`${csvStats.rsd.withRate}% of ADHD patients with RSD were diagnosed, vs ${100-csvStats.rsd.withRate}% without. RSD is a strong co-occurring feature.`},
                  {title:'Comorbid Depression', rate:csvStats.depression.rate, color:'var(--ink)', bg:'var(--surf2)', insight:`${csvStats.depression.rate}% of ADHD patients also have depression — often secondary to academic and social difficulties.`},
                ].map(c=>(
                  <div key={c.title} style={{background:c.bg,border:`1px solid ${c.color}33`,borderRadius:18,padding:20}}>
                    <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:10}}>
                      <div style={{fontSize:15,fontWeight:800,color:c.color}}>{c.title}</div>
                      <div style={{fontSize:32,fontWeight:900,color:c.color}}>{c.rate}%</div>
                    </div>
                    <p style={{fontSize:13,color:'var(--ink2)',lineHeight:1.55}}>{c.insight}</p>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        <div style={{height:24}}/>
      </div>

      <div className="clin-bottom-tabs sticky-footer" style={{padding:'12px 20px 34px'}}>
        {[
          {path:'/graph',     label:'Graph',     icon:'🕸️'},
          {path:'/query',     label:'Query',     icon:'🔍'},
          {path:'/labtest',   label:'Lab Tests', icon:'🔬'},
          {path:'/analytics', label:'Analytics', icon:'📊', active:true},
        ].map(t=>(
          <button key={t.path} className={`clin-tab ${t.active?'active':''}`} onClick={()=>navigate(t.path)}>
            <span>{t.icon}</span><span>{t.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
