import React from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import './ServiceNode.css';

export interface ServiceNodeData {
  label: string;
  type: 'auth' | 'payment' | 'email' | 'storage' | 'database' | 'cache' | 'queue' | 'search' | 'analytics' | 'notifications' | 'custom';
  port?: number;
  status?: 'idle' | 'running' | 'error';
  config?: Record<string, any>;
}

const ServiceNode: React.FC<NodeProps<ServiceNodeData>> = ({ data, selected }) => {
  const getIcon = (type: string): string => {
    switch (type) {
      case 'auth': return '🔐';
      case 'payment': return '💳';
      case 'email': return '📧';
      case 'storage': return '📦';
      case 'database': return '🗄️';
      case 'cache': return '⚡';
      case 'queue': return '📬';
      case 'search': return '🔍';
      case 'analytics': return '📊';
      case 'notifications': return '🔔';
      default: return '⚙️';
    }
  };

  const getStatusColor = (status?: string): string => {
    switch (status) {
      case 'running': return '#4ade80';
      case 'error': return '#f87171';
      default: return '#94a3b8';
    }
  };

  return (
    <div className={`service-node ${selected ? 'selected' : ''}`}>
      <Handle type="target" position={Position.Top} className="node-handle" />
      
      <div className="service-node-header">
        <span className="service-icon">{getIcon(data.type)}</span>
        <span className="service-label">{data.label}</span>
        {data.status && (
          <span 
            className="service-status" 
            style={{ backgroundColor: getStatusColor(data.status) }}
          />
        )}
      </div>
      
      <div className="service-node-body">
        <div className="service-type">{data.type}</div>
        {data.port && (
          <div className="service-port">Port: {data.port}</div>
        )}
      </div>
      
      <Handle type="source" position={Position.Bottom} className="node-handle" />
    </div>
  );
};

export default ServiceNode;
