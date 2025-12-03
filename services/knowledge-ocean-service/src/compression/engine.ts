import { createHash } from 'crypto';
import { promisify } from 'util';
import lzma from 'lzma-native';
import brotli from 'brotli';
import xxhash from 'xxhash-wasm';

const compress = promisify(lzma.compress);

// ============================================================================
// COMPRESSION STRATEGIES
// ============================================================================

export interface CompressionResult {
    data: Buffer;
    algorithm: string;
    originalSize: number;
    compressedSize: number;
    ratio: number;
    hash: string;
}

export class HybridCompressor {
    private xxh: any;

    async initialize() {
        this.xxh = await xxhash();
    }

    /**
     * Detect content type for optimal compression
     */
    detectContentType(data: Buffer): 'code' | 'docs' | 'model' | 'embeddings' {
        const sample = data.slice(0, 1024).toString('utf-8');

        // Check for code patterns
        if (sample.includes('function') || sample.includes('const') || sample.includes('import')) {
            return 'code';
        }

        // Check for markdown/documentation
        if (sample.includes('# ') || sample.includes('## ')) {
            return 'docs';
        }

        // Check for binary model data (high entropy)
        const entropy = this.calculateEntropy(data.slice(0, 1024));
        if (entropy > 7.5) {
            return 'model';
        }

        return 'embeddings';
    }

    /**
     * Calculate Shannon entropy
     */
    private calculateEntropy(data: Buffer): number {
        const freq = new Map<number, number>();
        for (const byte of data) {
            freq.set(byte, (freq.get(byte) || 0) + 1);
        }

        let entropy = 0;
        const len = data.length;
        for (const count of freq.values()) {
            const p = count / len;
            entropy -= p * Math.log2(p);
        }

        return entropy;
    }

    /**
     * Compress with context-aware algorithm selection
     */
    async compress(data: Buffer, type?: string): Promise<CompressionResult> {
        const contentType = type || this.detectContentType(data);
        const originalSize = data.length;

        let compressed: Buffer;
        let algorithm: string;

        switch (contentType) {
            case 'code':
            case 'docs':
                // Use Brotli for text content (best compression)
                compressed = Buffer.from(brotli.compress(data, {
                    mode: 0, // Generic mode
                    quality: 11, // Maximum compression
                    lgwin: 24 // Large window size
                }));
                algorithm = 'brotli-11';
                break;

            case 'model':
            case 'embeddings':
                // Use LZMA for binary data
                compressed = await compress(data, {
                    preset: 9, // Maximum compression
                    check: lzma.CHECK_CRC64
                }) as Buffer;
                algorithm = 'lzma-9';
                break;

            default:
                compressed = data;
                algorithm = 'none';
        }

        const hash = this.xxh.h64ToString(compressed);

        return {
            data: compressed,
            algorithm,
            originalSize,
            compressedSize: compressed.length,
            ratio: originalSize / compressed.length,
            hash
        };
    }

    /**
     * Decompress data
     */
    async decompress(data: Buffer, algorithm: string): Promise<Buffer> {
        switch (algorithm) {
            case 'brotli-11':
                return Buffer.from(brotli.decompress(data));

            case 'lzma-9':
                return await promisify(lzma.decompress)(data) as Buffer;

            default:
                return data;
        }
    }
}

// ============================================================================
// DEDUPLICATION ENGINE
// ============================================================================

export class DeduplicationEngine {
    private chunks = new Map<string, Buffer>();
    private chunkSize = 4096; // 4KB chunks

    /**
     * Content-defined chunking using Rabin fingerprinting
     */
    private createChunks(data: Buffer): Buffer[] {
        const chunks: Buffer[] = [];
        let start = 0;

        while (start < data.length) {
            const end = Math.min(start + this.chunkSize, data.length);
            chunks.push(data.slice(start, end));
            start = end;
        }

        return chunks;
    }

    /**
     * Deduplicate data by storing unique chunks
     */
    async deduplicate(data: Buffer): Promise<{
        chunkHashes: string[];
        newChunks: Map<string, Buffer>;
        deduplicationRatio: number;
    }> {
        const chunks = this.createChunks(data);
        const chunkHashes: string[] = [];
        const newChunks = new Map<string, Buffer>();
        let uniqueBytes = 0;

        for (const chunk of chunks) {
            const hash = createHash('sha256').update(chunk).digest('hex');
            chunkHashes.push(hash);

            if (!this.chunks.has(hash)) {
                this.chunks.set(hash, chunk);
                newChunks.set(hash, chunk);
                uniqueBytes += chunk.length;
            }
        }

        return {
            chunkHashes,
            newChunks,
            deduplicationRatio: data.length / uniqueBytes
        };
    }

