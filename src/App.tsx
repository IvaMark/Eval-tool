import { useState } from 'react';
import type { CarbonSigSystem } from './types/carbonsig';
import type { EvaluationReport } from './types/evaluation';
import { CarbonSigEvaluator } from './utils/evaluator';
import FileUpload from './components/FileUpload';
import EvaluationResults from './components/EvaluationResults';
import './App.css';

function App() {
  const [evaluationReport, setEvaluationReport] = useState<EvaluationReport | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleFileUpload = async (file: File) => {
    setLoading(true);
    setError(null);
    setEvaluationReport(null);

    try {
      const text = await file.text();
      const jsonData: CarbonSigSystem = JSON.parse(text);

      // Validate basic structure
      if (!jsonData.id || !jsonData.title || !jsonData.processes) {
        throw new Error('Invalid CarbonSig JSON structure. Missing required fields: id, title, or processes');
      }

      // Run evaluation
      const evaluator = new CarbonSigEvaluator(jsonData);
      const report = evaluator.evaluate();

      setEvaluationReport(report);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unknown error occurred');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>🔍 CarbonSig Build with AI</h1>
        <h2>Evaluation Tool</h2>
        <p className="subtitle">Analyze JSON outputs from Build with AI feature</p>
      </header>

      <main className="App-main">
        <FileUpload onFileUpload={handleFileUpload} loading={loading} />

        {error && (
          <div className="error-message">
            <h3>❌ Error</h3>
            <p>{error}</p>
          </div>
        )}

        {loading && (
          <div className="loading-message">
            <div className="spinner"></div>
            <p>Evaluating system...</p>
          </div>
        )}

        {evaluationReport && !loading && (
          <EvaluationResults report={evaluationReport} />
        )}
      </main>

      <footer className="App-footer">
        <p>CarbonSig Build with AI Evaluation Tool v1.0 | © 2026 CarbonMetrix</p>
      </footer>
    </div>
  );
}

export default App;
