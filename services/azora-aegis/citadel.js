/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

/**
 * AEGIS CITADEL - Global Genesis Mandate Implementation
 *
 * The Aegis Citadel serves as the sovereign guardian of the Azora ecosystem,
 * managing planetary-scale economic instantiation through the Global Genesis Protocol.
 *
 * Key Responsibilities:
 * - Global Genesis Fund management
 * - Sovereign Seed Grant allocation and escrow
 * - Activation trigger monitoring and execution
 * - Instantiation Protocol orchestration
 * - Cross-border economic coordination
 */

const express = require('express');
const cors = require('cors');
const crypto = require('crypto');
const WebSocket = require('ws');

// Import GRI Engine for sovereign readiness assessment
const { GeopoliticalReadinessIndex } = require('../../genome/agent-tools/geopolitical-readiness-index.ts');

class AegisCitadel {
  constructor() {
    this.app = express();
    this.app.use(express.json());
    this.app.use(cors());

    // Initialize GRI Engine for nation assessments
    this.griEngine = new GeopoliticalReadinessIndex(process.env.OPENAI_API_KEY);

    // GRI Unlock Queue for processing escrow releases
    this.griUnlockQueue = [];
    this.isProcessingQueue = false;

    // Global Genesis Fund - Strategic AZR allocation for planetary seeding
    this.globalGenesisFund = {
      totalAllocation: 195000000, // 195M AZR allocated for global seeding
      allocated: 0,
      available: 195000000,
      sovereignSeedGrants: new Map(), // Country -> Grant Status
      activationTriggers: new Map(), // Country -> Trigger Status
      instantiatedEconomies: new Map(), // Country -> Economy Status
    };

    // Sovereign Seed Grant Configuration
    this.seedGrantConfig = {
      amountPerNation: 1000000, // 1M AZR per nation
      totalNations: 195, // UN recognized nations
      totalRequired: 195000000, // 195M AZR total
      escrowStatus: 'active',
    };

    // Activation Triggers
    this.activationTriggers = {
      userThreshold: 10000, // 10K active users on Global Transfer app
      universityTreaty: 'signed', // Protocol-University Treaty signed
      foundingTeam: 'petitioned', // Local founding team petition
    };

    // Country Registry
    this.countryRegistry = this.initializeCountryRegistry();

    // WebSocket server for real-time coordination
    this.wss = null;

    this.initializeRoutes();
    this.initializeWebSocket();
  }

