"use client";

import { AppLayout, GradientText, Button } from "../../components";
import { 
    Database, BarChart, Table, Play, Save, Upload, Download, 
    TrendingUp, TrendingDown, Activity, Zap, RefreshCw,
    PieChart, LineChart, Scatter, Heatmap, Filter, Search,
    Settings, Clock, AlertCircle, CheckCircle, Loader2,
    FileText, Database as DatabaseIcon, Cpu, HardDrive,
    ArrowRight, Eye, EyeOff, Lock, Unlock, Copy, Trash2
} from "lucide-react";
import { useState, useEffect, useRef, useCallback } from "react";

// Data processing types
interface DataStream {
    id: string;
    name: string;
    type: "csv" | "json" | "realtime" | "database";
    status: "active" | "processing" | "error" | "idle";
    records: number;
    lastUpdate: Date;
    schema: Record<string, string>;
}

interface Visualization {
    id: string;
    type: "line" | "bar" | "pie" | "scatter" | "heatmap";
    title: string;
    dataSource: string;
    config: Record<string, any>;
    position: { x: number; y: number };
    size: { width: number; height: number };
}

interface ProcessingPipeline {
    id: string;
    name: string;
    steps: ProcessingStep[];
    status: "running" | "completed" | "error" | "idle";
    progress: number;
}

interface ProcessingStep {
    id: string;
    name: string;
    type: "filter" | "transform" | "aggregate" | "join" | "export";
    config: Record<string, any>;
    status: "pending" | "running" | "completed" | "error";
}

// Mock data streams
const mockDataStreams: DataStream[] = [
    {
        id: "1",
        name: "Student Performance",
        type: "csv",
        status: "active",
        records: 15234,
        lastUpdate: new Date(),
        schema: {
            "student_id": "string",
            "course": "string", 
            "score": "number",
            "hours_studied": "number",
            "attendance": "percentage"
        }
    },
    {
        id: "2", 
        name: "Course Metrics",
        type: "json",
        status: "processing",
        records: 8921,
        lastUpdate: new Date(Date.now() - 300000),
        schema: {
            "course_id": "string",
            "enrollment": "number",
            "completion_rate": "percentage",
            "avg_score": "number"
        }
    },
    {
        id: "3",
        name: "Real-time Analytics",
        type: "realtime",
        status: "active",
        records: 45678,
        lastUpdate: new Date(),
        schema: {
            "timestamp": "datetime",
            "user_id": "string",
            "action": "string",
            "duration": "number"
        }
    }
];

