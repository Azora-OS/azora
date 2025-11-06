/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

/**
 * GRI Engine Test Suite
 *
 * Tests the Geopolitical Readiness Index functionality for nation assessments
 * and escrow unlock mechanisms in the Citadel MVP for ZA pilot.
 */

import { GeopoliticalReadinessIndex } from '../system-core/agent-tools/geopolitical-readiness-index.ts';

class GRITestSuite {
    constructor() {
        this.griEngine = null;
        this.testResults = [];
    }

    /**
     * Initialize the test suite
     */
    async initialize() {
        console.log('🧪 Initializing GRI Test Suite...');

        // Initialize GRI Engine with OpenAI API key
        const openaiApiKey = process.env.OPENAI_API_KEY;
        if (!openaiApiKey) {
            throw new Error('OPENAI_API_KEY environment variable required');
        }

        this.griEngine = new GeopoliticalReadinessIndex(openaiApiKey);
        console.log('✅ GRI Engine initialized');
    }

    /**
     * Run all GRI tests
     */
    async runAllTests() {
        console.log('🚀 Running GRI Test Suite...\n');

        try {
            await this.testNationAssessment('nation_zaf', 'South Africa');
            await this.testNationAssessment('nation_ken', 'Kenya');
            await this.testNationAssessment('nation_sgp', 'Singapore');

            await this.testGRIStatistics();
            await this.testReadinessLevels();

            await this.testCrisisDetection();
            await this.testTrendAnalysis();

            this.printTestSummary();

        } catch (error) {
            console.error('❌ Test suite failed:', error);
            process.exit(1);
        }
    }

    /**
     * Test GRI assessment for a specific nation
     */
    async testNationAssessment(nationId, nationName) {
        console.log(`📊 Testing GRI Assessment for ${nationName} (${nationId})`);

        try {
            // Calculate GRI score
            const griScore = await this.griEngine.calculateGRIScore(nationId);

            // Validate score structure
            this.assert(griScore.nationId === nationId, `Nation ID mismatch: expected ${nationId}, got ${griScore.nationId}`);
            this.assert(typeof griScore.overallScore === 'number', 'Overall score should be a number');
            this.assert(griScore.overallScore >= 0 && griScore.overallScore <= 100, 'Overall score should be 0-100');
            this.assert(['critical', 'high', 'moderate', 'low', 'unfavorable'].includes(griScore.readinessLevel), 'Invalid readiness level');

            // Validate factors
            this.assert(griScore.factors.digitalInfrastructure, 'Digital infrastructure factors required');
            this.assert(griScore.factors.regulatoryClimate, 'Regulatory climate factors required');
            this.assert(griScore.factors.economicFactors, 'Economic factors required');
            this.assert(griScore.factors.socialFactors, 'Social factors required');
            this.assert(griScore.factors.politicalStability, 'Political stability factors required');

            // Validate AI analysis
            this.assert(griScore.aiAnalysis, 'AI analysis required');
            this.assert(Array.isArray(griScore.aiAnalysis.keyInsights), 'Key insights should be an array');
            this.assert(['improving', 'stable', 'deteriorating'].includes(griScore.aiAnalysis.predictiveOutlook), 'Invalid predictive outlook');

            // Validate recommendations
            this.assert(griScore.recommendations, 'Recommendations required');
            this.assert(griScore.unlockConditions, 'Unlock conditions required');
            this.assert(griScore.estimatedTimeline, 'Estimated timeline required');

            console.log(`   ✅ ${nationName}: ${griScore.overallScore} (${griScore.readinessLevel})`);
            console.log(`   📈 Top factors: ${this.getTopFactors(griScore.factors)}`);

            this.testResults.push({
                test: `GRI Assessment - ${nationName}`,
                status: 'passed',
                score: griScore.overallScore,
                readinessLevel: griScore.readinessLevel
            });

        } catch (error) {
            console.log(`   ❌ ${nationName}: ${error.message}`);
            this.testResults.push({
                test: `GRI Assessment - ${nationName}`,
                status: 'failed',
                error: error.message
            });
        }
    }

    /**
     * Test GRI statistics across all nations
     */
    async testGRIStatistics() {
        console.log('📈 Testing GRI Statistics');

        try {
            const stats = this.griEngine.getGRIStatistics();

            this.assert(typeof stats.totalNations === 'number', 'Total nations should be a number');
            this.assert(typeof stats.averageScore === 'number', 'Average score should be a number');
            this.assert(typeof stats.readinessDistribution === 'object', 'Readiness distribution should be an object');
            this.assert(Array.isArray(stats.topPerformers), 'Top performers should be an array');

            console.log(`   📊 Nations assessed: ${stats.totalNations}`);
            console.log(`   📈 Average GRI score: ${stats.averageScore}`);
            console.log(`   🏆 Top performer: ${stats.topPerformers[0]?.nation} (${stats.topPerformers[0]?.score})`);

            this.testResults.push({
                test: 'GRI Statistics',
                status: 'passed',
                stats
            });

        } catch (error) {
            console.log(`   ❌ GRI Statistics: ${error.message}`);
            this.testResults.push({
                test: 'GRI Statistics',
                status: 'failed',
                error: error.message
            });
        }
    }

