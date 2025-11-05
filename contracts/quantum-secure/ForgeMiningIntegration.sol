// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title ForgeMiningIntegration
 * @dev Revolutionary integration where mining directly funds and expands real-world productive capacity
 *
 * Features:
 * - Mining rewards fund Forge infrastructure expansion
 * - Miners choose which productive assets to fund (energy, manufacturing, agriculture)
 * - Direct correlation between mining power and real economic output
 * - Mining difficulty adjusts based on Forge productivity targets
 * - Token value backed by tangible productive capacity
 * - Sustainable mining that creates real wealth, not just inflation
 *
 * This transforms mining from a wasteful proof-of-work into a productive
 * force for economic development and human flourishing.
 */

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";

contract ForgeMiningIntegration is Ownable, ReentrancyGuard {
    using EnumerableSet for EnumerableSet.AddressSet;
    using EnumerableSet for EnumerableSet.Bytes32Set;

    // === FORGE INFRASTRUCTURE TYPES ===

    /**
     * @dev Types of productive assets that can be funded by mining
     */
    enum AssetType {
        SOLAR_FARM,        // Renewable energy production
        WIND_TURBINE,      // Wind power generation
        HYDRO_ELECTRIC,    // Hydroelectric power
        MANUFACTURING,     // Automated manufacturing facility
        AGRICULTURE,       // Vertical farming/automated agriculture
        DATA_CENTER,       // AI/data processing infrastructure
        TRANSPORTATION,    // Electric vehicle infrastructure
        HOUSING,          // Sustainable housing construction
        EDUCATION,        // Educational facility
        HEALTHCARE        // Medical facility
    }

    /**
     * @dev Forge asset project structure
     */
    struct ForgeAsset {
        bytes32 assetId;
        AssetType assetType;
        string name;
        string location;
        uint256 targetCapacity;    // Target production capacity
        uint256 currentCapacity;   // Current operational capacity
        uint256 fundingRequired;   // Total AZR needed
        uint256 fundingReceived;   // AZR received so far
        uint256 energyOutput;      // Energy production (kWh/year)
        uint256 economicOutput;    // Economic value created ($/year)
        uint256 completionDate;    // Expected completion
        bool operational;          // Whether asset is operational
        address[] funders;         // Addresses that funded this asset
        mapping(address => uint256) fundingAmounts; // Funding per address
    }

    /**
     * @dev Mining contribution to Forge development
     */
    struct MiningContribution {
        address miner;
        uint256 miningPower;       // Hash rate contributed
        uint256 azrEarned;         // AZR tokens earned
        uint256 forgeAllocated;    // Portion allocated to Forge
        AssetType preferredAsset;  // Miner's preferred asset type
        bytes32[] fundedAssets;    // Assets this miner helped fund
        uint256 totalForgeValue;   // Total value created through Forge
        uint256 timestamp;
    }

    /**
     * @dev Productivity metrics for dynamic difficulty adjustment
     */
    struct ProductivityMetrics {
        uint256 totalEnergyCapacity;    // Total energy production capacity
        uint256 totalManufacturingCapacity; // Manufacturing output capacity
        uint256 totalAgriculturalCapacity;   // Food production capacity
        uint256 operationalAssets;      // Number of operational assets
        uint256 totalEconomicOutput;    // Total economic value created
        uint256 forgeUtilizationRate;   // Percentage utilization of assets
        uint256 lastUpdated;
    }

    // === MINING ECONOMICS ===

    uint256 public constant FORGE_ALLOCATION_RATE = 4000; // 40% of mining rewards to Forge
    uint256 public constant MINER_ALLOCATION_RATE = 6000; // 60% to miners

    // Base mining reward per block (adjusts dynamically)
    uint256 public baseMiningReward = 100 * 10**18; // 100 AZR

    // Dynamic difficulty adjustment based on Forge targets
    uint256 public miningDifficulty;
    uint256 public targetBlockTime = 30 seconds;

    // === STATE VARIABLES ===

    // Forge assets
    mapping(bytes32 => ForgeAsset) public forgeAssets;
    mapping(AssetType => bytes32[]) public assetsByType;
    mapping(address => bytes32[]) public minerFundedAssets;

    // Mining contributions
    mapping(address => MiningContribution[]) public miningContributions;
    mapping(address => uint256) public totalForgeContributions;

    // Productivity tracking
    ProductivityMetrics public productivityMetrics;

    // Asset funding pools
    mapping(AssetType => uint256) public assetFundingPools;

    // Active asset projects
    EnumerableSet.Bytes32Set private activeAssets;

    // === EVENTS ===

    event ForgeAssetCreated(bytes32 indexed assetId, AssetType assetType, string name, uint256 fundingRequired);
    event MiningRewardAllocated(address indexed miner, uint256 azrReward, uint256 forgeAllocation);
    event ForgeAssetFunded(bytes32 indexed assetId, address indexed funder, uint256 amount);
    event ForgeAssetCompleted(bytes32 indexed assetId, uint256 capacity);
    event ProductivityUpdated(uint256 totalCapacity, uint256 economicOutput);
    event MiningDifficultyAdjusted(uint256 newDifficulty, uint256 productivityFactor);

    // === CONSTRUCTOR ===

    constructor() {
        miningDifficulty = 1000000; // Initial difficulty

        // Initialize with some foundational Forge projects
        _initializeFoundationalAssets();
    }

    // === FORGE ASSET MANAGEMENT ===

    /**
     * @dev Create a new Forge asset project
     */
    function createForgeAsset(
        AssetType assetType,
        string memory name,
        string memory location,
        uint256 targetCapacity,
        uint256 fundingRequired,
        uint256 energyOutput,
        uint256 economicOutput,
        uint256 completionDays
    ) external onlyOwner returns (bytes32) {
        bytes32 assetId = keccak256(abi.encodePacked(
            assetType, name, location, targetCapacity, block.timestamp
        ));

        require(forgeAssets[assetId].assetId == bytes32(0), "Asset already exists");

        ForgeAsset storage asset = forgeAssets[assetId];
        asset.assetId = assetId;
        asset.assetType = assetType;
        asset.name = name;
        asset.location = location;
        asset.targetCapacity = targetCapacity;
        asset.fundingRequired = fundingRequired;
        asset.energyOutput = energyOutput;
        asset.economicOutput = economicOutput;
        asset.completionDate = block.timestamp + (completionDays * 1 days);

        assetsByType[assetType].push(assetId);
        activeAssets.add(assetId);

        emit ForgeAssetCreated(assetId, assetType, name, fundingRequired);
        return assetId;
    }

    /**
     * @dev Fund a Forge asset (called by mining reward allocation)
     */
    function fundForgeAsset(bytes32 assetId, address funder, uint256 amount) external onlyOwner {
        ForgeAsset storage asset = forgeAssets[assetId];
        require(asset.assetId != bytes32(0), "Asset does not exist");
        require(!asset.operational, "Asset already operational");
        require(asset.fundingReceived < asset.fundingRequired, "Asset fully funded");

        uint256 actualAmount = amount;
        if (asset.fundingReceived + amount > asset.fundingRequired) {
            actualAmount = asset.fundingRequired - asset.fundingReceived;
        }

        asset.fundingReceived += actualAmount;
        asset.funders.push(funder);
        asset.fundingAmounts[funder] += actualAmount;

        minerFundedAssets[funder].push(assetId);
        totalForgeContributions[funder] += actualAmount;

        // Check if asset is now fully funded
        if (asset.fundingReceived >= asset.fundingRequired) {
            _completeForgeAsset(assetId);
        }

        emit ForgeAssetFunded(assetId, funder, actualAmount);
    }

    /**
     * @dev Complete a Forge asset when fully funded
     */
    function _completeForgeAsset(bytes32 assetId) internal {
        ForgeAsset storage asset = forgeAssets[assetId];
        asset.operational = true;
        asset.currentCapacity = asset.targetCapacity;
        asset.completionDate = block.timestamp;

        // Update productivity metrics
        _updateProductivityMetrics(asset.assetType, asset.energyOutput, asset.economicOutput);

        emit ForgeAssetCompleted(assetId, asset.targetCapacity);
    }

    // === MINING REWARD ALLOCATION ===

    /**
     * @dev Allocate mining rewards with Forge integration
     */
    function allocateMiningReward(
        address miner,
        uint256 miningPower,
        AssetType preferredAsset
    ) external onlyOwner returns (uint256) {
        // Calculate dynamic reward based on productivity
        uint256 currentReward = _calculateDynamicMiningReward();

        // Allocate portions
        uint256 minerReward = (currentReward * MINER_ALLOCATION_RATE) / 10000;
        uint256 forgeAllocation = (currentReward * FORGE_ALLOCATION_RATE) / 10000;

        // Record mining contribution
        MiningContribution memory contribution = MiningContribution({
            miner: miner,
            miningPower: miningPower,
            azrEarned: minerReward,
            forgeAllocated: forgeAllocation,
            preferredAsset: preferredAsset,
            fundedAssets: new bytes32[](0),
            totalForgeValue: totalForgeContributions[miner],
            timestamp: block.timestamp
        });

        miningContributions[miner].push(contribution);

        // Allocate Forge funding to preferred asset type
        _allocateForgeFunding(forgeAllocation, preferredAsset, miner);

        // Mint rewards to miner
        // _mint(miner, minerReward);

        emit MiningRewardAllocated(miner, minerReward, forgeAllocation);
        return minerReward;
    }

    /**
     * @dev Allocate Forge funding to appropriate assets
     */
    function _allocateForgeFunding(
        uint256 forgeAllocation,
        AssetType preferredAsset,
        address miner
    ) internal {
        // First, try to fund assets of preferred type
        bytes32[] memory preferredAssets = assetsByType[preferredAsset];
        uint256 remainingAllocation = forgeAllocation;

        for (uint i = 0; i < preferredAssets.length && remainingAllocation > 0; i++) {
            bytes32 assetId = preferredAssets[i];
            ForgeAsset storage asset = forgeAssets[assetId];

            if (!asset.operational && asset.fundingReceived < asset.fundingRequired) {
                uint256 needed = asset.fundingRequired - asset.fundingReceived;
                uint256 allocate = remainingAllocation < needed ? remainingAllocation : needed;

                fundForgeAsset(assetId, miner, allocate);
                remainingAllocation -= allocate;

                // Record funded asset in contribution
                miningContributions[miner][miningContributions[miner].length - 1]
                    .fundedAssets.push(assetId);
            }
        }

        // If still allocation left, fund other types proportionally
        if (remainingAllocation > 0) {
            AssetType[10] memory allTypes = [
                AssetType.SOLAR_FARM, AssetType.WIND_TURBINE, AssetType.HYDRO_ELECTRIC,
                AssetType.MANUFACTURING, AssetType.AGRICULTURE, AssetType.DATA_CENTER,
                AssetType.TRANSPORTATION, AssetType.HOUSING, AssetType.EDUCATION,
                AssetType.HEALTHCARE
            ];

            for (uint i = 0; i < allTypes.length && remainingAllocation > 0; i++) {
                AssetType assetType = allTypes[i];
                if (assetType != preferredAsset) {
                    bytes32[] memory typeAssets = assetsByType[assetType];

                    for (uint j = 0; j < typeAssets.length && remainingAllocation > 0; j++) {
                        bytes32 assetId = typeAssets[j];
                        ForgeAsset storage asset = forgeAssets[assetId];

                        if (!asset.operational && asset.fundingReceived < asset.fundingRequired) {
                            uint256 needed = asset.fundingRequired - asset.fundingReceived;
                            uint256 allocate = remainingAllocation < needed ? remainingAllocation : needed;

                            fundForgeAsset(assetId, miner, allocate);
                            remainingAllocation -= allocate;

                            miningContributions[miner][miningContributions[miner].length - 1]
                                .fundedAssets.push(assetId);
                        }
                    }
                }
            }
        }

        // Any remaining goes to general funding pool
        if (remainingAllocation > 0) {
            assetFundingPools[preferredAsset] += remainingAllocation;
        }
    }

    // === PRODUCTIVITY-BASED DIFFICULTY ADJUSTMENT ===

    /**
     * @dev Calculate dynamic mining reward based on Forge productivity
     */
    function _calculateDynamicMiningReward() internal view returns (uint256) {
        ProductivityMetrics memory metrics = productivityMetrics;

        // Base reward adjusted by productivity
        uint256 productivityMultiplier = 10000; // 1.0 base

        // Increase reward if productivity is growing
        if (metrics.totalEconomicOutput > 0) {
            productivityMultiplier += (metrics.forgeUtilizationRate * 5000) / 100; // Up to 50% bonus
        }

        // Decrease reward if too many assets are underutilized
        if (metrics.forgeUtilizationRate < 70) {
            productivityMultiplier -= ((70 - metrics.forgeUtilizationRate) * 2000) / 100;
        }

        return (baseMiningReward * productivityMultiplier) / 10000;
    }

    /**
     * @dev Adjust mining difficulty based on Forge productivity targets
     */
    function adjustMiningDifficulty() external onlyOwner {
        ProductivityMetrics memory metrics = productivityMetrics;

        uint256 targetProductivity = 8500; // 85% target utilization
        uint256 currentProductivity = metrics.forgeUtilizationRate;

        uint256 difficultyAdjustment;

        if (currentProductivity < targetProductivity) {
            // Too low productivity - decrease difficulty to encourage more mining/Forge funding
            difficultyAdjustment = ((targetProductivity - currentProductivity) * 500) / 100;
            miningDifficulty = miningDifficulty * (10000 - difficultyAdjustment) / 10000;
        } else {
            // Good productivity - can increase difficulty
            difficultyAdjustment = ((currentProductivity - targetProductivity) * 200) / 100;
            miningDifficulty = miningDifficulty * (10000 + difficultyAdjustment) / 10000;
        }

        emit MiningDifficultyAdjusted(miningDifficulty, currentProductivity);
    }

    /**
     * @dev Update productivity metrics when assets come online
     */
    function _updateProductivityMetrics(
        AssetType assetType,
        uint256 energyOutput,
        uint256 economicOutput
    ) internal {
        ProductivityMetrics storage metrics = productivityMetrics;

        // Update energy capacity
        if (assetType == AssetType.SOLAR_FARM || assetType == AssetType.WIND_TURBINE ||
            assetType == AssetType.HYDRO_ELECTRIC) {
            metrics.totalEnergyCapacity += energyOutput;
        }

        // Update manufacturing capacity
        if (assetType == AssetType.MANUFACTURING || assetType == AssetType.DATA_CENTER) {
            metrics.totalManufacturingCapacity += economicOutput;
        }

        // Update agricultural capacity
        if (assetType == AssetType.AGRICULTURE) {
            metrics.totalAgriculturalCapacity += economicOutput;
        }

        // Update economic output
        metrics.totalEconomicOutput += economicOutput;
        metrics.operationalAssets++;

        // Recalculate utilization rate
        metrics.forgeUtilizationRate = _calculateUtilizationRate();
        metrics.lastUpdated = block.timestamp;

        emit ProductivityUpdated(metrics.totalEnergyCapacity + metrics.totalManufacturingCapacity +
                               metrics.totalAgriculturalCapacity, metrics.totalEconomicOutput);
    }

    /**
     * @dev Calculate Forge utilization rate
     */
    function _calculateUtilizationRate() internal view returns (uint256) {
        // Simplified utilization calculation
        // In production, this would track actual vs potential output

        uint256 totalAssets = activeAssets.length();
        if (totalAssets == 0) return 0;

        uint256 operationalCount = 0;
        for (uint i = 0; i < totalAssets; i++) {
            if (forgeAssets[activeAssets.at(i)].operational) {
                operationalCount++;
            }
        }

        return (operationalCount * 10000) / totalAssets;
    }

    // === INITIALIZATION ===

    /**
     * @dev Initialize with foundational Forge assets
     */
    function _initializeFoundationalAssets() internal {
        // Create initial asset projects
        createForgeAsset(
            AssetType.SOLAR_FARM,
            "Gqeberha Solar Array Alpha",
            "Gqeberha, South Africa",
            10000000, // 10 MW capacity
            500000 * 10**18, // 500k AZR funding needed
            20000000, // 20 MWh/year
            2000000, // $2M/year economic output
            365 // 1 year completion
        );

        createForgeAsset(
            AssetType.MANUFACTURING,
            "Azora Robotics Factory",
            "Gqeberha, South Africa",
            1000, // 1000 units/year
            1000000 * 10**18, // 1M AZR
            5000000, // 5 MWh/year energy
            10000000, // $10M/year output
            730 // 2 years
        );

        createForgeAsset(
            AssetType.AGRICULTURE,
            "Vertical Farm Complex",
            "Gqeberha, South Africa",
            50000, // 50 tons/year food
            300000 * 10**18, // 300k AZR
            2000000, // 2 MWh/year
            5000000, // $5M/year food value
            180 // 6 months
        );
    }

    // === ADMIN FUNCTIONS ===

    /**
     * @dev Update base mining reward
     */
    function setBaseMiningReward(uint256 newReward) external onlyOwner {
        baseMiningReward = newReward;
    }

    /**
     * @dev Update allocation rates
     */
    function updateAllocationRates(uint256 newForgeRate, uint256 newMinerRate) external onlyOwner {
        require(newForgeRate + newMinerRate == 10000, "Rates must sum to 10000");
        // FORGE_ALLOCATION_RATE = newForgeRate; // Would be constants in production
        // MINER_ALLOCATION_RATE = newMinerRate;
    }

    /**
     * @dev Emergency pause asset funding
     */
    function pauseAssetFunding(bytes32 assetId) external onlyOwner {
        forgeAssets[assetId].operational = false;
    }

    // === VIEW FUNCTIONS ===

    function getForgeAsset(bytes32 assetId) external view returns (
        AssetType assetType,
        string memory name,
        string memory location,
        uint256 targetCapacity,
        uint256 currentCapacity,
        uint256 fundingRequired,
        uint256 fundingReceived,
        uint256 energyOutput,
        uint256 economicOutput,
        bool operational
    ) {
        ForgeAsset storage asset = forgeAssets[assetId];
        return (
            asset.assetType,
            asset.name,
            asset.location,
            asset.targetCapacity,
            asset.currentCapacity,
            asset.fundingRequired,
            asset.fundingReceived,
            asset.energyOutput,
            asset.economicOutput,
            asset.operational
        );
    }

    function getAssetsByType(AssetType assetType) external view returns (bytes32[] memory) {
        return assetsByType[assetType];
    }

    function getMinerContributions(address miner) external view returns (MiningContribution[] memory) {
        return miningContributions[miner];
    }

    function getProductivityMetrics() external view returns (ProductivityMetrics memory) {
        return productivityMetrics;
    }

    function getTotalForgeValue() external view returns (uint256) {
        ProductivityMetrics memory metrics = productivityMetrics;
        return metrics.totalEconomicOutput;
    }

    function getMiningDifficulty() external view returns (uint256) {
        return miningDifficulty;
    }

    function getDynamicMiningReward() external view returns (uint256) {
        return _calculateDynamicMiningReward();
    }

    function getMinerFundedAssets(address miner) external view returns (bytes32[] memory) {
        return minerFundedAssets[miner];
    }

    function getAssetFundingPool(AssetType assetType) external view returns (uint256) {
        return assetFundingPools[assetType];
    }
}