export default function DataForge() {
    const [activeTab, setActiveTab] = useState("data");
    const [dataStreams, setDataStreams] = useState<DataStream[]>(mockDataStreams);
    const [visualizations, setVisualizations] = useState<Visualization[]>([]);
    const [selectedStream, setSelectedStream] = useState<DataStream | null>(null);
    const [processingPipelines, setProcessingPipelines] = useState<ProcessingPipeline[]>([]);
    const [isProcessing, setIsProcessing] = useState(false);
    const [realTimeData, setRealTimeData] = useState<any[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [filterConfig, setFilterConfig] = useState<Record<string, any>>({});
    const [aiQuery, setAiQuery] = useState("");
    const [isAiProcessing, setIsAiProcessing] = useState(false);
    const wsRef = useRef<WebSocket | null>(null);

    // Real-time data simulation
    useEffect(() => {
        const interval = setInterval(() => {
            // Simulate real-time data updates
            setDataStreams(prev => prev.map(stream => 
                stream.type === "realtime" 
                    ? { ...stream, records: stream.records + Math.floor(Math.random() * 10), lastUpdate: new Date() }
                    : stream
            ));

            // Generate random real-time data point
            const newPoint = {
                timestamp: new Date(),
                value: Math.random() * 100,
                category: ["sales", "users", "performance"][Math.floor(Math.random() * 3)],
                id: Date.now()
            };
            
            setRealTimeData(prev => [...prev.slice(-99), newPoint]);
        }, 2000);

        return () => clearInterval(interval);
    }, []);

    // WebSocket connection for real-time updates
    useEffect(() => {
        try {
            wsRef.current = new WebSocket('ws://localhost:8080/data-stream');
            
            wsRef.current.onopen = () => {
                console.log('Data Forge WebSocket connected');
            };
            
            wsRef.current.onmessage = (event) => {
                const data = JSON.parse(event.data);
                // Handle real-time data updates
                if (data.type === 'stream_update') {
                    setDataStreams(prev => prev.map(stream => 
                        stream.id === data.streamId 
                            ? { ...stream, ...data.payload }
                            : stream
                    ));
                }
            };
            
            wsRef.current.onclose = () => {
                console.log('Data Forge WebSocket disconnected');
            };
            
            return () => {
                wsRef.current?.close();
            };
        } catch (error) {
            console.log('WebSocket not available, using simulation');
        }
    }, []);

    // Data processing functions
    const runDataProcessing = useCallback(async () => {
        setIsProcessing(true);
        
        // Create processing pipeline
        const pipeline: ProcessingPipeline = {
            id: Date.now().toString(),
            name: "Student Performance Analysis",
            steps: [
                {
                    id: "1",
                    name: "Data Cleaning",
                    type: "filter",
                    config: { removeNulls: true, standardizeFormat: true },
                    status: "pending"
                },
                {
                    id: "2", 
                    name: "Feature Engineering",
                    type: "transform",
                    config: { createFeatures: ["performance_score", "engagement_metric"] },
                    status: "pending"
                },
                {
                    id: "3",
                    name: "Aggregation",
                    type: "aggregate",
                    config: { groupBy: ["course"], metrics: ["avg", "min", "max"] },
                    status: "pending"
                }
            ],
            status: "running",
            progress: 0
        };
        
        setProcessingPipelines(prev => [...prev, pipeline]);
        
        // Simulate processing steps
        for (let i = 0; i < pipeline.steps.length; i++) {
            await new Promise(resolve => setTimeout(resolve, 1500));
            
            setProcessingPipelines(prev => prev.map(p => 
                p.id === pipeline.id 
                    ? {
                        ...p,
                        steps: p.steps.map((step, index) => 
                            index === i ? { ...step, status: "completed" } : step
                        ),
                        progress: ((i + 1) / pipeline.steps.length) * 100
                    }
                    : p
            ));
        }
        
        setProcessingPipelines(prev => prev.map(p => 
            p.id === pipeline.id ? { ...p, status: "completed" } : p
        ));
        
        setIsProcessing(false);
    }, []);

    // AI-powered data analysis
    const runAiAnalysis = async () => {
        if (!aiQuery.trim()) return;
        
        setIsAiProcessing(true);
        
        // Simulate AI processing
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Generate visualization based on AI query
        const newViz: Visualization = {
            id: Date.now().toString(),
            type: aiQuery.toLowerCase().includes("trend") ? "line" : 
                  aiQuery.toLowerCase().includes("compare") ? "bar" : "pie",
            title: `AI: ${aiQuery}`,
            dataSource: selectedStream?.id || "1",
            config: {
                xAxis: aiQuery.toLowerCase().includes("time") ? "timestamp" : "category",
                yAxis: aiQuery.toLowerCase().includes("performance") ? "score" : "value"
            },
            position: { x: 50, y: 50 },
            size: { width: 400, height: 300 }
        };
        
        setVisualizations(prev => [...prev, newViz]);
        setIsAiProcessing(false);
        setAiQuery("");
    };

    // Visualization rendering
    const renderVisualization = (viz: Visualization) => {
        const chartData = realTimeData.slice(-20);
        
        switch (viz.type) {
            case "line":
                return (
                    <div className="w-full h-full bg-gray-800 rounded-lg p-4 flex items-center justify-center">
                        <div className="text-center">
                            <LineChart className="w-12 h-12 text-blue-400 mx-auto mb-2" />
                            <div className="text-sm text-gray-300">{viz.title}</div>
                            <div className="text-xs text-gray-500 mt-1">Real-time line chart</div>
                            <div className="mt-2 text-xs text-blue-400">
                                {chartData.length} data points
                            </div>
                        </div>
                    </div>
                );
            case "bar":
                return (
                    <div className="w-full h-full bg-gray-800 rounded-lg p-4 flex items-center justify-center">
                        <div className="text-center">
                            <BarChart className="w-12 h-12 text-green-400 mx-auto mb-2" />
                            <div className="text-sm text-gray-300">{viz.title}</div>
                            <div className="text-xs text-gray-500 mt-1">Comparison chart</div>
                        </div>
                    </div>
                );
            case "pie":
                return (
                    <div className="w-full h-full bg-gray-800 rounded-lg p-4 flex items-center justify-center">
                        <div className="text-center">
                            <PieChart className="w-12 h-12 text-purple-400 mx-auto mb-2" />
                            <div className="text-sm text-gray-300">{viz.title}</div>
                            <div className="text-xs text-gray-500 mt-1">Distribution chart</div>
                        </div>
                    </div>
                );
            default:
                return (
                    <div className="w-full h-full bg-gray-800 rounded-lg p-4 flex items-center justify-center">
                        <div className="text-center text-gray-500">
                            <Scatter className="w-12 h-12 mx-auto mb-2" />
                            <div className="text-sm">{viz.title}</div>
                        </div>
                    </div>
                );
        }
    };

    return (
        <AppLayout appName="Data Forge" userName="Data Scientist">
            <div className="h-[calc(100vh-4rem)] flex flex-col">
                {/* Enhanced Toolbar */}
                <div className="bg-gray-900 border-b border-gray-800 p-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <h1 className="text-2xl font-bold">
                            <GradientText>Data Forge</GradientText>
                        </h1>
                        
                        {/* Real-time Status Indicator */}
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                            <span className="text-sm text-gray-400">Live Processing</span>
                        </div>
                        
                        {/* Enhanced Tabs */}
                        <div className="flex bg-gray-800 rounded-lg p-1">
                            <button
                                onClick={() => setActiveTab("data")}
                                className={`px-3 py-1.5 rounded-md text-sm transition-all flex items-center gap-2 ${
                                    activeTab === "data" ? "bg-blue-600 text-white" : "text-gray-400 hover:text-white"
                                }`}
                            >
                                <Database className="w-4 h-4" />
                                Data
                            </button>
                            <button
                                onClick={() => setActiveTab("viz")}
                                className={`px-3 py-1.5 rounded-md text-sm transition-all flex items-center gap-2 ${
                                    activeTab === "viz" ? "bg-blue-600 text-white" : "text-gray-400 hover:text-white"
                                }`}
                            >
                                <BarChart className="w-4 h-4" />
                                Visualize
                            </button>
                            <button
                                onClick={() => setActiveTab("model")}
                                className={`px-3 py-1.5 rounded-md text-sm transition-all flex items-center gap-2 ${
                                    activeTab === "model" ? "bg-blue-600 text-white" : "text-gray-400 hover:text-white"
                                }`}
                            >
                                <Cpu className="w-4 h-4" />
                                Process
                            </button>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm">
                            <Upload className="w-4 h-4 mr-2" />
                            Import
                        </Button>
                        <Button variant="outline" size="sm">
                            <Download className="w-4 h-4 mr-2" />
                            Export
                        </Button>
                        <Button variant="outline" size="sm">
                            <Save className="w-4 h-4 mr-2" />
                            Save
                        </Button>
                        <Button 
                            variant="primary" 
                            size="sm"
                            onClick={runDataProcessing}
                            disabled={isProcessing}
                        >
                            {isProcessing ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Processing...
                                </>
                            ) : (
                                <>
                                    <Play className="w-4 h-4 mr-2" />
                                    Run Analysis
                                </>
                            )}
                        </Button>
                    </div>
                </div>

                {/* Main Content */}
                <div className="flex-1 flex overflow-hidden">
                    {/* Enhanced Workspace */}
                    <div className="flex-1 bg-gray-950 p-6 overflow-auto">
                        {activeTab === "data" && (
                            <div className="space-y-6">
                                {/* Real-time Data Streams */}
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {dataStreams.map(stream => (
                                        <div
                                            key={stream.id}
                                            className={`bg-gray-900 rounded-lg border ${
                                                stream.status === "active" ? "border-green-500" : 
                                                stream.status === "processing" ? "border-yellow-500" : 
                                                stream.status === "error" ? "border-red-500" : "border-gray-700"
                                            } p-4 cursor-pointer hover:bg-gray-800 transition-all`}
                                            onClick={() => setSelectedStream(stream)}
                                        >
                                            <div className="flex items-center justify-between mb-3">
                                                <h4 className="font-semibold text-white">{stream.name}</h4>
                                                <div className={`w-2 h-2 rounded-full ${
                                                    stream.status === "active" ? "bg-green-400 animate-pulse" :
                                                    stream.status === "processing" ? "bg-yellow-400 animate-pulse" :
                                                    stream.status === "error" ? "bg-red-400" : "bg-gray-400"
                                                }`} />
                                            </div>
                                            
                                            <div className="space-y-2 text-sm">
                                                <div className="flex justify-between">
                                                    <span className="text-gray-400">Type:</span>
                                                    <span className="text-gray-300 capitalize">{stream.type}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-gray-400">Records:</span>
                                                    <span className="text-gray-300">{stream.records.toLocaleString()}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-gray-400">Updated:</span>
                                                    <span className="text-gray-300">
                                                        {new Date(stream.lastUpdate).toLocaleTimeString()}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="mt-3 pt-3 border-t border-gray-700">
                                                <div className="text-xs text-gray-500 mb-2">Schema:</div>
                                                <div className="flex flex-wrap gap-1">
                                                    {Object.entries(stream.schema).slice(0, 3).map(([key, type]) => (
                                                        <span key={key} className="text-xs bg-gray-800 px-2 py-1 rounded text-gray-400">
                                                            {key}: {type}
                                                        </span>
                                                    ))}
                                                    {Object.keys(stream.schema).length > 3 && (
                                                        <span className="text-xs text-gray-500">+{Object.keys(stream.schema).length - 3} more</span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Selected Stream Details */}
                                {selectedStream && (
                                    <div className="bg-gray-900 rounded-lg border border-gray-800 p-6">
                                        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                                            <Table className="w-5 h-5 text-blue-500" />
                                            {selectedStream.name} - Data Preview
                                        </h3>
                                        
                                        {/* Search and Filter */}
                                        <div className="flex gap-2 mb-4">
                                            <div className="flex-1 relative">
                                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                                                <input
                                                    type="text"
                                                    placeholder="Search data..."
                                                    value={searchQuery}
                                                    onChange={(e) => setSearchQuery(e.target.value)}
                                                    className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-10 pr-3 py-2 text-sm text-white placeholder-gray-500"
                                                />
                                            </div>
                                            <button className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-gray-400 hover:text-white transition-colors">
                                                <Filter className="w-4 h-4" />
                                            </button>
                                        </div>

                                        {/* Data Table */}
                                        <div className="overflow-x-auto">
                                            <table className="w-full text-sm text-left text-gray-400">
                                                <thead className="text-xs text-gray-200 uppercase bg-gray-800">
                                                    <tr>
                                                        {Object.keys(selectedStream.schema).map(key => (
                                                            <th key={key} className="px-6 py-3">{key}</th>
                                                        ))}
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {[1, 2, 3].map(i => (
                                                        <tr key={i} className="bg-gray-900 border-b border-gray-800">
                                                            {Object.keys(selectedStream.schema).map(key => (
                                                                <td key={key} className="px-6 py-4">
                                                                    {key === "score" ? Math.floor(Math.random() * 40 + 60) :
                                                                     key === "hours_studied" ? Math.floor(Math.random() * 20 + 5) :
                                                                     key === "attendance" ? `${Math.floor(Math.random() * 30 + 70)}%` :
                                                                     key.includes("id") ? `${key.toUpperCase()}-${String(i).padStart(3, '0')}` :
                                                                     key === "course" ? ["Math 101", "Science 202", "History 101"][i-1] :
                                                                     key === "action" ? ["view", "click", "purchase"][Math.floor(Math.random() * 3)] :
                                                                     key === "duration" ? `${Math.floor(Math.random() * 300)}s` :
                                                                     key === "timestamp" ? new Date().toLocaleTimeString() :
                                                                     "Sample"}
                                                                </td>
                                                            ))}
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === "viz" && (
                            <div className="space-y-6">
                                {/* Visualization Controls */}
                                <div className="bg-gray-900 rounded-lg border border-gray-800 p-4">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-lg font-bold text-white">Visualization Canvas</h3>
                                        <div className="flex gap-2">
                                            <button className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-500 transition-colors">
                                                <LineChart className="w-4 h-4 inline mr-1" />
                                                Line
                                            </button>
                                            <button className="px-3 py-1 bg-gray-800 text-gray-400 rounded text-sm hover:text-white transition-colors">
                                                <BarChart className="w-4 h-4 inline mr-1" />
                                                Bar
                                            </button>
                                            <button className="px-3 py-1 bg-gray-800 text-gray-400 rounded text-sm hover:text-white transition-colors">
                                                <PieChart className="w-4 h-4 inline mr-1" />
                                                Pie
                                            </button>
                                            <button className="px-3 py-1 bg-gray-800 text-gray-400 rounded text-sm hover:text-white transition-colors">
                                                <Heatmap className="w-4 h-4 inline mr-1" />
                                                Heatmap
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* Visualizations Grid */}
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    {visualizations.map(viz => (
                                        <div key={viz.id} className="relative">
                                            {renderVisualization(viz)}
                                            <div className="absolute top-2 right-2 flex gap-1">
                                                <button className="p-1 bg-gray-700 rounded text-gray-400 hover:text-white transition-colors">
                                                    <Eye className="w-3 h-3" />
                                                </button>
                                                <button className="p-1 bg-gray-700 rounded text-gray-400 hover:text-white transition-colors">
                                                    <Copy className="w-3 h-3" />
                                                </button>
                                                <button className="p-1 bg-gray-700 rounded text-gray-400 hover:text-red-400 transition-colors">
                                                    <Trash2 className="w-3 h-3" />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                    
                                    {visualizations.length === 0 && (
                                        <div className="col-span-2 flex items-center justify-center h-64 text-gray-500 border-2 border-dashed border-gray-700 rounded-lg">
                                            <div className="text-center">
                                                <BarChart className="w-16 h-16 mx-auto mb-4 opacity-50" />
                                                <p className="text-lg">No visualizations yet</p>
                                                <p className="text-sm">Use AI assistant or create charts manually</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {activeTab === "model" && (
                            <div className="space-y-6">
                                {/* Processing Pipelines */}
                                <div className="space-y-4">
                                    {processingPipelines.map(pipeline => (
                                        <div key={pipeline.id} className="bg-gray-900 rounded-lg border border-gray-800 p-6">
                                            <div className="flex items-center justify-between mb-4">
                                                <h3 className="text-lg font-bold text-white">{pipeline.name}</h3>
                                                <div className={`px-2 py-1 rounded text-xs font-medium ${
                                                    pipeline.status === "running" ? "bg-yellow-500 text-black" :
                                                    pipeline.status === "completed" ? "bg-green-500 text-white" :
                                                    pipeline.status === "error" ? "bg-red-500 text-white" :
                                                    "bg-gray-500 text-white"
                                                }`}>
                                                    {pipeline.status}
                                                </div>
                                            </div>
                                            
                                            {/* Progress Bar */}
                                            <div className="mb-4">
                                                <div className="flex justify-between text-sm text-gray-400 mb-1">
                                                    <span>Progress</span>
                                                    <span>{pipeline.progress.toFixed(0)}%</span>
                                                </div>
                                                <div className="w-full bg-gray-700 rounded-full h-2">
                                                    <div 
                                                        className={`h-2 rounded-full transition-all ${
                                                            pipeline.status === "completed" ? "bg-green-500" :
                                                            pipeline.status === "error" ? "bg-red-500" :
                                                            "bg-blue-500"
                                                        }`}
                                                        style={{ width: `${pipeline.progress}%` }}
                                                    />
                                                </div>
                                            </div>

                                            {/* Processing Steps */}
                                            <div className="space-y-2">
                                                {pipeline.steps.map((step, index) => (
                                                    <div key={step.id} className="flex items-center gap-3 p-2 bg-gray-800 rounded">
                                                        <div className={`w-3 h-3 rounded-full ${
                                                            step.status === "completed" ? "bg-green-400" :
                                                            step.status === "running" ? "bg-yellow-400 animate-pulse" :
                                                            step.status === "error" ? "bg-red-400" :
                                                            "bg-gray-400"
                                                        }`} />
                                                        <div className="flex-1">
                                                            <div className="text-sm text-white">{step.name}</div>
                                                            <div className="text-xs text-gray-500 capitalize">{step.type}</div>
                                                        </div>
                                                        {step.status === "running" && (
                                                            <Loader2 className="w-4 h-4 text-blue-400 animate-spin" />
                                                        )}
                                                        {step.status === "completed" && (
                                                            <CheckCircle className="w-4 h-4 text-green-400" />
                                                        )}
                                                        {step.status === "error" && (
                                                            <AlertCircle className="w-4 h-4 text-red-400" />
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                    
                                    {processingPipelines.length === 0 && (
                                        <div className="flex items-center justify-center h-64 text-gray-500 border-2 border-dashed border-gray-700 rounded-lg">
                                            <div className="text-center">
                                                <Cpu className="w-16 h-16 mx-auto mb-4 opacity-50" />
                                                <p className="text-lg">No processing pipelines</p>
                                                <p className="text-sm">Click "Run Analysis" to start data processing</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Enhanced Sidebar */}
                    <div className="w-96 bg-gray-900 flex flex-col border-l border-gray-800">
                        {/* Data Sources */}
                        <div className="border-b border-gray-800 p-4">
                            <h3 className="text-sm font-bold mb-3 flex items-center gap-2 text-white">
                                <DatabaseIcon className="w-4 h-4 text-blue-400" />
                                Data Sources
                            </h3>
                            <div className="space-y-1 text-sm">
                                {dataStreams.map(stream => (
                                    <div 
                                        key={stream.id}
                                        className={`p-2 hover:bg-gray-800 rounded cursor-pointer transition-colors flex justify-between items-center ${
                                            selectedStream?.id === stream.id ? "bg-gray-800 text-blue-400" : "text-gray-400"
                                        }`}
                                        onClick={() => setSelectedStream(stream)}
                                    >
                                        <div className="flex items-center gap-2">
                                            <div className={`w-2 h-2 rounded-full ${
                                                stream.status === "active" ? "bg-green-400" :
                                                stream.status === "processing" ? "bg-yellow-400" :
                                                stream.status === "error" ? "bg-red-400" : "bg-gray-400"
                                            }`} />
                                            <span>{stream.name}</span>
                                        </div>
                                        <span className="text-xs text-gray-500">{(stream.records / 1000).toFixed(1)}K</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Real-time Metrics */}
                        <div className="border-b border-gray-800 p-4">
                            <h3 className="text-sm font-bold mb-3 flex items-center gap-2 text-white">
                                <Activity className="w-4 h-4 text-green-400" />
                                Real-time Metrics
                            </h3>
                            <div className="space-y-3">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-400">Processing Rate</span>
                                    <span className="text-sm text-green-400 font-mono">
                                        {Math.floor(Math.random() * 1000 + 500)}/s
                                    </span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-400">Memory Usage</span>
                                    <span className="text-sm text-yellow-400 font-mono">
                                        {Math.floor(Math.random() * 40 + 30)}%
                                    </span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-400">Active Streams</span>
                                    <span className="text-sm text-blue-400 font-mono">
                                        {dataStreams.filter(s => s.status === "active").length}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-400">Total Records</span>
                                    <span className="text-sm text-purple-400 font-mono">
                                        {dataStreams.reduce((sum, s) => sum + s.records, 0).toLocaleString()}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* NIA AI Assistant - Enhanced */}
                        <div className="flex-1 flex flex-col">
                            <div className="p-4 border-b border-gray-800">
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center">
                                        <Zap className="w-4 h-4 text-white" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-white">NIA - Data Scientist</h3>
                                        <p className="text-xs text-gray-400">AI-powered analytics engine</p>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="flex-1 flex flex-col p-4">
                                {/* AI Query Input */}
                                <div className="mb-4">
                                    <label className="text-xs text-gray-400 block mb-2">Ask NIA anything</label>
                                    <textarea
                                        value={aiQuery}
                                        onChange={(e) => setAiQuery(e.target.value)}
                                        placeholder="E.g., Show me student performance trends, Compare course completion rates, Find outliers in the data..."
                                        className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 h-16 resize-none focus:outline-none focus:border-blue-500"
                                    />
                                    <button
                                        onClick={runAiAnalysis}
                                        disabled={!aiQuery.trim() || isAiProcessing}
                                        className="mt-2 w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 disabled:from-gray-600 disabled:to-gray-700 text-white text-sm py-2 rounded transition-all disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                    >
                                        {isAiProcessing ? (
                                            <>
                                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                                Analyzing...
                                            </>
                                        ) : (
                                            <>
                                                <TrendingUp className="w-4 h-4" />
                                                Generate Insights
                                            </>
                                        )}
                                    </button>
                                </div>

                                {/* AI Quick Actions */}
                                <div className="mb-4">
                                    <h4 className="text-xs font-semibold text-gray-400 uppercase mb-2">Quick Analysis</h4>
                                    <div className="grid grid-cols-2 gap-2">
                                        <button className="bg-gray-800 border border-gray-700 rounded-lg p-2 text-left text-xs text-gray-300 hover:bg-gray-700 hover:border-blue-500 transition-all">
                                            <TrendingUp className="w-3 h-3 text-green-400 mb-1" />
                                            <div>Trend Analysis</div>
                                        </button>
                                        <button className="bg-gray-800 border border-gray-700 rounded-lg p-2 text-left text-xs text-gray-300 hover:bg-gray-700 hover:border-blue-500 transition-all">
                                            <PieChart className="w-3 h-3 text-purple-400 mb-1" />
                                            <div>Distribution</div>
                                        </button>
                                        <button className="bg-gray-800 border border-gray-700 rounded-lg p-2 text-left text-xs text-gray-300 hover:bg-gray-700 hover:border-blue-500 transition-all">
                                            <Scatter className="w-3 h-3 text-orange-400 mb-1" />
                                            <div>Correlation</div>
                                        </button>
                                        <button className="bg-gray-800 border border-gray-700 rounded-lg p-2 text-left text-xs text-gray-300 hover:bg-gray-700 hover:border-blue-500 transition-all">
                                            <Activity className="w-3 h-3 text-blue-400 mb-1" />
                                            <div>Anomaly Detection</div>
                                        </button>
                                    </div>
                                </div>

                                {/* AI Insights */}
                                <div className="flex-1">
                                    <h4 className="text-xs font-semibold text-gray-400 uppercase mb-3">Recent Insights</h4>
                                    <div className="space-y-2">
                                        <div className="bg-gray-800 border border-gray-700 rounded-lg p-3">
                                            <div className="flex items-center gap-2 mb-1">
                                                <TrendingUp className="w-3 h-3 text-green-400" />
                                                <span className="text-xs text-green-400 font-medium">Performance Trend</span>
                                            </div>
                                            <p className="text-xs text-gray-300">
                                                Student scores increased by 12% over the last semester
                                            </p>
                                        </div>
                                        <div className="bg-gray-800 border border-gray-700 rounded-lg p-3">
                                            <div className="flex items-center gap-2 mb-1">
                                                <AlertCircle className="w-3 h-3 text-yellow-400" />
                                                <span className="text-xs text-yellow-400 font-medium">Anomaly Detected</span>
                                            </div>
                                            <p className="text-xs text-gray-300">
                                                Unusual drop in attendance for Science courses
                                            </p>
                                        </div>
                                        <div className="bg-gray-800 border border-gray-700 rounded-lg p-3">
                                            <div className="flex items-center gap-2 mb-1">
                                                <CheckCircle className="w-3 h-3 text-blue-400" />
                                                <span className="text-xs text-blue-400 font-medium">Correlation Found</span>
                                            </div>
                                            <p className="text-xs text-gray-300">
                                                Strong correlation (0.82) between study hours and scores
                                            </p>
                                        </div>
                                    </div>

                                    {/* Processing History */}
                                    {processingPipelines.length > 0 && (
                                        <div className="mt-4">
                                            <h4 className="text-xs font-semibold text-gray-400 uppercase mb-2">Processing History</h4>
                                            <div className="space-y-1">
                                                {processingPipelines.slice(-3).map(pipeline => (
                                                    <div key={pipeline.id} className="text-xs text-gray-500 flex justify-between">
                                                        <span>{pipeline.name}</span>
                                                        <span className={pipeline.status === "completed" ? "text-green-400" : "text-yellow-400"}>
                                                            {pipeline.status}
                                                        </span>
                                                    </div>
                                                ))}
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
