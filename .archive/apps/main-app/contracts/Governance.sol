pragma solidity ^0.8.0;
contract Governance {
    struct Proposal {
        uint256 id;
        string description;
        uint256 voteCount;
        bool executed;
    }
    mapping(uint256 => Proposal) public proposals;
    uint256 public proposalCount;
    function createProposal(string memory description) public {
        proposalCount++;
        proposals[proposalCount] = Proposal(proposalCount, description, 0, false);
    }
    function vote(uint256 proposalId) public {
        proposals[proposalId].voteCount++;
    }
    function executeProposal(uint256 proposalId) public {
        require(proposals[proposalId].voteCount > 100, "Not enough votes");
        proposals[proposalId].executed = true;
    }
}
