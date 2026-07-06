import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './SplashPage.css';

export default function SplashPage() {
  const navigate = useNavigate();
  const [progress, setProgress] = useState(0);
  const [step, setStep] = useState(0);

  const steps = ['Initializing…', 'Loading patient model…', 'Calibrating engine…', 'Ready!'];

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress(p => {
        if (p >= 100) { clearInterval(timer); return 100; }
        return p + 2;
      });
    }, 40);
    const stepTimer = setInterval(() => {
      setStep(s => Math.min(s + 1, steps.length - 1));
    }, 700);
    const nav = setTimeout(() => navigate('/welcome'), 2400);
    return () => { clearInterval(timer); clearInterval(stepTimer); clearTimeout(nav); };
  }, [navigate]);

  return (
    <div className="splash">
      <div className="splash__content">
        <div className="splash__icon animate-pulse">🧠</div>
        <h1 className="splash__title">FocusFlow</h1>
        <p className="splash__subtitle">ADHD Assessment Engine</p>
        <div className="splash__bar-wrap">
          <div className="splash__bar">
            <div className="splash__bar-fill" style={{ width: `${progress}%` }} />
          </div>
          <p className="splash__step">{steps[step]}</p>
        </div>
        <p className="splash__powered">Powered by 2,000 real patient records</p>
      </div>
    </div>
  );
}
