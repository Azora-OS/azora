/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

/**
 * PRIMARY EDUCATION CORE
 * 
 * Comprehensive primary education system (Grades R-7)
 * Aligned with UMALUSI and Department of Basic Education (DBE)
 * Enhanced with AI and future-ready curriculum
 * 
 * Powered by Elara AI for personalized learning
 */

import { EventEmitter } from 'events'
import { elaraIntegration } from '../../genome/elara-integration'

export interface PrimaryGrade {
  gradeLevel: 'R' | '1' | '2' | '3' | '4' | '5' | '6' | '7'
  subjects: PrimarySubject[]
  learningAreas: string[]
  assessmentMethods: AssessmentMethod[]
}

export interface PrimarySubject {
  id: string
  name: string
  code: string // DBE subject code
  weeklyHours: number
  curriculum: CurriculumStandard
  enhancedContent: EnhancedContent
}

export interface CurriculumStandard {
  framework: 'CAPS' | 'IEB' | 'Cambridge' // DBE CAPS + International
  topics: Topic[]
  learningOutcomes: LearningOutcome[]
  assessmentTasks: AssessmentTask[]
}

export interface EnhancedContent {
  aiTutoring: boolean
  gamification: boolean
  virtualLabs: boolean
  codingIntegration: boolean
  financialLiteracy: boolean
  entrepreneurship: boolean
}

export interface Topic {
  id: string
  title: string
  description: string
  weekNumber: number
  duration: number // minutes
  resources: Resource[]
  activities: Activity[]
}

export interface LearningOutcome {
  id: string
  description: string
  bloomsLevel: 'Remember' | 'Understand' | 'Apply' | 'Analyze' | 'Evaluate' | 'Create'
  assessmentCriteria: string[]
}

export interface AssessmentTask {
  id: string
  type: 'Formative' | 'Summative' | 'Diagnostic' | 'Portfolio'
  weight: number
  duration: number
  rubric: Rubric
}

export interface AssessmentMethod {
  type: string
  frequency: string
  weightage: number
  requirements: string[]
}

export interface Resource {
  type: 'video' | 'interactive' | 'document' | 'simulation' | 'game'
  url: string
  title: string
  duration?: number
}

export interface Activity {
  id: string
  type: 'individual' | 'group' | 'practical' | 'project'
  duration: number
  instructions: string
  materials: string[]
}

export interface Rubric {
  criteria: Criterion[]
  levels: PerformanceLevel[]
}

export interface Criterion {
  id: string
  description: string
  weight: number
}

export interface PerformanceLevel {
  level: number
  descriptor: string
  percentage: number
}

export class PrimaryEducationCore extends EventEmitter {
  private grades: Map<string, PrimaryGrade> = new Map()
  private studentProgress: Map<string, StudentProgress> = new Map()
  private academicAgents: Map<string, AcademicAgent> = new Map()

  constructor() {
    super()
    this.initializeGrades()
    this.initializeAcademicAgents()
  }

