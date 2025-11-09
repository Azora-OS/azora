/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/
import mongoose, { Schema } from 'mongoose';
const CreditApplicationSchema = new Schema({
    userId: { type: String, required: true, index: true },
    amountRequested: { type: Number, required: true, min: 100, max: 5000 },
    purpose: { type: String, required: true, maxlength: 500 },
    trustScore: { type: Number, required: true, min: 0, max: 100 },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected', 'expired'],
        default: 'pending'
    },
    aiAnalysis: {
        riskAssessment: { type: String, required: true },
        recommendedAmount: { type: Number, required: true },
        confidence: { type: Number, required: true, min: 0, max: 1 },
        reasoning: { type: String, required: true },
    },
    approvedAmount: { type: Number },
    approvedAt: { type: Date },
    expiresAt: { type: Date, required: true },
}, {
    timestamps: true,
});
// Indexes
CreditApplicationSchema.index({ userId: 1, status: 1 });
CreditApplicationSchema.index({ status: 1, expiresAt: 1 });
CreditApplicationSchema.index({ createdAt: -1 });
export const CreditApplication = mongoose.model('CreditApplication', CreditApplicationSchema);
const LoanSchema = new Schema({
    userId: { type: String, required: true, index: true },
    applicationId: { type: Schema.Types.ObjectId, ref: 'CreditApplication', required: true },
    amountZAR: { type: Number, required: true },
    amountAZR: { type: Number, required: true },
    metabolicTax: { type: Number, required: true },
    totalDebt: { type: Number, required: true },
    status: {
        type: String,
        enum: ['active', 'repaid', 'defaulted', 'written_off'],
        default: 'active'
    },
    disbursementDate: { type: Date, required: true },
    dueDate: { type: Date, required: true },
    repaymentSchedule: [{
            dueDate: { type: Date, required: true },
            amount: { type: Number, required: true },
            status: {
                type: String,
                enum: ['pending', 'paid', 'overdue'],
                default: 'pending'
            },
            paidAt: { type: Date },
        }],
    collateralLocked: { type: Boolean, default: true },
    collateralReleased: { type: Boolean, default: false },
    defaultPenalty: { type: Number },
}, {
    timestamps: true,
});
// Indexes
LoanSchema.index({ userId: 1, status: 1 });
LoanSchema.index({ status: 1, dueDate: 1 });
LoanSchema.index({ disbursementDate: -1 });
export const Loan = mongoose.model('Loan', LoanSchema);
const TrustScoreSchema = new Schema({
    userId: { type: String, required: true, unique: true },
    score: { type: Number, required: true, min: 0, max: 100 },
    factors: {
        systemUse: { type: Number, required: true, min: 0, max: 100 },
        compliance: { type: Number, required: true, min: 0, max: 100 },
        socialLedger: { type: Number, required: true, min: 0, max: 100 },
        repaymentHistory: { type: Number, required: true, min: 0, max: 100 },
        valueCreation: { type: Number, required: true, min: 0, max: 100 },
    },
    lastCalculated: { type: Date, required: true },
    nextUpdate: { type: Date, required: true },
}, {
    timestamps: true,
});
// Indexes
TrustScoreSchema.index({ userId: 1 }, { unique: true });
TrustScoreSchema.index({ score: -1 });
TrustScoreSchema.index({ nextUpdate: 1 });
export const TrustScore = mongoose.model('TrustScore', TrustScoreSchema);
const RepaymentTransactionSchema = new Schema({
    loanId: { type: Schema.Types.ObjectId, ref: 'Loan', required: true },
    userId: { type: String, required: true },
    amount: { type: Number, required: true },
    method: {
        type: String,
        enum: ['manual', 'autonomous_collection'],
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'completed', 'failed'],
        default: 'pending'
    },
    transactionId: { type: String },
    processedAt: { type: Date },
}, {
    timestamps: true,
});
// Indexes
RepaymentTransactionSchema.index({ loanId: 1, status: 1 });
RepaymentTransactionSchema.index({ userId: 1, createdAt: -1 });
export const RepaymentTransaction = mongoose.model('RepaymentTransaction', RepaymentTransactionSchema);
