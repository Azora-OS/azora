"use client";

import { AppLayout, GradientText, Button } from "../../components";
import { 
    Plus, Save, Download, Layers, Box, Database, ArrowRight, 
    MousePointer, Square, Circle, Type, Image, Video, Music,
    Palette, Layout, Settings, Eye, EyeOff, Lock, Unlock,
    Copy, Trash2, Move, RotateCw, ZoomIn, ZoomOut, Maximize2,
    Sparkles, Wand2, Brush, PenTool, Shapes, Grid3x3
} from "lucide-react";
import { useState, useCallback, useRef, useEffect } from "react";
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
    NodeDragHandler,
    SelectionDragHandler,
} from "reactflow";
import "reactflow/dist/style.css";

// UI Component Types
interface UIComponent {
    id: string;
    type: "button" | "input" | "text" | "image" | "video" | "container" | "card" | "navbar" | "sidebar";
    name: string;
    icon: any;
    category: "layout" | "input" | "display" | "media" | "navigation";
    defaultProps: Record<string, any>;
    preview: string;
}

interface CanvasElement {
    id: string;
    type: UIComponent["type"];
    component: UIComponent;
    props: Record<string, any>;
    position: { x: number; y: number };
    size: { width: number; height: number };
    style: Record<string, any>;
    children?: CanvasElement[];
}

// Component Library
const componentLibrary: UIComponent[] = [
    {
        id: "button",
        type: "button",
        name: "Button",
        icon: Square,
        category: "input",
        defaultProps: { text: "Click Me", variant: "primary", size: "medium" },
        preview: "🔘"
    },
    {
        id: "input",
        type: "input", 
        name: "Input Field",
        icon: Type,
        category: "input",
        defaultProps: { placeholder: "Enter text...", type: "text" },
        preview: "📝"
    },
    {
        id: "text",
        type: "text",
        name: "Text",
        icon: Type,
        category: "display",
        defaultProps: { text: "Sample Text", fontSize: "16", color: "#000" },
        preview: "📄"
    },
    {
        id: "image",
        type: "image",
        name: "Image",
        icon: Image,
        category: "media",
        defaultProps: { src: "/placeholder.jpg", alt: "Image", width: 200, height: 150 },
        preview: "🖼️"
    },
    {
        id: "video",
        type: "video",
        name: "Video",
        icon: Video,
        category: "media",
        defaultProps: { src: "/video.mp4", controls: true, width: 300, height: 200 },
        preview: "🎬"
    },
    {
        id: "container",
        type: "container",
        name: "Container",
        icon: Box,
        category: "layout",
        defaultProps: { padding: "16", margin: "8", backgroundColor: "#f3f4f6" },
        preview: "📦"
    },
    {
        id: "card",
        type: "card",
        name: "Card",
        icon: Layout,
        category: "layout",
        defaultProps: { title: "Card Title", content: "Card content", elevation: 2 },
        preview: "🗋️"
    },
    {
        id: "navbar",
        type: "navbar",
        name: "Navigation Bar",
        icon: Layers,
        category: "navigation",
        defaultProps: { brand: "Logo", links: ["Home", "About", "Contact"] },
        preview: "🧭"
    },
    {
        id: "sidebar",
        type: "sidebar",
        name: "Sidebar",
        icon: Layout,
        category: "navigation",
        defaultProps: { width: 250, items: ["Dashboard", "Settings", "Profile"] },
        preview: "📋"
    }
];

const initialNodes: Node[] = [
    {
        id: "1",
        type: "input",
        data: { label: "User Interface" },
        position: { x: 250, y: 25 },
    },
    {
        id: "2",
        data: { label: "API Gateway" },
        position: { x: 250, y: 125 },
    },
    {
        id: "3",
        data: { label: "Business Logic" },
        position: { x: 250, y: 225 },
    },
    {
        id: "4",
        type: "output",
        data: { label: "Database" },
        position: { x: 250, y: 325 },
    },
];

const initialEdges: Edge[] = [
    { id: "e1-2", source: "1", target: "2", animated: true },
    { id: "e2-3", source: "2", target: "3", animated: true },
    { id: "e3-4", source: "3", target: "4", animated: true },
];

