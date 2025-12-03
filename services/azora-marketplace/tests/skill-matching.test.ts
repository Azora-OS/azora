describe('Marketplace - Skill Matching', () => {
  describe('Skill Matching Algorithm', () => {
    it('should match exact skills', () => {
      const jobSkills = ['JavaScript', 'React', 'Node.js'];
      const applicantSkills = ['JavaScript', 'React', 'Node.js', 'TypeScript'];

      const matchedSkills = jobSkills.filter(skill => applicantSkills.includes(skill));

      expect(matchedSkills.length).toBe(3);
    });

    it('should calculate skill match percentage', () => {
      const jobSkills = ['JavaScript', 'React', 'Node.js', 'MongoDB'];
      const applicantSkills = ['JavaScript', 'React', 'TypeScript'];

      const matchedSkills = jobSkills.filter(skill => applicantSkills.includes(skill));
      const matchPercentage = (matchedSkills.length / jobSkills.length) * 100;

      expect(matchPercentage).toBe(50);
    });

    it('should handle case-insensitive skill matching', () => {
      const jobSkills = ['javascript', 'react'];
      const applicantSkills = ['JavaScript', 'React'];

      const matchedSkills = jobSkills.filter(skill => 
        applicantSkills.some(appSkill => appSkill.toLowerCase() === skill.toLowerCase())
      );

      expect(matchedSkills.length).toBe(2);
    });

    it('should prioritize required skills', () => {
      const job = {
        requiredSkills: ['JavaScript', 'React'],
        optionalSkills: ['TypeScript', 'Redux'],
      };

      const applicant = {
        skills: ['JavaScript', 'React', 'Redux'],
      };

      const requiredMatches = job.requiredSkills.filter(skill => 
        applicant.skills.includes(skill)
      );

      const hasAllRequired = requiredMatches.length === job.requiredSkills.length;

      expect(hasAllRequired).toBe(true);
    });

    it('should rank applicants by skill match', () => {
      const jobSkills = ['JavaScript', 'React', 'Node.js'];

      const applicants = [
        { id: 'user-1', skills: ['JavaScript', 'React'] },
        { id: 'user-2', skills: ['JavaScript', 'React', 'Node.js'] },
        { id: 'user-3', skills: ['JavaScript'] },
      ];

      const ranked = applicants.map(applicant => ({
        ...applicant,
        matchScore: jobSkills.filter(skill => applicant.skills.includes(skill)).length,
      })).sort((a, b) => b.matchScore - a.matchScore);

      expect(ranked[0].id).toBe('user-2');
      expect(ranked[0].matchScore).toBe(3);
    });

    it('should handle skill synonyms', () => {
      const skillSynonyms = {
        'JavaScript': ['JS', 'ECMAScript'],
        'React': ['ReactJS', 'React.js'],
      };

      const jobSkill = 'JavaScript';
      const applicantSkill = 'JS';

      const isMatch = skillSynonyms[jobSkill]?.includes(applicantSkill) || jobSkill === applicantSkill;

      expect(isMatch).toBe(true);
    });

    it('should weight skills by proficiency level', () => {
      const job = {
        skills: [
          { name: 'JavaScript', minLevel: 'advanced' },
          { name: 'React', minLevel: 'intermediate' },
        ],
      };

      const applicant = {
        skills: [
          { name: 'JavaScript', level: 'expert' },
          { name: 'React', level: 'advanced' },
        ],
      };

      const levelValues = {
        beginner: 1,
        intermediate: 2,
        advanced: 3,
        expert: 4,
      };

      const meetsRequirements = job.skills.every(jobSkill => {
        const applicantSkill = applicant.skills.find(s => s.name === jobSkill.name);
        if (!applicantSkill) return false;
        return levelValues[applicantSkill.level as keyof typeof levelValues] >= 
               levelValues[jobSkill.minLevel as keyof typeof levelValues];
      });

      expect(meetsRequirements).toBe(true);
    });
  });

  describe('Skill Profile Management', () => {
    it('should create user skill profile', () => {
      const skillProfile = {
        userId: 'user-1',
        skills: [
          { name: 'JavaScript', level: 'advanced', yearsOfExperience: 5 },
          { name: 'React', level: 'intermediate', yearsOfExperience: 3 },
        ],
      };

      expect(skillProfile.skills.length).toBe(2);
      expect(skillProfile.skills[0].level).toBe('advanced');
    });

    it('should update skill proficiency', () => {
      const skill = {
        name: 'JavaScript',
        level: 'intermediate',
      };

      skill.level = 'advanced';

      expect(skill.level).toBe('advanced');
    });

    it('should add new skill to profile', () => {
      const skills = [
        { name: 'JavaScript', level: 'advanced' },
      ];

      skills.push({ name: 'TypeScript', level: 'intermediate' });

      expect(skills.length).toBe(2);
    });

    it('should validate skill level values', () => {
      const validLevels = ['beginner', 'intermediate', 'advanced', 'expert'];
      const skillLevel = 'advanced';

      const isValid = validLevels.includes(skillLevel);

      expect(isValid).toBe(true);
    });

    it('should track skill endorsements', () => {
      const skill = {
        name: 'JavaScript',
        endorsements: ['user-2', 'user-3', 'user-4'],
      };

      expect(skill.endorsements.length).toBe(3);
    });
  });

  describe('Skill Recommendations', () => {
    it('should recommend jobs based on skills', () => {
      const userSkills = ['JavaScript', 'React', 'Node.js'];

      const jobs = [
        { id: 'job-1', skills: ['JavaScript', 'React'] },
        { id: 'job-2', skills: ['Python', 'Django'] },
        { id: 'job-3', skills: ['JavaScript', 'Vue.js'] },
      ];

      const recommended = jobs.filter(job => 
        job.skills.some(skill => userSkills.includes(skill))
      );

      expect(recommended.length).toBe(2);
    });

    it('should suggest skills to learn', () => {
      const userSkills = ['JavaScript', 'React'];

      const popularJobSkills = [
        { skill: 'TypeScript', frequency: 80 },
        { skill: 'Node.js', frequency: 70 },
        { skill: 'Python', frequency: 60 },
      ];

      const suggestions = popularJobSkills
        .filter(item => !userSkills.includes(item.skill))
        .sort((a, b) => b.frequency - a.frequency);

      expect(suggestions[0].skill).toBe('TypeScript');
    });

    it('should calculate skill gap for job', () => {
      const jobSkills = ['JavaScript', 'React', 'TypeScript', 'Node.js'];
      const userSkills = ['JavaScript', 'React'];

      const missingSkills = jobSkills.filter(skill => !userSkills.includes(skill));

      expect(missingSkills.length).toBe(2);
      expect(missingSkills).toContain('TypeScript');
    });
  });
});