  /**
   * Initialize all primary grades (R-7)
   */
  private initializeGrades() {
    // Grade R (Reception Year - Age 5-6)
    this.grades.set('R', {
      gradeLevel: 'R',
      subjects: this.getGradeRSubjects(),
      learningAreas: [
        'Literacy',
        'Numeracy',
        'Life Skills',
        'Creative Arts',
        'Physical Development'
      ],
      assessmentMethods: [
        { type: 'Observation', frequency: 'Daily', weightage: 40, requirements: ['Play-based', 'Social interaction'] },
        { type: 'Portfolio', frequency: 'Weekly', weightage: 30, requirements: ['Work samples', 'Photos'] },
        { type: 'Teacher Assessment', frequency: 'Termly', weightage: 30, requirements: ['Developmental checklist'] }
      ]
    })

    // Grades 1-3 (Foundation Phase)
    for (let grade = 1; grade <= 3; grade++) {
      this.grades.set(grade.toString(), {
        gradeLevel: grade.toString() as any,
        subjects: this.getFoundationPhaseSubjects(grade),
        learningAreas: [
          'Home Language',
          'First Additional Language',
          'Mathematics',
          'Life Skills',
          'Coding Fundamentals' // Enhanced
        ],
        assessmentMethods: [
          { type: 'Continuous Assessment', frequency: 'Daily', weightage: 50, requirements: ['Classwork', 'Homework'] },
          { type: 'Formal Tasks', frequency: 'Termly', weightage: 25, requirements: ['Tests', 'Assignments'] },
          { type: 'Examinations', frequency: 'Annual', weightage: 25, requirements: ['Mid-year', 'End of year'] }
        ]
      })
    }

    // Grades 4-7 (Intermediate and Senior Phase)
    for (let grade = 4; grade <= 7; grade++) {
      this.grades.set(grade.toString(), {
        gradeLevel: grade.toString() as any,
        subjects: this.getIntermediatePhaseSubjects(grade),
        learningAreas: [
          'Home Language',
          'First Additional Language',
          'Mathematics',
          'Natural Sciences',
          'Social Sciences',
          'Technology',
          'Economic and Management Sciences',
          'Life Orientation',
          'Creative Arts',
          'Coding & Robotics', // Enhanced
          'Financial Literacy', // Enhanced
          'Entrepreneurship' // Enhanced
        ],
        assessmentMethods: [
          { type: 'Continuous Assessment', frequency: 'Daily', weightage: 40, requirements: ['Classwork', 'Homework', 'Projects'] },
          { type: 'Formal Tasks', frequency: 'Termly', weightage: 30, requirements: ['Tests', 'Assignments', 'Practicals'] },
          { type: 'Examinations', frequency: 'Biannual', weightage: 30, requirements: ['Mid-year exam', 'Final exam'] }
        ]
      })
    }
  }

  /**
   * Initialize AI-powered Academic Agents
   */
  private async initializeAcademicAgents() {
    const agentRoles = [
      'Mathematics Specialist',
      'Language & Literacy Expert',
      'Science Educator',
      'Social Studies Guide',
      'Arts & Creativity Coach',
      'Technology & Coding Mentor',
      'Life Skills Advisor',
      'Special Needs Support'
    ]

    for (const role of agentRoles) {
      const agent: AcademicAgent = {
        id: `agent-${role.toLowerCase().replace(/\s+/g, '-')}`,
        role,
        specialization: role,
        elaraIntegration: true,
        capabilities: [
          'Personalized instruction',
          'Real-time feedback',
          'Adaptive learning paths',
          'Multilingual support',
          'Cultural sensitivity',
          'Progress tracking'
        ],
        languages: ['English', 'Afrikaans', 'isiZulu', 'isiXhosa', 'Sesotho', 'Setswana']
      }
      this.academicAgents.set(agent.id, agent)
    }
  }

  /**
   * Get subjects for Grade R
   */
  private getGradeRSubjects(): PrimarySubject[] {
    return [
      {
        id: 'grade-r-literacy',
        name: 'Emergent Literacy',
        code: 'DBE-GR-LIT',
        weeklyHours: 10,
        curriculum: {
          framework: 'CAPS',
          topics: [
            { id: 'phonics-intro', title: 'Letter Recognition & Sounds', description: 'Introduction to alphabet and phonics', weekNumber: 1, duration: 60, resources: [], activities: [] },
            { id: 'storytelling', title: 'Story Time & Comprehension', description: 'Listening skills and story understanding', weekNumber: 2, duration: 45, resources: [], activities: [] }
          ],
          learningOutcomes: [
            { id: 'lo1', description: 'Recognize and name letters of the alphabet', bloomsLevel: 'Remember', assessmentCriteria: ['Can identify 20+ letters', 'Can match sounds to letters'] }
          ],
          assessmentTasks: []
        },
        enhancedContent: {
          aiTutoring: true,
          gamification: true,
          virtualLabs: false,
          codingIntegration: false,
          financialLiteracy: false,
          entrepreneurship: false
        }
      },
      {
        id: 'grade-r-numeracy',
        name: 'Early Numeracy',
        code: 'DBE-GR-NUM',
        weeklyHours: 8,
        curriculum: {
          framework: 'CAPS',
          topics: [
            { id: 'counting', title: 'Counting 1-10', description: 'Number recognition and counting', weekNumber: 1, duration: 30, resources: [], activities: [] },
            { id: 'shapes', title: 'Basic Shapes', description: 'Identifying and naming shapes', weekNumber: 3, duration: 30, resources: [], activities: [] }
          ],
          learningOutcomes: [
            { id: 'lo1', description: 'Count objects accurately up to 10', bloomsLevel: 'Understand', assessmentCriteria: ['Can count objects', 'Can compare quantities'] }
          ],
          assessmentTasks: []
        },
        enhancedContent: {
          aiTutoring: true,
          gamification: true,
          virtualLabs: false,
          codingIntegration: true, // Number games
          financialLiteracy: false,
          entrepreneurship: false
        }
      }
    ]
  }

