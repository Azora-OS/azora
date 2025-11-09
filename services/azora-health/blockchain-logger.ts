/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

/**
 * AZORA BLOCKCHAIN LOGGING SYSTEM
 *
 * Immutable logging system using blockchain technology
 * Records all transactions, events, and system activities
 */

import { EventEmitter } from 'events'
import winston from 'winston'
import crypto from 'crypto'
import { createDatabasePool, createRedisCache, createSupabaseClient } from 'azora-database-layer'
import { EventBus } from 'azora-event-bus'

interface BlockchainEntry {
  id: string
  timestamp: Date
  eventType: string
  data: any
  hash: string
  previousHash: string
  signature?: string
  blockHeight: number
  validator: string
  merkleRoot?: string
}

interface Block {
  id: string
  height: number
  timestamp: Date
  entries: BlockchainEntry[]
  previousBlockHash: string
  merkleRoot: string
  hash: string
  signature: string
  validator: string
}

interface ValidationResult {
  isValid: boolean
  errors: string[]
  validatedAt: Date
}

export class AzoraBlockchainLogger extends EventEmitter {
  private dbPool: any
  private redisCache: any
  private supabaseClient: any
  private eventBus: EventBus
  private logger: winston.Logger

  private currentBlock: Block | null = null
  private pendingEntries: BlockchainEntry[] = []
  private blockHeight: number = 0
  private genesisHash: string
  private privateKey: string
  private publicKey: string

  // Configuration
  private readonly ENTRIES_PER_BLOCK = 100
  private readonly BLOCK_TIME_SECONDS = 300 // 5 minutes
  private readonly VALIDATOR_ID = 'azora-primary-validator'

