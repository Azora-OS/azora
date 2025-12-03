/**
 * AZORA SAPIENS UNIVERSITY CORE
 *
 * World-class online university powered by Academic Agents and Elara AI
 * Offering comprehensive qualifications from certificates to doctoral degrees
 *
 * Features:
 * - Live online lectures by AI Academic Agents
 * - Personalized learning paths
 * - Industry-aligned curriculum
 * - Global accreditation standards
 * - Proof-of-Knowledge blockchain credentials
 */
import { EventEmitter } from 'events';
export interface University {
    name: string;
    accreditations: Accreditation[];
    faculties: Faculty[];
    qualificationLevels: QualificationLevel[];
    academicStaff: AcademicStaff[];
    researchCenters: ResearchCenter[];
}
export interface Accreditation {
    body: string;
    type: 'National' | 'International' | 'Professional';
    validUntil: Date;
    scope: string[];
}
export interface Faculty {
    id: string;
    name: string;
    dean: string;
    departments: Department[];
    programmes: Programme[];
}
export interface Department {
    id: string;
    name: string;
    head: string;
    specializations: string[];
    researchFocus: string[];
}
export interface Programme {
    id: string;
    nqfLevel: number;
    name: string;
    type: 'Certificate' | 'Diploma' | 'Advanced Diploma' | 'Bachelor' | 'Honours' | 'Masters' | 'Doctorate';
    duration: string;
    credits: number;
    admissionRequirements: AdmissionRequirements;
    curriculum: Curriculum;
    assessment: AssessmentStrategy;
    accreditation: string[];
    careerOutcomes: string[];
}
export interface QualificationLevel {
    nqfLevel: number;
    name: string;
    description: string;
    typicalDuration: string;
    credits: number;
    examples: string[];
}
export interface AdmissionRequirements {
    minimumNSC?: {
        apsScore: number;
        requiredSubjects: SubjectRequirement[];
        minimumAverage: number;
    };
    internationalEquivalent?: string[];
    portfolioRequired?: boolean;
    interviewRequired?: boolean;
    prerequisiteQualifications?: string[];
}
export interface SubjectRequirement {
    subject: string;
    minimumLevel: number;
    preferredLevel?: number;
}
export interface Curriculum {
    yearStructure: YearStructure[];
    modules: Module[];
    totalCredits: number;
    majorMinorStructure?: MajorMinorStructure;
}
export interface YearStructure {
    year: number;
    semester: 'S1' | 'S2' | 'Full Year';
    modules: string[];
    totalCredits: number;
}
export interface Module {
    id: string;
    code: string;
    name: string;
    nqfLevel: number;
    credits: number;
    prerequisites: string[];
    description: string;
    learningOutcomes: LearningOutcome[];
    assessment: ModuleAssessment;
    deliveryMode: DeliveryMode;
    academicAgent: string;
}
export interface LearningOutcome {
    id: string;
    description: string;
    bloomsLevel: 'Remember' | 'Understand' | 'Apply' | 'Analyze' | 'Evaluate' | 'Create';
    assessmentMethod: string;
}
export interface ModuleAssessment {
    continuousAssessment: AssessmentComponent[];
    examination: ExaminationComponent;
}
export interface AssessmentComponent {
    name: string;
    type: 'Assignment' | 'Test' | 'Project' | 'Presentation' | 'Portfolio' | 'Practical';
    weight: number;
    dueWeek: number;
}
export interface ExaminationComponent {
    type: 'Written' | 'Practical' | 'Oral' | 'Portfolio';
    duration: number;
    weight: number;
    format: string;
}
export interface DeliveryMode {
    format: 'Online' | 'Hybrid' | 'In-person';
    liveLectures: LiveLecture[];
    recordings: boolean;
    interactiveSessions: InteractiveSession[];
    virtualLabs: boolean;
}
export interface LiveLecture {
    day: string;
    time: string;
    duration: number;
    academicAgent: string;
    platform: 'Azora Live' | 'Zoom' | 'Teams';
}
export interface InteractiveSession {
    type: 'Tutorial' | 'Lab' | 'Workshop' | 'Seminar';
    frequency: 'Weekly' | 'Biweekly' | 'Monthly';
    duration: number;
}
export interface MajorMinorStructure {
    majorCredits: number;
    minorCredits?: number;
    electiveCredits: number;
}
export interface AssessmentStrategy {
    continuousAssessment: number;
    examination: number;
    practicalWork?: number;
    researchComponent?: number;
    dissertation?: number;
}
export interface AcademicStaff {
    id: string;
    title: string;
    name: string;
    role: 'Professor' | 'Associate Professor' | 'Senior Lecturer' | 'Lecturer' | 'Tutor';
    qualifications: string[];
    specialization: string[];
    department: string;
    elaraEnhanced: boolean;
    teachingModules: string[];
    researchInterests: string[];
    publications?: number;
}
export interface ResearchCenter {
    id: string;
    name: string;
    focus: string[];
    director: string;
    projects: ResearchProject[];
    funding: string[];
}
export interface ResearchProject {
    id: string;
    title: string;
    principalInvestigator: string;
    team: string[];
    status: 'Planning' | 'Active' | 'Completed';
    startDate: Date;
    endDate?: Date;
    publications: Publication[];
}
export interface Publication {
    title: string;
    authors: string[];
    journal: string;
    year: number;
    doi?: string;
}
export declare class AzoraSapiensUniversity extends EventEmitter {
    private university;
    private students;
    private academicAgents;
    constructor();
    /**
     * Initialize Azora Sapiens University structure
     */
    private initializeUniversity;
    /**
     * Initialize qualification levels (NQF 5-10)
     */
    private initializeQualificationLevels;
    /**
     * Initialize university faculties
     */
    private initializeFaculties;
    /**
     * Faculty of Technology & Computer Science
     */
    private createFacultyOfTechnology;
    /**
     * BSc Computer Science Programme
     */
    private createBScComputerScience;
    /**
     * MSc Artificial Intelligence
     */
    private createMScArtificialIntelligence;
    /**
     * PhD Computer Science
     */
    private createPhDComputerScience;
    /**
     * Faculty of Economics & Business
     */
    private createFacultyOfEconomics;
    /**
     * Faculty of Sciences
     */
    private createFacultyOfSciences;
    /**
     * Faculty of Humanities
     */
    private createFacultyOfHumanities;
    /**
     * Faculty of Engineering
     */
    private createFacultyOfEngineering;
    /**
     * Get Computer Science modules
     */
    private getComputerScienceModules;
    /**
     * Initialize University Academic Agents
     */
    private initializeAcademicAgents;
    /**
     * Enroll student in university
     */
    enrollStudent(studentId: string, programmeId: string): Promise<UniversityStudent>;
    /**
     * Get all programmes
     */
    getAllProgrammes(): Programme[];
    /**
     * Get university details
     */
    getUniversityDetails(): University;
    /**
     * Get student (public accessor)
     */
    getStudent(studentId: string): UniversityStudent | undefined;
}
export interface UniversityAgent {
    id: string;
    title: string;
    name: string;
    role: 'Dean' | 'Head of Department' | 'Professor' | 'Associate Professor' | 'Senior Lecturer' | 'Lecturer';
    faculty: string;
    qualifications: string[];
    specialization: string[];
    elaraEnhanced: boolean;
    teachingCapabilities: string[];
    researchOutput: {
        publications: number;
        hIndex: number;
        citations: number;
    };
}
export interface UniversityStudent {
    studentNumber: string;
    studentId: string;
    programmeId: string;
    enrollmentDate: Date;
    academicYear: number;
    credits: {
        earned: number;
        registered: number;
    };
    status: 'Active' | 'On Leave' | 'Graduated' | 'Withdrawn';
    academicAdvisor: string;
}
export declare const azoraSapiensUniversity: AzoraSapiensUniversity;
export default azoraSapiensUniversity;
//# sourceMappingURL=university-core.d.ts.map