  /**
   * Initialize the complete country registry with sovereign seed grants
   */
  initializeCountryRegistry() {
    const countries = [
      // Africa (54 nations)
      'South Africa',
      'Nigeria',
      'Egypt',
      'Kenya',
      'Morocco',
      'Ethiopia',
      'Ghana',
      'Tanzania',
      'Uganda',
      'Algeria',
      'Angola',
      'Botswana',
      'Burkina Faso',
      'Burundi',
      'Cameroon',
      'Cape Verde',
      'Central African Republic',
      'Chad',
      'Comoros',
      'Congo',
      'Djibouti',
      'Equatorial Guinea',
      'Eritrea',
      'Eswatini',
      'Gabon',
      'Gambia',
      'Guinea',
      'Guinea-Bissau',
      'Ivory Coast',
      'Lesotho',
      'Liberia',
      'Libya',
      'Madagascar',
      'Malawi',
      'Mali',
      'Mauritania',
      'Mauritius',
      'Mozambique',
      'Namibia',
      'Niger',
      'Rwanda',
      'Sao Tome and Principe',
      'Senegal',
      'Seychelles',
      'Sierra Leone',
      'Somalia',
      'Sudan',
      'South Sudan',
      'Togo',
      'Tunisia',
      'Zambia',
      'Zimbabwe',

      // Americas (35 nations)
      'United States',
      'Canada',
      'Mexico',
      'Brazil',
      'Argentina',
      'Colombia',
      'Peru',
      'Venezuela',
      'Chile',
      'Ecuador',
      'Guatemala',
      'Cuba',
      'Haiti',
      'Dominican Republic',
      'Honduras',
      'El Salvador',
      'Nicaragua',
      'Costa Rica',
      'Panama',
      'Uruguay',
      'Paraguay',
      'Bolivia',
      'Jamaica',
      'Trinidad and Tobago',
      'Barbados',
      'Bahamas',
      'Belize',
      'Guyana',
      'Suriname',
      'Grenada',
      'Saint Lucia',
      'Saint Vincent and the Grenadines',
      'Antigua and Barbuda',
      'Saint Kitts and Nevis',
      'Dominica',

      // Asia (48 nations)
      'China',
      'India',
      'Indonesia',
      'Pakistan',
      'Bangladesh',
      'Japan',
      'Philippines',
      'Vietnam',
      'Turkey',
      'Iran',
      'Thailand',
      'Myanmar',
      'South Korea',
      'Iraq',
      'Afghanistan',
      'Saudi Arabia',
      'Uzbekistan',
      'Malaysia',
      'Yemen',
      'Nepal',
      'North Korea',
      'Sri Lanka',
      'Kazakhstan',
      'Syria',
      'Cambodia',
      'Jordan',
      'Azerbaijan',
      'United Arab Emirates',
      'Tajikistan',
      'Israel',
      'Laos',
      'Kyrgyzstan',
      'Turkmenistan',
      'Singapore',
      'State of Palestine',
      'Lebanon',
      'Oman',
      'Kuwait',
      'Georgia',
      'Mongolia',
      'Armenia',
      'Qatar',
      'Bahrain',
      'Timor-Leste',
      'Cyprus',
      'Bhutan',
      'Maldives',
      'Brunei',

      // Europe (44 nations)
      'Russia',
      'Germany',
      'United Kingdom',
      'France',
      'Italy',
      'Spain',
      'Ukraine',
      'Poland',
      'Romania',
      'Netherlands',
      'Belgium',
      'Czech Republic',
      'Greece',
      'Portugal',
      'Sweden',
      'Hungary',
      'Belarus',
      'Austria',
      'Serbia',
      'Switzerland',
      'Bulgaria',
      'Denmark',
      'Finland',
      'Slovakia',
      'Norway',
      'Ireland',
      'Croatia',
      'Moldova',
      'Bosnia and Herzegovina',
      'Albania',
      'Lithuania',
      'North Macedonia',
      'Slovenia',
      'Latvia',
      'Estonia',
      'Montenegro',
      'Luxembourg',
      'Malta',
      'Iceland',
      'Andorra',
      'Monaco',
      'Liechtenstein',
      'San Marino',
      'Holy See',

      // Oceania (14 nations)
      'Australia',
      'Papua New Guinea',
      'New Zealand',
      'Fiji',
      'Solomon Islands',
      'Vanuatu',
      'Samoa',
      'Kiribati',
      'Micronesia',
      'Tonga',
      'Marshall Islands',
      'Palau',
      'Tuvalu',
      'Nauru',
    ];

    const registry = new Map();

    countries.forEach((country) => {
      registry.set(country, {
        name: country,
        sovereignSeedGrant: {
          amount: this.seedGrantConfig.amountPerNation,
          status: 'escrowed', // escrowed | released | instantiated
          escrowId: crypto.randomUUID(),
          releaseTimestamp: null,
          activationTrigger: null,
        },
        activationStatus: {
          userThreshold: { current: 0, required: this.activationTriggers.userThreshold, achieved: false },
          universityTreaty: { status: 'pending', details: null },
          foundingTeam: { status: 'pending', petitionId: null },
        },
        economyStatus: {
          instantiated: false,
          localToken: null, // e.g., 'aBRL' for Brazil
          mintAddress: null,
          liquidityPool: null,
          nexusConnection: null,
        },
        region: this.getRegionForCountry(country),
        oracleConfirmation: null,
      });
    });

    return registry;
  }

