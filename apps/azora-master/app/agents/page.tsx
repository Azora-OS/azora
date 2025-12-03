'use client';

import { TaskBoard } from '../../components/TaskBoard';
import { RichMessage } from '../../components/RichMessage';

export default function AgentsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b p-4">
        <h1 className="text-3xl font-bold">Azora Agent Dashboard</h1>
        <p className="text-gray-600">Constitutional AI Agent Execution Framework</p>
      </header>

      <main className="container mx-auto py-6">
        <div className="mb-6">
          <RichMessage
            content="Welcome to the Azora Agent Dashboard. Monitor and manage your AI agents."
            type="plain"
          />
        </div>

        <TaskBoard />
      </main>
    </div>
  );
}
