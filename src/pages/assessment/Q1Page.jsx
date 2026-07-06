import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { Btn, StepBar, Badge } from '../../components/ui';
import { INN_RISK, loadCSV } from '../../services/adhdEngine';
import './Assessment.css';

const EMOJIS = ['😌','😊','🤔','🤔','😓','😓','😩','😩','🌀','🌀'];

export default function Q1Page() {
  const navigate = useNavigate();
  const { updateAssessment } = useApp();
  const [selected, setSelected] = useState(null);
  const [csvCounts, setCsvCounts] = useState(null);

  // Load real CSV counts per score
  useEffect(() => {
    loadCSV().then(rows => {
      const counts = {};
      for (let s = 0; s <= 9; s++) {
        const grp = rows.filter(r => parseInt(r.InattentionScore) === s);
        counts[s] = { total: grp.length, adhd: grp.filter(r => r.ADHD==='1').length };
      }
      setCsvCounts(counts);
    }).catch(() => {});
  }, []);

  const select = (val) => { setSelected(val); updateAssessment('inattention', val); };
  const risk = selected !== null ? INN_RISK[selected] : null;
  const rc = risk >= 80 ? '#FF5C5C' : risk >= 65 ? '#FF8C00' : risk >= 50 ? '#F59E0B' : '#00B37D';

  return (
    <div className="screen">
      <div className="assess-header">
        <StepBar current={0} total={7} />
        <Badge variant="purple">Question 1 of 7 · Primary Predictor (45% weight)</Badge>
        <h1 className="assess-q">How often do you struggle to stay focused?</h1>
        <p className="assess-sub">Strongest predictor in our model — 45% of your final score</p>
      </div>

      <div className="screen__scroll px">
        {/* Real CSV bar chart */}
        <div className="data-chart-box">
          <p className="data-chart-label">
            📊 Real ADHD diagnosis rates per score — from ADHD.csv (n=2,000)
          </p>
          <div className="data-chart">
            {Object.entries(INN_RISK).map(([s, r]) => {
              const si = parseInt(s);
              const n = csvCounts?.[si]?.total ?? '…';
              return (
                <div key={s} className="data-chart__col"
                  style={{ opacity: selected === si ? 1 : 0.55 }}>
                  <span className="data-chart__pct" style={{ color: selected===si ? rc : undefined }}>
                    {r}%
                  </span>
                  <div className="data-chart__bar"
                    style={{ height:`${r * 0.55}px`,
                      background: si===selected ? rc : r>=80?'#FF5C5C':r>=65?'#FFB347':'#A29BFE' }} />
                  <span className="data-chart__lbl">{s}</span>
                  {csvCounts && (
                    <span style={{ fontSize:8, color:'var(--ink4)' }}>n={n}</span>
                  )}
                </div>
              );
            })}
          </div>
          {selected !== null && csvCounts && (
            <div style={{ marginTop:10, fontSize:12, color:'var(--ink3)', textAlign:'center' }}>
              {csvCounts[selected]?.adhd} of {csvCounts[selected]?.total} real patients scoring {selected} had ADHD ({INN_RISK[selected]}%)
            </div>
          )}
        </div>

        {/* Scale */}
        <p className="assess-scale-label">Your level (0 = Never, 9 = Always)</p>
        <div className="scale-grid-2">
          {Array.from({length:10}).map((_,i) => (
            <button key={i}
              className={`scale-btn-2 ${selected===i?'active':''}`}
              onClick={() => select(i)}
              style={selected===i ? { background:rc, borderColor:rc } : {}}>
              <span className="scale-btn-2__emoji">{EMOJIS[i]}</span>
              <span className="scale-btn-2__num">{i}</span>
            </button>
          ))}
        </div>

        {selected !== null && (
          <div className="assess-feedback animate-fadeup"
            style={{ borderLeftColor:rc, background:rc+'18' }}>
            <strong style={{ color:rc }}>Score {selected}:</strong>{' '}
            {INN_RISK[selected]}% of the {csvCounts?.[selected]?.total??'…'} patients
            with this exact score in our dataset were diagnosed with ADHD.
            {risk >= 80 && ' ⚠️ Very strong indicator.'}
            {risk >= 65 && risk < 80 && ' — Above average risk indicator.'}
            {risk < 45 && ' — Lower risk range.'}
          </div>
        )}
      </div>

      <div className="assess-footer">
        <Btn onClick={() => navigate('/q2')} disabled={selected===null}>
          {selected===null ? 'Select a score to continue' : 'Next →'}
        </Btn>
      </div>
    </div>
  );
}
