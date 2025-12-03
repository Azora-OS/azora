import React, { useCallback, useState } from 'react';
import ReactFlow, {
  Node,
  Edge,
  Connection,
  addEdge,
  useNodesState,
  useEdgesState,
  Controls,
  Background,
  MiniMap,
  NodeTypes,
} from 'reactflow';
import 'reactflow/dist/style.css';
import DatabaseModelNode, { DatabaseModelData } from './canvas/DatabaseModelNode';
import RelationshipEditor, { RelationshipConfig } from './RelationshipEditor';
import MigrationPreview from './MigrationPreview';
import './DatabaseCanvas.css';

const nodeTypes: NodeTypes = {
  databaseModel: DatabaseModelNode,
};

interface DatabaseCanvasProps {
  onSchemaChange?: (nodes: Node<DatabaseModelData>[], edges: Edge[]) => void;
  onGenerateSchema?: () => void;
  onPreviewMigration?: () => string;
  onExecuteMigration?: (migrationName: string) => Promise<void>;
}

const DatabaseCanvas: React.FC<DatabaseCanvasProps> = ({ 
  onSchemaChange, 
  onGenerateSchema,
  onPreviewMigration,
  onExecuteMigration,
}) => {
  const [nodes, setNodes, onNodesChange] = useNodesState<DatabaseModelData>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [modelCounter, setModelCounter] = useState(1);
  const [selectedEdge, setSelectedEdge] = useState<Edge | null>(null);
  const [migrationSQL, setMigrationSQL] = useState<string | null>(null);

  const onConnect = useCallback(
    (params: Connection) => {
      const newEdge = {
        ...params,
        type: 'smoothstep',
        animated: true,
        label: '1:N',
        style: { stroke: '#3b82f6', strokeWidth: 2 },
        data: {
          type: '1:N',
          onDelete: 'Cascade',
        },
      };
      setEdges((eds) => {
        const updated = addEdge(newEdge, eds);
        onSchemaChange?.(nodes, updated);
        return updated;
      });
    },
    [nodes, onSchemaChange, setEdges]
  );

  const handleEdgeClick = useCallback((_event: React.MouseEvent, edge: Edge) => {
    setSelectedEdge(edge);
  }, []);

  const handleUpdateRelationship = useCallback(
    (edgeId: string, config: RelationshipConfig) => {
      setEdges((eds) => {
        const updated = eds.map((edge) => {
          if (edge.id === edgeId) {
            return {
              ...edge,
              label: config.type,
              data: {
                ...edge.data,
                ...config,
              },
            };
          }
          return edge;
        });
        onSchemaChange?.(nodes, updated);
        return updated;
      });
    },
    [nodes, onSchemaChange, setEdges]
  );

  const handleAddModel = () => {
    const newModel: Node<DatabaseModelData> = {
      id: `model_${Date.now()}`,
      type: 'databaseModel',
      position: { x: 100 + modelCounter * 50, y: 100 + modelCounter * 50 },
      data: {
        name: `Model${modelCounter}`,
        fields: [
          {
            id: `field_${Date.now()}_1`,
            name: 'id',
            type: 'String',
            required: true,
            isPrimaryKey: true,
          },
          {
            id: `field_${Date.now()}_2`,
            name: 'createdAt',
            type: 'DateTime',
            required: true,
          },
        ],
        onUpdate: (data: DatabaseModelData) => {
          setNodes((nds) => {
            const updated = nds.map((node) =>
              node.id === newModel.id ? { ...node, data } : node
            );
            onSchemaChange?.(updated, edges);
            return updated;
          });
        },
        onDelete: () => {
          setNodes((nds) => {
            const updated = nds.filter((node) => node.id !== newModel.id);
            onSchemaChange?.(updated, edges);
            return updated;
          });
          setEdges((eds) => {
            const updated = eds.filter(
              (edge) => edge.source !== newModel.id && edge.target !== newModel.id
            );
            return updated;
          });
        },
      },
    };

    setNodes((nds) => {
      const updated = [...nds, newModel];
      onSchemaChange?.(updated, edges);
      return updated;
    });
    setModelCounter((c) => c + 1);
  };

  const handleGenerateSchema = () => {
    onGenerateSchema?.();
  };

  const handlePreviewMigration = () => {
    if (onPreviewMigration) {
      const sql = onPreviewMigration();
      setMigrationSQL(sql);
    }
  };

  const handleExecuteMigration = async (migrationName: string) => {
    if (onExecuteMigration) {
      await onExecuteMigration(migrationName);
    }
  };

  const handleClearCanvas = () => {
    if (confirm('Are you sure you want to clear all models?')) {
      setNodes([]);
      setEdges([]);
      setModelCounter(1);
      onSchemaChange?.([], []);
    }
  };

  return (
    <div className="database-canvas-container">
      <div className="database-canvas-toolbar">
        <button onClick={handleAddModel} className="toolbar-btn primary">
          + Add Model
        </button>
        <button onClick={handleGenerateSchema} className="toolbar-btn">
          Generate Schema
        </button>
        <button onClick={handlePreviewMigration} className="toolbar-btn">
          Preview Migration
        </button>
        <button onClick={handleClearCanvas} className="toolbar-btn danger">
          Clear Canvas
        </button>
        <div className="toolbar-info">
          <span>{nodes.length} models</span>
          <span>{edges.length} relations</span>
        </div>
      </div>

      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onEdgeClick={handleEdgeClick}
        nodeTypes={nodeTypes}
        fitView
        className="database-canvas"
      >
        <Background />
        <Controls />
        <MiniMap
          nodeColor={() => '#3b82f6'}
          maskColor="rgba(0, 0, 0, 0.1)"
        />
      </ReactFlow>

      <RelationshipEditor
        edge={selectedEdge}
        onUpdate={handleUpdateRelationship}
        onClose={() => setSelectedEdge(null)}
      />

      {migrationSQL && (
        <MigrationPreview
          migrationSQL={migrationSQL}
          onExecute={handleExecuteMigration}
          onClose={() => setMigrationSQL(null)}
        />
      )}
    </div>
  );
};

export default DatabaseCanvas;
