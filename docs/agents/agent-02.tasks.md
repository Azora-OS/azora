# Agent 02 - Azora Mint & NFT Certificate Service

Primary Focus: Implement AZR minting & NFT certificate minting to production-grade with controlled access.

Priority: CRITICAL

Local Status: In Progress (started by agent-local) - Performed initial review; attempted to run tests but monorepo workspace naming causes `npm ci` to fail when run inside a workspace. See local-progress/agent-02/progress.json for details.

Tasks:
1. Inspect `services/azora-mint` and `services/azora-nft-minting` for status; add contract interaction plumbing.
   - Work: Ensure contract ABIs and addresses are configured via env; add `mint` endpoints.
   - Acceptance: `POST /api/mint/azr` and `POST /api/mint/nft` calls mint to a local Hardhat chain.

2. Add access control for minting endpoints.
   - Work: Require a sign-off role (e.g., `mint:tokens`) in `azora-auth` and validate JWT in `azora-mint` endpoints.
   - Files: `services/azora-mint/src/mint-controller.ts`.
   - Acceptance: Unit tests ensure requests without the role are rejected.

3. Add IPFS integration for NFT metadata (S3 fallback if IPFS not possible in CI).
   - Work: Implement `uploadMetadata` method with both IPFS and S3 compatibility.
   - Acceptance: `mint` returns tokenId and metadata URI; verify `tokenURI` resolves.

4. Add minting rate limiting and sanity checks to prevent abuse.
   - Work: Enforce per-minute limits and require anti-gaming checks (proof-of-value) before minting.
   - Acceptance: Rate-limited and protected mint endpoints.

Verification steps:
- Unit/integration tests for minting functions, including a redis-based rate-limit test and a mock IPFS test.
- Run `npm run test` in `services/azora-mint`.

Env / setup:
- `BLOCKCHAIN_RPC_URL`, `AZR_CONTRACT_ADDRESS`, `BLOCKCHAIN_PRIVATE_KEY`, `IPFS_API_...` or `S3_*`.

