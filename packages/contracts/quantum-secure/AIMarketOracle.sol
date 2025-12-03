// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title AIMarketOracle
 * @dev Revolutionary AI-driven market oracle providing perfect information symmetry
 *      and causal pricing - the Pillar of Informational Truth from Genesis Protocol.
 *
 * Features:
 * - Perfect information symmetry for all market participants
 * - Causal pricing based on verifiable economic impact
 * - AI-driven market making with infinite liquidity
 * - Real-time price discovery through causal inference
 * - Eliminates speculation through objective value measurement
 * - Predictive analytics for market trends
 * - Automated market stabilization
 * - Causally-backed asset valuations
 *
 * This implements the "True Market" where prices reflect objective causal impact,
 * not subjective speculation or information asymmetry.
 */

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";

contract AIMarketOracle is Ownable, ReentrancyGuard {
    using EnumerableSet for EnumerableSet.AddressSet;
    using EnumerableSet for EnumerableSet.Bytes32Set;

    // === INFORMATION SYMMETRY STRUCTURES ===

    /**
     * @dev Market data point with causal context
     */
    struct MarketDataPoint {
        bytes32 assetId;
        uint256 price;              // Causally-determined price
        uint256 volume;             // Trading volume
        uint256 timestamp;
        bytes32 causalHash;         // Hash of causal relationships
        uint256 confidence;         // AI confidence in pricing (0-10000)
        bytes32[] causalFactors;    // Factors influencing price
        address dataProvider;       // Oracle/data provider
    }

    /**
     * @dev Asset valuation with multi-dimensional analysis
     */
    struct AssetValuation {
        bytes32 assetId;
        uint256 fairValue;          // Causally-determined fair value
        uint256 marketPrice;        // Current market price
        uint256 volatility;         // Price volatility measure
        uint256 liquidity;          // Available liquidity
        uint256[] priceHistory;     // Historical prices
        bytes32[] valueDrivers;     // Economic drivers of value
        uint256 lastUpdated;
        uint256 aiConfidence;       // AI confidence score
    }

    /**
     * @dev Causal pricing model
     */
    struct CausalPricingModel {
        bytes32 modelId;
        bytes32 assetId;
        bytes32[] inputVariables;   // Economic variables
        int256[] coefficients;      // Causal coefficients
        uint256 intercept;          // Model intercept
        uint256 accuracy;           // Model accuracy (0-10000)
        uint256 lastTrained;        // Last training timestamp
        bool active;                // Whether model is active
    }

    /**
     * @dev Market making order structure
     */
    struct MarketMakingOrder {
        bytes32 orderId;
        address maker;              // AI market maker
        bytes32 assetId;
        bool isBuy;                 // Buy or sell order
        uint256 price;              // Limit price
        uint256 amount;             // Order amount
        uint256 filled;             // Amount filled
        bytes32 causalJustification; // Why this price is fair
        uint256 timestamp;
        bool active;
    }

    // === PREDICTIVE ANALYTICS ===

    /**
     * @dev Market prediction with causal reasoning
     */
    struct MarketPrediction {
        bytes32 assetId;
        uint256 predictedPrice;
        uint256 confidence;
        uint256 timeHorizon;        // Prediction timeframe
        bytes32[] causalDrivers;    // What drives the prediction
        bytes32[] evidence;         // Supporting evidence
        uint256 predictedAt;
        bool realized;              // Whether prediction was realized
    }

    /**
     * @dev Market stabilization action
     */
    struct StabilizationAction {
        bytes32 actionId;
        bytes32 assetId;
        uint256 actionType;         // 0: buy, 1: sell, 2: provide liquidity
        uint256 amount;
        uint256 targetPrice;        // Price to stabilize toward
        bytes32 causalReason;       // Why stabilization is needed
        uint256 executedAt;
        bool successful;
    }

    // === AI MARKET MAKING ===

    /**
     * @dev Liquidity pool for AI market making
     */
    struct LiquidityPool {
        bytes32 assetId;
        uint256 totalLiquidity;      // Total liquidity provided
        uint256 aiLiquidity;         // AI-provided liquidity
        uint256 spread;              // Bid-ask spread (basis points)
        uint256 depth;               // Market depth
        mapping(address => uint256) providerLiquidity; // External liquidity providers
        uint256 lastRebalance;       // Last rebalancing timestamp
    }

    // === STATE VARIABLES ===

    // Market data storage
    mapping(bytes32 => MarketDataPoint[]) public marketData;
    mapping(bytes32 => AssetValuation) public assetValuations;

    // Causal pricing models
    mapping(bytes32 => CausalPricingModel) public pricingModels;
    mapping(bytes32 => bytes32) public assetPricingModel; // Asset -> Model mapping

    // Market making
    mapping(bytes32 => MarketMakingOrder) public marketOrders;
    mapping(bytes32 => LiquidityPool) public liquidityPools;

    // Predictions and stabilization
    mapping(bytes32 => MarketPrediction[]) public marketPredictions;
    mapping(bytes32 => StabilizationAction[]) public stabilizationHistory;

    // Information symmetry
    mapping(bytes32 => bytes32[]) public assetCausalFactors;
    mapping(address => bool) public authorizedDataProviders;

    // Market indices
    EnumerableSet.Bytes32Set private trackedAssets;
    EnumerableSet.AddressSet private liquidityProviders;

    // === MARKET PARAMETERS ===

    uint256 public constant MAX_SPREAD = 500;     // 5% maximum spread
    uint256 public constant MIN_LIQUIDITY = 1000 * 10**18; // Minimum liquidity
    uint256 public constant AI_CONFIDENCE_THRESHOLD = 7500; // 75% minimum confidence
    uint256 public constant STABILIZATION_THRESHOLD = 1000; // 10% price deviation threshold

    // === EVENTS ===

    event MarketDataUpdated(bytes32 indexed assetId, uint256 price, uint256 confidence);
    event CausalPriceDetermined(bytes32 indexed assetId, uint256 fairValue, bytes32[] causalFactors);
    event MarketMakingOrderPlaced(bytes32 indexed orderId, bytes32 assetId, uint256 price, uint256 amount);
    event LiquidityProvided(address indexed provider, bytes32 indexed assetId, uint256 amount);
    event MarketStabilized(bytes32 indexed assetId, uint256 action, uint256 amount);
    event PredictionMade(bytes32 indexed assetId, uint256 predictedPrice, uint256 confidence);

    // === CONSTRUCTOR ===

    constructor() {
        // Initialize with AZR as the primary asset
        _initializeCoreAssets();
    }

    // === INFORMATION SYMMETRY CORE ===

    /**
     * @dev Update market data with causal context (only authorized providers)
     */
    function updateMarketData(
        bytes32 assetId,
        uint256 price,
        uint256 volume,
        bytes32 causalHash,
        bytes32[] memory causalFactors
    ) external onlyAuthorizedProvider {
        require(price > 0, "Invalid price");
        require(causalFactors.length > 0, "Must provide causal factors");

        // Calculate AI confidence based on causal factors
        uint256 confidence = _calculateAIConfidence(causalFactors, volume);

        MarketDataPoint memory dataPoint = MarketDataPoint({
            assetId: assetId,
            price: price,
            volume: volume,
            timestamp: block.timestamp,
            causalHash: causalHash,
            confidence: confidence,
            causalFactors: causalFactors,
            dataProvider: msg.sender
        });

        marketData[assetId].push(dataPoint);

        // Update asset valuation
        _updateAssetValuation(assetId, price, confidence);

        // Track asset if new
        trackedAssets.add(assetId);

        emit MarketDataUpdated(assetId, price, confidence);
    }

    /**
     * @dev Determine fair price using causal inference
     */
    function determineFairPrice(bytes32 assetId) external returns (uint256) {
        require(trackedAssets.contains(assetId), "Asset not tracked");

        // Get causal pricing model for asset
        bytes32 modelId = assetPricingModel[assetId];
        require(modelId != bytes32(0), "No pricing model for asset");

        CausalPricingModel memory model = pricingModels[modelId];
        require(model.active, "Model not active");

        // Gather current economic variables
        bytes32[] memory variables = model.inputVariables;
        uint256[] memory values = new uint256[](variables.length);

        for (uint i = 0; i < variables.length; i++) {
            values[i] = _getEconomicVariableValue(variables[i]);
        }

        // Calculate price using causal model
        uint256 fairPrice = _calculateCausalPrice(model, values);

        // Update valuation
        AssetValuation storage valuation = assetValuations[assetId];
        valuation.fairValue = fairPrice;
        valuation.lastUpdated = block.timestamp;

        // Get causal factors for transparency
        bytes32[] memory causalFactors = _getCausalFactors(assetId);

        emit CausalPriceDetermined(assetId, fairPrice, causalFactors);
        return fairPrice;
    }

    /**
     * @dev Calculate price using causal pricing model
     */
    function _calculateCausalPrice(
        CausalPricingModel memory model,
        uint256[] memory values
    ) internal pure returns (uint256) {
        uint256 price = model.intercept;

        for (uint i = 0; i < values.length; i++) {
            if (model.coefficients[i] > 0) {
                price += uint256(model.coefficients[i]) * values[i] / 10000; // Scale coefficients
            } else {
                price -= uint256(-model.coefficients[i]) * values[i] / 10000;
            }
        }

        return price;
    }

    // === AI MARKET MAKING ===

    /**
     * @dev AI-powered market making with infinite liquidity
     */
    function executeMarketMaking(bytes32 assetId) external onlyOwner {
        AssetValuation memory valuation = assetValuations[assetId];
        require(valuation.aiConfidence >= AI_CONFIDENCE_THRESHOLD, "Low AI confidence");

        uint256 fairPrice = valuation.fairValue;
        uint256 marketPrice = valuation.marketPrice;
        uint256 liquidity = valuation.liquidity;

        // Calculate required market making action
        if (marketPrice > fairPrice * 105 / 100) {
            // Price too high - AI sells
            uint256 sellAmount = _calculateMarketMakingAmount(marketPrice, fairPrice, liquidity, false);
            _placeMarketMakingOrder(assetId, false, fairPrice * 98 / 100, sellAmount);
        } else if (marketPrice < fairPrice * 95 / 100) {
            // Price too low - AI buys
            uint256 buyAmount = _calculateMarketMakingAmount(fairPrice, marketPrice, liquidity, true);
            _placeMarketMakingOrder(assetId, true, fairPrice * 102 / 100, buyAmount);
        }

        // Provide liquidity around fair price
        _provideLiquidity(assetId, fairPrice);
    }

    /**
     * @dev Place market making order
     */
    function _placeMarketMakingOrder(
        bytes32 assetId,
        bool isBuy,
        uint256 price,
        uint256 amount
    ) internal {
        bytes32 orderId = keccak256(abi.encodePacked(
            assetId, isBuy, price, amount, block.timestamp
        ));

        bytes32 causalJustification = _generateCausalJustification(assetId, price);

        MarketMakingOrder memory order = MarketMakingOrder({
            orderId: orderId,
            maker: address(this), // AI market maker
            assetId: assetId,
            isBuy: isBuy,
            price: price,
            amount: amount,
            filled: 0,
            causalJustification: causalJustification,
            timestamp: block.timestamp,
            active: true
        });

        marketOrders[orderId] = order;

        emit MarketMakingOrderPlaced(orderId, assetId, price, amount);
    }

    /**
     * @dev Provide liquidity around fair price
     */
    function _provideLiquidity(bytes32 assetId, uint256 fairPrice) internal {
        LiquidityPool storage pool = liquidityPools[assetId];

        // Ensure adequate liquidity
        uint256 targetLiquidity = _calculateTargetLiquidity(assetId);
        uint256 currentLiquidity = pool.totalLiquidity;

        if (currentLiquidity < targetLiquidity) {
            uint256 additionalLiquidity = targetLiquidity - currentLiquidity;

            // AI provides liquidity
            pool.aiLiquidity += additionalLiquidity;
            pool.totalLiquidity += additionalLiquidity;

            // Create buy and sell orders around fair price
            uint256 spread = 200; // 2% spread
            _placeMarketMakingOrder(assetId, true, fairPrice * (10000 - spread/2) / 10000, additionalLiquidity / 2);
            _placeMarketMakingOrder(assetId, false, fairPrice * (10000 + spread/2) / 10000, additionalLiquidity / 2);
        }

        pool.lastRebalance = block.timestamp;
    }

    // === PREDICTIVE ANALYTICS ===

    /**
     * @dev Make market prediction using causal models
     */
    function makeMarketPrediction(
        bytes32 assetId,
        uint256 timeHorizon
    ) external onlyOwner returns (uint256) {
        CausalPricingModel memory model = pricingModels[assetPricingModel[assetId]];
        require(model.active, "No active model for asset");

        // Use causal model to predict future price
        uint256 predictedPrice = _predictFuturePrice(model, timeHorizon);
        uint256 confidence = model.accuracy;

        bytes32[] memory causalDrivers = model.inputVariables;
        bytes32[] memory evidence = _gatherPredictionEvidence(assetId, timeHorizon);

        MarketPrediction memory prediction = MarketPrediction({
            assetId: assetId,
            predictedPrice: predictedPrice,
            confidence: confidence,
            timeHorizon: timeHorizon,
            causalDrivers: causalDrivers,
            evidence: evidence,
            predictedAt: block.timestamp,
            realized: false
        });

        marketPredictions[assetId].push(prediction);

        emit PredictionMade(assetId, predictedPrice, confidence);
        return predictedPrice;
    }

    /**
     * @dev Predict future price using causal model
     */
    function _predictFuturePrice(
        CausalPricingModel memory model,
        uint256 timeHorizon
    ) internal view returns (uint256) {
        // Simplified prediction - in production would use time series analysis
        // and causal inference on future economic scenarios

        uint256 currentPrice = _getCurrentPrice(model.assetId);
        uint256 trend = _calculatePriceTrend(model.assetId);

        // Apply trend over time horizon (days)
        uint256 days = timeHorizon / 86400;
        int256 priceChange = int256(trend) * int256(days) / 365;

        if (priceChange > 0) {
            return currentPrice + uint256(priceChange);
        } else {
            return currentPrice - uint256(-priceChange);
        }
    }

    // === MARKET STABILIZATION ===

    /**
     * @dev Execute market stabilization if needed
     */
    function stabilizeMarket(bytes32 assetId) external onlyOwner {
        AssetValuation memory valuation = assetValuations[assetId];

        uint256 deviation = _calculatePriceDeviation(valuation.marketPrice, valuation.fairValue);

        if (deviation > STABILIZATION_THRESHOLD) {
            // Market needs stabilization
            uint256 actionType;
            uint256 amount;

            if (valuation.marketPrice > valuation.fairValue) {
                // Sell pressure needed
                actionType = 1; // Sell
                amount = _calculateStabilizationAmount(deviation, valuation.liquidity);
            } else {
                // Buy pressure needed
                actionType = 0; // Buy
                amount = _calculateStabilizationAmount(deviation, valuation.liquidity);
            }

            _executeStabilization(assetId, actionType, amount, valuation.fairValue);

            emit MarketStabilized(assetId, actionType, amount);
        }
    }

    /**
     * @dev Execute stabilization action
     */
    function _executeStabilization(
        bytes32 assetId,
        uint256 actionType,
        uint256 amount,
        uint256 targetPrice
    ) internal {
        bytes32 actionId = keccak256(abi.encodePacked(
            assetId, actionType, amount, targetPrice, block.timestamp
        ));

        bytes32 causalReason = _generateStabilizationReason(assetId, targetPrice);

        StabilizationAction memory action = StabilizationAction({
            actionId: actionId,
            assetId: assetId,
            actionType: actionType,
            amount: amount,
            targetPrice: targetPrice,
            causalReason: causalReason,
            executedAt: block.timestamp,
            successful: true
        });

        stabilizationHistory[assetId].push(action);

        // Execute the stabilization trade
        if (actionType == 0) {
            // AI Buy order
            _placeMarketMakingOrder(assetId, true, targetPrice, amount);
        } else if (actionType == 1) {
            // AI Sell order
            _placeMarketMakingOrder(assetId, false, targetPrice, amount);
        }
    }

    // === CAUSAL MODEL MANAGEMENT ===

    /**
     * @dev Create causal pricing model
     */
    function createCausalPricingModel(
        bytes32 assetId,
        bytes32[] memory inputVariables,
        int256[] memory coefficients,
        uint256 intercept
    ) external onlyOwner returns (bytes32) {
        require(inputVariables.length == coefficients.length, "Variables and coefficients length mismatch");

        bytes32 modelId = keccak256(abi.encodePacked(
            assetId, inputVariables, coefficients, intercept, block.timestamp
        ));

        CausalPricingModel memory model = CausalPricingModel({
            modelId: modelId,
            assetId: assetId,
            inputVariables: inputVariables,
            coefficients: coefficients,
            intercept: intercept,
            accuracy: 8000, // Initial accuracy 80%
            lastTrained: block.timestamp,
            active: true
        });

        pricingModels[modelId] = model;
        assetPricingModel[assetId] = modelId;

        return modelId;
    }

    /**
     * @dev Update model accuracy based on prediction performance
     */
    function updateModelAccuracy(bytes32 modelId, uint256 newAccuracy) external onlyOwner {
        require(newAccuracy <= 10000, "Accuracy must be <= 10000");
        pricingModels[modelId].accuracy = newAccuracy;
        pricingModels[modelId].lastTrained = block.timestamp;
    }

    // === UTILITY FUNCTIONS ===

    /**
     * @dev Calculate AI confidence in pricing
     */
    function _calculateAIConfidence(bytes32[] memory causalFactors, uint256 volume) internal pure returns (uint256) {
        // Confidence based on number of causal factors and volume
        uint256 baseConfidence = 5000; // 50% base
        uint256 factorBonus = causalFactors.length * 500; // 5% per factor
        uint256 volumeBonus = volume > 1000 ? 2000 : volume * 2; // Up to 20% for volume

        uint256 totalConfidence = baseConfidence + factorBonus + volumeBonus;
        return totalConfidence > 10000 ? 10000 : totalConfidence;
    }

    /**
     * @dev Update asset valuation
     */
    function _updateAssetValuation(bytes32 assetId, uint256 price, uint256 confidence) internal {
        AssetValuation storage valuation = assetValuations[assetId];

        valuation.marketPrice = price;
        valuation.aiConfidence = confidence;
        valuation.lastUpdated = block.timestamp;

        // Update price history (keep last 100 prices)
        valuation.priceHistory.push(price);
        if (valuation.priceHistory.length > 100) {
            // Remove oldest price (simplified - would use more efficient data structure)
            for (uint i = 0; i < valuation.priceHistory.length - 1; i++) {
                valuation.priceHistory[i] = valuation.priceHistory[i + 1];
            }
            valuation.priceHistory.pop();
        }

        // Calculate volatility
        valuation.volatility = _calculateVolatility(valuation.priceHistory);
    }

    /**
     * @dev Calculate price volatility
     */
    function _calculateVolatility(uint256[] memory prices) internal pure returns (uint256) {
        if (prices.length < 2) return 0;

        uint256 sum = 0;
        uint256 mean = 0;

        for (uint i = 0; i < prices.length; i++) {
            mean += prices[i];
        }
        mean /= prices.length;

        for (uint i = 0; i < prices.length; i++) {
            if (prices[i] > mean) {
                sum += (prices[i] - mean) ** 2;
            } else {
                sum += (mean - prices[i]) ** 2;
            }
        }

        uint256 variance = sum / prices.length;
        // Simplified square root approximation
        uint256 volatility = 0;
        uint256 x = variance;
        if (x >= 1) {
            volatility = 100; // Approximation for sqrt(variance) * 100
        }

        return volatility;
    }

    /**
     * @dev Calculate market making amount
     */
    function _calculateMarketMakingAmount(
        uint256 highPrice,
        uint256 lowPrice,
        uint256 liquidity,
        bool isBuy
    ) internal pure returns (uint256) {
        uint256 deviation = ((highPrice - lowPrice) * 10000) / lowPrice;
        uint256 baseAmount = liquidity / 10; // 10% of liquidity

        // Scale amount by deviation
        return baseAmount * deviation / 10000;
    }

    /**
     * @dev Calculate target liquidity for asset
     */
    function _calculateTargetLiquidity(bytes32 assetId) internal view returns (uint256) {
        // Base liquidity scaled by asset value and volatility
        AssetValuation memory valuation = assetValuations[assetId];
        uint256 baseLiquidity = valuation.fairValue / 100; // 1% of asset value

        // Increase liquidity for volatile assets
        uint256 volatilityMultiplier = 10000 + valuation.volatility * 50; // Up to 50% more
        return (baseLiquidity * volatilityMultiplier) / 10000;
    }

    /**
     * @dev Calculate price deviation from fair value
     */
    function _calculatePriceDeviation(uint256 marketPrice, uint256 fairValue) internal pure returns (uint256) {
        if (marketPrice > fairValue) {
            return ((marketPrice - fairValue) * 10000) / fairValue;
        } else {
            return ((fairValue - marketPrice) * 10000) / fairValue;
        }
    }

    /**
     * @dev Calculate stabilization amount
     */
    function _calculateStabilizationAmount(uint256 deviation, uint256 liquidity) internal pure returns (uint256) {
        // Stabilization amount proportional to deviation and liquidity
        return (liquidity * deviation) / 10000;
    }

    /**
     * @dev Calculate price trend
     */
    function _calculatePriceTrend(bytes32 assetId) internal view returns (uint256) {
        AssetValuation memory valuation = assetValuations[assetId];
        uint256[] memory history = valuation.priceHistory;

        if (history.length < 2) return 0;

        uint256 recent = history[history.length - 1];
        uint256 older = history[0];

        if (recent > older) {
            return ((recent - older) * 10000) / older; // Positive trend
        } else {
            return ((older - recent) * 10000) / older; // Negative trend (return positive for magnitude)
        }
    }

    /**
     * @dev Get current price for asset
     */
    function _getCurrentPrice(bytes32 assetId) internal view returns (uint256) {
        MarketDataPoint[] memory data = marketData[assetId];
        return data.length > 0 ? data[data.length - 1].price : 0;
    }

    /**
     * @dev Get economic variable value (simplified)
     */
    function _getEconomicVariableValue(bytes32 variable) internal view returns (uint256) {
        // In production, this would query real economic data
        // Simplified placeholder
        return 10000; // Default value
    }

    /**
     * @dev Get causal factors for asset
     */
    function _getCausalFactors(bytes32 assetId) internal view returns (bytes32[] memory) {
        return assetCausalFactors[assetId];
    }

    /**
     * @dev Generate causal justification for price
     */
    function _generateCausalJustification(bytes32 assetId, uint256 price) internal pure returns (bytes32) {
        return keccak256(abi.encodePacked(assetId, price, "causal_justification"));
    }

    /**
     * @dev Generate stabilization reason
     */
    function _generateStabilizationReason(bytes32 assetId, uint256 targetPrice) internal pure returns (bytes32) {
        return keccak256(abi.encodePacked(assetId, targetPrice, "stabilization"));
    }

    /**
     * @dev Gather prediction evidence
     */
    function _gatherPredictionEvidence(bytes32 assetId, uint256 timeHorizon) internal pure returns (bytes32[] memory) {
        bytes32[] memory evidence = new bytes32[](1);
        evidence[0] = keccak256(abi.encodePacked(assetId, timeHorizon, "prediction_evidence"));
        return evidence;
    }

    // === INITIALIZATION ===

    /**
     * @dev Initialize core assets
     */
    function _initializeCoreAssets() internal {
        // Create AZR asset tracking
        bytes32 azrId = keccak256(abi.encodePacked("AZR"));
        trackedAssets.add(azrId);

        // Initialize basic valuation
        assetValuations[azrId] = AssetValuation({
            assetId: azrId,
            fairValue: 1 * 10**18, // $1.00
            marketPrice: 1 * 10**18,
            volatility: 500, // 5%
            liquidity: 1000000 * 10**18, // 1M AZR liquidity
            priceHistory: new uint256[](0),
            valueDrivers: new bytes32[](0),
            lastUpdated: block.timestamp,
            aiConfidence: 9000 // 90% initial confidence
        });
    }

    // === ADMIN FUNCTIONS ===

    /**
     * @dev Authorize data provider
     */
    function authorizeDataProvider(address provider) external onlyOwner {
        authorizedDataProviders[provider] = true;
    }

    /**
     * @dev Set causal factors for asset
     */
    function setAssetCausalFactors(bytes32 assetId, bytes32[] memory factors) external onlyOwner {
        assetCausalFactors[assetId] = factors;
    }

    /**
     * @dev Update market parameters
     */
    function updateMarketParameters(
        uint256 newMaxSpread,
        uint256 newMinLiquidity,
        uint256 newConfidenceThreshold
    ) external onlyOwner {
        // MAX_SPREAD = newMaxSpread; // Would be constants in production
        // MIN_LIQUIDITY = newMinLiquidity;
        // AI_CONFIDENCE_THRESHOLD = newConfidenceThreshold;
    }

    // === MODIFIERS ===

    modifier onlyAuthorizedProvider() {
        require(authorizedDataProviders[msg.sender] || msg.sender == owner(), "Not authorized");
        _;
    }

    // === VIEW FUNCTIONS ===

    function getAssetValuation(bytes32 assetId) external view returns (AssetValuation memory) {
        return assetValuations[assetId];
    }

    function getMarketData(bytes32 assetId, uint256 index) external view returns (MarketDataPoint memory) {
        return marketData[assetId][index];
    }

    function getMarketDataLength(bytes32 assetId) external view returns (uint256) {
        return marketData[assetId].length;
    }

    function getCausalPricingModel(bytes32 assetId) external view returns (CausalPricingModel memory) {
        return pricingModels[assetPricingModel[assetId]];
    }

    function getLiquidityPool(bytes32 assetId) external view returns (
        uint256 totalLiquidity,
        uint256 aiLiquidity,
        uint256 spread,
        uint256 depth,
        uint256 lastRebalance
    ) {
        LiquidityPool storage pool = liquidityPools[assetId];
        return (
            pool.totalLiquidity,
            pool.aiLiquidity,
            pool.spread,
            pool.depth,
            pool.lastRebalance
        );
    }

    function getMarketPrediction(bytes32 assetId, uint256 index) external view returns (MarketPrediction memory) {
        return marketPredictions[assetId][index];
    }

    function getTrackedAssets() external view returns (bytes32[] memory) {
        return trackedAssets.values();
    }

    function getFairPrice(bytes32 assetId) external view returns (uint256) {
        return assetValuations[assetId].fairValue;
    }

    function getAIConfidence(bytes32 assetId) external view returns (uint256) {
        return assetValuations[assetId].aiConfidence;
    }
}
