"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Plus, MoreHorizontal, Calendar, MessageSquare, Paperclip, Users, CheckCircle, Clock, AlertCircle } from "lucide-react";

const COLUMNS = [
    {
        id: "todo",
        title: "To Do",
        color: "bg-slate-700",
        tasks: [
            {
                id: 1,
                title: "Design user authentication flow",
                description: "Create wireframes and user journey for login/signup",
                priority: "high",
                assignee: "Alice",
                avatar: "A",
                dueDate: "Dec 20",
                comments: 3,
                attachments: 2
            },
            {
                id: 2,
                title: "Set up CI/CD pipeline",
                description: "Configure automated testing and deployment",
                priority: "medium",
                assignee: "Bob",
                avatar: "B",
                dueDate: "Dec 22",
                comments: 1,
                attachments: 0
            }
        ]
    },
    {
        id: "in-progress",
        title: "In Progress",
        color: "bg-blue-700",
        tasks: [
            {
                id: 3,
                title: "Implement API endpoints",
                description: "Build REST API for user management",
                priority: "high",
                assignee: "Carol",
                avatar: "C",
                dueDate: "Dec 18",
                comments: 5,
                attachments: 1,
                progress: 75
            },
            {
                id: 4,
                title: "Database schema design",
                description: "Design and optimize database structure",
                priority: "medium",
                assignee: "David",
                avatar: "D",
                dueDate: "Dec 19",
                comments: 2,
                attachments: 3,
                progress: 60
            }
        ]
    },
    {
        id: "review",
        title: "Review",
        color: "bg-yellow-700",
        tasks: [
            {
                id: 5,
                title: "Code review for auth module",
                description: "Review and approve authentication implementation",
                priority: "high",
                assignee: "Alice",
                avatar: "A",
                dueDate: "Dec 17",
                comments: 7,
                attachments: 0
            }
        ]
    },
    {
        id: "done",
        title: "Done",
        color: "bg-green-700",
        tasks: [
            {
                id: 6,
                title: "Project setup and configuration",
                description: "Initialize project structure and dependencies",
                priority: "low",
                assignee: "Bob",
                avatar: "B",
                dueDate: "Dec 15",
                comments: 0,
                attachments: 1
            },
            {
                id: 7,
                title: "UI component library",
                description: "Create reusable UI components",
                priority: "medium",
                assignee: "Carol",
                avatar: "C",
                dueDate: "Dec 16",
                comments: 4,
                attachments: 2
            }
        ]
    }
];

export default function TaskBoard() {
    const [draggedTask, setDraggedTask] = useState<any>(null);

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case "high": return "text-red-400 bg-red-400/10";
            case "medium": return "text-yellow-400 bg-yellow-400/10";
            case "low": return "text-green-400 bg-green-400/10";
            default: return "text-slate-400 bg-slate-400/10";
        }
    };

    const getPriorityIcon = (priority: string) => {
        switch (priority) {
            case "high": return <AlertCircle className="w-3 h-3" />;
            case "medium": return <Clock className="w-3 h-3" />;
            case "low": return <CheckCircle className="w-3 h-3" />;
            default: return <Clock className="w-3 h-3" />;
        }
    };

    return (
        <div className="h-full flex flex-col bg-slate-900">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-white/10">
                <div className="flex items-center gap-4">
                    <h3 className="font-semibold text-white">Project Board</h3>
                    <Badge variant="secondary" className="bg-slate-700">
                        Sprint 2 - Week 3
                    </Badge>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm">
                        <Users className="w-4 h-4 mr-2" />
                        Team
                    </Button>
                    <Button size="sm">
                        <Plus className="w-4 h-4 mr-2" />
                        Add Task
                    </Button>
                </div>
            </div>

            {/* Board */}
            <ScrollArea className="flex-1">
                <div className="flex gap-6 p-6 min-w-max">
                    {COLUMNS.map((column) => (
                        <div key={column.id} className="w-80 flex-shrink-0">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-2">
                                    <div className={`w-3 h-3 rounded-full ${column.color}`}></div>
                                    <h4 className="font-medium text-white">{column.title}</h4>
                                    <Badge variant="secondary" className="bg-slate-700">
                                        {column.tasks.length}
                                    </Badge>
                                </div>
                                <Button variant="ghost" size="sm" className="w-8 h-8 p-0">
                                    <MoreHorizontal className="w-4 h-4" />
                                </Button>
                            </div>

                            <div className="space-y-3">
                                {column.tasks.map((task) => (
                                    <Card
                                        key={task.id}
                                        className="bg-slate-800 border-slate-700 hover:border-slate-600 transition-colors cursor-pointer"
                                        draggable
                                        onDragStart={() => setDraggedTask(task)}
                                        onDragEnd={() => setDraggedTask(null)}
                                    >
                                        <CardContent className="p-4">
                                            <div className="flex items-start justify-between mb-3">
                                                <h5 className="font-medium text-white text-sm leading-tight">
                                                    {task.title}
                                                </h5>
                                                <Button variant="ghost" size="sm" className="w-6 h-6 p-0 -mt-1 -mr-2">
                                                    <MoreHorizontal className="w-3 h-3" />
                                                </Button>
                                            </div>

                                            <p className="text-slate-400 text-xs mb-3 line-clamp-2">
                                                {task.description}
                                            </p>

                                            {task.progress && (
                                                <div className="mb-3">
                                                    <div className="flex justify-between text-xs text-slate-400 mb-1">
                                                        <span>Progress</span>
                                                        <span>{task.progress}%</span>
                                                    </div>
                                                    <Progress value={task.progress} className="h-1" />
                                                </div>
                                            )}

                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <Badge
                                                        variant="secondary"
                                                        className={`text-xs px-2 py-1 ${getPriorityColor(task.priority)}`}
                                                    >
                                                        {getPriorityIcon(task.priority)}
                                                        <span className="ml-1 capitalize">{task.priority}</span>
                                                    </Badge>
                                                </div>

                                                <div className="flex items-center gap-1 text-slate-400">
                                                    {task.comments > 0 && (
                                                        <div className="flex items-center gap-1 text-xs">
                                                            <MessageSquare className="w-3 h-3" />
                                                            <span>{task.comments}</span>
                                                        </div>
                                                    )}
                                                    {task.attachments > 0 && (
                                                        <div className="flex items-center gap-1 text-xs">
                                                            <Paperclip className="w-3 h-3" />
                                                            <span>{task.attachments}</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-700">
                                                <div className="flex items-center gap-2">
                                                    <Avatar className="w-6 h-6">
                                                        <AvatarFallback className="text-xs bg-slate-600">
                                                            {task.avatar}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <span className="text-xs text-slate-400">{task.assignee}</span>
                                                </div>

                                                <div className="flex items-center gap-1 text-xs text-slate-400">
                                                    <Calendar className="w-3 h-3" />
                                                    <span>{task.dueDate}</span>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}

                                <Button
                                    variant="outline"
                                    className="w-full border-dashed border-slate-600 hover:border-slate-500 text-slate-400 hover:text-slate-300"
                                    size="sm"
                                >
                                    <Plus className="w-4 h-4 mr-2" />
                                    Add Task
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            </ScrollArea>
        </div>
    );
}