import React from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import './APINode.css';

export interface APINodeData {
  label: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  path: string;
  authenticated?: boolean;
}

const APINode: React.FC<NodeProps<APINodeData>> = ({ data, selected }) => {
  const getMethodColor = (method: string): string => {
    switch (method) {
      case 'GET': return '#10b981';
      case 'POST': return '#3b82f6';
      case 'PUT': return '#f59e0b';
      case 'DELETE': return '#ef4444';
      case 'PATCH': return '#8b5cf6';
      default: return '#6b7280';
    }
  };

  return (
    <div className={`api-node ${selected ? 'selected' : ''}`}>
      <Handle type="target" position={Position.Top} className="node-handle" />
      
      <div className="api-node-header">
        <span 
          className="api-method" 
          style={{ backgroundColor: getMethodColor(data.method) }}
        >
          {data.method}
        </span>
        <span className="api-label">{data.label}</span>
        {data.authenticated && (
          <span className="api-auth" title="Requires authentication">🔒</span>
        )}
      </div>
      
      <div className="api-node-body">
        <div className="api-path">{data.path}</div>
      </div>
      
      <Handle type="source" position={Position.Bottom} className="node-handle" />
    </div>
  );
};

export default APINode;
