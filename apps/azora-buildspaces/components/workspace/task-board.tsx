"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Plus, CheckCircle2, Circle, Clock, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"

interface Task {
  id: string
  title: string
  description: string
  status: "todo" | "in-progress" | "done"
  priority: "low" | "medium" | "high"
  assignee?: string
  dueDate?: string
}

const initialTasks: Task[] = [
  {
    id: "1",
    title: "Set up project structure",
    description: "Create the basic folder structure and configuration files",
    status: "done",
    priority: "high",
    assignee: "Elara"
  },
  {
    id: "2",
    title: "Implement Code Chamber",
    description: "Build the main coding interface with Monaco editor",
    status: "in-progress",
    priority: "high",
    assignee: "Sankofa"
  },
  {
    id: "3",
    title: "Add real-time collaboration",
    description: "Integrate Yjs for collaborative editing",
    status: "in-progress",
    priority: "medium",
    assignee: "Themba"
  },
  {
    id: "4",
    title: "Create Spec Chamber",
    description: "Build the requirements validation interface",
    status: "todo",
    priority: "medium",
    assignee: "Nia"
  }
]

export function TaskBoard() {
  const [tasks, setTasks] = useState<Task[]>(initialTasks)

  const updateTaskStatus = (taskId: string, status: Task["status"]) => {
    setTasks(prev => prev.map(task =>
      task.id === taskId ? { ...task, status } : task
    ))
  }

  const getStatusIcon = (status: Task["status"]) => {
    switch (status) {
      case "done": return <CheckCircle2 className="w-4 h-4 text-green-500" />
      case "in-progress": return <Clock className="w-4 h-4 text-blue-500" />
      default: return <Circle className="w-4 h-4 text-gray-400" />
    }
  }

  const getPriorityColor = (priority: Task["priority"]) => {
    switch (priority) {
      case "high": return "text-red-500"
      case "medium": return "text-yellow-500"
      default: return "text-green-500"
    }
  }

  const columns = [
    { id: "todo", title: "To Do", tasks: tasks.filter(t => t.status === "todo") },
    { id: "in-progress", title: "In Progress", tasks: tasks.filter(t => t.status === "in-progress") },
    { id: "done", title: "Done", tasks: tasks.filter(t => t.status === "done") }
  ]

  return (
    <div className="h-full flex flex-col bg-zinc-950 text-zinc-100">
      {/* Header */}
      <div className="h-14 border-b border-zinc-800 flex items-center justify-between px-6 bg-zinc-900/50 backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-semibold text-lg">Task Board</h1>
            <p className="text-xs text-zinc-400">Track project progress and assign tasks</p>
          </div>
        </div>

        <Button className="gap-2">
          <Plus className="w-4 h-4" />
          Add Task
        </Button>
      </div>

      {/* Board */}
      <div className="flex-1 p-6">
        <div className="grid grid-cols-3 gap-6 h-full">
          {columns.map((column) => (
            <div key={column.id} className="flex flex-col">
              <div className="flex items-center gap-2 mb-4">
                <h2 className="font-semibold text-sm text-zinc-300">{column.title}</h2>
                <Badge variant="secondary" className="text-xs">
                  {column.tasks.length}
                </Badge>
              </div>

              <ScrollArea className="flex-1">
                <div className="space-y-3">
                  {column.tasks.map((task) => (
                    <motion.div
                      key={task.id}
                      layout
                      className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-4 cursor-pointer hover:bg-zinc-800/50 transition-colors"
                      onClick={() => {
                        if (task.status === "todo") updateTaskStatus(task.id, "in-progress")
                        else if (task.status === "in-progress") updateTaskStatus(task.id, "done")
                      }}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-medium text-sm text-zinc-100">{task.title}</h3>
                        {getStatusIcon(task.status)}
                      </div>

                      <p className="text-xs text-zinc-400 mb-3 line-clamp-2">
                        {task.description}
                      </p>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Badge
                            variant="outline"
                            className={`text-xs border-current ${getPriorityColor(task.priority)}`}
                          >
                            {task.priority}
                          </Badge>
                          {task.assignee && (
                            <span className="text-xs text-zinc-500">{task.assignee}</span>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}