  /**
   * Determine region for a country
   */
  getRegionForCountry(country) {
    const regions = {
      Africa: [
        'South Africa',
        'Nigeria',
        'Egypt',
        'Kenya',
        'Morocco',
        'Ethiopia',
        'Ghana',
        'Tanzania',
        'Uganda',
        'Algeria',
        'Angola',
        'Botswana',
        'Burkina Faso',
        'Burundi',
        'Cameroon',
        'Cape Verde',
        'Central African Republic',
        'Chad',
        'Comoros',
        'Congo',
        'Djibouti',
        'Equatorial Guinea',
        'Eritrea',
        'Eswatini',
        'Gabon',
        'Gambia',
        'Guinea',
        'Guinea-Bissau',
        'Ivory Coast',
        'Lesotho',
        'Liberia',
        'Libya',
        'Madagascar',
        'Malawi',
        'Mali',
        'Mauritania',
        'Mauritius',
        'Mozambique',
        'Namibia',
        'Niger',
        'Rwanda',
        'Sao Tome and Principe',
        'Senegal',
        'Seychelles',
        'Sierra Leone',
        'Somalia',
        'Sudan',
        'South Sudan',
        'Togo',
        'Tunisia',
        'Zambia',
        'Zimbabwe',
      ],
      Americas: [
        'United States',
        'Canada',
        'Mexico',
        'Brazil',
        'Argentina',
        'Colombia',
        'Peru',
        'Venezuela',
        'Chile',
        'Ecuador',
        'Guatemala',
        'Cuba',
        'Haiti',
        'Dominican Republic',
        'Honduras',
        'El Salvador',
        'Nicaragua',
        'Costa Rica',
        'Panama',
        'Uruguay',
        'Paraguay',
        'Bolivia',
        'Jamaica',
        'Trinidad and Tobago',
        'Barbados',
        'Bahamas',
        'Belize',
        'Guyana',
        'Suriname',
        'Grenada',
        'Saint Lucia',
        'Saint Vincent and the Grenadines',
        'Antigua and Barbuda',
        'Saint Kitts and Nevis',
        'Dominica',
      ],
      Asia: [
        'China',
        'India',
        'Indonesia',
        'Pakistan',
        'Bangladesh',
        'Japan',
        'Philippines',
        'Vietnam',
        'Turkey',
        'Iran',
        'Thailand',
        'Myanmar',
        'South Korea',
        'Iraq',
        'Afghanistan',
        'Saudi Arabia',
        'Uzbekistan',
        'Malaysia',
        'Yemen',
        'Nepal',
        'North Korea',
        'Sri Lanka',
        'Kazakhstan',
        'Syria',
        'Cambodia',
        'Jordan',
        'Azerbaijan',
        'United Arab Emirates',
        'Tajikistan',
        'Israel',
        'Laos',
        'Kyrgyzstan',
        'Turkmenistan',
        'Singapore',
        'State of Palestine',
        'Lebanon',
        'Oman',
        'Kuwait',
        'Georgia',
        'Mongolia',
        'Armenia',
        'Qatar',
        'Bahrain',
        'Timor-Leste',
        'Cyprus',
        'Bhutan',
        'Maldives',
        'Brunei',
      ],
      Europe: [
        'Russia',
        'Germany',
        'United Kingdom',
        'France',
        'Italy',
        'Spain',
        'Ukraine',
        'Poland',
        'Romania',
        'Netherlands',
        'Belgium',
        'Czech Republic',
        'Greece',
        'Portugal',
        'Sweden',
        'Hungary',
        'Belarus',
        'Austria',
        'Serbia',
        'Switzerland',
        'Bulgaria',
        'Denmark',
        'Finland',
        'Slovakia',
        'Norway',
        'Ireland',
        'Croatia',
        'Moldova',
        'Bosnia and Herzegovina',
        'Albania',
        'Lithuania',
        'North Macedonia',
        'Slovenia',
        'Latvia',
        'Estonia',
        'Montenegro',
        'Luxembourg',
        'Malta',
        'Iceland',
        'Andorra',
        'Monaco',
        'Liechtenstein',
        'San Marino',
        'Holy See',
      ],
      Oceania: [
        'Australia',
        'Papua New Guinea',
        'New Zealand',
        'Fiji',
        'Solomon Islands',
        'Vanuatu',
        'Samoa',
        'Kiribati',
        'Micronesia',
        'Tonga',
        'Marshall Islands',
        'Palau',
        'Tuvalu',
        'Nauru',
      ],
    };

    for (const [region, countries] of Object.entries(regions)) {
      if (countries.includes(country)) {
        return region;
      }
    }
    return 'Unknown';
  }

