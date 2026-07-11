import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Btn } from '../components/ui';
import './WelcomePage.css';

const SLIDES = [
  {
    emoji: '🎯',
    title: 'Your brain works\ndifferently.',
    body: 'A few quick questions, and you\'ll get a clear picture of your focus patterns — powered by AI.',
    color: '#6C5CE7',
    light: '#F0EEFF',
    btn: 'Next',
    btnVariant: 'primary',
  },
  {
    emoji: '⚡',
    title: 'One task.\nOne moment.',
    body: 'No overwhelming lists. No guilt. Just one thing at a time — designed for how ADHD brains actually work best.',
    color: '#00B37D',
    light: '#E8F8F2',
    btn: 'Next',
    btnVariant: 'green',
  },
  {
    emoji: '🏆',
    title: 'Every small win\ncounts.',
    body: 'Streaks, XP, and badges that fire your dopamine system. Progress is motivation. Motivation is everything.',
    color: '#FF8C00',
    light: '#FFF3E8',
    btn: 'Take the Assessment',
    btnVariant: 'orange',
  },
];

export default function WelcomePage() {
  const navigate = useNavigate();
  const [slide, setSlide] = useState(0);
  const s = SLIDES[slide];

  const handleNext = () => {
    if (slide < SLIDES.length - 1) setSlide(slide + 1);
    else navigate('/auth');
  };

  return (
    <div className="welcome" style={{ '--slide-color': s.color, '--slide-light': s.light }}>
      <button className="welcome__skip" onClick={() => navigate('/auth')}>Skip</button>

      <div className="welcome__body">
        <div className="welcome__emoji">{s.emoji}</div>
        <h1 className="welcome__title" style={{ whiteSpace: 'pre-line' }}>{s.title}</h1>
        <p className="welcome__body-text">{s.body}</p>

        {/* Dots */}
        <div className="welcome__dots">
          {SLIDES.map((_, i) => (
            <div key={i}
              className={`welcome__dot ${i === slide ? 'active' : ''}`}
              style={i === slide ? { background: s.color } : {}}
              onClick={() => setSlide(i)}
            />
          ))}
        </div>
      </div>

      <div className="welcome__footer">
        <Btn variant={s.btnVariant} onClick={handleNext}>{s.btn} →</Btn>
        {slide === 0 && (
          <button className="welcome__login" onClick={() => navigate('/auth?mode=login')}>
            I already have an account
          </button>
        )}
      </div>
    </div>
  );
}
