import React from 'react';
import { Edge } from 'reactflow';
import './RelationshipEditor.css';

export interface RelationshipConfig {
  type: '1:1' | '1:N' | 'N:M';
  sourceField?: string;
  targetField?: string;
  onDelete?: 'Cascade' | 'SetNull' | 'Restrict' | 'NoAction';
}

interface RelationshipEditorProps {
  edge: Edge | null;
  onUpdate: (edgeId: string, config: RelationshipConfig) => void;
  onClose: () => void;
}

const RelationshipEditor: React.FC<RelationshipEditorProps> = ({ edge, onUpdate, onClose }) => {
  if (!edge) return null;

  const currentConfig: RelationshipConfig = {
    type: (edge.label as string)?.includes('1:1') ? '1:1' : 
          (edge.label as string)?.includes('N:M') ? 'N:M' : '1:N',
    sourceField: edge.data?.sourceField || '',
    targetField: edge.data?.targetField || '',
    onDelete: edge.data?.onDelete || 'Cascade',
  };

  const [config, setConfig] = React.useState<RelationshipConfig>(currentConfig);

  const handleSave = () => {
    onUpdate(edge.id, config);
    onClose();
  };

  return (
    <div className="relationship-editor-overlay" onClick={onClose}>
      <div className="relationship-editor" onClick={(e) => e.stopPropagation()}>
        <div className="editor-header">
          <h3>Configure Relationship</h3>
          <button onClick={onClose} className="close-btn">×</button>
        </div>

        <div className="editor-body">
          <div className="form-group">
            <label>Relationship Type</label>
            <select
              value={config.type}
              onChange={(e) => setConfig({ ...config, type: e.target.value as any })}
              className="form-select"
            >
              <option value="1:1">One to One (1:1)</option>
              <option value="1:N">One to Many (1:N)</option>
              <option value="N:M">Many to Many (N:M)</option>
            </select>
            <small className="form-hint">
              {config.type === '1:1' && 'Each record relates to exactly one record in the other model'}
              {config.type === '1:N' && 'One record can relate to many records in the other model'}
              {config.type === 'N:M' && 'Many records can relate to many records (junction table)'}
            </small>
          </div>

          <div className="form-group">
            <label>Source Field Name</label>
            <input
              type="text"
              value={config.sourceField}
              onChange={(e) => setConfig({ ...config, sourceField: e.target.value })}
              placeholder="e.g., posts, author"
              className="form-input"
            />
            <small className="form-hint">Field name in the source model (optional)</small>
          </div>

          <div className="form-group">
            <label>Target Field Name</label>
            <input
              type="text"
              value={config.targetField}
              onChange={(e) => setConfig({ ...config, targetField: e.target.value })}
              placeholder="e.g., user, comments"
              className="form-input"
            />
            <small className="form-hint">Field name in the target model (optional)</small>
          </div>

          {config.type !== 'N:M' && (
            <div className="form-group">
              <label>On Delete Action</label>
              <select
                value={config.onDelete}
                onChange={(e) => setConfig({ ...config, onDelete: e.target.value as any })}
                className="form-select"
              >
                <option value="Cascade">Cascade - Delete related records</option>
                <option value="SetNull">Set Null - Set foreign key to null</option>
                <option value="Restrict">Restrict - Prevent deletion</option>
                <option value="NoAction">No Action - Database default</option>
              </select>
              <small className="form-hint">What happens when the parent record is deleted</small>
            </div>
          )}
        </div>

        <div className="editor-footer">
          <button onClick={onClose} className="btn-secondary">Cancel</button>
          <button onClick={handleSave} className="btn-primary">Save</button>
        </div>
      </div>
    </div>
  );
};

export default RelationshipEditor;
