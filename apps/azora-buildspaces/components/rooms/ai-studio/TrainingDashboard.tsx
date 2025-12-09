"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, AreaChart, Area } from 'recharts';

const lossData = Array.from({ length: 20 }, (_, i) => ({
    epoch: i + 1,
    trainLoss: Math.exp(-i * 0.2) + Math.random() * 0.1,
    valLoss: Math.exp(-i * 0.18) + Math.random() * 0.15 + 0.1,
}));

const accuracyData = Array.from({ length: 20 }, (_, i) => ({
    epoch: i + 1,
    accuracy: 1 - Math.exp(-i * 0.15),
}));

export default function TrainingDashboard() {
    return (
        <div className="h-full overflow-y-auto p-4 space-y-4 bg-background">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Current Epoch</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">20/100</div>
                        <p className="text-xs text-muted-foreground">ETA: 45m 12s</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Training Loss</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-500">0.1423</div>
                        <p className="text-xs text-muted-foreground">↓ 0.0012 from last epoch</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">GPU Utilization</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-purple-500">94%</div>
                        <p className="text-xs text-muted-foreground">NVIDIA A100-80GB</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 h-[300px]">
                <Card className="h-full">
                    <CardHeader>
                        <CardTitle className="text-sm">Loss Curves</CardTitle>
                    </CardHeader>
                    <CardContent className="h-[220px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={lossData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                                <XAxis dataKey="epoch" stroke="#888" />
                                <YAxis stroke="#888" />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333' }}
                                />
                                <Legend />
                                <Line type="monotone" dataKey="trainLoss" stroke="#10b981" strokeWidth={2} dot={false} name="Train Loss" />
                                <Line type="monotone" dataKey="valLoss" stroke="#f59e0b" strokeWidth={2} dot={false} name="Val Loss" />
                            </LineChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                <Card className="h-full">
                    <CardHeader>
                        <CardTitle className="text-sm">Accuracy</CardTitle>
                    </CardHeader>
                    <CardContent className="h-[220px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={accuracyData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                                <XAxis dataKey="epoch" stroke="#888" />
                                <YAxis stroke="#888" />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333' }}
                                />
                                <Area type="monotone" dataKey="accuracy" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.2} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
