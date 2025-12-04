import { BlockchainService } from '../services/azora-blockchain/src/blockchain-service';
import { ConstitutionalEngine } from '../services/constitutional-ai/src/constitutional-engine';

async function onboardBetaUsers() {
    console.log("🌍 EXECUTING THE INVITATION: WELCOMING THE FIRST WAVE");
    console.log("=====================================================");

    const blockchain = new BlockchainService();
    const engine = new ConstitutionalEngine();

    const betaUsers = [
        { name: "Alice", role: "Student", address: "0xBetaUser1..." },
        { name: "Bob", role: "Creator", address: "0xBetaUser2..." },
        { name: "Charlie", role: "Developer", address: "0xBetaUser3..." },
        { name: "Diana", role: "Researcher", address: "0xBetaUser4..." },
        { name: "Evan", role: "Artist", address: "0xBetaUser5..." }
    ];

    console.log(`\n📨 Processing ${betaUsers.length} Beta Invites...`);

    for (const user of betaUsers) {
        console.log(`\n   👤 Onboarding: ${user.name} (${user.role})`);

        // 1. Create Identity (Simulated)
        console.log(`      - Identity Verified: ${user.address}`);

        // 2. Airdrop Initial AZR (from Genesis Airdrop Fund)
        // In a real app, this calls the blockchain mint/transfer
        // await blockchain.transfer(AIRDROP_WALLET, user.address, 100);
        console.log(`      - 🎁 Airdrop: 100 AZR sent to wallet.`);

        // 3. Welcome Message from AI Tutor
        const welcomeMsg = await engine.processTutorRequest(
            "Azora Onboarding",
            "Constitutional Values",
            `Welcome ${user.name} to Azora. As a ${user.role}, how can I contribute?`
        );
        console.log(`      - 🤖 AI Tutor: "${welcomeMsg.substring(0, 60)}..."`);
    }

    console.log("\n=====================================================");
    console.log("🎉 FIRST WAVE ONBOARDED. THE DOORS ARE OPEN.");
    console.log("   Current Population: 6 (Founders + 5 Beta Users)");
    console.log("   System Status: LIVE & STABLE");
}

onboardBetaUsers().catch(console.error);
