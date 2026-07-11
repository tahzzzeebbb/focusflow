import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { Btn, ScoreRing } from '../../components/ui';
import { getRiskLevel, getADHDType } from '../../services/adhdEngine';
import './ResultPage.css';

// Plain-language takeaway — no methodology, no numbers, no citations.
// This is the ONLY thing most people need to read.
function takeaway(scoreLevel, type) {
  const focus = type.desc.toLowerCase();
  if (scoreLevel === 'high')     return `Your answers point strongly toward ADHD patterns, mostly around ${focus}. It's worth talking to a doctor about this.`;
  if (scoreLevel === 'moderate') return `Your answers show some patterns often linked to ADHD, especially ${focus}. Worth keeping an eye on.`;
  return `Your answers don't show strong ADHD patterns right now. That's good — you can always check again later if things change.`;
}

function recommendations(scoreLevel) {
  if (scoreLevel === 'high') return [
    { icon:'👨‍⚕️', title:'Talk to a professional', sub:'A doctor or therapist can give you a proper diagnosis' },
    { icon:'⏱️', title:'Try short focus sessions', sub:'25-minute blocks with breaks in between' },
    { icon:'😴', title:'Protect your sleep', sub:'Poor sleep tends to make focus harder' },
  ];
  if (scoreLevel === 'moderate') return [
    { icon:'⏱️', title:'Try short focus sessions', sub:'25-minute blocks with breaks in between' },
    { icon:'📓', title:'Track your patterns', sub:'A quick daily check-in helps spot trends' },
    { icon:'👨‍⚕️', title:'Consider a professional opinion', sub:'Especially if this is affecting daily life' },
  ];
  return [
    { icon:'📓', title:'Keep checking in', sub:'A quick daily mood log helps you notice changes' },
    { icon:'⏱️', title:'Use focus sessions when needed', sub:'Helpful for anyone, ADHD or not' },
  ];
}

export default function ResultPage() {
  const navigate = useNavigate();
  const { score, assessment } = useApp();
  const [animScore, setAnimScore] = useState(0);

  const s    = score ?? 65;
  const risk = getRiskLevel(s);
  const type = getADHDType(assessment?.inattention ?? 4, assessment?.hyperactivity ?? 4);
  const scoreLevel = s >= 70 ? 'high' : s >= 45 ? 'moderate' : 'low';
  const recs = recommendations(scoreLevel);

  useEffect(() => {
    let n = 0;
    const t = setInterval(() => {
      n += 2; setAnimScore(Math.min(n, s));
      if (n >= s) clearInterval(t);
    }, 18);
    return () => clearInterval(t);
  }, [s]);

  return (
    <div className="screen">
      <div className="screen__scroll">

        {/* ── SCORE HERO ── */}
        <div className="res-hero">
          <p className="res-hero__eyebrow">Your Result</p>
          <ScoreRing score={animScore} size={172} light />
          <h2 className="res-hero__level">{risk.label}</h2>
          <p className="res-hero__type">{type.type}</p>
        </div>

        <div className="res-body">

          {/* ── AI INSIGHT — plain language, no methodology ── */}
          <section className="res-card">
            <p className="res-card__label">AI Insight</p>
            <p className="res-insight-text">{takeaway(scoreLevel, type)}</p>
          </section>

          {/* ── RECOMMENDATIONS ── */}
          <section>
            <p className="res-section-label">Recommendations</p>
            <div className="res-rec-list">
              {recs.map(r => (
                <div key={r.title} className="res-rec-card">
                  <span className="res-rec-card__icon">{r.icon}</span>
                  <div>
                    <div className="res-rec-card__title">{r.title}</div>
                    <div className="res-rec-card__sub">{r.sub}</div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* ── DISCLAIMER — short, plain, no jargon ── */}
          <div className="res-disclaimer">
            This is a screening tool, not a medical diagnosis. If you're concerned, please
            talk to a doctor or therapist.
          </div>
        </div>
      </div>

      <div className="res-footer">
        <Btn onClick={() => navigate('/home')}>Continue to My Plan</Btn>
        <button onClick={() => navigate('/q1')} className="res-footer__retake">Retake Assessment</button>
      </div>
    </div>
  );
}
