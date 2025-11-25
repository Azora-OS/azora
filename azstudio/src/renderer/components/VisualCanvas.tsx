import React, { useCallback, useState } from 'react';
import ReactFlow, {
  Node,
  Edge,
  Controls,
  Background,
  BackgroundVariant,
  MiniMap,
  addEdge,
  Connection,
  useNodesState,
  useEdgesState,
  NodeTypes,
} from 'reactflow';
import 'reactflow/dist/style.css';
import './VisualCanvas.css';

import ServiceNode from './canvas/ServiceNode';
import UINode from './canvas/UINode';
import DatabaseNode from './canvas/DatabaseNode';
import APINode from './canvas/APINode';

const nodeTypes: NodeTypes = {
  service: ServiceNode,
  ui: UINode,
  database: DatabaseNode,
  api: APINode,
};

interface VisualCanvasProps {
  onNodeSelect?: (node: Node | null) => void;
  onNodesChange?: (nodes: Node[]) => void;
}

const initialNodes: Node[] = [
  {
    id: '1',
    type: 'service',
    position: { x: 250, y: 100 },
    data: { label: 'Auth Service', type: 'auth', port: 3001, status: 'running' },
  },
  {
    id: '2',
    type: 'database',
    position: { x: 250, y: 250 },
    data: { label: 'PostgreSQL', type: 'postgresql', tables: 12, size: '2.4 GB' },
  },
  {
    id: '3',
    type: 'api',
    position: { x: 500, y: 100 },
    data: { label: 'Login', method: 'POST', path: '/api/auth/login', authenticated: false },
  },
  {
    id: '4',
    type: 'ui',
    position: { x: 750, y: 100 },
    data: { label: 'Login Page', type: 'page', framework: 'next', route: '/login' },
  },
];

const initialEdges: Edge[] = [
  { id: 'e1-2', source: '1', target: '2', animated: true },
  { id: 'e1-3', source: '1', target: '3' },
  { id: 'e3-4', source: '3', target: '4' },
];

const VisualCanvas: React.FC<VisualCanvasProps> = ({ onNodeSelect, onNodesChange }) => {
  const [nodes, , onNodesChangeInternal] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [, setSelectedNode] = useState<Node | null>(null);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const onNodeClick = useCallback(
    (_event: React.MouseEvent, node: Node) => {
      setSelectedNode(node);
      if (onNodeSelect) {
        onNodeSelect(node);
      }
    },
    [onNodeSelect]
  );

  const onPaneClick = useCallback(() => {
    setSelectedNode(null);
    if (onNodeSelect) {
      onNodeSelect(null);
    }
  }, [onNodeSelect]);

  const handleNodesChange = useCallback(
    (changes: any) => {
      onNodesChangeInternal(changes);
      if (onNodesChange) {
        onNodesChange(nodes);
      }
    },
    [onNodesChangeInternal, onNodesChange, nodes]
  );

  return (
    <div className="visual-canvas">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={handleNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={onNodeClick}
        onPaneClick={onPaneClick}
        nodeTypes={nodeTypes}
        fitView
        attributionPosition="bottom-left"
      >
        <Background variant={BackgroundVariant.Dots} gap={16} size={1} color="#3e3e42" />
        <Controls />
        <MiniMap
          nodeColor={(node) => {
            switch (node.type) {
              case 'service': return '#2d2d30';
              case 'ui': return '#667eea';
              case 'database': return '#f093fb';
              case 'api': return '#10b981';
              default: return '#6b7280';
            }
          }}
          maskColor="rgba(0, 0, 0, 0.6)"
        />
      </ReactFlow>
    </div>
  );
};

export default VisualCanvas;
