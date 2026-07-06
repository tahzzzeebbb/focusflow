import React, { useEffect, useRef, useState } from 'react';
import cytoscape from 'cytoscape';
import './ADHDGraph.css';

// Reads CSS custom properties so Cytoscape's canvas matches the design tokens.
const cssVar = (name, fallback) => {
  if (typeof window === 'undefined') return fallback;
  const value = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return value || fallback;
};

const ADHDGraph = ({ elements }) => {
  const cyRef = useRef(null);
  const cyInstance = useRef(null);
  const [selectedNode, setSelectedNode] = useState(null);

  useEffect(() => {
    if (!elements || elements.nodes.length === 0) return;

    const colors = {
      treatment: cssVar('--node-treatment', '#D97757'),
      outcome: cssVar('--node-outcome', '#7A9B8A'),
      symptom: cssVar('--node-symptom', '#C99A4A'),
      patient: cssVar('--node-patient', '#6B85B6'),
      edge: cssVar('--paper-300', '#E9E3D8'),
      edgeFaded: cssVar('--paper-200', '#F3EFE7'),
      text: '#FFFFFF',
    };

    const cy = cytoscape({
      container: cyRef.current,
      elements,
      style: [
        {
          selector: 'node[type="treatment"]',
          style: {
            'background-color': colors.treatment,
            label: 'data(name)',
            color: colors.text,
            'text-valign': 'center',
            'text-halign': 'center',
            'text-wrap': 'wrap',
            'text-max-width': '92px',
            'font-size': '11px',
            'font-family': 'Inter, sans-serif',
            'font-weight': 600,
            width: '84px',
            height: '84px',
            shape: 'round-rectangle',
          },
        },
        {
          selector: 'node[type="outcome"]',
          style: {
            'background-color': colors.outcome,
            label: 'data(name)',
            color: colors.text,
            'text-valign': 'center',
            'text-halign': 'center',
            'text-wrap': 'wrap',
            'text-max-width': '92px',
            'font-size': '11px',
            'font-family': 'Inter, sans-serif',
            'font-weight': 600,
            width: '84px',
            height: '84px',
            shape: 'ellipse',
          },
        },
        {
          selector: 'node[type="symptom"]',
          style: {
            'background-color': colors.symptom,
            label: 'data(name)',
            color: colors.text,
            'text-valign': 'center',
            'text-halign': 'center',
            'text-wrap': 'wrap',
            'text-max-width': '88px',
            'font-size': '10px',
            'font-family': 'Inter, sans-serif',
            'font-weight': 600,
            width: '78px',
            height: '78px',
            shape: 'diamond',
          },
        },
        {
          selector: 'node[type="patient"]',
          style: {
            'background-color': colors.patient,
            label: 'data(name)',
            color: colors.text,
            'text-valign': 'center',
            'text-halign': 'center',
            'font-size': '9px',
            'font-family': 'Inter, sans-serif',
            'font-weight': 600,
            width: '62px',
            height: '62px',
            shape: 'star',
          },
        },
        {
          selector: 'edge',
          style: {
            width: 1.6,
            'line-color': colors.edge,
            'target-arrow-color': colors.edge,
            'target-arrow-shape': 'triangle',
            'arrow-scale': 0.9,
            'curve-style': 'bezier',
            opacity: 0.8,
          },
        },
        // Focus state: applied to the selected node + its direct neighborhood
        {
          selector: '.focused',
          style: {
            'border-width': 3,
            'border-color': cssVar('--signal-500', '#D97757'),
            'border-opacity': 1,
            'overlay-opacity': 0,
            'z-index': 10,
          },
        },
        {
          selector: '.dimmed',
          style: {
            opacity: 0.18,
          },
        },
      ],
      layout: {
        name: 'cose',
        animate: true,
        animationDuration: 700,
        fit: true,
        padding: 50,
        nodeRepulsion: 9000,
        idealEdgeLength: 140,
        gravity: 0.3,
      },
      minZoom: 0.3,
      maxZoom: 2.5,
    });

    cyInstance.current = cy;

    // Signature interaction: clicking a node narrows focus onto it and its
    // direct connections, dimming the rest of the graph — literalizing the
    // product's subject (selective attention) as an actual interaction
    // rather than a popup alert.
    cy.on('tap', 'node', (evt) => {
      const node = evt.target;
      const neighborhood = node.closedNeighborhood();

      cy.elements().removeClass('focused dimmed');
      cy.elements().not(neighborhood).addClass('dimmed');
      node.addClass('focused');

      setSelectedNode({ name: node.data('name'), type: node.data('type') });
    });

    cy.on('tap', (evt) => {
      if (evt.target === cy) {
        cy.elements().removeClass('focused dimmed');
        setSelectedNode(null);
      }
    });

    const settleTimer = setTimeout(() => {
      cy.fit();
      cy.center();
    }, 100);

    return () => {
      clearTimeout(settleTimer);
      cy.destroy();
    };
  }, [elements]);

  const zoomIn = () => {
    if (!cyInstance.current) return;
    cyInstance.current.zoom(cyInstance.current.zoom() * 1.2);
    cyInstance.current.center();
  };

  const zoomOut = () => {
    if (!cyInstance.current) return;
    cyInstance.current.zoom(cyInstance.current.zoom() * 0.8);
    cyInstance.current.center();
  };

  const resetView = () => {
    if (!cyInstance.current) return;
    cyInstance.current.elements().removeClass('focused dimmed');
    cyInstance.current.fit();
    cyInstance.current.center();
    setSelectedNode(null);
  };

  if (!elements || elements.nodes.length === 0) {
    return null;
  }

  return (
    <div className="graph-frame">
      <div className="graph-frame__controls">
        <button onClick={zoomIn} aria-label="Zoom in">+</button>
        <button onClick={zoomOut} aria-label="Zoom out">−</button>
        <button onClick={resetView} aria-label="Reset view" className="graph-frame__reset">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
            <path d="M3 12a9 9 0 1 1 2.6 6.4M3 12V6m0 6h6" />
          </svg>
        </button>
      </div>

      <div ref={cyRef} className="graph-frame__canvas" />

      {selectedNode && (
        <div className="graph-frame__inspector">
          <span className={`graph-frame__inspector-dot graph-frame__inspector-dot--${selectedNode.type}`} />
          <div>
            <strong>{selectedNode.name}</strong>
            <span>{selectedNode.type}</span>
          </div>
        </div>
      )}

      <div className="graph-frame__legend">
        <span><i className="legend-dot legend-dot--treatment" /> Treatment</span>
        <span><i className="legend-dot legend-dot--outcome" /> Outcome</span>
        <span><i className="legend-dot legend-dot--symptom" /> Symptom</span>
        <span><i className="legend-dot legend-dot--patient" /> Patient</span>
      </div>

      <div className="graph-frame__count">
        {elements.nodes.length} nodes · {elements.edges.length} edges
      </div>
    </div>
  );
};

export default ADHDGraph;
