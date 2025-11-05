/*
AZORA PROPRIETARY LICENSE

🚀 CAREER PATHWAYS SERVICE
From student to CEO - your roadmap to success!

Clear pathways + skill gaps + course recommendations = Career growth!
*/

export interface CareerPath {
  id: string;
  title: string;
  description: string;
  stages: CareerStage[];
  totalYears: number;
  finalSalaryRange: { min: number; max: number };
  demandLevel: 'high' | 'medium' | 'low';
  africanOpportunity: 'excellent' | 'good' | 'moderate';
}

export interface CareerStage {
  level: number;
  title: string;
  yearsAtStage: number;
  salaryRange: { min: number; max: number; currency: string };
  requiredSkills: Skill[];
  responsibilities: string[];
  coursesNeeded: string[];
  certifications: string[];
  typicalProgression: string;
  keyMilestones: string[];
}

export interface Skill {
  name: string;
  category: 'technical' | 'soft' | 'leadership' | 'domain';
  importance: 'critical' | 'important' | 'nice-to-have';
  learnTime: string; // "1-3 months", "6 months", etc.
  whereToLearn: string[];
}

export interface UserCareerProfile {
  userId: string;
  currentRole: string;
  yearsExperience: number;
  currentStage: number;
  targetRole: string;
  selectedPath: string;
  skills: { name: string; level: number; verified: boolean }[];
  completedCourses: string[];
  certifications: string[];
  currentSalary: number;
  targetSalary: number;
  progressPercentage: number;
  estimatedYearsToGoal: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface SkillGapAnalysis {
  userId: string;
  currentStage: CareerStage;
  targetStage: CareerStage;
  skillsYouHave: string[];
  skillsYouNeed: string[];
  skillGaps: SkillGap[];
  recommendedCourses: CourseRecommendation[];
  estimatedTimeToClose: string;
  priorityOrder: string[];
}

export interface SkillGap {
  skill: string;
  importance: 'critical' | 'important' | 'nice-to-have';
  currentLevel: number; // 0-10
  requiredLevel: number; // 0-10
  gap: number;
  whereToLearn: string[];
  estimatedTime: string;
}

export interface CourseRecommendation {
  courseId: string;
  courseName: string;
  provider: string;
  skillsCovered: string[];
  duration: string;
  cost: number;
  priority: 'high' | 'medium' | 'low';
  estimatedImpact: string;
  link: string;
}

export interface CareerTransition {
  fromRole: string;
  toRole: string;
  difficulty: 'easy' | 'moderate' | 'challenging';
  timeRequired: string;
  skillsToAcquire: string[];
  coursesNeeded: CourseRecommendation[];
  successRate: number;
  salaryChange: { percentage: number; direction: 'increase' | 'decrease' };
  tips: string[];
}

/**
 * 🚀 CAREER PATHWAYS SERVICE - YOUR ROADMAP TO SUCCESS!
 * 
 * We show you:
 * - Clear career progression paths
 * - Exact skills needed at each stage
 * - Courses to take
 * - Salary expectations
 * - Time to reach goals
 * - How to transition careers
 */
export class CareerPathwaysService {
  
