/*
AZORA PROPRIETARY LICENSE
Copyright (c) 2025 Azora ES (Pty) Ltd. All Rights Reserved.
See LICENSE file for details.
*/

/**
 * Updated Database Models using Azora's Database Connection
 * 
 * Upgraded from generic Mongoose to use Azora's connection service
 */

import { mongoose, azoraDatabase } from './connection';
import { Schema, Model, Document } from 'mongoose';

// ========== ASSESSMENT SCHEMAS ==========

const AssessmentSchema = new Schema({
  id: { type: String, required: true, unique: true, index: true },
  courseId: { type: String, required: true, index: true },
  moduleId: { type: String, required: true, index: true },
  title: { type: String, required: true },
  description: String,
  type: { type: String, enum: ['quiz', 'assignment', 'exam', 'project', 'peer-review', 'self-assessment'], required: true },
  totalPoints: { type: Number, required: true },
  passingScore: { type: Number, required: true },
  dueDate: Date,
  timeLimit: Number,
  questions: [{
    id: String,
    type: String,
    text: String,
    points: Number,
    options: [String],
    correctAnswer: Schema.Types.Mixed,
    rubric: Schema.Types.Mixed,
    feedback: String,
  }],
  rubric: Schema.Types.Mixed,
  createdAt: { type: Date, default: Date.now, index: true },
  createdBy: String,
  constitutionalAlignment: Boolean,
}, { collection: 'assessments', timestamps: true });

const SubmissionSchema = new Schema({
  id: { type: String, required: true, unique: true, index: true },
  assessmentId: { type: String, required: true, index: true },
  studentId: { type: String, required: true, index: true },
  studentNumber: { type: String, required: true, index: true },
  answers: [{
    questionId: String,
    answer: Schema.Types.Mixed,
    type: String,
    timestamp: Date,
  }],
  submittedAt: { type: Date, default: Date.now, index: true },
  status: { type: String, enum: ['submitted', 'graded', 'grading', 'returned'], default: 'submitted', index: true },
  timeSpent: Number,
  ipAddress: String,
  deviceInfo: String,
}, { collection: 'submissions', timestamps: true });

const GradeSchema = new Schema({
  id: { type: String, required: true, unique: true, index: true },
  submissionId: { type: String, required: true, index: true },
  assessmentId: { type: String, required: true, index: true },
  studentId: { type: String, required: true, index: true },
  studentNumber: { type: String, required: true, index: true },
  courseId: { type: String, required: true, index: true },
  moduleId: String,
  totalPoints: Number,
  earnedPoints: Number,
  percentage: Number,
  letterGrade: String,
  gradedAt: { type: Date, default: Date.now },
  gradedBy: String,
  questionGrades: [{
    questionId: String,
    points: Number,
    maxPoints: Number,
    feedback: String,
    autoGraded: Boolean,
  }],
  feedback: String,
  rubricScores: Schema.Types.Mixed,
  constitutionalAlignment: Number,
  uid: { type: String, required: true, unique: true, index: true },
}, { collection: 'grades', timestamps: true });

// ========== CONTENT SCHEMAS ==========

const CourseSchema = new Schema({
  id: { type: String, required: true, unique: true, index: true },
  title: { type: String, required: true },
  description: String,
  code: { type: String, required: true, unique: true, index: true },
  instructorId: { type: String, required: true, index: true },
  level: { type: String, enum: ['beginner', 'intermediate', 'advanced', 'expert'] },
  category: String,
  credits: Number,
  duration: Number,
  modules: [{
    id: String,
    courseId: String,
    title: String,
    description: String,
    order: Number,
    type: String,
    content: Schema.Types.Mixed,
    resources: [Schema.Types.Mixed],
    estimatedDuration: Number,
    prerequisites: [String],
  }],
  learningObjectives: [String],
  prerequisites: [String],
  status: { type: String, enum: ['draft', 'review', 'published', 'archived'], default: 'draft', index: true },
  constitutionalScore: Number,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  version: Number,
  publishedAt: Date,
}, { collection: 'courses', timestamps: true });

const ResourceSchema = new Schema({
  id: { type: String, required: true, unique: true, index: true },
  title: { type: String, required: true },
  type: { type: String, enum: ['pdf', 'link', 'code', 'dataset', 'video', 'image'] },
  url: { type: String, required: true },
  description: String,
  size: Number,
  constitutionallyVetted: Boolean,
  vettedAt: Date,
  vettedBy: String,
}, { collection: 'resources', timestamps: true });

// ========== ANALYTICS SCHEMAS ==========

const ProgressDataSchema = new Schema({
  studentId: { type: String, required: true, index: true },
  studentNumber: { type: String, required: true, index: true },
  courseId: { type: String, required: true, index: true },
  moduleId: String,
  completed: Boolean,
  completionDate: Date,
  timeSpent: Number,
  lastAccessed: { type: Date, default: Date.now, index: true },
  progress: Number,
  assessmentScores: [Number],
}, { collection: 'progress_data', timestamps: true });

// ========== CREDENTIAL SCHEMAS ==========

const CredentialDocumentSchema = new Schema({
  id: { type: String, required: true, unique: true, index: true },
  credentialId: { type: String, required: true, index: true },
  studentNumber: { type: String, required: true, index: true },
  type: String,
  documentType: String,
  pdfUrl: String,
  watermark: {
    enabled: Boolean,
    text: String,
    logo: String,
    opacity: Number,
  },
  uid: { type: String, required: true, unique: true, index: true },
  metadata: {
    issuedDate: Date,
    issuer: String,
    blockchainHash: String,
    ledgerRecordId: String,
  },
  createdAt: { type: Date, default: Date.now },
}, { collection: 'credentials', timestamps: true });

