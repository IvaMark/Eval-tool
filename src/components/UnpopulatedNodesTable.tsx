import React, { useState } from 'react';
import type { UnpopulatedNode } from '../types/evaluation';

interface UnpopulatedNodesTableProps {
  nodes: UnpopulatedNode[];
}

const UnpopulatedNodesTable: React.FC<UnpopulatedNodesTableProps> = ({ nodes }) => {
  const [filter, setFilter] = useState<'all' | 'input' | 'output' | 'directEmission'>('all');

  const filteredNodes = filter === 'all' ? nodes : nodes.filter(n => n.type === filter);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'input': return '📥';
      case 'output': return '📤';
      case 'directEmission': return '🔥';
      default: return '❓';
    }
  };

  const getTypeBadgeClass = (type: string) => {
    return `type-badge type-${type}`;
  };

  return (
    <div className="unpopulated-nodes-table">
      <h3>🚫 Unpopulated Nodes</h3>
      <p>Nodes that are missing carbonIntensity or totalEmbodiedEmissions values</p>

      <div className="table-filters">
        <button
          className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
        >
          All ({nodes.length})
        </button>
        <button
          className={`filter-btn ${filter === 'input' ? 'active' : ''}`}
          onClick={() => setFilter('input')}
        >
          📥 Inputs ({nodes.filter(n => n.type === 'input').length})
        </button>
        <button
          className={`filter-btn ${filter === 'output' ? 'active' : ''}`}
          onClick={() => setFilter('output')}
        >
          📤 Outputs ({nodes.filter(n => n.type === 'output').length})
        </button>
        <button
          className={`filter-btn ${filter === 'directEmission' ? 'active' : ''}`}
          onClick={() => setFilter('directEmission')}
        >
          🔥 Direct Emissions ({nodes.filter(n => n.type === 'directEmission').length})
        </button>
      </div>

      {filteredNodes.length === 0 ? (
        <div className="no-data">
          <p>✓ No unpopulated nodes found!</p>
        </div>
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Type</th>
                <th>Process</th>
                <th>Node Title</th>
                <th>Node ID</th>
                <th>Reason</th>
              </tr>
            </thead>
            <tbody>
              {filteredNodes.map((node, idx) => (
                <tr key={idx}>
                  <td>
                    <span className={getTypeBadgeClass(node.type)}>
                      {getTypeIcon(node.type)} {node.type}
                    </span>
                  </td>
                  <td>
                    <strong>{node.processTitle}</strong>
                    <br />
                    <small>ID: {node.processId}</small>
                  </td>
                  <td>{node.nodeTitle}</td>
                  <td>{node.nodeId}</td>
                  <td className="reason-cell">{node.reason}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default UnpopulatedNodesTable;
