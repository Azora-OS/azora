import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function POST(req: Request) {
    try {
        const { name, ownerId } = await req.json()

        const project = await prisma.project.create({
            data: {
                name,
                ownerId,
                files: {
                    create: [
                        { name: 'root', type: 'directory' }
                    ]
                }
            }
        })

        return NextResponse.json(project)
    } catch (error) {
        console.error('Failed to create project:', error)
        return NextResponse.json({ error: 'Failed to create project' }, { status: 500 })
    }
}

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url)
    const ownerId = searchParams.get('ownerId')

    if (!ownerId) {
        return NextResponse.json({ error: 'Owner ID required' }, { status: 400 })
    }

    const projects = await prisma.project.findMany({
        where: { ownerId },
        orderBy: { updatedAt: 'desc' }
    })

    return NextResponse.json(projects)
}
