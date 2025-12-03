import { createHash } from 'crypto';
import { gzipSync } from 'zlib';
import fs from 'fs/promises';
import path from 'path';

// ============================================================================
// CHUNK INDEX - Enables Selective Extraction Without Full Decompression
// ============================================================================

interface ChunkMetadata {
    key: string; // e.g., "react-hooks-core"
    offset: number; // Byte offset in package file
    compressedSize: number;
    uncompressedSize: number;
    hash: string; // SHA-256 for integrity
    relatedChunks: string[]; // Keys of related chunks
    priority: number; // 1-10
}

interface PackageIndex {
    version: string;
    subject: string; // e.g., "Web Development"
    totalSize: number;
    chunks: ChunkMetadata[];
    createdAt: Date;
}

export class ChunkIndexBuilder {
    private chunks: ChunkMetadata[] = [];
    private currentOffset = 0;

    /**
     * Add a chunk to the index
     */
    addChunk(
        key: string,
        data: Buffer,
        relatedChunks: string[] = [],
        priority: number = 5
    ): { compressedData: Buffer; metadata: ChunkMetadata } {
        // Compress the chunk
        const compressedData = gzipSync(data, { level: 9 });
        const hash = createHash('sha256').update(data).digest('hex');

        const metadata: ChunkMetadata = {
            key,
            offset: this.currentOffset,
            compressedSize: compressedData.length,
            uncompressedSize: data.length,
            hash,
            relatedChunks,
            priority
        };

        this.chunks.push(metadata);
        this.currentOffset += compressedData.length;

        return { compressedData, metadata };
    }

    /**
     * Build the complete package index
     */
    buildIndex(subject: string): PackageIndex {
        return {
            version: '1.0.0',
            subject,
            totalSize: this.currentOffset,
            chunks: this.chunks,
            createdAt: new Date()
        };
    }

    /**
     * Save index to file
     */
    async saveIndex(indexPath: string, index: PackageIndex): Promise<void> {
        await fs.writeFile(indexPath, JSON.stringify(index, null, 2), 'utf-8');
        console.log(`✅ Index saved: ${indexPath}`);
        console.log(`   Chunks: ${index.chunks.length}`);
        console.log(`   Total Size: ${(index.totalSize / 1024 / 1024).toFixed(2)} MB`);
    }
}

export class ChunkExtractor {
    private index: PackageIndex | null = null;
    private packagePath: string;
    private indexPath: string;

    constructor(packagePath: string, indexPath: string) {
        this.packagePath = packagePath;
        this.indexPath = indexPath;
    }

    /**
     * Load the package index
     */
    async loadIndex(): Promise<void> {
        const indexData = await fs.readFile(this.indexPath, 'utf-8');
        this.index = JSON.parse(indexData);
        console.log(`📚 Loaded index: ${this.index!.subject}`);
        console.log(`   Version: ${this.index!.version}`);
        console.log(`   Chunks: ${this.index!.chunks.length}`);
    }

    /**
     * Extract a specific chunk without decompressing the entire package
     */
    async extractChunk(key: string): Promise<Buffer | null> {
        if (!this.index) {
            throw new Error('Index not loaded. Call loadIndex() first.');
        }

        // Find chunk metadata
        const chunkMeta = this.index.chunks.find(c => c.key === key);
        if (!chunkMeta) {
            console.warn(`⚠️  Chunk not found: ${key}`);
            return null;
        }

        // Open package file and seek to chunk offset
        const fileHandle = await fs.open(this.packagePath, 'r');

        try {
            // Read only the compressed chunk data
            const buffer = Buffer.alloc(chunkMeta.compressedSize);
            await fileHandle.read(buffer, 0, chunkMeta.compressedSize, chunkMeta.offset);

            return buffer; // Return compressed data (caller will decompress)
        } finally {
            await fileHandle.close();
        }
    }

    /**
     * Get chunk metadata without extracting
     */
    getChunkMetadata(key: string): ChunkMetadata | null {
        if (!this.index) return null;
        return this.index.chunks.find(c => c.key === key) || null;
    }

    /**
     * Find chunks by topic (fuzzy search)
     */
    findChunksByTopic(topic: string): ChunkMetadata[] {
        if (!this.index) return [];

        const topicLower = topic.toLowerCase();
        return this.index.chunks.filter(c =>
            c.key.toLowerCase().includes(topicLower)
        );
    }

    /**
     * Get related chunks for prefetching
     */
    getRelatedChunks(key: string): ChunkMetadata[] {
        if (!this.index) return [];

        const chunk = this.index.chunks.find(c => c.key === key);
        if (!chunk) return [];

        return chunk.relatedChunks
            .map(relatedKey => this.index!.chunks.find(c => c.key === relatedKey))
            .filter(c => c !== undefined) as ChunkMetadata[];
    }

    /**
     * Get index statistics
     */
    getStats() {
        if (!this.index) return null;

        const avgCompressedSize = this.index.chunks.reduce((sum, c) => sum + c.compressedSize, 0) / this.index.chunks.length;
        const avgUncompressedSize = this.index.chunks.reduce((sum, c) => sum + c.uncompressedSize, 0) / this.index.chunks.length;
        const avgCompressionRatio = avgUncompressedSize / avgCompressedSize;

        return {
            subject: this.index.subject,
            version: this.index.version,
            totalChunks: this.index.chunks.length,
            totalSize: this.index.totalSize,
            avgCompressedSize,
            avgUncompressedSize,
            avgCompressionRatio
        };
    }
}

