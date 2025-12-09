"use client"

import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable"
import { ActivityBar } from "./activity-bar"
import { StatusBar } from "./status-bar"
import { Sidebar } from "./sidebar"
import { Panel } from "./panel"
import { useWorkbench } from "@/lib/stores/workbench-store"

interface WorkbenchLayoutProps {
    sidebarContent: React.ReactNode
    editorContent: React.ReactNode
    panelContent: React.ReactNode
}

export function WorkbenchLayout({ sidebarContent, editorContent, panelContent }: WorkbenchLayoutProps) {
    const { isSidebarVisible, isPanelVisible } = useWorkbench()

    return (
        <div className="flex flex-col h-screen overflow-hidden bg-background text-foreground">
            <div className="flex-1 flex overflow-hidden">
                {/* Activity Bar - Fixed Width */}
                <ActivityBar />

                {/* Main Resizable Area */}
                <ResizablePanelGroup direction="horizontal" className="flex-1">

                    {/* Sidebar */}
                    {isSidebarVisible && (
                        <>
                            <ResizablePanel defaultSize={20} minSize={15} maxSize={40} className="min-w-[200px]">
                                <Sidebar>
                                    {sidebarContent}
                                </Sidebar>
                            </ResizablePanel>
                            <ResizableHandle />
                        </>
                    )}

                    {/* Editor & Panel Group */}
                    <ResizablePanel defaultSize={isSidebarVisible ? 80 : 100}>
                        <ResizablePanelGroup direction="vertical">

                            {/* Editor Area */}
                            <ResizablePanel defaultSize={70} minSize={30}>
                                <div className="h-full w-full bg-editor-background">
                                    {editorContent}
                                </div>
                            </ResizablePanel>

                            {/* Bottom Panel */}
                            {isPanelVisible && (
                                <>
                                    <ResizableHandle />
                                    <ResizablePanel defaultSize={30} minSize={10}>
                                        <Panel>
                                            {panelContent}
                                        </Panel>
                                    </ResizablePanel>
                                </>
                            )}

                        </ResizablePanelGroup>
                    </ResizablePanel>

                </ResizablePanelGroup>
            </div>

            {/* Status Bar - Fixed Height */}
            <StatusBar />
        </div>
    )
}
