"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Plus, Image as ImageIcon, Type, Layout, Trash2 } from "lucide-react";
import dynamic from "next/dynamic";

const MonacoEditor = dynamic(() => import("@monaco-editor/react"), { ssr: false });

interface Slide {
    id: string;
    title: string;
    content: string;
    notes: string;
}

const INITIAL_SLIDES: Slide[] = [
    {
        id: '1',
        title: 'Project Overview',
        content: '# Welcome to Project Azora\n\nBuilding the future of AI-assisted development.',
        notes: 'Start with a strong hook about the problem space.'
    },
    {
        id: '2',
        title: 'Architecture',
        content: '## System Design\n\n- Microservices architecture\n- Event-driven communication\n- AI-first core',
        notes: 'Explain the decision to use Next.js and Python services.'
    }
];

export default function SlideEditor() {
    const [slides, setSlides] = useState<Slide[]>(INITIAL_SLIDES);
    const [activeSlideId, setActiveSlideId] = useState<string>(INITIAL_SLIDES[0].id);

    const activeSlide = slides.find(s => s.id === activeSlideId) || slides[0];

    const addSlide = () => {
        const newSlide = {
            id: Date.now().toString(),
            title: 'New Slide',
            content: '# New Slide\n\nAdd content here.',
            notes: ''
        };
        setSlides([...slides, newSlide]);
        setActiveSlideId(newSlide.id);
    };

    const updateSlide = (field: keyof Slide, value: string) => {
        setSlides(slides.map(s => s.id === activeSlideId ? { ...s, [field]: value } : s));
    };

    return (
        <div className="h-full flex bg-background">
            {/* Slide List */}
            <div className="w-48 border-r flex flex-col bg-muted/10">
                <div className="p-2 border-b">
                    <Button onClick={addSlide} className="w-full gap-2" variant="outline" size="sm">
                        <Plus className="w-4 h-4" />
                        New Slide
                    </Button>
                </div>
                <div className="flex-1 overflow-y-auto p-2 space-y-2">
                    {slides.map((slide, index) => (
                        <div
                            key={slide.id}
                            onClick={() => setActiveSlideId(slide.id)}
                            className={`p-2 rounded-md border cursor-pointer transition-colors ${activeSlideId === slide.id
                                    ? 'bg-red-500/10 border-red-500/50'
                                    : 'bg-card hover:bg-accent'
                                }`}
                        >
                            <div className="text-xs font-semibold truncate mb-1">
                                {index + 1}. {slide.title}
                            </div>
                            <div className="aspect-video bg-background rounded border border-dashed flex items-center justify-center text-[8px] text-muted-foreground overflow-hidden p-1">
                                {slide.content.substring(0, 30)}...
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Editor Area */}
            <div className="flex-1 flex flex-col">
                <div className="flex-1 p-8 bg-slate-100 dark:bg-slate-900 overflow-y-auto flex items-center justify-center">
                    <Card className="aspect-video w-full max-w-4xl bg-white dark:bg-black shadow-2xl p-8 flex flex-col">
                        <input
                            className="text-3xl font-bold bg-transparent border-none outline-none mb-4 placeholder:text-muted-foreground/50"
                            value={activeSlide.title}
                            onChange={(e) => updateSlide('title', e.target.value)}
                            placeholder="Slide Title"
                        />
                        <textarea
                            className="flex-1 w-full resize-none bg-transparent border-none outline-none text-lg font-medium leading-relaxed"
                            value={activeSlide.content}
                            onChange={(e) => updateSlide('content', e.target.value)}
                            placeholder="Markdown content..."
                        />
                    </Card>
                </div>

                {/* Speaker Notes */}
                <div className="h-32 border-t bg-background p-4">
                    <label className="text-xs font-semibold text-muted-foreground mb-2 block">Speaker Notes</label>
                    <textarea
                        className="w-full h-full bg-transparent border-none outline-none resize-none text-sm"
                        value={activeSlide.notes}
                        onChange={(e) => updateSlide('notes', e.target.value)}
                        placeholder="Add speaker notes here..."
                    />
                </div>
            </div>
        </div>
    );
}
