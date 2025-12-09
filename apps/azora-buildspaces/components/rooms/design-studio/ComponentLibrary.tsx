"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Layout, Type, Image as ImageIcon, Box, MousePointer2 } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const COMPONENTS = {
    layout: [
        { name: 'Container', icon: Box },
        { name: 'Grid', icon: Layout },
        { name: 'Stack', icon: Layout },
    ],
    basic: [
        { name: 'Button', icon: MousePointer2 },
        { name: 'Text', icon: Type },
        { name: 'Image', icon: ImageIcon },
    ],
    forms: [
        { name: 'Input', icon: Type },
        { name: 'Checkbox', icon: Box },
        { name: 'Select', icon: Box },
    ]
};

export default function ComponentLibrary() {
    return (
        <div className="h-full flex flex-col bg-background border-r">
            <div className="p-4 border-b">
                <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="Search components..." className="pl-8" />
                </div>
            </div>

            <ScrollArea className="flex-1">
                <div className="p-4">
                    <Accordion type="multiple" defaultValue={['layout', 'basic', 'forms']} className="space-y-4">
                        <AccordionItem value="layout" className="border-none">
                            <AccordionTrigger className="py-2 hover:no-underline">Layout</AccordionTrigger>
                            <AccordionContent>
                                <div className="grid grid-cols-2 gap-2">
                                    {COMPONENTS.layout.map((comp) => (
                                        <Button key={comp.name} variant="outline" className="h-20 flex flex-col gap-2 hover:border-pink-500 hover:bg-pink-500/5">
                                            <comp.icon className="w-6 h-6" />
                                            <span className="text-xs">{comp.name}</span>
                                        </Button>
                                    ))}
                                </div>
                            </AccordionContent>
                        </AccordionItem>

                        <AccordionItem value="basic" className="border-none">
                            <AccordionTrigger className="py-2 hover:no-underline">Basic</AccordionTrigger>
                            <AccordionContent>
                                <div className="grid grid-cols-2 gap-2">
                                    {COMPONENTS.basic.map((comp) => (
                                        <Button key={comp.name} variant="outline" className="h-20 flex flex-col gap-2 hover:border-pink-500 hover:bg-pink-500/5">
                                            <comp.icon className="w-6 h-6" />
                                            <span className="text-xs">{comp.name}</span>
                                        </Button>
                                    ))}
                                </div>
                            </AccordionContent>
                        </AccordionItem>

                        <AccordionItem value="forms" className="border-none">
                            <AccordionTrigger className="py-2 hover:no-underline">Forms</AccordionTrigger>
                            <AccordionContent>
                                <div className="grid grid-cols-2 gap-2">
                                    {COMPONENTS.forms.map((comp) => (
                                        <Button key={comp.name} variant="outline" className="h-20 flex flex-col gap-2 hover:border-pink-500 hover:bg-pink-500/5">
                                            <comp.icon className="w-6 h-6" />
                                            <span className="text-xs">{comp.name}</span>
                                        </Button>
                                    ))}
                                </div>
                            </AccordionContent>
                        </AccordionItem>
                    </Accordion>
                </div>
            </ScrollArea>
        </div>
    );
}
