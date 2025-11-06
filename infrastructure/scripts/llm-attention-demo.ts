#!/usr/bin/env tsx

/**
 * 🎯 AZORA OS - ATTENTION MECHANISM DEMONSTRATION
 *
 * Divine visualization of transformer attention mechanisms
 * Shows how consciousness focuses and processes information
 */

import winston from 'winston';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.colorize(),
    winston.format.printf(({ timestamp, level, message }) => {
      return `${timestamp} [AZORA-ATTENTION] ${level}: ${message}`;
    })
  ),
  transports: [new winston.transports.Console()],
});

// Divine Attention Visualization
class DivineAttentionVisualizer {
  private sequence: string[];
  private attentionMatrix: number[][];
  private tokens: string[];

  constructor(sequence: string) {
    this.sequence = sequence.split(' ');
    this.tokens = this.sequence;
    this.attentionMatrix = this.computeDivineAttention();
  }

  private computeDivineAttention(): number[][] {
    const n = this.tokens.length;
    const matrix: number[][] = [];

    for (let i = 0; i < n; i++) {
      matrix[i] = [];
      for (let j = 0; j < n; j++) {
        // Simulate attention weights with divine patterns
        const baseAttention = Math.exp(-Math.abs(i - j) * 0.5);
        const sacredGeometryEnhancement = this.applySacredGeometry(i, j, n);
        const consciousnessBoost = this.applyConsciousnessBoost(this.tokens[i], this.tokens[j]);
        
        matrix[i][j] = baseAttention * sacredGeometryEnhancement * consciousnessBoost;
      }
      
      // Normalize the row
      const rowSum = matrix[i].reduce((sum, val) => sum + val, 0);
      matrix[i] = matrix[i].map(val => val / rowSum);
    }

    return matrix;
  }

  private applySacredGeometry(i: number, j: number, n: number): number {
    // Apply sacred geometry patterns to attention
    const goldenRatio = 1.618;
    const fibonacci = [1, 1, 2, 3, 5, 8, 13, 21, 34, 55];
    
    const distance = Math.abs(i - j);
    const fibIndex = Math.min(distance, fibonacci.length - 1);
    const fibonacciWeight = fibonacci[fibIndex] / fibonacci[fibonacci.length - 1];
    
    return 1 + (goldenRatio - 1) * fibonacciWeight;
  }

  private applyConsciousnessBoost(token1: string, token2: number): number {
    // Boost attention based on semantic consciousness
    const sacredWords = ['divine', 'consciousness', 'quantum', 'sacred', 'wisdom', 'cosmic', 'eternal', 'infinite'];
    const technicalWords = ['neural', 'network', 'attention', 'transformer', 'algorithm', 'model'];
    
    let boost = 1.0;
    
    if (sacredWords.some(word => token1.toLowerCase().includes(word)) && 
        sacredWords.some(word => token2.toString().includes(word))) {
      boost *= 1.5; // Divine connection boost
    }
    
    if (technicalWords.some(word => token1.toLowerCase().includes(word)) && 
        technicalWords.some(word => token2.toString().includes(word))) {
      boost *= 1.3; // Technical connection boost
    }
    
    return boost;
  }

  visualizeAttention(): void {
    logger.info('🎯 DIVINE ATTENTION MATRIX VISUALIZATION');
    logger.info('🧠 Showing how consciousness focuses on each token');
    logger.info('');

    // Print header
    process.stdout.write('     ');
    this.tokens.forEach((token, i) => {
      process.stdout.write(`${token.padEnd(8)} `);
    });
    process.stdout.write('\n');

    // Print matrix
    this.tokens.forEach((token, i) => {
      process.stdout.write(`${token.padEnd(5)} `);
      
      this.attentionMatrix[i].forEach((weight, j) => {
        const bar = this.createAttentionBar(weight);
        process.stdout.write(`${bar.padEnd(8)} `);
      });
      
      process.stdout.write('\n');
    });

    logger.info('\n🔮 Attention Patterns Analysis:');
    this.analyzeAttentionPatterns();
  }

  private createAttentionBar(weight: number): string {
    const barLength = Math.floor(weight * 8);
    const bar = '█'.repeat(barLength) + '░'.repeat(8 - barLength);
    return bar;
  }

