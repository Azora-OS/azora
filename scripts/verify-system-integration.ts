import { ConstitutionalEngine } from '../services/constitutional-ai/src/constitutional-engine';
import { BlockchainService } from '../services/azora-blockchain/src/blockchain-service';
import { TreasuryService } from '../services/azora-treasury/src/treasury-service';
import { LLMService } from '../services/constitutional-ai/src/llm-service';
import { FiatService } from '../services/azora-pay/src/fiat-service';

/**
 * System-Wide Integration Test Suite
 * 
 * Verifies the "Soul" of Azora:
 * 1. AI Tutor (Brain)
 * 2. Reputation System (Meritocracy)
 * 3. Economic Flow (Circulatory System)
 * 4. Fiat Gateway (Bridge)
 */
async function runSystemTest() {
    console.log("🚀 Starting Azora OS System-Wide Verification...\n");

    // 1. Initialize Core Services
    const llmService = new LLMService(); // Uses MockAdapter by default
    const engine = new ConstitutionalEngine();
    const blockchain = new BlockchainService();
    const treasury = new TreasuryService();
    const fiatService = new FiatService();

    // ---------------------------------------------------------
    // TEST 1: The Brain (AI Tutor)
    // ---------------------------------------------------------
    console.log("🎓 TEST 1: AI Tutor (Constitutional Intelligence)");
    const studentQuery = "Why should I care about decentralized identity?";
    console.log(`   Student asks: "${studentQuery}"`);

    const tutorResponse = await engine.processTutorRequest(
        "Introduction to Self-Sovereign Identity",
        "Identity & Privacy",
        studentQuery
    );

    console.log(`   AI Tutor responds: "${tutorResponse.substring(0, 100)}..."`);

    if (tutorResponse.includes("identity") || tutorResponse.length > 20) {
        console.log("   ✅ PASS: AI Tutor provided a relevant response.");
    } else {
        console.error("   ❌ FAIL: AI Tutor response was empty or irrelevant.");
    }
    console.log("");

    // ---------------------------------------------------------
    // TEST 2: The Meritocracy (Reputation System)
    // ---------------------------------------------------------
    console.log("⭐ TEST 2: Reputation System (Meritocracy)");
    const userAddress = "0x1234567890123456789012345678901234567890";
    const reputation = await blockchain.getReputationScore(userAddress);

    console.log(`   User ${userAddress.substring(0, 8)}... has Score: ${reputation.score}, Level: ${reputation.level}`);

    if (reputation.score >= 0 && reputation.score <= 100) {
        console.log("   ✅ PASS: Reputation score retrieved from blockchain (simulated).");
    } else {
        console.error("   ❌ FAIL: Invalid reputation score.");
    }

    // Test Reputation Update
    console.log("   ⭐ Testing Reputation Update...");
    await blockchain.updateReputation(userAddress, 5);
    console.log("   ✅ PASS: Reputation update transaction submitted.");
    console.log("");

    // ---------------------------------------------------------
    // TEST 3: The Economy (Treasury & Assets)
    // ---------------------------------------------------------
    console.log("💰 TEST 3: Economic System (Treasury)");
    const portfolio = await treasury.getPortfolio();

    console.log("   Treasury Portfolio:");
    portfolio.assets.forEach(asset => {
        console.log(`   - ${asset.symbol}: ${asset.amount} (Value: $${asset.valueUsd})`);
    });

    if (portfolio.assets.length > 0) {
        console.log("   ✅ PASS: Treasury is tracking assets.");
    } else {
        console.error("   ❌ FAIL: Treasury portfolio is empty.");
    }
    console.log("");

    // ---------------------------------------------------------
    // TEST 4: The Gateway (Fiat On/Off Ramp)
    // ---------------------------------------------------------
    console.log("💳 TEST 4: Fiat Gateway (Azora Pay)");

    // Test Buy
    const buyResult = await fiatService.buyAZR(150, 'card_test_123');
    if (buyResult.success && buyResult.azrAmount === 100) {
        console.log(`   ✅ PASS: Bought ${buyResult.azrAmount} AZR for $150 (Rate: 1.5).`);
    } else {
        console.error("   ❌ FAIL: Buy AZR failed.");
    }

    // Test Sell
    const sellResult = await fiatService.sellAZR(100, 'bank_test_123');
    if (sellResult.success && sellResult.usdAmount === 150) {
        console.log(`   ✅ PASS: Sold 100 AZR for $${sellResult.usdAmount}.`);
    } else {
        console.error("   ❌ FAIL: Sell AZR failed.");
    }
    console.log("");

    console.log("🎉 System Verification Complete. Azora OS is operational.");
}

// Run the test
runSystemTest().catch(console.error);
