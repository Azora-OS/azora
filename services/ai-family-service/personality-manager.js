const fs = require('fs');
const path = require('path');

class PersonalityManager {
  constructor() {
    this.personalities = new Map();
    this.loadPersonalities();
  }

  loadPersonalities() {
    const personalitiesDir = path.join(__dirname, 'personalities');
    fs.readdirSync(personalitiesDir).forEach(file => {
      if (file.endsWith('.js')) {
        const personalityName = path.basename(file, '.js');
        const PersonalityModule = require(path.join(personalitiesDir, file));
        const personality = typeof PersonalityModule === 'function' ? new PersonalityModule() : PersonalityModule;
        this.personalities.set(personalityName, personality);
      }
    });
  }

  getPersonality(name) {
    return this.personalities.get(name);
  }

  listPersonalities() {
    return Array.from(this.personalities.values()).map(p => p.personality);
  }

  getAllPersonalities() {
    return Array.from(this.personalities.values()).map(p => ({
      name: p.name,
      role: p.role,
      traits: p.traits,
      mood: p.mood
    }));
  }
}

module.exports = new PersonalityManager();
