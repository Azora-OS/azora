import React, { useState, useEffect } from 'react';

interface Task {
  id: string;
  status: 'pending' | 'in-progress' | 'completed' | 'failed';
  agentId?: string;
  payload: any;
  createdAt: string;
}

interface Agent {
  agentId: string;
  status: 'idle' | 'busy' | 'offline';
  currentTasks: string[];
}

export function TaskBoard() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [draggedTask, setDraggedTask] = useState<string | null>(null);

  useEffect(() => {
    fetchTasks();
    fetchAgents();
    const interval = setInterval(() => {
      fetchTasks();
      fetchAgents();
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchTasks = async () => {
    try {
      const res = await fetch('http://localhost:4002/tasks');
      const data = await res.json();
      setTasks(data.tasks || []);
    } catch {}
  };

  const fetchAgents = async () => {
    try {
      const res = await fetch('http://localhost:4002/agents');
      const data = await res.json();
      setAgents(data.agents || []);
    } catch {}
  };

  const handleDragStart = (taskId: string) => setDraggedTask(taskId);

  const handleDrop = async (newStatus: string) => {
    if (!draggedTask) return;
    try {
      await fetch(`http://localhost:4002/task/${draggedTask}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      fetchTasks();
    } catch {}
    setDraggedTask(null);
  };

  const columns = ['pending', 'in-progress', 'completed', 'failed'];

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-4">Agent Status</h2>
        <div className="flex gap-4">
          {agents.map(agent => (
            <div key={agent.agentId} className="p-4 border rounded">
              <div className="font-semibold">{agent.agentId}</div>
              <div className={`text-sm ${agent.status === 'idle' ? 'text-green-600' : 'text-yellow-600'}`}>
                {agent.status}
              </div>
              <div className="text-xs">{agent.currentTasks.length} tasks</div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {columns.map(status => (
          <div
            key={status}
            className="bg-gray-50 p-4 rounded"
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => handleDrop(status)}
          >
            <h3 className="font-semibold mb-4 capitalize">{status}</h3>
            {tasks.filter(t => t.status === status).map(task => (
              <div
                key={task.id}
                draggable
                onDragStart={() => handleDragStart(task.id)}
                className="bg-white p-3 mb-2 rounded shadow cursor-move"
              >
                <div className="text-sm font-medium">{task.id.slice(0, 8)}</div>
                <div className="text-xs text-gray-600">{task.agentId || 'No agent'}</div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
