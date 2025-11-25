/**
 * PRIMARY EDUCATION CORE
 *
 * Comprehensive primary education system (Grades R-7)
 * Aligned with UMALUSI and Department of Basic Education (DBE)
 * Enhanced with AI and future-ready curriculum
 *
 * Powered by Elara AI for personalized learning
 */
import { EventEmitter } from 'events';
export interface PrimaryGrade {
    gradeLevel: 'R' | '1' | '2' | '3' | '4' | '5' | '6' | '7';
    subjects: PrimarySubject[];
    learningAreas: string[];
    assessmentMethods: AssessmentMethod[];
}
export interface PrimarySubject {
    id: string;
    name: string;
    code: string;
    weeklyHours: number;
    curriculum: CurriculumStandard;
    enhancedContent: EnhancedContent;
}
export interface CurriculumStandard {
    framework: 'CAPS' | 'IEB' | 'Cambridge';
    topics: Topic[];
    learningOutcomes: LearningOutcome[];
    assessmentTasks: AssessmentTask[];
}
export interface EnhancedContent {
    aiTutoring: boolean;
    gamification: boolean;
    virtualLabs: boolean;
    codingIntegration: boolean;
    financialLiteracy: boolean;
    entrepreneurship: boolean;
}
export interface Topic {
    id: string;
    title: string;
    description: string;
    weekNumber: number;
    duration: number;
    resources: Resource[];
    activities: Activity[];
}
export interface LearningOutcome {
    id: string;
    description: string;
    bloomsLevel: 'Remember' | 'Understand' | 'Apply' | 'Analyze' | 'Evaluate' | 'Create';
    assessmentCriteria: string[];
}
export interface AssessmentTask {
    id: string;
    type: 'Formative' | 'Summative' | 'Diagnostic' | 'Portfolio';
    weight: number;
    duration: number;
    rubric: Rubric;
}
export interface AssessmentMethod {
    type: string;
    frequency: string;
    weightage: number;
    requirements: string[];
}
export interface Resource {
    type: 'video' | 'interactive' | 'document' | 'simulation' | 'game';
    url: string;
    title: string;
    duration?: number;
}
export interface Activity {
    id: string;
    type: 'individual' | 'group' | 'practical' | 'project';
    duration: number;
    instructions: string;
    materials: string[];
}
export interface Rubric {
    criteria: Criterion[];
    levels: PerformanceLevel[];
}
export interface Criterion {
    id: string;
    description: string;
    weight: number;
}
export interface PerformanceLevel {
    level: number;
    descriptor: string;
    percentage: number;
}
export declare class PrimaryEducationCore extends EventEmitter {
    private grades;
    private studentProgress;
    private academicAgents;
    constructor();
    /**
     * Initialize all primary grades (R-7)
     */
    private initializeGrades;
    /**
     * Initialize AI-powered Academic Agents
     */
    private initializeAcademicAgents;
    /**
     * Get subjects for Grade R
     */
    private getGradeRSubjects;
    /**
     * Get subjects for Foundation Phase (Grades 1-3)
     */
    private getFoundationPhaseSubjects;
    /**
     * Get subjects for Intermediate/Senior Phase (Grades 4-7)
     */
    private getIntermediatePhaseSubjects;
    /**
     * Enroll student in primary education
     */
    enrollStudent(studentId: string, gradeLevel: string, preferences: EnrollmentPreferences): Promise<StudentProgress>;
    /**
     * Assign Academic Agent to student
     */
    private assignAcademicAgent;
    /**
     * Get student progress
     */
    getStudentProgress(studentId: string): StudentProgress | undefined;
    /**
     * Get all grades (public accessor)
     */
    getAllGrades(): Map<string, PrimaryGrade>;
    /**
     * Record student assessment
     */
    recordAssessment(studentId: string, subjectId: string, assessment: Assessment): Promise<{
        response: string;
    }>;
}
export interface AcademicAgent {
    id: string;
    role: string;
    specialization: string;
    elaraIntegration: boolean;
    capabilities: string[];
    languages: string[];
}
export interface StudentProgress {
    studentId: string;
    gradeLevel: string;
    enrollmentDate: Date;
    subjects: SubjectProgress[];
    academicAgent: string;
    learningPath: string;
}
export interface SubjectProgress {
    subjectId: string;
    progress: number;
    assessments: Assessment[];
    lastActivity: Date;
}
export interface Assessment {
    id: string;
    type: 'Formative' | 'Summative' | 'Project' | 'Test' | 'Exam';
    score: number;
    maxScore: number;
    date: Date;
    feedback?: string;
}
export interface EnrollmentPreferences {
    homeLanguage: string;
    additionalLanguage?: string;
    specialNeeds?: string[];
    learningStyle?: 'Visual' | 'Auditory' | 'Kinesthetic' | 'Reading/Writing';
    interests?: string[];
}
export declare const primaryEducation: PrimaryEducationCore;
export default primaryEducation;
//# sourceMappingURL=primary-education-core.d.ts.map