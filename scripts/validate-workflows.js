#!/usr/bin/env node

/**
 * Workflow Validation Script
 * Validates GitHub Actions workflows for syntax and completeness
 */

const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

const WORKFLOWS_DIR = path.join(__dirname, '..', '.github', 'workflows');
const REQUIRED_WORKFLOWS = [
  'test.yml',
  'e2e.yml',
  'lint.yml',
  'typecheck.yml',
  'security.yml',
  'deploy-staging.yml',
  'deploy-production.yml',
  'release.yml',
  'dependency-update.yml'
];

const REQUIRED_SECRETS = [
  'DOCKER_USERNAME',
  'DOCKER_PASSWORD',
  'STAGING_HOST',
  'STAGING_USER',
  'STAGING_KEY',
  'PROD_HOST',
  'PROD_USER',
  'PROD_KEY',
  'PROD_DATABASE_URL',
  'SLACK_WEBHOOK',
  'NPM_TOKEN',
  'RENOVATE_TOKEN'
];

function validateWorkflowFile(filePath) {
  const errors = [];
  const warnings = [];
  
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const workflow = yaml.load(content);
    
    // Check required fields
    if (!workflow.name) {
      errors.push('Missing workflow name');
    }
    
    if (!workflow.on) {
      errors.push('Missing workflow triggers');
    }
    
    if (!workflow.jobs || Object.keys(workflow.jobs).length === 0) {
      errors.push('No jobs defined');
    }
    
    // Check for best practices
    if (workflow.on && !workflow.on.workflow_dispatch) {
      warnings.push('Consider adding workflow_dispatch for manual triggers');
    }
    
    // Check concurrency settings for deployment workflows
    if (filePath.includes('deploy') && !workflow.concurrency) {
      warnings.push('Deployment workflow should have concurrency control');
    }
    
    return { valid: errors.length === 0, errors, warnings };
  } catch (error) {
    return { 
      valid: false, 
      errors: [`Failed to parse YAML: ${error.message}`], 
      warnings: [] 
    };
  }
}

function checkWorkflowExists(workflowName) {
  const filePath = path.join(WORKFLOWS_DIR, workflowName);
  return fs.existsSync(filePath);
}

function validateAllWorkflows() {
  console.log('🔍 Validating GitHub Workflows...\n');
  
  let totalErrors = 0;
  let totalWarnings = 0;
  const results = [];
  
  // Check if workflows directory exists
  if (!fs.existsSync(WORKFLOWS_DIR)) {
    console.error('❌ Workflows directory not found:', WORKFLOWS_DIR);
    process.exit(1);
  }
  
  // Validate each required workflow
  REQUIRED_WORKFLOWS.forEach(workflowName => {
    const exists = checkWorkflowExists(workflowName);
    
    if (!exists) {
      console.log(`❌ ${workflowName}: NOT FOUND`);
      totalErrors++;
      results.push({ name: workflowName, status: 'missing' });
      return;
    }
    
    const filePath = path.join(WORKFLOWS_DIR, workflowName);
    const validation = validateWorkflowFile(filePath);
    
    if (validation.valid) {
      console.log(`✅ ${workflowName}: VALID`);
      results.push({ name: workflowName, status: 'valid' });
    } else {
      console.log(`❌ ${workflowName}: INVALID`);
      validation.errors.forEach(err => {
        console.log(`   Error: ${err}`);
        totalErrors++;
      });
      results.push({ name: workflowName, status: 'invalid', errors: validation.errors });
    }
    
    if (validation.warnings.length > 0) {
      validation.warnings.forEach(warn => {
        console.log(`   ⚠️  Warning: ${warn}`);
        totalWarnings++;
      });
    }
  });
  
  console.log('\n📊 Summary:');
  console.log(`   Total Workflows: ${REQUIRED_WORKFLOWS.length}`);
  console.log(`   Valid: ${results.filter(r => r.status === 'valid').length}`);
  console.log(`   Invalid: ${results.filter(r => r.status === 'invalid').length}`);
  console.log(`   Missing: ${results.filter(r => r.status === 'missing').length}`);
  console.log(`   Errors: ${totalErrors}`);
  console.log(`   Warnings: ${totalWarnings}`);
  
  // Check for required secrets documentation
  console.log('\n🔐 Required Secrets:');
  REQUIRED_SECRETS.forEach(secret => {
    console.log(`   - ${secret}`);
  });
  
  console.log('\n💡 Next Steps:');
  console.log('   1. Configure secrets in GitHub repository settings');
  console.log('   2. Set up environment protection rules');
  console.log('   3. Test workflows with a sample PR');
  console.log('   4. Configure Slack webhook for notifications');
  
  if (totalErrors > 0) {
    console.log('\n❌ Validation failed with errors');
    process.exit(1);
  } else {
    console.log('\n✅ All workflows validated successfully!');
    process.exit(0);
  }
}

// Run validation
validateAllWorkflows();
