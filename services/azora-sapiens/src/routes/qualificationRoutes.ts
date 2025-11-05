/*
AZORA PROPRIETARY LICENSE
Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.
See LICENSE file for details.
*/

import express, { Request, Response } from 'express';
import { GLOBAL_QUALIFICATIONS } from '../global-qualifications-framework';
import { EXTENDED_QUALIFICATIONS } from '../global-qualifications-extended';

const router = express.Router();

// Combine all qualifications
const ALL_QUALIFICATIONS = [...GLOBAL_QUALIFICATIONS, ...EXTENDED_QUALIFICATIONS];

/**
 * GET /api/qualifications
 * Get all qualifications with optional filtering
 */
router.get('/', (req: Request, res: Response) => {
  try {
    const { 
      category, 
      level, 
      country, 
      type,
      search,
      limit = 100,
      offset = 0
    } = req.query;

    let filtered = [...ALL_QUALIFICATIONS];

    // Apply filters
    if (category) {
      filtered = filtered.filter(q => q.category === category);
    }
    if (level) {
      filtered = filtered.filter(q => q.level === level);
    }
    if (country) {
      filtered = filtered.filter(q => 
        q.country === country || 
        q.country === 'International' ||
        q.recognizedIn?.includes(country as string)
      );
    }
    if (type) {
      filtered = filtered.filter(q => q.type === type);
    }
    if (search && typeof search === 'string') {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(q =>
        q.name.toLowerCase().includes(searchLower) ||
        q.description.toLowerCase().includes(searchLower) ||
        q.tags.some(tag => tag.toLowerCase().includes(searchLower))
      );
    }

    // Pagination
    const limitNum = parseInt(limit as string);
    const offsetNum = parseInt(offset as string);
    const paginated = filtered.slice(offsetNum, offsetNum + limitNum);

    res.json({
      success: true,
      data: paginated,
      total: filtered.length,
      limit: limitNum,
      offset: offsetNum
    });
  } catch (error) {
    console.error('Error fetching qualifications:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch qualifications',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET /api/qualifications/categories
 * Get all available qualification categories
 */
router.get('/categories', (req: Request, res: Response) => {
  try {
    const categories = Array.from(new Set(ALL_QUALIFICATIONS.map(q => q.category)));
    const categoryCounts = categories.map(cat => ({
      category: cat,
      count: ALL_QUALIFICATIONS.filter(q => q.category === cat).length
    }));

    res.json({
      success: true,
      data: categoryCounts,
      total: categories.length
    });
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch categories'
    });
  }
});

/**
 * GET /api/qualifications/levels
 * Get all qualification levels
 */
router.get('/levels', (req: Request, res: Response) => {
  try {
    const levels = Array.from(new Set(ALL_QUALIFICATIONS.map(q => q.level)));
    const levelCounts = levels.map(level => ({
      level: level,
      count: ALL_QUALIFICATIONS.filter(q => q.level === level).length
    }));

    res.json({
      success: true,
      data: levelCounts,
      total: levels.length
    });
  } catch (error) {
    console.error('Error fetching levels:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch levels'
    });
  }
});

/**
 * GET /api/qualifications/countries
 * Get all countries with qualifications
 */
router.get('/countries', (req: Request, res: Response) => {
  try {
    const countries = Array.from(new Set(
      ALL_QUALIFICATIONS
        .map(q => q.country)
        .filter(c => c !== undefined)
    ));

    const countryCounts = countries.map(country => ({
      country: country,
      count: ALL_QUALIFICATIONS.filter(q => q.country === country).length
    }));

    res.json({
      success: true,
      data: countryCounts.sort((a, b) => b.count - a.count),
      total: countries.length
    });
  } catch (error) {
    console.error('Error fetching countries:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch countries'
    });
  }
});

/**
 * GET /api/qualifications/search
 * Advanced search for qualifications
 */
router.get('/search', (req: Request, res: Response) => {
  try {
    const { q, category, level, country } = req.query;

    if (!q || typeof q !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Search query parameter "q" is required'
      });
    }

    const searchLower = q.toLowerCase();
    let results = ALL_QUALIFICATIONS.filter(qual =>
      qual.name.toLowerCase().includes(searchLower) ||
      qual.description.toLowerCase().includes(searchLower) ||
      qual.shortName?.toLowerCase().includes(searchLower) ||
      qual.tags.some(tag => tag.toLowerCase().includes(searchLower))
    );

    // Apply additional filters
    if (category) {
      results = results.filter(q => q.category === category);
    }
    if (level) {
      results = results.filter(q => q.level === level);
    }
    if (country) {
      results = results.filter(q => 
        q.country === country || 
        q.recognizedIn?.includes(country as string)
      );
    }

    res.json({
      success: true,
      data: results,
      total: results.length,
      query: q
    });
  } catch (error) {
    console.error('Error searching qualifications:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to search qualifications'
    });
  }
});

