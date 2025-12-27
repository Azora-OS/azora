import fs from 'fs'
import path from 'path'

const DATA_DIR = path.resolve(process.cwd(), 'data')
const PROJECTS_FILE = path.join(DATA_DIR, 'projects.json')

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true })
  if (!fs.existsSync(PROJECTS_FILE)) fs.writeFileSync(PROJECTS_FILE, '[]')
}

export async function listProjects() {
  ensureDataDir()
  const raw = fs.readFileSync(PROJECTS_FILE, 'utf-8')
  try {
    return JSON.parse(raw)
  } catch (err) {
    return []
  }
}

export async function createProject(data: { name: string; slug: string; ownerId: string; description?: string }) {
  ensureDataDir()
  const projects = await listProjects()
  const id = (Date.now() + Math.random()).toString(36)
  const project = { id, ...data, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
  projects.unshift(project)
  fs.writeFileSync(PROJECTS_FILE, JSON.stringify(projects, null, 2))
  return project
}