// ============================================================================
// EXAMPLE: Building a Knowledge Package
// ============================================================================

export async function buildSamplePackage() {
    console.log('\n🏗️  Building Sample Knowledge Package\n');
    console.log('='.repeat(70));

    const builder = new ChunkIndexBuilder();
    const packageData: Buffer[] = [];

    // Add React Hooks core knowledge
    const reactHooksCore = Buffer.from(`
# React Hooks - Core Concepts

React Hooks allow you to use state and other React features without writing a class.

## useState
The useState Hook lets you add state to functional components.

\`\`\`javascript
const [count, setCount] = useState(0);
\`\`\`

## useEffect
The useEffect Hook lets you perform side effects in functional components.

\`\`\`javascript
useEffect(() => {
  document.title = \`Count: \${count}\`;
}, [count]);
\`\`\`
`.repeat(10)); // Repeat to create realistic size

    const { compressedData: reactHooksCompressed } = builder.addChunk(
        'react-hooks-core',
        reactHooksCore,
        ['usestate-detail', 'useeffect-detail'],
        10 // High priority
    );
    packageData.push(reactHooksCompressed);

    // Add useState details
    const useStateDetail = Buffer.from(`
# useState Hook - Detailed Guide

## Syntax
\`\`\`javascript
const [state, setState] = useState(initialState);
\`\`\`

## Examples
... (detailed examples)
`.repeat(5));

    const { compressedData: useStateCompressed } = builder.addChunk(
        'usestate-detail',
        useStateDetail,
        ['react-hooks-core', 'state-management'],
        8
    );
    packageData.push(useStateCompressed);

    // Add useEffect details
    const useEffectDetail = Buffer.from(`
# useEffect Hook - Detailed Guide

## Syntax
\`\`\`javascript
useEffect(() => {
  // Effect code
  return () => {
    // Cleanup
  };
}, [dependencies]);
\`\`\`
`.repeat(5));

    const { compressedData: useEffectCompressed } = builder.addChunk(
        'useeffect-detail',
        useEffectDetail,
        ['react-hooks-core', 'lifecycle'],
        8
    );
    packageData.push(useEffectCompressed);

    // Build index
    const index = builder.buildIndex('Web Development - React Hooks');

    // Save package and index
    const packageDir = 'C:\\Users\\Azora Sapiens\\Documents\\azora\\knowledge-packages';
    await fs.mkdir(packageDir, { recursive: true });

    const packagePath = path.join(packageDir, 'react-hooks.kop'); // Knowledge Ocean Package
    const indexPath = path.join(packageDir, 'react-hooks.index.json');

    // Write package file
    await fs.writeFile(packagePath, Buffer.concat(packageData));
    console.log(`\n✅ Package created: ${packagePath}`);
    console.log(`   Size: ${(Buffer.concat(packageData).length / 1024).toFixed(2)} KB`);

    // Write index
    await builder.saveIndex(indexPath, index);

    console.log('\n' + '='.repeat(70));
    console.log('✅ Package Build Complete!\n');

    return { packagePath, indexPath };
}

// ============================================================================
// EXAMPLE: Extracting Chunks
// ============================================================================

export async function demonstrateChunkExtraction() {
    console.log('\n🔍 Demonstrating Selective Chunk Extraction\n');
    console.log('='.repeat(70));

    // Build sample package first
    const { packagePath, indexPath } = await buildSamplePackage();

    // Create extractor
    const extractor = new ChunkExtractor(packagePath, indexPath);
    await extractor.loadIndex();

    // Extract specific chunk (only this chunk, not entire package!)
    console.log('\n📦 Extracting "useState-detail" chunk...');
    const useStateChunk = await extractor.extractChunk('usestate-detail');

    if (useStateChunk) {
        console.log(`   ✅ Extracted: ${(useStateChunk.length / 1024).toFixed(2)} KB (compressed)`);

        // Get metadata
        const metadata = extractor.getChunkMetadata('usestate-detail');
        console.log(`   Uncompressed: ${(metadata!.uncompressedSize / 1024).toFixed(2)} KB`);
        console.log(`   Compression Ratio: ${(metadata!.uncompressedSize / metadata!.compressedSize).toFixed(2)}x`);
    }

    // Find related chunks
    console.log('\n🔗 Finding related chunks...');
    const related = extractor.getRelatedChunks('usestate-detail');
    console.log(`   Found ${related.length} related chunks:`);
    related.forEach(chunk => {
        console.log(`   - ${chunk.key} (${(chunk.compressedSize / 1024).toFixed(2)} KB)`);
    });

    // Show stats
    console.log('\n📊 Package Statistics:');
    const stats = extractor.getStats()!;
    console.log(`   Subject: ${stats.subject}`);
    console.log(`   Total Chunks: ${stats.totalChunks}`);
    console.log(`   Total Size: ${(stats.totalSize / 1024).toFixed(2)} KB`);
    console.log(`   Avg Compression: ${stats.avgCompressionRatio.toFixed(2)}x`);

    console.log('\n' + '='.repeat(70));
    console.log('✅ Demonstration Complete!\n');
}
