import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { Btn, ScoreRing } from '../../components/ui';
import {
  getRiskLevel, getADHDType, getBreakdown, DATASET,
  findSimilarPatients, getAcademicImpact, getAgeGroupStats,
  predictedAcademic
} from '../../services/adhdEngine';
import './ResultPage.css';

function plainMeaning(score, type) {
  if (score >= 80) return `Your answers strongly line up with patterns commonly seen in ADHD, mostly around ${type.desc.toLowerCase()}. It's worth talking to a doctor about this.`;
  if (score >= 70) return `Your answers line up with several common ADHD patterns, mostly around ${type.desc.toLowerCase()}. A conversation with a doctor could help.`;
  if (score >= 60) return `Your answers show some patterns often seen in ADHD, particularly ${type.desc.toLowerCase()}. Worth keeping an eye on.`;
  if (score >= 45) return `Your answers show a few ADHD-related patterns, but nothing very strong either way. Everyone has some of these traits sometimes.`;
  return `Your answers don't show strong ADHD patterns right now. That's good news — keep an eye on things over time if anything changes.`;
}

export default function ResultPage() {
  const navigate = useNavigate();
  const { score, assessment } = useApp();
  const [animScore, setAnimScore]       = useState(0);
  const [showDetails, setShowDetails]   = useState(false);
  const [similar, setSimilar]           = useState(null);
  const [academicData, setAcademicData] = useState(null);
  const [ageStats, setAgeStats]         = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(true);

  const s    = score ?? 65;
  const risk = getRiskLevel(s);
  const type = getADHDType(assessment?.inattention ?? 4, assessment?.hyperactivity ?? 4);
  const bd   = getBreakdown(assessment ?? {});

  const inn = assessment?.inattention  ?? 4;
  const hyp = assessment?.hyperactivity ?? 4;
  const imp = assessment?.impulsivity   ?? 4;

  useEffect(() => {
    let n = 0;
    const t = setInterval(() => {
      n += 2; setAnimScore(Math.min(n, s));
      if (n >= s) clearInterval(t);
    }, 18);
    return () => clearInterval(t);
  }, [s]);

  // Load the detailed stats quietly in the background — the user only
  // sees them if they choose to expand "See the details" below.
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
        setDetailsLoading(false);
      }
    })();
  }, [inn, hyp, imp]);

  const compareRows = [
    { label:'Inattention',      you: inn, adhd: parseFloat(DATASET.adhd.inn), non: parseFloat(DATASET.nonAdhd.inn), max: 9, suffix:'/9' },
    { label:'Hyperactivity',    you: hyp, adhd: parseFloat(DATASET.adhd.hyp), non: parseFloat(DATASET.nonAdhd.hyp), max: 9, suffix:'/9' },
    { label:'Impulsivity',      you: imp, adhd: parseFloat(DATASET.adhd.imp), non: parseFloat(DATASET.nonAdhd.imp), max: 9, suffix:'/9' },
  ];

  return (
    <div className="screen">
      <div className="screen__scroll">

        {/* ── SIMPLE HERO — the only thing most people need to see ── */}
        <div className="result-hero" style={{ background: risk.gradient }}>
          <div className="result-hero__top">
            <span>Your Result</span>
          </div>
          <ScoreRing score={animScore} size={168} />
          <h2 className="result-hero__level">{risk.emoji} {risk.label}</h2>
          <div className="result-hero__type">
            <span className="result-hero__type-name">{type.type}</span>
          </div>
        </div>

        <div className="result-body">

          {/* ── PLAIN-LANGUAGE MEANING — the main content ── */}
          <section className="r-card">
            <h3 className="r-card__title" style={{marginBottom:10}}>What this means</h3>
            <p className="result-plain-text">{plainMeaning(s, type)}</p>
          </section>

          {/* ── SIMPLE NEXT STEP ── */}
          {s >= 60 && (
            <section className="r-card r-card--tinted">
              <div style={{display:'flex',gap:12,alignItems:'flex-start'}}>
                <span style={{fontSize:24}}>👨‍⚕️</span>
                <p style={{fontSize:13.5,color:'var(--ink2)',lineHeight:1.6}}>
                  Since your result is on the higher side, it's a good idea to talk to a doctor
                  or therapist about it. They can give you a proper diagnosis and talk through options.
                </p>
              </div>
            </section>
          )}

          {/* ── SEE THE DETAILS — everything else, collapsed by default ── */}
          <button className="r-details-toggle" onClick={() => setShowDetails(v => !v)}>
            <span>{showDetails ? 'Hide' : 'See'} how we worked this out</span>
            <span className={`r-details-toggle__arrow ${showDetails ? 'open' : ''}`}>⌄</span>
          </button>

          {showDetails && (
            <div className="r-details">
              {/* Score breakdown */}
              <section className="r-card">
                <h3 className="r-card__title" style={{marginBottom:4}}>Your answers, broken down</h3>
                <p className="r-card__sub" style={{marginBottom:14}}>How much each part of the quiz mattered</p>
                {bd.map(b => (
                  <div key={b.label} className="r-breakdown-row">
                    <div className="r-breakdown-row__top">
                      <span className="r-breakdown-row__label">{b.label}</span>
                      <span className="r-breakdown-row__weight">{b.raw}/9</span>
                    </div>
                    <div className="r-track"><div className="r-fill" style={{ width:`${b.score}%`, background:b.color }} /></div>
                  </div>
                ))}
              </section>

              {/* Similar people */}
              {!detailsLoading && similar?.count > 0 && (
                <section className="r-card">
                  <h3 className="r-card__title" style={{marginBottom:4}}>People who answered similarly</h3>
                  <p className="r-card__sub" style={{marginBottom:14}}>Based on a group of {similar.count.toLocaleString()} people with answers like yours</p>
                  <div className="r-stat-hero" style={{background:risk.bg}}>
                    <div className="r-stat-hero__num" style={{color:risk.color}}>{similar.rate}%</div>
                    <div className="r-stat-hero__label">were later diagnosed with ADHD</div>
                  </div>
                  {similar.confidence === 'low' && (
                    <p className="r-small-note">This is based on a smaller group, so treat it as a rough estimate.</p>
                  )}
                </section>
              )}

              {/* Academic impact */}
              {!detailsLoading && academicData && academicData.confidence !== 'low' && (
                <section className="r-card">
                  <h3 className="r-card__title" style={{marginBottom:4}}>School & work impact</h3>
                  <p className="r-card__sub" style={{marginBottom:14}}>How people with similar answers tend to do</p>
                  <div className="r-split">
                    <div className="r-split__cell" style={{background:'var(--r50)'}}>
                      <div className="r-split__num" style={{color:'var(--r500)'}}>{academicData.yourGroupAvg}</div>
                      <div className="r-split__label">People like you</div>
                    </div>
                    <div className="r-split__cell" style={{background:'var(--g50)'}}>
                      <div className="r-split__num" style={{color:'var(--g500)'}}>{academicData.populationAvg}</div>
                      <div className="r-split__label">Everyone else</div>
                    </div>
                  </div>
                </section>
              )}

              {/* Comparison */}
              <section className="r-card">
                <h3 className="r-card__title" style={{marginBottom:14}}>How your answers compare</h3>
                <div className="r-legend">
                  <span><i style={{background:'var(--p500)'}} /> You</span>
                  <span><i style={{background:'var(--r400,#FF8F8F)'}} /> ADHD group</span>
                  <span><i style={{background:'var(--g400,#7FE0BB)'}} /> Non-ADHD group</span>
                </div>
                {compareRows.map(r => (
                  <div key={r.label} className="r-cmp-group">
                    <div className="r-cmp-group__label">{r.label}</div>
                    {[
                      { key:'you',  val:r.you,  color:'var(--p500)' },
                      { key:'adhd', val:r.adhd, color:'var(--r400,#FF8F8F)' },
                      { key:'non',  val:r.non,  color:'var(--g400,#7FE0BB)' },
                    ].map(row => (
                      <div key={row.key} className="r-cmp-group__row">
                        <div className="r-track r-track--sm">
                          <div className="r-fill" style={{ width:`${Math.min((row.val/r.max)*100,100)}%`, background:row.color }} />
                        </div>
                        <span className="r-cmp-group__val">{row.val}{r.suffix}</span>
                      </div>
                    ))}
                  </div>
                ))}
              </section>
            </div>
          )}

          {/* ── DISCLAIMER ── */}
          <div className="r-disclaimer">
            <p><strong>⚠️ Important:</strong> This isn't a medical diagnosis — it's a screening tool
            to help you decide if it's worth talking to a professional. If your score was ≥65%,
            we'd recommend a chat with a doctor or therapist.</p>
          </div>
        </div>
      </div>

      <div className="r-footer">
        <Btn onClick={() => navigate('/home')}>Build My Focus Plan 🚀</Btn>
        <button onClick={() => navigate('/q1')} className="r-footer__retake">Retake Assessment</button>
      </div>
    </div>
  );
}
