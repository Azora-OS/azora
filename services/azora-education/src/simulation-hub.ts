/*
AZORA PROPRIETARY LICENSE
Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

Unified Simulation Hub - PhET + Custom Simulations
*/

import { phetIntegration } from './phet-integration';

export class SimulationHub {
  /**
   * Get all available simulations (PhET + Custom)
   */
  getAllSimulations() {
    return {
      phet: phetIntegration.getAllSimulations(),
      custom: {
        math: [
          { id: 'fraction-visualizer', name: 'Fraction Visualizer 🍕', grade: '3-5', type: 'custom' },
        ],
        science: [
          { id: 'ecosystem-simulator', name: 'Ecosystem Simulator 🌿', grade: '6-12', type: 'custom' },
        ],
        physics: [
          { id: 'force-visualizer', name: 'Force & Motion ⚡', grade: '6-12', type: 'custom' },
        ],
        geography: [
          { id: 'interactive-globe', name: 'Interactive Globe 🌍', grade: '3-12', type: 'custom' },
        ],
      },
    };
  }

  /**
   * Get simulation by ID (checks both PhET and custom)
   */
  getSimulation(simId: string) {
    // Check custom first
    const customSims = this.getAllSimulations().custom;
    for (const [subject, sims] of Object.entries(customSims)) {
      const found = sims.find((s: any) => s.id === simId);
      if (found) return { ...found, source: 'custom', subject };
    }

    // Check PhET
    const phetSims = phetIntegration.getAllSimulations();
    for (const [subject, sims] of Object.entries(phetSims)) {
      const found = sims.find(s => s.id === simId);
      if (found) return { ...found, source: 'phet', subject };
    }

    return null;
  }

  /**
   * Get recommended simulations for grade level
   */
  getRecommendedForGrade(grade: number) {
    const all = this.getAllSimulations();
    const recommended: any[] = [];

    // Add custom simulations
    Object.values(all.custom).forEach((sims: any) => {
      sims.forEach((sim: any) => {
        const [min, max] = sim.grade.split('-').map(Number);
        if (grade >= min && grade <= max) {
          recommended.push(sim);
        }
      });
    });

    // Add PhET simulations
    Object.values(all.phet).forEach((sims: any) => {
      sims.forEach((sim: any) => {
        const [min, max] = sim.grade.split('-').map(Number);
        if (grade >= min && grade <= max) {
          recommended.push({ ...sim, source: 'phet' });
        }
      });
    });

    return recommended;
  }
}

export const simulationHub = new SimulationHub();
