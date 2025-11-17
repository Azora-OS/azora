// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title AZR Token - Ubuntu Prosperity Token
 * @dev Constitutional AI token with Ubuntu principles
 * "I prosper because we prosper together"
 */
contract AZRToken is ERC20, ERC20Burnable, Pausable, Ownable {
    uint256 public constant MAX_SUPPLY = 1000000000 * 10**18; // 1 billion AZR
    uint256 public constant INITIAL_SUPPLY = 100000000 * 10**18; // 100 million AZR
    
    // Ubuntu Mining Rewards
    uint256 public miningRewardRate = 10 * 10**18; // 10 AZR per knowledge proof
    uint256 public ubuntuMultiplier = 150; // 1.5x for Ubuntu actions (150/100)
    
    // Ubuntu Governance
    mapping(address => bool) public ubuntuValidators;
    mapping(address => uint256) public knowledgeScore;
    mapping(address => uint256) public ubuntuContributions;
    
    event UbuntuMining(address indexed miner, uint256 amount, string knowledgeProof);
    event UbuntuContribution(address indexed contributor, uint256 amount, string action);
    event ValidatorAdded(address indexed validator);
    
    constructor() ERC20("Azora Token", "AZR") {
        _mint(msg.sender, INITIAL_SUPPLY);
        ubuntuValidators[msg.sender] = true;
    }
    
    /**
     * @dev Ubuntu Mining - Proof of Knowledge
     * "My knowledge becomes our knowledge"
     */
    function ubuntuMine(
        address to, 
        string memory knowledgeProof,
        uint256 knowledgeLevel
    ) external onlyValidator {
        require(totalSupply() + miningRewardRate <= MAX_SUPPLY, "Max supply exceeded");
        
        uint256 reward = miningRewardRate;
        
        // Ubuntu bonus for high knowledge contribution
        if (knowledgeLevel >= 80) {
            reward = (reward * ubuntuMultiplier) / 100;
        }
        
        _mint(to, reward);
        knowledgeScore[to] += knowledgeLevel;
        
        emit UbuntuMining(to, reward, knowledgeProof);
    }
    
    /**
     * @dev Ubuntu Contribution Rewards
     * "My success enables your success"
     */
    function rewardUbuntuContribution(
        address contributor,
        uint256 amount,
        string memory action
    ) external onlyValidator {
        require(totalSupply() + amount <= MAX_SUPPLY, "Max supply exceeded");
        
        _mint(contributor, amount);
        ubuntuContributions[contributor] += amount;
        
        emit UbuntuContribution(contributor, amount, action);
    }
    
    /**
     * @dev Add Ubuntu Validator
     * "We validate because we trust together"
     */
    function addUbuntuValidator(address validator) external onlyOwner {
        ubuntuValidators[validator] = true;
        emit ValidatorAdded(validator);
    }
    
    modifier onlyValidator() {
        require(ubuntuValidators[msg.sender], "Not an Ubuntu validator");
        _;
    }
    
    function pause() public onlyOwner {
        _pause();
    }
    
    function unpause() public onlyOwner {
        _unpause();
    }
    
    function _beforeTokenTransfer(address from, address to, uint256 amount)
        internal
        whenNotPaused
        override
    {
        super._beforeTokenTransfer(from, to, amount);
    }
}