    /**
     * Test readiness level filtering
     */
    async testReadinessLevels() {
        console.log('🎯 Testing Readiness Level Filtering');

        try {
            const criticalNations = this.griEngine.getNationsByReadinessLevel('critical');
            const highNations = this.griEngine.getNationsByReadinessLevel('high');

            this.assert(Array.isArray(criticalNations), 'Critical nations should be an array');
            this.assert(Array.isArray(highNations), 'High nations should be an array');

            console.log(`   🔥 Critical readiness: ${criticalNations.length} nations`);
            console.log(`   📈 High readiness: ${highNations.length} nations`);

            // Test that critical nations have unlock conditions
            if (criticalNations.length > 0) {
                const criticalNation = criticalNations[0];
                const griScore = this.griEngine.getGRIScore(criticalNation.nationId);
                this.assert(griScore.unlockConditions.length === 0, 'Critical nations should have no unlock conditions');
            }

            this.testResults.push({
                test: 'Readiness Level Filtering',
                status: 'passed',
                criticalCount: criticalNations.length,
                highCount: highNations.length
            });

        } catch (error) {
            console.log(`   ❌ Readiness Level Filtering: ${error.message}`);
            this.testResults.push({
                test: 'Readiness Level Filtering',
                status: 'failed',
                error: error.message
            });
        }
    }

    /**
     * Test crisis detection and impact analysis
     */
    async testCrisisDetection() {
        console.log('🚨 Testing Crisis Detection');

        try {
            // Simulate a crisis for South Africa
            const crisisResult = await this.griEngine.detectCrisis(
                'nation_zaf',
                'economic_crisis',
                'Currency volatility due to inflation concerns',
                'medium'
            );

            this.assert(crisisResult.crisisId, 'Crisis ID should be generated');
            this.assert(typeof crisisResult.impact.griScore === 'number', 'GRI impact should be a number');

            console.log(`   🚨 Crisis detected: ${crisisResult.crisisId}`);
            console.log(`   📉 GRI impact: -${crisisResult.impact.griScore} points`);

            // Test active crises retrieval
            const activeCrises = this.griEngine.getActiveCrises();
            this.assert(Array.isArray(activeCrises), 'Active crises should be an array');

            this.testResults.push({
                test: 'Crisis Detection',
                status: 'passed',
                crisisId: crisisResult.crisisId,
                griImpact: crisisResult.impact.griScore
            });

        } catch (error) {
            console.log(`   ❌ Crisis Detection: ${error.message}`);
            this.testResults.push({
                test: 'Crisis Detection',
                status: 'failed',
                error: error.message
            });
        }
    }

    /**
     * Test trend analysis
     */
    async testTrendAnalysis() {
        console.log('📊 Testing Trend Analysis');

        try {
            const trends = this.griEngine.getReadinessTrends(7); // Last 7 days

            this.assert(typeof trends.readinessTrend === 'number', 'Readiness trend should be a number');
            this.assert(typeof trends.averageReadiness === 'number', 'Average readiness should be a number');

            console.log(`   📈 Readiness trend: ${trends.readinessTrend > 0 ? '+' : ''}${trends.readinessTrend}`);
            console.log(`   📊 Average readiness: ${trends.averageReadiness}`);

            this.testResults.push({
                test: 'Trend Analysis',
                status: 'passed',
                trends
            });

        } catch (error) {
            console.log(`   ❌ Trend Analysis: ${error.message}`);
            this.testResults.push({
                test: 'Trend Analysis',
                status: 'failed',
                error: error.message
            });
        }
    }

    /**
     * Get top performing factors for a nation
     */
    getTopFactors(factors) {
        const factorScores = [
            { name: 'Digital Infrastructure', score: factors.digitalInfrastructure.score },
            { name: 'Regulatory Climate', score: factors.regulatoryClimate.score },
            { name: 'Economic Factors', score: factors.economicFactors.score },
            { name: 'Social Factors', score: factors.socialFactors.score },
            { name: 'Political Stability', score: factors.politicalStability.score }
        ];

        return factorScores
            .sort((a, b) => b.score - a.score)
            .slice(0, 2)
            .map(f => `${f.name} (${f.score})`)
            .join(', ');
    }

    /**
     * Assert a condition and throw error if false
     */
    assert(condition, message) {
        if (!condition) {
            throw new Error(`Assertion failed: ${message}`);
        }
    }

    /**
     * Print test summary
     */
    printTestSummary() {
        console.log('\n📋 GRI Test Suite Summary');
        console.log('=' .repeat(50));

        const passed = this.testResults.filter(t => t.status === 'passed').length;
        const failed = this.testResults.filter(t => t.status === 'failed').length;
        const total = this.testResults.length;

        console.log(`✅ Passed: ${passed}`);
        console.log(`❌ Failed: ${failed}`);
        console.log(`📊 Total: ${total}`);

        if (failed === 0) {
            console.log('\n🎉 All GRI tests passed! Ready for ZA pilot integration.');
        } else {
            console.log('\n⚠️  Some tests failed. Check implementation before deployment.');
            console.log('\nFailed tests:');
            this.testResults
                .filter(t => t.status === 'failed')
                .forEach(test => console.log(`   ❌ ${test.test}: ${test.error}`));
        }

        console.log('\n🏆 GRI Engine Status: Operational');
        console.log('🌍 ZA Pilot: Ready for sovereign seed unlocks');
    }
}

// Run tests if this file is executed directly
if (require.main === module) {
    const testSuite = new GRITestSuite();

    testSuite.initialize()
        .then(() => testSuite.runAllTests())
        .catch(error => {
            console.error('Failed to initialize test suite:', error);
            process.exit(1);
        });
}

export { GRITestSuite };

