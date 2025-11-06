// Propose completeRedeem to Gnosis Safe (example). Fill env: RPC_URL, SAFE_ADDRESS, SAFE_OWNER_PRIVATE_KEY, REDEMPTION_ADDRESS, REDEEM_ID, TREASURY_ADDRESS, BANK_REF
// This script proposes the multisig transaction; owners must sign via Gnosis UI/API.

const { ethers } = require("ethers");
const { EthersAdapter } = require('@safe-global/protocol-kit');
const { SafeApiKit } = require('@safe-global/api-kit');

async function main() {
    const RPC_URL = process.env.RPC_URL;
    if (!RPC_URL) throw new Error("Please set RPC_URL env var");
    const provider = new ethers.providers.JsonRpcProvider(RPC_URL);
    const ownerPk = process.env.SAFE_OWNER_PRIVATE_KEY;
    if (!ownerPk) throw new Error("Please set SAFE_OWNER_PRIVATE_KEY for the proposer (run locally, keep secret)");
    const signer = new ethers.Wallet(ownerPk, provider);

    const ethAdapter = new EthersAdapter({
        ethers,
        signerOrProvider: signer
    });

    const safeAddress = process.env.SAFE_ADDRESS;
    const txServiceUrl = process.env.SAFE_TX_SERVICE || 'https://safe-transaction-mainnet.safe.global';
    const safeService = new SafeApiKit({ txServiceUrl, ethAdapter });

    const safeSDK = await ethAdapter.getSafeContract({
        safeContractAddress: safeAddress,
        ethAdapter
    });

    const redemptionAddress = process.env.REDEMPTION_ADDRESS;
    const redeemId = process.env.REDEEM_ID; // e.g., "1"
    const treasury = process.env.TREASURY_ADDRESS || '0xTREASURY_ADDRESS';
    const bankRef = process.env.BANK_REF || 'BANK-REF-PLACEHOLDER';

    const redemptionAbi = [
        "function completeRedeem(uint256 id, address treasury, string calldata bankRef)"
    ];
    const iface = new ethers.utils.Interface(redemptionAbi);
    const data = iface.encodeFunctionData("completeRedeem", [redeemId, treasury, bankRef]);

    const safeTransactionData = {
        to: redemptionAddress,
        data,
        value: "0"
    };

    const safeTransaction = await safeSDK.createTransaction({ safeTransactionData });

    // Propose the transaction so other owners can sign in the Safe UI
    const senderAddress = await signer.getAddress();
    const safeTxHash = await safeSDK.getTransactionHash(safeTransaction);
    const proposeTx = await safeService.proposeTransaction({
        safeAddress,
        safeTransactionData: safeTransaction.data,
        safeTxHash,
        senderAddress,
        senderSignature: await safeSDK.signTransactionHash(safeTxHash)
    });

    console.log("Proposed Safe tx. Check Gnosis Safe UI for signing. Safe Tx Hash:", safeTxHash);
}

main().catch(err => {
    console.error(err);
    process.exit(1);
});