  /**
   * Initialize API routes for Global Genesis Mandate
   */
  initializeRoutes() {
    // Global Genesis Fund Status
    this.app.get('/api/citadel/genesis/status', (req, res) => {
      res.json({
        globalGenesisFund: {
          totalAllocation: this.globalGenesisFund.totalAllocation,
          allocated: this.globalGenesisFund.allocated,
          available: this.globalGenesisFund.available,
          nationsCovered: this.countryRegistry.size,
          instantiatedEconomies: this.globalGenesisFund.instantiatedEconomies.size,
        },
        seedGrantConfig: this.seedGrantConfig,
        activationTriggers: this.activationTriggers,
      });
    });

    // Sovereign Seed Grant Status for Specific Country
    this.app.get('/api/citadel/grants/:country', (req, res) => {
      const country = req.params.country;
      const countryData = this.countryRegistry.get(country);

      if (!countryData) {
        return res.status(404).json({ error: 'Country not found in registry' });
      }

      res.json({
        country: countryData.name,
        region: countryData.region,
        sovereignSeedGrant: countryData.sovereignSeedGrant,
        activationStatus: countryData.activationStatus,
        economyStatus: countryData.economyStatus,
        oracleConfirmation: countryData.oracleConfirmation,
      });
    });

    // Check Activation Triggers
    this.app.post('/api/citadel/triggers/check', (req, res) => {
      const { country, triggerType, triggerData } = req.body;

      if (!country || !triggerType) {
        return res.status(400).json({ error: 'Country and trigger type required' });
      }

      const result = this.checkActivationTrigger(country, triggerType, triggerData);
      res.json(result);
    });

    // Execute Instantiation Protocol
    this.app.post('/api/citadel/instantiate/:country', (req, res) => {
      const country = req.params.country;
      const { oracleConfirmation } = req.body;

      const result = this.executeInstantiationProtocol(country, oracleConfirmation);
      res.json(result);
    });

    // Get All Instantiated Economies
    this.app.get('/api/citadel/economies', (req, res) => {
      const economies = Array.from(this.countryRegistry.entries())
        .filter(([_, data]) => data.economyStatus.instantiated)
        .map(([country, data]) => ({
          country,
          region: data.region,
          localToken: data.economyStatus.localToken,
        }));

      res.json({
        count: economies.length,
        economies,
      });
    });

    // Health check
    this.app.get('/health', (req, res) => {
      res.json({
        status: 'operational',
        service: 'Aegis Citadel',
        globalGenesisFund: {
          available: this.globalGenesisFund.available,
          nationsReady: this.countryRegistry.size,
        },
        griEngine: {
          status: 'active',
          nationsAssessed: this.griEngine ? 'initialized' : 'pending',
        },
        griUnlockQueue: {
          pending: this.griUnlockQueue.length,
          processing: this.isProcessingQueue,
        },
        timestamp: new Date().toISOString(),
      });
    });

    // ========== GRI INTEGRATION ENDPOINTS ==========

    // GRI-based escrow unlock endpoint
    this.app.post('/api/citadel/gri/unlock', async (req, res) => {
      const { nationId, unlockType, assessmentData } = req.body;

      if (!nationId || !unlockType) {
        return res.status(400).json({
          error: 'nationId and unlockType required',
          required: ['nationId', 'unlockType'],
          example: {
            nationId: 'nation_zaf',
            unlockType: 'seed_grant',
            assessmentData: { customCriteria: 'optional' },
          },
        });
      }

      try {
        // Calculate current GRI score
        const griScore = await this.griEngine.calculateGRIScore(nationId);

        // Check if nation meets unlock criteria based on readiness level
        const unlockResult = this.evaluateGRIUnlock(nationId, unlockType, griScore);

        if (unlockResult.eligible) {
          // Add to unlock queue for processing
          const unlockRequest = {
            id: crypto.randomUUID(),
            nationId,
            unlockType,
            griScore,
            assessmentData,
            timestamp: new Date().toISOString(),
            status: 'queued',
          };

          this.griUnlockQueue.push(unlockRequest);

          // Start processing queue if not already running
          if (!this.isProcessingQueue) {
            this.processGRIUnlockQueue();
          }

          res.json({
            success: true,
            unlockRequest,
            griScore,
            unlockResult,
            queuePosition: this.griUnlockQueue.length,
            message: `GRI unlock request queued for ${nationId}`,
          });
        } else {
          res.json({
            success: false,
            nationId,
            griScore,
            unlockResult,
            message: 'Nation does not meet GRI unlock criteria',
          });
        }
      } catch (error) {
        console.error('GRI unlock error:', error);
        res.status(500).json({
          error: 'Failed to process GRI unlock request',
          details: error.message,
        });
      }
    });

    // Get GRI unlock queue status
    this.app.get('/api/citadel/gri/queue', (req, res) => {
      res.json({
        queueLength: this.griUnlockQueue.length,
        isProcessing: this.isProcessingQueue,
        pendingRequests: this.griUnlockQueue.map((req) => ({
          id: req.id,
          nationId: req.nationId,
          unlockType: req.unlockType,
          status: req.status,
          timestamp: req.timestamp,
        })),
      });
    });

    // Get GRI assessment for a nation
    this.app.get('/api/citadel/gri/assessment/:nationId', async (req, res) => {
      const { nationId } = req.params;

      try {
        const griScore = this.griEngine.getGRIScore(nationId);

        if (!griScore) {
          return res.status(404).json({
            error: 'GRI assessment not found for nation',
            nationId,
            message: 'Run assessment first via POST /api/citadel/gri/unlock',
          });
        }

        res.json({
          nationId,
          griScore,
          unlockEligibility: this.evaluateGRIUnlock(nationId, 'seed_grant', griScore),
        });
      } catch (error) {
        console.error('GRI assessment retrieval error:', error);
        res.status(500).json({
          error: 'Failed to retrieve GRI assessment',
          details: error.message,
        });
      }
    });
  }

