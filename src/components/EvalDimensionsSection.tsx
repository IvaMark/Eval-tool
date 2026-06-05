import React from 'react';
import type { EvalDimension } from '../types/evaluation';

interface EvalDimensionsSectionProps {
  dimensions: EvalDimension[];
}

const EvalDimensionsSection: React.FC<EvalDimensionsSectionProps> = ({ dimensions }) => {
  const getScoreColor = (score: number): string => {
    if (score >= 4) return '#4CAF50';
    if (score >= 3) return '#FFC107';
    return '#f44336';
  };

  return (
    <div className="eval-dimensions-section">
      <h3>📋 Evaluation Dimensions (D1-D8)</h3>
      <p className="section-description">
        Each dimension is scored 1-5 (1 = Fail, 3 = Acceptable, 5 = Excellent)
      </p>

      <div className="dimensions-list">
        {dimensions.map((dim) => (
          <div key={dim.code} className={`dimension-card ${dim.passed ? 'passed' : 'failed'}`}>
            <div className="dimension-header">
              <div className="dimension-title">
                <span className="dimension-code">{dim.code}</span>
                <span className="dimension-name">{dim.dimension}</span>
              </div>
              <div className="dimension-score">
                <div
                  className="score-circle"
                  style={{ backgroundColor: getScoreColor(dim.actualScore) }}
                >
                  {dim.actualScore}
                </div>
                <span className="score-target">/ {dim.targetScore}</span>
                <span className={`score-status ${dim.passed ? 'passed' : 'failed'}`}>
                  {dim.passed ? '✓' : '✗'}
                </span>
              </div>
            </div>

            <div className="dimension-description">
              <em>{dim.description}</em>
            </div>

            <div className="dimension-details">
              <strong>Details:</strong>
              <pre>{dim.details}</pre>
            </div>
          </div>
        ))}
      </div>

      <div className="thresholds-info">
        <h4>Minimum Acceptance Thresholds</h4>
        <ul>
          <li>D1-D5 must all score ≥ 3 to be production-ready</li>
          <li>D1 (Format) must score 5 for JSON consumed by API</li>
          <li>D7 (Hallucination) must score ≥ 4 for emissions data</li>
        </ul>
      </div>
    </div>
  );
};

export default EvalDimensionsSection;
