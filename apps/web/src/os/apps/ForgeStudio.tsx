import React, { useState, useEffect } from 'react';
import { Terminal as TerminalIcon, DollarSign, Users, GitBranch, Play, Settings, Folder, FileCode, Github, Sparkles, Code2 } from 'lucide-react';
import { useBusinessesQuery } from '@azora/api-client/react-query-hooks';
import { getCodeExecutor } from '@/lib/codeExecutor';
import { getGitHubService } from '@/lib/github';
import { getElaraCodeService } from '@/lib/elaraCode';

export const ForgeStudio: React.FC = () => {
    const { data: businessesData, isLoading: loading } = useBusinessesQuery();
    const [activeFile, setActiveFile] = useState('/index.js');
    const [code, setCode] = useState('');
    const [output, setOutput] = useState('');
    const [isRunning, setIsRunning] = useState(false);
    const [showGitHub, setShowGitHub] = useState(false);
    const [showElara, setShowElara] = useState(false);
    const [elaraPrompt, setElaraPrompt] = useState('');

    const executor = getCodeExecutor();
    const github = getGitHubService();
    const elaraCode = getElaraCodeService();

    const businesses = businessesData?.data || [];
    const business = businesses.find((b: any) => b.status === 'active') || businesses[0] || null;

    const ceoMetrics = {
        equity: business ? 51 : 0,
        monthlyRevenue: business?.revenue || 0,
        teamSize: 4,
        project: business?.name || 'No Active Project'
    };

    useEffect(() => {
        const content = executor.readFile(activeFile);
        if (content) {
            setCode(content);
        }
    }, [activeFile]);

    const runCode = async () => {
        setIsRunning(true);
        setOutput('Running...\n');

        try {
            const result = await executor.executeJavaScript(code);
            setOutput(`${result.output}\n\n${result.error ? `Error: ${result.error}\n` : ''}Execution time: ${result.executionTime.toFixed(2)}ms`);
        } catch (err) {
            setOutput(`Error: ${err instanceof Error ? err.message : String(err)}`);
        }

        setIsRunning(false);
    };

    const saveFile = () => {
        executor.updateFile(activeFile, code);
        setOutput(prev => prev + `\nFile saved: ${activeFile}`);
    };

    const askElaraForCode = async () => {
        if (!elaraPrompt.trim()) return;

        setOutput('Asking Elara to generate code...\n');
        try {
            const result = await elaraCode.generateCode({
                prompt: elaraPrompt,
                language: 'javascript',
                context: code
            });

            setCode(result.code);
            setOutput(`Elara says: ${result.explanation}\n\nCode generated successfully!`);
            setElaraPrompt('');
            setShowElara(false);
        } catch (err) {
            setOutput(`Error: ${err instanceof Error ? err.message : String(err)}`);
        }
    };

    if (loading) {
        return (
            <div className="flex h-full bg-[#1e1e1e] items-center justify-center">
                <div className="text-gray-400">Loading Forge Studio...</div>
            </div>
        );
    }

    const storageInfo = executor.getStorageInfo();

    return (
        <div className="flex h-full bg-[#1e1e1e] text-gray-300 font-mono text-sm">
            {/* Activity Bar */}
            <div className="w-12 bg-[#333] flex flex-col items-center py-4 gap-6 border-r border-black/20">
                <FileCode size={24} className="text-white cursor-pointer" />
                <GitBranch
                    size={24}
                    className="text-gray-500 hover:text-white cursor-pointer transition-colors"
                    onClick={() => setShowGitHub(!showGitHub)}
                />
                <Sparkles
                    size={24}
                    className="text-purple-400 hover:text-purple-300 cursor-pointer transition-colors"
                    onClick={() => setShowElara(!showElara)}
                />
                <Settings size={24} className="text-gray-500 hover:text-white cursor-pointer transition-colors mt-auto" />
            </div>

            {/* Sidebar - Explorer */}
            <div className="w-60 bg-[#252526] flex flex-col border-r border-black/20">
                <div className="p-3 text-xs font-bold uppercase tracking-wider text-gray-500">Explorer</div>
                <div className="px-2 flex-1 overflow-y-auto">
                    {executor.listFiles().map(file => (
                        <div
                            key={file}
                            onClick={() => setActiveFile(file)}
                            className={`flex items-center gap-2 p-1 hover:bg-[#2a2d2e] cursor-pointer ${activeFile === file ? 'bg-[#37373d]' : ''}`}
                        >
                            <FileCode size={14} className="text-blue-400" />
                            <span className={activeFile === file ? 'text-white' : ''}>{file}</span>
                        </div>
                    ))}
                </div>

                {/* Storage Info */}
                <div className="p-3 border-t border-white/5">
                    <div className="text-xs text-gray-500 mb-1">Storage: {(storageInfo.used / 1024 / 1024).toFixed(2)}MB / 100MB</div>
                    <div className="h-1 bg-gray-700 rounded-full overflow-hidden">
                        <div className="h-full bg-purple-500" style={{ width: `${storageInfo.percentage}%` }} />
                    </div>
                </div>

                {/* Student CEO Dashboard Widget */}
                <div className="p-4 bg-black/20 border-t border-white/5">
                    <div className="text-xs font-bold text-emerald-400 mb-3 flex items-center gap-2">
                        <DollarSign size={14} /> STUDENT CEO
                    </div>
                    <div className="space-y-2 text-xs">
                        <div className="flex justify-between">
                            <span className="text-gray-500">Equity</span>
                            <span className="text-white font-semibold">{ceoMetrics.equity}%</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-500">Revenue</span>
                            <span className="text-emerald-400 font-semibold">${ceoMetrics.monthlyRevenue}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-500">Team</span>
                            <span className="text-white">{ceoMetrics.teamSize}</span>
                        </div>
                        <div className="pt-2 border-t border-white/5">
                            <div className="text-gray-500 mb-1">Project</div>
                            <div className="text-white text-xs truncate">{ceoMetrics.project}</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Editor Area */}
            <div className="flex-1 flex flex-col">
                {/* Tab Bar */}
                <div className="h-9 bg-[#252526] flex items-center px-2 border-b border-black/20">
                    <div className="px-3 py-1 bg-[#1e1e1e] text-white text-xs flex items-center gap-2">
                        <FileCode size={12} />
                        {activeFile}
                    </div>
                    <div className="ml-auto flex items-center gap-2">
                        <button
                            onClick={saveFile}
                            className="px-3 py-1 text-xs bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"
                        >
                            Save
                        </button>
                        <button
                            onClick={runCode}
                            disabled={isRunning}
                            className="px-3 py-1 text-xs bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white rounded transition-colors flex items-center gap-1"
                        >
                            <Play size={12} />
                            Run
                        </button>
                    </div>
                </div>

                {/* Code Editor */}
                <div className="flex-1 flex">
                    <textarea
                        value={code}
                        onChange={(e) => setCode(e.target.value)}
                        className="flex-1 bg-[#1e1e1e] text-gray-300 p-4 font-mono text-sm resize-none focus:outline-none"
                        spellCheck={false}
                        style={{ tabSize: 2 }}
                    />
                </div>

                {/* Terminal/Output */}
                <div className="h-48 bg-black border-t border-white/10 flex flex-col">
                    <div className="h-8 bg-[#252526] flex items-center px-3 text-xs text-gray-400 border-b border-white/5">
                        <TerminalIcon size={14} className="mr-2" />
                        Terminal
                    </div>
                    <div className="flex-1 p-3 overflow-y-auto">
                        <pre className="text-xs text-gray-300 whitespace-pre-wrap font-mono">{output || 'Ready to run code...'}</pre>
                    </div>
                </div>
            </div>

            {/* GitHub Panel */}
            {showGitHub && (
                <div className="w-80 bg-[#252526] border-l border-black/20 p-4">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-bold text-white flex items-center gap-2">
                            <Github size={16} />
                            GitHub
                        </h3>
                        <button onClick={() => setShowGitHub(false)} className="text-gray-500 hover:text-white">×</button>
                    </div>
                    <div className="space-y-3">
                        <input
                            type="text"
                            placeholder="GitHub Token"
                            className="w-full px-3 py-2 bg-[#1e1e1e] border border-white/10 rounded text-xs text-white focus:outline-none focus:border-blue-500"
                            onChange={(e) => github.setToken(e.target.value)}
                        />
                        <button className="w-full px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded transition-colors">
                            Connect GitHub
                        </button>
                        <div className="text-xs text-gray-500 mt-4">
                            <p>Features:</p>
                            <ul className="list-disc list-inside mt-2 space-y-1">
                                <li>Browse repositories</li>
                                <li>Clone to virtual FS</li>
                                <li>Commit & push</li>
                                <li>Create pull requests</li>
                            </ul>
                        </div>
                    </div>
                </div>
            )}

            {/* Elara Code Assistant Panel */}
            {showElara && (
                <div className="w-80 bg-[#252526] border-l border-black/20 p-4">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-bold text-white flex items-center gap-2">
                            <Sparkles size={16} className="text-purple-400" />
                            Elara Code Assistant
                        </h3>
                        <button onClick={() => setShowElara(false)} className="text-gray-500 hover:text-white">×</button>
                    </div>
                    <div className="space-y-3">
                        <textarea
                            value={elaraPrompt}
                            onChange={(e) => setElaraPrompt(e.target.value)}
                            placeholder="Ask Elara to write code... (e.g., 'Create a function to sort an array')"
                            className="w-full px-3 py-2 bg-[#1e1e1e] border border-white/10 rounded text-xs text-white focus:outline-none focus:border-purple-500 resize-none h-24"
                        />
                        <button
                            onClick={askElaraForCode}
                            className="w-full px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs rounded transition-colors flex items-center justify-center gap-2"
                        >
                            <Code2 size={14} />
                            Generate Code
                        </button>
                        <div className="text-xs text-gray-500 mt-4">
                            <p>Elara can:</p>
                            <ul className="list-disc list-inside mt-2 space-y-1">
                                <li>Generate code</li>
                                <li>Explain code</li>
                                <li>Debug errors</li>
                                <li>Review code quality</li>
                            </ul>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