  /**
   * Check activation trigger for a country
   */
  checkActivationTrigger(country, triggerType, triggerData) {
    const countryData = this.countryRegistry.get(country);
    if (!countryData) {
      return { success: false, error: 'Country not found' };
    }

    let triggerAchieved = false;
    const activationStatus = countryData.activationStatus;

    switch (triggerType) {
      case 'userThreshold':
        const userCount = triggerData.userCount || 0;
        activationStatus.userThreshold.current = userCount;
        if (userCount >= this.activationTriggers.userThreshold) {
          activationStatus.userThreshold.achieved = true;
          triggerAchieved = true;
        }
        break;
    }

    return {
      success: true,
      triggerType,
      triggerAchieved,
      activationStatus: countryData.activationStatus,
    };
  }

  /**
   * Evaluate if a nation meets GRI unlock criteria
   */
  evaluateGRIUnlock(nationId, unlockType, griScore) {
    const unlockCriteria = {
      seed_grant: {
        critical: true, // Critical readiness = immediate unlock
        high: true, // High readiness = unlock eligible
        moderate: false, // Moderate = needs additional conditions
        low: false, // Low = not eligible
        unfavorable: false, // Unfavorable = blocked
      },
      milestone_funding: {
        critical: true,
        high: true,
        moderate: true, // Moderate can access milestone funding
        low: false,
        unfavorable: false,
      },
      full_instantiation: {
        critical: true,
        high: true,
        moderate: false, // Full instantiation requires high readiness
        low: false,
        unfavorable: false,
      },
    };

    const criteria = unlockCriteria[unlockType];
    if (!criteria) {
      return {
        eligible: false,
        reason: `Unknown unlock type: ${unlockType}`,
        requiredReadiness: 'critical|high|moderate',
        currentReadiness: griScore.readinessLevel,
      };
    }

    const eligible = criteria[griScore.readinessLevel];

    return {
      eligible,
      unlockType,
      currentReadiness: griScore.readinessLevel,
      overallScore: griScore.overallScore,
      reason: eligible
        ? `Nation meets ${unlockType} criteria with ${griScore.readinessLevel} readiness`
        : `Nation requires ${Object.keys(criteria).find((level) => criteria[level])} readiness for ${unlockType}`,
      unlockConditions: griScore.unlockConditions,
      estimatedTimeline: griScore.estimatedTimeline,
    };
  }

  /**
   * Process GRI unlock queue asynchronously
   */
  async processGRIUnlockQueue() {
    if (this.isProcessingQueue || this.griUnlockQueue.length === 0) {
      return;
    }

    this.isProcessingQueue = true;
    console.log(`🔄 Aegis Citadel: Processing ${this.griUnlockQueue.length} GRI unlock requests`);

    while (this.griUnlockQueue.length > 0) {
      const unlockRequest = this.griUnlockQueue.shift();

      try {
        console.log(`🔓 Processing GRI unlock for ${unlockRequest.nationId} (${unlockRequest.unlockType})`);

        // Get country name from nationId (e.g., 'nation_zaf' -> 'South Africa')
        const countryName = this.getCountryNameFromNationId(unlockRequest.nationId);

        if (!countryName) {
          throw new Error(`Country not found for nationId: ${unlockRequest.nationId}`);
        }

        // Execute unlock based on type
        const unlockResult = await this.executeGRIUnlock(countryName, unlockRequest);

        unlockRequest.status = 'completed';
        unlockRequest.result = unlockResult;

        console.log(`✅ GRI unlock completed for ${countryName}: ${unlockResult.message}`);

        // Broadcast unlock event
        this.broadcastGRIUnlockEvent(unlockRequest);
      } catch (error) {
        console.error(`❌ GRI unlock failed for ${unlockRequest.nationId}:`, error);
        unlockRequest.status = 'failed';
        unlockRequest.error = error.message;
      }
    }

    this.isProcessingQueue = false;
    console.log(`🏁 Aegis Citadel: GRI unlock queue processing completed`);
  }

