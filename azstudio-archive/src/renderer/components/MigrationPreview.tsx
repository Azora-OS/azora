import React, { useState } from 'react';
import './MigrationPreview.css';

interface MigrationPreviewProps {
  migrationSQL: string;
  onExecute: (migrationName: string) => void;
  onClose: () => void;
}

const MigrationPreview: React.FC<MigrationPreviewProps> = ({ migrationSQL, onExecute, onClose }) => {
  const [migrationName, setMigrationName] = useState('');
  const [isExecuting, setIsExecuting] = useState(false);

  const handleExecute = async () => {
    if (!migrationName.trim()) {
      alert('Please enter a migration name');
      return;
    }

    setIsExecuting(true);
    try {
      await onExecute(migrationName);
      onClose();
    } catch (error) {
      console.error('Migration execution failed:', error);
      alert('Migration execution failed. Check console for details.');
    } finally {
      setIsExecuting(false);
    }
  };

  return (
    <div className="migration-preview-overlay" onClick={onClose}>
      <div className="migration-preview" onClick={(e) => e.stopPropagation()}>
        <div className="preview-header">
          <h3>Migration Preview</h3>
          <button onClick={onClose} className="close-btn">×</button>
        </div>

        <div className="preview-body">
          <div className="form-group">
            <label>Migration Name</label>
            <input
              type="text"
              value={migrationName}
              onChange={(e) => setMigrationName(e.target.value)}
              placeholder="e.g., add_user_posts"
              className="form-input"
              disabled={isExecuting}
            />
            <small className="form-hint">
              A descriptive name for this migration (use snake_case)
            </small>
          </div>

          <div className="sql-preview">
            <div className="sql-header">
              <span className="sql-label">SQL Preview</span>
              <button
                onClick={() => navigator.clipboard.writeText(migrationSQL)}
                className="copy-btn"
                title="Copy SQL"
              >
                Copy
              </button>
            </div>
            <pre className="sql-code">
              <code>{migrationSQL}</code>
            </pre>
          </div>

          <div className="warning-box">
            <div className="warning-icon">⚠️</div>
            <div className="warning-content">
              <strong>Warning:</strong> This will modify your database schema. Make sure you have a backup
              before proceeding. Review the SQL carefully to ensure it matches your expectations.
            </div>
          </div>
        </div>

        <div className="preview-footer">
          <button onClick={onClose} className="btn-secondary" disabled={isExecuting}>
            Cancel
          </button>
          <button onClick={handleExecute} className="btn-primary" disabled={isExecuting}>
            {isExecuting ? 'Executing...' : 'Execute Migration'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default MigrationPreview;
