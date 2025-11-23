/*
AZORA PROPRIETARY LICENSE
Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

SIMULATION VIEWER COMPONENT
PhET simulation browser and viewer
*/

import React, { useState, useEffect } from 'react';
import { Beaker, Search, Filter, Play, X, ExternalLink } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { apiClient } from '@/lib/api-client';

interface Simulation {
    id: string;
    name: string;
    subject: string;
    grade: string;
    source: 'phet' | 'custom';
    url?: string;
}

interface SimulationViewerProps {
    onClose?: () => void;
}

export function SimulationViewer({ onClose }: SimulationViewerProps) {
    const [simulations, setSimulations] = useState<Simulation[]>([]);
    const [filteredSims, setFilteredSims] = useState<Simulation[]>([]);
    const [selectedSim, setSelectedSim] = useState<Simulation | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedSubject, setSelectedSubject] = useState<string>('all');
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadSimulations();
    }, []);

    useEffect(() => {
        filterSimulations();
    }, [searchQuery, selectedSubject, simulations]);

    const loadSimulations = async () => {
        try {
            const response = await apiClient.getSimulations();
            setSimulations(response.simulations || []);
        } catch (error) {
            console.error('Failed to load simulations:', error);
            // Fallback to mock data
            setSimulations(getMockSimulations());
        } finally {
            setIsLoading(false);
        }
    };

    const filterSimulations = () => {
        let filtered = simulations;

        if (searchQuery) {
            filtered = filtered.filter((sim) =>
                sim.name.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        if (selectedSubject !== 'all') {
            filtered = filtered.filter((sim) => sim.subject === selectedSubject);
        }

        setFilteredSims(filtered);
    };

    const subjects = ['all', 'physics', 'chemistry', 'biology', 'math', 'earthScience'];

    const getSimulationUrl = (sim: Simulation): string => {
        if (sim.url) return sim.url;
        if (sim.source === 'phet') {
            return `https://phet.colorado.edu/sims/html/${sim.id}/latest/${sim.id}_en.html`;
        }
        return '';
    };

    return (
        <div className="flex flex-col h-full bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl border border-cyan-500/30 overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-cyan-900/50 to-blue-900/50 p-4 border-b border-cyan-500/30">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full flex items-center justify-center">
                            <Beaker className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-white">Interactive Simulations</h3>
                            <p className="text-xs text-cyan-300">PhET + Custom Simulations</p>
                        </div>
                    </div>
                    {onClose && (
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-white transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    )}
                </div>
            </div>

            {selectedSim ? (
                /* Simulation Player */
                <div className="flex-1 flex flex-col">
                    <div className="p-4 bg-gray-900/50 border-b border-cyan-500/30 flex items-center justify-between">
                        <div>
                            <h4 className="font-bold text-white">{selectedSim.name}</h4>
                            <p className="text-xs text-gray-400">
                                {selectedSim.subject} • {selectedSim.grade}
                            </p>
                        </div>
                        <div className="flex gap-2">
                            <a
                                href={getSimulationUrl(selectedSim)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-700 rounded-lg text-white text-sm font-semibold flex items-center gap-2 transition-colors"
                            >
                                <ExternalLink className="w-4 h-4" />
                                Open in New Tab
                            </a>
                            <button
                                onClick={() => setSelectedSim(null)}
                                className="px-3 py-1.5 bg-gray-700 hover:bg-gray-600 rounded-lg text-white text-sm font-semibold transition-colors"
                            >
                                Back to List
                            </button>
                        </div>
                    </div>
                    <div className="flex-1 bg-white">
                        <iframe
                            src={getSimulationUrl(selectedSim)}
                            className="w-full h-full border-0"
                            title={selectedSim.name}
                            allowFullScreen
                        />
                    </div>
                </div>
            ) : (
                /* Simulation Browser */
                <>
                    {/* Search and Filters */}
                    <div className="p-4 space-y-3 bg-gray-900/50 border-b border-cyan-500/30">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search simulations..."
                                className="w-full bg-gray-800/50 border border-cyan-500/20 rounded-lg pl-10 pr-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/50"
                            />
                        </div>

                        <div className="flex gap-2 overflow-x-auto pb-2">
                            {subjects.map((subject) => (
                                <button
                                    key={subject}
                                    onClick={() => setSelectedSubject(subject)}
                                    className={`px-3 py-1.5 rounded-lg text-sm font-semibold whitespace-nowrap transition-all ${selectedSubject === subject
                                            ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white'
                                            : 'bg-gray-800/50 text-gray-400 hover:bg-gray-700/50'
                                        }`}
                                >
                                    {subject === 'all' ? 'All' : subject.charAt(0).toUpperCase() + subject.slice(1)}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Simulation Grid */}
                    <div className="flex-1 overflow-y-auto p-4">
                        {isLoading ? (
                            <div className="flex items-center justify-center h-full">
                                <div className="text-center">
                                    <Beaker className="w-12 h-12 text-cyan-400 mx-auto mb-2 animate-pulse" />
                                    <p className="text-gray-400">Loading simulations...</p>
                                </div>
                            </div>
                        ) : filteredSims.length === 0 ? (
                            <div className="flex items-center justify-center h-full">
                                <div className="text-center">
                                    <Filter className="w-12 h-12 text-gray-600 mx-auto mb-2" />
                                    <p className="text-gray-400">No simulations found</p>
                                </div>
                            </div>
                        ) : (
                            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                                <AnimatePresence>
                                    {filteredSims.map((sim) => (
                                        <motion.div
                                            key={sim.id}
                                            initial={{ opacity: 0, scale: 0.9 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.9 }}
                                            className="bg-gradient-to-br from-gray-800/50 to-gray-700/50 border border-cyan-500/20 rounded-xl p-4 hover:border-cyan-500/50 hover:scale-105 transition-all cursor-pointer"
                                            onClick={() => setSelectedSim(sim)}
                                        >
                                            <div className="flex items-start justify-between mb-3">
                                                <div className="w-10 h-10 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-lg flex items-center justify-center">
                                                    <Beaker className="w-5 h-5 text-white" />
                                                </div>
                                                <span className="text-xs px-2 py-1 bg-cyan-900/30 border border-cyan-500/30 rounded-full text-cyan-300">
                                                    {sim.source === 'phet' ? 'PhET' : 'Custom'}
                                                </span>
                                            </div>
                                            <h4 className="font-bold text-white mb-1">{sim.name}</h4>
                                            <p className="text-xs text-gray-400 mb-3">
                                                {sim.subject} • {sim.grade}
                                            </p>
                                            <button className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 px-3 py-2 rounded-lg text-white text-sm font-semibold flex items-center justify-center gap-2 transition-all">
                                                <Play className="w-4 h-4" />
                                                Launch Simulation
                                            </button>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
    );
}

// Mock data fallback
function getMockSimulations(): Simulation[] {
    return [
        { id: 'forces-and-motion-basics', name: 'Forces and Motion', subject: 'physics', grade: '6-12', source: 'phet' },
        { id: 'energy-skate-park-basics', name: 'Energy Skate Park', subject: 'physics', grade: '6-12', source: 'phet' },
        { id: 'build-an-atom', name: 'Build an Atom', subject: 'chemistry', grade: '6-12', source: 'phet' },
        { id: 'ph-scale', name: 'pH Scale', subject: 'chemistry', grade: '9-12', source: 'phet' },
        { id: 'natural-selection', name: 'Natural Selection', subject: 'biology', grade: '7-12', source: 'phet' },
        { id: 'fractions-intro', name: 'Fractions Intro', subject: 'math', grade: '3-5', source: 'phet' },
    ];
}
