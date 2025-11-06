// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

/**
 * @title AzoraCoin
 * @dev Implementation of the Azora Coin with mining rewards and ecosystem features
 */
contract AzoraCoin is ERC20, AccessControl, Pausable {
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");
    bytes32 public constant REWARD_MINTER_ROLE = keccak256("REWARD_MINTER_ROLE");

    uint256 public constant MAX_SUPPLY = 1000000 * 10**18; // 1 million tokens with 18 decimals

    // Mining reward tracking
    mapping(address => uint256) public mintedPerUser;
    uint256 public totalMintedRewards;

    // Events
    event RewardMinted(address indexed to, uint256 amount, string reason);
    event MiningRewardDistributed(address indexed miner, uint256 amount, uint256 usdValue);

    constructor(address admin) ERC20("Azora Coin", "AZR") {
        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(MINTER_ROLE, admin);
        _grantRole(PAUSER_ROLE, admin);
        _grantRole(REWARD_MINTER_ROLE, admin);
    }

    /**
     * @dev Mint tokens (admin only)
     */
    function mint(address to, uint256 amount) public onlyRole(MINTER_ROLE) {
        require(totalSupply() + amount <= MAX_SUPPLY, "AzoraCoin: exceeds max supply");
        _mint(to, amount);
    }

    /**
     * @dev Mint reward tokens for mining earnings
     * @param to Address to receive the reward
     * @param amount Amount of tokens to mint
     */
    function mintReward(address to, uint256 amount) public onlyRole(REWARD_MINTER_ROLE) {
        require(totalSupply() + amount <= MAX_SUPPLY, "AzoraCoin: exceeds max supply");
        require(to != address(0), "AzoraCoin: cannot mint to zero address");

        _mint(to, amount);
        mintedPerUser[to] += amount;
        totalMintedRewards += amount;

        emit RewardMinted(to, amount, "Mining reward");
    }

    /**
     * @dev Mint reward tokens with reason (for tracking)
     * @param to Address to receive the reward
     * @param amount Amount of tokens to mint
     * @param reason Reason for the reward
     */
    function mintRewardWithReason(address to, uint256 amount, string memory reason) public onlyRole(REWARD_MINTER_ROLE) {
        require(totalSupply() + amount <= MAX_SUPPLY, "AzoraCoin: exceeds max supply");
        require(to != address(0), "AzoraCoin: cannot mint to zero address");

        _mint(to, amount);
        mintedPerUser[to] += amount;
        totalMintedRewards += amount;

        emit RewardMinted(to, amount, reason);
    }

    /**
     * @dev Get total supply (override for clarity)
     */
    function totalSupply() public view override returns (uint256) {
        return super.totalSupply();
    }

    /**
     * @dev Get max supply
     */
    function MAX_SUPPLY() public pure returns (uint256) {
        return 1000000 * 10**18;
    }

    /**
     * @dev Get minted rewards for a user
     */
    function getMintedPerUser(address user) public view returns (uint256) {
        return mintedPerUser[user];
    }

    /**
     * @dev Get total minted rewards
     */
    function getTotalMintedRewards() public view returns (uint256) {
        return totalMintedRewards;
    }

    /**
     * @dev Pause token transfers
     */
    function pause() public onlyRole(PAUSER_ROLE) {
        _pause();
    }

    /**
     * @dev Unpause token transfers
     */
    function unpause() public onlyRole(PAUSER_ROLE) {
        _unpause();
    }

    /**
     * @dev Hook that is called before any transfer of tokens
     */
    function _beforeTokenTransfer(address from, address to, uint256 amount)
        internal
        whenNotPaused
        override
    {
        super._beforeTokenTransfer(from, to, amount);
    }

    /**
     * @dev Burn tokens (if needed for deflationary mechanisms)
     */
    function burn(uint256 amount) public {
        _burn(_msgSender(), amount);
    }

    /**
     * @dev Burn tokens from a specific address (admin only)
     */
    function burnFrom(address account, uint256 amount) public onlyRole(MINTER_ROLE) {
        _burn(account, amount);
    }
}
