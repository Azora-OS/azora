'use client';

import React from 'react';
import Editor, { useMonaco } from '@monaco-editor/react';
import { Loader2 } from 'lucide-react';

interface AzStudioProps {
    code: string;
    language?: string;
    onChange?: (value: string | undefined) => void;
    readOnly?: boolean;
    theme?: 'vs-dark' | 'light';
    height?: string;
}

export function AzStudio({
    code,
    language = 'typescript',
    onChange,
    readOnly = false,
    theme = 'vs-dark',
    height = "100%"
}: AzStudioProps) {
    const monaco = useMonaco();

    React.useEffect(() => {
        if (monaco) {
            // Configure custom theme to match Azora's "Dark Glass & Neon" aesthetic
            monaco.editor.defineTheme('azora-dark', {
                base: 'vs-dark',
                inherit: true,
                rules: [
                    { token: 'comment', foreground: '6b7280', fontStyle: 'italic' },
                    { token: 'keyword', foreground: 'c084fc' }, // Purple
                    { token: 'string', foreground: '4ade80' }, // Green
                    { token: 'number', foreground: '60a5fa' }, // Blue
                    { token: 'type', foreground: '2dd4bf' }, // Teal
                ],
                colors: {
                    'editor.background': '#0d111700', // Transparent for glass effect
                    'editor.lineHighlightBackground': '#ffffff05',
                    'editorCursor.foreground': '#3b82f6',
                    'editor.selectionBackground': '#3b82f630',
                    'editorLineNumber.foreground': '#4b5563',
                    'editorLineNumber.activeForeground': '#e5e7eb',
                }
            });
            monaco.editor.setTheme('azora-dark');
        }
    }, [monaco]);

    return (
        <div className="w-full relative group" style={{ height }}>
            {/* Glass effect background */}
            <div className="absolute inset-0 bg-[#0d1117]/80 backdrop-blur-sm -z-10" />

            <Editor
                height="100%"
                defaultLanguage={language}
                language={language}
                value={code}
                onChange={onChange}
                theme="azora-dark"
                loading={<div className="flex items-center justify-center h-full text-blue-500"><Loader2 className="animate-spin mr-2" /> Loading AzStudio...</div>}
                options={{
                    readOnly,
                    minimap: { enabled: true },
                    fontSize: 14,
                    fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                    fontLigatures: true,
                    scrollBeyondLastLine: false,
                    smoothScrolling: true,
                    cursorBlinking: 'smooth',
                    cursorSmoothCaretAnimation: 'on',
                    padding: { top: 16, bottom: 16 },
                    renderLineHighlight: 'all',
                    lineNumbers: 'on',
                    glyphMargin: false,
                    folding: true,
                    lineDecorationsWidth: 10,
                    lineNumbersMinChars: 3,
                    automaticLayout: true,
                    contextmenu: true,
                }}
            />
        </div>
    );
}
