// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract Staking is Ownable {
    IERC20 public token;
    uint256 public rewardRate = 10; // 10% APY
    
    struct Stake {
        uint256 amount;
        uint256 timestamp;
    }
    
    mapping(address => Stake) public stakes;
    
    constructor(address _token) {
        token = IERC20(_token);
    }
    
    function stake(uint256 amount) external {
        require(amount > 0, "Amount must be > 0");
        token.transferFrom(msg.sender, address(this), amount);
        stakes[msg.sender] = Stake(amount, block.timestamp);
    }
    
    function unstake() external {
        Stake memory userStake = stakes[msg.sender];
        require(userStake.amount > 0, "No stake");
        uint256 reward = (userStake.amount * rewardRate * (block.timestamp - userStake.timestamp)) / (365 days * 100);
        delete stakes[msg.sender];
        token.transfer(msg.sender, userStake.amount + reward);
    }
}
