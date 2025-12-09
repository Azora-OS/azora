"use client";

import { useState } from "react";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Cpu, Box, Code, Settings, Share2 } from "lucide-react";

import CircuitSimulator from "./maker-lab/CircuitSimulator";
import ComponentViewer from "./maker-lab/ComponentViewer";
import FirmwareEditor from "./maker-lab/FirmwareEditor";

export default function MakerLab() {
    const [activeView, setActiveView] = useState("circuit");

    return (
        <div className="h-full flex flex-col bg-background">
            {/* Toolbar */}
            <div className="h-12 border-b flex items-center justify-between px-4 bg-muted/20">
                <div className="flex items-center gap-2">
                    <div className="flex items-center gap-2 px-2 py-1 bg-orange-500/10 text-orange-500 rounded-md border border-orange-500/20">
                        <Cpu className="w-4 h-4" />
                        <span className="text-sm font-medium">Maker Lab</span>
                    </div>
                    <span className="text-muted-foreground text-sm">/</span>
                    <span className="text-sm font-medium">Project: Smart Home Hub</span>
                </div>

                <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm" className="gap-2">
                        <Share2 className="w-4 h-4" />
                        Share
                    </Button>
                    <Button variant="ghost" size="sm">
                        <Settings className="w-4 h-4" />
                    </Button>
                </div>
            </div>

            {/* Main Workbench */}
            <div className="flex-1 overflow-hidden">
                <ResizablePanelGroup direction="horizontal">

                    {/* Left Panel: Hardware Design */}
                    <ResizablePanel defaultSize={60} minSize={30}>
                        <div className="h-full flex flex-col">
                            <Tabs value={activeView} onValueChange={setActiveView} className="h-full flex flex-col">
                                <div className="border-b px-4 bg-muted/10">
                                    <TabsList className="h-10 bg-transparent p-0">
                                        <TabsTrigger
                                            value="circuit"
                                            className="data-[state=active]:bg-background data-[state=active]:border-b-2 data-[state=active]:border-orange-500 rounded-none h-full px-4 gap-2"
                                        >
                                            <Cpu className="w-4 h-4" />
                                            Circuit Designer
                                        </TabsTrigger>
                                        <TabsTrigger
                                            value="3d"
                                            className="data-[state=active]:bg-background data-[state=active]:border-b-2 data-[state=active]:border-orange-500 rounded-none h-full px-4 gap-2"
                                        >
                                            <Box className="w-4 h-4" />
                                            3D Workbench
                                        </TabsTrigger>
                                    </TabsList>
                                </div>

                                <TabsContent value="circuit" className="flex-1 m-0 p-0 overflow-hidden relative">
                                    <CircuitSimulator />
                                </TabsContent>

                                <TabsContent value="3d" className="flex-1 m-0 p-0 overflow-hidden relative">
                                    <ComponentViewer />
                                </TabsContent>
                            </Tabs>
                        </div>
                    </ResizablePanel>

                    <ResizableHandle withHandle />

                    {/* Right Panel: Firmware Code */}
                    <ResizablePanel defaultSize={40} minSize={20}>
                        <div className="h-full flex flex-col border-l">
                            <div className="h-10 border-b flex items-center px-4 bg-muted/10 gap-2">
                                <Code className="w-4 h-4 text-muted-foreground" />
                                <span className="text-sm font-medium">Firmware</span>
                            </div>
                            <div className="flex-1 overflow-hidden">
                                <FirmwareEditor />
                            </div>
                        </div>
                    </ResizablePanel>

                </ResizablePanelGroup>
            </div>
        </div>
    );
}