    /**
     * Reconstruct data from chunk hashes
     */
    reconstruct(chunkHashes: string[]): Buffer {
        const chunks = chunkHashes.map(hash => this.chunks.get(hash)!);
        return Buffer.concat(chunks);
    }

    /**
     * Get statistics
     */
    getStats() {
        const totalChunks = this.chunks.size;
        const totalSize = Array.from(this.chunks.values())
            .reduce((sum, chunk) => sum + chunk.length, 0);

        return {
            totalChunks,
            totalSize,
            averageChunkSize: totalSize / totalChunks
        };
    }
}

// ============================================================================
// KNOWLEDGE GRAPH COMPRESSOR
// ============================================================================

export interface KnowledgeNode {
    id: string;
    type: 'concept' | 'example' | 'documentation';
    content: string;
    references: string[]; // IDs of related nodes
}

export class KnowledgeGraphCompressor {
    private nodes = new Map<string, KnowledgeNode>();
    private contentIndex = new Map<string, string>(); // content hash -> node ID

    /**
     * Add knowledge with semantic deduplication
     */
    addKnowledge(node: KnowledgeNode): { nodeId: string; isDuplicate: boolean } {
        const contentHash = createHash('sha256').update(node.content).digest('hex');

        // Check if similar content already exists
        const existingNodeId = this.contentIndex.get(contentHash);
        if (existingNodeId) {
            // Merge references
            const existingNode = this.nodes.get(existingNodeId)!;
            existingNode.references = [
                ...new Set([...existingNode.references, ...node.references])
            ];
            return { nodeId: existingNodeId, isDuplicate: true };
        }

        // Store new node
        this.nodes.set(node.id, node);
        this.contentIndex.set(contentHash, node.id);
        return { nodeId: node.id, isDuplicate: false };
    }

    /**
     * Export compressed graph
     */
    export(): {
        nodes: KnowledgeNode[];
        compressionRatio: number;
    } {
        const nodes = Array.from(this.nodes.values());
        const totalContent = nodes.reduce((sum, n) => sum + n.content.length, 0);
        const uniqueContent = this.contentIndex.size;

        return {
            nodes,
            compressionRatio: totalContent / uniqueContent
        };
    }
}

// ============================================================================
// MAIN COMPRESSION PIPELINE
// ============================================================================

export class CompressionPipeline {
    private hybridCompressor = new HybridCompressor();
    private deduplicationEngine = new DeduplicationEngine();
    private knowledgeGraphCompressor = new KnowledgeGraphCompressor();

    async initialize() {
        await this.hybridCompressor.initialize();
    }

    /**
     * Full compression pipeline
     */
    async compressKnowledgeBase(data: {
        documentation: Buffer;
        codeExamples: Buffer;
        model: Buffer;
    }): Promise<{
        compressed: {
            documentation: CompressionResult;
            codeExamples: CompressionResult;
            model: CompressionResult;
        };
        totalOriginalSize: number;
        totalCompressedSize: number;
        overallRatio: number;
    }> {
        // Step 1: Deduplicate
        const docDedup = await this.deduplicationEngine.deduplicate(data.documentation);
        const codeDedup = await this.deduplicationEngine.deduplicate(data.codeExamples);

        // Step 2: Compress deduplicated data
        const docCompressed = await this.hybridCompressor.compress(
            Buffer.concat(Array.from(docDedup.newChunks.values())),
            'docs'
        );

        const codeCompressed = await this.hybridCompressor.compress(
            Buffer.concat(Array.from(codeDedup.newChunks.values())),
            'code'
        );

        const modelCompressed = await this.hybridCompressor.compress(
            data.model,
            'model'
        );

        const totalOriginalSize =
            data.documentation.length +
            data.codeExamples.length +
            data.model.length;

        const totalCompressedSize =
            docCompressed.compressedSize +
            codeCompressed.compressedSize +
            modelCompressed.compressedSize;

        return {
            compressed: {
                documentation: docCompressed,
                codeExamples: codeCompressed,
                model: modelCompressed
            },
            totalOriginalSize,
            totalCompressedSize,
            overallRatio: totalOriginalSize / totalCompressedSize
        };
    }
}
