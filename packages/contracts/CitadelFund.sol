// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/**
 * @title CitadelFund
 * @dev Treasury contract for Azora OS that collects 10% of revenue
 * and allocates it transparently to scholarships, public goods, and grants.
 * "I am because we are" - Ubuntu in code.
 */
contract CitadelFund is Ownable, ReentrancyGuard {
    
    // Allocation percentages (in basis points, 100 = 1%)
    // Total must equal 10000 (100%)
    uint256 public constant ALLOCATION_PHYSICAL_INFRA   = 4000; // 40% (Citadel, Campuses, BuildSpaces)
    uint256 public constant ALLOCATION_SCHOLARSHIPS     = 3000; // 30%
    uint256 public constant ALLOCATION_PUBLIC_GOODS     = 2000; // 20%
    uint256 public constant ALLOCATION_GRANTS           = 1000; // 10%
    
    // Events for transparency
    event RevenueDeposited(address indexed source, uint256 amount, string reason);
    event FundsAllocated(string category, address indexed recipient, uint256 amount, string description);
    event EmergencyWithdrawal(address indexed token, uint256 amount);

    // Token being managed (AZR)
    IERC20 public azrToken;

    constructor(address _azrToken) {
        azrToken = IERC20(_azrToken);
    }

    /**
     * @dev Deposit revenue into the fund.
     * Ideally called by other contracts or the payment bridge.
     */
    function depositRevenue(uint256 amount, string memory reason) external nonReentrant {
        require(amount > 0, "Amount must be greater than 0");
        require(azrToken.transferFrom(msg.sender, address(this), amount), "Transfer failed");
        
        emit RevenueDeposited(msg.sender, amount, reason);
    }

    /**
     * @dev Allocate funds to a specific cause.
     * Only the owner (Governance/Multi-sig) can call this.
     */
    function allocateFunds(
        string memory category,
        address recipient,
        uint256 amount,
        string memory description
    ) external onlyOwner nonReentrant {
        require(amount > 0, "Amount must be greater than 0");
        require(azrToken.balanceOf(address(this)) >= amount, "Insufficient funds");
        
        // In a full implementation, we would check against category budgets here
        
        require(azrToken.transfer(recipient, amount), "Transfer failed");
        
        emit FundsAllocated(category, recipient, amount, description);
    }

    /**
     * @dev Update the AZR token address if needed (migration).
     */
    function setAzrToken(address _azrToken) external onlyOwner {
        azrToken = IERC20(_azrToken);
    }

    /**
     * @dev Emergency withdrawal of any ERC20 token.
     * To be used only in case of vulnerability or migration.
     */
    function emergencyWithdraw(address token, uint256 amount) external onlyOwner {
        IERC20(token).transfer(owner(), amount);
        emit EmergencyWithdrawal(token, amount);
    }
}
