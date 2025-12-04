// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title ProofOfValueRegistry
 * @dev Immutable registry of all value created within Azora OS.
 * Links off-chain contributions to on-chain rewards.
 */
contract ProofOfValueRegistry is Ownable {
    
    struct Contribution {
        string userId;          // Azora User ID
        string activityType;    // e.g., "COURSE_COMPLETION", "CODE_COMMIT"
        uint256 valueScore;     // Calculated value score
        uint256 azrMinted;      // Amount of AZR minted
        uint256 timestamp;      // When it happened
        string metadataIpfs;    // IPFS hash of detailed metadata
    }

    // Mapping from Proof ID to Contribution
    mapping(bytes32 => Contribution) public contributions;
    
    // Mapping from User ID to list of Proof IDs
    mapping(string => bytes32[]) public userContributions;

    event ContributionRecorded(
        bytes32 indexed proofId,
        string indexed userId,
        string activityType,
        uint256 valueScore,
        uint256 azrMinted
    );

    /**
     * @dev Record a new contribution.
     * Only authorized minters (Proof-of-Value Service) can call this.
     */
    function recordContribution(
        string memory _userId,
        string memory _activityType,
        uint256 _valueScore,
        uint256 _azrMinted,
        string memory _metadataIpfs
    ) external onlyOwner returns (bytes32) {
        bytes32 proofId = keccak256(
            abi.encodePacked(
                _userId,
                _activityType,
                _valueScore,
                block.timestamp,
                _metadataIpfs
            )
        );

        contributions[proofId] = Contribution({
            userId: _userId,
            activityType: _activityType,
            valueScore: _valueScore,
            azrMinted: _azrMinted,
            timestamp: block.timestamp,
            metadataIpfs: _metadataIpfs
        });

        userContributions[_userId].push(proofId);

        emit ContributionRecorded(
            proofId,
            _userId,
            _activityType,
            _valueScore,
            _azrMinted
        );

        return proofId;
    }

    /**
     * @dev Get contribution count for a user.
     */
    function getUserContributionCount(string memory _userId) external view returns (uint256) {
        return userContributions[_userId].length;
    }

    /**
     * @dev Verify if a proof exists and return its details.
     */
    function verifyProof(bytes32 _proofId) external view returns (
        string memory userId,
        string memory activityType,
        uint256 valueScore,
        uint256 timestamp
    ) {
        Contribution memory c = contributions[_proofId];
        require(c.timestamp != 0, "Proof not found");
        
        return (c.userId, c.activityType, c.valueScore, c.timestamp);
    }
}
