/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

import express, { Request, Response } from 'express';
import { Category } from '../models/Listing';
import { getAllSkillCategories, searchCategories } from '../seed-categories';

const router = express.Router();

/**
 * GET /api/categories
 * Get all active categories with their subcategories
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const categories = await getAllSkillCategories();
    
    res.json({
      success: true,
      data: categories,
      total: categories.length
    });
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch categories',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET /api/categories/search
 * Search categories by name or description
 */
router.get('/search', async (req: Request, res: Response) => {
  try {
    const { q } = req.query;
    
    if (!q || typeof q !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Search query parameter "q" is required'
      });
    }
    
    const categories = await searchCategories(q);
    
    res.json({
      success: true,
      data: categories,
      total: categories.length,
      query: q
    });
  } catch (error) {
    console.error('Error searching categories:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to search categories',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET /api/categories/:id
 * Get a specific category by ID with its subcategories
 */
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const category = await Category.findById(id)
      .populate('subcategories')
      .populate('parentCategory');
    
    if (!category) {
      return res.status(404).json({
        success: false,
        error: 'Category not found'
      });
    }
    
    res.json({
      success: true,
      data: category
    });
  } catch (error) {
    console.error('Error fetching category:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch category',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET /api/categories/:id/listings
 * Get all active listings for a specific category
 */
router.get('/:id/listings', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 20, sortBy = 'createdAt', order = 'desc' } = req.query;
    
    const category = await Category.findById(id);
    if (!category) {
      return res.status(404).json({
        success: false,
        error: 'Category not found'
      });
    }
    
    // Import Listing model
    const { Listing } = require('../models/Listing');
    
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;
    
    const sortOrder = order === 'asc' ? 1 : -1;
    const sortOptions: any = { [sortBy as string]: sortOrder };
    
    const listings = await Listing.find({
      category: category.name,
      status: 'active'
    })
      .sort(sortOptions)
      .skip(skip)
      .limit(limitNum);
    
    const total = await Listing.countDocuments({
      category: category.name,
      status: 'active'
    });
    
    res.json({
      success: true,
      data: listings,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum)
      }
    });
  } catch (error) {
    console.error('Error fetching category listings:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch category listings',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * POST /api/categories
 * Create a new category (admin only - add authentication middleware)
 */
router.post('/', async (req: Request, res: Response) => {
  try {
    const { name, description, icon, parentCategory } = req.body;
    
    if (!name || !description) {
      return res.status(400).json({
        success: false,
        error: 'Name and description are required'
      });
    }
    
    // Check if category already exists
    const existing = await Category.findOne({ name });
    if (existing) {
      return res.status(409).json({
        success: false,
        error: 'Category with this name already exists'
      });
    }
    
    const categoryData: any = {
      name,
      description,
      icon,
      isActive: true
    };
    
    if (parentCategory) {
      // Verify parent exists
      const parent = await Category.findById(parentCategory);
      if (!parent) {
        return res.status(404).json({
          success: false,
          error: 'Parent category not found'
        });
      }
      categoryData.parentCategory = parentCategory;
    }
    
    const category = await Category.create(categoryData);
    
    // If this is a subcategory, add it to parent's subcategories
    if (parentCategory) {
      await Category.findByIdAndUpdate(
        parentCategory,
        { $push: { subcategories: category._id } }
      );
    }
    
    res.status(201).json({
      success: true,
      data: category
    });
  } catch (error) {
    console.error('Error creating category:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create category',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * PUT /api/categories/:id
 * Update a category (admin only - add authentication middleware)
 */
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, description, icon, isActive } = req.body;
    
    const updateData: any = {};
    if (name) {updateData.name = name;}
    if (description) {updateData.description = description;}
    if (icon) {updateData.icon = icon;}
    if (typeof isActive === 'boolean') {updateData.isActive = isActive;}
    
    const category = await Category.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );
    
    if (!category) {
      return res.status(404).json({
        success: false,
        error: 'Category not found'
      });
    }
    
    res.json({
      success: true,
      data: category
    });
  } catch (error) {
    console.error('Error updating category:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update category',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * DELETE /api/categories/:id
 * Delete a category (soft delete - sets isActive to false)
 * (admin only - add authentication middleware)
 */
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const category = await Category.findByIdAndUpdate(
      id,
      { isActive: false },
      { new: true }
    );
    
    if (!category) {
      return res.status(404).json({
        success: false,
        error: 'Category not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Category deactivated successfully',
      data: category
    });
  } catch (error) {
    console.error('Error deleting category:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete category',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET /api/categories/stats/summary
 * Get statistics about categories and listings
 */
router.get('/stats/summary', async (req: Request, res: Response) => {
  try {
    const totalCategories = await Category.countDocuments({ isActive: true, parentCategory: null });
    const totalSubcategories = await Category.countDocuments({ isActive: true, parentCategory: { $ne: null } });
    
    // Import Listing model
    const { Listing } = require('../models/Listing');
    const totalListings = await Listing.countDocuments({ status: 'active' });
    
    // Get top categories by listing count
    const topCategories = await Listing.aggregate([
      { $match: { status: 'active' } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);
    
    res.json({
      success: true,
      data: {
        totalCategories,
        totalSubcategories,
        totalListings,
        topCategories
      }
    });
  } catch (error) {
    console.error('Error fetching category stats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch category statistics',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;