const LedgerRecordSchema = new Schema({
  recordId: { type: String, required: true, unique: true, index: true },
  studentNumber: { type: String, required: true, index: true },
  credentialId: { type: String, required: true, index: true },
  credentialType: String,
  uid: { type: String, required: true, unique: true, index: true },
  blockchainHash: { type: String, required: true, index: true },
  issuedDate: Date,
  issuer: String,
  metadata: Schema.Types.Mixed,
  verified: Boolean,
}, { collection: 'ledger_records', timestamps: true });

// ========== COLLABORATION SCHEMAS ==========

const ForumSchema = new Schema({
  id: { type: String, required: true, unique: true, index: true },
  courseId: { type: String, required: true, index: true },
  title: String,
  description: String,
  topics: [Schema.Types.Mixed],
  createdAt: { type: Date, default: Date.now },
  createdBy: String,
}, { collection: 'forums', timestamps: true });

const MessageSchema = new Schema({
  id: { type: String, required: true, unique: true, index: true },
  senderId: { type: String, required: true, index: true },
  receiverId: { type: String, required: true, index: true },
  content: String,
  read: { type: Boolean, default: false },
  readAt: Date,
  createdAt: { type: Date, default: Date.now },
}, { collection: 'messages', timestamps: true });

const StudyGroupSchema = new Schema({
  id: { type: String, required: true, unique: true, index: true },
  name: String,
  description: String,
  courseId: { type: String, required: true, index: true },
  members: [{
    userId: String,
    role: String,
    joinedAt: Date,
  }],
  maxMembers: Number,
  visibility: { type: String, enum: ['public', 'private'] },
  createdAt: { type: Date, default: Date.now },
  createdBy: String,
}, { collection: 'study_groups', timestamps: true });

// ========== PAYMENT SCHEMAS ==========

const PaymentSchema = new Schema({
  id: { type: String, required: true, unique: true, index: true },
  studentId: { type: String, required: true, index: true },
  studentNumber: { type: String, required: true, index: true },
  courseId: { type: String, required: true, index: true },
  amount: Number,
  currency: String,
  status: { type: String, enum: ['pending', 'completed', 'failed', 'refunded'], index: true },
  paymentMethod: String,
  transactionId: { type: String, unique: true, sparse: true },
  createdAt: { type: Date, default: Date.now, index: true },
  completedAt: Date,
}, { collection: 'payments', timestamps: true });

const ScholarshipSchema = new Schema({
  id: { type: String, required: true, unique: true, index: true },
  name: String,
  description: String,
  eligibilityCriteria: [String],
  amount: Number,
  coverage: { type: String, enum: ['full', 'partial'] },
  percentage: Number,
  maxRecipients: Number,
  currentRecipients: { type: Number, default: 0 },
  applicationDeadline: Date,
  status: { type: String, enum: ['active', 'closed', 'expired'], default: 'active', index: true },
  createdAt: { type: Date, default: Date.now },
}, { collection: 'scholarships', timestamps: true });

// ========== MEDIA SCHEMAS ==========

const VideoAssetSchema = new Schema({
  id: { type: String, required: true, unique: true, index: true },
  title: String,
  description: String,
  url: String,
  thumbnailUrl: String,
  duration: Number,
  size: Number,
  format: String,
  quality: String,
  status: { type: String, enum: ['uploading', 'processing', 'ready', 'failed'] },
  courseId: { type: String, index: true },
  moduleId: String,
  uploadedBy: String,
  uploadedAt: { type: Date, default: Date.now },
  metadata: Schema.Types.Mixed,
}, { collection: 'video_assets', timestamps: true });

const VideoViewSchema = new Schema({
  id: { type: String, required: true, unique: true, index: true },
  videoId: { type: String, required: true, index: true },
  userId: { type: String, required: true, index: true },
  watchedDuration: Number,
  completed: Boolean,
  deviceInfo: String,
  location: String,
  startedAt: { type: Date, default: Date.now },
  endedAt: Date,
}, { collection: 'video_views', timestamps: true });

// Export models (will be created after connection)
export const Assessment = mongoose.models.Assessment || mongoose.model('Assessment', AssessmentSchema);
export const Submission = mongoose.models.Submission || mongoose.model('Submission', SubmissionSchema);
export const Grade = mongoose.models.Grade || mongoose.model('Grade', GradeSchema);
export const Course = mongoose.models.Course || mongoose.model('Course', CourseSchema);
export const Resource = mongoose.models.Resource || mongoose.model('Resource', ResourceSchema);
export const ProgressData = mongoose.models.ProgressData || mongoose.model('ProgressData', ProgressDataSchema);
export const CredentialDocument = mongoose.models.CredentialDocument || mongoose.model('CredentialDocument', CredentialDocumentSchema);
export const LedgerRecord = mongoose.models.LedgerRecord || mongoose.model('LedgerRecord', LedgerRecordSchema);
export const Forum = mongoose.models.Forum || mongoose.model('Forum', ForumSchema);
export const Message = mongoose.models.Message || mongoose.model('Message', MessageSchema);
export const StudyGroup = mongoose.models.StudyGroup || mongoose.model('StudyGroup', StudyGroupSchema);
export const Payment = mongoose.models.Payment || mongoose.model('Payment', PaymentSchema);
export const Scholarship = mongoose.models.Scholarship || mongoose.model('Scholarship', ScholarshipSchema);
export const VideoAsset = mongoose.models.VideoAsset || mongoose.model('VideoAsset', VideoAssetSchema);
export const VideoView = mongoose.models.VideoView || mongoose.model('VideoView', VideoViewSchema);

// Re-export connection service
export { azoraDatabase, mongoose, connectAzoraDatabase } from './connection';
