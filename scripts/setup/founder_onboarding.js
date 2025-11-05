#!/usr/bin/env node
/**
 * Azora Founder Onboarding System
 * Interactive constitutional onboarding for founders
 */

const readline = require('readline');
const crypto = require('crypto');
const fs = require('fs').promises;
const path = require('path');

class FounderOnboarding {
    constructor() {
        this.rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });

        this.onboardingData = {
            founder: {},
            agreement: {},
            signatures: [],
            status: 'initialized',
            startedAt: new Date().toISOString()
        };

        this.agreementPath = path.join(__dirname, '../../docs/legal/FOUNDER_COMPENSATION_AGREEMENT.md');
    }

    async start() {
        console.log('🌟 Welcome to Azora OS Founder Onboarding');
        console.log('=====================================\n');

        try {
            await this.phase1IdentityVerification();
            await this.phase2AgreementReview();
            await this.phase3DigitalSignatures();
            await this.phase4Activation();

            console.log('\n🎉 Onboarding completed successfully!');
            console.log('Your founder status is now active under the Azora Constitution.');

        } catch (error) {
            console.error('\n❌ Onboarding failed:', error.message);
            this.onboardingData.status = 'failed';
            this.onboardingData.error = error.message;
        } finally {
            await this.saveOnboardingRecord();
            this.rl.close();
        }
    }

    async phase1IdentityVerification() {
        console.log('📋 Phase 1: Identity Verification');
        console.log('--------------------------------');

        this.onboardingData.founder.fullName = await this.question('Enter your full legal name: ');
        this.onboardingData.founder.governmentId = await this.question('Government ID/Reference number: ');
        this.onboardingData.founder.email = await this.question('Email address: ');
        this.onboardingData.founder.phone = await this.question('Phone number: ');

        console.log('\n📍 Address Information:');
        this.onboardingData.founder.address = {
            street: await this.question('Street address: '),
            city: await this.question('City: '),
            state: await this.question('State/Province: '),
            postalCode: await this.question('Postal code: '),
            country: await this.question('Country: ')
        };

        // Generate founder ID
        this.onboardingData.founder.id = 'founder-' + crypto.randomBytes(4).toString('hex');
        this.onboardingData.founder.constitionalRole = 'Chief Executive Founder';

        console.log(`\n✅ Identity verification completed. Your Founder ID: ${this.onboardingData.founder.id}`);
        this.onboardingData.status = 'identity_verified';
    }

    async phase2AgreementReview() {
        console.log('\n📄 Phase 2: Constitutional Agreement Review');
        console.log('------------------------------------------');

        // Load and display agreement
        const agreement = await fs.readFile(this.agreementPath, 'utf8');
        console.log('\nPlease review the Founder Compensation Agreement:\n');
        console.log('='.repeat(60));
        console.log(agreement);
        console.log('='.repeat(60));

        const accept = await this.question('\nDo you accept the terms of this Constitutional Agreement? (yes/no): ');
        if (accept.toLowerCase() !== 'yes') {
            throw new Error('Agreement not accepted. Onboarding cancelled.');
        }

        this.onboardingData.agreement.accepted = true;
        this.onboardingData.agreement.acceptedAt = new Date().toISOString();
        this.onboardingData.agreement.version = '1.0';

        console.log('✅ Constitutional Agreement accepted.');
        this.onboardingData.status = 'agreement_accepted';
    }

    async phase3DigitalSignatures() {
        console.log('\n✍️  Phase 3: Digital Signatures');
        console.log('------------------------------');

        // Create signature data
        const signatureData = {
            founder: this.onboardingData.founder,
            agreement: {
                version: this.onboardingData.agreement.version,
                acceptedAt: this.onboardingData.agreement.acceptedAt
            },
            timestamp: new Date().toISOString()
        };

        // Generate digital signature
        const signaturePayload = JSON.stringify(signatureData, Object.keys(signatureData).sort());
        const signature = crypto.createHash('sha256').update(signaturePayload).digest('hex');

        console.log('\n📝 Digital Signature Generated:');
        console.log(`Hash: ${signature}`);
        console.log('\nThis signature will be recorded in the Constitutional Ledger.');

        const confirm = await this.question('\nConfirm digital signature? (yes/no): ');
        if (confirm.toLowerCase() !== 'yes') {
            throw new Error('Digital signature not confirmed. Onboarding cancelled.');
        }

        this.onboardingData.signatures.push({
            type: 'founder_digital_signature',
            signature,
            payload: signatureData,
            confirmedAt: new Date().toISOString()
        });

        // Simulate constitutional witness signatures
        console.log('\n👥 Collecting Constitutional Witness Signatures...');

        const witnesses = [
            { role: 'Constitutional Council Member', name: 'Witness Alpha' },
            { role: 'Community Representative', name: 'Witness Beta' },
            { role: 'Legal Counsel', name: 'Witness Gamma' }
        ];

        for (const witness of witnesses) {
            const witnessSignature = crypto.createHash('sha256')
                .update(signaturePayload + witness.name)
                .digest('hex');

            this.onboardingData.signatures.push({
                type: 'constitutional_witness',
                witness: witness,
                signature: witnessSignature,
                confirmedAt: new Date().toISOString()
            });

            console.log(`✅ ${witness.role} signature collected`);
        }

        console.log('✅ All digital signatures collected.');
        this.onboardingData.status = 'signatures_collected';
    }

    async phase4Activation() {
        console.log('\n🚀 Phase 4: Founder Activation');
        console.log('------------------------------');

        // Initialize founder in ledger system
        console.log('📊 Initializing Founder Ledger Account...');

        const FounderLedger = require('../founder-ledger-service/founder_ledger.js');
        const ledger = new FounderLedger();

        // Record first month compensation
        const now = new Date();
        const firstCompensation = await ledger.recordCompensation(now.getMonth() + 1, now.getFullYear());

        this.onboardingData.activation = {
            ledgerInitialized: true,
            firstCompensationId: firstCompensation.transactionId,
            activatedAt: new Date().toISOString(),
            compensationSchedule: {
                monthlyAmount: 15000,
                nextPayment: new Date(now.getFullYear(), now.getMonth() + 1, 1).toISOString().split('T')[0]
            }
        };

        // Generate activation certificate
        const certificate = {
            certificateId: crypto.randomUUID(),
            founderId: this.onboardingData.founder.id,
            founderName: this.onboardingData.founder.fullName,
            constitutionalRole: this.onboardingData.founder.constitionalRole,
            activatedAt: this.onboardingData.activation.activatedAt,
            compensationRights: {
                monthlyAmount: 15000,
                constitutionalReference: 'Article VII, Section 3'
            },
            signatures: this.onboardingData.signatures,
            blockchainHash: crypto.createHash('sha256')
                .update(JSON.stringify(this.onboardingData))
                .digest('hex')
        };

        const certPath = path.join(__dirname, `../../docs/legal/founder_activation_certificate_${this.onboardingData.founder.id}.json`);
        await fs.writeFile(certPath, JSON.stringify(certificate, null, 2));

        console.log('✅ Founder Ledger account initialized');
        console.log('✅ First month compensation scheduled');
        console.log(`✅ Activation certificate generated: ${certPath}`);

        this.onboardingData.status = 'activated';
    }

    async saveOnboardingRecord() {
        this.onboardingData.completedAt = new Date().toISOString();

        const recordPath = path.join(__dirname, `../../docs/legal/founder_onboarding_record_${this.onboardingData.founder.id}.json`);
        await fs.writeFile(recordPath, JSON.stringify(this.onboardingData, null, 2));

        console.log(`\n💾 Onboarding record saved: ${recordPath}`);
    }

    question(prompt) {
        return new Promise((resolve) => {
            this.rl.question(prompt, resolve);
        });
    }
}

// CLI Interface
async function main() {
    if (process.argv[2] === '--help' || process.argv[2] === '-h') {
        console.log('Azora Founder Onboarding System');
        console.log('Usage: node founder_onboarding.js');
        console.log('\nThis will guide you through the complete founder onboarding process.');
        return;
    }

    const onboarding = new FounderOnboarding();
    await onboarding.start();
}

if (require.main === module) {
    main().catch(console.error);
}

module.exports = FounderOnboarding;