export default function DesignStudio() {
    const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
    const [selectedTool, setSelectedTool] = useState<string>("select");
    const [canvasElements, setCanvasElements] = useState<CanvasElement[]>([]);
    const [selectedElement, setSelectedElement] = useState<CanvasElement | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [draggedComponent, setDraggedComponent] = useState<UIComponent | null>(null);
    const [viewMode, setViewMode] = useState<"design" | "preview">("design");
    const [showGrid, setShowGrid] = useState(true);
    const [snapToGrid, setSnapToGrid] = useState(true);
    const [zoomLevel, setZoomLevel] = useState(100);
    const canvasRef = useRef<HTMLDivElement>(null);
    const [aiPrompt, setAiPrompt] = useState("");
    const [isGenerating, setIsGenerating] = useState(false);

    const onConnect = useCallback(
        (params: Connection | Edge) => setEdges((eds) => addEdge(params, eds)),
        [setEdges]
    );

    // Enhanced tool categories
    const toolCategories = {
        basic: [
            { id: "select", name: "Select", icon: MousePointer },
            { id: "move", name: "Move", icon: Move },
            { id: "text", name: "Text", icon: Type },
        ],
        shapes: [
            { id: "rectangle", name: "Rectangle", icon: Square },
            { id: "circle", name: "Circle", icon: Circle },
            { id: "line", name: "Line", icon: PenTool },
        ],
        components: [
            { id: "component", name: "Component", icon: Box },
            { id: "api", name: "API", icon: ArrowRight },
            { id: "database", name: "Database", icon: Database },
            { id: "layer", name: "Layer", icon: Layers },
        ],
        view: [
            { id: "zoom-in", name: "Zoom In", icon: ZoomIn },
            { id: "zoom-out", name: "Zoom Out", icon: ZoomOut },
            { id: "fit", name: "Fit", icon: Maximize2 },
        ]
    };

    // Drag and drop handlers
    const handleDragStart = (component: UIComponent) => {
        setDraggedComponent(component);
        setIsDragging(true);
    };

    const handleDragEnd = () => {
        setIsDragging(false);
        setDraggedComponent(null);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        if (!draggedComponent || !canvasRef.current) return;

        const rect = canvasRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        // Snap to grid if enabled
        const finalX = snapToGrid ? Math.round(x / 20) * 20 : x;
        const finalY = snapToGrid ? Math.round(y / 20) * 20 : y;

        const newElement: CanvasElement = {
            id: `element-${Date.now()}`,
            type: draggedComponent.type,
            component: draggedComponent,
            props: { ...draggedComponent.defaultProps },
            position: { x: finalX, y: finalY },
            size: { width: 120, height: 40 },
            style: {}
        };

        setCanvasElements(prev => [...prev, newElement]);
        handleDragEnd();
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
    };

    // AI Design Generation
    const generateDesign = async () => {
        if (!aiPrompt.trim()) return;
        
        setIsGenerating(true);
        try {
            // Simulate AI generation
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            // Mock AI-generated elements
            const generatedElements: CanvasElement[] = [
                {
                    id: `ai-${Date.now()}-1`,
                    type: "container",
                    component: componentLibrary.find(c => c.type === "container")!,
                    props: { backgroundColor: "#1f2937", padding: "24" },
                    position: { x: 50, y: 50 },
                    size: { width: 400, height: 300 },
                    style: { borderRadius: "8px" }
                },
                {
                    id: `ai-${Date.now()}-2`,
                    type: "text",
                    component: componentLibrary.find(c => c.type === "text")!,
                    props: { text: "AI Generated Design", fontSize: "24", color: "#ffffff" },
                    position: { x: 70, y: 70 },
                    size: { width: 200, height: 30 },
                    style: {}
                },
                {
                    id: `ai-${Date.now()}-3`,
                    type: "button",
                    component: componentLibrary.find(c => c.type === "button")!,
                    props: { text: "Get Started", variant: "primary" },
                    position: { x: 70, y: 280 },
                    size: { width: 120, height: 40 },
                    style: {}
                }
            ];

            setCanvasElements(prev => [...prev, ...generatedElements]);
        } catch (error) {
            console.error("AI generation failed:", error);
        } finally {
            setIsGenerating(false);
        }
    };

    // Component rendering
    const renderCanvasElement = (element: CanvasElement) => {
        const baseClasses = "absolute border border-gray-600 cursor-move transition-all hover:border-blue-400";
        const isSelected = selectedElement?.id === element.id;
        
        let content = null;
        
        switch (element.type) {
            case "button":
                content = (
                    <div className={`${baseClasses} ${isSelected ? 'ring-2 ring-blue-500' : ''} bg-blue-500 text-white px-4 py-2 rounded text-sm`}
                         style={{ ...element.style, left: element.position.x, top: element.position.y, width: element.size.width, height: element.size.height }}>
                        {element.props.text}
                    </div>
                );
                break;
            case "input":
                content = (
                    <div className={`${baseClasses} ${isSelected ? 'ring-2 ring-blue-500' : ''} bg-white border border-gray-300 px-3 py-2 rounded text-sm`}
                         style={{ ...element.style, left: element.position.x, top: element.position.y, width: element.size.width, height: element.size.height }}>
                        <input type="text" placeholder={element.props.placeholder} className="w-full outline-none" />
                    </div>
                );
                break;
            case "text":
                content = (
                    <div className={`${baseClasses} ${isSelected ? 'ring-2 ring-blue-500' : ''} text-gray-800 text-sm p-2`}
                         style={{ ...element.style, left: element.position.x, top: element.position.y, width: element.size.width, height: element.size.height, fontSize: `${element.props.fontSize}px`, color: element.props.color }}>
                        {element.props.text}
                    </div>
                );
                break;
            case "container":
                content = (
                    <div className={`${baseClasses} ${isSelected ? 'ring-2 ring-blue-500' : ''} p-4`}
                         style={{ ...element.style, left: element.position.x, top: element.position.y, width: element.size.width, height: element.size.height, backgroundColor: element.props.backgroundColor }}>
                        <div className="text-gray-500 text-xs">Container</div>
                    </div>
                );
                break;
            default:
                content = (
                    <div className={`${baseClasses} ${isSelected ? 'ring-2 ring-blue-500' : ''} bg-gray-100 flex items-center justify-center text-gray-600 text-xs`}
                         style={{ ...element.style, left: element.position.x, top: element.position.y, width: element.size.width, height: element.size.height }}>
                        {element.component.name}
                    </div>
                );
        }
        
        return content;
    };

    return (
        <AppLayout appName="Design Studio" userName="Builder">
            <div className="h-[calc(100vh-4rem)] flex flex-col">
                {/* Enhanced Toolbar */}
                <div className="bg-gray-900 border-b border-gray-800 p-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <h1 className="text-2xl font-bold">
                            <GradientText>Design Studio</GradientText>
                        </h1>
                        
                        {/* View Mode Toggle */}
                        <div className="flex items-center gap-2 bg-gray-800 rounded-lg p-1">
                            <button
                                onClick={() => setViewMode("design")}
                                className={`px-3 py-1 rounded text-sm transition-colors ${
                                    viewMode === "design" 
                                        ? "bg-blue-600 text-white" 
                                        : "text-gray-400 hover:text-white"
                                }`}
                            >
                                Design
                            </button>
                            <button
                                onClick={() => setViewMode("preview")}
                                className={`px-3 py-1 rounded text-sm transition-colors ${
                                    viewMode === "preview" 
                                        ? "bg-blue-600 text-white" 
                                        : "text-gray-400 hover:text-white"
                                }`}
                            >
                                Preview
                            </button>
                        </div>

                        {/* Tool Categories */}
                        <div className="flex items-center gap-2">
                            {Object.entries(toolCategories).map(([category, tools]) => (
                                <div key={category} className="flex items-center gap-1">
                                    {tools.map((tool) => {
                                        const Icon = tool.icon;
                                        return (
                                            <button
                                                key={tool.id}
                                                onClick={() => setSelectedTool(tool.id)}
                                                className={`p-2 rounded-lg transition-all ${
                                                    selectedTool === tool.id
                                                        ? "bg-blue-600 text-white"
                                                        : "bg-gray-800 text-gray-400 hover:bg-gray-700"
                                                }`}
                                                title={tool.name}
                                            >
                                                <Icon className="w-4 h-4" />
                                            </button>
                                        );
                                    })}
                                </div>
                            ))}
                        </div>

                        {/* Canvas Controls */}
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setShowGrid(!showGrid)}
                                className={`p-2 rounded-lg transition-colors ${
                                    showGrid 
                                        ? "bg-blue-600 text-white" 
                                        : "bg-gray-800 text-gray-400 hover:bg-gray-700"
                                }`}
                                title="Toggle Grid"
                            >
                                <Grid3x3 className="w-4 h-4" />
                            </button>
                            <button
                                onClick={() => setSnapToGrid(!snapToGrid)}
                                className={`p-2 rounded-lg transition-colors ${
                                    snapToGrid 
                                        ? "bg-blue-600 text-white" 
                                        : "bg-gray-800 text-gray-400 hover:bg-gray-700"
                                }`}
                                title="Snap to Grid"
                            >
                                <Move className="w-4 h-4" />
                            </button>
                            <div className="flex items-center gap-1 text-sm text-gray-400">
                                <ZoomOut className="w-4 h-4" />
                                <span>{zoomLevel}%</span>
                                <ZoomIn className="w-4 h-4" />
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm">
                            <Download className="w-4 h-4 mr-2" />
                            Export
                        </Button>
                        <Button variant="outline" size="sm">
                            <Save className="w-4 h-4 mr-2" />
                            Save
                        </Button>
                        <Button variant="primary" size="sm">
                            <Plus className="w-4 h-4 mr-2" />
                            Add Element
                        </Button>
                    </div>
                </div>

                {/* Enhanced Canvas and Sidebar */}
                <div className="flex-1 flex">
                    {/* Component Library */}
                    <div className="w-64 bg-gray-900 border-r border-gray-800 flex flex-col">
                        <div className="p-4 border-b border-gray-800">
                            <h3 className="font-bold text-white mb-3">Component Library</h3>
                            
                            {/* Component Categories */}
                            <div className="space-y-3">
                                {["layout", "input", "display", "media", "navigation"].map(category => (
                                    <div key={category}>
                                        <h4 className="text-xs font-semibold text-gray-400 uppercase mb-2">
                                            {category}
                                        </h4>
                                        <div className="grid grid-cols-2 gap-2">
                                            {componentLibrary
                                                .filter(comp => comp.category === category)
                                                .map(component => {
                                                    const Icon = component.icon;
                                                    return (
                                                        <div
                                                            key={component.id}
                                                            draggable
                                                            onDragStart={() => handleDragStart(component)}
                                                            onDragEnd={handleDragEnd}
                                                            className="bg-gray-800 border border-gray-700 rounded-lg p-3 cursor-move hover:bg-gray-700 hover:border-blue-500 transition-all text-center"
                                                        >
                                                            <Icon className="w-6 h-6 mx-auto mb-1 text-blue-400" />
                                                            <div className="text-xs text-gray-300">{component.name}</div>
                                                            <div className="text-lg">{component.preview}</div>
                                                        </div>
                                                    );
                                                })}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Templates */}
                        <div className="p-4 border-b border-gray-800">
                            <h3 className="font-bold text-white mb-3">Templates</h3>
                            <div className="space-y-2">
                                <button className="w-full bg-gray-800 border border-gray-700 rounded-lg p-2 text-left text-sm text-gray-300 hover:bg-gray-700 hover:border-blue-500 transition-all">
                                    🎨 Landing Page
                                </button>
                                <button className="w-full bg-gray-800 border border-gray-700 rounded-lg p-2 text-left text-sm text-gray-300 hover:bg-gray-700 hover:border-blue-500 transition-all">
                                    📱 Mobile App
                                </button>
                                <button className="w-full bg-gray-800 border border-gray-700 rounded-lg p-2 text-left text-sm text-gray-300 hover:bg-gray-700 hover:border-blue-500 transition-all">
                                    🖥️ Dashboard
                                </button>
                                <button className="w-full bg-gray-800 border border-gray-700 rounded-lg p-2 text-left text-sm text-gray-300 hover:bg-gray-700 hover:border-blue-500 transition-all">
                                    🛒 E-commerce
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Visual Canvas */}
                    <div className="flex-1 bg-gray-950 relative overflow-hidden">
                        {viewMode === "design" ? (
                            <div
                                ref={canvasRef}
                                className={`w-full h-full relative ${
                                    showGrid ? 'bg-grid-pattern' : ''
                                }`}
                                style={{
                                    backgroundImage: showGrid 
                                        ? 'radial-gradient(circle, #374151 1px, transparent 1px)'
                                        : 'none',
                                    backgroundSize: '20px 20px'
                                }}
                                onDrop={handleDrop}
                                onDragOver={handleDragOver}
                            >
                                {/* Drag Overlay */}
                                {isDragging && (
                                    <div className="absolute inset-0 bg-blue-500/10 border-2 border-dashed border-blue-500 pointer-events-none z-50">
                                        <div className="flex items-center justify-center h-full">
                                            <div className="text-blue-400 font-semibold">
                                                Drop component here
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Canvas Elements */}
                                {canvasElements.map(element => renderCanvasElement))}
                            </div>
                        ) : (
                            <div className="w-full h-full bg-white p-8">
                                <div className="max-w-4xl mx-auto">
                                    {/* Preview Mode - Render actual components */}
                                    {canvasElements.map(element => {
                                        switch (element.type) {
                                            case "button":
                                                return (
                                                    <button
                                                        key={element.id}
                                                        className="bg-blue-500 text-white px-4 py-2 rounded text-sm"
                                                        style={{ 
                                                            position: 'absolute',
                                                            left: element.position.x,
                                                            top: element.position.y,
                                                            width: element.size.width,
                                                            height: element.size.height,
                                                            ...element.style
                                                        }}
                                                    >
                                                        {element.props.text}
                                                    </button>
                                                );
                                            case "text":
                                                return (
                                                    <div
                                                        key={element.id}
                                                        style={{ 
                                                            position: 'absolute',
                                                            left: element.position.x,
                                                            top: element.position.y,
                                                            width: element.size.width,
                                                            height: element.size.height,
                                                            fontSize: `${element.props.fontSize}px`,
                                                            color: element.props.color,
                                                            ...element.style
                                                        }}
                                                    >
                                                        {element.props.text}
                                                    </div>
                                                );
                                            default:
                                                return null;
                                        }
                                    })}
                                </div>
                            </div>
                        )}

                        {/* ReactFlow Background (for flow diagram mode) */}
                        <div className="absolute bottom-4 right-4 bg-gray-900/90 rounded-lg p-2 border border-gray-700">
                            <ReactFlow
                                nodes={nodes}
                                edges={edges}
                                onNodesChange={onNodesChange}
                                onEdgesChange={onEdgesChange}
                                onConnect={onConnect}
                                style={{ width: 200, height: 150 }}
                            >
                                <MiniMap />
                                <Background gap={12} size={1} />
                            </ReactFlow>
                        </div>
                    </div>

                    {/* Enhanced Properties and AI Panel */}
                    <div className="w-96 bg-gray-900 border-l border-gray-800 flex flex-col">
                        {/* Properties */}
                        <div className="p-4 border-b border-gray-800">
                            <h3 className="text-sm font-bold mb-3 text-white">Properties</h3>
                            
                            {selectedElement ? (
                                <div className="space-y-3">
                                    <div>
                                        <label className="text-xs text-gray-400 block mb-1">Element Type</label>
                                        <div className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white">
                                            {selectedElement.component.name}
                                        </div>
                                    </div>
                                    
                                    <div>
                                        <label className="text-xs text-gray-400 block mb-1">ID</label>
                                        <input
                                            type="text"
                                            value={selectedElement.id}
                                            readOnly
                                            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-400"
                                        />
                                    </div>
                                    
                                    <div className="grid grid-cols-2 gap-2">
                                        <div>
                                            <label className="text-xs text-gray-400 block mb-1">X Position</label>
                                            <input
                                                type="number"
                                                value={selectedElement.position.x}
                                                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-xs text-gray-400 block mb-1">Y Position</label>
                                            <input
                                                type="number"
                                                value={selectedElement.position.y}
                                                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white"
                                            />
                                        </div>
                                    </div>
                                    
                                    <div className="grid grid-cols-2 gap-2">
                                        <div>
                                            <label className="text-xs text-gray-400 block mb-1">Width</label>
                                            <input
                                                type="number"
                                                value={selectedElement.size.width}
                                                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-xs text-gray-400 block mb-1">Height</label>
                                            <input
                                                type="number"
                                                value={selectedElement.size.height}
                                                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white"
                                            />
                                        </div>
                                    </div>

                                    {/* Component-specific properties */}
                                    {selectedElement.type === "button" && (
                                        <>
                                            <div>
                                                <label className="text-xs text-gray-400 block mb-1">Button Text</label>
                                                <input
                                                    type="text"
                                                    defaultValue={selectedElement.props.text}
                                                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white"
                                                />
                                            </div>
                                            <div>
                                                <label className="text-xs text-gray-400 block mb-1">Variant</label>
                                                <select className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white">
                                                    <option value="primary">Primary</option>
                                                    <option value="secondary">Secondary</option>
                                                    <option value="outline">Outline</option>
                                                </select>
                                            </div>
                                        </>
                                    )}
                                    
                                    {selectedElement.type === "text" && (
                                        <>
                                            <div>
                                                <label className="text-xs text-gray-400 block mb-1">Text Content</label>
                                                <textarea
                                                    defaultValue={selectedElement.props.text}
                                                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white h-16"
                                                />
                                            </div>
                                            <div>
                                                <label className="text-xs text-gray-400 block mb-1">Font Size</label>
                                                <input
                                                    type="number"
                                                    defaultValue={selectedElement.props.fontSize}
                                                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white"
                                                />
                                            </div>
                                            <div>
                                                <label className="text-xs text-gray-400 block mb-1">Color</label>
                                                <input
                                                    type="color"
                                                    defaultValue={selectedElement.props.color}
                                                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white h-8"
                                                />
                                            </div>
                                        </>
                                    )}

                                    <div className="flex gap-2 pt-2">
                                        <button className="flex-1 bg-blue-600 hover:bg-blue-500 text-white text-sm py-2 rounded transition-colors">
                                            Apply Changes
                                        </button>
                                        <button className="bg-red-600 hover:bg-red-500 text-white text-sm py-2 px-3 rounded transition-colors">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center py-8">
                                    <div className="text-gray-500 text-sm">No element selected</div>
                                    <div className="text-gray-600 text-xs mt-1">Click on an element to edit its properties</div>
                                </div>
                            )}
                        </div>

                        {/* IMANI AI Assistant - Enhanced */}
                        <div className="flex-1 flex flex-col">
                            <div className="p-4 border-b border-gray-800">
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                                        <Sparkles className="w-4 h-4 text-white" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-white">IMANI - Creative Director</h3>
                                        <p className="text-xs text-gray-400">AI-powered design generation</p>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="flex-1 flex flex-col p-4">
                                {/* AI Prompt Input */}
                                <div className="mb-4">
                                    <label className="text-xs text-gray-400 block mb-2">Describe your design</label>
                                    <textarea
                                        value={aiPrompt}
                                        onChange={(e) => setAiPrompt(e.target.value)}
                                        placeholder="E.g., Create a modern landing page with a hero section, features grid, and contact form..."
                                        className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 h-20 resize-none focus:outline-none focus:border-blue-500"
                                    />
                                    <button
                                        onClick={generateDesign}
                                        disabled={!aiPrompt.trim() || isGenerating}
                                        className="mt-2 w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 disabled:from-gray-600 disabled:to-gray-700 text-white text-sm py-2 rounded transition-all disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                    >
                                        {isGenerating ? (
                                            <>
                                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                                Generating...
                                            </>
                                        ) : (
                                            <>
                                                <Wand2 className="w-4 h-4" />
                                                Generate Design
                                            </>
                                        )}
                                    </button>
                                </div>

                                {/* AI Suggestions */}
                                <div className="flex-1">
                                    <h4 className="text-xs font-semibold text-gray-400 uppercase mb-3">Quick Actions</h4>
                                    <div className="space-y-2">
                                        <button className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-left text-sm text-gray-300 hover:bg-gray-700 hover:border-blue-500 transition-all group">
                                            <div className="flex items-center gap-2">
                                                <Palette className="w-4 h-4 text-blue-400 group-hover:text-blue-300" />
                                                <span>Generate color palette</span>
                                            </div>
                                        </button>
                                        <button className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-left text-sm text-gray-300 hover:bg-gray-700 hover:border-blue-500 transition-all group">
                                            <div className="flex items-center gap-2">
                                                <Layout className="w-4 h-4 text-green-400 group-hover:text-green-300" />
                                                <span>Optimize layout</span>
                                            </div>
                                        </button>
                                        <button className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-left text-sm text-gray-300 hover:bg-gray-700 hover:border-blue-500 transition-all group">
                                            <div className="flex items-center gap-2">
                                                <Brush className="w-4 h-4 text-purple-400 group-hover:text-purple-300" />
                                                <span>Apply modern styling</span>
                                            </div>
                                        </button>
                                        <button className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-left text-sm text-gray-300 hover:bg-gray-700 hover:border-blue-500 transition-all group">
                                            <div className="flex items-center gap-2">
                                                <Shapes className="w-4 h-4 text-orange-400 group-hover:text-orange-300" />
                                                <span>Add decorative elements</span>
                                            </div>
                                        </button>
                                    </div>

                                    {/* Recent Generations */}
                                    {canvasElements.filter(el => el.id.startsWith('ai-')).length > 0 && (
                                        <div className="mt-4">
                                            <h4 className="text-xs font-semibold text-gray-400 uppercase mb-2">AI Generated</h4>
                                            <div className="bg-gray-800 border border-gray-700 rounded-lg p-2">
                                                <div className="text-xs text-gray-400">
                                                    {canvasElements.filter(el => el.id.startsWith('ai-')).length} elements generated
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
