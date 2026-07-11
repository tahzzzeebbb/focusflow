import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { Btn, StepBar, Badge } from '../../components/ui';
import './Assessment.css';

const STAGES = [
  { val:'Child',    emoji:'🧒', label:'Child (6–11)' },
  { val:'Teen',     emoji:'👦', label:'Teen (12–17)' },
  { val:'Undergrad',emoji:'🎓', label:'University / Undergrad' },
  { val:'Adult',    emoji:'💼', label:'Working Adult (25+)' },
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
        <Badge variant="green">Last question!</Badge>
        <h1 className="assess-q">What's your current life stage?</h1>
        <p className="assess-sub">This helps us show you more relevant results</p>
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
              </div>
              <div style={{ color: selected === s.val ? 'var(--p500)' : 'var(--border)', fontSize: 22 }}>
                {selected === s.val ? '✓' : '○'}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="assess-footer">
        <Btn onClick={() => navigate('/calculating')} disabled={!selected}>
          {selected ? 'See My Results →' : 'Select your stage to continue'}
        </Btn>
      </div>
    </div>
  );
}
