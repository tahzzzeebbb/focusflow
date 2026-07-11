import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { Btn, StepBar, Badge } from '../../components/ui';
import './Assessment.css';

const OPTIONS = [
  { val:0, emoji:'😌', label:'Very calm',      sub:'I can sit still comfortably' },
  { val:3, emoji:'🙂', label:'A bit restless',  sub:'Sometimes fidgety' },
  { val:6, emoji:'😅', label:'Quite restless',  sub:'Hard to sit still' },
  { val:9, emoji:'🌀', label:'Very restless',   sub:'Constantly need to move' },
];

export default function Q2Page() {
  const navigate = useNavigate();
  const { updateAssessment } = useApp();
  const [selected, setSelected] = useState(null);

  const select = (val) => { setSelected(val); updateAssessment('hyperactivity', val); };

  return (
    <div className="screen">
      <div className="assess-header">
        <StepBar current={1} total={7} />
        <Badge variant="orange">Question 2 of 7</Badge>
        <h1 className="assess-q">How often do you feel restless or can't sit still?</h1>
        <p className="assess-sub">Fidgeting, pacing, or feeling "on the go"</p>
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
        <Btn onClick={() => navigate('/q3')} disabled={selected === null}>
          {selected === null ? 'Choose an answer to continue' : 'Next →'}
        </Btn>
      </div>
    </div>
  );
}
