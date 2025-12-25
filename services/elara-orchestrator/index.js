const express = require('express')
const cors = require('cors')
const bodyParser = require('body-parser')

const app = express()
app.use(cors())
app.use(bodyParser.json())

const PORT = process.env.PORT || 4000

// Try to load Prisma client if available
let prisma = null
try {
  // eslint-disable-next-line global-require
  const { PrismaClient } = require('@prisma/client')
  prisma = new PrismaClient()
  console.log('Prisma client loaded in orchestrator')
} catch (err) {
  console.log('Prisma client not available in orchestrator (ok for scaffolding)')
}

app.get('/', (req, res) => {
  res.json({ name: 'elara-orchestrator', status: 'ok' })
})

app.post('/invoke', async (req, res) => {
  try {
    const { agent, action, context, code, language } = req.body || {}

    if (!action) {
      return res.status(400).json({ error: 'missing action' })
    }

    // Create a BuildSpaceExecution record if Prisma is available
    let execution = null
    if (prisma && prisma.buildSpaceExecution) {
      execution = await prisma.buildSpaceExecution.create({
        data: {
          agentName: agent || 'Elara',
          status: 'running',
          input: { action, context, code, language },
        },
      })
    }

    // Mock processing — replace with real LLM/provider calls here
    const output = {
      agent: agent || 'Elara',
      action,
      result: `Orchestrator handled action=${action} for agent=${agent || 'Elara'}`,
      suggestions: ['Add tests', 'Review results', 'Persist outputs'],
      executionId: execution ? execution.id : null,
    }

    // Update execution with output and finishedAt if Prisma available
    if (prisma && execution && prisma.buildSpaceExecution) {
      await prisma.buildSpaceExecution.update({
        where: { id: execution.id },
        data: {
          output: output,
          status: 'succeeded',
          finishedAt: new Date(),
        },
      })
    }

    return res.json(output)
  } catch (err) {
    console.error('Orchestrator error:', err)
    return res.status(500).json({ error: 'orchestrator failed', details: String(err) })
  }
})

app.listen(PORT, () => {
  console.log(`Elara orchestrator listening on http://localhost:${PORT}`)
})