/**
 * GET /api/qualifications/:id
 * Get a specific qualification by ID
 */
router.get('/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const qualification = ALL_QUALIFICATIONS.find(q => q.id === id);

    if (!qualification) {
      return res.status(404).json({
        success: false,
        error: 'Qualification not found'
      });
    }

    // Find related qualifications
    const related = ALL_QUALIFICATIONS.filter(q =>
      q.id !== id && (
        q.category === qualification.category ||
        q.level === qualification.level ||
        q.equivalents?.includes(id) ||
        qualification.equivalents?.includes(q.id)
      )
    ).slice(0, 5);

    res.json({
      success: true,
      data: qualification,
      related: related
    });
  } catch (error) {
    console.error('Error fetching qualification:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch qualification'
    });
  }
});

/**
 * GET /api/qualifications/stats/summary
 * Get statistics about all qualifications
 */
router.get('/stats/summary', (req: Request, res: Response) => {
  try {
    const stats = {
      totalQualifications: ALL_QUALIFICATIONS.length,
      byCategory: {} as Record<string, number>,
      byLevel: {} as Record<string, number>,
      byCountry: {} as Record<string, number>,
      byType: {} as Record<string, number>,
      verifiable: ALL_QUALIFICATIONS.filter(q => q.verifiable).length,
      totalAzrRewards: ALL_QUALIFICATIONS.reduce((sum, q) => sum + (q.azrReward || 0), 0)
    };

    // Count by category
    ALL_QUALIFICATIONS.forEach(q => {
      stats.byCategory[q.category] = (stats.byCategory[q.category] || 0) + 1;
      stats.byLevel[q.level] = (stats.byLevel[q.level] || 0) + 1;
      if (q.country) {
        stats.byCountry[q.country] = (stats.byCountry[q.country] || 0) + 1;
      }
      stats.byType[q.type] = (stats.byType[q.type] || 0) + 1;
    });

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch statistics'
    });
  }
});

/**
 * GET /api/qualifications/recommend
 * Get qualification recommendations based on user profile
 */
router.post('/recommend', (req: Request, res: Response) => {
  try {
    const { currentQualifications, interests, careerGoals, location } = req.body;

    // Simple recommendation algorithm
    let recommendations = [...ALL_QUALIFICATIONS];

    // Filter out already obtained qualifications
    if (currentQualifications && Array.isArray(currentQualifications)) {
      recommendations = recommendations.filter(q => 
        !currentQualifications.includes(q.id)
      );
    }

    // Filter by location if specified
    if (location) {
      recommendations = recommendations.filter(q =>
        q.country === location || 
        q.country === 'International' ||
        q.recognizedIn?.includes(location)
      );
    }

    // Score based on interests
    if (interests && Array.isArray(interests)) {
      recommendations = recommendations.map(q => ({
        ...q,
        score: q.tags.filter(tag => 
          interests.some(interest => 
            tag.toLowerCase().includes(interest.toLowerCase())
          )
        ).length
      })).sort((a: any, b: any) => b.score - a.score);
    }

    res.json({
      success: true,
      data: recommendations.slice(0, 20),
      total: recommendations.length
    });
  } catch (error) {
    console.error('Error generating recommendations:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate recommendations'
    });
  }
});

/**
 * POST /api/qualifications/verify
 * Verify a qualification (blockchain-based in production)
 */
router.post('/verify', async (req: Request, res: Response) => {
  try {
    const { qualificationId, userId, issuingBody, certificateNumber } = req.body;

    if (!qualificationId || !userId) {
      return res.status(400).json({
        success: false,
        error: 'qualificationId and userId are required'
      });
    }

    const qualification = ALL_QUALIFICATIONS.find(q => q.id === qualificationId);
    if (!qualification) {
      return res.status(404).json({
        success: false,
        error: 'Qualification not found'
      });
    }

    // In production, this would interact with blockchain for verification
    // For now, simulate verification
    const verificationResult = {
      verified: true,
      qualificationId,
      userId,
      qualificationName: qualification.name,
      issuingBody: qualification.issuingBody,
      verificationDate: new Date().toISOString(),
      azrReward: qualification.azrReward,
      blockchainTxHash: `0x${Math.random().toString(16).substring(2)}`, // Simulated
      verificationId: `VER-${Date.now()}`
    };

    res.json({
      success: true,
      data: verificationResult,
      message: `Qualification verified! You've earned ${qualification.azrReward} AZR`
    });
  } catch (error) {
    console.error('Error verifying qualification:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to verify qualification'
    });
  }
});

export default router;