  /**
   * Execute GRI-based unlock for a country
   */
  async executeGRIUnlock(countryName, unlockRequest) {
    const countryData = this.countryRegistry.get(countryName);
    if (!countryData) {
      throw new Error(`Country ${countryName} not found in registry`);
    }

    const { unlockType, griScore } = unlockRequest;

    switch (unlockType) {
      case 'seed_grant':
        // Release sovereign seed grant based on GRI score
        if (countryData.sovereignSeedGrant.status !== 'escrowed') {
          throw new Error(`Seed grant already ${countryData.sovereignSeedGrant.status}`);
        }

        // Partial release based on readiness level
        const releasePercentage = this.getReleasePercentage(griScore.readinessLevel);
        const releaseAmount = Math.floor(countryData.sovereignSeedGrant.amount * releasePercentage);

        countryData.sovereignSeedGrant.status = 'partially_released';
        countryData.sovereignSeedGrant.releaseTimestamp = new Date().toISOString();
        countryData.sovereignSeedGrant.griUnlockData = {
          griScore: griScore.overallScore,
          readinessLevel: griScore.readinessLevel,
          releasePercentage,
          releaseAmount,
        };

        // Update global fund
        this.globalGenesisFund.allocated += releaseAmount;
        this.globalGenesisFund.available -= releaseAmount;

        return {
          success: true,
          unlockType: 'seed_grant',
          releaseAmount,
          releasePercentage,
          remainingAmount: countryData.sovereignSeedGrant.amount - releaseAmount,
          message: `Released ${releasePercentage * 100}% (${releaseAmount} AZR) of seed grant based on ${griScore.readinessLevel} GRI readiness`,
        };

      case 'milestone_funding':
        // Release milestone funding tranche
        const milestoneAmount = 100000; // 100K AZR milestone funding

        if (this.globalGenesisFund.available < milestoneAmount) {
          throw new Error('Insufficient funds for milestone funding');
        }

        // Update global fund
        this.globalGenesisFund.allocated += milestoneAmount;
        this.globalGenesisFund.available -= milestoneAmount;

        // Record milestone funding
        if (!countryData.milestoneFunding) {
          countryData.milestoneFunding = [];
        }

        countryData.milestoneFunding.push({
          amount: milestoneAmount,
          unlockDate: new Date().toISOString(),
          griScore: griScore.overallScore,
          readinessLevel: griScore.readinessLevel,
          milestoneType: 'gri_based_unlock',
        });

        return {
          success: true,
          unlockType: 'milestone_funding',
          releaseAmount: milestoneAmount,
          message: `Released ${milestoneAmount} AZR milestone funding based on ${griScore.readinessLevel} GRI readiness`,
        };

      case 'full_instantiation':
        // Execute full instantiation protocol
        const instantiationResult = this.executeInstantiationProtocol(countryName, {
          confirmed: true,
          triggerType: 'gri_based',
          triggerData: { griScore, unlockRequest },
          confirmationTimestamp: new Date().toISOString(),
          confirmationId: crypto.randomUUID(),
        });

        if (!instantiationResult.success) {
          throw new Error(instantiationResult.error);
        }

        return {
          success: true,
          unlockType: 'full_instantiation',
          instantiationResult,
          message: `Full instantiation executed for ${countryName} based on ${griScore.readinessLevel} GRI readiness`,
        };

      default:
        throw new Error(`Unknown unlock type: ${unlockType}`);
    }
  }

  /**
   * Get release percentage based on readiness level
   */
  getReleasePercentage(readinessLevel) {
    const percentages = {
      critical: 1.0, // 100% release
      high: 0.75, // 75% release
      moderate: 0.5, // 50% release
      low: 0.25, // 25% release
      unfavorable: 0.0, // No release
    };

    return percentages[readinessLevel] || 0.0;
  }

