import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { Btn, StepBar, Badge } from '../../components/ui';
import './Assessment.css';

const OPTIONS = [
  {
    key: 'rsd', emoji: '💔',
    title: 'Rejection Sensitivity (RSD)',
    sub: 'Intense emotional pain from criticism or perceived rejection — even when none exists',
    stat: '66.9% of ADHD patients have RSD',
    statVariant: 'purple',
  },
  {
    key: 'daydreaming', emoji: '☁️',
    title: 'Frequent Daydreaming',
    sub: 'Mind constantly drifts away — hard to stay present in conversations or tasks',
    stat: '19.7% of ADHD patients report this',
    statVariant: 'yellow',
  },
];

export default function Q4Page() {
  const navigate = useNavigate();
  const { updateAssessment } = useApp();
  const [selected, setSelected] = useState(new Set());

  const toggle = (key) => {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key); else next.add(key);
      updateAssessment(key, next.has(key));
      return next;
    });
  };

  return (
    <div className="screen">
      <div className="assess-header">
        <StepBar current={3} total={7} />
        <Badge variant="purple">Question 4 of 7 · Emotional Patterns</Badge>
        <h1 className="assess-q">Which emotional patterns do you experience?</h1>
        <p className="assess-sub">Select all that feel true for you — none, one, or both</p>
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
                <div className="choice-card__badge">
                  <span className={`ui-badge ui-badge--${opt.statVariant}`}>
                    📊 {opt.stat}
                  </span>
                </div>
              </div>
              <div style={{ color: selected.has(opt.key) ? 'var(--p500)' : 'var(--border)', fontSize: 22 }}>
                {selected.has(opt.key) ? '✓' : '○'}
              </div>
            </div>
          ))}
        </div>

        <div className="assess-insight assess-insight--purple" style={{ marginTop: 16 }}>
          💡 <strong>RSD (Rejection Sensitivity Dysphoria)</strong> affects ~99% of adults with ADHD according to Dr. William Dodson. It causes intense emotional reactions — out of proportion to the situation. This is not a character flaw.
        </div>
      </div>

      <div className="assess-footer">
        <Btn onClick={() => navigate('/q5')}>Next →</Btn>
      </div>
    </div>
  );
}
