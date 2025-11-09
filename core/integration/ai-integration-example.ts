/*
AZORA PROPRIETARY LICENSE
Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

AI INTEGRATION EXAMPLES
Usage examples for AI systems integration
*/

import { aiHub } from './ai-integration-hub';
import { v0Bridge } from './v0-master-ui-bridge';

// Example 1: Elara AI Tutoring Session
export async function elaraTutoringExample() {
  const studentId = 'student-123';
  const question = 'How does blockchain work in Azora?';
  
  // Get AI tutoring response
  const answer = await aiHub.elara.provideTutoring(question, {
    studentLevel: 'intermediate',
    previousTopics: ['cryptocurrency', 'distributed systems']
  });

  // Get personalized recommendations
  const recommendations = await aiHub.recommendations.getPersonalizedRecommendations(
    studentId,
    { currentTopic: 'blockchain' }
  );

  return { answer, recommendations: recommendations.priority };
}

// Example 2: Constitutional AI Validation
export async function constitutionalValidationExample() {
  const action = {
    type: 'financial_transaction',
    amount: 1000,
    description: 'Transfer funds to community project',
    beneficiary: 'ubuntu-community-fund'
  };

  // Validate against Constitutional AI
  const validation = await aiHub.constitutional.validateAction(action);
  
  if (!validation.valid) {
    console.log('Action rejected:', validation.reason);
    return { approved: false, reason: validation.reason };
  }

  // Proceed with governance decision
  const decision = await aiHub.constitutional.governDecision(action, {
    userId: 'user-456'
  });

  return decision;
}

// Example 3: Guardian Oracle Verification
export async function guardianVerificationExample() {
  const content = {
    title: 'Introduction to Quantum Computing',
    description: 'A comprehensive course on quantum computing fundamentals',
    category: 'education',
    submittedBy: 'educator-789'
  };

  // Verify content with Guardian Oracles
  const verification = await aiHub.constitutional.guardianCourt.verifyContent(content);

  return {
    verified: verification.verified,
    trustScore: verification.trustScore,
    guardianConsensus: verification.consensus
  };
}

// Example 4: Complete Learning Flow with AI
export async function completeLearningFlowExample() {
  const studentId = 'student-123';
  const topic = 'Constitutional AI';

  // Step 1: Generate personalized lesson with Elara
  const lessonRequest = {
    studentId,
    studentProfile: {
      level: 'beginner',
      learningStyle: 'visual',
      interests: ['AI', 'governance']
    },
    topic
  };

  const result = await aiHub.processLearningRequest(lessonRequest);

  // Step 2: Get real-time insights
  const insights = await aiHub.getRealTimeInsights(studentId, {
    currentLesson: result.lesson
  });

  // Step 3: Bridge to V0 UI
  const learningPath = await v0Bridge.createPersonalizedLearningPath(studentId, {
    level: 'beginner',
    style: 'visual'
  });

  return {
    lesson: result.lesson,
    verification: result.verification,
    recommendations: result.recommendations,
    insights,
    learningPath
  };
}

// Example 5: Real-time Recommendations
export async function realTimeRecommendationsExample() {
  const userId = 'user-456';
  
  // Get comprehensive recommendations
  const recommendations = await aiHub.recommendations.getPersonalizedRecommendations(
    userId,
    {
      currentActivity: 'browsing_courses',
      timeOfDay: 'evening',
      recentActions: ['completed_course', 'earned_azr']
    }
  );

  return {
    learning: recommendations.recommendations.learning,
    career: recommendations.recommendations.career,
    financial: recommendations.recommendations.financial,
    community: recommendations.recommendations.community,
    topPriority: recommendations.priority
  };
}

// Example 6: Verify and Recommend Combined
export async function verifyAndRecommendExample() {
  const userId = 'user-789';
  const action = {
    type: 'course_creation',
    title: 'Advanced Ubuntu Philosophy',
    description: 'Deep dive into Ubuntu principles',
    price: 50
  };

  // Combined AI validation and recommendations
  const result = await aiHub.verifyAndRecommend(userId, action);

  return {
    actionApproved: result.actionApproved,
    reason: result.reason,
    recommendations: result.recommendations,
    guardianStatus: result.guardianStatus
  };
}

// Example 7: AI Health Monitoring
export async function aiHealthMonitoringExample() {
  const insights = await aiHub.getRealTimeInsights('system', {
    type: 'health_check'
  });

  return {
    elaraStatus: insights.aiTutor,
    constitutionalStatus: insights.constitutional,
    guardianStatus: insights.guardians,
    recommendationsActive: insights.recommendations
  };
}

// Export all examples
export const AIIntegrationExamples = {
  elaraTutoring: elaraTutoringExample,
  constitutionalValidation: constitutionalValidationExample,
  guardianVerification: guardianVerificationExample,
  completeLearningFlow: completeLearningFlowExample,
  realTimeRecommendations: realTimeRecommendationsExample,
  verifyAndRecommend: verifyAndRecommendExample,
  aiHealthMonitoring: aiHealthMonitoringExample
};
