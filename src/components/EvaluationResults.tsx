import React, { useState } from 'react';
import type { EvaluationReport } from '../types/evaluation';
import NodeAnalysisSection from './NodeAnalysisSection';
import EvalDimensionsSection from './EvalDimensionsSection';
import UnpopulatedNodesTable from './UnpopulatedNodesTable';
import MissingFieldsTable from './MissingFieldsTable';
import PublicEFTable from './PublicEFTable';
import './EvaluationResults.css';

interface EvaluationResultsProps {
  report: EvaluationReport;
}

const EvaluationResults: React.FC<EvaluationResultsProps> = ({ report }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'unpopulated' | 'missing' | 'public-ef'>('overview');

  const downloadReport = () => {
    const reportJson = JSON.stringify(report, null, 2);
    const blob = new Blob([reportJson], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `evaluation-report-${report.systemId}-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadPDF = () => {
    // Generate text report
    const lines: string[] = [];
    lines.push('═══════════════════════════════════════════════════════════');
    lines.push('   CARBONSIG BUILD WITH AI - EVALUATION REPORT');
    lines.push('═══════════════════════════════════════════════════════════');
    lines.push('');
    lines.push(`System: ${report.systemTitle}`);
    lines.push(`System ID: ${report.systemId}`);
    lines.push(`Evaluation Date: ${new Date(report.evaluationDate).toLocaleString()}`);
    lines.push('');
    lines.push(`Overall Score: ${report.overallScore}/5`);
    lines.push(`Production Ready: ${report.productionReady ? '✓ YES' : '✗ NO'}`);
    lines.push('');
    lines.push('─────────────────────────────────────────────────────────────');
    lines.push('SUMMARY');
    lines.push('─────────────────────────────────────────────────────────────');
    lines.push(report.summary);
    lines.push('');
    lines.push('─────────────────────────────────────────────────────────────');
    lines.push('NODE ANALYSIS');
    lines.push('─────────────────────────────────────────────────────────────');
    lines.push(`Total Processes: ${report.nodeAnalysis.totalProcesses}`);
    lines.push(`Total Nodes: ${report.nodeAnalysis.totalNodes}`);
    lines.push(`  - Inputs: ${report.nodeAnalysis.totalInputs} (${report.nodeAnalysis.populatedInputs} populated, ${report.nodeAnalysis.unpopulatedInputs} unpopulated)`);
    lines.push(`  - Outputs: ${report.nodeAnalysis.totalOutputs} (${report.nodeAnalysis.populatedOutputs} populated, ${report.nodeAnalysis.unpopulatedOutputs} unpopulated)`);
    lines.push(`  - Direct Emissions: ${report.nodeAnalysis.totalDirectEmissions} (${report.nodeAnalysis.populatedDirectEmissions} populated, ${report.nodeAnalysis.unpopulatedDirectEmissions} unpopulated)`);
    lines.push('');
    lines.push(`Inputs with Public EF: ${report.nodeAnalysis.inputsWithPublicEF}/${report.nodeAnalysis.totalInputs}`);
    lines.push(`Unpopulated Nodes: ${report.nodeAnalysis.unpopulatedNodesList.length}`);
    lines.push(`Nodes with Missing Fields: ${report.nodeAnalysis.missingFieldsList.length}`);
    lines.push('');
    lines.push('─────────────────────────────────────────────────────────────');
    lines.push('EVALUATION DIMENSIONS (D1-D8)');
    lines.push('─────────────────────────────────────────────────────────────');
    report.evalDimensions.forEach(dim => {
      lines.push('');
      lines.push(`${dim.code} - ${dim.dimension}`);
      lines.push(`   Score: ${dim.actualScore}/5 (Target: ${dim.targetScore}) ${dim.passed ? '✓' : '✗'}`);
      lines.push(`   ${dim.details.split('\n').join('\n   ')}`);
    });
    lines.push('');
    lines.push('─────────────────────────────────────────────────────────────');
    lines.push('RECOMMENDATIONS');
    lines.push('─────────────────────────────────────────────────────────────');
    report.recommendations.forEach((rec, idx) => {
      lines.push(`${idx + 1}. ${rec}`);
    });
    lines.push('');
    lines.push('═══════════════════════════════════════════════════════════');
    lines.push('   END OF REPORT');
    lines.push('═══════════════════════════════════════════════════════════');

    const reportText = lines.join('\n');
    const blob = new Blob([reportText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `evaluation-report-${report.systemId}-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="evaluation-results">
      <div className="results-header">
        <div className="results-title">
          <h2>📊 Evaluation Results</h2>
          <div className="system-info">
            <strong>{report.systemTitle}</strong>
            <span className="system-id">ID: {report.systemId}</span>
          </div>
        </div>

        <div className="results-actions">
          <button onClick={downloadReport} className="btn btn-secondary">
            💾 Download JSON
          </button>
          <button onClick={downloadPDF} className="btn btn-secondary">
            📄 Download Report
          </button>
        </div>
      </div>

      <div className="overall-score">
        <div className={`score-badge ${report.productionReady ? 'ready' : 'not-ready'}`}>
          <div className="score-number">{report.overallScore}</div>
          <div className="score-label">Overall Score</div>
        </div>
        <div className={`production-ready ${report.productionReady ? 'ready' : 'not-ready'}`}>
          <div className="ready-icon">{report.productionReady ? '✓' : '✗'}</div>
          <div className="ready-label">
            {report.productionReady ? 'Production Ready' : 'Not Production Ready'}
          </div>
        </div>
      </div>

      <div className="summary-section">
        <h3>Summary</h3>
        <pre>{report.summary}</pre>
      </div>

      <div className="recommendations-section">
        <h3>Recommendations</h3>
        <ul>
          {report.recommendations.map((rec, idx) => (
            <li key={idx}>{rec}</li>
          ))}
        </ul>
      </div>

      <div className="tabs">
        <button
          className={`tab ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          Overview & Dimensions
        </button>
        <button
          className={`tab ${activeTab === 'unpopulated' ? 'active' : ''}`}
          onClick={() => setActiveTab('unpopulated')}
        >
          Unpopulated Nodes ({report.nodeAnalysis.unpopulatedNodesList.length})
        </button>
        <button
          className={`tab ${activeTab === 'missing' ? 'active' : ''}`}
          onClick={() => setActiveTab('missing')}
        >
          Missing Fields ({report.nodeAnalysis.missingFieldsList.length})
        </button>
        <button
          className={`tab ${activeTab === 'public-ef' ? 'active' : ''}`}
          onClick={() => setActiveTab('public-ef')}
        >
          Public EFs ({report.nodeAnalysis.publicEFList.length})
        </button>
      </div>

      <div className="tab-content">
        {activeTab === 'overview' && (
          <>
            <NodeAnalysisSection nodeAnalysis={report.nodeAnalysis} />
            <EvalDimensionsSection dimensions={report.evalDimensions} />
          </>
        )}

        {activeTab === 'unpopulated' && (
          <UnpopulatedNodesTable nodes={report.nodeAnalysis.unpopulatedNodesList} />
        )}

        {activeTab === 'missing' && (
          <MissingFieldsTable fields={report.nodeAnalysis.missingFieldsList} />
        )}

        {activeTab === 'public-ef' && (
          <PublicEFTable items={report.nodeAnalysis.publicEFList} />
        )}
      </div>
    </div>
  );
};

export default EvaluationResults;
