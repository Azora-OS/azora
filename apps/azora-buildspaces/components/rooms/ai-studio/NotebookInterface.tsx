"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Play, Plus, Trash2, Save } from "lucide-react";
import dynamic from "next/dynamic";

const MonacoEditor = dynamic(() => import("@monaco-editor/react"), { ssr: false });

interface Cell {
    id: string;
    type: 'code' | 'markdown';
    content: string;
    output?: string;
    isExecuting?: boolean;
}

const INITIAL_CELLS: Cell[] = [
    {
        id: '1',
        type: 'code',
        content: `import torch
import torch.nn as nn
import torch.optim as optim

# Define a simple neural network
class SimpleNet(nn.Module):
    def __init__(self):
        super(SimpleNet, self).__init__()
        self.fc1 = nn.Linear(10, 5)
        self.fc2 = nn.Linear(5, 1)

    def forward(self, x):
        x = torch.relu(self.fc1(x))
        x = self.fc2(x)
        return x

model = SimpleNet()
print(model)`,
        output: `SimpleNet(
  (fc1): Linear(in_features=10, out_features=5, bias=True)
  (fc2): Linear(in_features=5, out_features=1, bias=True)
)`
    }
];

export default function NotebookInterface() {
    const [cells, setCells] = useState<Cell[]>(INITIAL_CELLS);

    const addCell = () => {
        setCells([...cells, {
            id: Date.now().toString(),
            type: 'code',
            content: '',
        }]);
    };

    const deleteCell = (id: string) => {
        setCells(cells.filter(c => c.id !== id));
    };

    const executeCell = (id: string) => {
        setCells(cells.map(c => {
            if (c.id === id) {
                return { ...c, isExecuting: true };
            }
            return c;
        }));

        // Simulate execution
        setTimeout(() => {
            setCells(cells.map(c => {
                if (c.id === id) {
                    return {
                        ...c,
                        isExecuting: false,
                        output: `[Execution Complete] Result for cell ${id}\n> Tensor([0.123, 0.456])`
                    };
                }
                return c;
            }));
        }, 1000);
    };

    const updateCellContent = (id: string, content: string) => {
        setCells(cells.map(c => c.id === id ? { ...c, content } : c));
    };

    return (
        <div className="h-full flex flex-col bg-background">
            <div className="p-2 border-b flex items-center justify-between bg-card">
                <div className="flex items-center gap-2">
                    <span className="font-semibold px-2">Untitled Notebook.ipynb</span>
                    <span className="text-xs text-muted-foreground">Python 3.9 (PyTorch 2.0)</span>
                </div>
                <div className="flex items-center gap-2">
                    <Button size="sm" variant="outline" onClick={addCell} className="gap-2">
                        <Plus className="w-4 h-4" />
                        Code
                    </Button>
                    <Button size="sm" variant="ghost">
                        <Save className="w-4 h-4" />
                    </Button>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {cells.map((cell, index) => (
                    <div key={cell.id} className="border rounded-lg overflow-hidden bg-card shadow-sm">
                        <div className="flex items-center gap-2 p-2 bg-muted/30 border-b">
                            <span className="text-xs font-mono text-muted-foreground">In [{index + 1}]:</span>
                            <div className="flex-1" />
                            <Button
                                size="icon"
                                variant="ghost"
                                className="h-6 w-6"
                                onClick={() => executeCell(cell.id)}
                                disabled={cell.isExecuting}
                            >
                                <Play className={`w-3 h-3 ${cell.isExecuting ? 'text-green-500 animate-pulse' : ''}`} />
                            </Button>
                            <Button size="icon" variant="ghost" className="h-6 w-6 text-destructive" onClick={() => deleteCell(cell.id)}>
                                <Trash2 className="w-3 h-3" />
                            </Button>
                        </div>

                        <div className="h-48 border-b">
                            <MonacoEditor
                                height="100%"
                                language="python"
                                theme="vs-dark"
                                value={cell.content}
                                onChange={(val) => updateCellContent(cell.id, val || "")}
                                options={{
                                    minimap: { enabled: false },
                                    lineNumbers: "off",
                                    scrollBeyondLastLine: false,
                                    folding: false,
                                }}
                            />
                        </div>

                        {cell.output && (
                            <div className="p-3 bg-black/90 font-mono text-xs text-white whitespace-pre-wrap">
                                {cell.output}
                            </div>
                        )}
                    </div>
                ))}

                <div className="flex justify-center py-4">
                    <Button variant="ghost" onClick={addCell} className="gap-2 text-muted-foreground hover:text-foreground">
                        <Plus className="w-4 h-4" />
                        Add Code Cell
                    </Button>
                </div>
            </div>
        </div>
    );
}
