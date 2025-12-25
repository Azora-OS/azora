import { NextRequest, NextResponse } from 'next/server'

interface AgentRequest {
  action: string
  context: string
  code?: string
  language?: string
}

interface AgentResponse {
  agent: string
  action: string
  result: string
  suggestions?: string[]
}

// Map actions to responsible agents based on BUILDSPACES_CRITICAL_REPOS
const AGENT_ROUTING = {
  'code-review': 'Sankofa', // Code Architect
  'generate-code': 'Sankofa',
  'refactor': 'Sankofa',
  'test-generation': 'Themba', // Testing Specialist
  'security-review': 'Jabari', // Security Expert
  'optimize': 'Nia', // Performance Specialist
  'documentation': 'Imani', // Knowledge Manager
}

// POST /api/agents/invoke
export async function POST(request: NextRequest) {
  try {
    const body: AgentRequest = await request.json()
    const { action, context, code, language } = body

    // Validate request
    if (!action) {
      return NextResponse.json(
        { error: 'Missing action' },
        { status: 400 }
      )
    }

    // Route to appropriate agent
    const agent = AGENT_ROUTING[action as keyof typeof AGENT_ROUTING] || 'Elara'

    console.log(`[Agent Routing] Action: ${action} → Agent: ${agent}`)

    // Forward the request to the local Elara orchestrator service if available
    try {
      const orchestratorUrl = process.env.ELARA_ORCHESTRATOR_URL || 'http://localhost:4000/invoke'
      const resp = await fetch(orchestratorUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ agent, action, context, code, language }),
      })

      if (!resp.ok) {
        console.warn('[Agent Routing] Orchestrator returned non-OK:', resp.status)
      }

      const data = await resp.json()
      return NextResponse.json(data)
    } catch (err) {
      console.error('[Agent Routing] Orchestrator call failed, falling back to mock. Error:', err)

      const mockResponse: AgentResponse = {
        agent,
        action,
        result: `${agent} processed your request: ${action}`,
        suggestions: [
          'Consider adding error handling',
          'Add unit tests for edge cases',
          'Review security implications',
        ],
      }

      return NextResponse.json(mockResponse)
    }
  } catch (error) {
    console.error('[Agent Routing] Error:', error)
    return NextResponse.json(
      { error: 'Failed to invoke agent' },
      { status: 500 }
    )
  }
}

// GET /api/agents/list
export async function GET() {
  try {
    const agents = [
      {
        id: 'sankofa',
        name: 'Sankofa',
        title: 'Code Architect',
        capabilities: ['code-review', 'generate-code', 'refactor'],
        status: 'online',
      },
      {
        id: 'themba',
        name: 'Themba',
        title: 'Testing Specialist',
        capabilities: ['test-generation', 'coverage-analysis'],
        status: 'online',
      },
      {
        id: 'jabari',
        name: 'Jabari',
        title: 'Security Expert',
        capabilities: ['security-review', 'vulnerability-scan'],
        status: 'online',
      },
      {
        id: 'nia',
        name: 'Nia',
        title: 'Performance Specialist',
        capabilities: ['optimize', 'profiling'],
        status: 'online',
      },
      {
        id: 'imani',
        name: 'Imani',
        title: 'Knowledge Manager',
        capabilities: ['documentation', 'knowledge-synthesis'],
        status: 'online',
      },
    ]

    return NextResponse.json({ agents })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch agents' },
      { status: 500 }
    )
  }
}
