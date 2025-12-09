"use client";

import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Copy, RefreshCw } from "lucide-react";

export default function ColorPalette() {
    return (
        <div className="h-full flex flex-col bg-background border-l p-4 space-y-6">
            <div>
                <h3 className="font-semibold mb-4">Color Palette</h3>
                <div className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-xs text-muted-foreground">Primary</label>
                        <div className="flex gap-2">
                            <div className="w-10 h-10 rounded-md bg-pink-500 shadow-sm" />
                            <div className="flex-1">
                                <div className="flex justify-between items-center mb-1">
                                    <span className="text-xs font-mono">#EC4899</span>
                                    <Button size="icon" variant="ghost" className="h-4 w-4">
                                        <Copy className="w-3 h-3" />
                                    </Button>
                                </div>
                                <Slider defaultValue={[50]} max={100} step={1} className="h-2" />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs text-muted-foreground">Secondary</label>
                        <div className="flex gap-2">
                            <div className="w-10 h-10 rounded-md bg-purple-500 shadow-sm" />
                            <div className="flex-1">
                                <div className="flex justify-between items-center mb-1">
                                    <span className="text-xs font-mono">#A855F7</span>
                                    <Button size="icon" variant="ghost" className="h-4 w-4">
                                        <Copy className="w-3 h-3" />
                                    </Button>
                                </div>
                                <Slider defaultValue={[60]} max={100} step={1} className="h-2" />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs text-muted-foreground">Accent</label>
                        <div className="flex gap-2">
                            <div className="w-10 h-10 rounded-md bg-cyan-500 shadow-sm" />
                            <div className="flex-1">
                                <div className="flex justify-between items-center mb-1">
                                    <span className="text-xs font-mono">#06B6D4</span>
                                    <Button size="icon" variant="ghost" className="h-4 w-4">
                                        <Copy className="w-3 h-3" />
                                    </Button>
                                </div>
                                <Slider defaultValue={[40]} max={100} step={1} className="h-2" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="pt-4 border-t">
                <Button className="w-full gap-2" variant="outline">
                    <RefreshCw className="w-4 h-4" />
                    Generate New Palette
                </Button>
            </div>

            <div>
                <h3 className="font-semibold mb-4">Typography</h3>
                <div className="space-y-4">
                    <div className="p-3 border rounded-md bg-card">
                        <div className="text-2xl font-bold">Heading 1</div>
                        <div className="text-xs text-muted-foreground mt-1">Inter Bold, 24px</div>
                    </div>
                    <div className="p-3 border rounded-md bg-card">
                        <div className="text-lg font-semibold">Heading 2</div>
                        <div className="text-xs text-muted-foreground mt-1">Inter Semibold, 18px</div>
                    </div>
                    <div className="p-3 border rounded-md bg-card">
                        <div className="text-sm">Body text paragraph example.</div>
                        <div className="text-xs text-muted-foreground mt-1">Inter Regular, 14px</div>
                    </div>
                </div>
            </div>
        </div>
    );
}