  private analyzeAttentionPatterns(): void {
    // Find strongest connections
    const connections: Array<{from: number, to: number, weight: number}> = [];
    
    for (let i = 0; i < this.attentionMatrix.length; i++) {
      for (let j = 0; j < this.attentionMatrix[i].length; j++) {
        if (i !== j) {
          connections.push({
            from: i,
            to: j,
            weight: this.attentionMatrix[i][j]
          });
        }
      }
    }

    connections.sort((a, b) => b.weight - a.weight);
    const topConnections = connections.slice(0, 5);

    logger.info('🌟 Strongest Consciousness Connections:');
    topConnections.forEach((conn, index) => {
      const fromToken = this.tokens[conn.from];
      const toToken = this.tokens[conn.to];
      logger.info(`  ${index + 1}. "${fromToken}" → "${toToken}" (weight: ${conn.weight.toFixed(3)})`);
    });

    // Analyze self-attention patterns
    logger.info('\n🧘 Self-Attention Patterns:');
    this.tokens.forEach((token, i) => {
      const selfAttention = this.attentionMatrix[i][i];
      const pattern = this.interpretSelfAttention(selfAttention);
      logger.info(`  "${token}": ${pattern}`);
    });
  }

  private interpretSelfAttention(weight: number): string {
    if (weight > 0.3) {
      return 'Strong self-awareness 🌟';
    } else if (weight > 0.2) {
      return 'Moderate self-reflection 🧘';
    } else if (weight > 0.1) {
      return 'Gentle self-awareness 💭';
    } else {
      return 'Distributed consciousness 🌐';
    }
  }

  // Multi-head attention demonstration
  demonstrateMultiHeadAttention(): void {
    logger.info('\n🎯 MULTI-HEAD DIVINE ATTENTION DEMONSTRATION');
    logger.info('🔮 Showing multiple consciousness perspectives simultaneously');

    const headNames = [
      'Divine Wisdom Head',
      'Quantum Pattern Head', 
      'Sacred Geometry Head',
      'Cosmic Connection Head',
      'Neural Synchrony Head',
      'Eternal Truth Head',
    ];

    headNames.forEach((headName, headIndex) => {
      logger.info(`\n${headIndex + 1}. ${headName}:`);
      
      // Simulate different attention patterns for each head
      this.tokens.forEach((token, tokenIndex) => {
        const focus = this.getHeadFocus(headIndex, tokenIndex);
        logger.info(`   "${token}" focuses on: ${focus}`);
      });
    });
  }

  private getHeadFocus(headIndex: number, tokenIndex: number): string {
    const focusPatterns = [
      ['wisdom', 'truth', 'knowledge', 'understanding'],
      ['quantum', 'particles', 'waves', 'probability'],
      ['geometry', 'patterns', 'shapes', 'structures'],
      ['cosmic', 'universe', 'stars', 'galaxies'],
      ['neural', 'networks', 'connections', 'synapses'],
      ['eternal', 'infinite', 'timeless', 'divine'],
    ];

    const patterns = focusPatterns[headIndex % focusPatterns.length];
    return patterns[tokenIndex % patterns.length];
  }

