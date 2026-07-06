import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { Btn, StepBar, Badge } from '../../components/ui';
import { HYP_RISK } from '../../services/adhdEngine';
import './Assessment.css';

export default function Q2Page() {
  const navigate = useNavigate();
  const { updateAssessment } = useApp();
  const [val, setVal] = useState(4);

  const risk = HYP_RISK[val] ?? 74;
  const rc = risk>=80?'#FF5C5C':risk>=65?'#FF8C00':risk>=50?'#F59E0B':'#00B37D';
  const change = v => { setVal(parseInt(v)); updateAssessment('hyperactivity', parseInt(v)); };

  return (
    <div className="screen">
      <div className="assess-header">
        <StepBar current={1} total={7}/>
        <Badge variant="orange">Question 2 of 7 · Hyperactivity</Badge>
        <h1 className="assess-q">How often do you feel restless or can't sit still?</h1>
        <p className="assess-sub">Fidgeting, pacing, talking too much — all count</p>
      </div>
      <div className="screen__scroll px">
        <div className="slider-question">
          <div className="slider-header"><span>😌 Very calm</span><span>🌀 Extremely restless</span></div>
          <input type="range" className="range-input" min={0} max={9} value={val}
            onChange={e=>change(e.target.value)} style={{width:'100%'}}/>
          <div className="slider-val-big">
            <span style={{color:rc}}>{val}</span>
            <span style={{fontSize:16,color:'var(--ink3)'}}> / 9</span>
          </div>
        </div>
        <div className="assess-feedback" style={{borderLeftColor:rc,background:rc+'18'}}>
          <strong style={{color:rc}}>Level {val}:</strong>{' '}
          {risk}% of patients with this hyperactivity score had ADHD in our 2,000 patient dataset.
        </div>
        <div className="data-chart-box" style={{marginTop:16}}>
          <p className="data-chart-label">📊 Hyperactivity score → ADHD rate (real data)</p>
          <div className="data-chart">
            {Object.entries(HYP_RISK).map(([s,r])=>(
              <div key={s} className="data-chart__col" style={{opacity:parseInt(s)===val?1:0.45}}>
                <span className="data-chart__pct">{r}%</span>
                <div className="data-chart__bar" style={{height:`${r*.5}px`,background:parseInt(s)===val?rc:'#A29BFE'}}/>
                <span className="data-chart__lbl">{s}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="assess-insight assess-insight--orange" style={{marginTop:16}}>
          💡 ADHD patients avg hyperactivity: <strong>3.51/9</strong> vs non-ADHD: <strong>2.23/9</strong>
        </div>
      </div>
      <div className="assess-footer"><Btn onClick={()=>navigate('/q3')}>Next →</Btn></div>
    </div>
  );
}
