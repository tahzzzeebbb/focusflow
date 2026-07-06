import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import './CalculatingPage.css';

const STEPS = [
  { icon:'📊', text:'Loading 2,000 patient dataset…' },
  { icon:'⚖️', text:'Weighting inattention score (45%)…' },
  { icon:'⚡', text:'Applying hyperactivity factor (25%)…' },
  { icon:'💥', text:'Applying impulsivity factor (20%)…' },
  { icon:'🔢', text:'Calibrating symptom sum model…' },
  { icon:'🧬', text:'Applying risk factor modifiers…' },
  { icon:'🔍', text:'Comparing with patient cohort…' },
  { icon:'✅', text:'Generating your report…' },
];

export default function CalculatingPage() {
  const navigate = useNavigate();
  const { assessment, finalizeAssessment } = useApp();
  const [step, setStep] = useState(0);
  const [pct, setPct] = useState(0);

  useEffect(() => {
    const total = STEPS.length;
    let current = 0;

    const interval = setInterval(() => {
      current++;
      setStep(Math.min(current, total - 1));
      setPct(Math.round((current / total) * 100));

      if (current >= total) {
        clearInterval(interval);
        const score = finalizeAssessment(assessment);
        setTimeout(() => navigate('/result'), 600);
      }
    }, 320);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="calculating">
      <div className="calculating__content">
        <div className="calculating__icon animate-shimmer">
          {STEPS[step]?.icon}
        </div>
        <h1 className="calculating__title">Analyzing your responses…</h1>
        <p className="calculating__step">{STEPS[step]?.text}</p>

        <div className="calculating__bar-wrap">
          <div className="calculating__bar">
            <div className="calculating__fill" style={{ width: `${pct}%` }} />
          </div>
          <span className="calculating__pct">{pct}%</span>
        </div>

        <p className="calculating__note">Comparing with 2,000 real patient records</p>
      </div>
    </div>
  );
}
