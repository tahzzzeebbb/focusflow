import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { Btn, StepBar, Badge } from '../../components/ui';
import './Assessment.css';

const OPTIONS = [
  { val:0, emoji:'🧘', label:'Rarely',    sub:'I usually think before acting' },
  { val:3, emoji:'🙂', label:'Sometimes', sub:'Occasionally act on impulse' },
  { val:6, emoji:'😅', label:'Often',     sub:'Interrupt or act quickly' },
  { val:9, emoji:'💥', label:'Almost always', sub:'Act before thinking, regularly' },
];

export default function Q3Page() {
  const navigate = useNavigate();
  const { updateAssessment } = useApp();
  const [selected, setSelected] = useState(null);

  const select = (val) => { setSelected(val); updateAssessment('impulsivity', val); };

  return (
    <div className="screen">
      <div className="assess-header">
        <StepBar current={2} total={7} />
        <Badge variant="green">Question 3 of 7</Badge>
        <h1 className="assess-q">Do you act before thinking things through?</h1>
        <p className="assess-sub">Interrupting others, impulsive decisions, blurting things out</p>
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
        <Btn onClick={() => navigate('/q4')} disabled={selected === null}>
          {selected === null ? 'Choose an answer to continue' : 'Next →'}
        </Btn>
      </div>
    </div>
  );
}
