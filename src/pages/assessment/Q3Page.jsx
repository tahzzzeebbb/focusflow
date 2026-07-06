import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { Btn, StepBar, Badge } from '../../components/ui';
import { IMP_RISK } from '../../services/adhdEngine';
import './Assessment.css';

const EMOJIS = ['🧘','🧘','🤔','🤔','😤','😤','⚡','⚡','💥','💥'];

export default function Q3Page() {
  const navigate = useNavigate();
  const { updateAssessment } = useApp();
  const [selected, setSelected] = useState(null);

  const select = v => { setSelected(v); updateAssessment('impulsivity', v); };
  const risk = selected!==null ? IMP_RISK[selected] : null;
  const rc = risk>=80?'#FF5C5C':risk>=65?'#FF8C00':risk>=50?'#F59E0B':'#00B37D';

  return (
    <div className="screen">
      <div className="assess-header">
        <StepBar current={2} total={7}/>
        <Badge variant="green">Question 3 of 7 · Impulsivity</Badge>
        <h1 className="assess-q">Do you act before thinking things through?</h1>
        <p className="assess-sub">Interrupting others, impulsive decisions, blurting things out</p>
      </div>
      <div className="screen__scroll px">
        <p className="assess-scale-label" style={{marginTop:8}}>Your level (0 = Never, 9 = Always)</p>
        <div className="scale-grid-2">
          {Array.from({length:10}).map((_,i)=>(
            <button key={i} className={`scale-btn-2 ${selected===i?'active':''}`}
              onClick={()=>select(i)} style={selected===i?{background:rc,borderColor:rc}:{}}>
              <span className="scale-btn-2__emoji">{EMOJIS[i]}</span>
              <span className="scale-btn-2__num">{i}</span>
            </button>
          ))}
        </div>
        {selected!==null && (
          <div className="assess-feedback animate-fadeup" style={{borderLeftColor:rc,background:rc+'18'}}>
            <strong style={{color:rc}}>Score {selected}:</strong> {IMP_RISK[selected]}% ADHD rate at this score.
            {IMP_RISK[selected]>=80&&' ⚠️ Very high indicator.'}
          </div>
        )}
        <div className="data-chart-box" style={{marginTop:16}}>
          <p className="data-chart-label">📊 Impulsivity → ADHD rate (2,000 patients)</p>
          <div className="data-chart">
            {Object.entries(IMP_RISK).map(([s,r])=>(
              <div key={s} className="data-chart__col" style={{opacity:selected===parseInt(s)?1:0.45}}>
                <span className="data-chart__pct">{r}%</span>
                <div className="data-chart__bar" style={{height:`${r*.5}px`,background:selected===parseInt(s)?rc:'#55D6A0'}}/>
                <span className="data-chart__lbl">{s}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="assess-footer">
        <Btn onClick={()=>navigate('/q4')} disabled={selected===null}>
          {selected===null?'Select a score to continue':'Next →'}
        </Btn>
      </div>
    </div>
  );
}
