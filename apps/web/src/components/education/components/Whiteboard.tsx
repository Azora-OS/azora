/*
AZORA PROPRIETARY LICENSE
Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

WHITEBOARD COMPONENT
Student drawing canvas for visual learning and problem-solving
*/

import React, { useRef, useState, useEffect } from 'react';
import { Pencil, Square, Circle, Type, Eraser, Trash2, Download, Grid3x3, Minus } from 'lucide-react';

export function Whiteboard() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [tool, setTool] = useState<'pen' | 'eraser'>('pen');
    const [color, setColor] = useState('#3B82F6');
    const [lineWidth, setLineWidth] = useState(3);
    const [showGrid, setShowGrid] = useState(false);

    const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#000000', '#FFFFFF'];

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;

        // White background
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        if (showGrid) {
            drawGrid(ctx, canvas.width, canvas.height);
        }
    }, [showGrid]);

    const drawGrid = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
        ctx.strokeStyle = '#E5E7EB';
        ctx.lineWidth = 1;

        const gridSize = 20;
        for (let x = 0; x <= width; x += gridSize) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, height);
            ctx.stroke();
        }

        for (let y = 0; y <= height; y += gridSize) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(width, y);
            ctx.stroke();
        }
    };

    const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
        setIsDrawing(true);
        draw(e);
    };

    const stopDrawing = () => {
        setIsDrawing(false);
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        ctx.beginPath();
    };

    const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
        if (!isDrawing && e.type !== 'mousedown') return;

        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        if (tool === 'pen') {
            ctx.strokeStyle = color;
            ctx.lineWidth = lineWidth;
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
            ctx.lineTo(x, y);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(x, y);
        } else if (tool === 'eraser') {
            ctx.clearRect(x - lineWidth, y - lineWidth, lineWidth * 2, lineWidth * 2);
        }
    };

    const clearCanvas = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        if (showGrid) {
            drawGrid(ctx, canvas.width, canvas.height);
        }
    };

    const downloadCanvas = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const link = document.createElement('a');
        link.download = 'whiteboard.png';
        link.href = canvas.toDataURL();
        link.click();
    };

    return (
        <div className="flex flex-col h-full bg-white rounded-xl overflow-hidden">
            {/* Toolbar */}
            <div className="bg-gray-100 p-3 border-b border-gray-200 flex items-center gap-4 flex-wrap">
                {/* Tools */}
                <div className="flex gap-2">
                    <button
                        onClick={() => setTool('pen')}
                        className={`p-2 rounded-lg transition-all ${tool === 'pen'
                                ? 'bg-blue-600 text-white'
                                : 'bg-white text-gray-600 hover:bg-gray-200'
                            }`}
                    >
                        <Pencil className="w-5 h-5" />
                    </button>
                    <button
                        onClick={() => setTool('eraser')}
                        className={`p-2 rounded-lg transition-all ${tool === 'eraser'
                                ? 'bg-blue-600 text-white'
                                : 'bg-white text-gray-600 hover:bg-gray-200'
                            }`}
                    >
                        <Eraser className="w-5 h-5" />
                    </button>
                    <button
                        onClick={() => setShowGrid(!showGrid)}
                        className={`p-2 rounded-lg transition-all ${showGrid
                                ? 'bg-blue-600 text-white'
                                : 'bg-white text-gray-600 hover:bg-gray-200'
                            }`}
                    >
                        <Grid3x3 className="w-5 h-5" />
                    </button>
                </div>

                {/* Colors */}
                <div className="flex gap-2">
                    {colors.map((c) => (
                        <button
                            key={c}
                            onClick={() => setColor(c)}
                            className={`w-8 h-8 rounded-full border-2 transition-all ${color === c ? 'border-blue-600 scale-110' : 'border-gray-300'
                                }`}
                            style={{ backgroundColor: c }}
                        />
                    ))}
                </div>

                {/* Line Width */}
                <div className="flex items-center gap-2">
                    <Minus className="w-4 h-4 text-gray-600" />
                    <input
                        type="range"
                        min="1"
                        max="20"
                        value={lineWidth}
                        onChange={(e) => setLineWidth(Number(e.target.value))}
                        className="w-24"
                    />
                    <span className="text-sm text-gray-600 w-6">{lineWidth}</span>
                </div>

                {/* Actions */}
                <div className="flex gap-2 ml-auto">
                    <button
                        onClick={clearCanvas}
                        className="px-3 py-2 bg-red-100 hover:bg-red-200 text-red-600 rounded-lg transition-all flex items-center gap-2"
                    >
                        <Trash2 className="w-4 h-4" />
                        Clear
                    </button>
                    <button
                        onClick={downloadCanvas}
                        className="px-3 py-2 bg-blue-100 hover:bg-blue-200 text-blue-600 rounded-lg transition-all flex items-center gap-2"
                    >
                        <Download className="w-4 h-4" />
                        Save
                    </button>
                </div>
            </div>

            {/* Canvas */}
            <div className="flex-1 overflow-hidden">
                <canvas
                    ref={canvasRef}
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={stopDrawing}
                    onMouseLeave={stopDrawing}
                    className="w-full h-full cursor-crosshair"
                    style={{ touchAction: 'none' }}
                />
            </div>
        </div>
    );
}
