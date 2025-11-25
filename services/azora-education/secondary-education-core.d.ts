/**
 * SECONDARY EDUCATION CORE
 *
 * Comprehensive secondary education system (Grades 8-12)
 * Aligned with UMALUSI and Department of Basic Education (DBE)
 * NSC (National Senior Certificate) preparation
 * Enhanced with AI and career preparation
 *
 * Powered by Elara AI and Academic Agents
 */
import { EventEmitter } from 'events';
export interface SecondaryGrade {
    gradeLevel: '8' | '9' | '10' | '11' | '12';
    phase: 'FET' | 'Senior';
    subjects: SecondarySubject[];
    streams: AcademicStream[];
    assessmentWeighting: AssessmentWeighting;
}
export interface SecondarySubject {
    id: string;
    name: string;
    code: string;
    subjectType: 'Core' | 'Elective' | 'Specialized';
    weeklyHours: number;
    credits: number;
    curriculum: CurriculumStandard;
    examBoard: 'DBE' | 'IEB' | 'Cambridge';
    nscLevel?: 'HL' | 'SAL';
}
export interface AcademicStream {
    id: string;
    name: string;
    description: string;
    requiredSubjects: string[];
    electiveOptions: string[];
    careerPaths: string[];
    universityPreparation: string[];
}
export interface AssessmentWeighting {
    continuousAssessment: number;
    midYearExam?: number;
    trialExam?: number;
    finalExam: number;
    portfolios?: number;
    practicals?: number;
}
export interface CurriculumStandard {
    framework: 'CAPS' | 'IEB' | 'Cambridge';
    topics: Topic[];
    examPapers: ExamPaper[];
    practicalTasks: PracticalTask[];
    PAT?: PAT;
}
export interface ExamPaper {
    paperId: string;
    name: string;
    duration: number;
    marks: number;
    sections: ExamSection[];
    cognitiveLevel: CognitiveDistribution;
}
export interface ExamSection {
    sectionNumber: number;
    name: string;
    marks: number;
    questionTypes: string[];
    duration: number;
}
export interface CognitiveDistribution {
    knowledge: number;
    routine: number;
    complex: number;
    problem_solving: number;
}
export interface PracticalTask {
    id: string;
    name: string;
    duration: number;
    marks: number;
    requirements: string[];
    rubric: Rubric;
}
export interface PAT {
    name: string;
    duration: string;
    totalMarks: number;
    components: PATComponent[];
    submissionDeadline: Date;
}
export interface PATComponent {
    name: string;
    marks: number;
    description: string;
    milestones: Milestone[];
}
export interface Milestone {
    week: number;
    task: string;
    completion: number;
}
export interface Topic {
    id: string;
    title: string;
    content: string[];
    learningOutcomes: string[];
    resources: Resource[];
    assessmentTasks: string[];
}
export interface Resource {
    type: 'video' | 'document' | 'simulation' | 'interactive' | 'vr-lab';
    url: string;
    title: string;
    provider?: string;
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
    code: string;
}
export declare class SecondaryEducationCore extends EventEmitter {
    private grades;
    private streams;
    private studentRecords;
    private academicAgents;
    constructor();
    /**
     * Initialize secondary grades (8-12)
     */
    private initializeGrades;
    /**
     * Initialize academic streams
     */
    private initializeStreams;
    /**
     * Initialize specialized Academic Agents
     */
    private initializeAcademicAgents;
    /**
     * Get subjects for Senior Phase (Grades 8-9)
     */
    private getSeniorPhaseSubjects;
    /**
     * Get subjects for FET Phase (Grades 10-12)
     */
    private getFETPhaseSubjects;
    /**
     * Get Mathematics curriculum (simplified)
     */
    private getMathematicsCurriculum;
    /**
     * Get IT curriculum
     */
    private getITCurriculum;
    /**
     * Enroll student in secondary education
     */
    enrollStudent(studentId: string, gradeLevel: string, streamId?: string): Promise<StudentRecord>;
    /**
     * Get NSC requirements
     */
    getNSCRequirements(): {
        minimumSubjects: number;
        compulsorySubjects: string[];
        passingCriteria: {
            higherCertificate: {
                description: string;
                requirements: string[];
            };
            diplomaPass: {
                description: string;
                requirements: string[];
            };
            bachelorPass: {
                description: string;
                requirements: string[];
            };
        };
        achievementLevels: {
            code: string;
            descriptor: string;
            percentage: string;
        }[];
    };
    /**
     * Get all grades (public accessor)
     */
    getAllGrades(): Map<string, SecondaryGrade>;
    /**
     * Get all streams (public accessor)
     */
    getAllStreams(): Map<string, AcademicStream>;
    /**
     * Get student record (public accessor)
     */
    getStudentRecord(studentId: string): StudentRecord | undefined;
}
export interface SpecializedAgent {
    id: string;
    role: string;
    subjects: string[];
    qualifications: string[];
    experience: string;
    teachingStyle: string[];
    elaraIntegrated: boolean;
    capabilities: string[];
}
export interface StudentRecord {
    studentId: string;
    gradeLevel: string;
    stream?: string;
    enrollmentDate: Date;
    subjects: SubjectEnrollment[];
    academicAgents: string[];
    studyPlan: string;
    nscTarget?: 'Higher Certificate' | 'Diploma Pass' | 'Bachelor Pass';
}
export interface SubjectEnrollment {
    subjectId: string;
    startDate: Date;
    currentMark: number;
    sba: number;
    examMark?: number;
    finalMark?: number;
    achievementLevel?: string;
}
export declare const secondaryEducation: SecondaryEducationCore;
export default secondaryEducation;
//# sourceMappingURL=secondary-education-core.d.ts.map