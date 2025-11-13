
/*
AZORA PROPRIETARY LICENSE
Copyright (c) 2025 Azora ES (Pty) Ltd. All Rights Reserved.
See LICENSE file for details.
*/

// Defines the communication protocol between AI agents
export interface AgentMessage {
  sender: string; // Name of the sending agent
  recipient: string; // Name of the receiving agent, or 'broadcast'
  timestamp: string;
  content: Task | Report | Query; // The payload of the message
}

// Represents a task to be completed
export interface Task {
  type: 'TASK';
  id: string;
  description: string;
  dependencies?: string[]; // IDs of tasks that must be completed first
}

// Represents a progress report
export interface Report {
  type: 'REPORT';
  taskId: string;
  status: 'in_progress' | 'completed' | 'failed';
  details: string;
}

// Represents a query for information
export interface Query {
  type: 'QUERY';
  id: string;
  question: string;
}

// The Orchestrator will use this protocol to manage the collective
