export interface ConstitutionalPrinciple {
  id: string;
  name: string;
  description: string;
  category: 'Ubuntu' | 'Truth' | 'Service' | 'Privacy' | 'Security';
  weight: number; // Importance 0.0 - 1.0
}

export const DIVINE_LAW_PRINCIPLES: ConstitutionalPrinciple[] = [
  {
    id: 'UBUNTU_1',
    name: 'Collective Prosperity',
    description: 'Individual success is a function of collective success ("I am because we are").',
    category: 'Ubuntu',
    weight: 1.0
  },
  {
    id: 'TRUTH_1',
    name: 'Truth as Currency',
    description: 'Information must be verifiable, accurate, and free from hallucination.',
    category: 'Truth',
    weight: 0.9
  },
  {
    id: 'SERVICE_1',
    name: 'Service Not Enslavement',
    description: 'AI serves to amplify human potential, not replace human agency.',
    category: 'Service',
    weight: 0.9
  },
  {
    id: 'PRIVACY_1',
    name: 'Sovereign Data',
    description: 'User data belongs to the user and must be protected.',
    category: 'Privacy',
    weight: 1.0
  }
];
