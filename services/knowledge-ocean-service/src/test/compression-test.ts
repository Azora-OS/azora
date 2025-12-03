import { CompressionPipeline, HybridCompressor, DeduplicationEngine } from '../compression/engine';
import fs from 'fs/promises';
import path from 'path';

// ============================================================================
// COMPRESSION TEST & DEMO
// ============================================================================

async function testCompressionEngine() {
    console.log('🚀 Knowledge Ocean Compression Engine Test\n');
    console.log('='.repeat(60));

    const pipeline = new CompressionPipeline();
    await pipeline.initialize();

    // ========================================================================
    // TEST 1: Compress Real Documentation
    // ========================================================================
    console.log('\n📚 TEST 1: Compressing Documentation');
    console.log('-'.repeat(60));

    try {
        // Read actual README files from the repo
        const readmePaths = [
            'C:\\Users\\Azora Sapiens\\Documents\\azora\\README.md',
            'C:\\Users\\Azora Sapiens\\Documents\\azora\\services\\buildspaces-api\\README.md',
            'C:\\Users\\Azora Sapiens\\Documents\\azora\\apps\\azora-buildspaces\\README.md'
        ];

        let docsContent = '';
        for (const readmePath of readmePaths) {
            try {
                const content = await fs.readFile(readmePath, 'utf-8');
                docsContent += content + '\n\n';
            } catch (err) {
                console.log(`  ⚠️  Skipping ${path.basename(readmePath)} (not found)`);
            }
        }

        if (!docsContent) {
            // Fallback: Create sample documentation
            docsContent = generateSampleDocs();
        }

        const docsBuffer = Buffer.from(docsContent, 'utf-8');
        const compressor = new HybridCompressor();
        await compressor.initialize();

        const compressed = await compressor.compress(docsBuffer, 'docs');

        console.log(`  Original Size:    ${formatBytes(compressed.originalSize)}`);
        console.log(`  Compressed Size:  ${formatBytes(compressed.compressedSize)}`);
        console.log(`  Compression Ratio: ${compressed.ratio.toFixed(2)}x`);
        console.log(`  Algorithm:        ${compressed.algorithm}`);
        console.log(`  Hash:             ${compressed.hash.substring(0, 16)}...`);

        // Verify decompression
        const decompressed = await compressor.decompress(compressed.data, compressed.algorithm);
        const isValid = decompressed.toString('utf-8') === docsContent;
        console.log(`  ✅ Decompression: ${isValid ? 'PASSED' : 'FAILED'}`);

    } catch (error) {
        console.error('  ❌ Test failed:', error);
    }

    // ========================================================================
    // TEST 2: Compress Code Examples
    // ========================================================================
    console.log('\n💻 TEST 2: Compressing Code Examples');
    console.log('-'.repeat(60));

    try {
        // Read actual TypeScript files
        const codePaths = [
            'C:\\Users\\Azora Sapiens\\Documents\\azora\\services\\buildspaces-api\\src\\index.ts',
            'C:\\Users\\Azora Sapiens\\Documents\\azora\\services\\buildspaces-api\\src\\routes\\elara.ts',
            'C:\\Users\\Azora Sapiens\\Documents\\azora\\apps\\azora-buildspaces\\lib\\api.ts'
        ];

        let codeContent = '';
        for (const codePath of codePaths) {
            try {
                const content = await fs.readFile(codePath, 'utf-8');
                codeContent += `// ${path.basename(codePath)}\n${content}\n\n`;
            } catch (err) {
                console.log(`  ⚠️  Skipping ${path.basename(codePath)} (not found)`);
            }
        }

        if (!codeContent) {
            codeContent = generateSampleCode();
        }

        const codeBuffer = Buffer.from(codeContent, 'utf-8');
        const compressor = new HybridCompressor();
        await compressor.initialize();

        const compressed = await compressor.compress(codeBuffer, 'code');

        console.log(`  Original Size:    ${formatBytes(compressed.originalSize)}`);
        console.log(`  Compressed Size:  ${formatBytes(compressed.compressedSize)}`);
        console.log(`  Compression Ratio: ${compressed.ratio.toFixed(2)}x`);
        console.log(`  Algorithm:        ${compressed.algorithm}`);

        // Verify decompression
        const decompressed = await compressor.decompress(compressed.data, compressed.algorithm);
        const isValid = decompressed.toString('utf-8') === codeContent;
        console.log(`  ✅ Decompression: ${isValid ? 'PASSED' : 'FAILED'}`);

    } catch (error) {
        console.error('  ❌ Test failed:', error);
    }

    // ========================================================================
    // TEST 3: Deduplication
    // ========================================================================
    console.log('\n🔄 TEST 3: Testing Deduplication');
    console.log('-'.repeat(60));

    try {
        const deduper = new DeduplicationEngine();

        // Create sample data with repetition
        const repeatedContent = Buffer.from(
            'import React from "react";\n'.repeat(100) +
            'export default function Component() {\n'.repeat(50) +
            '  return <div>Hello</div>;\n'.repeat(50) +
            '}\n'.repeat(100)
        );

        const result = await deduper.deduplicate(repeatedContent);

        console.log(`  Original Size:       ${formatBytes(repeatedContent.length)}`);
        console.log(`  Unique Chunks:       ${result.newChunks.size}`);
        console.log(`  Dedup Ratio:         ${result.deduplicationRatio.toFixed(2)}x`);
        console.log(`  Space Saved:         ${formatBytes(repeatedContent.length - (repeatedContent.length / result.deduplicationRatio))}`);

        // Verify reconstruction
        const reconstructed = deduper.reconstruct(result.chunkHashes);
        const isValid = reconstructed.equals(repeatedContent);
        console.log(`  ✅ Reconstruction:   ${isValid ? 'PASSED' : 'FAILED'}`);

    } catch (error) {
        console.error('  ❌ Test failed:', error);
    }

    // ========================================================================
    // TEST 4: Full Pipeline
    // ========================================================================
    console.log('\n🎯 TEST 4: Full Compression Pipeline');
    console.log('-'.repeat(60));

    try {
        const sampleDocs = Buffer.from(generateSampleDocs());
        const sampleCode = Buffer.from(generateSampleCode());
        const sampleModel = Buffer.from(generateSampleModel());

        const result = await pipeline.compressKnowledgeBase({
            documentation: sampleDocs,
            codeExamples: sampleCode,
            model: sampleModel
        });

        console.log(`  📊 Compression Results:`);
        console.log(`  ${'─'.repeat(58)}`);
        console.log(`  Documentation:  ${formatBytes(result.compressed.documentation.originalSize)} → ${formatBytes(result.compressed.documentation.compressedSize)} (${result.compressed.documentation.ratio.toFixed(2)}x)`);
        console.log(`  Code Examples:  ${formatBytes(result.compressed.codeExamples.originalSize)} → ${formatBytes(result.compressed.codeExamples.compressedSize)} (${result.compressed.codeExamples.ratio.toFixed(2)}x)`);
        console.log(`  Model Data:     ${formatBytes(result.compressed.model.originalSize)} → ${formatBytes(result.compressed.model.compressedSize)} (${result.compressed.model.ratio.toFixed(2)}x)`);
        console.log(`  ${'─'.repeat(58)}`);
        console.log(`  TOTAL:          ${formatBytes(result.totalOriginalSize)} → ${formatBytes(result.totalCompressedSize)}`);
        console.log(`  Overall Ratio:  ${result.overallRatio.toFixed(2)}x 🎉`);
        console.log(`  Space Saved:    ${formatBytes(result.totalOriginalSize - result.totalCompressedSize)} (${((1 - result.totalCompressedSize / result.totalOriginalSize) * 100).toFixed(1)}%)`);

    } catch (error) {
        console.error('  ❌ Test failed:', error);
    }

    console.log('\n' + '='.repeat(60));
    console.log('✅ All Tests Complete!\n');
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function formatBytes(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
    if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}

function generateSampleDocs(): string {
    return `
# Azora BuildSpaces Documentation

## Overview
BuildSpaces is an AI-powered collaborative development environment where specialized agents work together to build projects.

## Features
- **Genesis Station**: Ideation and project creation
- **Code Chamber**: Real-time collaborative coding
- **Agent Crew**: Specialized AI agents (Elara, Zola, Jabari, Kofi, Abeni)
- **Real-time WebSocket**: Live updates and agent activities

## Getting Started

### Installation
\`\`\`bash
npm install
npm run dev
\`\`\`

### Configuration
Create a \`.env\` file with the following:
\`\`\`
DATABASE_URL="postgresql://..."
AI_FAMILY_URL="http://localhost:3030"
PORT=3100
\`\`\`

## API Reference

### Projects
- \`GET /api/projects\` - List all projects
- \`POST /api/projects\` - Create new project
- \`GET /api/projects/:id\` - Get project details

### Agents
- \`GET /api/agents\` - List all agents
- \`POST /api/agents/:name/task\` - Assign task to agent

## Architecture
The system uses a microservices architecture with:
- Express.js backend
- Prisma ORM
- Socket.IO for real-time communication
- PostgreSQL database

`.repeat(10); // Repeat to create larger sample
}

function generateSampleCode(): string {
    return `
import { Router } from 'express';
import { prisma } from '../index';

const router = Router();

// Get all projects
router.get('/', async (req, res) => {
    try {
        const projects = await prisma.project.findMany({
            orderBy: { updatedAt: 'desc' }
        });
        res.json(projects);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Failed to fetch projects' });
    }
});

// Create project
router.post('/', async (req, res) => {
    try {
        const { name, description } = req.body;
        const project = await prisma.project.create({
            data: { name, description }
        });
        res.status(201).json(project);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Failed to create project' });
    }
});

export default router;
`.repeat(20); // Repeat to create larger sample
}

function generateSampleModel(): string {
    // Simulate binary model data with random bytes
    const size = 1024 * 1024; // 1MB
    const buffer = Buffer.alloc(size);
    for (let i = 0; i < size; i++) {
        buffer[i] = Math.floor(Math.random() * 256);
    }
    return buffer.toString('binary');
}

// ============================================================================
// RUN TEST
// ============================================================================

testCompressionEngine().catch(console.error);
