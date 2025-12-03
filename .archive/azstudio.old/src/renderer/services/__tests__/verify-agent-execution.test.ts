jest.clearAllMocks();
runtime = new MultiAgentRuntime();
// Mock broadcast to avoid WebSocket errors in test
(runtime as any).broadcastMessage = mockBroadcastMessage;
    });

it('should execute task using AI service', async () => {
    const agentId = 'test-agent';
    const task: AgentTask = {
        id: 'task-1',
        title: 'Test Task',
        description: 'Implement a test feature',
        priority: 'high',
        status: 'pending',
        requirementIds: ['req-1'],
        assignedTo: agentId,
        createdAt: new Date(),
        updatedAt: new Date()
    };

    // Setup mock agent
    (runtime as any).agents.set(agentId, {
        agentName: 'TestAgent',
        projectId: 'proj-1',
        status: 'idle',
        currentTask: null,
        lastActivity: new Date()
    });

    // Setup mock project context
    (runtime as any).projectContexts.set('proj-1', {
        designChoices: {
            techStack: {
                frontend: ['React', 'TypeScript']
            }
        }
    });

    // Setup successful AI response
    mockGenerateCode.mockResolvedValue({
        success: true,
        response: {
            content: 'Generated code content',
            tokensUsed: 100,
            cost: 0.01
        }
    });

    // Execute task
    await runtime.executeTask(agentId, task);

    // Verify AI was called
    expect(mockGenerateCode).toHaveBeenCalledTimes(1);
    expect(mockGenerateCode).toHaveBeenCalledWith(
        expect.stringContaining('Task: Test Task'),
        expect.objectContaining({
            projectInfo: {
                frameworks: ['React', 'TypeScript'],
                conventions: {}
            }
        })
    );

    // Verify task status updated
    expect(task.status).toBe('completed');

    // Verify success notification
    expect(mockBroadcastMessage).toHaveBeenCalledWith(
        'TestAgent',
        expect.objectContaining({
            type: 'task_complete',
            content: 'Completed task: Test Task'
        })
    );
});

it('should handle AI errors gracefully', async () => {
    const agentId = 'test-agent';
    const task: AgentTask = {
        id: 'task-2',
        title: 'Error Task',
        description: 'Task that fails',
        priority: 'medium',
        status: 'pending',
        requirementIds: [],
        assignedTo: agentId,
        createdAt: new Date(),
        updatedAt: new Date()
    };

    // Setup mock agent
    (runtime as any).agents.set(agentId, {
        agentName: 'TestAgent',
        projectId: 'proj-1',
        status: 'idle'
    });

    // Setup mock project context
    (runtime as any).projectContexts.set('proj-1', {
        designChoices: {
            techStack: { frontend: [] }
        }
    });

    // Setup failed AI response
    mockGenerateCode.mockResolvedValue({
        success: false,
        error: 'AI Service Unavailable'
    });

    // Execute task and expect error
    await expect(runtime.executeTask(agentId, task)).rejects.toThrow('AI Service Unavailable');

    // Task status should NOT be completed (it's handled in assignTask catch block usually, but executeTask throws)
    expect(task.status).toBe('pending');
});
});
