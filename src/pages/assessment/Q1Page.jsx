import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { Btn, StepBar, Badge } from '../../components/ui';
import './Assessment.css';

const OPTIONS = [
  { val:0, emoji:'😌', label:'Rarely',    sub:'Almost never' },
  { val:2, emoji:'🙂', label:'Sometimes', sub:'A few times a week' },
  { val:5, emoji:'😓', label:'Often',     sub:'Most days' },
  { val:8, emoji:'🌀', label:'Almost always', sub:'It\'s a daily struggle' },
];

export default function Q1Page() {
  const navigate = useNavigate();
  const { updateAssessment } = useApp();
  const [selected, setSelected] = useState(null);

  const select = (val) => { setSelected(val); updateAssessment('inattention', val); };

  return (
    <div className="screen">
      <div className="assess-header">
        <StepBar current={0} total={7} />
        <Badge variant="purple">Question 1 of 7</Badge>
        <h1 className="assess-q">How often do you struggle to stay focused?</h1>
        <p className="assess-sub">Think about work, reading, or conversations</p>
      </div>

      <div className="screen__scroll px">
        <div className="q-options">
          {OPTIONS.map(o => (
            <button key={o.val}
              className={`q-option ${selected === o.val ? 'active' : ''}`}
              onClick={() => select(o.val)}>
              <span className="q-option__emoji">{o.emoji}</span>
              <div className="q-option__text">
                <div className="q-option__label">{o.label}</div>
                <div className="q-option__sub">{o.sub}</div>
              </div>
              {selected === o.val && <span className="q-option__check">✓</span>}
            </button>
          ))}
        </div>
      </div>

      <div className="assess-footer">
        <Btn onClick={() => navigate('/q2')} disabled={selected === null}>
          {selected === null ? 'Choose an answer to continue' : 'Next →'}
        </Btn>
      </div>
    </div>
  );
}
