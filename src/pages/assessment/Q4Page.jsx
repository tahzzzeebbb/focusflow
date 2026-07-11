import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { Btn, StepBar, Badge } from '../../components/ui';
import './Assessment.css';

const OPTIONS = [
  {
    key: 'rsd', emoji: '💔',
    title: 'Strong reaction to criticism',
    sub: 'Intense emotional pain from criticism or feeling rejected — even when none was intended',
  },
  {
    key: 'daydreaming', emoji: '☁️',
    title: 'Frequent daydreaming',
    sub: 'Your mind drifts away often — hard to stay present in conversations or tasks',
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
        <Badge variant="purple">Question 4 of 7</Badge>
        <h1 className="assess-q">Do either of these sound like you?</h1>
        <p className="assess-sub">Select any that feel true — none, one, or both</p>
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
              </div>
              <div style={{ color: selected.has(opt.key) ? 'var(--p500)' : 'var(--border)', fontSize: 22 }}>
                {selected.has(opt.key) ? '✓' : '○'}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="assess-footer">
        <Btn onClick={() => navigate('/q5')}>Next →</Btn>
      </div>
    </div>
  );
}
