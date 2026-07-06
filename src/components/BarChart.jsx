import React from 'react';
import './BarChart.css';

const BarChart = ({ data, title, xLabel, yLabel, color = '#3b82f6' }) => {
    if (!data || data.length === 0) {
        return (
            <div className="bar-chart card">
                <h3>{title}</h3>
                <div className="no-data">No data available for chart</div>
            </div>
        );
    }

    const maxValue = Math.max(...data.map(d => d.value));

    return (
        <div className="bar-chart card">
            <h3>{title}</h3>
            <div className="chart-container">
                {data.map((item, idx) => (
                    <div key={idx} className="chart-bar-item">
                        <div className="chart-label" title={item.label}>
                            {item.label}
                        </div>
                        <div className="chart-bar-wrapper">
                            <div
                                className="chart-bar"
                                style={{
                                    width: `${(item.value / maxValue) * 100}%`,
                                    backgroundColor: color,
                                    height: '36px'
                                }}
                            >
                                <span className="chart-value">{item.value}{item.unit || ''}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
            <div className="chart-footer">
                <span>{xLabel}</span>
                <span>{yLabel}</span>
            </div>
        </div>
    );
};

export default BarChart;