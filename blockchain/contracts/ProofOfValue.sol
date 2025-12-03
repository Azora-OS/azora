// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

interface IAZRToken {
    function ubuntuMine(address to, string memory proof, uint256 level) external;
    function rewardUbuntuContribution(address contributor, uint256 amount, string memory action) external;
}

contract ProofOfValue is Ownable {
    IAZRToken public azrToken;
    
    struct ValueProof {
        address creator;
        string contentHash;
        uint256 valueScore;
        uint256 timestamp;
        bool rewarded;
    }
    
    mapping(bytes32 => ValueProof) public proofs;
    mapping(address => uint256) public totalValue;
    mapping(address => bool) public validators;
    
    event ValueProofSubmitted(bytes32 indexed proofId, address indexed creator, uint256 valueScore);
    event ValueRewarded(bytes32 indexed proofId, address indexed creator, uint256 reward);
    
    constructor(address _azrToken) {
        azrToken = IAZRToken(_azrToken);
        validators[msg.sender] = true;
    }
    
    function submitProof(string memory contentHash, uint256 valueScore) external returns (bytes32) {
        require(valueScore > 0 && valueScore <= 100, "Invalid value score");
        
        bytes32 proofId = keccak256(abi.encodePacked(msg.sender, contentHash, block.timestamp));
        
        proofs[proofId] = ValueProof({
            creator: msg.sender,
            contentHash: contentHash,
            valueScore: valueScore,
            timestamp: block.timestamp,
            rewarded: false
        });
        
        emit ValueProofSubmitted(proofId, msg.sender, valueScore);
        return proofId;
    }
    
    function rewardValue(bytes32 proofId) external onlyValidator {
        ValueProof storage proof = proofs[proofId];
        require(proof.creator != address(0), "Proof not found");
        require(!proof.rewarded, "Already rewarded");
        
        proof.rewarded = true;
        totalValue[proof.creator] += proof.valueScore;
        
        azrToken.ubuntuMine(proof.creator, proof.contentHash, proof.valueScore);
        
        emit ValueRewarded(proofId, proof.creator, proof.valueScore);
    }
    
    function addValidator(address validator) external onlyOwner {
        validators[validator] = true;
    }
    
    modifier onlyValidator() {
        require(validators[msg.sender], "Not a validator");
        _;
    }
}
