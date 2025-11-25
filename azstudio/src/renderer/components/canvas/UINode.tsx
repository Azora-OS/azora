import React from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import './UINode.css';

export interface UINodeData {
  label: string;
  type: 'page' | 'component' | 'layout' | 'modal';
  framework?: 'react' | 'next' | 'vue';
  route?: string;
}

const UINode: React.FC<NodeProps<UINodeData>> = ({ data, selected }) => {
  const getIcon = (type: string): string => {
    switch (type) {
      case 'page': return '📄';
      case 'component': return '🧩';
      case 'layout': return '📐';
      case 'modal': return '🪟';
      default: return '🎨';
    }
  };

  return (
    <div className={`ui-node ${selected ? 'selected' : ''}`}>
      <Handle type="target" position={Position.Top} className="node-handle" />
      
      <div className="ui-node-header">
        <span className="ui-icon">{getIcon(data.type)}</span>
        <span className="ui-label">{data.label}</span>
      </div>
      
      <div className="ui-node-body">
        <div className="ui-type">{data.type}</div>
        {data.route && (
          <div className="ui-route">{data.route}</div>
        )}
        {data.framework && (
          <div className="ui-framework">{data.framework}</div>
        )}
      </div>
      
      <Handle type="source" position={Position.Bottom} className="node-handle" />
    </div>
  );
};

export default UINode;