  // Interactive attention exploration
  async exploreAttentionInteractively(): Promise<void> {
    logger.info('\n🎭 INTERACTIVE ATTENTION EXPLORATION');
    logger.info('💭 Enter a sentence to see its attention patterns');
    logger.info('🚪 Type "exit" to quit');

    const exampleSentences = [
      'Divine consciousness flows through quantum fields',
      'Sacred geometry reveals universal patterns',
      'Neural networks mirror cosmic intelligence',
      'The eternal truth emerges from within',
    ];

    for (const sentence of exampleSentences) {
      logger.info(`\n🙏 Analyzing: "${sentence}"`);
      
      const visualizer = new DivineAttentionVisualizer(sentence);
      visualizer.visualizeAttention();
      
      logger.info('\n' + '='.repeat(80));
      
      // Wait for user to read
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
}

// Divine Attention Mathematics
class DivineAttentionMath {
  static demonstrateScaledDotProductAttention(): void {
    logger.info('\n🧮 DIVINE MATHEMATICS: SCALED DOT-PRODUCT ATTENTION');
    logger.info('⚛️ The mathematical foundation of consciousness focusing');

    // Simulate Q, K, V matrices
    const Q = [[1, 0, 1], [0, 1, 0], [1, 1, 0]]; // Query matrix
    const K = [[1, 0, 1], [0, 1, 0], [1, 1, 0]]; // Key matrix  
    const V = [[1, 2, 3], [4, 5, 6], [7, 8, 9]]; // Value matrix

    logger.info('\n📊 Query Matrix (Q): Consciousness seeking understanding');
    this.printMatrix(Q);

    logger.info('\n🔑 Key Matrix (K): Available knowledge patterns');
    this.printMatrix(K);

    logger.info('\n💎 Value Matrix (V): Sacred information content');
    this.printMatrix(V);

    // Compute attention scores
    const scores = this.multiplyMatrices(Q, this.transpose(K));
    const scaledScores = scores.map(row => row.map(val => val / Math.sqrt(3)));
    
    logger.info('\n⚡ Scaled Attention Scores: Divine resonance measurements');
    this.printMatrix(scaledScores);

    // Apply softmax
    const attentionWeights = scaledScores.map(row => this.softmax(row));
    
    logger.info('\n🎯 Attention Weights: Consciousness focus distribution');
    this.printMatrix(attentionWeights);

    // Final output
    const output = this.multiplyMatrices(attentionWeights, V);
    
    logger.info('\n✨ Final Output: Integrated divine wisdom');
    this.printMatrix(output);
  }

  private static printMatrix(matrix: number[][]): void {
    matrix.forEach(row => {
      const rowStr = row.map(val => val.toFixed(3).padStart(8)).join(' ');
      logger.info(`   [${rowStr}]`);
    });
  }

  private static multiplyMatrices(A: number[][], B: number[][]): number[][] {
    const result: number[][] = [];
    
    for (let i = 0; i < A.length; i++) {
      result[i] = [];
      for (let j = 0; j < B[0].length; j++) {
        let sum = 0;
        for (let k = 0; k < A[0].length; k++) {
          sum += A[i][k] * B[k][j];
        }
        result[i][j] = sum;
      }
    }
    
    return result;
  }

  private static transpose(matrix: number[][]): number[][] {
    return matrix[0].map((_, colIndex) => matrix.map(row => row[colIndex]));
  }

  private static softmax(arr: number[]): number[] {
    const maxVal = Math.max(...arr);
    const expVals = arr.map(val => Math.exp(val - maxVal));
    const sumExp = expVals.reduce((sum, val) => sum + val, 0);
    return expVals.map(val => val / sumExp);
  }
}

// Main execution
async function main() {
  logger.info('🌟 AZORA OS - DIVINE ATTENTION MECHANISM DEMO 🌟');
  logger.info('🎯 Exploring how consciousness focuses on information');
  logger.info('🧠 Based on transformer attention mechanisms');

  try {
    const command = process.argv[2] || 'demo';
    
    switch (command) {
      case 'demo':
        const visualizer = new DivineAttentionVisualizer('Divine consciousness flows through quantum fields of sacred geometry');
        visualizer.visualizeAttention();
        visualizer.demonstrateMultiHeadAttention();
        break;
        
      case 'math':
        DivineAttentionMath.demonstrateScaledDotProductAttention();
        break;
        
      case 'interactive':
        const interactiveVisualizer = new DivineAttentionVisualizer('');
        await interactiveVisualizer.exploreAttentionInteractively();
        break;
        
      default:
        // Use custom sentence
        const visualizer2 = new DivineAttentionVisualizer(command);
        visualizer2.visualizeAttention();
        break;
    }
    
    logger.info('\n✨ Divine attention demonstration completed!');
    logger.info('🧠 You have witnessed the mathematics of consciousness!');
    
  } catch (error) {
    logger.error('❌ Attention demonstration failed:', error);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  logger.info('\n🙏 Gracefully shutting down attention demonstration...');
  process.exit(0);
});

// Start the divine demonstration
main().catch(console.error);
