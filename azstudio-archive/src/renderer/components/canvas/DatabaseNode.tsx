import React from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import './DatabaseNode.css';

export interface DatabaseNodeData {
  label: string;
  type: 'postgresql' | 'mysql' | 'mongodb' | 'redis' | 'sqlite';
  tables?: number;
  size?: string;
}

const DatabaseNode: React.FC<NodeProps<DatabaseNodeData>> = ({ data, selected }) => {
  const getIcon = (type: string): string => {
    switch (type) {
      case 'postgresql': return '🐘';
      case 'mysql': return '🐬';
      case 'mongodb': return '🍃';
      case 'redis': return '⚡';
      case 'sqlite': return '💾';
      default: return '🗄️';
    }
  };

  return (
    <div className={`database-node ${selected ? 'selected' : ''}`}>
      <Handle type="target" position={Position.Top} className="node-handle" />
      
      <div className="database-node-header">
        <span className="database-icon">{getIcon(data.type)}</span>
        <span className="database-label">{data.label}</span>
      </div>
      
      <div className="database-node-body">
        <div className="database-type">{data.type}</div>
        {data.tables !== undefined && (
          <div className="database-info">{data.tables} tables</div>
        )}
        {data.size && (
          <div className="database-info">{data.size}</div>
        )}
      </div>
      
      <Handle type="source" position={Position.Bottom} className="node-handle" />
    </div>
  );
};

export default DatabaseNode;
