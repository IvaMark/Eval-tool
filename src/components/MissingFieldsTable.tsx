import React from 'react';
import type { MissingField } from '../types/evaluation';

interface MissingFieldsTableProps {
  fields: MissingField[];
}

const MissingFieldsTable: React.FC<MissingFieldsTableProps> = ({ fields }) => {
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'input': return '📥';
      case 'output': return '📤';
      case 'directEmission': return '🔥';
      default: return '❓';
    }
  };

  return (
    <div className="missing-fields-table">
      <h3>⚠️ Missing Fields</h3>
      <p>Nodes with incomplete field data</p>

      {fields.length === 0 ? (
        <div className="no-data">
          <p>✓ All nodes have complete field data!</p>
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
                <th>Missing Fields</th>
              </tr>
            </thead>
            <tbody>
              {fields.map((field, idx) => (
                <tr key={idx}>
                  <td>
                    <span className={`type-badge type-${field.type}`}>
                      {getTypeIcon(field.type)} {field.type}
                    </span>
                  </td>
                  <td>
                    <strong>{field.processTitle}</strong>
                    <br />
                    <small>ID: {field.processId}</small>
                  </td>
                  <td>{field.nodeTitle}</td>
                  <td>{field.nodeId}</td>
                  <td>
                    <div className="missing-fields-list">
                      {field.missingFields.map((mf, i) => (
                        <span key={i} className="missing-field-tag">
                          {mf}
                        </span>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default MissingFieldsTable;
