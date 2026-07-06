import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Landing.css';

const FEATURES = [
  {
    label: '01',
    title: 'Trace treatment paths',
    body: 'Follow how a treatment connects to outcomes, symptoms, and patients in an interactive graph — drag any node to see what it touches.',
  },
  {
    label: '02',
    title: 'Ask in plain language',
    body: 'Query the graph the way you would ask a colleague: "what treats inattention" or "show patients with improved focus."',
  },
  {
    label: '03',
    title: 'Read the statistics',
    body: 'Symptom distributions, outcome rates, and cohort breakdowns — summarized so you can scan them in seconds, not minutes.',
  },
  {
    label: '04',
    title: 'Export a clean report',
    body: 'Turn any query result or patient history into a shareable PDF, formatted for a clinical record or a research note.',
  },
];

const Landing = () => {
  const navigate = useNavigate();

  return (
    <div className="landing">
      <nav className="landing-nav">
        <div className="landing-nav__brand">Cognith</div>
        <button className="btn btn-ghost-on-ink btn-sm" onClick={() => navigate('/login')}>
          Sign in
        </button>
      </nav>

      <header className="landing-hero">
        <div className="landing-hero__copy">
          <span className="badge badge-signal">Knowledge graph · ADHD research</span>
          <h1>
            See how ADHD treatments<br />
            actually connect to outcomes.
          </h1>
          <p className="landing-hero__lede">
            Cognith maps treatment, symptom, and outcome relationships from clinical
            literature into a graph you can explore, query, and report on —
            built for clinicians and researchers who think in connections.
          </p>
          <div className="landing-hero__actions">
            <button className="btn btn-primary btn-lg" onClick={() => navigate('/login')}>
              Get started
            </button>
            <button className="btn btn-ghost-on-ink btn-lg" onClick={() => navigate('/login')}>
              Sign in
            </button>
          </div>
        </div>

        <div className="landing-hero__graph" aria-hidden="true">
          <svg viewBox="0 0 320 320" className="hero-graph-svg">
            <line x1="70" y1="80" x2="230" y2="60" className="hero-edge" />
            <line x1="70" y1="80" x2="60" y2="220" className="hero-edge" />
            <line x1="230" y1="60" x2="250" y2="200" className="hero-edge" />
            <line x1="60" y1="220" x2="250" y2="200" className="hero-edge" />
            <line x1="60" y1="220" x2="160" y2="270" className="hero-edge" />
            <line x1="250" y1="200" x2="160" y2="270" className="hero-edge" />
            <circle cx="70" cy="80" r="9" className="hero-node hero-node--treatment" />
            <circle cx="230" cy="60" r="7" className="hero-node hero-node--outcome" />
            <circle cx="60" cy="220" r="7" className="hero-node hero-node--symptom" />
            <circle cx="250" cy="200" r="9" className="hero-node hero-node--treatment" />
            <circle cx="160" cy="270" r="7" className="hero-node hero-node--patient" />
          </svg>
          <div className="hero-graph-label">Treatment → Outcome</div>
        </div>
      </header>

      <section className="landing-features">
        <div className="landing-features__intro">
          <h2>Four ways into the data</h2>
          <p>Each view answers a different question. Switch between them without losing your place.</p>
        </div>
        <div className="landing-features__grid">
          {FEATURES.map((f) => (
            <div className="feature-card" key={f.label}>
              <span className="feature-card__label">{f.label}</span>
              <h3>{f.title}</h3>
              <p>{f.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="landing-sources">
        <p className="landing-sources__eyebrow">Reference data drawn from</p>
        <div className="landing-sources__list">
          <span>NIMH</span>
          <span>CDC</span>
          <span>APA</span>
          <span>Mayo Clinic</span>
        </div>
      </section>

      <footer className="landing-footer">
        <span>Cognith</span>
        <span>Built on Neo4j graph technology</span>
      </footer>
    </div>
  );
};

export default Landing;
