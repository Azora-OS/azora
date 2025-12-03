#!/usr/bin/env node
/*
AZORA PROPRIETARY LICENSE
Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.
*/

/**
 * AZORA OS - CONSTITUTIONAL COMPLIANCE VERIFICATION
 * Verifies that all systems align with the Azora Constitution
 */

import { readFileSync, readdirSync, statSync } from 'fs';
import { join, extname } from 'path';

console.log('🏛️  AZORA OS - CONSTITUTIONAL COMPLIANCE VERIFICATION');
console.log('====================================================\n');

// Load the constitution
const constitutionPath = join(process.cwd(), 'codex', 'constitution', 'AZORA_CONSTITUTION.md');
let constitution = '';
try {
  constitution = readFileSync(constitutionPath, 'utf8');
  console.log('✅ Constitution loaded successfully\n');
} catch (error) {
  console.error('❌ FAILED TO LOAD CONSTITUTION!');
  process.exit(1);
}

// Articles to verify
const articles = {
  'Article I': 'Founding Principles',
  'Article II': 'Azora Coin Economics',
  'Article III': 'Founder Rights & Responsibilities',
  'Article IV': 'Student Economics',
  'Article V': 'Governance Structure',
  'Article VI': 'Infrastructure Independence'
};

// Verification results
const results = {
  passed: 0,
  failed: 0,
  warnings: 0
};

// Check license compliance
function checkLicenseCompliance() {
  console.log('📜 Checking license compliance...');
  
  let filesChecked = 0;
  let filesWithLicense = 0;
  
  function checkDirectory(dir) {
    const files = readdirSync(dir);
    files.forEach(file => {
      const fullPath = join(dir, file);
      const stat = statSync(fullPath);
      
      if (stat.isDirectory()) {
        // Skip node_modules and .git directories
        if (!fullPath.includes('node_modules') && !fullPath.includes('.git')) {
          checkDirectory(fullPath);
        }
      } else if (['.js', '.ts', '.tsx'].includes(extname(file))) {
        filesChecked++;
        try {
          const content = readFileSync(fullPath, 'utf8');
          if (content.includes('AZORA PROPRIETARY LICENSE')) {
            filesWithLicense++;
          }
        } catch (error) {
          // Ignore read errors
        }
      }
    });
  }
  
  checkDirectory(process.cwd());
  
  const complianceRate = filesChecked > 0 ? (filesWithLicense / filesChecked) * 100 : 0;
  console.log(`   Files checked: ${filesChecked}`);
  console.log(`   Files with license: ${filesWithLicense}`);
  console.log(`   Compliance rate: ${complianceRate.toFixed(1)}%`);
  
  if (complianceRate >= 95) {
    console.log('   ✅ License compliance: PASSED\n');
    results.passed++;
  } else if (complianceRate >= 80) {
    console.log('   ⚠️  License compliance: WARNING - Below 95%\n');
    results.warnings++;
  } else {
    console.log('   ❌ License compliance: FAILED - Below 80%\n');
    results.failed++;
  }
}

// Check infrastructure independence
function checkInfrastructureIndependence() {
  console.log('🏗️  Checking infrastructure independence (Article VI)...');
  
  // Check for external dependencies that should be minimized
  const packageJsonPath = join(process.cwd(), 'package.json');
  try {
    const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8'));
    
    // Check for prohibited external services
    const prohibitedDeps = [
      // Add any prohibited dependencies here
    ];
    
    const hasProhibitedDeps = prohibitedDeps.some(dep => 
      packageJson.dependencies?.[dep] || packageJson.devDependencies?.[dep]
    );
    
    if (!hasProhibitedDeps) {
      console.log('   ✅ No prohibited external dependencies found\n');
      results.passed++;
    } else {
      console.log('   ⚠️  Prohibited external dependencies detected\n');
      results.warnings++;
    }
  } catch (error) {
    console.log('   ⚠️  Could not check package.json\n');
    results.warnings++;
  }
}

// Check student empowerment
function checkStudentEmpowerment() {
  console.log('🎓 Checking student empowerment (Article IV)...');
  
  // Look for student-related code and earning mechanisms
  const studentKeywords = [
    'student', 'earn', 'learning', 'education', 'AZR', 'withdraw',
    'proof-of-knowledge', 'pok', 'mine', 'reward'
  ];
  
  let foundStudentFeatures = 0;
  
  function searchDirectory(dir) {
    const files = readdirSync(dir);
    files.forEach(file => {
      const fullPath = join(dir, file);
      const stat = statSync(fullPath);
      
      if (stat.isDirectory()) {
        if (!fullPath.includes('node_modules') && !fullPath.includes('.git')) {
          searchDirectory(fullPath);
        }
      } else if (['.js', '.ts', '.tsx', '.md'].includes(extname(file))) {
        try {
          const content = readFileSync(fullPath, 'utf8');
          studentKeywords.forEach(keyword => {
            if (content.toLowerCase().includes(keyword.toLowerCase())) {
              foundStudentFeatures++;
            }
          });
        } catch (error) {
          // Ignore read errors
        }
      }
    });
  }
  
  searchDirectory(join(process.cwd(), 'services'));
  searchDirectory(join(process.cwd(), 'ui'));
  
  console.log(`   Student empowerment features found: ${foundStudentFeatures}`);
  
  if (foundStudentFeatures > 50) {
    console.log('   ✅ Strong student empowerment mechanisms detected\n');
    results.passed++;
  } else if (foundStudentFeatures > 20) {
    console.log('   ⚠️  Moderate student empowerment mechanisms detected\n');
    results.warnings++;
  } else {
    console.log('   ❌ Limited student empowerment mechanisms detected\n');
    results.failed++;
  }
}

