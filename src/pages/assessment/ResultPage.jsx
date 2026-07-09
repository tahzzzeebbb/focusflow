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

const CONFIDENCE_COPY = {
  high:     { label: 'Strong sample',   note: null },
  moderate: { label: 'Reasonable sample', note: null },
  low:      { label: 'Small sample',    note: 'Treat this as a rough estimate rather than a precise number.' },
};

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

  useEffect(() => {
    let n = 0;
    const t = setInterval(() => {
      n += 2; setAnimScore(Math.min(n, s));
      if (n >= s) clearInterval(t);
    }, 18);
    return () => clearInterval(t);
  }, [s]);

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

  const compareRows = [
    { label:'Inattention',      you: inn, adhd: parseFloat(DATASET.adhd.inn), non: parseFloat(DATASET.nonAdhd.inn), max: 9, suffix:'/9' },
    { label:'Hyperactivity',    you: hyp, adhd: parseFloat(DATASET.adhd.hyp), non: parseFloat(DATASET.nonAdhd.hyp), max: 9, suffix:'/9' },
    { label:'Impulsivity',      you: imp, adhd: parseFloat(DATASET.adhd.imp), non: parseFloat(DATASET.nonAdhd.imp), max: 9, suffix:'/9' },
    { label:'ADHD Risk',        you: s,   adhd: 72.1, non: 57.8, max: 100, suffix:'%' },
    { label:'Academic (pred.)', you: predictedAcademic(inn,hyp,imp), adhd: parseFloat(DATASET.adhd.academic), non: parseFloat(DATASET.nonAdhd.academic), max: 100, suffix:'' },
  ];

  return (
    <div className="screen">
      <div className="screen__scroll">

        {/* ── HERO ── */}
        <div className="result-hero" style={{ background: risk.gradient }}>
          <div className="result-hero__top">
            <span>Your ADHD Assessment</span>
            <span>2,000-patient model</span>
          </div>
          <ScoreRing score={animScore} size={168} />
          <h2 className="result-hero__level">{risk.emoji} {risk.label}</h2>
          <p className="result-hero__action">{risk.action ?? 'See full report below'}</p>
          <div className="result-hero__type">
            <span className="result-hero__type-code">{type.code}</span>
            <span className="result-hero__type-name">{type.type}</span>
          </div>
        </div>

        <div className="result-body">

          {/* ── SIMILAR PATIENTS ── */}
          <section className="r-card">
            <div className="r-card__head">
              <div className="r-card__icon" style={{background:'var(--p50)'}}>👥</div>
              <div>
                <h3 className="r-card__title">{csvLoading ? 'Comparing your answers…' : 'People with a similar profile'}</h3>
                {!csvLoading && similar?.count > 0 && (
                  <p className="r-card__sub">Group of {similar.count.toLocaleString()} people, matched on inattention, hyperactivity, and impulsivity</p>
                )}
              </div>
            </div>

            {csvLoading ? (
              <div className="r-skeleton-group">
                {[80,60,40].map((w,i) => <div key={i} className="r-skeleton" style={{width:`${w}%`}} />)}
              </div>
            ) : similar?.count > 0 ? (
              <>
                <div className="r-stat-hero" style={{background:risk.bg}}>
                  <div className="r-stat-hero__num" style={{color:risk.color}}>{similar.rate}%</div>
                  <div className="r-stat-hero__label">were later diagnosed with ADHD</div>
                  <div className="r-stat-hero__sub">({similar.adhdCount} of {similar.count.toLocaleString()} people)</div>
                </div>

                {CONFIDENCE_COPY[similar.confidence]?.note && (
                  <div className="r-note r-note--orange">ℹ️ {CONFIDENCE_COPY[similar.confidence].note}</div>
                )}

                <div className="r-compare-bar">
                  <div className="r-compare-bar__row">
                    <span>People like you</span><strong style={{color:risk.color}}>{similar.rate}%</strong>
                  </div>
                  <div className="r-track"><div className="r-fill" style={{width:`${similar.rate}%`, background:risk.color}} /></div>
                </div>
                <div className="r-compare-bar">
                  <div className="r-compare-bar__row">
                    <span>Everyone in our data</span><strong>{DATASET.adhdRate}%</strong>
                  </div>
                  <div className="r-track"><div className="r-fill" style={{width:`${DATASET.adhdRate}%`, background:'var(--border)'}} /></div>
                </div>
              </>
            ) : (
              <p className="r-empty">Not enough data to build a comparison group.</p>
            )}
          </section>

          {/* ── ACADEMIC IMPACT ── */}
          <section className="r-card">
            <div className="r-card__head">
              <div className="r-card__icon" style={{background:'var(--o50)'}}>📚</div>
              <div>
                <h3 className="r-card__title">Academic impact</h3>
                {!csvLoading && academicData && (
                  <p className="r-card__sub">Group of {academicData.sampleSize.toLocaleString()} people with a similar symptom total</p>
                )}
              </div>
            </div>

            {csvLoading ? (
              <div className="r-skeleton" style={{height:60}} />
            ) : academicData && academicData.confidence !== 'low' ? (
              <>
                <div className="r-split">
                  <div className="r-split__cell" style={{background:'var(--r50)'}}>
                    <div className="r-split__num" style={{color:'var(--r500)'}}>{academicData.yourGroupAvg}</div>
                    <div className="r-split__label">Your group's average</div>
                  </div>
                  <div className="r-split__cell" style={{background:'var(--g50)'}}>
                    <div className="r-split__num" style={{color:'var(--g500)'}}>{academicData.populationAvg}</div>
                    <div className="r-split__label">Overall population average</div>
                  </div>
                </div>
                {academicData.gap > 0 && (
                  <div className="r-note r-note--orange">
                    ⚠️ Your symptom group scores <strong>{academicData.gap} points lower</strong> on average.
                    FocusFlow's focus tools are designed to help close this gap.
                  </div>
                )}
              </>
            ) : (
              <p className="r-empty">Not enough similar records in our data to estimate this reliably — skipping rather than guessing.</p>
            )}
          </section>

          {/* ── SCORE BREAKDOWN ── */}
          <section className="r-card">
            <div className="r-card__head">
              <div className="r-card__icon" style={{background:'var(--p50)'}}>🧮</div>
              <div>
                <h3 className="r-card__title">Score breakdown</h3>
                <p className="r-card__sub">ADHD diagnosis rate at each of your scores, from 2,000 real patients</p>
              </div>
            </div>

            {bd.map(b => (
              <div key={b.label} className="r-breakdown-row">
                <div className="r-breakdown-row__top">
                  <span className="r-breakdown-row__label">{b.label} <span className="r-breakdown-row__raw">{b.raw}/9</span></span>
                  <span className="r-breakdown-row__weight">{b.weight}% of score</span>
                </div>
                <div className="r-track"><div className="r-fill" style={{ width:`${b.score}%`, background:b.color }} /></div>
                <div className="r-breakdown-row__note">{b.description}</div>
              </div>
            ))}

            {modifiers.length > 0 && (
              <div className="r-modifiers">
                <p className="r-modifiers__label">Risk modifiers applied</p>
                <div className="r-modifiers__list">
                  {modifiers.map(m => (
                    <div key={m.label} className="r-modifier-chip">
                      <span className={`ui-badge ui-badge--${m.badge}`}>{m.pts}</span>
                      <span>{m.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </section>

          {/* ── EDUCATION GROUP ── */}
          {!csvLoading && ageStats && (
            <section className="r-card">
              <div className="r-card__head">
                <div className="r-card__icon" style={{background:'var(--g50)'}}>🎓</div>
                <div>
                  <h3 className="r-card__title">Your education group</h3>
                  <p className="r-card__sub">{assessment?.educationStage} · {ageStats.total.toLocaleString()} people in our data</p>
                </div>
              </div>
              <div className="r-split r-split--3">
                <div className="r-split__cell">
                  <div className="r-split__num">{ageStats.total.toLocaleString()}</div>
                  <div className="r-split__label">Total people</div>
                </div>
                <div className="r-split__cell">
                  <div className="r-split__num" style={{color:risk.color}}>{ageStats.rate}%</div>
                  <div className="r-split__label">ADHD diagnosed</div>
                </div>
                <div className="r-split__cell">
                  <div className="r-split__num" style={{color:'var(--g500)'}}>{ageStats.avgAcademic}</div>
                  <div className="r-split__label">Avg academic score</div>
                </div>
              </div>
            </section>
          )}

          {/* ── HOW YOU COMPARE — grouped horizontal bars, not a cramped table ── */}
          <section className="r-card">
            <div className="r-card__head">
              <div className="r-card__icon" style={{background:'var(--surf3)'}}>📐</div>
              <div>
                <h3 className="r-card__title">How you compare</h3>
                <p className="r-card__sub">vs. all 2,000 people in our data</p>
              </div>
            </div>

            <div className="r-legend">
              <span><i style={{background:'var(--p500)'}} /> You</span>
              <span><i style={{background:'var(--r400,#FF8F8F)'}} /> ADHD average</span>
              <span><i style={{background:'var(--g400,#7FE0BB)'}} /> Non-ADHD average</span>
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

          {/* ── DISCLAIMER ── */}
          <div className="r-disclaimer">
            <p><strong>⚠️ Important:</strong> This is a statistical screening tool built on real patient data —
            not a clinical diagnosis. Scores ≥65% indicate professional evaluation is recommended.
            Please consult a psychiatrist or clinical psychologist for a formal assessment.</p>
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
