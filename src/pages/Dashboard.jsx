import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import QueryInterface from '../components/QueryInterface';
import AnalysisDashboard from '../components/AnalysisDashboard';
import ADHDGraph from '../components/ADHDGraph';
import LabTestRecommendations from '../components/LabTestRecommendations';
import StatisticsDashboard from '../components/StatisticsDashboard';
import PatientHistory from '../components/PatientHistory';
import { getTreatmentOutcomeData } from '../services/neo4j';
import './Dashboard.css';

const NAV_ITEMS = [
  { id: 'graph', label: 'Graph view', hint: 'Explore connections' },
  { id: 'query', label: 'Query', hint: 'Ask a question' },
  { id: 'analysis', label: 'Analysis', hint: 'Lab recommendations' },
  { id: 'statistics', label: 'Statistics', hint: 'Cohort breakdowns' },
  { id: 'history', label: 'My history', hint: 'Past queries' },
];

const Dashboard = () => {
  const { user, logout } = useAuth();
  const [activeView, setActiveView] = useState('graph');
  const [navOpen, setNavOpen] = useState(false);
  const [graphData, setGraphData] = useState({ nodes: [], edges: [] });
  const [graphError, setGraphError] = useState(null);
  const [queryResults, setQueryResults] = useState(null);
  const [currentQueryType, setCurrentQueryType] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadGraph = useCallback(async () => {
    setLoading(true);
    setGraphError(null);
    const data = await getTreatmentOutcomeData();
    setGraphData(data);
    if (data.error) setGraphError(data.error);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadGraph();
  }, [loadGraph]);

  const handleQueryResult = (results, queryType) => {
    setQueryResults(results);
    setCurrentQueryType(queryType);

    if (results && results.length > 0 && results[0].treatment && results[0].outcome) {
      const nodes = [];
      const edges = [];
      const nodeSet = new Set();

      results.forEach((r) => {
        if (!nodeSet.has(r.treatment)) {
          nodes.push({ data: { id: r.treatment, name: r.treatment, type: 'treatment' } });
          nodeSet.add(r.treatment);
        }
        if (!nodeSet.has(r.outcome)) {
          nodes.push({ data: { id: r.outcome, name: r.outcome, type: 'outcome' } });
          nodeSet.add(r.outcome);
        }
        edges.push({ data: { source: r.treatment, target: r.outcome } });
      });

      setGraphData({ nodes, edges, error: null });
      setGraphError(null);
    }
  };

  const selectView = (id) => {
    setActiveView(id);
    setNavOpen(false);
  };

  const renderResults = () => {
    if (!queryResults) return null;

    if (queryResults.length === 0) {
      return (
        <div className="card empty-state">
          <div className="empty-state__icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <circle cx="11" cy="11" r="7" />
              <path d="M21 21l-4.35-4.35" />
            </svg>
          </div>
          <h3>No matches for that query</h3>
          <p>Try a different phrasing, or browse the graph view to see what's available.</p>
        </div>
      );
    }

    return (
      <div className="results-section">
        <div className="results-section__header">
          <h3>{queryResults.length} {queryResults.length === 1 ? 'result' : 'results'}</h3>
        </div>
        <div className="results-table-wrap">
          <table className="results-table">
            <thead>
              <tr>
                {Object.keys(queryResults[0]).map((key) => (
                  <th key={key}>{key}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {queryResults.map((row, i) => (
                <tr key={i}>
                  {Object.values(row).map((val, j) => (
                    <td key={j}>{typeof val === 'object' ? JSON.stringify(val) : String(val)}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  return (
    <div className="dash">
      <button className="dash-mobile-toggle" onClick={() => setNavOpen(!navOpen)} aria-label="Toggle menu">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      <aside className={`dash-sidebar ${navOpen ? 'dash-sidebar--open' : ''}`}>
        <div className="dash-sidebar__brand">Cognith</div>

        <nav className="dash-sidebar__nav">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              className={`dash-nav-item ${activeView === item.id ? 'dash-nav-item--active' : ''}`}
              onClick={() => selectView(item.id)}
            >
              <span className="dash-nav-item__label">{item.label}</span>
              <span className="dash-nav-item__hint">{item.hint}</span>
            </button>
          ))}
        </nav>

        <div className="dash-sidebar__footer">
          <div className="dash-user">
            <div className="dash-user__avatar">{(user?.name || user?.email || '?')[0].toUpperCase()}</div>
            <div className="dash-user__info">
              <span className="dash-user__name">{user?.name || user?.email}</span>
              <span className="dash-user__role">{user?.role || 'Member'}</span>
            </div>
          </div>
          <button className="btn btn-ghost-on-ink btn-sm btn-block" onClick={logout}>
            Sign out
          </button>
        </div>
      </aside>

      {navOpen && <div className="dash-overlay" onClick={() => setNavOpen(false)} />}

      <main className="dash-main">
        {activeView === 'graph' && (
          <section>
            <header className="dash-view-header">
              <h1>Treatment → outcome graph</h1>
              <p>Drag any node to see what it connects to.</p>
            </header>

            {loading ? (
              <div className="card graph-skeleton">
                <div className="skeleton" style={{ height: '420px' }} />
              </div>
            ) : graphError ? (
              <div className="card empty-state">
                <div className="empty-state__icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <path d="M12 9v4M12 17h.01M10.3 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L14.7 3.86a2 2 0 00-3.4 0z" />
                  </svg>
                </div>
                <h3>Can't reach the graph database</h3>
                <p>Cognith couldn't connect to Neo4j. Check your AuraDB credentials in <code>.env</code>, then try again.</p>
                <button className="btn btn-ghost btn-sm" onClick={loadGraph}>Retry</button>
              </div>
            ) : graphData.nodes.length === 0 ? (
              <div className="card empty-state">
                <div className="empty-state__icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <circle cx="12" cy="12" r="9" />
                    <path d="M9 12h6M12 9v6" />
                  </svg>
                </div>
                <h3>The graph is empty</h3>
                <p>Connected to Neo4j, but no Treatment/Outcome data was found. Load your dataset to see it here.</p>
              </div>
            ) : (
              <div className="card card-flush">
                <ADHDGraph elements={graphData} />
              </div>
            )}
            {renderResults()}
          </section>
        )}

        {activeView === 'query' && (
          <section>
            <header className="dash-view-header">
              <h1>Ask the graph</h1>
              <p>Try "what treats inattention" or "show patients with improved focus."</p>
            </header>
            <QueryInterface onQueryResult={handleQueryResult} />
            {renderResults()}
          </section>
        )}

        {activeView === 'analysis' && (
          <section>
            <header className="dash-view-header">
              <h1>Analysis & recommendations</h1>
              <p>Lab test suggestions based on your latest query.</p>
            </header>
            <AnalysisDashboard />
            <LabTestRecommendations queryResults={queryResults} queryType={currentQueryType} />
          </section>
        )}

        {activeView === 'statistics' && (
          <section>
            <header className="dash-view-header">
              <h1>Cohort statistics</h1>
              <p>Symptom distributions and outcome rates across the dataset.</p>
            </header>
            <StatisticsDashboard />
          </section>
        )}

        {activeView === 'history' && (
          <section>
            <header className="dash-view-header">
              <h1>My history</h1>
              <p>Queries and reports you've run before.</p>
            </header>
            <PatientHistory />
          </section>
        )}

        <footer className="dash-footer">
          <span>Sources: NIMH · CDC · APA · Mayo Clinic</span>
          <span className={graphError ? 'dash-footer__status dash-footer__status--error' : 'dash-footer__status'}>
            <i /> {graphError ? 'Neo4j disconnected' : 'Neo4j connected'}
          </span>
        </footer>
      </main>
    </div>
  );
};

export default Dashboard;
