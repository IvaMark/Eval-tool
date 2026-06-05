import React from 'react';
import type { NodeAnalysis } from '../types/evaluation';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';

interface NodeAnalysisSectionProps {
  nodeAnalysis: NodeAnalysis;
}

const NodeAnalysisSection: React.FC<NodeAnalysisSectionProps> = ({ nodeAnalysis }) => {
  const chartData = [
    {
      name: 'Inputs',
      Populated: nodeAnalysis.populatedInputs,
      Unpopulated: nodeAnalysis.unpopulatedInputs,
    },
    {
      name: 'Outputs',
      Populated: nodeAnalysis.populatedOutputs,
      Unpopulated: nodeAnalysis.unpopulatedOutputs,
    },
    {
      name: 'Direct Emissions',
      Populated: nodeAnalysis.populatedDirectEmissions,
      Unpopulated: nodeAnalysis.unpopulatedDirectEmissions,
    },
  ];

  const efData = [
    {
      name: 'With Public EF',
      value: nodeAnalysis.inputsWithPublicEF,
    },
    {
      name: 'Without EF',
      value: nodeAnalysis.inputsWithoutEF,
    },
  ];

  const COLORS = {
    populated: '#4CAF50',
    unpopulated: '#f44336',
    withEF: '#2196F3',
    withoutEF: '#FFC107',
  };

  return (
    <div className="node-analysis-section">
      <h3>📦 Node Analysis</h3>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-value">{nodeAnalysis.totalProcesses}</div>
          <div className="stat-label">Total Processes</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{nodeAnalysis.totalNodes}</div>
          <div className="stat-label">Total Nodes</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{nodeAnalysis.totalInputs}</div>
          <div className="stat-label">Inputs</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{nodeAnalysis.totalOutputs}</div>
          <div className="stat-label">Outputs</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{nodeAnalysis.totalDirectEmissions}</div>
          <div className="stat-label">Direct Emissions</div>
        </div>
      </div>

      <div className="charts-container">
        <div className="chart">
          <h4>Node Population Status</h4>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="Populated" fill={COLORS.populated} />
              <Bar dataKey="Unpopulated" fill={COLORS.unpopulated} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="chart">
          <h4>Public Emission Factors (Inputs)</h4>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={efData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value">
                {efData.map((_entry, index) => (
                  <Cell key={`cell-${index}`} fill={index === 0 ? COLORS.withEF : COLORS.withoutEF} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <div className="ef-stats">
            <p>
              <strong>{nodeAnalysis.inputsWithPublicEF}</strong> out of <strong>{nodeAnalysis.totalInputs}</strong> inputs have public EFs
              ({((nodeAnalysis.inputsWithPublicEF / nodeAnalysis.totalInputs) * 100).toFixed(1)}%)
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NodeAnalysisSection;
