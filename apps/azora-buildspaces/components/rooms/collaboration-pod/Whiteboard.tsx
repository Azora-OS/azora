"use client";

import { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Pen, Eraser, Square, Circle, Type, Undo, Redo, Download, Upload, Users, Palette, Minus, Plus } from "lucide-react";

const COLLABORATORS = [
    { id: 1, name: "Alice", avatar: "A", color: "#3b82f6", cursor: { x: 200, y: 150 } },
    { id: 2, name: "Bob", avatar: "B", color: "#ef4444", cursor: { x: 350, y: 200 } },
    { id: 3, name: "Carol", avatar: "C", color: "#10b981", cursor: { x: 150, y: 300 } },
];

export default function Whiteboard() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [tool, setTool] = useState<'pen' | 'eraser' | 'rectangle' | 'circle' | 'text'>('pen');
    const [color, setColor] = useState('#000000');
    const [brushSize, setBrushSize] = useState([5]);
    const [isDrawing, setIsDrawing] = useState(false);

    const tools = [
        { id: 'pen', icon: Pen, label: 'Pen' },
        { id: 'eraser', icon: Eraser, label: 'Eraser' },
        { id: 'rectangle', icon: Square, label: 'Rectangle' },
        { id: 'circle', icon: Circle, label: 'Circle' },
        { id: 'text', icon: Type, label: 'Text' },
    ];

    const colors = [
        '#000000', '#ffffff', '#ef4444', '#10b981', '#3b82f6',
        '#f59e0b', '#8b5cf6', '#ec4899', '#6b7280', '#374151'
    ];

    return (
        <div className="h-full flex flex-col bg-slate-900">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-white/10">
                <div className="flex items-center gap-4">
                    <h3 className="font-semibold text-white">Team Whiteboard</h3>
                    <Badge variant="secondary" className="bg-blue-600">3 Active</Badge>
                </div>
                <div className="flex items-center gap-2">
                    <div className="flex -space-x-2">
                        {COLLABORATORS.map((user) => (
                            <Avatar key={user.id} className="w-8 h-8 border-2 border-slate-800">
                                <AvatarFallback className="text-xs" style={{ backgroundColor: user.color }}>
                                    {user.avatar}
                                </AvatarFallback>
                            </Avatar>
                        ))}
                    </div>
                    <Button variant="outline" size="sm">
                        <Users className="w-4 h-4 mr-2" />
                        Invite
                    </Button>
                </div>
            </div>

            {/* Toolbar */}
            <div className="flex items-center gap-4 p-4 border-b border-white/10 bg-slate-800/50">
                {/* Tools */}
                <div className="flex gap-1">
                    {tools.map((t) => (
                        <Button
                            key={t.id}
                            variant={tool === t.id ? "default" : "outline"}
                            size="sm"
                            onClick={() => setTool(t.id as any)}
                            className="w-10 h-10 p-0"
                        >
                            <t.icon className="w-4 h-4" />
                        </Button>
                    ))}
                </div>

                {/* Colors */}
                <div className="flex gap-1">
                    {colors.map((c) => (
                        <button
                            key={c}
                            className={`w-8 h-8 rounded border-2 ${color === c ? 'border-white' : 'border-slate-600'}`}
                            style={{ backgroundColor: c }}
                            onClick={() => setColor(c)}
                        />
                    ))}
                </div>

                {/* Brush Size */}
                <div className="flex items-center gap-2 min-w-32">
                    <Minus className="w-4 h-4 text-slate-400" />
                    <Slider
                        value={brushSize}
                        onValueChange={setBrushSize}
                        max={50}
                        min={1}
                        step={1}
                        className="flex-1"
                    />
                    <Plus className="w-4 h-4 text-slate-400" />
                    <span className="text-xs text-slate-400 w-8">{brushSize[0]}</span>
                </div>

                {/* Actions */}
                <div className="flex gap-1 ml-auto">
                    <Button variant="outline" size="sm">
                        <Undo className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" size="sm">
                        <Redo className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" size="sm">
                        <Download className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" size="sm">
                        <Upload className="w-4 h-4" />
                    </Button>
                </div>
            </div>

            {/* Canvas */}
            <div className="flex-1 relative bg-white overflow-hidden">
                <canvas
                    ref={canvasRef}
                    width={1200}
                    height={800}
                    className="w-full h-full cursor-crosshair"
                    style={{ maxWidth: '100%', maxHeight: '100%' }}
                />

                {/* Collaborator Cursors */}
                {COLLABORATORS.map((user) => (
                    <div
                        key={user.id}
                        className="absolute pointer-events-none z-10"
                        style={{
                            left: user.cursor.x,
                            top: user.cursor.y,
                            transform: 'translate(-2px, -2px)'
                        }}
                    >
                        <div
                            className="w-4 h-4 border-2 border-white rounded-full shadow-lg"
                            style={{ backgroundColor: user.color }}
                        />
                        <div className="absolute top-5 left-1/2 transform -translate-x-1/2 bg-slate-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                            {user.name}
                        </div>
                    </div>
                ))}

                {/* Canvas Content Placeholder */}
                <div className="absolute inset-0 flex items-center justify-center text-slate-400 pointer-events-none">
                    <div className="text-center">
                        <Palette className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p className="text-lg">Start drawing on the whiteboard</p>
                        <p className="text-sm">Collaborate in real-time with your team</p>
                    </div>
                </div>
            </div>
        </div>
    );
}