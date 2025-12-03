// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

interface IAZRToken {
    function transfer(address to, uint256 amount) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
}

contract CitadelFund is Ownable, ReentrancyGuard {
    IAZRToken public azrToken;
    
    uint256 public constant CITADEL_PERCENTAGE = 10;
    uint256 public totalCollected;
    uint256 public totalDistributed;
    
    struct Grant {
        address recipient;
        uint256 amount;
        string purpose;
        uint256 timestamp;
    }
    
    Grant[] public grants;
    mapping(address => uint256) public scholarships;
    
    event RevenueCollected(address indexed from, uint256 amount, string source);
    event ScholarshipGranted(address indexed student, uint256 amount);
    event GrantDistributed(address indexed recipient, uint256 amount, string purpose);
    
    constructor(address _azrToken) {
        azrToken = IAZRToken(_azrToken);
    }
    
    function collectRevenue(uint256 amount, string memory source) external nonReentrant {
        require(amount > 0, "Amount must be positive");
        require(azrToken.transfer(address(this), amount), "Transfer failed");
        
        totalCollected += amount;
        emit RevenueCollected(msg.sender, amount, source);
    }
    
    function grantScholarship(address student, uint256 amount) external onlyOwner nonReentrant {
        require(amount <= azrToken.balanceOf(address(this)), "Insufficient funds");
        require(azrToken.transfer(student, amount), "Transfer failed");
        
        scholarships[student] += amount;
        totalDistributed += amount;
        emit ScholarshipGranted(student, amount);
    }
    
    function distributeGrant(address recipient, uint256 amount, string memory purpose) external onlyOwner nonReentrant {
        require(amount <= azrToken.balanceOf(address(this)), "Insufficient funds");
        require(azrToken.transfer(recipient, amount), "Transfer failed");
        
        grants.push(Grant({
            recipient: recipient,
            amount: amount,
            purpose: purpose,
            timestamp: block.timestamp
        }));
        
        totalDistributed += amount;
        emit GrantDistributed(recipient, amount, purpose);
    }
    
    function getBalance() external view returns (uint256) {
        return azrToken.balanceOf(address(this));
    }
    
    function getGrantCount() external view returns (uint256) {
        return grants.length;
    }
}
