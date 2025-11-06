// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title Redemption Contract
 * @dev Escrow contract for AZR token redemption to fiat currency
 * @notice This contract holds AZR tokens in escrow until bank transfer is confirmed
 */
contract Redemption {
    // AZR token contract
    IERC20 public immutable azrToken;

    // Admin (Gnosis Safe)
    address public immutable admin;

    // Treasury address for completed redemptions
    address public treasury;

    // Redemption request structure
    struct RedemptionRequest {
        address requester;
        uint256 amount;
        string bankDetails;
        uint256 requestedAt;
        bool completed;
        string bankRef;
        address completedTreasury;
    }

    // Redemption requests mapping
    mapping(uint256 => RedemptionRequest) public redemptions;

    // Next redemption ID
    uint256 public nextRedemptionId = 1;

    // Events
    event RedeemRequested(uint256 indexed id, address indexed requester, uint256 amount, string bankDetails);
    event RedeemCompleted(uint256 indexed id, address indexed treasury, string bankRef);

    // Modifiers
    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin can call this function");
        _;
    }

    /**
     * @dev Constructor
     * @param _azrToken Address of the AZR token contract
     * @param _admin Address of the admin (Gnosis Safe)
     */
    constructor(address _azrToken, address _admin) {
        require(_azrToken != address(0), "Invalid AZR token address");
        require(_admin != address(0), "Invalid admin address");

        azrToken = IERC20(_azrToken);
        admin = _admin;
    }

    /**
     * @dev Request a redemption (escrow AZR tokens)
     * @param amount Amount of AZR to redeem
     * @param bankDetails Bank details or invoice ID for payout
     */
    function requestRedeem(uint256 amount, string calldata bankDetails) external {
        require(amount > 0, "Amount must be greater than 0");
        require(bytes(bankDetails).length > 0, "Bank details required");

        // Transfer AZR tokens to this contract
        require(azrToken.transferFrom(msg.sender, address(this), amount), "Transfer failed");

        uint256 redemptionId = nextRedemptionId++;

        redemptions[redemptionId] = RedemptionRequest({
            requester: msg.sender,
            amount: amount,
            bankDetails: bankDetails,
            requestedAt: block.timestamp,
            completed: false,
            bankRef: "",
            completedTreasury: address(0)
        });

        emit RedeemRequested(redemptionId, msg.sender, amount, bankDetails);
    }

    /**
     * @dev Complete a redemption (transfer tokens to treasury)
     * @param id Redemption request ID
     * @param _treasury Treasury address to receive the tokens
     * @param bankRef Bank reference for the completed payment
     */
    function completeRedeem(uint256 id, address _treasury, string calldata bankRef) external onlyAdmin {
        require(_treasury != address(0), "Invalid treasury address");
        require(bytes(bankRef).length > 0, "Bank reference required");

        RedemptionRequest storage request = redemptions[id];
        require(request.requester != address(0), "Redemption request not found");
        require(!request.completed, "Redemption already completed");

        // Mark as completed
        request.completed = true;
        request.bankRef = bankRef;
        request.completedTreasury = _treasury;

        // Transfer AZR tokens to treasury
        require(azrToken.transfer(_treasury, request.amount), "Transfer to treasury failed");

        emit RedeemCompleted(id, _treasury, bankRef);
    }

    /**
     * @dev Get redemption request details
     * @param id Redemption request ID
     */
    function getRedemption(uint256 id) external view returns (
        address requester,
        uint256 amount,
        string memory bankDetails,
        uint256 requestedAt,
        bool completed,
        string memory bankRef,
        address completedTreasury
    ) {
        RedemptionRequest memory request = redemptions[id];
        return (
            request.requester,
            request.amount,
            request.bankDetails,
            request.requestedAt,
            request.completed,
            request.bankRef,
            request.completedTreasury
        );
    }

    /**
     * @dev Emergency function to update treasury address (only admin)
     * @param _treasury New treasury address
     */
    function setTreasury(address _treasury) external onlyAdmin {
        require(_treasury != address(0), "Invalid treasury address");
        treasury = _treasury;
    }
}

// ERC20 interface
interface IERC20 {
    function transfer(address to, uint256 amount) external returns (bool);
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
    function approve(address spender, uint256 amount) external returns (bool);
}