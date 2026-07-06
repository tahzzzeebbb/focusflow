import React, { useEffect, useState } from 'react';
import './SplashScreen.css';

/**
 * Splash screen — the signature moment.
 *
 * Concept: scattered nodes (representing unfocused attention / noise)
 * converge into a single connected graph and resolve into the wordmark.
 * This literalizes the product's subject — ADHD is fundamentally about
 * attention moving from scattered to focused — as the actual loading
 * animation, rather than a generic spinner.
 */
const NODES = [
  { id: 1, x: 18, y: 22, type: 'treatment' },
  { id: 2, x: 78, y: 16, type: 'outcome' },
  { id: 3, x: 12, y: 70, type: 'symptom' },
  { id: 4, x: 85, y: 68, type: 'patient' },
  { id: 5, x: 50, y: 12, type: 'outcome' },
  { id: 6, x: 46, y: 86, type: 'treatment' },
];

const SplashScreen = ({ onFinished, minDurationMs = 2200 }) => {
  const [stage, setStage] = useState('scattered'); // scattered -> converging -> resolved -> exiting

  useEffect(() => {
    const t1 = setTimeout(() => setStage('converging'), 250);
    const t2 = setTimeout(() => setStage('resolved'), 1200);
    const t3 = setTimeout(() => setStage('exiting'), minDurationMs - 250);
    const t4 = setTimeout(() => onFinished?.(), minDurationMs);
    return () => [t1, t2, t3, t4].forEach(clearTimeout);
  }, [minDurationMs, onFinished]);

  return (
    <div className={`splash splash--${stage}`} role="status" aria-label="Loading Cognith">
      <div className="splash__field">
        <svg className="splash__lines" viewBox="0 0 100 100" preserveAspectRatio="none">
          {NODES.map((n, i) =>
            NODES.slice(i + 1).map((m) => (
              <line
                key={`${n.id}-${m.id}`}
                x1={n.x} y1={n.y} x2={m.x} y2={m.y}
                className="splash__edge"
              />
            ))
          )}
        </svg>
        {NODES.map((n) => (
          <span
            key={n.id}
            className={`splash__node splash__node--${n.type}`}
            style={{ left: `${n.x}%`, top: `${n.y}%` }}
          />
        ))}
        <div className="splash__core" />
      </div>

      <div className="splash__wordmark">
        <span className="splash__title">Cognith</span>
        <span className="splash__subtitle">ADHD Knowledge Graph</span>
      </div>
    </div>
  );
};

export default SplashScreen;