  /**
   * Get subjects for Foundation Phase (Grades 1-3)
   */
  private getFoundationPhaseSubjects(grade: number): PrimarySubject[] {
    const baseSubjects: PrimarySubject[] = [
      {
        id: `grade-${grade}-home-lang`,
        name: 'Home Language',
        code: `DBE-G${grade}-HL`,
        weeklyHours: 7,
        curriculum: {
          framework: 'CAPS',
          topics: [],
          learningOutcomes: [],
          assessmentTasks: []
        },
        enhancedContent: {
          aiTutoring: true,
          gamification: true,
          virtualLabs: false,
          codingIntegration: false,
          financialLiteracy: false,
          entrepreneurship: false
        }
      },
      {
        id: `grade-${grade}-math`,
        name: 'Mathematics',
        code: `DBE-G${grade}-MATH`,
        weeklyHours: 7,
        curriculum: {
          framework: 'CAPS',
          topics: [],
          learningOutcomes: [],
          assessmentTasks: []
        },
        enhancedContent: {
          aiTutoring: true,
          gamification: true,
          virtualLabs: true,
          codingIntegration: true,
          financialLiteracy: grade >= 2,
          entrepreneurship: false
        }
      },
      {
        id: `grade-${grade}-coding`,
        name: 'Coding Fundamentals',
        code: `AZORA-G${grade}-CODE`,
        weeklyHours: 2,
        curriculum: {
          framework: 'CAPS',
          topics: [],
          learningOutcomes: [],
          assessmentTasks: []
        },
        enhancedContent: {
          aiTutoring: true,
          gamification: true,
          virtualLabs: true,
          codingIntegration: true,
          financialLiteracy: false,
          entrepreneurship: false
        }
      }
    ]

    return baseSubjects
  }

  /**
   * Get subjects for Intermediate/Senior Phase (Grades 4-7)
   */
  private getIntermediatePhaseSubjects(grade: number): PrimarySubject[] {
    return [
      {
        id: `grade-${grade}-math`,
        name: 'Mathematics',
        code: `DBE-G${grade}-MATH`,
        weeklyHours: 6,
        curriculum: { framework: 'CAPS', topics: [], learningOutcomes: [], assessmentTasks: [] },
        enhancedContent: {
          aiTutoring: true,
          gamification: true,
          virtualLabs: true,
          codingIntegration: true,
          financialLiteracy: true,
          entrepreneurship: false
        }
      },
      {
        id: `grade-${grade}-science`,
        name: 'Natural Sciences',
        code: `DBE-G${grade}-NS`,
        weeklyHours: 3,
        curriculum: { framework: 'CAPS', topics: [], learningOutcomes: [], assessmentTasks: [] },
        enhancedContent: {
          aiTutoring: true,
          gamification: true,
          virtualLabs: true,
          codingIntegration: false,
          financialLiteracy: false,
          entrepreneurship: false
        }
      },
      {
        id: `grade-${grade}-coding-robotics`,
        name: 'Coding & Robotics',
        code: `AZORA-G${grade}-CR`,
        weeklyHours: 2,
        curriculum: { framework: 'CAPS', topics: [], learningOutcomes: [], assessmentTasks: [] },
        enhancedContent: {
          aiTutoring: true,
          gamification: true,
          virtualLabs: true,
          codingIntegration: true,
          financialLiteracy: false,
          entrepreneurship: false
        }
      },
      {
        id: `grade-${grade}-financial-lit`,
        name: 'Financial Literacy',
        code: `AZORA-G${grade}-FIN`,
        weeklyHours: 1,
        curriculum: { framework: 'CAPS', topics: [], learningOutcomes: [], assessmentTasks: [] },
        enhancedContent: {
          aiTutoring: true,
          gamification: true,
          virtualLabs: false,
          codingIntegration: true,
          financialLiteracy: true,
          entrepreneurship: true
        }
      },
      {
        id: `grade-${grade}-entrepreneurship`,
        name: 'Young Entrepreneurs',
        code: `AZORA-G${grade}-ENT`,
        weeklyHours: 1,
        curriculum: { framework: 'CAPS', topics: [], learningOutcomes: [], assessmentTasks: [] },
        enhancedContent: {
          aiTutoring: true,
          gamification: true,
          virtualLabs: false,
          codingIntegration: false,
          financialLiteracy: true,
          entrepreneurship: true
        }
      }
    ]
  }

