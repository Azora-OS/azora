#!/usr/bin/env node
/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

/**
 * Master seeding script for Azora Forge marketplace
 * Seeds both categories and sample listings
 */

import mongoose from 'mongoose';
import { seedSkillCategories } from '../src/seed-categories';
import { seedListings } from '../src/seed-listings';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/azora-forge';

async function seedAll() {
  console.log('🚀 Starting Azora Forge marketplace seeding...\n');
  
  try {
    // Connect to MongoDB
    console.log('📡 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');
    
    // Seed categories first
    console.log('═══════════════════════════════════════');
    console.log('  STEP 1: Seeding Skill Categories');
    console.log('═══════════════════════════════════════\n');
    await seedSkillCategories();
    
    console.log('\n');
    
    // Seed listings
    console.log('═══════════════════════════════════════');
    console.log('  STEP 2: Seeding Sample Listings');
    console.log('═══════════════════════════════════════\n');
    await seedListings();
    
    // Summary
    console.log('\n');
    console.log('═══════════════════════════════════════');
    console.log('  🎉 SEEDING COMPLETE!');
    console.log('═══════════════════════════════════════');
    console.log('\nYour Azora Forge marketplace is now ready with:');
    console.log('  ✅ 25+ skill categories');
    console.log('  ✅ 150+ subcategories');
    console.log('  ✅ 30+ sample service listings');
    console.log('\nYou can now:');
    console.log('  • Start the Azora Forge API: npm run start');
    console.log('  • Access categories: http://localhost:12345/api/categories');
    console.log('  • Browse marketplace UI at the marketplace-ui app');
    console.log('\n');
    
  } catch (error) {
    console.error('\n❌ Seeding failed:', error);
    process.exit(1);
  } finally {
    // Close MongoDB connection
    await mongoose.connection.close();
    console.log('👋 Database connection closed');
    process.exit(0);
  }
}

// Run the seeding
seedAll();
