/* 
AZORA PROPRIETARY LICENSE 
Copyright (c) 2025 Azora ES (Pty) Ltd. All Rights Reserved. 
See LICENSE file for details. 
*/ 
// Additional RPC endpoints for various chains
// Used by Chainlist.org for extended RPC coverage

export const extraRpcs = {
    // Azora Mainnet additional RPCs (if needed in future)
    195: {
        rpcs: [
            // Primary RPC already in chainid-195.js
            // Additional RPCs can be added here
            {
                url: "http://localhost:8545",
                tracking: "none",
                trackingDetails: "Local Hardhat/Ganache node for testing"
            }
        ]
    }
};