  constructor() {
    super()

    // Generate or load cryptographic keys
    this.initializeCryptography()

    this.genesisHash = this.calculateGenesisHash()

    this.logger = winston.createLogger({
      level: 'info',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
      ),
      transports: [
        new winston.transports.Console(),
        new winston.transports.File({ filename: 'blockchain-logger.log' })
      ]
    })
  }

  private initializeCryptography(): void {
    // In production, these would be loaded from secure key management
    const keyPair = crypto.generateKeyPairSync('rsa', {
      modulusLength: 2048,
      publicKeyEncoding: { type: 'spki', format: 'pem' },
      privateKeyEncoding: { type: 'pkcs8', format: 'pem' }
    })

    this.privateKey = keyPair.privateKey
    this.publicKey = keyPair.publicKey
  }

  private calculateGenesisHash(): string {
    const genesisData = {
      timestamp: new Date('2025-01-01T00:00:00Z'),
      message: 'Azora Blockchain Logger Genesis Block',
      validator: this.VALIDATOR_ID
    }

    return crypto.createHash('sha256')
      .update(JSON.stringify(genesisData))
      .digest('hex')
  }

  async initialize(): Promise<void> {
    try {
      // Initialize Azora infrastructure
      this.dbPool = createDatabasePool(process.env.AZORA_DB_URL || 'postgresql://localhost:5432/azora')
      this.redisCache = createRedisCache(process.env.AZORA_REDIS_URL || 'redis://localhost:6379')
      this.supabaseClient = createSupabaseClient(
        process.env.AZORA_SUPABASE_URL || '',
        process.env.AZORA_SUPABASE_KEY || ''
      )
      this.eventBus = new EventBus(process.env.AZORA_EVENT_BUS_URL || 'redis://localhost:6379', 'blockchain-logger')

      // Setup event listeners
      await this.setupEventListeners()

      // Load blockchain state
      await this.loadBlockchainState()

      // Start block creation timer
      this.startBlockTimer()

      this.logger.info('✅ Azora Blockchain Logger initialized')
    } catch (error) {
      this.logger.error('❌ Failed to initialize Blockchain Logger:', error)
      throw error
    }
  }

  private async setupEventListeners(): Promise<void> {
    // Listen for all system events that should be logged
    const loggableEvents = [
      'mint.transaction.*',
      'education.enrollment.*',
      'forge.service.*',
      'health.check.*',
      'security.*',
      'user.*',
      'system.*'
    ]

    for (const eventPattern of loggableEvents) {
      this.eventBus.subscribe(eventPattern, async (event: any) => {
        await this.logEvent(event.type, event.data)
      })
    }

    // Listen for blockchain-specific events
    this.eventBus.subscribe('blockchain.validation.request', async (event: any) => {
      const result = await this.validateBlockchain()
      await this.eventBus.publish('blockchain.validation.complete', result)
    })

    this.logger.info('✅ Blockchain logger event listeners configured')
  }

  private async loadBlockchainState(): Promise<void> {
    try {
      // Get latest block from database
      const result = await this.dbPool.query(
        'SELECT * FROM blockchain_blocks ORDER BY height DESC LIMIT 1'
      )

      if (result.rows.length > 0) {
        const latestBlock = result.rows[0]
        this.blockHeight = latestBlock.height
        this.currentBlock = {
          id: latestBlock.id,
          height: latestBlock.height,
          timestamp: new Date(latestBlock.timestamp),
          entries: [], // Will be loaded if needed
          previousBlockHash: latestBlock.previous_block_hash,
          merkleRoot: latestBlock.merkle_root,
          hash: latestBlock.hash,
          signature: latestBlock.signature,
          validator: latestBlock.validator
        }
      } else {
        // Create genesis block
        await this.createGenesisBlock()
      }

      this.logger.info(`✅ Blockchain state loaded: height ${this.blockHeight}`)
    } catch (error) {
      this.logger.error('❌ Failed to load blockchain state:', error)
      // Start with genesis block
      await this.createGenesisBlock()
    }
  }

  private async createGenesisBlock(): Promise<void> {
    const genesisBlock: Block = {
      id: `block-${Date.now()}-genesis`,
      height: 0,
      timestamp: new Date(),
      entries: [],
      previousBlockHash: '0'.repeat(64),
      merkleRoot: this.calculateMerkleRoot([]),
      hash: '',
      signature: '',
      validator: this.VALIDATOR_ID
    }

    // Calculate block hash
    genesisBlock.hash = this.calculateBlockHash(genesisBlock)

    // Sign block
    genesisBlock.signature = this.signData(genesisBlock.hash)

    // Store genesis block
    await this.storeBlock(genesisBlock)

    this.currentBlock = genesisBlock
    this.blockHeight = 0

    this.logger.info('✅ Genesis block created')
  }

  private startBlockTimer(): void {
    // Create new block every BLOCK_TIME_SECONDS
    setInterval(async () => {
      if (this.pendingEntries.length > 0) {
        await this.createNewBlock()
      }
    }, this.BLOCK_TIME_SECONDS * 1000)

    // Force block creation if we have enough entries
    setInterval(async () => {
      if (this.pendingEntries.length >= this.ENTRIES_PER_BLOCK) {
        await this.createNewBlock()
      }
    }, 30000) // Check every 30 seconds
  }

  async logEvent(eventType: string, data: any): Promise<string> {
    const entry: BlockchainEntry = {
      id: `entry-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      eventType,
      data,
      hash: '',
      previousHash: this.getLastEntryHash(),
      blockHeight: -1, // Will be set when block is created
      validator: this.VALIDATOR_ID
    }

    // Calculate entry hash
    entry.hash = this.calculateEntryHash(entry)

    // Add to pending entries
    this.pendingEntries.push(entry)

    // Store in database immediately for redundancy
    await this.storeEntry(entry)

    // Publish logging event
    await this.eventBus.publish('blockchain.entry.logged', {
      entryId: entry.id,
      eventType,
      hash: entry.hash,
      timestamp: entry.timestamp
    })

    this.logger.debug(`📝 Event logged: ${eventType} (${entry.hash.substring(0, 16)}...)`)

    return entry.id
  }

  private async createNewBlock(): Promise<void> {
    if (this.pendingEntries.length === 0) return

    const entries = [...this.pendingEntries]
    this.pendingEntries = []

    const block: Block = {
      id: `block-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      height: this.blockHeight + 1,
      timestamp: new Date(),
      entries,
      previousBlockHash: this.currentBlock?.hash || this.genesisHash,
      merkleRoot: this.calculateMerkleRoot(entries),
      hash: '',
      signature: '',
      validator: this.VALIDATOR_ID
    }

    // Update entry block heights
    for (const entry of entries) {
      entry.blockHeight = block.height
      await this.updateEntryBlockHeight(entry.id, block.height)
    }

    // Calculate block hash
    block.hash = this.calculateBlockHash(block)

    // Sign block
    block.signature = this.signData(block.hash)

    // Store block
    await this.storeBlock(block)

    // Update current block
    this.currentBlock = block
    this.blockHeight = block.height

    // Publish block creation event
    await this.eventBus.publish('blockchain.block.created', {
      blockId: block.id,
      height: block.height,
      entriesCount: entries.length,
      hash: block.hash,
      merkleRoot: block.merkleRoot
    })

    this.logger.info(`🧱 New block created: #${block.height} with ${entries.length} entries`)
  }

  private calculateEntryHash(entry: BlockchainEntry): string {
    const dataToHash = {
      id: entry.id,
      timestamp: entry.timestamp.toISOString(),
      eventType: entry.eventType,
      data: entry.data,
      previousHash: entry.previousHash
    }

    return crypto.createHash('sha256')
      .update(JSON.stringify(dataToHash))
      .digest('hex')
  }

  private calculateBlockHash(block: Block): string {
    const dataToHash = {
      id: block.id,
      height: block.height,
      timestamp: block.timestamp.toISOString(),
      previousBlockHash: block.previousBlockHash,
      merkleRoot: block.merkleRoot,
      validator: block.validator
    }

    return crypto.createHash('sha256')
      .update(JSON.stringify(dataToHash))
      .digest('hex')
  }

  private calculateMerkleRoot(entries: BlockchainEntry[]): string {
    if (entries.length === 0) return '0'.repeat(64)

    // Simple merkle root calculation (in production, use proper merkle tree)
    const hashes = entries.map(entry => entry.hash)
    return crypto.createHash('sha256')
      .update(hashes.join(''))
      .digest('hex')
  }

  private getLastEntryHash(): string {
    if (this.pendingEntries.length === 0) {
      // Get last entry from database
      return this.currentBlock?.entries[this.currentBlock.entries.length - 1]?.hash || '0'.repeat(64)
    }
    return this.pendingEntries[this.pendingEntries.length - 1].hash
  }

  private signData(data: string): string {
    const sign = crypto.createSign('SHA256')
    sign.update(data)
    return sign.sign(this.privateKey, 'hex')
  }

  private verifySignature(data: string, signature: string, publicKey?: string): boolean {
    const verify = crypto.createVerify('SHA256')
    verify.update(data)
    return verify.verify(publicKey || this.publicKey, signature, 'hex')
  }

  private async storeEntry(entry: BlockchainEntry): Promise<void> {
    try {
      await this.dbPool.query(
        `INSERT INTO blockchain_entries
         (id, timestamp, event_type, data, hash, previous_hash, block_height, validator)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [
          entry.id,
          entry.timestamp,
          entry.eventType,
          JSON.stringify(entry.data),
          entry.hash,
          entry.previousHash,
          entry.blockHeight,
          entry.validator
        ]
      )
    } catch (error) {
      this.logger.error('❌ Failed to store blockchain entry:', error)
      throw error
    }
  }

  private async storeBlock(block: Block): Promise<void> {
    try {
      await this.dbPool.query(
        `INSERT INTO blockchain_blocks
         (id, height, timestamp, entries_count, previous_block_hash, merkle_root, hash, signature, validator)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
        [
          block.id,
          block.height,
          block.timestamp,
          block.entries.length,
          block.previousBlockHash,
          block.merkleRoot,
          block.hash,
          block.signature,
          block.validator
        ]
      )

      // Store block entries relationship
      for (const entry of block.entries) {
        await this.dbPool.query(
          'INSERT INTO block_entries (block_id, entry_id) VALUES ($1, $2)',
          [block.id, entry.id]
        )
      }
    } catch (error) {
      this.logger.error('❌ Failed to store blockchain block:', error)
      throw error
    }
  }

  private async updateEntryBlockHeight(entryId: string, blockHeight: number): Promise<void> {
    try {
      await this.dbPool.query(
        'UPDATE blockchain_entries SET block_height = $1 WHERE id = $2',
        [blockHeight, entryId]
      )
    } catch (error) {
      this.logger.error('❌ Failed to update entry block height:', error)
    }
  }

  async validateBlockchain(): Promise<ValidationResult> {
    const result: ValidationResult = {
      isValid: true,
      errors: [],
      validatedAt: new Date()
    }

    try {
      this.logger.info('🔍 Starting blockchain validation...')

      // Get all blocks in order
      const blocks = await this.dbPool.query(
        'SELECT * FROM blockchain_blocks ORDER BY height ASC'
      )

      let previousHash = this.genesisHash

      for (const blockRow of blocks.rows) {
        const block = {
          id: blockRow.id,
          height: blockRow.height,
          timestamp: new Date(blockRow.timestamp),
          previousBlockHash: blockRow.previous_block_hash,
          merkleRoot: blockRow.merkle_root,
          hash: blockRow.hash,
          signature: blockRow.signature,
          validator: blockRow.validator
        }

        // Validate block hash
        const calculatedHash = this.calculateBlockHash(block)
        if (calculatedHash !== block.hash) {
          result.isValid = false
          result.errors.push(`Block ${block.height} hash mismatch`)
        }

        // Validate previous hash chain
        if (block.previousBlockHash !== previousHash) {
          result.isValid = false
          result.errors.push(`Block ${block.height} previous hash mismatch`)
        }

        // Validate signature
        if (!this.verifySignature(block.hash, block.signature)) {
          result.isValid = false
          result.errors.push(`Block ${block.height} signature invalid`)
        }

        // Validate merkle root
        const entries = await this.dbPool.query(
          'SELECT * FROM blockchain_entries WHERE block_height = $1 ORDER BY timestamp ASC',
          [block.height]
        )

        const calculatedMerkleRoot = this.calculateMerkleRoot(entries.rows.map(row => ({
          id: row.id,
          timestamp: new Date(row.timestamp),
          eventType: row.event_type,
          data: JSON.parse(row.data),
          hash: row.hash,
          previousHash: row.previous_hash,
          blockHeight: row.block_height,
          validator: row.validator
        })))

        if (calculatedMerkleRoot !== block.merkleRoot) {
          result.isValid = false
          result.errors.push(`Block ${block.height} merkle root mismatch`)
        }

        previousHash = block.hash
      }

      // Validate entry chain within blocks
      for (const blockRow of blocks.rows) {
        const entries = await this.dbPool.query(
          'SELECT * FROM blockchain_entries WHERE block_height = $1 ORDER BY timestamp ASC',
          [blockRow.height]
        )

        let previousEntryHash = '0'.repeat(64)
        for (const entryRow of entries.rows) {
          if (entryRow.previous_hash !== previousEntryHash) {
            result.isValid = false
            result.errors.push(`Entry ${entryRow.id} previous hash mismatch in block ${blockRow.height}`)
          }

          // Validate entry hash
          const entry = {
            id: entryRow.id,
            timestamp: new Date(entryRow.timestamp),
            eventType: entryRow.event_type,
            data: JSON.parse(entryRow.data),
            hash: '',
            previousHash: entryRow.previous_hash,
            blockHeight: entryRow.block_height,
            validator: entryRow.validator
          }
          entry.hash = this.calculateEntryHash(entry)

          if (entry.hash !== entryRow.hash) {
            result.isValid = false
            result.errors.push(`Entry ${entryRow.id} hash mismatch`)
          }

          previousEntryHash = entryRow.hash
        }
      }

      this.logger.info(`✅ Blockchain validation complete: ${result.isValid ? 'VALID' : 'INVALID'}`)

      if (result.errors.length > 0) {
        this.logger.error('Validation errors:', result.errors)
      }

    } catch (error: any) {
      result.isValid = false
      result.errors.push(`Validation failed: ${error.message}`)
      this.logger.error('❌ Blockchain validation failed:', error)
    }

    return result
  }

  // Public API methods
  async getEntry(entryId: string): Promise<BlockchainEntry | null> {
    try {
      const result = await this.dbPool.query(
        'SELECT * FROM blockchain_entries WHERE id = $1',
        [entryId]
      )

      if (result.rows.length === 0) return null

      const row = result.rows[0]
      return {
        id: row.id,
        timestamp: new Date(row.timestamp),
        eventType: row.event_type,
        data: JSON.parse(row.data),
        hash: row.hash,
        previousHash: row.previous_hash,
        blockHeight: row.block_height,
        validator: row.validator,
        signature: row.signature
      }
    } catch (error) {
      this.logger.error('❌ Failed to get blockchain entry:', error)
      return null
    }
  }

  async getBlock(blockId: string): Promise<Block | null> {
    try {
      const result = await this.dbPool.query(
        'SELECT * FROM blockchain_blocks WHERE id = $1',
        [blockId]
      )

      if (result.rows.length === 0) return null

      const row = result.rows[0]
      const entries = await this.dbPool.query(
        'SELECT * FROM blockchain_entries WHERE block_height = $1 ORDER BY timestamp ASC',
        [row.height]
      )

      return {
        id: row.id,
        height: row.height,
        timestamp: new Date(row.timestamp),
        entries: entries.rows.map(entryRow => ({
          id: entryRow.id,
          timestamp: new Date(entryRow.timestamp),
          eventType: entryRow.event_type,
          data: JSON.parse(entryRow.data),
          hash: entryRow.hash,
          previousHash: entryRow.previous_hash,
          blockHeight: entryRow.block_height,
          validator: entryRow.validator,
          signature: entryRow.signature
        })),
        previousBlockHash: row.previous_block_hash,
        merkleRoot: row.merkle_root,
        hash: row.hash,
        signature: row.signature,
        validator: row.validator
      }
    } catch (error) {
      this.logger.error('❌ Failed to get blockchain block:', error)
      return null
    }
  }

  async getBlockchainStats(): Promise<any> {
    try {
      const [blockCount, entryCount, latestBlock] = await Promise.all([
        this.dbPool.query('SELECT COUNT(*) as count FROM blockchain_blocks'),
        this.dbPool.query('SELECT COUNT(*) as count FROM blockchain_entries'),
        this.dbPool.query('SELECT * FROM blockchain_blocks ORDER BY height DESC LIMIT 1')
      ])

      return {
        totalBlocks: parseInt(blockCount.rows[0].count),
        totalEntries: parseInt(entryCount.rows[0].count),
        currentHeight: latestBlock.rows.length > 0 ? latestBlock.rows[0].height : 0,
        pendingEntries: this.pendingEntries.length,
        validator: this.VALIDATOR_ID,
        lastBlockTimestamp: latestBlock.rows.length > 0 ? latestBlock.rows[0].timestamp : null
      }
    } catch (error) {
      this.logger.error('❌ Failed to get blockchain stats:', error)
      return null
    }
  }

  async getEntriesByEventType(eventType: string, limit = 100): Promise<BlockchainEntry[]> {
    try {
      const result = await this.dbPool.query(
        'SELECT * FROM blockchain_entries WHERE event_type = $1 ORDER BY timestamp DESC LIMIT $2',
        [eventType, limit]
      )

      return result.rows.map(row => ({
        id: row.id,
        timestamp: new Date(row.timestamp),
        eventType: row.event_type,
        data: JSON.parse(row.data),
        hash: row.hash,
        previousHash: row.previous_hash,
        blockHeight: row.block_height,
        validator: row.validator,
        signature: row.signature
      }))
    } catch (error) {
      this.logger.error('❌ Failed to get entries by event type:', error)
      return []
    }
  }

  async verifyEntryIntegrity(entryId: string): Promise<boolean> {
    const entry = await this.getEntry(entryId)
    if (!entry) return false

    // Recalculate hash
    const calculatedHash = this.calculateEntryHash(entry)
    return calculatedHash === entry.hash
  }

  async shutdown(): Promise<void> {
    this.logger.info('⛓️ Shutting down Blockchain Logger...')

    // Create final block if there are pending entries
    if (this.pendingEntries.length > 0) {
      await this.createNewBlock()
    }

    // Close connections
    if (this.dbPool) {
      await this.dbPool.end()
    }
    if (this.redisCache) {
      await this.redisCache.quit()
    }
    if (this.eventBus) {
      await this.eventBus.disconnect()
    }

    this.logger.info('✅ Blockchain Logger shutdown complete')
  }
}

// Factory function
export function createAzoraBlockchainLogger(): AzoraBlockchainLogger {
  return new AzoraBlockchainLogger()
}

// Default export
export default AzoraBlockchainLogger</content>
<parameter name="filePath">c:\azora-os\Azora-OS\services\azora-health\blockchain-logger.ts
