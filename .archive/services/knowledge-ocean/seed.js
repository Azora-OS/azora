const ubuntu = [
  { id: 'ubuntu-1', content: 'Ubuntu: I am because we are. Ngiyakwazi ngoba sikwazi.', links: ['ubuntu-2', 'ubuntu-3'] },
  { id: 'ubuntu-2', content: 'Collective prosperity multiplies individual sovereignty', links: ['ubuntu-1', 'finance-1'] },
  { id: 'ubuntu-3', content: 'Knowledge shared is knowledge multiplied', links: ['ubuntu-1', 'education-1'] },
  { id: 'education-1', content: 'Learning is a journey we take together', links: ['ubuntu-3', 'education-2'] },
  { id: 'education-2', content: 'Every student success creates opportunities for others', links: ['education-1'] },
  { id: 'finance-1', content: 'Proof-of-Knowledge mining: Learn to earn', links: ['ubuntu-2', 'finance-2'] },
  { id: 'finance-2', content: 'AZR token circulates prosperity through the community', links: ['finance-1'] },
  { id: 'sankofa-1', content: 'Sankofa: Go back and fetch it - learn from the past', links: ['ubuntu-1'] },
  { id: 'elara-1', content: 'Elara teaches with patience, warmth, and Ubuntu wisdom', links: ['education-1', 'ubuntu-1'] },
  { id: 'themba-1', content: 'Themba: Hope drives learning and collective success', links: ['education-1', 'elara-1'] }
];

async function seed() {
  for (const node of ubuntu) {
    await fetch('http://localhost:4040/api/add', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(node)
    });
  }
  console.log('✅ Seeded', ubuntu.length, 'knowledge nodes');
}

seed();
