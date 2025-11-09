/*
AZORA PROPRIETARY LICENSE
Copyright (c) 2025 Azora ES (Pty) Ltd. All Rights Reserved.

SPARK API - REST API for Spark service
*/

import { Router } from 'express'
import type { SparkService } from '../core/spark-service'

/**
 * 🔌 SPARK API
 * 
 * REST API endpoints for Spark service
 */
export class SparkAPI {
  public router: Router
  private sparkService: SparkService

  constructor(sparkService: SparkService) {
    this.router = Router()
    this.sparkService = sparkService
    this.setupRoutes()
  }

  /**
   * Setup API routes
   */
  private setupRoutes(): void {
    // Index repository
    this.router.post('/index/:repositoryId', async (req, res) => {
      try {
        const { repositoryId } = req.params
        const { files } = req.body

        await this.sparkService.indexRepository(repositoryId, files)

        res.json({
          success: true,
          repositoryId,
          fileCount: files.length,
          message: 'Repository indexed successfully',
        })
      } catch (error: any) {
        res.status(500).json({
          success: false,
          error: error.message,
        })
      }
    })

    // Get code completion
    this.router.post('/completion/:repositoryId', async (req, res) => {
      try {
        const { repositoryId } = req.params
        const { filePath, code, cursorPosition, context } = req.body

        const completion = await this.sparkService.getCompletion(
          repositoryId,
          filePath,
          code,
          cursorPosition,
          context
        )

        res.json({
          success: true,
          completion,
        })
      } catch (error: any) {
        res.status(500).json({
          success: false,
          error: error.message,
        })
      }
    })

    // Search codebase
    this.router.post('/search/:repositoryId', async (req, res) => {
      try {
        const { repositoryId } = req.params
        const { query, options } = req.body

        const results = await this.sparkService.searchCodebase(
          repositoryId,
          query,
          options
        )

        res.json({
          success: true,
          results,
          count: results.length,
        })
      } catch (error: any) {
        res.status(500).json({
          success: false,
          error: error.message,
        })
      }
    })

    // Chat with Spark
    this.router.post('/chat/:repositoryId', async (req, res) => {
      try {
        const { repositoryId } = req.params
        const { message, context } = req.body

        const response = await this.sparkService.chat(
          repositoryId,
          message,
          context
        )

        res.json({
          success: true,
          response,
        })
      } catch (error: any) {
        res.status(500).json({
          success: false,
          error: error.message,
        })
      }
    })

    // Get service status
    this.router.get('/status', (req, res) => {
      const status = this.sparkService.getStatus()
      res.json({
        success: true,
        status,
      })
    })
  }
}
