/*
AZORA PROPRIETARY LICENSE
Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

RICH NOTE EDITOR
Advanced note-taking with rich text formatting and auto-save
*/

import React, { useState, useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import {
    Bold, Italic, List, ListOrdered, Code, Quote, Undo, Redo,
    Save, Sparkles, Search, FileText
} from 'lucide-react';
import { motion } from 'framer-motion';

interface RichNoteEditorProps {
    initialContent?: string;
    onSave?: (content: string) => void;
}

export function RichNoteEditor({ initialContent = '', onSave }: RichNoteEditorProps) {
    const [isSaving, setIsSaving] = useState(false);
    const [lastSaved, setLastSaved] = useState<Date | null>(null);
    const [searchQuery, setSearchQuery] = useState('');

    const editor = useEditor({
        extensions: [
            StarterKit,
        ],
        content: initialContent || '<h2>My Notes</h2><p>Start taking notes here...</p>',
        editorProps: {
            attributes: {
                class: 'prose prose-invert max-w-none focus:outline-none p-6',
            },
        },
    });

    // Auto-save every 30 seconds
    useEffect(() => {
        if (!editor) return;

        const interval = setInterval(() => {
            handleSave();
        }, 30000);

        return () => clearInterval(interval);
    }, [editor]);

    const handleSave = async () => {
        if (!editor) return;

        setIsSaving(true);
        const content = editor.getHTML();

        try {
            // Call save API
            if (onSave) {
                await onSave(content);
            }
            setLastSaved(new Date());
        } catch (error) {
            console.error('Failed to save notes:', error);
        } finally {
            setIsSaving(false);
        }
    };

    const askElaraToSummarize = () => {
        if (!editor) return;
        const content = editor.getText();
        // This would call Elara AI to summarize
        console.log('Asking Elara to summarize:', content);
    };

    if (!editor) {
        return <div className="flex items-center justify-center h-full text-gray-400">Loading editor...</div>;
    }

    return (
        <div className="flex flex-col h-full bg-[#1e1e1e] rounded-xl overflow-hidden">
            {/* Toolbar */}
            <div className="bg-[#2d2d2d] p-3 border-b border-gray-700 flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-blue-400" />

                    {/* Formatting Buttons */}
                    <div className="flex gap-1">
                        <button
                            onClick={() => editor.chain().focus().toggleBold().run()}
                            className={`p-2 rounded transition-colors ${editor.isActive('bold')
                                ? 'bg-blue-600 text-white'
                                : 'text-gray-400 hover:bg-gray-700'
                                }`}
                        >
                            <Bold className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => editor.chain().focus().toggleItalic().run()}
                            className={`p-2 rounded transition-colors ${editor.isActive('italic')
                                ? 'bg-blue-600 text-white'
                                : 'text-gray-400 hover:bg-gray-700'
                                }`}
                        >
                            <Italic className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => editor.chain().focus().toggleCode().run()}
                            className={`p-2 rounded transition-colors ${editor.isActive('code')
                                ? 'bg-blue-600 text-white'
                                : 'text-gray-400 hover:bg-gray-700'
                                }`}
                        >
                            <Code className="w-4 h-4" />
                        </button>
                    </div>

                    <div className="w-px h-6 bg-gray-700" />

                    <div className="flex gap-1">
                        <button
                            onClick={() => editor.chain().focus().toggleBulletList().run()}
                            className={`p-2 rounded transition-colors ${editor.isActive('bulletList')
                                ? 'bg-blue-600 text-white'
                                : 'text-gray-400 hover:bg-gray-700'
                                }`}
                        >
                            <List className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => editor.chain().focus().toggleOrderedList().run()}
                            className={`p-2 rounded transition-colors ${editor.isActive('orderedList')
                                ? 'bg-blue-600 text-white'
                                : 'text-gray-400 hover:bg-gray-700'
                                }`}
                        >
                            <ListOrdered className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => editor.chain().focus().toggleBlockquote().run()}
                            className={`p-2 rounded transition-colors ${editor.isActive('blockquote')
                                ? 'bg-blue-600 text-white'
                                : 'text-gray-400 hover:bg-gray-700'
                                }`}
                        >
                            <Quote className="w-4 h-4" />
                        </button>
                    </div>

                    <div className="w-px h-6 bg-gray-700" />

                    <div className="flex gap-1">
                        <button
                            onClick={() => editor.chain().focus().undo().run()}
                            disabled={!editor.can().undo()}
                            className="p-2 rounded text-gray-400 hover:bg-gray-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                        >
                            <Undo className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => editor.chain().focus().redo().run()}
                            disabled={!editor.can().redo()}
                            className="p-2 rounded text-gray-400 hover:bg-gray-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                        >
                            <Redo className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={askElaraToSummarize}
                        className="px-3 py-1.5 bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/30 rounded-lg text-purple-300 text-sm font-semibold flex items-center gap-2 transition-all"
                    >
                        <Sparkles className="w-4 h-4" />
                        Summarize
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="px-3 py-1.5 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg text-white text-sm font-semibold flex items-center gap-2 transition-all"
                    >
                        <Save className="w-4 h-4" />
                        {isSaving ? 'Saving...' : 'Save'}
                    </button>
                </div>
            </div>

            {/* Auto-save indicator */}
            {lastSaved && (
                <div className="bg-[#2d2d2d] px-4 py-1 border-b border-gray-700">
                    <p className="text-xs text-gray-500">
                        Last saved: {lastSaved.toLocaleTimeString()}
                    </p>
                </div>
            )}

            {/* Editor Content */}
            <div className="flex-1 overflow-y-auto bg-[#1e1e1e]">
                <EditorContent editor={editor} />
            </div>

            {/* Word Count */}
            <div className="bg-[#2d2d2d] px-4 py-2 border-t border-gray-700 flex items-center justify-between">
                <div className="text-xs text-gray-500">
                    {editor.storage.characterCount?.characters() || 0} characters • {editor.storage.characterCount?.words() || 0} words
                </div>
                <div className="text-xs text-gray-500">
                    Markdown supported
                </div>
            </div>
        </div>
    );
}
