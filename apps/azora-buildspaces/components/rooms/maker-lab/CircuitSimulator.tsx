"use client";

import { useState, useCallback } from 'react';
import ReactFlow, {
    MiniMap,
    Controls,
    Background,
    useNodesState,
    useEdgesState,
    addEdge,
    Connection,
    Edge,
    Node,
    BackgroundVariant,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Play, RotateCcw } from "lucide-react";

// Custom node types could be defined here
const initialNodes: Node[] = [
    { id: '1', position: { x: 100, y: 100 }, data: { label: 'ESP32 Microcontroller' }, type: 'input' },
    { id: '2', position: { x: 400, y: 100 }, data: { label: 'LED Matrix' } },
    { id: '3', position: { x: 250, y: 250 }, data: { label: 'Temp Sensor' } },
];

const initialEdges: Edge[] = [
    { id: 'e1-2', source: '1', target: '2', animated: true },
];

export default function CircuitSimulator() {
    const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
    const [isSimulating, setIsSimulating] = useState(false);

    const onConnect = useCallback(
        (params: Connection) => setEdges((eds) => addEdge(params, eds)),
        [setEdges],
    );

    const toggleSimulation = () => {
        setIsSimulating(!isSimulating);
        // Here we would trigger the actual circuit logic simulation
    };

    return (
        <div className="h-full flex flex-col">
            <div className="p-2 border-b flex items-center justify-between bg-card">
                <div className="flex items-center gap-2">
                    <Button size="sm" variant={isSimulating ? "destructive" : "default"} onClick={toggleSimulation} className="gap-2">
                        {isSimulating ? <RotateCcw className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                        {isSimulating ? "Stop Simulation" : "Simulate Circuit"}
                    </Button>
                </div>
                <div className="flex items-center gap-2">
                    <Button size="sm" variant="outline" className="gap-2">
                        <Plus className="w-4 h-4" />
                        Add Component
                    </Button>
                </div>
            </div>

            <div className="flex-1 bg-background relative">
                <ReactFlow
                    nodes={nodes}
                    edges={edges}
                    onNodesChange={onNodesChange}
                    onEdgesChange={onEdgesChange}
                    onConnect={onConnect}
                    fitView
                    className="bg-slate-50 dark:bg-slate-900"
                >
                    <Controls />
                    <MiniMap />
                    <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
                </ReactFlow>

                {isSimulating && (
                    <Card className="absolute bottom-4 right-4 p-4 w-64 bg-background/90 backdrop-blur border-green-500/50">
                        <div className="flex items-center gap-2 text-green-500 mb-2">
                            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                            <span className="font-semibold text-sm">Simulation Active</span>
                        </div>
                        <div className="space-y-1 text-xs font-mono">
                            <div className="flex justify-between">
                                <span>Voltage:</span>
                                <span>3.3V</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Current:</span>
                                <span>120mA</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Uptime:</span>
                                <span>00:00:12</span>
                            </div>
                        </div>
                    </Card>
                )}
            </div>
        </div>
    );
}
