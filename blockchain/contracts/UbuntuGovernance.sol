// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/governance/Governor.sol";
import "@openzeppelin/contracts/governance/extensions/GovernorSettings.sol";
import "@openzeppelin/contracts/governance/extensions/GovernorCountingSimple.sol";
import "@openzeppelin/contracts/governance/extensions/GovernorVotes.sol";
import "@openzeppelin/contracts/governance/extensions/GovernorVotesQuorumFraction.sol";

/**
 * @title Ubuntu Governance Contract
 * @dev Constitutional AI governance with Ubuntu principles
 * "We govern because we are governed together"
 */
contract UbuntuGovernance is 
    Governor, 
    GovernorSettings, 
    GovernorCountingSimple, 
    GovernorVotes, 
    GovernorVotesQuorumFraction 
{
    // Ubuntu Constitution Principles
    string[] public ubuntuPrinciples = [
        "My success enables your success",
        "My knowledge becomes our knowledge", 
        "My work strengthens our foundation",
        "My security ensures our freedom"
    ];
    
    mapping(uint256 => bool) public constitutionalCompliance;
    mapping(address => uint256) public ubuntuReputation;
    
    event ConstitutionalProposal(uint256 indexed proposalId, string principle);
    event UbuntuVote(address indexed voter, uint256 indexed proposalId, uint8 support);
    
    constructor(IVotes _token)
        Governor("Ubuntu Governance")
        GovernorSettings(1, 45818, 0) // 1 block, ~1 week, 0 proposal threshold
        GovernorVotes(_token)
        GovernorVotesQuorumFraction(4) // 4% quorum
    {}
    
    /**
     * @dev Ubuntu Constitutional Proposal
     * Must align with Ubuntu principles
     */
    function proposeUbuntu(
        address[] memory targets,
        uint256[] memory values,
        bytes[] memory calldatas,
        string memory description,
        uint8 principleIndex
    ) public returns (uint256) {
        require(principleIndex < ubuntuPrinciples.length, "Invalid principle");
        
        uint256 proposalId = propose(targets, values, calldatas, description);
        constitutionalCompliance[proposalId] = true;
        
        emit ConstitutionalProposal(proposalId, ubuntuPrinciples[principleIndex]);
        return proposalId;
    }
    
    /**
     * @dev Ubuntu Vote with Reputation
     * "We vote because we care together"
     */
    function castUbuntuVote(
        uint256 proposalId, 
        uint8 support
    ) public returns (uint256) {
        uint256 weight = castVote(proposalId, support);
        ubuntuReputation[msg.sender] += 1;
        
        emit UbuntuVote(msg.sender, proposalId, support);
        return weight;
    }
    
    // Required overrides
    function votingDelay() public view override(IGovernor, GovernorSettings) returns (uint256) {
        return super.votingDelay();
    }
    
    function votingPeriod() public view override(IGovernor, GovernorSettings) returns (uint256) {
        return super.votingPeriod();
    }
    
    function quorum(uint256 blockNumber) public view override(IGovernor, GovernorVotesQuorumFraction) returns (uint256) {
        return super.quorum(blockNumber);
    }
    
    function proposalThreshold() public view override(Governor, GovernorSettings) returns (uint256) {
        return super.proposalThreshold();
    }
}