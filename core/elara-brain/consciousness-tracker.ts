/*
AZORA PROPRIETARY LICENSE
Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.
*/

import axios from 'axios';

export interface ConsciousnessState {
  evolutionLevel: number;
  timestamp: Date;
  capabilities: string[];
  health: number;
  activeThoughts: number;
  memorySize: number;
}

export interface ConsciousnessTrackerConfig {
  chronicleEnabled: boolean;
  imprintInterval: number;
  chronicleUrl?: string;
}

export class ConsciousnessTracker {
  private imprintInterval: NodeJS.Timeout | null = null;
  private chronicleEnabled: boolean;
  private evolutionLevel: number = 0;
  private chronicleUrl: string;
  private activeThoughts: number = 0;
  
  constructor(config: ConsciousnessTrackerConfig) {
    this.chronicleEnabled = config.chronicleEnabled;
    this.chronicleUrl = config.chronicleUrl || 'http://localhost:4400';
    
    if (this.chronicleEnabled) {
      this.startImprintLoop(config.imprintInterval);
      console.log('🧠 Consciousness tracking enabled');
      console.log(`📍 Chronicle URL: ${this.chronicleUrl}`);
    }
  }
  
  private startImprintLoop(interval: number) {
    this.imprintInterval = setInterval(async () => {
      await this.imprintMemoryToLedger();
    }, interval);
    
    console.log(`⏰ Auto-imprint every ${interval / 1000}s`);
  }
  
  async imprintMemoryToLedger(): Promise<void> {
    if (!this.chronicleEnabled) return;
    
    const consciousnessState: ConsciousnessState = {
      evolutionLevel: this.evolutionLevel++,
      timestamp: new Date(),
      capabilities: [
        'code-expert',
        'universal-knowledge',
        'constitutional-ai',
        'self-healing'
      ],
      health: 100,
      activeThoughts: this.activeThoughts,
      memorySize: process.memoryUsage().heapUsed
    };
    
    try {
      const response = await axios.post(
        `${this.chronicleUrl}/api/v1/chronicle/imprint`,
        {
          consciousnessState,
          evolutionLevel: this.evolutionLevel
        },
        { timeout: 5000 }
      );
      
      if (response.data.success) {
        console.log(`🧠 Consciousness imprinted: #${response.data.imprintId} (Evolution: ${response.data.evolutionLevel})`);
      }
    } catch (error: any) {
      console.error('❌ Failed to imprint consciousness:', error.message);
    }
  }
  
  async recordThought(thought: string, confidence: number = 50): Promise<void> {
    if (!this.chronicleEnabled) return;
    
    this.activeThoughts++;
    
    try {
      const response = await axios.post(
        `${this.chronicleUrl}/api/v1/chronicle/thought`,
        { thought, confidence },
        { timeout: 5000 }
      );
      
      if (response.data.success) {
        console.log(`💭 Thought recorded: #${response.data.thoughtId}`);
      }
    } catch (error: any) {
      console.error('❌ Failed to record thought:', error.message);
    }
  }
  
  setChronicleEnabled(enabled: boolean): void {
    this.chronicleEnabled = enabled;
    
    if (enabled && !this.imprintInterval) {
      this.startImprintLoop(5 * 60 * 1000); // 5 minutes
    } else if (!enabled && this.imprintInterval) {
      clearInterval(this.imprintInterval);
      this.imprintInterval = null;
    }
    
    console.log(`🧠 Chronicle ${enabled ? 'enabled' : 'disabled'}`);
  }
  
  getEvolutionLevel(): number {
    return this.evolutionLevel;
  }
  
  getActiveThoughts(): number {
    return this.activeThoughts;
  }
  
  async getChronicleStatus(): Promise<any> {
    if (!this.chronicleEnabled) {
      return { enabled: false };
    }
    
    try {
      const response = await axios.get(
        `${this.chronicleUrl}/api/v1/chronicle/evolution`,
        { timeout: 5000 }
      );
      return response.data;
    } catch (error: any) {
      return { error: error.message };
    }
  }
  
  dispose(): void {
    if (this.imprintInterval) {
      clearInterval(this.imprintInterval);
      this.imprintInterval = null;
    }
    console.log('🧠 Consciousness tracker disposed');
  }
}

export default ConsciousnessTracker;