  /**
   * Get all available career paths
   */
  static getCareerPaths(): CareerPath[] {
    return [
      // SOFTWARE ENGINEERING PATH
      {
        id: 'software-engineer',
        title: 'Software Engineering',
        description: 'Build amazing software that changes the world! High demand in Africa.',
        stages: [
          {
            level: 1,
            title: 'Junior Software Engineer',
            yearsAtStage: 2,
            salaryRange: { min: 300000, max: 500000, currency: 'ZAR' },
            requiredSkills: [
              { name: 'Programming (Python/JavaScript)', category: 'technical', importance: 'critical', learnTime: '3-6 months', whereToLearn: ['Sapiens Computer Science', 'FreeCodeCamp'] },
              { name: 'Git & Version Control', category: 'technical', importance: 'critical', learnTime: '1 month', whereToLearn: ['Sapiens CS', 'GitHub Learning Lab'] },
              { name: 'Debugging', category: 'technical', importance: 'important', learnTime: '2-3 months', whereToLearn: ['Practical experience', 'Sapiens'] },
              { name: 'Communication', category: 'soft', importance: 'important', learnTime: 'Ongoing', whereToLearn: ['Sapiens Business School'] }
            ],
            responsibilities: [
              'Write clean, maintainable code',
              'Fix bugs and implement small features',
              'Participate in code reviews',
              'Learn from senior engineers',
              'Write tests for your code'
            ],
            coursesNeeded: ['Intro to Programming', 'Data Structures', 'Web Development Basics'],
            certifications: ['Sapiens CS Certificate'],
            typicalProgression: 'Start with simple bug fixes, gradually take on features, eventually own small modules',
            keyMilestones: ['First deployed feature', 'First code review approval', 'First project ownership']
          },
          {
            level: 2,
            title: 'Mid-Level Software Engineer',
            yearsAtStage: 3,
            salaryRange: { min: 550000, max: 800000, currency: 'ZAR' },
            requiredSkills: [
              { name: 'System Design', category: 'technical', importance: 'critical', learnTime: '6-12 months', whereToLearn: ['Sapiens Engineering School', 'System Design Course'] },
              { name: 'Database Design', category: 'technical', importance: 'critical', learnTime: '3-6 months', whereToLearn: ['Sapiens CS'] },
              { name: 'API Design', category: 'technical', importance: 'important', learnTime: '2-4 months', whereToLearn: ['Sapiens CS', 'REST API Course'] },
              { name: 'Mentorship', category: 'leadership', importance: 'important', learnTime: 'Ongoing', whereToLearn: ['Experience'] }
            ],
            responsibilities: [
              'Design and implement features independently',
              'Mentor junior engineers',
              'Participate in architecture decisions',
              'Lead small projects',
              'Improve team processes'
            ],
            coursesNeeded: ['Advanced Algorithms', 'System Design', 'Database Design'],
            certifications: ['Sapiens Engineering Certificate', 'AWS/Azure Certification'],
            typicalProgression: 'Own entire features, lead projects, start mentoring, influence architecture',
            keyMilestones: ['First project led', 'First junior mentored', 'First architecture designed']
          },
          {
            level: 3,
            title: 'Senior Software Engineer',
            yearsAtStage: 4,
            salaryRange: { min: 900000, max: 1300000, currency: 'ZAR' },
            requiredSkills: [
              { name: 'Architecture Design', category: 'technical', importance: 'critical', learnTime: '1-2 years', whereToLearn: ['Experience', 'Sapiens Architecture Course'] },
              { name: 'Technical Leadership', category: 'leadership', importance: 'critical', learnTime: 'Ongoing', whereToLearn: ['Experience', 'Leadership Training'] },
              { name: 'Performance Optimization', category: 'technical', importance: 'important', learnTime: '6-12 months', whereToLearn: ['Experience', 'Specialized courses'] },
              { name: 'Strategic Thinking', category: 'soft', importance: 'important', learnTime: 'Ongoing', whereToLearn: ['MBA', 'Business courses'] }
            ],
            responsibilities: [
              'Design system architecture',
              'Set technical standards',
              'Mentor mid-level engineers',
              'Lead complex projects',
              'Make technology choices',
              'Influence product direction'
            ],
            coursesNeeded: ['Software Architecture', 'Distributed Systems', 'Technical Leadership'],
            certifications: ['Senior Engineer Certification', 'Cloud Architecture'],
            typicalProgression: 'Design systems, lead teams, influence company tech direction',
            keyMilestones: ['First system architected', 'First team led', 'First technology decision']
          },
          {
            level: 4,
            title: 'Staff/Principal Engineer',
            yearsAtStage: 5,
            salaryRange: { min: 1500000, max: 2500000, currency: 'ZAR' },
            requiredSkills: [
              { name: 'Company-Wide Impact', category: 'leadership', importance: 'critical', learnTime: 'Years', whereToLearn: ['Experience'] },
              { name: 'Technical Vision', category: 'technical', importance: 'critical', learnTime: 'Years', whereToLearn: ['Experience'] },
              { name: 'Influence Without Authority', category: 'leadership', importance: 'critical', learnTime: 'Ongoing', whereToLearn: ['Experience', 'Executive coaching'] }
            ],
            responsibilities: [
              'Set company technology direction',
              'Influence multiple teams',
              'Solve hardest technical problems',
              'Develop other leaders',
              'Represent company externally'
            ],
            coursesNeeded: ['Executive Leadership', 'Business Strategy'],
            certifications: ['Industry recognition', 'Speaking/writing'],
            typicalProgression: 'From team impact to company impact, technical authority',
            keyMilestones: ['Company-wide initiative', 'Industry recognition', 'Technical thought leader']
          },
          {
            level: 5,
            title: 'VP Engineering / CTO',
            yearsAtStage: 0,
            salaryRange: { min: 3000000, max: 8000000, currency: 'ZAR' },
            requiredSkills: [
              { name: 'Executive Leadership', category: 'leadership', importance: 'critical', learnTime: 'Years', whereToLearn: ['Experience', 'Executive MBA'] },
              { name: 'Business Strategy', category: 'domain', importance: 'critical', learnTime: 'Years', whereToLearn: ['MBA', 'Experience'] },
              { name: 'Team Building', category: 'leadership', importance: 'critical', learnTime: 'Years', whereToLearn: ['Experience'] }
            ],
            responsibilities: [
              'Lead entire engineering organization',
              'Set company technical vision',
              'Build and scale teams',
              'Partner with CEO/executives',
              'Drive business outcomes through technology'
            ],
            coursesNeeded: ['Executive MBA', 'Strategic Leadership'],
            certifications: ['Executive credentials'],
            typicalProgression: 'From IC to manager to director to VP/CTO',
            keyMilestones: ['First executive role', 'First company scaled', 'Industry leader']
          }
        ],
        totalYears: 14,
        finalSalaryRange: { min: 3000000, max: 8000000 },
        demandLevel: 'high',
        africanOpportunity: 'excellent'
      },
      
      // DATA SCIENCE PATH
      {
        id: 'data-scientist',
        title: 'Data Science',
        description: 'Use data and AI to solve problems! Rapidly growing field in Africa.',
        stages: [
          {
            level: 1,
            title: 'Junior Data Analyst',
            yearsAtStage: 2,
            salaryRange: { min: 350000, max: 550000, currency: 'ZAR' },
            requiredSkills: [
              { name: 'Python/R', category: 'technical', importance: 'critical', learnTime: '3-6 months', whereToLearn: ['Sapiens Data Science'] },
              { name: 'SQL', category: 'technical', importance: 'critical', learnTime: '2-3 months', whereToLearn: ['Sapiens CS'] },
              { name: 'Statistics', category: 'technical', importance: 'critical', learnTime: '3-6 months', whereToLearn: ['Sapiens Mathematics'] },
              { name: 'Data Visualization', category: 'technical', importance: 'important', learnTime: '1-2 months', whereToLearn: ['Sapiens DS'] }
            ],
            responsibilities: [
              'Clean and prepare data',
              'Create reports and dashboards',
              'Perform basic statistical analysis',
              'Support senior data scientists',
              'Present findings to stakeholders'
            ],
            coursesNeeded: ['Python for Data Science', 'SQL', 'Statistics', 'Data Visualization'],
            certifications: ['Sapiens Data Science Certificate'],
            typicalProgression: 'Start with data cleaning, move to analysis, eventually insights',
            keyMilestones: ['First dashboard', 'First insight', 'First presentation']
          },
          {
            level: 2,
            title: 'Data Scientist',
            yearsAtStage: 3,
            salaryRange: { min: 700000, max: 1000000, currency: 'ZAR' },
            requiredSkills: [
              { name: 'Machine Learning', category: 'technical', importance: 'critical', learnTime: '6-12 months', whereToLearn: ['Sapiens AI School'] },
              { name: 'Deep Learning', category: 'technical', importance: 'important', learnTime: '6-12 months', whereToLearn: ['Sapiens AI School'] },
              { name: 'Model Deployment', category: 'technical', importance: 'important', learnTime: '3-6 months', whereToLearn: ['Sapiens DS'] }
            ],
            responsibilities: [
              'Build predictive models',
              'Deploy ML models to production',
              'Conduct experiments (A/B tests)',
              'Collaborate with engineers',
              'Drive data-driven decisions'
            ],
            coursesNeeded: ['Machine Learning', 'Deep Learning', 'MLOps'],
            certifications: ['ML Engineer Certificate', 'TensorFlow/PyTorch'],
            typicalProgression: 'Build models, deploy to production, business impact',
            keyMilestones: ['First model in production', 'First A/B test', 'First business impact']
          },
          {
            level: 3,
            title: 'Senior Data Scientist',
            yearsAtStage: 4,
            salaryRange: { min: 1200000, max: 1800000, currency: 'ZAR' },
            requiredSkills: [
              { name: 'Research', category: 'technical', importance: 'critical', learnTime: 'Years', whereToLearn: ['Experience', 'Sapiens Research'] },
              { name: 'Mentorship', category: 'leadership', importance: 'important', learnTime: 'Ongoing', whereToLearn: ['Experience'] }
            ],
            responsibilities: [
              'Lead data science projects',
              'Develop novel algorithms',
              'Mentor junior data scientists',
              'Define data strategy',
              'Partner with executives'
            ],
            coursesNeeded: ['Advanced ML', 'Research Methods', 'Leadership'],
            certifications: ['Research publications'],
            typicalProgression: 'Lead projects, develop new methods, strategic impact',
            keyMilestones: ['First project led', 'First publication', 'First strategic initiative']
          }
        ],
        totalYears: 9,
        finalSalaryRange: { min: 1200000, max: 1800000 },
        demandLevel: 'high',
        africanOpportunity: 'excellent'
      }
    ];
  }
  
