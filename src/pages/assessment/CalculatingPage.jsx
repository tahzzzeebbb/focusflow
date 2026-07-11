import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import './CalculatingPage.css';

const STEPS = [
  { icon:'📊', text:'Looking at your answers…' },
  { icon:'🧠', text:'Thinking about focus & attention…' },
  { icon:'⚡', text:'Thinking about energy & restlessness…' },
  { icon:'💭', text:'Thinking about impulse control…' },
  { icon:'🧩', text:'Putting it all together…' },
  { icon:'📋', text:'Comparing with similar people…' },
  { icon:'✅', text:'Almost done…' },
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
