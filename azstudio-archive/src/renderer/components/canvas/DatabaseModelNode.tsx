import React, { useState } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import './DatabaseModelNode.css';

export interface DatabaseModelData {
  name: string;
  fields: ModelField[];
  onUpdate?: (data: DatabaseModelData) => void;
  onDelete?: () => void;
}

export interface ModelField {
  id: string;
  name: string;
  type: 'String' | 'Int' | 'Boolean' | 'DateTime' | 'Float' | 'Json';
  required: boolean;
  unique?: boolean;
  default?: string;
  isPrimaryKey?: boolean;
}

const DatabaseModelNode: React.FC<NodeProps<DatabaseModelData>> = ({ data, selected }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [modelName, setModelName] = useState(data.name);
  const [fields, setFields] = useState<ModelField[]>(data.fields);

  const handleAddField = () => {
    const newField: ModelField = {
      id: `field_${Date.now()}`,
      name: 'newField',
      type: 'String',
      required: false,
    };
    const updatedFields = [...fields, newField];
    setFields(updatedFields);
    data.onUpdate?.({ ...data, fields: updatedFields });
  };

  const handleUpdateField = (fieldId: string, updates: Partial<ModelField>) => {
    const updatedFields = fields.map(f => 
      f.id === fieldId ? { ...f, ...updates } : f
    );
    setFields(updatedFields);
    data.onUpdate?.({ ...data, fields: updatedFields });
  };

  const handleDeleteField = (fieldId: string) => {
    const updatedFields = fields.filter(f => f.id !== fieldId);
    setFields(updatedFields);
    data.onUpdate?.({ ...data, fields: updatedFields });
  };

  const handleNameChange = (newName: string) => {
    setModelName(newName);
    data.onUpdate?.({ ...data, name: newName });
  };

  return (
    <div className={`database-model-node ${selected ? 'selected' : ''}`}>
      <Handle type="target" position={Position.Left} className="model-handle" />
      
      <div className="model-header">
        {isEditing ? (
          <input
            type="text"
            value={modelName}
            onChange={(e) => handleNameChange(e.target.value)}
            onBlur={() => setIsEditing(false)}
            autoFocus
            className="model-name-input"
          />
        ) : (
          <h3 onClick={() => setIsEditing(true)} className="model-name">
            {modelName}
          </h3>
        )}
        <button onClick={data.onDelete} className="delete-model-btn" title="Delete model">
          ×
        </button>
      </div>

      <div className="model-fields">
        {fields.map((field) => (
          <div key={field.id} className="model-field">
            <input
              type="text"
              value={field.name}
              onChange={(e) => handleUpdateField(field.id, { name: e.target.value })}
              className="field-name-input"
              placeholder="Field name"
            />
            <select
              value={field.type}
              onChange={(e) => handleUpdateField(field.id, { type: e.target.value as any })}
              className="field-type-select"
            >
              <option value="String">String</option>
              <option value="Int">Int</option>
              <option value="Boolean">Boolean</option>
              <option value="DateTime">DateTime</option>
              <option value="Float">Float</option>
              <option value="Json">Json</option>
            </select>
            <label className="field-checkbox">
              <input
                type="checkbox"
                checked={field.required}
                onChange={(e) => handleUpdateField(field.id, { required: e.target.checked })}
              />
              <span title="Required">!</span>
            </label>
            <label className="field-checkbox">
              <input
                type="checkbox"
                checked={field.unique || false}
                onChange={(e) => handleUpdateField(field.id, { unique: e.target.checked })}
              />
              <span title="Unique">U</span>
            </label>
            <button
              onClick={() => handleDeleteField(field.id)}
              className="delete-field-btn"
              title="Delete field"
            >
              −
            </button>
          </div>
        ))}
      </div>

      <button onClick={handleAddField} className="add-field-btn">
        + Add Field
      </button>

      <Handle type="source" position={Position.Right} className="model-handle" />
    </div>
  );
};

export default DatabaseModelNode;
