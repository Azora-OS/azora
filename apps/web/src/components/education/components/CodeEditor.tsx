/*
AZORA PROPRIETARY LICENSE
Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

CODE EDITOR COMPONENT
Monaco-based code editor with multi-language support and execution
*/

import React, { useState } from 'react';
import Editor from '@monaco-editor/react';
import { Play, Save, FileCode, ChevronDown, Sparkles, Terminal } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface CodeEditorProps {
    initialCode?: string;
    initialLanguage?: string;
}

export function CodeEditor({ initialCode = '', initialLanguage = 'python' }: CodeEditorProps) {
    const [code, setCode] = useState(initialCode || getDefaultCode(initialLanguage));
    const [language, setLanguage] = useState(initialLanguage);
    const [output, setOutput] = useState('');
    const [isRunning, setIsRunning] = useState(false);
    const [showOutput, setShowOutput] = useState(false);

    const languages = [
        { id: 'python', name: 'Python', icon: '🐍' },
        { id: 'javascript', name: 'JavaScript', icon: '⚡' },
        { id: 'typescript', name: 'TypeScript', icon: '📘' },
        { id: 'java', name: 'Java', icon: '☕' },
        { id: 'cpp', name: 'C++', icon: '⚙️' },
        { id: 'html', name: 'HTML', icon: '🌐' },
        { id: 'css', name: 'CSS', icon: '🎨' },
    ];

    function getDefaultCode(lang: string): string {
        const defaults: Record<string, string> = {
            python: '# Welcome to the Code Editor!\n# Write your Python code here\n\ndef hello_world():\n    print("Hello from Azora!")\n\nhello_world()',
            javascript: '// Welcome to the Code Editor!\n// Write your JavaScript code here\n\nfunction helloWorld() {\n    console.log("Hello from Azora!");\n}\n\nhelloWorld();',
            typescript: '// Welcome to the Code Editor!\n// Write your TypeScript code here\n\nfunction helloWorld(): void {\n    console.log("Hello from Azora!");\n}\n\nhelloWorld();',
            java: '// Welcome to the Code Editor!\n// Write your Java code here\n\npublic class Main {\n    public static void main(String[] args) {\n        System.out.println("Hello from Azora!");\n    }\n}',
            cpp: '// Welcome to the Code Editor!\n// Write your C++ code here\n\n#include <iostream>\n\nint main() {\n    std::cout << "Hello from Azora!" << std::endl;\n    return 0;\n}',
            html: '<!-- Welcome to the Code Editor! -->\n<!-- Write your HTML code here -->\n\n<!DOCTYPE html>\n<html>\n<head>\n    <title>Azora</title>\n</head>\n<body>\n    <h1>Hello from Azora!</h1>\n</body>\n</html>',
            css: '/* Welcome to the Code Editor! */\n/* Write your CSS code here */\n\nbody {\n    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);\n    color: white;\n    font-family: Arial, sans-serif;\n}',
        };
        return defaults[lang] || defaults.python;
    }

    const handleLanguageChange = (newLang: string) => {
        setLanguage(newLang);
        setCode(getDefaultCode(newLang));
        setOutput('');
        setShowOutput(false);
    };

    const runCode = async () => {
        setIsRunning(true);
        setShowOutput(true);
        setOutput('Running code...\n');

        try {
            if (language === 'javascript' || language === 'typescript') {
                // Run JavaScript in browser
                const result = eval(code);
                setOutput(`✅ Code executed successfully!\n\nOutput:\n${result !== undefined ? result : '(no return value)'}`);
            } else if (language === 'python') {
                // For Python, we'd need Pyodide or backend API
                setOutput('⚠️ Python execution requires backend service.\n\nPlease set up the code execution API endpoint.');
            } else {
                setOutput(`⚠️ ${language} execution requires backend service.\n\nPlease set up the code execution API endpoint.`);
            }
        } catch (error: any) {
            setOutput(`❌ Error:\n${error.message}\n\n${error.stack || ''}`);
        } finally {
            setIsRunning(false);
        }
    };

    const askElaraForHelp = () => {
        // This would integrate with Elara AI
        setOutput('🤖 Elara AI: Let me help you with your code...\n\n(This would connect to the AI service)');
        setShowOutput(true);
    };

    return (
        <div className="flex flex-col h-full bg-[#1e1e1e] rounded-xl overflow-hidden">
            {/* Toolbar */}
            <div className="bg-[#2d2d2d] p-3 border-b border-gray-700 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <FileCode className="w-5 h-5 text-blue-400" />

                    {/* Language Selector */}
                    <div className="relative">
                        <select
                            value={language}
                            onChange={(e) => handleLanguageChange(e.target.value)}
                            className="bg-[#3c3c3c] text-white px-3 py-1.5 pr-8 rounded-lg text-sm font-medium appearance-none cursor-pointer hover:bg-[#4c4c4c] transition-colors"
                        >
                            {languages.map((lang) => (
                                <option key={lang.id} value={lang.id}>
                                    {lang.icon} {lang.name}
                                </option>
                            ))}
                        </select>
                        <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={askElaraForHelp}
                        className="px-3 py-1.5 bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/30 rounded-lg text-purple-300 text-sm font-semibold flex items-center gap-2 transition-all"
                    >
                        <Sparkles className="w-4 h-4" />
                        Ask Elara
                    </button>
                    <button
                        onClick={runCode}
                        disabled={isRunning}
                        className="px-4 py-1.5 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg text-white text-sm font-semibold flex items-center gap-2 transition-all"
                    >
                        <Play className="w-4 h-4" />
                        {isRunning ? 'Running...' : 'Run Code'}
                    </button>
                </div>
            </div>

            {/* Editor */}
            <div className="flex-1 overflow-hidden">
                <Editor
                    height="100%"
                    language={language}
                    value={code}
                    onChange={(value) => setCode(value || '')}
                    theme="vs-dark"
                    options={{
                        minimap: { enabled: false },
                        fontSize: 14,
                        lineNumbers: 'on',
                        roundedSelection: true,
                        scrollBeyondLastLine: false,
                        automaticLayout: true,
                        tabSize: 4,
                        wordWrap: 'on',
                    }}
                />
            </div>

            {/* Output Panel */}
            <AnimatePresence>
                {showOutput && (
                    <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: '200px' }}
                        exit={{ height: 0 }}
                        className="bg-[#1e1e1e] border-t border-gray-700 overflow-hidden"
                    >
                        <div className="h-full flex flex-col">
                            <div className="bg-[#2d2d2d] px-4 py-2 border-b border-gray-700 flex items-center justify-between">
                                <div className="flex items-center gap-2 text-gray-300 text-sm font-semibold">
                                    <Terminal className="w-4 h-4" />
                                    Output
                                </div>
                                <button
                                    onClick={() => setShowOutput(false)}
                                    className="text-gray-400 hover:text-white text-xs"
                                >
                                    Close
                                </button>
                            </div>
                            <div className="flex-1 overflow-y-auto p-4">
                                <pre className="text-gray-300 text-sm font-mono whitespace-pre-wrap">
                                    {output}
                                </pre>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