// Check founder rights
function checkFounderRights() {
  console.log('👑 Checking founder rights (Article III)...');
  
  // Look for founder-related code and withdrawal mechanisms
  const founderKeywords = [
    'founder', 'withdraw', 'vesting', 'allocation', 'emergency',
    'print', 'mint', 'treasury'
  ];
  
  let foundFounderFeatures = 0;
  
  function searchDirectory(dir) {
    const files = readdirSync(dir);
    files.forEach(file => {
      const fullPath = join(dir, file);
      const stat = statSync(fullPath);
      
      if (stat.isDirectory()) {
        if (!fullPath.includes('node_modules') && !fullPath.includes('.git')) {
          searchDirectory(fullPath);
        }
      } else if (['.js', '.ts', '.tsx', '.md'].includes(extname(file))) {
        try {
          const content = readFileSync(fullPath, 'utf8');
          founderKeywords.forEach(keyword => {
            if (content.toLowerCase().includes(keyword.toLowerCase())) {
              foundFounderFeatures++;
            }
          });
        } catch (error) {
          // Ignore read errors
        }
      }
    });
  }
  
  searchDirectory(join(process.cwd(), 'services'));
  searchDirectory(join(process.cwd(), 'infrastructure'));
  
  console.log(`   Founder rights features found: ${foundFounderFeatures}`);
  
  if (foundFounderFeatures > 20) {
    console.log('   ✅ Strong founder rights mechanisms detected\n');
    results.passed++;
  } else if (foundFounderFeatures > 10) {
    console.log('   ⚠️  Moderate founder rights mechanisms detected\n');
    results.warnings++;
  } else {
    console.log('   ❌ Limited founder rights mechanisms detected\n');
    results.failed++;
  }
}

// Check African ownership
function checkAfricanOwnership() {
  console.log('🇿🇦 Checking African ownership principles...');
  
  // Look for African-focused content and references
  const africanKeywords = [
    'africa', 'south africa', 'african', 'ubuntu', 'pan-african',
    'capitec', 'luno', 'rand', 'zar', 'sizwe'
  ];
  
  let foundAfricanFeatures = 0;
  
  function searchDirectory(dir) {
    const files = readdirSync(dir);
    files.forEach(file => {
      const fullPath = join(dir, file);
      const stat = statSync(fullPath);
      
      if (stat.isDirectory()) {
        if (!fullPath.includes('node_modules') && !fullPath.includes('.git')) {
          searchDirectory(fullPath);
        }
      } else if (['.js', '.ts', '.tsx', '.md'].includes(extname(file))) {
        try {
          const content = readFileSync(fullPath, 'utf8');
          africanKeywords.forEach(keyword => {
            if (content.toLowerCase().includes(keyword.toLowerCase())) {
              foundAfricanFeatures++;
            }
          });
        } catch (error) {
          // Ignore read errors
        }
      }
    });
  }
  
  searchDirectory(process.cwd());
  
  console.log(`   African ownership features found: ${foundAfricanFeatures}`);
  
  if (foundAfricanFeatures > 30) {
    console.log('   ✅ Strong African ownership principles detected\n');
    results.passed++;
  } else if (foundAfricanFeatures > 15) {
    console.log('   ⚠️  Moderate African ownership principles detected\n');
    results.warnings++;
  } else {
    console.log('   ❌ Limited African ownership principles detected\n');
    results.failed++;
  }
}

// Run all checks
checkLicenseCompliance();
checkInfrastructureIndependence();
checkStudentEmpowerment();
checkFounderRights();
checkAfricanOwnership();

// Final report
console.log('📊 CONSTITUTIONAL COMPLIANCE REPORT');
console.log('===================================\n');

console.log(`Passed: ${results.passed}`);
console.log(`Warnings: ${results.warnings}`);
console.log(`Failed: ${results.failed}`);

const totalChecks = results.passed + results.warnings + results.failed;
const complianceScore = totalChecks > 0 ? (results.passed / totalChecks) * 100 : 0;

console.log(`\nOverall Compliance Score: ${complianceScore.toFixed(1)}%`);

if (complianceScore >= 80) {
  console.log('\n✅ SYSTEM IS CONSTITUTIONALLY COMPLIANT');
  console.log('🚀 Ready for universal deployment!');
} else if (complianceScore >= 60) {
  console.log('\n⚠️  SYSTEM HAS MODERATE COMPLIANCE');
  console.log('Please address warnings before deployment');
} else {
  console.log('\n❌ SYSTEM IS NOT CONSTITUTIONALLY COMPLIANT');
  console.log('Critical issues must be resolved before deployment');
}

console.log('\n🌍 From Africa, For Humanity, Towards Infinity');
console.log('🏛️  Azora ES - The Foundation of Tomorrow');