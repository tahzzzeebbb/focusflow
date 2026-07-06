import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { Btn, StepBar, Badge } from '../../components/ui';
import './Assessment.css';

const OPTIONS = [
  { key:'familyHistory', emoji:'🧬', title:'Family history of ADHD',
    sub:'Parent, sibling, or close relative diagnosed with ADHD',
    badge:'+4 risk points', badgeV:'red',
    insight:'27.2% of ADHD patients vs 19.3% of non-ADHD — significant genetic marker' },
  { key:'anxiety', emoji:'😰', title:'Anxiety disorder',
    sub:'Diagnosed or suspected — persistent worry, racing thoughts',
    badge:'16.8% comorbid with ADHD', badgeV:'yellow',
    insight:'Anxiety and ADHD frequently co-occur. Our data shows slightly lower ADHD rate with anxiety alone.' },
  { key:'depression', emoji:'😞', title:'Depression',
    sub:'Persistent low mood, loss of motivation or interest',
    badge:'11.3% comorbid with ADHD', badgeV:'purple',
    insight:'Depression can be secondary to ADHD frustration and academic difficulty.' },
];

export default function Q6Page() {
  const navigate = useNavigate();
  const { updateAssessment } = useApp();
  const [selected, setSelected] = useState(new Set());

  const toggle = (key) => {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(key)) { next.delete(key); updateAssessment(key, false); }
      else { next.add(key); updateAssessment(key, true); }
      return next;
    });
  };

  return (
    <div className="screen">
      <div className="assess-header">
        <StepBar current={5} total={7} />
        <Badge variant="red">Question 6 of 7 · Risk Factors</Badge>
        <h1 className="assess-q">Family & medical history</h1>
        <p className="assess-sub">These modify your risk score. Select all that apply — none is perfectly valid.</p>
      </div>

      <div className="screen__scroll px">
        <div className="choice-list" style={{ marginTop: 8 }}>
          {OPTIONS.map(opt => (
            <div key={opt.key}
              className={`choice-card ${selected.has(opt.key) ? 'active' : ''}`}
              onClick={() => toggle(opt.key)}>
              <div className="choice-card__ico">{opt.emoji}</div>
              <div style={{ flex: 1 }}>
                <div className="choice-card__title">{opt.title}</div>
                <div className="choice-card__sub">{opt.sub}</div>
                <div className="choice-card__badge" style={{ marginTop: 6 }}>
                  <span className={`ui-badge ui-badge--${opt.badgeV}`}>{opt.badge}</span>
                </div>
                {selected.has(opt.key) && (
                  <p style={{ fontSize:12, color:'var(--ink3)', marginTop:8, lineHeight:1.4 }}>
                    📊 {opt.insight}
                  </p>
                )}
              </div>
              <div style={{ color: selected.has(opt.key) ? 'var(--p500)' : 'var(--border)', fontSize: 22, flexShrink: 0 }}>
                {selected.has(opt.key) ? '✓' : '○'}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="assess-footer">
        <Btn onClick={() => navigate('/q7')}>Next →</Btn>
      </div>
    </div>
  );
}