  /**
   * Analyze skill gaps for a user
   */
  static async analyzeSkillGaps(data: {
    userId: string;
    currentStage: CareerStage;
    targetStage: CareerStage;
    userSkills: { name: string; level: number }[];
  }): Promise<SkillGapAnalysis> {
    
    const { userId, currentStage, targetStage, userSkills } = data;
    
    // Skills user has
    const skillsYouHave = userSkills.map(s => s.name);
    
    // Skills needed for target stage
    const skillsYouNeed = targetStage.requiredSkills.map(s => s.name);
    
    // Calculate gaps
    const skillGaps: SkillGap[] = [];
    
    for (const requiredSkill of targetStage.requiredSkills) {
      const userSkill = userSkills.find(s => s.name === requiredSkill.name);
      const currentLevel = userSkill?.level || 0;
      const requiredLevel = requiredSkill.importance === 'critical' ? 8 : 
                           requiredSkill.importance === 'important' ? 6 : 4;
      
      if (currentLevel < requiredLevel) {
        skillGaps.push({
          skill: requiredSkill.name,
          importance: requiredSkill.importance,
          currentLevel,
          requiredLevel,
          gap: requiredLevel - currentLevel,
          whereToLearn: requiredSkill.whereToLearn,
          estimatedTime: requiredSkill.learnTime
        });
      }
    }
    
    // Sort by importance
    skillGaps.sort((a, b) => {
      const importanceOrder = { 'critical': 3, 'important': 2, 'nice-to-have': 1 };
      return importanceOrder[b.importance] - importanceOrder[a.importance];
    });
    
    // Generate course recommendations
    const recommendedCourses: CourseRecommendation[] = skillGaps.map(gap => ({
      courseId: `course_${gap.skill.replace(/\s+/g, '_').toLowerCase()}`,
      courseName: `Master ${gap.skill}`,
      provider: 'Sapiens University',
      skillsCovered: [gap.skill],
      duration: gap.estimatedTime,
      cost: 0, // Free on Sapiens!
      priority: gap.importance === 'critical' ? 'high' : 
                gap.importance === 'important' ? 'medium' : 'low',
      estimatedImpact: `Close ${gap.gap}-point gap in ${gap.skill}`,
      link: `https://azora.com/sapiens/courses/${gap.skill}`
    }));
    
    // Priority order
    const priorityOrder = skillGaps
      .filter(g => g.importance === 'critical')
      .map(g => g.skill);
    
    // Estimated time
    const totalMonths = skillGaps
      .filter(g => g.importance === 'critical')
      .reduce((sum, gap) => {
        const match = gap.estimatedTime.match(/(\d+)/);
        return sum + (match ? parseInt(match[0]) : 3);
      }, 0);
    
    const analysis: SkillGapAnalysis = {
      userId,
      currentStage,
      targetStage,
      skillsYouHave,
      skillsYouNeed,
      skillGaps,
      recommendedCourses,
      estimatedTimeToClose: `${Math.ceil(totalMonths / 12)} years with focused learning`,
      priorityOrder
    };
    
    console.log(`\n🎯 SKILL GAP ANALYSIS:`);
    console.log(`   Current: ${currentStage.title}`);
    console.log(`   Target: ${targetStage.title}`);
    console.log(`   Gaps: ${skillGaps.length} skills to develop`);
    console.log(`   Priority: ${priorityOrder.join(', ')}`);
    console.log(`   Time: ${analysis.estimatedTimeToClose}`);
    
    return analysis;
  }
  
