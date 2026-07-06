import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { Btn, StepBar, Badge } from '../../components/ui';
import './Assessment.css';

const STAGES = [
  { val:'Child',    emoji:'🧒', label:'Child (6–11)',        rate:'64%', n:393 },
  { val:'Teen',     emoji:'👦', label:'Teen (12–17)',         rate:'65%', n:607 },
  { val:'Undergrad',emoji:'🎓', label:'University / Undergrad',rate:'65%', n:485 },
  { val:'Adult',    emoji:'💼', label:'Working Adult (25+)',   rate:'65%', n:515 },
];

export default function Q7Page() {
  const navigate = useNavigate();
  const { updateAssessment } = useApp();
  const [selected, setSelected] = useState(null);

  const select = (val) => { setSelected(val); updateAssessment('educationStage', val); };

  return (
    <div className="screen">
      <div className="assess-header">
        <StepBar current={6} total={7} />
        <Badge variant="green">Question 7 of 7 · Last one!</Badge>
        <h1 className="assess-q">What's your current life stage?</h1>
        <p className="assess-sub">This helps us contextualise your results accurately</p>
      </div>

      <div className="screen__scroll px">
        <div className="choice-list" style={{ marginTop: 8 }}>
          {STAGES.map(s => (
            <div key={s.val}
              className={`choice-card ${selected === s.val ? 'active' : ''}`}
              onClick={() => select(s.val)}>
              <div className="choice-card__ico">{s.emoji}</div>
              <div style={{ flex: 1 }}>
                <div className="choice-card__title">{s.label}</div>
                <div style={{ display:'flex', gap:6, marginTop:4 }}>
                  <span className="ui-badge ui-badge--purple" style={{ fontSize:11 }}>
                    {s.rate} ADHD rate in dataset
                  </span>
                  <span className="ui-badge ui-badge--dark" style={{ fontSize:11 }}>
                    n={s.n}
                  </span>
                </div>
              </div>
              <div style={{ color: selected === s.val ? 'var(--p500)' : 'var(--border)', fontSize: 22 }}>
                {selected === s.val ? '✓' : '○'}
              </div>
            </div>
          ))}
        </div>

        <div className="assess-insight assess-insight--purple" style={{ marginTop: 8 }}>
          📊 <strong>Key finding:</strong> ADHD diagnosis rate is remarkably stable at ~65% across ALL education stages in our 2,000 patient dataset. Age and education level don't change the likelihood significantly — ADHD persists through life.
        </div>
      </div>

      <div className="assess-footer">
        <Btn onClick={() => navigate('/calculating')} disabled={!selected}>
          {selected ? 'Calculate My Score →' : 'Select your stage to continue'}
        </Btn>
      </div>
    </div>
  );
}
