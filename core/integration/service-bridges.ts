/*
AZORA PROPRIETARY LICENSE
Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

SERVICE BRIDGES
Complete API bridges for all Azora backend services
*/

import { azoraAPI } from './api-gateway-config';

// Education Service Bridge
export class EducationService {
  async getCourses(filters?: any) {
    return azoraAPI.get('/api/education/courses' + (filters ? `?${new URLSearchParams(filters)}` : ''));
  }

  async getCourse(id: string) {
    return azoraAPI.get(`/api/education/courses/${id}`);
  }

  async enrollCourse(courseId: string, studentId: string) {
    return azoraAPI.post(`/api/education/courses/${courseId}/enroll`, { studentId });
  }

  async getProgress(studentId: string) {
    return azoraAPI.get(`/api/education/progress/${studentId}`);
  }

  async submitAssessment(assessmentId: string, answers: any) {
    return azoraAPI.post(`/api/education/assessments/${assessmentId}/submit`, { answers });
  }
}

// Mint Service Bridge (Financial)
export class MintService {
  async getWallet(userId: string) {
    return azoraAPI.get(`/api/mint/wallet/${userId}`);
  }

  async getBalance(userId: string, currency = 'AZR') {
    return azoraAPI.get(`/api/mint/balance/${userId}?currency=${currency}`);
  }

  async startMining(userId: string, activityType: string) {
    return azoraAPI.post('/api/mint/mining/start', { userId, activityType });
  }

  async getTransactions(userId: string, limit = 50) {
    return azoraAPI.get(`/api/mint/transactions/${userId}?limit=${limit}`);
  }

  async transfer(from: string, to: string, amount: number, currency = 'AZR') {
    return azoraAPI.post('/api/mint/transfer', { from, to, amount, currency });
  }
}

// Forge Service Bridge (Marketplace)
export class ForgeService {
  async getJobs(filters?: any) {
    return azoraAPI.get('/api/forge/jobs' + (filters ? `?${new URLSearchParams(filters)}` : ''));
  }

  async getJob(id: string) {
    return azoraAPI.get(`/api/forge/jobs/${id}`);
  }

  async applyJob(jobId: string, userId: string, proposal: any) {
    return azoraAPI.post(`/api/forge/jobs/${jobId}/apply`, { userId, proposal });
  }

  async assessSkills(userId: string, skills: string[]) {
    return azoraAPI.post('/api/forge/skills/assess', { userId, skills });
  }

  async matchJobs(userId: string, preferences: any) {
    return azoraAPI.post('/api/forge/match', { userId, preferences });
  }
}

// Sapiens Service Bridge (AI Tutoring)
export class SapiensService {
  async chat(userId: string, message: string, context?: any) {
    return azoraAPI.post('/api/sapiens/chat', { userId, message, context });
  }

  async generateLearningPath(userId: string, goals: string[]) {
    return azoraAPI.post('/api/sapiens/learning-path', { userId, goals });
  }

  async explainConcept(concept: string, level: string) {
    return azoraAPI.post('/api/sapiens/explain', { concept, level });
  }

  async getRecommendations(userId: string) {
    return azoraAPI.get(`/api/sapiens/recommendations/${userId}`);
  }
}

// Aegis Service Bridge (Security)
export class AegisService {
  async verifyIdentity(userId: string, documents: any) {
    return azoraAPI.post('/api/aegis/verify', { userId, documents });
  }

  async checkPermissions(userId: string, resource: string, action: string) {
    return azoraAPI.post('/api/aegis/permissions/check', { userId, resource, action });
  }

  async reportThreat(userId: string, threat: any) {
    return azoraAPI.post('/api/aegis/threats/report', { userId, threat });
  }

  async getSecurityStatus(userId: string) {
    return azoraAPI.get(`/api/aegis/status/${userId}`);
  }
}

// Nexus Service Bridge (Event Bus)
export class NexusService {
  async publishEvent(event: any) {
    return azoraAPI.post('/api/nexus/events', event);
  }

  async subscribeToEvents(userId: string, eventTypes: string[]) {
    return azoraAPI.post('/api/nexus/subscribe', { userId, eventTypes });
  }

  async getEventHistory(filters?: any) {
    return azoraAPI.get('/api/nexus/events/history' + (filters ? `?${new URLSearchParams(filters)}` : ''));
  }
}

// Ledger Service Bridge (Blockchain)
export class LedgerService {
  async mintNFT(userId: string, metadata: any) {
    return azoraAPI.post('/api/ledger/nft/mint', { userId, metadata });
  }

  async getNFTs(userId: string) {
    return azoraAPI.get(`/api/ledger/nft/${userId}`);
  }

  async verifyCertificate(certificateId: string) {
    return azoraAPI.get(`/api/ledger/certificates/${certificateId}/verify`);
  }

  async getBlockchainStatus() {
    return azoraAPI.get('/api/ledger/status');
  }
}

// Export service instances
export const educationService = new EducationService();
export const mintService = new MintService();
export const forgeService = new ForgeService();
export const sapiensService = new SapiensService();
export const aegisService = new AegisService();
export const nexusService = new NexusService();
export const ledgerService = new LedgerService();