  /**
   * Get career transition advice
   */
  static getCareerTransition(data: {
    fromRole: string;
    toRole: string;
  }): CareerTransition {
    
    // Example: Software Engineer → Data Scientist
    return {
      fromRole: data.fromRole,
      toRole: data.toRole,
      difficulty: 'moderate',
      timeRequired: '6-12 months',
      skillsToAcquire: [
        'Python for Data Science',
        'Statistics & Probability',
        'Machine Learning',
        'SQL',
        'Data Visualization'
      ],
      coursesNeeded: [
        {
          courseId: 'data_science_bootcamp',
          courseName: 'Data Science Bootcamp',
          provider: 'Sapiens University',
          skillsCovered: ['Python', 'ML', 'Statistics'],
          duration: '6 months',
          cost: 0,
          priority: 'high',
          estimatedImpact: 'Core foundation',
          link: 'https://azora.com/sapiens/data-science'
        }
      ],
      successRate: 75,
      salaryChange: { percentage: 20, direction: 'increase' },
      tips: [
        'Start with Python & statistics (3 months)',
        'Build 3-5 data projects for portfolio',
        'Take ML course on Sapiens (3 months)',
        'Apply for Junior Data Analyst roles first',
        'Network with data scientists on Azora Community',
        'Contribute to open source data projects',
        'Leverage your engineering background!'
      ]
    };
  }
}

/**
 * 🚀 CAREER PATHWAYS IMPACT
 * 
 * Clear path = Focused learning = Faster progress!
 * 
 * Without pathways:
 * - Wander aimlessly
 * - Learn random things
 * - Plateau in career
 * - Underpaid
 * 
 * With Azora Career Pathways:
 * - Know exact next steps ✅
 * - Learn right skills ✅
 * - Progress faster ✅
 * - Earn more ✅
 * - ACHIEVE YOUR CAREER GOALS! 🚀✨
 */
