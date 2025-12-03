import React from 'react';
import { Calculator, FlaskConical, Code2, Globe, BrainCircuit, Play } from 'lucide-react';
import { useSimulationsQuery } from '@azora/api-client/react-query-hooks';

// Icon mapping for simulation types
const ICON_MAP: Record<string, any> = {
    math: Calculator,
    science: FlaskConical,
    coding: Code2,
    history: Globe,
    ai: BrainCircuit,
};

const COLOR_MAP: Record<string, string> = {
    math: 'bg-blue-500',
    science: 'bg-green-500',
    coding: 'bg-yellow-500',
    history: 'bg-red-500',
    ai: 'bg-purple-500',
};

interface Simulation {
    id: string;
    title: string;
    desc?: string;
    description?: string;
    type?: string;
    subject?: string;
}

export const SimulationHub: React.FC = () => {
    const { data: simulationsData, isLoading: loading } = useSimulationsQuery();

    const simulations = simulationsData?.data || [
        { id: 'math', title: 'Quantum Math', type: 'math', desc: 'Explore complex numbers and quantum states' },
        { id: 'science', title: 'Bio-Lab', type: 'science', desc: 'Simulate genetic modification and evolution' },
        { id: 'coding', title: 'Algo-Vis', type: 'coding', desc: 'Visualize sorting algorithms and data structures' },
        { id: 'history', title: 'Time Warp', type: 'history', desc: 'Interactive historical event simulation' },
        { id: 'ai', title: 'Neural Net', type: 'ai', desc: 'Build and train your own neural networks' },
    ];

    if (loading) {
        return (
            <div className="h-full bg-slate-900 p-8 text-white flex items-center justify-center">
                <div className="text-white/60">Loading simulations...</div>
            </div>
        );
    }

    return (
        <div className="h-full bg-slate-900 p-8 text-white overflow-y-auto">
            <div className="max-w-5xl mx-auto">
                <h1 className="text-3xl font-bold mb-2">Simulation Hub</h1>
                <p className="text-white/60 mb-8">Interactive learning experiences powered by Azora Sapiens</p>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {simulations.map(sim => {
                        const simType = sim.type || sim.subject || 'ai';
                        const Icon = ICON_MAP[simType] || BrainCircuit;
                        const color = COLOR_MAP[simType] || 'bg-purple-500';
                        const description = sim.desc || sim.description || 'Interactive simulation';

                        return (
                            <div
                                key={sim.id}
                                className="group relative bg-white/5 border border-white/10 rounded-xl p-6 hover:bg-white/10 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl cursor-pointer overflow-hidden"
                            >
                                <div className={`absolute top-0 right-0 w-24 h-24 ${color} opacity-10 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-150`} />

                                <div className={`w-12 h-12 ${color} rounded-lg flex items-center justify-center mb-4 shadow-lg`}>
                                    <Icon size={24} className="text-white" />
                                </div>

                                <h3 className="text-xl font-bold mb-2">{sim.title}</h3>
                                <p className="text-sm text-white/60 mb-6">{description}</p>

                                <button className="w-full py-2 bg-white/5 hover:bg-white/20 rounded-lg flex items-center justify-center gap-2 transition-colors font-medium text-sm">
                                    <Play size={16} /> Launch Simulation
                                </button>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};
