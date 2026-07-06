import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { Btn, ScoreRing } from '../../components/ui';
import {
  getRiskLevel, getADHDType, getBreakdown, DATASET,
  findSimilarPatients, getAcademicImpact, getAgeGroupStats,
  INN_RISK, HYP_RISK, IMP_RISK, predictedAcademic
} from '../../services/adhdEngine';
import './ResultPage.css';

export default function ResultPage() {
  const navigate = useNavigate();
  const { score, assessment } = useApp();
  const [animScore, setAnimScore]       = useState(0);
  const [similar, setSimilar]           = useState(null);
  const [academicData, setAcademicData] = useState(null);
  const [ageStats, setAgeStats]         = useState(null);
  const [csvLoading, setCsvLoading]     = useState(true);

  const s    = score ?? 65;
  const risk = getRiskLevel(s);
  const type = getADHDType(assessment?.inattention ?? 4, assessment?.hyperactivity ?? 4);
  const bd   = getBreakdown(assessment ?? {});

  const inn = assessment?.inattention  ?? 4;
  const hyp = assessment?.hyperactivity ?? 4;
  const imp = assessment?.impulsivity   ?? 4;

  // Animate score counter
  useEffect(() => {
    let n = 0;
    const t = setInterval(() => {
      n += 2; setAnimScore(Math.min(n, s));
      if (n >= s) clearInterval(t);
    }, 18);
    return () => clearInterval(t);
  }, [s]);

  // Load real CSV data async
  useEffect(() => {
    (async () => {
      try {
        const [sim, acad, age] = await Promise.all([
          findSimilarPatients(inn, hyp, imp),
          getAcademicImpact(inn, hyp, imp),
          getAgeGroupStats(assessment?.educationStage ?? 'Adult'),
        ]);
        setSimilar(sim);
        setAcademicData(acad);
        setAgeStats(age);
      } catch (e) {
        console.error('CSV load error:', e);
      } finally {
        setCsvLoading(false);
      }
    })();
  }, [inn, hyp, imp]);

  const modifiers = [];
  if (assessment?.familyHistory) modifiers.push({ label:'Family history', pts:'+4.0', badge:'red' });
  if (assessment?.rsd)           modifiers.push({ label:'RSD present',    pts:'+2.5', badge:'purple' });
  if ((assessment?.sleepHours??7) < 6) modifiers.push({ label:'Low sleep (<6h)', pts:'+2.0', badge:'red' });
  if (assessment?.daydreaming)   modifiers.push({ label:'Daydreaming',    pts:'−1.0', badge:'yellow' });

  return (
    <div className="screen">
      <div className="screen__scroll">

        {/* ── HERO ── */}
        <div className="result-hero" style={{ background: risk.gradient }}>
          <div className="result-hero__top">
            <span>Your ADHD Assessment</span>
            <span>2,000 patient model</span>
          </div>
          <ScoreRing score={animScore} size={160} />
          <h2 className="result-hero__level">{risk.emoji} {risk.label}</h2>
          <p className="result-hero__action">{risk.action ?? 'See full report below'}</p>
          <div className="result-hero__type">
            <span className="result-hero__type-code">{type.code}</span>
            <span className="result-hero__type-name">{type.type}</span>
          </div>
        </div>

        <div style={{ padding:'0 20px' }}>

          {/* ── SIMILAR PATIENTS FROM REAL CSV ── */}
          <div className="result-card" style={{ marginTop:20 }}>
            <h3 className="result-card__title">
              {csvLoading ? '⏳ Loading real patient data…' : '👥 Real patients like you'}
            </h3>
            {csvLoading ? (
              <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                {[80,60,40].map((w,i) => (
                  <div key={i} style={{ height:16, width:`${w}%`, background:'var(--surf3)', borderRadius:8, animation:'shimmer 1.4s ease-in-out infinite' }} />
                ))}
              </div>
            ) : similar ? (
              <>
                <p className="result-card__sub">
                  From ADHD.csv — patients with inattention {inn}±{similar.tolerance},
                  hyperactivity {hyp}±{similar.tolerance}, impulsivity {imp}±{similar.tolerance}
                </p>

                {/* Big stat */}
                <div style={{ background: risk.bg, borderRadius:18, padding:'20px', marginBottom:16, textAlign:'center' }}>
                  <div style={{ fontSize:56, fontWeight:900, color:risk.color, lineHeight:1 }}>
                    {similar.adhdCount}
                  </div>
                  <div style={{ fontSize:15, color:'var(--ink2)', marginTop:4 }}>
                    out of <strong>{similar.count}</strong> real patients with your profile had ADHD
                  </div>
                  <div style={{ fontSize:28, fontWeight:900, color:risk.color, marginTop:8 }}>
                    = {similar.rate}% diagnosis rate
                  </div>
                  <div style={{ fontSize:12, color:'var(--ink3)', marginTop:6 }}>
                    Population average: {DATASET.adhdRate}%
                    {similar.rate > DATASET.adhdRate
                      ? ` · Your group is ${similar.rate - DATASET.adhdRate}% higher than average`
                      : ` · Your group is ${DATASET.adhdRate - similar.rate}% lower than average`}
                  </div>
                </div>

                {/* Visual bar */}
                <div style={{ marginBottom:12 }}>
                  <div style={{ display:'flex', justifyContent:'space-between', fontSize:12, color:'var(--ink3)', marginBottom:6 }}>
                    <span>ADHD in your group ({similar.count} patients)</span>
                    <span style={{ fontWeight:700, color:risk.color }}>{similar.rate}%</span>
                  </div>
                  <div style={{ height:12, background:'var(--surf3)', borderRadius:999, overflow:'hidden' }}>
                    <div style={{ height:'100%', width:`${similar.rate}%`, background:risk.color, borderRadius:999, transition:'width 1.2s var(--ease)' }} />
                  </div>
                </div>
                <div style={{ marginBottom:0 }}>
                  <div style={{ display:'flex', justifyContent:'space-between', fontSize:12, color:'var(--ink3)', marginBottom:6 }}>
                    <span>Overall population average</span>
                    <span style={{ fontWeight:700, color:'var(--ink3)' }}>{DATASET.adhdRate}%</span>
                  </div>
                  <div style={{ height:12, background:'var(--surf3)', borderRadius:999, overflow:'hidden' }}>
                    <div style={{ height:'100%', width:`${DATASET.adhdRate}%`, background:'var(--border)', borderRadius:999 }} />
                  </div>
                </div>
              </>
            ) : (
              <p style={{ color:'var(--ink3)', fontSize:14 }}>Could not load CSV data. Using pre-computed rates.</p>
            )}
          </div>

          {/* ── ACADEMIC IMPACT FROM CSV ── */}
          <div className="result-card">
            <h3 className="result-card__title">📚 Academic Impact (real data)</h3>
            {csvLoading ? (
              <div style={{ height:60, background:'var(--surf3)', borderRadius:12, animation:'shimmer 1.4s ease-in-out infinite' }} />
            ) : academicData ? (
              <>
                <p className="result-card__sub">
                  Students with your symptom total ({academicData.symptomSum}) in our dataset (n={academicData.sampleSize})
                </p>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginBottom:12 }}>
                  <div style={{ background:'var(--r50)', borderRadius:14, padding:'14px', textAlign:'center' }}>
                    <div style={{ fontSize:28, fontWeight:900, color:'var(--r500)' }}>{academicData.yourGroupAvg}</div>
                    <div style={{ fontSize:11, color:'var(--ink3)', marginTop:2 }}>Your group's avg academic score</div>
                  </div>
                  <div style={{ background:'var(--g50)', borderRadius:14, padding:'14px', textAlign:'center' }}>
                    <div style={{ fontSize:28, fontWeight:900, color:'var(--g500)' }}>{academicData.populationAvg}</div>
                    <div style={{ fontSize:11, color:'var(--ink3)', marginTop:2 }}>Population avg academic score</div>
                  </div>
                </div>
                {academicData.gap > 0 && (
                  <div style={{ background:'var(--o50)', borderRadius:12, padding:'12px 14px', fontSize:13, color:'var(--ink2)', lineHeight:1.5 }}>
                    ⚠️ Your symptom group scores <strong style={{ color:'var(--o500)' }}>{academicData.gap} points lower</strong> than the overall population on average. FocusFlow's focus tools are designed to close this gap.
                  </div>
                )}
              </>
            ) : (
              <p style={{ fontSize:14, color:'var(--ink3)' }}>Academic data from CSV unavailable.</p>
            )}
          </div>

          {/* ── SCORE BREAKDOWN ── */}
          <div className="result-card">
            <h3 className="result-card__title">Score Breakdown</h3>
            <p className="result-card__sub">ADHD diagnosis rates per score from 2,000 real patients</p>
            {bd.map(b => (
              <div key={b.label} className="breakdown-row">
                <div className="breakdown-row__meta">
                  <span className="breakdown-row__label">{b.label} — {b.raw}/9</span>
                  <span className="breakdown-row__raw">{b.weight}% model weight</span>
                </div>
                <div style={{ fontSize:12, color:'var(--ink3)', marginBottom:6 }}>{b.description}</div>
                <div className="breakdown-row__bar">
                  <div className="breakdown-row__fill" style={{ width:`${b.score}%`, background:b.color }} />
                </div>
                <div style={{ display:'flex', justifyContent:'space-between', fontSize:11, color:'var(--ink3)', marginTop:4 }}>
                  <span>0%</span>
                  <span style={{ fontWeight:800, color:b.color }}>{b.score}% ADHD rate at this score</span>
                  <span>100%</span>
                </div>
              </div>
            ))}

            {/* Modifiers */}
            {modifiers.length > 0 && (
              <div style={{ marginTop:14, paddingTop:14, borderTop:'1px solid var(--border)' }}>
                <p style={{ fontSize:12, fontWeight:700, color:'var(--ink3)', textTransform:'uppercase', letterSpacing:'.5px', marginBottom:10 }}>
                  Risk modifiers applied
                </p>
                <div style={{ display:'flex', flexWrap:'wrap', gap:8 }}>
                  {modifiers.map(m => (
                    <div key={m.label} style={{ display:'flex', gap:6, alignItems:'center',
                      background:'var(--surf2)', borderRadius:10, padding:'6px 12px' }}>
                      <span className={`ui-badge ui-badge--${m.badge}`} style={{ fontSize:11 }}>{m.pts}</span>
                      <span style={{ fontSize:12, color:'var(--ink2)', fontWeight:600 }}>{m.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* ── EDUCATION STAGE STATS FROM CSV ── */}
          {!csvLoading && ageStats && (
            <div className="result-card">
              <h3 className="result-card__title">🎓 Your Education Group ({assessment?.educationStage})</h3>
              <p className="result-card__sub">Real stats from {ageStats.total} patients in this group</p>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:10 }}>
                {[
                  { label:'Total in group', val:ageStats.total, color:'var(--ink)' },
                  { label:'ADHD diagnosed', val:`${ageStats.rate}%`, color:risk.color },
                  { label:'Avg academic', val:ageStats.avgAcademic, color:'var(--g500)' },
                ].map(s => (
                  <div key={s.label} style={{ background:'var(--surf2)', borderRadius:12, padding:'12px 10px', textAlign:'center' }}>
                    <div style={{ fontSize:20, fontWeight:900, color:s.color }}>{s.val}</div>
                    <div style={{ fontSize:10, color:'var(--ink3)', marginTop:4, lineHeight:1.3 }}>{s.label}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── COMPARISON TABLE ── */}
          <div className="result-card">
            <h3 className="result-card__title">How you compare</h3>
            <p className="result-card__sub">vs. all 2,000 patients in ADHD.csv</p>
            <div className="cmp-header">
              <span></span><span>You</span><span>ADHD avg</span><span>Non-ADHD</span>
            </div>
            {[
              { label:'Inattention', you:`${inn}/9`, adhd:`${DATASET.adhd.inn}/9`, non:`${DATASET.nonAdhd.inn}/9` },
              { label:'Hyperactivity', you:`${hyp}/9`, adhd:`${DATASET.adhd.hyp}/9`, non:`${DATASET.nonAdhd.hyp}/9` },
              { label:'Impulsivity', you:`${imp}/9`, adhd:`${DATASET.adhd.imp}/9`, non:`${DATASET.nonAdhd.imp}/9` },
              { label:'ADHD Risk', you:`${s}%`, adhd:'72.1%', non:'57.8%' },
              { label:'Academic (pred.)', you:`${predictedAcademic(inn,hyp,imp)}`, adhd:`${DATASET.adhd.academic}`, non:`${DATASET.nonAdhd.academic}` },
            ].map(r => (
              <div key={r.label} className="cmp-row">
                <span className="cmp-row__label">{r.label}</span>
                <span className="cmp-row__you">{r.you}</span>
                <span className="cmp-row__adhd">{r.adhd}</span>
                <span className="cmp-row__non">{r.non}</span>
              </div>
            ))}
          </div>

          {/* ── DISCLAIMER ── */}
          <div style={{ background:'var(--o50)', borderRadius:14, padding:'14px 16px', marginBottom:28 }}>
            <p style={{ fontSize:13, color:'#854D0E', lineHeight:1.6 }}>
              ⚠️ <strong>Important:</strong> This is a statistical screening tool built on real patient data —
              not a clinical diagnosis. Scores ≥65% indicate professional evaluation is recommended.
              Please consult a psychiatrist or clinical psychologist for a formal assessment.
            </p>
          </div>
        </div>
      </div>

      <div style={{ padding:'16px 20px 40px', borderTop:'1px solid var(--border)', flexShrink:0 }}>
        <Btn onClick={() => navigate('/home')}>Build My Focus Plan 🚀</Btn>
        <button onClick={() => navigate('/q1')}
          style={{ display:'block', width:'100%', textAlign:'center', marginTop:12,
            border:'none', background:'none', fontSize:14, fontWeight:600, color:'var(--ink3)', cursor:'pointer' }}>
          Retake Assessment
        </button>
      </div>

      <style>{`
        @keyframes shimmer { 0%,100%{opacity:.5} 50%{opacity:1} }
      `}</style>
    </div>
  );
}
