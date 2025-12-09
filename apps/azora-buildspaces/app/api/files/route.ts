import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function POST(req: Request) {
    try {
        const { name, type, parentId, projectId, content } = await req.json()

        const file = await prisma.file.create({
            data: {
                name,
                type,
                parentId,
                projectId,
                content
            }
        })

        return NextResponse.json(file)
    } catch (error) {
        console.error('Failed to create file:', error)
        return NextResponse.json({ error: 'Failed to create file' }, { status: 500 })
    }
}

export async function PUT(req: Request) {
    try {
        const { id, content } = await req.json()

        const file = await prisma.file.update({
            where: { id },
            data: { content }
        })

        return NextResponse.json(file)
    } catch (error) {
        return NextResponse.json({ error: 'Failed to update file' }, { status: 500 })
    }
}

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url)
    const projectId = searchParams.get('projectId')

    if (!projectId) {
        return NextResponse.json({ error: 'Project ID required' }, { status: 400 })
    }

    const files = await prisma.file.findMany({
        where: { projectId }
    })

    return NextResponse.json(files)
}
