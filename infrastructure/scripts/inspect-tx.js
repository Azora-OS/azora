// Usage (local):
//   export RPC_URL="http://127.0.0.1:8545"
//   export TX_HASH="0xfa584a107475e0ff7d21adc6297433b98edda6be26067fb3af856ee208d915da"
//   node scripts/inspect-tx.js
//
// Decodes tx receipt, prints status, gas, logs. Tries to decode ERC20 Transfer and Redemption events.
// Adjust REDEMPTION_ABI or ERC20_ABI if your contracts differ.

import { ethers } from "ethers";

async function main() {
    const RPC = process.env.RPC_URL;
    const TX = process.env.TX_HASH;
    if (!RPC || !TX) {
        console.error("Set RPC_URL and TX_HASH environment variables.");
        process.exit(1);
    }

    const provider = new ethers.JsonRpcProvider(RPC);
    console.log("Provider:", RPC);
    console.log("Inspecting tx:", TX);

    const tx = await provider.getTransaction(TX);
    if (!tx) {
        console.error("Transaction not found. Is the RPC correct and the tx hash valid on that chain?");
        process.exit(1);
    }
    console.log("tx.hash:", tx.hash);
    console.log("from:", tx.from, "to:", tx.to, "value:", ethers.formatEther(tx.value || 0));
    console.log("nonce:", tx.nonce, "gasPrice (or maxFee):", tx.gasPrice ? tx.gasPrice.toString() : tx.maxFeePerGas?.toString());

    const receipt = await provider.getTransactionReceipt(TX);
    if (!receipt) {
        console.error("Receipt not available yet (tx pending).");
        process.exit(1);
    }

    console.log("blockNumber:", receipt.blockNumber, "status:", receipt.status === 1 ? "success" : "failed");
    console.log("gasUsed:", receipt.gasUsed.toString(), "cumulativeGasUsed:", receipt.cumulativeGasUsed.toString());
    console.log("logs length:", receipt.logs.length);

    // Minimal ABIs for decoding
    const ERC20_ABI = [
        "event Transfer(address indexed from, address indexed to, uint256 value)"
    ];
    // Redemption ABI used earlier in this flow
    const REDEMPTION_ABI = [
        "event RedeemRequested(uint256 indexed id, address indexed requester, uint256 amount, string bankDetails)",
        "event RedeemCompleted(uint256 indexed id, address indexed treasury, string bankRef)"
    ];

    const ercIface = new ethers.Interface(ERC20_ABI);
    const redemptionIface = new ethers.Interface(REDEMPTION_ABI);

    for (let i = 0; i < receipt.logs.length; i++) {
        const log = receipt.logs[i];
        let parsed = null;
        try {
            parsed = ercIface.parseLog(log);
            console.log(`Log ${i}: ERC20 Transfer => from=${parsed.args.from} to=${parsed.args.to} value=${parsed.args.value.toString()} (topic0=${log.topics[0]})`);
            continue;
        } catch (e) { /* not ERC20 transfer */ }

        try {
            parsed = redemptionIface.parseLog(log);
            if (parsed.name === "RedeemRequested") {
                console.log(`Log ${i}: RedeemRequested => id=${parsed.args.id.toString()} requester=${parsed.args.requester} amount=${parsed.args.amount.toString()} bankDetails="${parsed.args.bankDetails}"`);
            } else if (parsed.name === "RedeemCompleted") {
                console.log(`Log ${i}: RedeemCompleted => id=${parsed.args.id.toString()} treasury=${parsed.args.treasury} bankRef="${parsed.args.bankRef}"`);
            } else {
                console.log(`Log ${i}: Redemption event ${parsed.name} =>`, parsed.args);
            }
            continue;
        } catch (e) { /* not redemption */ }

        console.log(`Log ${i}: Unknown log - address=${log.address} topics[0]=${log.topics[0]}`);
    }

    // Confirm number of confirmations
    const latest = await provider.getBlockNumber();
    const confirmations = receipt.blockNumber ? (latest - receipt.blockNumber + 1) : 0;
    console.log("receipt.blockNumber:", receipt.blockNumber, "confirmations:", confirmations);

    console.log("\nIf you expected a transfer to a Redemption contract, check for:");
    console.log("- a Transfer log from your address -> Redemption contract");
    console.log("- a RedeemRequested event with matching amount");
    console.log("- later, a RedeemCompleted event and Transfer Redemption -> treasury");

    process.exit(0);
}

main().catch(err => { console.error(err); process.exit(1); });