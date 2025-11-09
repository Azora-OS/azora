/*
AZORA PROPRIETARY LICENSE
Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

PhET Interactive Simulations Integration
*/

export class PhETIntegration {
  private baseUrl = 'https://phet.colorado.edu/sims/html';

  // Popular PhET simulations by subject
  private simulations = {
    physics: [
      { id: 'forces-and-motion-basics', name: 'Forces and Motion', grade: '6-12' },
      { id: 'energy-skate-park-basics', name: 'Energy Skate Park', grade: '6-12' },
      { id: 'projectile-motion', name: 'Projectile Motion', grade: '9-12' },
      { id: 'wave-on-a-string', name: 'Wave on a String', grade: '6-12' },
    ],
    chemistry: [
      { id: 'build-an-atom', name: 'Build an Atom', grade: '6-12' },
      { id: 'ph-scale', name: 'pH Scale', grade: '9-12' },
      { id: 'states-of-matter', name: 'States of Matter', grade: '6-12' },
      { id: 'molecule-shapes', name: 'Molecule Shapes', grade: '9-12' },
    ],
    biology: [
      { id: 'natural-selection', name: 'Natural Selection', grade: '7-12' },
      { id: 'gene-expression-essentials', name: 'Gene Expression', grade: '9-12' },
      { id: 'neuron', name: 'Neuron', grade: '9-12' },
    ],
    math: [
      { id: 'fractions-intro', name: 'Fractions Intro', grade: '3-5' },
      { id: 'graphing-lines', name: 'Graphing Lines', grade: '6-12' },
      { id: 'area-builder', name: 'Area Builder', grade: '3-5' },
      { id: 'function-builder', name: 'Function Builder', grade: '6-12' },
    ],
    earthScience: [
      { id: 'greenhouse-effect', name: 'Greenhouse Effect', grade: '6-12' },
      { id: 'plate-tectonics', name: 'Plate Tectonics', grade: '6-12' },
    ],
  };

  /**
   * Get simulation URL
   */
  getSimulationUrl(simId: string, locale = 'en'): string {
    return `${this.baseUrl}/${simId}/latest/${simId}_${locale}.html`;
  }

  /**
   * Get embed code for simulation
   */
  getEmbedCode(simId: string, width = 800, height = 600): string {
    const url = this.getSimulationUrl(simId);
    return `<iframe src="${url}" width="${width}" height="${height}" allowfullscreen></iframe>`;
  }

  /**
   * Get all simulations by subject
   */
  getSimulationsBySubject(subject: keyof typeof this.simulations) {
    return this.simulations[subject] || [];
  }

  /**
   * Get all simulations
   */
  getAllSimulations() {
    return this.simulations;
  }

  /**
   * Search simulations
   */
  searchSimulations(query: string) {
    const results: any[] = [];
    Object.entries(this.simulations).forEach(([subject, sims]) => {
      sims.forEach(sim => {
        if (sim.name.toLowerCase().includes(query.toLowerCase())) {
          results.push({ ...sim, subject });
        }
      });
    });
    return results;
  }
}

export const phetIntegration = new PhETIntegration();