  /**
   * Enroll student in primary education
   */
  async enrollStudent(studentId: string, gradeLevel: string, preferences: EnrollmentPreferences) {
    const grade = this.grades.get(gradeLevel)
    if (!grade) {
      throw new Error(`Grade ${gradeLevel} not found`)
    }

    // Create personalized learning path with Elara AI
    const learningPath = await elaraIntegration.getEducationalHelp(
      `Create personalized learning path for Grade ${gradeLevel} student`,
      {
        studentId,
        gradeLevel,
        preferences,
        subjects: grade.subjects.map(s => s.name)
      }
    )

    const progress: StudentProgress = {
      studentId,
      gradeLevel,
      enrollmentDate: new Date(),
      subjects: grade.subjects.map(subject => ({
        subjectId: subject.id,
        progress: 0,
        assessments: [],
        lastActivity: new Date()
      })),
      academicAgent: await this.assignAcademicAgent(studentId, gradeLevel),
      learningPath: learningPath.response
    }

    this.studentProgress.set(studentId, progress)
    this.emit('student-enrolled', { studentId, gradeLevel, progress })

    return progress
  }

  /**
   * Assign Academic Agent to student
   */
  private async assignAcademicAgent(studentId: string, gradeLevel: string): Promise<string> {
    // Use Elara AI to match student with best agent
    const agents = Array.from(this.academicAgents.values())
    // For now, assign primary tutor agent
    return agents[0]?.id || 'agent-primary-tutor'
  }

  /**
   * Get student progress
   */
  getStudentProgress(studentId: string): StudentProgress | undefined {
    return this.studentProgress.get(studentId)
  }

  /**
   * Get all grades (public accessor)
   */
  getAllGrades(): Map<string, PrimaryGrade> {
    return this.grades
  }

  /**
   * Record student assessment
   */
  async recordAssessment(studentId: string, subjectId: string, assessment: Assessment) {
    const progress = this.studentProgress.get(studentId)
    if (!progress) {
      throw new Error('Student not found')
    }

    const subjectProgress = progress.subjects.find(s => s.subjectId === subjectId)
    if (!subjectProgress) {
      throw new Error('Subject not found in student progress')
    }

    subjectProgress.assessments.push(assessment)
    subjectProgress.lastActivity = new Date()

    // Get Elara AI feedback
    const feedback = await elaraIntegration.getEducationalHelp(
      `Provide feedback for student assessment`,
      {
        studentId,
        subjectId,
        score: assessment.score,
        maxScore: assessment.maxScore,
        type: assessment.type
      }
    )

    this.emit('assessment-recorded', { studentId, subjectId, assessment, feedback })

    return feedback
  }
}

export interface AcademicAgent {
  id: string
  role: string
  specialization: string
  elaraIntegration: boolean
  capabilities: string[]
  languages: string[]
}

export interface StudentProgress {
  studentId: string
  gradeLevel: string
  enrollmentDate: Date
  subjects: SubjectProgress[]
  academicAgent: string
  learningPath: string
}

export interface SubjectProgress {
  subjectId: string
  progress: number
  assessments: Assessment[]
  lastActivity: Date
}

export interface Assessment {
  id: string
  type: 'Formative' | 'Summative' | 'Project' | 'Test' | 'Exam'
  score: number
  maxScore: number
  date: Date
  feedback?: string
}

export interface EnrollmentPreferences {
  homeLanguage: string
  additionalLanguage?: string
  specialNeeds?: string[]
  learningStyle?: 'Visual' | 'Auditory' | 'Kinesthetic' | 'Reading/Writing'
  interests?: string[]
}

// Create singleton
export const primaryEducation = new PrimaryEducationCore()

export default primaryEducation
