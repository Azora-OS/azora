/**
 * START CONTINUOUS IMPROVEMENT SYSTEM
 *
 * Launches the complete continuous improvement orchestrator with all agents:
 * - Research Agent 1: Technological Innovation Researcher
 * - Research Agent 2: Economic Research & Market Dynamics Analyst
 * - Implementation Agent 1: Technical Implementation Specialist
 * - Implementation Agent 2: Economic & Business Implementation Specialist
 * - Continuous Improvement Orchestrator: Master coordinator
 *
 * This creates a self-improving, self-optimizing AI system that continuously
 * enhances the Azora ecosystem through research, implementation, and monitoring.
 */

import ContinuousImprovementOrchestrator from '../agents/continuous-improvement-orchestrator.js';

async function main() {
    console.log('🚀 AZORA CONTINUOUS IMPROVEMENT SYSTEM');
    console.log('=====================================');
    console.log('🤖 Multi-Agent AI System for Continuous Evolution');
    console.log('');

    const orchestrator = new ContinuousImprovementOrchestrator();

    // Display system information
    console.log('📊 SYSTEM CONFIGURATION:');
    console.log('• Research Agents: 2 (Technological + Economic)');
    console.log('• Implementation Agents: 2 (Technical + Business)');
    console.log('• Cycle Interval: 24 hours');
    console.log('• Health Checks: Every hour');
    console.log('• Max Concurrent Tasks: 5');
    console.log('');

    try {
        // Start the continuous improvement system
        await orchestrator.startContinuousImprovement();

        console.log('');
        console.log('🎯 CONTINUOUS IMPROVEMENT ACTIVE!');
        console.log('=================================');
        console.log('🔄 Research → Implementation → Monitoring → Learning');
        console.log('🔄 The system will now continuously improve itself');
        console.log('');
        console.log('📈 EXPECTED OUTCOMES:');
        console.log('• Daily technological innovations');
        console.log('• Automated economic optimizations');
        console.log('• Self-healing system improvements');
        console.log('• Continuous performance enhancements');
        console.log('• Adaptive market responses');
        console.log('');

        // Display initial system stats
        const initialStats = orchestrator.getSystemStats();
        console.log('📊 INITIAL SYSTEM STATUS:');
        console.log(`• Total Cycles: ${initialStats.totalCycles}`);
        console.log(`• Completed Cycles: ${initialStats.completedCycles}`);
        console.log(`• System Health: ${Object.values(initialStats.healthScore).reduce((a, b) => a + b, 0) / 5 || 0}%`);
        console.log('');

        // Keep the system running
        console.log('⏳ System running... Press Ctrl+C to stop');
        console.log('');

        // Set up graceful shutdown
        process.on('SIGINT', async () => {
            console.log('');
            console.log('🛑 Shutting down continuous improvement system...');
            await orchestrator.stopContinuousImprovement();

            const finalStats = orchestrator.getSystemStats();
            console.log('');
            console.log('📊 FINAL SYSTEM STATS:');
            console.log(`• Total Cycles Completed: ${finalStats.completedCycles}`);
            console.log(`• Failed Cycles: ${finalStats.failedCycles}`);
            console.log(`• Average Cycle Time: ${Math.round(finalStats.averageCycleTime / 1000 / 60)} minutes`);
            console.log(`• Final Health Score: ${Object.values(finalStats.healthScore).reduce((a, b) => a + b, 0) / 5 || 0}%`);
            console.log('');
            console.log('✅ Continuous improvement system shut down gracefully');

            process.exit(0);
        });

        // Keep alive with periodic status updates
        setInterval(() => {
            const stats = orchestrator.getSystemStats();
            const healthScore = Object.values(stats.healthScore).reduce((a, b) => a + b, 0) / 5 || 0;

            if (stats.currentCycle) {
                console.log(`🔄 Cycle ${stats.currentCycle.number}: ${stats.currentCycle.status} (${new Date().toLocaleTimeString()})`);
            } else {
                console.log(`📊 System Health: ${healthScore.toFixed(1)}% | Cycles: ${stats.completedCycles}/${stats.totalCycles} (${new Date().toLocaleTimeString()})`);
            }
        }, 300000); // Every 5 minutes

    } catch (error) {
        console.error('❌ FAILED TO START CONTINUOUS IMPROVEMENT SYSTEM:');
        console.error(error);
        process.exit(1);
    }
}

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
    console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
    process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
    console.error('❌ Uncaught Exception:', error);
    process.exit(1);
});

// Start the system
main().catch((error) => {
    console.error('❌ CRITICAL ERROR:', error);
    process.exit(1);
});