  /**
   * Convert nationId to country name
   */
  getCountryNameFromNationId(nationId) {
    // nation_zaf -> South Africa, etc.
    const nationMap = {
      nation_zaf: 'South Africa',
      nation_ken: 'Kenya',
      nation_nga: 'Nigeria',
      nation_sgp: 'Singapore',
      nation_est: 'Estonia',
      nation_chl: 'Chile',
      // Add more mappings as needed
    };

    return nationMap[nationId] || null;
  }

  /**
   * Broadcast GRI unlock event to connected clients
   */
  broadcastGRIUnlockEvent(unlockRequest) {
    const event = {
      type: 'gri_unlock_event',
      timestamp: new Date().toISOString(),
      unlockRequest: {
        id: unlockRequest.id,
        nationId: unlockRequest.nationId,
        unlockType: unlockRequest.unlockType,
        status: unlockRequest.status,
      },
      griScore: unlockRequest.griScore,
      result: unlockRequest.result,
    };

    let broadcastCount = 0;
    this.wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(event));
        broadcastCount++;
      }
    });

    if (broadcastCount > 0) {
      console.log(
        `📡 Aegis Citadel: Broadcasted GRI unlock event for ${unlockRequest.nationId} to ${broadcastCount} clients`,
      );
    }
  }

  /**
   * Execute the Instantiation Protocol for a country
   */
  executeInstantiationProtocol(country, oracleConfirmation) {
    const countryData = this.countryRegistry.get(country);
    if (!countryData) {
      return { success: false, error: 'Country not found' };
    }

    // Verify oracle confirmation
    if (!countryData.oracleConfirmation || !countryData.oracleConfirmation.confirmed) {
      return { success: false, error: 'Oracle confirmation required' };
    }

    // Check if already instantiated
    if (countryData.economyStatus.instantiated) {
      return { success: false, error: 'Economy already instantiated' };
    }

    // Check fund availability
    if (this.globalGenesisFund.available < this.seedGrantConfig.amountPerNation) {
      return { success: false, error: 'Insufficient funds in Global Genesis Fund' };
    }

    try {
      // 1. Release sovereign seed grant
      const grantAmount = countryData.sovereignSeedGrant.amount;
      countryData.sovereignSeedGrant.status = 'released';
      countryData.sovereignSeedGrant.releaseTimestamp = new Date().toISOString();

      // 2. Update global fund
      this.globalGenesisFund.allocated += grantAmount;
      this.globalGenesisFund.available -= grantAmount;

      // 3. Generate local token symbol (e.g., 'aBRL' for Brazil)
      const currencyCode = this.getCurrencyCodeForCountry(country);
      const localToken = `a${currencyCode}`;

      // 4. Simulate mint instantiation (would connect to actual Mint service)
      const mintAddress = crypto.randomUUID(); // In real implementation, this would be the deployed contract address

      // 5. Initialize liquidity pool on Nexus
      const liquidityPool = crypto.randomUUID(); // In real implementation, this would be the pool address

      // 6. Update economy status
      countryData.economyStatus = {
        instantiated: true,
        localToken,
        mintAddress,
        liquidityPool,
        nexusConnection: 'active',
        instantiationTimestamp: new Date().toISOString(),
      };

      // 7. Add to instantiated economies
      this.globalGenesisFund.instantiatedEconomies.set(country, countryData);

      // 8. Broadcast instantiation event
      this.broadcastInstantiationEvent(country, countryData);

      console.log(`🌍 Aegis Citadel: Instantiation Protocol executed for ${country}`);
      console.log(`   💰 Released ${grantAmount} AZR sovereign seed grant`);
      console.log(`   🪙 Created local token: ${localToken}`);
      console.log(`   🔗 Connected to Nexus exchange`);

      return {
        success: true,
        country,
        sovereignSeedGrant: {
          amount: grantAmount,
          status: 'released',
          releaseTimestamp: countryData.sovereignSeedGrant.releaseTimestamp,
        },
        economyStatus: countryData.economyStatus,
        globalFundStatus: {
          allocated: this.globalGenesisFund.allocated,
          available: this.globalGenesisFund.available,
        },
      };
    } catch (error) {
      console.error(`❌ Aegis Citadel: Instantiation failed for ${country}:`, error);
      return { success: false, error: 'Instantiation protocol failed' };
    }
  }

  /**
   * Get currency code for a country (simplified mapping)
   */
  getCurrencyCodeForCountry(country) {
    const currencyMap = {
      'South Africa': 'ZAR',
      'United States': 'USD',
      'United Kingdom': 'GBP',
      'European Union': 'EUR',
      Japan: 'JPY',
      China: 'CNY',
      India: 'INR',
      Brazil: 'BRL',
      Canada: 'CAD',
      Australia: 'AUD',
      Russia: 'RUB',
      Mexico: 'MXN',
      Argentina: 'ARS',
      Colombia: 'COP',
      Peru: 'PEN',
      Chile: 'CLP',
      Ecuador: 'USD', // Uses USD
      Guatemala: 'GTQ',
      Honduras: 'HNL',
      'El Salvador': 'USD', // Uses USD
      Nicaragua: 'NIO',
      'Costa Rica': 'CRC',
      Panama: 'PAB',
      Uruguay: 'UYU',
      Paraguay: 'PYG',
      Bolivia: 'BOB',
      Venezuela: 'VES',
    };

    return currencyMap[country] || 'USD'; // Default to USD if not found
  }

  /**
   * Initialize WebSocket server for real-time coordination
   */
  initializeWebSocket() {
    this.wss = new WebSocket.Server({ noServer: true });

    this.wss.on('connection', (ws, req) => {
      const clientId = crypto.randomUUID();
      console.log(`🔗 Aegis Citadel: Client ${clientId} connected`);

      ws.on('message', (message) => {
        try {
          const data = JSON.parse(message.toString());
          this.handleWebSocketMessage(clientId, data, ws);
        } catch (error) {
          console.error('Invalid WebSocket message:', error);
        }
      });

      ws.on('close', () => {
        console.log(`🔗 Aegis Citadel: Client ${clientId} disconnected`);
      });
    });
  }

  /**
   * Handle WebSocket messages
   */
  handleWebSocketMessage(clientId, data, ws) {
    switch (data.type) {
      case 'subscribe_instantiations':
        // Client wants to subscribe to instantiation events
        console.log(`📡 Aegis Citadel: Client ${clientId} subscribed to instantiation events`);
        break;

      case 'check_country_status':
        const countryData = this.countryRegistry.get(data.country);
        if (countryData) {
          ws.send(
            JSON.stringify({
              type: 'country_status',
              country: data.country,
              sovereignSeedGrant: countryData.sovereignSeedGrant,
              activationStatus: countryData.activationStatus,
              economyStatus: countryData.economyStatus,
            }),
          );
        }
        break;

      default:
        ws.send(
          JSON.stringify({
            type: 'error',
            message: 'Unknown message type',
          }),
        );
    }
  }

  /**
   * Broadcast instantiation event to connected clients
   */
  broadcastInstantiationEvent(country, countryData) {
    const event = {
      type: 'instantiation_event',
      timestamp: new Date().toISOString(),
      country,
      region: countryData.region,
      localToken: countryData.economyStatus.localToken,
      sovereignSeedGrant: countryData.sovereignSeedGrant,
      globalFundStatus: {
        allocated: this.globalGenesisFund.allocated,
        available: this.globalGenesisFund.available,
        instantiatedEconomies: this.globalGenesisFund.instantiatedEconomies.size,
      },
    };

    let broadcastCount = 0;
    this.wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(event));
        broadcastCount++;
      }
    });

    if (broadcastCount > 0) {
      console.log(`📡 Aegis Citadel: Broadcasted instantiation event for ${country} to ${broadcastCount} clients`);
    }
  }

  /**
   * Start the Aegis Citadel service
   */
  start(port = 4099) {
    const server = require('http').createServer(this.app);

    server.on('upgrade', (request, socket, head) => {
      this.wss.handleUpgrade(request, socket, head, (ws) => {
        this.wss.emit('connection', ws, request);
      });
    });

    server.listen(port, () => {
      console.log(`🏰 Aegis Citadel - Global Genesis Mandate Active`);
      console.log(`   🌐 HTTP API: http://localhost:${port}`);
      console.log(`   🔗 WebSocket: ws://localhost:${port}`);
      console.log(`   💰 Global Genesis Fund: ${this.globalGenesisFund.available.toLocaleString()} AZR available`);
      console.log(`   🌍 Nations Ready: ${this.countryRegistry.size}`);
      console.log(`   ⚡ Instantiation Protocol: Ready for planetary deployment`);
    });
  }
}

// Create and export singleton instance
const aegisCitadel = new AegisCitadel();

module.exports = aegisCitadel;
