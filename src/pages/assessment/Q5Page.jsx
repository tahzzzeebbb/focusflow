import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { Btn, StepBar, Badge } from '../../components/ui';
import './Assessment.css';

export default function Q5Page() {
  const navigate = useNavigate();
  const { updateAssessment } = useApp();
  const [sleep, setSleep] = useState(70);

  const sleepH = (sleep / 10).toFixed(1);

  const changeSleep = (v) => {
    setSleep(parseInt(v));
    updateAssessment('sleepHours', parseFloat((v / 10).toFixed(1)));
  };

  return (
    <div className="screen">
      <div className="assess-header">
        <StepBar current={4} total={7} />
        <Badge variant="yellow">Question 5 of 7</Badge>
        <h1 className="assess-q">How much do you usually sleep?</h1>
        <p className="assess-sub">Average hours per night</p>
      </div>

      <div className="screen__scroll px">
        <div className="slider-question">
          <div className="slider-header">
            <span>😴 3.5h</span><span>🌙 11h</span>
          </div>
          <input type="range" className="range-input" min={35} max={110} value={sleep}
            onChange={e => changeSleep(e.target.value)} style={{ width: '100%' }} />
          <div className="slider-val-big">
            <span style={{ color: 'var(--p500)' }}>{sleepH}</span>
            <span style={{ fontSize: 16, color: 'var(--ink3)' }}> hours</span>
          </div>
        </div>
      </div>

      <div className="assess-footer">
        <Btn onClick={() => navigate('/q6')}>Next →</Btn>
      </div>
    </div>
  );
}
