import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { Btn, StepBar, Badge } from '../../components/ui';
import './Assessment.css';

export default function Q5Page() {
  const navigate = useNavigate();
  const { updateAssessment } = useApp();
  const [sleep, setSleep] = useState(70);
  const [screen, setScreen] = useState(4);

  const sleepH = (sleep / 10).toFixed(1);
  const sleepRisk = parseFloat(sleepH) < 6;

  const changeSleep = (v) => {
    setSleep(parseInt(v));
    updateAssessment('sleepHours', parseFloat((v / 10).toFixed(1)));
  };

  return (
    <div className="screen">
      <div className="assess-header">
        <StepBar current={4} total={7} />
        <Badge variant="yellow">Question 5 of 7 · Lifestyle</Badge>
        <h1 className="assess-q">Sleep & daily screen time</h1>
        <p className="assess-sub">Lifestyle factors that modify your overall risk score</p>
      </div>

      <div className="screen__scroll px">
        {/* Sleep */}
        <div style={{ marginBottom: 20 }}>
          <p className="assess-scale-label" style={{ marginTop: 8 }}>Average sleep per night</p>
          <div className="slider-question">
            <div className="slider-header">
              <span>😴 3.5h</span><span>🌙 11h</span>
            </div>
            <input type="range" className="range-input" min={35} max={110} value={sleep}
              onChange={e => changeSleep(e.target.value)} style={{ width: '100%' }} />
            <div className="slider-val-big">
              <span style={{ color: sleepRisk ? '#FF5C5C' : '#6C5CE7' }}>{sleepH}</span>
              <span style={{ fontSize: 16, color: 'var(--ink3)' }}> hours</span>
            </div>
          </div>
          {sleepRisk ? (
            <div className="assess-insight assess-insight--red">
              ⚠️ Low sleep detected. In our data, patients sleeping &lt;6h had a <strong>70% ADHD diagnosis rate</strong> vs 64% overall. +2 risk points added.
            </div>
          ) : (
            <div className="assess-insight assess-insight--green">
              ✅ Normal sleep range. ADHD rate is similar (~64%) at this sleep level.
            </div>
          )}
        </div>

        {/* Screen time */}
        <div>
          <p className="assess-scale-label">Daily screen time</p>
          <div className="slider-question">
            <div className="slider-header">
              <span>📱 0h</span><span>📺 11h+</span>
            </div>
            <input type="range" className="range-input" min={0} max={11} value={screen}
              onChange={e => { setScreen(parseInt(e.target.value)); updateAssessment('screenHours', parseInt(e.target.value)); }}
              style={{ width: '100%' }} />
            <div className="slider-val-big">
              <span style={{ color: 'var(--ink)' }}>{screen}</span>
              <span style={{ fontSize: 16, color: 'var(--ink3)' }}> hours/day</span>
            </div>
          </div>
          <div className="assess-insight assess-insight--purple">
            📊 Interesting finding: screen time shows <strong>minimal ADHD correlation</strong> in our dataset. ADHD avg: 4.19h/day, Non-ADHD avg: 4.27h/day — nearly identical. Sleep is the stronger lifestyle predictor.
          </div>
        </div>
      </div>

      <div className="assess-footer">
        <Btn onClick={() => navigate('/q6')}>Next →</Btn>
      </div>
    </div>
  );
}
