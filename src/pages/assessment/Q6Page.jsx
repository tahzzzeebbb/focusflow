import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { Btn, StepBar, Badge } from '../../components/ui';
import './Assessment.css';

const OPTIONS = [
  { key:'familyHistory', emoji:'🧬', title:'Family history of ADHD',
    sub:'A parent, sibling, or close relative has been diagnosed' },
  { key:'anxiety', emoji:'😰', title:'Anxiety',
    sub:'Diagnosed or suspected — persistent worry, racing thoughts' },
  { key:'depression', emoji:'😞', title:'Depression',
    sub:'Persistent low mood, loss of motivation or interest' },
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
        <Badge variant="red">Question 6 of 7</Badge>
        <h1 className="assess-q">Does any of this apply to you?</h1>
        <p className="assess-sub">Select all that apply — it's fine if none do</p>
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
