/**
 * AZORA EDUCATION SYSTEM - WORLD CLASS INSTITUTION
 *
 * Comprehensive education platform from primary to doctoral level
 * Integrated with Elara AI, Research Center, and Advanced Learning Tech
 */
import { primaryEducation } from './primary-education-core';
import { secondaryEducation } from './secondary-education-core';
import { azoraSapiensUniversity } from '../azora-sapiens/src/university-core';
declare const enhancedMint: {
    createSecureWallet: () => Promise<{
        id: string;
        balance: {};
    }>;
    executeTransaction: () => Promise<{
        id: string;
        status: string;
    }>;
    stakeTokens: () => Promise<{
        id: string;
    }>;
    getUserStakingPositions: () => never[];
    getTotalValueLocked: () => number;
    addLiquidity: () => Promise<{
        id: string;
    }>;
    getWallet: () => {
        id: string;
        balance: {};
    };
};
export declare class AzoraEducationSystem {
    private initialized;
    private advancedTech;
    private research;
    private worldClass;
    /**
     * Initialize complete education system
     */
    initialize(): Promise<void>;
    /**
     * Enroll student in appropriate level
     */
    enrollStudent(studentId: string, level: 'primary' | 'secondary' | 'university', details: any): Promise<import("./primary-education-core").StudentProgress | import("./secondary-education-core").StudentRecord | import("../azora-sapiens/src/university-core").UniversityStudent>;
    /**
     * Award student with AZR tokens
     */
    awardStudent(studentId: string, amount: number, reason: string): Promise<{
        wallet: {
            id: string;
            balance: {};
        };
        transaction: {
            id: string;
            status: string;
        };
    }>;
    /**
     * Get student's complete academic record
     */
    getStudentRecord(studentId: string): Promise<{
        primary: import("./primary-education-core").StudentProgress | undefined;
        secondary: import("./secondary-education-core").StudentRecord | undefined;
        university: import("../azora-sapiens/src/university-core").UniversityStudent | undefined;
        wallet: {
            id: string;
            balance: {};
        };
    }>;
    /**
     * Get available programmes
     */
    getAllProgrammes(): {
        primary: import("./primary-education-core").PrimaryGrade[];
        secondary: import("./secondary-education-core").SecondaryGrade[];
        university: import("../azora-sapiens/src/university-core").Programme[];
    };
    /**
     * Get system statistics
     */
    getStatistics(): {
        totalStudents: number;
        totalValueLocked: number;
        activeAgents: number;
    };
}
export declare const azoraEducation: AzoraEducationSystem;
export { primaryEducation, secondaryEducation, azoraSapiensUniversity, enhancedMint };
export default azoraEducation;
//# sourceMappingURL=index.d.ts.map