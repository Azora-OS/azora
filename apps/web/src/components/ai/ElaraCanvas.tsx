import React, { useRef, useState, useEffect } from 'react';
import { Pencil, Eraser, Square, Circle, Type, Download, Trash2, Undo, Redo, Palette } from 'lucide-react';

interface Point {
    x: number;
    y: number;
}

interface DrawingPath {
    points: Point[];
    color: string;
    width: number;
    tool: 'pen' | 'eraser';
}

interface ElaraCanvasProps {
    onSave?: (imageData: string) => void;
    elaraDrawing?: DrawingPath[];
}

export const ElaraCanvas: React.FC<ElaraCanvasProps> = ({ onSave, elaraDrawing }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [tool, setTool] = useState<'pen' | 'eraser' | 'text'>('pen');
    const [color, setColor] = useState('#a855f7'); // Purple
    const [strokeWidth, setStrokeWidth] = useState(3);
    const [paths, setPaths] = useState<DrawingPath[]>([]);
    const [currentPath, setCurrentPath] = useState<Point[]>([]);
    const [history, setHistory] = useState<DrawingPath[][]>([]);
    const [historyStep, setHistoryStep] = useState(0);

    const colors = [
        '#a855f7', // Purple
        '#3b82f6', // Blue
        '#10b981', // Green
        '#f59e0b', // Yellow
        '#ef4444', // Red
        '#ec4899', // Pink
        '#ffffff', // White
        '#000000', // Black
    ];

    useEffect(() => {
        if (elaraDrawing && elaraDrawing.length > 0) {
            setPaths(prev => [...prev, ...elaraDrawing]);
            redraw([...paths, ...elaraDrawing]);
        }
    }, [elaraDrawing]);

    useEffect(() => {
        redraw(paths);
    }, [paths]);

    const redraw = (pathsToDraw: DrawingPath[]) => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Clear canvas
        ctx.fillStyle = '#1e293b'; // Slate background
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Draw all paths
        pathsToDraw.forEach(path => {
            if (path.points.length < 2) return;

            ctx.strokeStyle = path.color;
            ctx.lineWidth = path.width;
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';

            if (path.tool === 'eraser') {
                ctx.globalCompositeOperation = 'destination-out';
            } else {
                ctx.globalCompositeOperation = 'source-over';
            }

            ctx.beginPath();
            ctx.moveTo(path.points[0].x, path.points[0].y);

            for (let i = 1; i < path.points.length; i++) {
                ctx.lineTo(path.points[i].x, path.points[i].y);
            }

            ctx.stroke();
        });

        ctx.globalCompositeOperation = 'source-over';
    };

    const getMousePos = (e: React.MouseEvent<HTMLCanvasElement>): Point => {
        const canvas = canvasRef.current;
        if (!canvas) return { x: 0, y: 0 };

        const rect = canvas.getBoundingClientRect();
        return {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
        };
    };

    const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
        setIsDrawing(true);
        const pos = getMousePos(e);
        setCurrentPath([pos]);
    };

    const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
        if (!isDrawing) return;

        const pos = getMousePos(e);
        const newPath = [...currentPath, pos];
        setCurrentPath(newPath);

        // Draw current stroke
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');
        if (!ctx || currentPath.length === 0) return;

        ctx.strokeStyle = color;
        ctx.lineWidth = strokeWidth;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        if (tool === 'eraser') {
            ctx.globalCompositeOperation = 'destination-out';
        } else {
            ctx.globalCompositeOperation = 'source-over';
        }

        ctx.beginPath();
        const lastPoint = currentPath[currentPath.length - 1];
        ctx.moveTo(lastPoint.x, lastPoint.y);
        ctx.lineTo(pos.x, pos.y);
        ctx.stroke();
    };

    const stopDrawing = () => {
        if (isDrawing && currentPath.length > 0) {
            const newPath: DrawingPath = {
                points: currentPath,
                color,
                width: strokeWidth,
                tool: tool === 'eraser' ? 'eraser' : 'pen'
            };

            const newPaths = [...paths, newPath];
            setPaths(newPaths);

            // Update history
            const newHistory = history.slice(0, historyStep + 1);
            newHistory.push(newPaths);
            setHistory(newHistory);
            setHistoryStep(newHistory.length - 1);
        }

        setIsDrawing(false);
        setCurrentPath([]);
    };

    const undo = () => {
        if (historyStep > 0) {
            setHistoryStep(historyStep - 1);
            setPaths(history[historyStep - 1] || []);
        }
    };

    const redo = () => {
        if (historyStep < history.length - 1) {
            setHistoryStep(historyStep + 1);
            setPaths(history[historyStep + 1]);
        }
    };

    const clear = () => {
        setPaths([]);
        setHistory([[]]);
        setHistoryStep(0);
        redraw([]);
    };

    const saveCanvas = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const imageData = canvas.toDataURL('image/png');
        onSave?.(imageData);

        // Download
        const link = document.createElement('a');
        link.download = `elara-canvas-${Date.now()}.png`;
        link.href = imageData;
        link.click();
    };

    return (
        <div className="flex flex-col h-full bg-gradient-to-br from-slate-900 to-slate-800">
            {/* Toolbar */}
            <div className="flex items-center justify-between p-4 bg-black/20 border-b border-white/10">
                <div className="flex items-center gap-2">
                    {/* Drawing Tools */}
                    <button
                        onClick={() => setTool('pen')}
                        className={`p-2 rounded-lg transition-colors ${tool === 'pen' ? 'bg-purple-500 text-white' : 'bg-white/10 text-white/60 hover:bg-white/20'}`}
                        title="Pen"
                    >
                        <Pencil size={20} />
                    </button>
                    <button
                        onClick={() => setTool('eraser')}
                        className={`p-2 rounded-lg transition-colors ${tool === 'eraser' ? 'bg-purple-500 text-white' : 'bg-white/10 text-white/60 hover:bg-white/20'}`}
                        title="Eraser"
                    >
                        <Eraser size={20} />
                    </button>

                    <div className="w-px h-6 bg-white/20 mx-2" />

                    {/* Colors */}
                    <div className="flex items-center gap-1">
                        {colors.map(c => (
                            <button
                                key={c}
                                onClick={() => setColor(c)}
                                className={`w-8 h-8 rounded-lg transition-all ${color === c ? 'ring-2 ring-white scale-110' : 'hover:scale-105'}`}
                                style={{ backgroundColor: c }}
                                title={c}
                            />
                        ))}
                    </div>

                    <div className="w-px h-6 bg-white/20 mx-2" />

                    {/* Stroke Width */}
                    <div className="flex items-center gap-2">
                        <Palette size={16} className="text-white/60" />
                        <input
                            type="range"
                            min="1"
                            max="20"
                            value={strokeWidth}
                            onChange={(e) => setStrokeWidth(parseInt(e.target.value))}
                            className="w-24 h-1 bg-white/20 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-purple-500"
                        />
                        <span className="text-white/60 text-sm w-8">{strokeWidth}px</span>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    {/* History */}
                    <button
                        onClick={undo}
                        disabled={historyStep === 0}
                        className="p-2 rounded-lg bg-white/10 text-white/60 hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                        title="Undo"
                    >
                        <Undo size={20} />
                    </button>
                    <button
                        onClick={redo}
                        disabled={historyStep >= history.length - 1}
                        className="p-2 rounded-lg bg-white/10 text-white/60 hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                        title="Redo"
                    >
                        <Redo size={20} />
                    </button>

                    <div className="w-px h-6 bg-white/20 mx-2" />

                    {/* Actions */}
                    <button
                        onClick={clear}
                        className="p-2 rounded-lg bg-white/10 text-red-400 hover:bg-red-500/20 transition-colors"
                        title="Clear Canvas"
                    >
                        <Trash2 size={20} />
                    </button>
                    <button
                        onClick={saveCanvas}
                        className="p-2 rounded-lg bg-purple-500 text-white hover:bg-purple-600 transition-colors"
                        title="Save Canvas"
                    >
                        <Download size={20} />
                    </button>
                </div>
            </div>

            {/* Canvas */}
            <div className="flex-1 flex items-center justify-center p-4">
                <canvas
                    ref={canvasRef}
                    width={1200}
                    height={675}
                    className="border border-white/20 rounded-lg shadow-2xl cursor-crosshair"
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={stopDrawing}
                    onMouseLeave={stopDrawing}
                />
            </div>

            {/* Info */}
            <div className="p-4 bg-black/20 border-t border-white/10">
                <p className="text-white/40 text-sm text-center">
                    Draw, sketch, and collaborate with Elara on this interactive canvas
                </p>
            </div>
        </div>
    );
};
