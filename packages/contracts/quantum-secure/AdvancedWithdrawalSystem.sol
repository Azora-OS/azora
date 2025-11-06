// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title AdvancedWithdrawalSystem
 * @dev Advanced withdrawal system with multiple methods for testing and real-world use
 *
 * Features:
 * - Instant withdrawals for testing
 * - Bank transfer integration
 * - Crypto exchange withdrawals
 * - Loan-backed withdrawals
 * - Multi-currency support
 * - Compliance and KYC integration
 * - Emergency withdrawal mechanisms
 *
 * This enables comprehensive testing of the withdrawal functionality.
 */

import "./QuantumSecureAZR.sol";
import "./BootstrapValueSystem.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract AdvancedWithdrawalSystem is Ownable, ReentrancyGuard {
    QuantumSecureAZR public immutable azrToken;
    BootstrapValueSystem public immutable bootstrapSystem;

    // Withdrawal methods
    enum WithdrawalMethod {
        INSTANT,           // Immediate AZR transfer for testing
        BANK_TRANSFER,     // Traditional bank transfer
        CRYPTO_EXCHANGE,   // Exchange to other cryptocurrencies
        LOAN_BACKED,       // Founder loan-backed withdrawal
        ESCROW,           // Escrow-based withdrawal
        MULTI_CURRENCY     // Convert to fiat currencies
    }

    // Withdrawal request structure
    struct WithdrawalRequest {
        uint256 id;
        address requester;
        uint256 amount;
        WithdrawalMethod method;
        string bankDetails;
        string currency;           // Target currency (USD, EUR, BTC, etc.)
        uint256 exchangeRate;      // Exchange rate for conversion
        uint256 fee;              // Withdrawal fee
        uint256 status;           // 0: pending, 1: processing, 2: completed, 3: failed
        uint256 requestedAt;
        uint256 completedAt;
        bytes32 txHash;           // Blockchain transaction hash
        string failureReason;     // If failed
    }

    // State variables
    mapping(uint256 => WithdrawalRequest) public withdrawalRequests;
    uint256 public nextWithdrawalId = 1;

    // Withdrawal fees (basis points)
    uint256 public instantFee = 50;      // 0.5% for instant
    uint256 public bankTransferFee = 200; // 2% for bank transfer
    uint256 public cryptoFee = 100;      // 1% for crypto exchange
    uint256 public loanBackedFee = 0;    // 0% for loan-backed (founder)

    // Exchange rates (simulated for testing)
    mapping(string => uint256) public exchangeRates; // Currency symbol => rate in USD

    // Compliance and limits
    mapping(address => uint256) public dailyWithdrawalLimit;
    mapping(address => uint256) public dailyWithdrawn;
    uint256 public defaultDailyLimit = 10000 * 10**18; // 10k AZR per day

    // KYC verification
    mapping(address => bool) public kycVerified;
    mapping(address => uint256) public kycLevel; // 0: none, 1: basic, 2: enhanced, 3: institutional

    // Events
    event WithdrawalRequested(
        uint256 indexed id,
        address indexed requester,
        uint256 amount,
        WithdrawalMethod method
    );
    event WithdrawalCompleted(
        uint256 indexed id,
        address indexed requester,
        uint256 amount,
        string currency
    );
    event WithdrawalFailed(
        uint256 indexed id,
        address indexed requester,
        string reason
    );
    event ExchangeRateUpdated(string currency, uint256 rate);
    event KYCUpdated(address indexed user, uint256 level);

    constructor(
        address _azrToken,
        address _bootstrapSystem
    ) {
        azrToken = QuantumSecureAZR(_azrToken);
        bootstrapSystem = BootstrapValueSystem(_bootstrapSystem);

        // Initialize exchange rates for testing
        _initializeExchangeRates();

        // Set founder as fully verified
        kycVerified[bootstrapSystem.founderAddress()] = true;
        kycLevel[bootstrapSystem.founderAddress()] = 3; // Institutional level
    }

    // === WITHDRAWAL REQUEST SYSTEM ===

    /**
     * @dev Request a withdrawal with specified method
     */
    function requestWithdrawal(
        uint256 amount,
        WithdrawalMethod method,
        string memory bankDetails,
        string memory targetCurrency
    ) external nonReentrant returns (uint256) {
        require(amount > 0, "Invalid amount");
        require(azrToken.balanceOf(msg.sender) >= amount, "Insufficient balance");
        require(bootstrapSystem.canWithdraw(msg.sender, amount), "System cannot support withdrawal");

        // Check daily limits
        _checkDailyLimits(msg.sender, amount);

        // Check KYC requirements
        _checkKYCRequirements(msg.sender, method, amount);

        // Calculate fees
        uint256 fee = _calculateFee(amount, method);
        uint256 totalAmount = amount + fee;

        require(azrToken.balanceOf(msg.sender) >= totalAmount, "Insufficient balance for fees");

        // Create withdrawal request
        uint256 requestId = nextWithdrawalId++;
        uint256 exchangeRate = exchangeRates[targetCurrency];

        withdrawalRequests[requestId] = WithdrawalRequest({
            id: requestId,
            requester: msg.sender,
            amount: amount,
            method: method,
            bankDetails: bankDetails,
            currency: targetCurrency,
            exchangeRate: exchangeRate,
            fee: fee,
            status: 0, // pending
            requestedAt: block.timestamp,
            completedAt: 0,
            txHash: bytes32(0),
            failureReason: ""
        });

        // Update daily withdrawn
        dailyWithdrawn[msg.sender] += amount;

        emit WithdrawalRequested(requestId, msg.sender, amount, method);

        // Process withdrawal immediately for testing
        _processWithdrawal(requestId);

        return requestId;
    }

    /**
     * @dev Process withdrawal (internal function)
     */
    function _processWithdrawal(uint256 requestId) internal {
        WithdrawalRequest storage request = withdrawalRequests[requestId];
        require(request.status == 0, "Request not pending");

        request.status = 1; // processing

        try this._executeWithdrawal(requestId) {
            // Success - mark as completed
            request.status = 2; // completed
            request.completedAt = block.timestamp;
            request.txHash = keccak256(abi.encodePacked(requestId, block.timestamp));

            emit WithdrawalCompleted(
                requestId,
                request.requester,
                request.amount,
                request.currency
            );
        } catch Error(string memory reason) {
            // Failure
            request.status = 3; // failed
            request.failureReason = reason;

            emit WithdrawalFailed(requestId, request.requester, reason);
        }
    }

    /**
     * @dev Execute the actual withdrawal
     */
    function _executeWithdrawal(uint256 requestId) external {
        require(msg.sender == address(this), "Only self-call allowed");

        WithdrawalRequest storage request = withdrawalRequests[requestId];
        uint256 totalAmount = request.amount + request.fee;

        // Transfer AZR tokens to system for processing
        require(
            azrToken.transferFrom(request.requester, address(this), totalAmount),
            "Transfer failed"
        );

        // Process based on method
        if (request.method == WithdrawalMethod.INSTANT) {
            _executeInstantWithdrawal(request);
        } else if (request.method == WithdrawalMethod.BANK_TRANSFER) {
            _executeBankTransfer(request);
        } else if (request.method == WithdrawalMethod.CRYPTO_EXCHANGE) {
            _executeCryptoExchange(request);
        } else if (request.method == WithdrawalMethod.LOAN_BACKED) {
            _executeLoanBackedWithdrawal(request);
        } else if (request.method == WithdrawalMethod.ESCROW) {
            _executeEscrowWithdrawal(request);
        } else if (request.method == WithdrawalMethod.MULTI_CURRENCY) {
            _executeMultiCurrencyWithdrawal(request);
        }

        // Generate additional value to maintain system backing
        bootstrapSystem.generateDailyGuaranteedValue();
    }

    // === WITHDRAWAL METHOD IMPLEMENTATIONS ===

    /**
     * @dev Execute instant withdrawal (for testing)
     */
    function _executeInstantWithdrawal(WithdrawalRequest memory request) internal {
        // For instant withdrawals, just burn the fee and return AZR
        // In production, this would credit user's wallet immediately

        // Burn the fee
        if (request.fee > 0) {
            azrToken.transfer(address(0), request.fee);
        }

        // Return AZR to user (simulating instant availability)
        azrToken.transfer(request.requester, request.amount);
    }

    /**
     * @dev Execute bank transfer withdrawal
     */
    function _executeBankTransfer(WithdrawalRequest memory request) internal {
        require(bytes(request.bankDetails).length > 0, "Bank details required");

        // Simulate bank transfer processing
        // In production, this would integrate with banking APIs

        // Burn fee
        if (request.fee > 0) {
            azrToken.transfer(address(0), request.fee);
        }

        // Convert to target currency and simulate transfer
        uint256 fiatAmount = (request.amount * request.exchangeRate) / 10**18;

        // Simulate successful bank transfer
        // In production: integrate with banking rails (SWIFT, SEPA, etc.)

        // For testing: credit bootstrap system (simulates bank account)
        azrToken.transfer(address(bootstrapSystem), request.amount);
    }

    /**
     * @dev Execute crypto exchange withdrawal
     */
    function _executeCryptoExchange(WithdrawalRequest memory request) internal {
        // Simulate exchange to other cryptocurrency

        // Burn fee
        if (request.fee > 0) {
            azrToken.transfer(address(0), request.fee);
        }

        // Simulate exchange process
        // In production: integrate with exchanges (Binance, Coinbase, etc.)

        // For testing: convert and credit
        azrToken.transfer(address(bootstrapSystem), request.amount);
    }

    /**
     * @dev Execute loan-backed withdrawal (founder only)
     */
    function _executeLoanBackedWithdrawal(WithdrawalRequest memory request) internal {
        require(request.requester == bootstrapSystem.founderAddress(), "Only founder can use loan-backed");

        // No fees for founder loan-backed withdrawals
        // This increases the founder loan amount

        bootstrapSystem.extractValueForBusinessGrowth(request.amount);
    }

    /**
     * @dev Execute escrow withdrawal
     */
    function _executeEscrowWithdrawal(WithdrawalRequest memory request) internal {
        // Use escrow system for delayed but guaranteed withdrawal

        // Burn fee
        if (request.fee > 0) {
            azrToken.transfer(address(0), request.fee);
        }

        // Hold in escrow (would integrate with Redemption contract)
        // For testing: immediate release
        azrToken.transfer(request.requester, request.amount);
    }

    /**
     * @dev Execute multi-currency withdrawal
     */
    function _executeMultiCurrencyWithdrawal(WithdrawalRequest memory request) internal {
        require(request.exchangeRate > 0, "Invalid exchange rate");

        // Burn fee
        if (request.fee > 0) {
            azrToken.transfer(address(0), request.fee);
        }

        // Convert to target currency
        uint256 convertedAmount = (request.amount * request.exchangeRate) / 10**18;

        // Simulate currency conversion and transfer
        // In production: integrate with forex services

        azrToken.transfer(address(bootstrapSystem), request.amount);
    }

    // === TESTING AND UTILITY FUNCTIONS ===

    /**
     * @dev Test all withdrawal methods (for comprehensive testing)
     */
    function testAllWithdrawalMethods(uint256 amount) external returns (uint256[] memory) {
        uint256[] memory requestIds = new uint256[](6);

        // Test instant withdrawal
        requestIds[0] = this.requestWithdrawal(amount, WithdrawalMethod.INSTANT, "", "AZR");

        // Test bank transfer
        requestIds[1] = this.requestWithdrawal(amount, WithdrawalMethod.BANK_TRANSFER, "Bank: ABC, Account: 123456", "USD");

        // Test crypto exchange
        requestIds[2] = this.requestWithdrawal(amount, WithdrawalMethod.CRYPTO_EXCHANGE, "binance", "BTC");

        // Test escrow
        requestIds[3] = this.requestWithdrawal(amount, WithdrawalMethod.ESCROW, "escrow_id_123", "AZR");

        // Test multi-currency
        requestIds[4] = this.requestWithdrawal(amount, WithdrawalMethod.MULTI_CURRENCY, "", "EUR");

        // Test loan-backed (founder only)
        if (msg.sender == bootstrapSystem.founderAddress()) {
            requestIds[5] = this.requestWithdrawal(amount, WithdrawalMethod.LOAN_BACKED, "", "AZR");
        }

        return requestIds;
    }

    /**
     * @dev Emergency withdrawal for testing critical scenarios
     */
    function emergencyWithdrawal(uint256 amount, string memory reason) external {
        require(kycLevel[msg.sender] >= 2, "Enhanced KYC required for emergency withdrawal");

        // Check if emergency conditions are met
        bool isEmergency = _checkEmergencyConditions(msg.sender, amount);

        if (isEmergency) {
            // Allow emergency withdrawal with minimal fees
            azrToken.transfer(msg.sender, amount);

            emit WithdrawalRequested(
                uint256(keccak256(abi.encodePacked("emergency", msg.sender, block.timestamp))),
                msg.sender,
                amount,
                WithdrawalMethod.INSTANT
            );
        }
    }

    // === COMPLIANCE AND LIMITS ===

    /**
     * @dev Check daily withdrawal limits
     */
    function _checkDailyLimits(address user, uint256 amount) internal {
        uint256 userLimit = dailyWithdrawalLimit[user];
        if (userLimit == 0) {
            userLimit = defaultDailyLimit;
        }

        require(dailyWithdrawn[user] + amount <= userLimit, "Daily limit exceeded");
    }

    /**
     * @dev Check KYC requirements for withdrawal method
     */
    function _checkKYCRequirements(address user, WithdrawalMethod method, uint256 amount) internal view {
        if (method == WithdrawalMethod.INSTANT && amount > 1000 * 10**18) {
            require(kycLevel[user] >= 1, "Basic KYC required for large instant withdrawals");
        }

        if (method == WithdrawalMethod.BANK_TRANSFER) {
            require(kycLevel[user] >= 2, "Enhanced KYC required for bank transfers");
        }

        if (method == WithdrawalMethod.LOAN_BACKED) {
            require(user == bootstrapSystem.founderAddress(), "Only founder can use loan-backed");
        }
    }

    /**
     * @dev Calculate withdrawal fee
     */
    function _calculateFee(uint256 amount, WithdrawalMethod method) internal view returns (uint256) {
        uint256 feeRate;

        if (method == WithdrawalMethod.INSTANT) {
            feeRate = instantFee;
        } else if (method == WithdrawalMethod.BANK_TRANSFER) {
            feeRate = bankTransferFee;
        } else if (method == WithdrawalMethod.CRYPTO_EXCHANGE) {
            feeRate = cryptoFee;
        } else if (method == WithdrawalMethod.LOAN_BACKED) {
            feeRate = loanBackedFee;
        } else {
            feeRate = instantFee; // Default
        }

        return (amount * feeRate) / 10000;
    }

    /**
     * @dev Check emergency withdrawal conditions
     */
    function _checkEmergencyConditions(address user, uint256 amount) internal view returns (bool) {
        // Emergency conditions for testing:
        // 1. High KYC level
        // 2. Reasonable amount
        // 3. System has sufficient liquidity

        return kycLevel[user] >= 2 &&
               amount <= 5000 * 10**18 &&
               bootstrapSystem.canWithdraw(user, amount);
    }

    // === ADMIN FUNCTIONS ===

    /**
     * @dev Update exchange rates for testing
     */
    function updateExchangeRate(string memory currency, uint256 rate) external onlyOwner {
        exchangeRates[currency] = rate;
        emit ExchangeRateUpdated(currency, rate);
    }

    /**
     * @dev Set user KYC level
     */
    function setKYCLevel(address user, uint256 level) external onlyOwner {
        require(level <= 3, "Invalid KYC level");
        kycVerified[user] = level > 0;
        kycLevel[user] = level;
        emit KYCUpdated(user, level);
    }

    /**
     * @dev Set daily withdrawal limit for user
     */
    function setDailyLimit(address user, uint256 limit) external onlyOwner {
        dailyWithdrawalLimit[user] = limit;
    }

    /**
     * @dev Update withdrawal fees
     */
    function updateFees(
        uint256 _instantFee,
        uint256 _bankTransferFee,
        uint256 _cryptoFee,
        uint256 _loanBackedFee
    ) external onlyOwner {
        instantFee = _instantFee;
        bankTransferFee = _bankTransferFee;
        cryptoFee = _cryptoFee;
        loanBackedFee = _loanBackedFee;
    }

    /**
     * @dev Reset daily withdrawal counters (for testing)
     */
    function resetDailyWithdrawals(address user) external onlyOwner {
        dailyWithdrawn[user] = 0;
    }

    // === INITIALIZATION ===

    /**
     * @dev Initialize exchange rates for testing
     */
    function _initializeExchangeRates() internal {
        exchangeRates["AZR"] = 1 * 10**18;     // 1 AZR = $1
        exchangeRates["USD"] = 1 * 10**18;     // 1 USD = $1
        exchangeRates["EUR"] = 11 * 10**17;    // 1 EUR = $1.10
        exchangeRates["GBP"] = 12 * 10**17;    // 1 GBP = $1.20
        exchangeRates["BTC"] = 30000 * 10**18; // 1 BTC = $30,000
        exchangeRates["ETH"] = 2000 * 10**18;  // 1 ETH = $2,000
    }

    // === VIEW FUNCTIONS ===

    function getWithdrawalRequest(uint256 requestId) external view returns (
        uint256 id,
        address requester,
        uint256 amount,
        WithdrawalMethod method,
        string memory currency,
        uint256 fee,
        uint256 status,
        uint256 requestedAt,
        uint256 completedAt
    ) {
        WithdrawalRequest memory request = withdrawalRequests[requestId];
        return (
            request.id,
            request.requester,
            request.amount,
            request.method,
            request.currency,
            request.fee,
            request.status,
            request.requestedAt,
            request.completedAt
        );
    }

    function getExchangeRate(string memory currency) external view returns (uint256) {
        return exchangeRates[currency];
    }

    function getUserWithdrawalStats(address user) external view returns (
        uint256 dailyLimit,
        uint256 dailyWithdrawn_,
        bool kycVerified_,
        uint256 kycLevel_
    ) {
        uint256 userLimit = dailyWithdrawalLimit[user];
        if (userLimit == 0) {
            userLimit = defaultDailyLimit;
        }

        return (
            userLimit,
            dailyWithdrawn[user],
            kycVerified[user],
            kycLevel[user]
        );
    }

    function calculateWithdrawalFee(uint256 amount, WithdrawalMethod method) external view returns (uint256) {
        return _calculateFee(amount, method);
    }

    function canUserWithdraw(address user, uint256 amount, WithdrawalMethod method) external view returns (bool) {
        if (!kycVerified[user]) return false;
        if (!bootstrapSystem.canWithdraw(user, amount)) return false;

        uint256 userLimit = dailyWithdrawalLimit[user];
        if (userLimit == 0) {
            userLimit = defaultDailyLimit;
        }

        if (dailyWithdrawn[user] + amount > userLimit) return false;

        return true;
    }
}
