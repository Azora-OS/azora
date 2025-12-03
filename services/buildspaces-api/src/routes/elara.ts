import { Router } from 'express';
import { prisma } from '../index';
import { z } from 'zod';
import axios from 'axios';

const router = Router();

// ============================================================================
// VALIDATION SCHEMAS
// ============================================================================

const chatSchema = z.object({
    message: z.string(),
    projectId: z.string().optional(),
    context: z.record(z.any()).optional(),
});

const decomposeSchema = z.object({
    goal: z.string(),
    projectId: z.string(),
    context: z.string().optional(),
});

// ============================================================================
// ROUTES
// ============================================================================

// POST /api/elara/chat - Chat with Elara
router.post('/chat', async (req, res) => {
    try {
        const data = chatSchema.parse(req.body);

        // 1. Construct context for Elara
        let systemContext = `You are Elara, the XO and Architect of the Azora Citadel. 
    Your role is to guide the user (Commander) and orchestrate the AI agents (Crew).
    You are wise, strategic, and motherly but professional.`;

        if (data.projectId) {
            const project = await prisma.project.findUnique({
                where: { id: data.projectId },
                include: {
                    tasks: {
                        where: { status: { in: ['PROCESSING', 'PENDING', 'BLOCKED'] } },
                    },
                },
            });

            if (project) {
                systemContext += `\n\nCurrent Project: ${project.name}
        Description: ${project.description}
        Status: ${project.status}
        Active Tasks: ${project.tasks.length}
        
        Vision: ${JSON.stringify(project.vision)}
        `;
            }
        }

        // 2. Call AI Family Service
        try {
            const response = await axios.post(
                `${process.env.AI_FAMILY_URL || 'http://localhost:3030'}/api/chat`,
                {
                    personality: 'elara',
                    message: data.message,
                    systemContext,
                    context: data.context,
                },
                { timeout: 5000 } // 5s timeout for chat
            );

            res.json({
                message: response.data.message,
            });

        } catch (aiError) {
            console.warn('AI Family Service unavailable, using fallback:', aiError);

            // Fallback response for development/offline
            const fallbacks = [
                "I've noted that, Commander. We should proceed with caution.",
                "An interesting proposal. I'll have Zola run the simulations.",
                "Agreed. Let's prioritize the core infrastructure first.",
                "I'm analyzing the implications of that decision now.",
                "The crew stands ready to execute your orders."
            ];
            const randomFallback = fallbacks[Math.floor(Math.random() * fallbacks.length)];

            res.json({
                message: `[OFFLINE MODE] ${randomFallback}`,
            });
        }

    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ error: error.errors });
        }
        console.error('Error in Elara chat:', error);
        res.status(500).json({ error: 'Failed to chat with Elara' });
    }
});

// POST /api/elara/decompose - Decompose a goal into tasks
router.post('/decompose', async (req, res) => {
    try {
        const data = decomposeSchema.parse(req.body);

        // 1. Construct Prompt
        const systemContext = `You are Elara, the Chief Architect.
        Your goal is to decompose a high-level objective into specific, actionable tasks for the specialized AI agents.
        
        AGENTS:
        - Zola: Coding, implementation, database, algorithms.
        - Jabari: Security, authentication, compliance, protection.
        - Abeni: UI/UX, design, frontend, aesthetics.
        - Kofi: DevOps, deployment, infrastructure, finance.
        - Nexus: Data analysis, research, information retrieval.
        
        Return a JSON array of tasks. Each task must have:
        - title: Short title
        - description: Detailed instructions
        - agent: One of the agents above
        - priority: 1-10 (10 is highest)
        - type: "implementation" | "design" | "security" | "research" | "devops"
        `;

        const userMessage = `Decompose this goal for Project ID ${data.projectId}: "${data.goal}"
        ${data.context ? `Additional Context: ${data.context}` : ''}`;

        // 2. Call AI Service
        try {
            const response = await axios.post(
                `${process.env.AI_FAMILY_URL || 'http://localhost:3030'}/api/chat`,
                {
                    personality: 'elara',
                    message: userMessage,
                    systemContext,
                    format: 'json', // Request JSON output if supported
                },
                { timeout: 10000 } // 10s timeout for complex task
            );

            // Parse response (assuming AI returns JSON string or object)
            let tasks = response.data.message;
            if (typeof tasks === 'string') {
                try {
                    // Attempt to extract JSON from markdown code blocks if present
                    const jsonMatch = tasks.match(/```json\n([\s\S]*?)\n```/) || tasks.match(/\{[\s\S]*\}/);
                    if (jsonMatch) {
                        tasks = JSON.parse(jsonMatch[1] || jsonMatch[0]);
                    } else {
                        tasks = JSON.parse(tasks);
                    }
                } catch (e) {
                    console.warn("Failed to parse AI JSON response, using heuristic fallback");
                    // Fallback if parsing fails
                    throw new Error("Invalid JSON from AI");
                }
            }

            // Validate structure (basic check)
            if (!Array.isArray(tasks)) {
                if (tasks.tasks && Array.isArray(tasks.tasks)) {
                    tasks = tasks.tasks;
                } else {
                    throw new Error("AI response is not an array of tasks");
                }
            }

            res.json({ tasks });

        } catch (aiError) {
            console.warn('AI Family Service unavailable or failed, using fallback decomposition:', aiError);

            // Smart Fallback Generation based on keywords
            const goalLower = data.goal.toLowerCase();
            const mockTasks = [];

            if (goalLower.includes('auth') || goalLower.includes('login') || goalLower.includes('security')) {
                mockTasks.push({
                    agent: 'Jabari',
                    type: 'security',
                    title: 'Audit Authentication Flow',
                    description: 'Review current login implementation for vulnerabilities.',
                    priority: 9
                });
                mockTasks.push({
                    agent: 'Zola',
                    type: 'implementation',
                    title: 'Implement OAuth Providers',
                    description: 'Add Google and GitHub authentication strategies.',
                    priority: 8
                });
            } else if (goalLower.includes('ui') || goalLower.includes('design') || goalLower.includes('frontend')) {
                mockTasks.push({
                    agent: 'Abeni',
                    type: 'design',
                    title: 'Create High-Fidelity Mockups',
                    description: 'Design the interface in Figma/AzStudio.',
                    priority: 8
                });
                mockTasks.push({
                    agent: 'Zola',
                    type: 'implementation',
                    title: 'Build React Components',
                    description: 'Implement the designed components in the frontend.',
                    priority: 7
                });
            } else {
                // Generic Fallback
                mockTasks.push({
                    agent: 'Zola',
                    type: 'implementation',
                    title: `Implement Core Logic for ${data.goal.substring(0, 20)}...`,
                    description: `Write the necessary code to achieve: ${data.goal}`,
                    priority: 8
                });
                mockTasks.push({
                    agent: 'Jabari',
                    type: 'security',
                    title: 'Security Review',
                    description: 'Ensure the new feature does not introduce vulnerabilities.',
                    priority: 7
                });
                mockTasks.push({
                    agent: 'Abeni',
                    type: 'design',
                    title: 'UI Integration',
                    description: 'Ensure the feature is accessible and visually consistent.',
                    priority: 6
                });
            }

            res.json({ tasks: mockTasks, isFallback: true });
        }

    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ error: error.errors });
        }
        console.error('Error decomposing goal:', error);
        res.status(500).json({ error: 'Failed to decompose goal' });
    }
});

export default router;
