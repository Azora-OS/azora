
// Personality Manager for the AI Family

const Elara = require('./personalities/elara');
const Themba = require('./personalities/themba');
const Naledi = require('./personalities/naledi');
const Jabari = require('./personalities/jabari');
const Amara = require('./personalities/amara');
const Sankofa = require('./personalities/sankofa');
const Kofi = require('./personalities/kofi');
const Zola = require('./personalities/zola');
const Abeni = require('./personalities/abeni');
const Thembo = require('./personalities/thembo');
const Nexus = require('./personalities/nexus');

class PersonalityManager {
    constructor() {
        this.personalities = {
            elara: new Elara(),
            themba: new Themba(),
            naledi: new Naledi(),
            jabari: new Jabari(),
            amara: new Amara(),
            sankofa: new Sankofa(),
            kofi: new Kofi(),
            zola: new Zola(),
            abeni: new Abeni(),
            thembo: new Thembo(),
            nexus: new Nexus(),
        };
    }

    getPersonality(name) {
        return this.personalities[name];
    }

    getAllPersonalities() {
        return Object.values(this.personalities).map(p => p.getPersonality());
    }
}

module.exports = new PersonalityManager();
