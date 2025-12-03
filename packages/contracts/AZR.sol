// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

interface IERC20Mintable is IERC20 {
    function mint(address to, uint256 amount) external;
}

contract AZR is ERC20, Ownable, IERC20Mintable {
    mapping(address => uint256) public loans;
    uint256 public interestRate = 5;

    constructor(address initialOwner)
        ERC20("Azora", "AZR")
        Ownable(initialOwner)
    {}

    function mint(address to, uint256 amount) external onlyOwner {
        _mint(to, amount);
    }

    function burn(address from, uint256 amount) external onlyOwner {
        _burn(from, amount);
    }

    function mintLoan(address to, uint256 amount) external onlyOwner {
        _mint(to, amount);
        loans[to] += amount;
    }

    function repayLoan(uint256 amount) external {
        _burn(msg.sender, amount);
        loans[msg.sender] -= amount;
    }

    function getLoanDetails(address user) external view returns (uint256) {
        return loans[user];
    }
}