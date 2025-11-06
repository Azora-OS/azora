// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

interface IERC20Mintable is IERC20 {
    function mint(address to, uint256 amount) external;
}

contract AzoraSavingsVault {
    IERC20Mintable public azrToken;
    address public governance;
    uint256 public apyBasisPoints;
    mapping(address => uint256) public balances;

    struct Savings {
        uint256 amount;
        uint256 startTime;
    }

    mapping(address => Savings) public savings;

    event Deposited(address indexed user, uint256 amount);
    event Withdrawn(address indexed user, uint256 amount);
    event RewardClaimed(address indexed user, uint256 reward);

    modifier onlyGovernance() {
        require(msg.sender == governance, "only governance");
        _;
    }

    constructor(
        IERC20Mintable _azrToken,
        uint256 _apyBasisPoints,
        address _governance
    ) {
        azrToken = _azrToken;
        apyBasisPoints = _apyBasisPoints;
        governance = _governance;
    }

    function deposit(uint256 amount) external {
        require(amount > 0, "amount must be > 0");
        require(azrToken.transferFrom(msg.sender, address(this), amount), "transfer failed");
        balances[msg.sender] += amount;
        savings[msg.sender] = Savings(amount, block.timestamp);
        emit Deposited(msg.sender, amount);
    }

    function withdraw(uint256 amount) external {
        require(balances[msg.sender] >= amount, "insufficient balance");
        balances[msg.sender] -= amount;
        azrToken.mint(msg.sender, amount); // or transfer if already minted
        emit Withdrawn(msg.sender, amount);
    }

    function claimReward() external {
        Savings storage s = savings[msg.sender];
        require(s.amount > 0, "no savings");
        uint256 elapsed = block.timestamp - s.startTime;
        uint256 reward = (s.amount * apyBasisPoints * elapsed) / (10000 * 365 days);
        azrToken.mint(msg.sender, reward);
        s.startTime = block.timestamp; // reset start time
        emit RewardClaimed(msg.sender, reward);
    }

    function setApyBasisPoints(uint256 _apyBasisPoints) external onlyGovernance {
        apyBasisPoints = _apyBasisPoints;
    }

    function setGovernance(address _gov) external onlyGovernance {
        governance = _gov;
    }
}