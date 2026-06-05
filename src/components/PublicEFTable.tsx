import React from 'react';
import type { PublicEFItem } from '../types/evaluation';

interface PublicEFTableProps {
  items: PublicEFItem[];
}

const PublicEFTable: React.FC<PublicEFTableProps> = ({ items }) => {
  const publicItems = items.filter(item => item.isPublic);
  const internalItems = items.filter(item => !item.isPublic);

  return (
    <div className="public-ef-table">
      <h3>🌐 Emission Factors Analysis</h3>
      <p>Inputs with assigned emission factors, categorized by source (Public vs Internal)</p>

      {items.length === 0 ? (
        <div className="no-data">
          <p>No inputs with emission factors found</p>
        </div>
      ) : (
        <div className="table-container">
          <div className="ef-summary-stats">
            <div className="stat-badge public">
              <strong>{publicItems.length}</strong> Public EFs
            </div>
            <div className="stat-badge internal">
              <strong>{internalItems.length}</strong> Internal EFs
            </div>
            <div className="stat-badge total">
              <strong>{items.length}</strong> Total EFs
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th>Source</th>
                <th>Process</th>
                <th>Input Title</th>
                <th>Input ID</th>
                <th>Reference Library ID</th>
                <th>Input Type</th>
                <th>Carbon Intensity</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, idx) => (
                <tr key={idx} className={item.isPublic ? 'public-ef' : 'internal-ef'}>
                  <td>
                    <span className={`ef-source-badge ${item.isPublic ? 'public' : 'internal'}`}>
                      {item.isPublic ? '🌐 Public' : '🔒 Internal'}
                    </span>
                  </td>
                  <td>
                    <strong>{item.processTitle}</strong>
                    <br />
                    <small>ID: {item.processId}</small>
                  </td>
                  <td>{item.inputTitle}</td>
                  <td>{item.inputId}</td>
                  <td>
                    <span className="ref-lib-id">
                      {item.referenceLibraryId || 'N/A'}
                    </span>
                  </td>
                  <td>
                    <span className={`input-type-badge ${item.inputType ? 'has-type' : 'no-type'}`}>
                      {item.inputType || 'Not specified'}
                    </span>
                  </td>
                  <td>
                    {item.carbonIntensity !== null
                      ? item.carbonIntensity.toFixed(6)
                      : 'N/A'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="table-summary">
            <p>
              <strong>🌐 Public EFs ({publicItems.length}):</strong> Emission factors NOT found in the internal database (IDs 234-139276)
            </p>
            <p>
              <strong>🔒 Internal EFs ({internalItems.length}):</strong> Emission factors from the internal reference library
            </p>
            <p>
              <em>Note: Public EFs are identified by checking if their referenceLibraryId is NOT in the internal database</em>
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default PublicEFTable;
