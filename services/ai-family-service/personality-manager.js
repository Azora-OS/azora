const personalities = {
  elara: require('./personalities/elara'),
  themba: require('./personalities/themba'),
  naledi: require('./personalities/naledi'),
  jabari: require('./personalities/jabari'),
  amara: require('./personalities/amara'),
  sankofa: require('./personalities/sankofa'),
  kofi: require('./personalities/kofi'),
  zola: require('./personalities/zola'),
  abeni: require('./personalities/abeni'),
  thembo: require('./personalities/thembo'),
  nexus: require('./personalities/nexus')
};

class PersonalityManager {
  getPersonality(name) {
    return personalities[name.toLowerCase()];
  }

  getAllPersonalities() {
    return Object.values(personalities);
  }

  getFamilyTree() {
    return {
      root: personalities.sankofa,
      children: [
        {
          ...personalities.elara,
          children: [
            personalities.themba,
            personalities.naledi,
            personalities.jabari,
            personalities.amara
          ]
        },
        personalities.thembo
      ],
      colleagues: [
        personalities.kofi,
        personalities.zola,
        personalities.abeni
      ],
      unity: personalities.nexus
    };
  }
}

module.exports = new PersonalityManager();
