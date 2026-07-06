import './ui.css';

export const Btn = ({ children, variant = 'primary', size = 'md', onClick, disabled, fullWidth = true, style }) => (
  <button
    className={`ui-btn ui-btn--${variant} ui-btn--${size} ${fullWidth ? 'ui-btn--full' : ''}`}
    onClick={onClick} disabled={disabled} style={style}
  >
    {children}
  </button>
);

export const Card = ({ children, className = '', style, onClick }) => (
  <div className={`ui-card ${className}`} style={style} onClick={onClick}>{children}</div>
);

export const Inp = ({ label, error, ...props }) => (
  <div className="ui-field">
    {label && <label className="ui-field__label">{label}</label>}
    <input className={`ui-field__input ${error ? 'ui-field__input--err' : ''}`} {...props} />
    {error && <span className="ui-field__error">{error}</span>}
  </div>
);

export const ProgBar = ({ value, color = 'var(--p500)', height = 8, animated = true }) => (
  <div className="ui-prog">
    <div className={`ui-prog__fill ${animated ? 'ui-prog__fill--anim' : ''}`}
      style={{ width: `${Math.max(0, Math.min(100, value))}%`, background: color, height }} />
  </div>
);

export const Badge = ({ children, variant = 'purple' }) => (
  <span className={`ui-badge ui-badge--${variant}`}>{children}</span>
);

export const StepBar = ({ current, total }) => (
  <div className="ui-stepbar">
    {Array.from({ length: total }).map((_, i) => (
      <div key={i} className={`ui-stepbar__seg ${i < current ? 'done' : i === current ? 'active' : ''}`} />
    ))}
  </div>
);

export const BackHeader = ({ onBack, title, right }) => (
  <div className="ui-header">
    <button className="ui-header__back" onClick={onBack}>
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
        <path d="M19 12H5M12 5l-7 7 7 7" />
      </svg>
    </button>
    {title && <span className="ui-header__title">{title}</span>}
    {right && <div className="ui-header__right">{right}</div>}
  </div>
);

export const BottomNav = ({ active, onNavigate }) => {
  const items = [
    { id: 'home',     path: '/home',     label: 'Home',    icon: '🏠' },
    { id: 'tasks',    path: '/tasks',    label: 'Tasks',   icon: '✅' },
    { id: 'focus',    path: '/focus',    label: 'Focus',   icon: '⚡' },
    { id: 'progress', path: '/progress', label: 'Progress',icon: '📊' },
    { id: 'profile',  path: '/profile',  label: 'Profile', icon: '👤' },
  ];
  return (
    <nav className="ui-bnav">
      {items.map(item => (
        <button key={item.id}
          className={`ui-bnav__item ${active === item.id ? 'active' : ''}`}
          onClick={() => onNavigate(item.path || item.id)}
        >
          <span className="ui-bnav__icon">{item.icon}</span>
          <span className="ui-bnav__label">{item.label}</span>
        </button>
      ))}
    </nav>
  );
};

export const Toast = ({ message, visible }) => (
  <div className={`ui-toast ${visible ? 'ui-toast--show' : ''}`}>{message}</div>
);

export const ScoreRing = ({ score, size = 160 }) => {
  const r = (size / 2) - 12;
  const circ = 2 * Math.PI * r;
  const offset = circ * (1 - score / 100);
  const color = score >= 70 ? '#FF5C5C' : score >= 60 ? '#FF8C00' : score >= 45 ? '#6C5CE7' : '#00B37D';

  return (
    <div className="ui-ring" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="var(--surf3)" strokeWidth="10" />
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth="10"
          strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
          transform={`rotate(-90 ${size/2} ${size/2})`}
          style={{ transition: 'stroke-dashoffset 1.4s cubic-bezier(.16,1,.3,1)' }} />
      </svg>
      <div className="ui-ring__label">
        <span className="ui-ring__score" style={{ color }}>{score}%</span>
        <span className="ui-ring__sub">ADHD Risk</span>
      </div>
    </div>
  );
};

export const MoodPicker = ({ value, onChange }) => {
  const moods = [
    { val: 1, emoji: '😫', label: 'Awful' },
    { val: 2, emoji: '😔', label: 'Low' },
    { val: 3, emoji: '😐', label: 'Okay' },
    { val: 4, emoji: '😊', label: 'Good' },
    { val: 5, emoji: '🤩', label: 'Great' },
  ];
  return (
    <div className="ui-mood">
      {moods.map(m => (
        <button key={m.val}
          className={`ui-mood__chip ${value === m.val ? 'active' : ''}`}
          onClick={() => onChange(m.val)}
        >
          <span>{m.emoji}</span>
          <span>{m.label}</span>
        </button>
      ))}
    </div>
  );
};
