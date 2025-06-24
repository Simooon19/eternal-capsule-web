#!/usr/bin/env node
/**
 * Environment validation script for Minneslund
 * Ensures all required environment variables are set for different environments
 */

const path = require('path');
const fs = require('fs');

// Color codes for console output
const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// Required environment variables by environment
const envConfig = {
  development: {
    required: [
      'NEXT_PUBLIC_SITE_URL',
      'NEXT_PUBLIC_SANITY_PROJECT_ID',
      'DATABASE_URL',
      'NEXTAUTH_SECRET'
    ],
    optional: [
      'SANITY_API_TOKEN',
      'STRIPE_SECRET_KEY',
      'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY',
      'RESEND_API_KEY',
      'EMAIL_FROM'
    ]
  },
  production: {
    required: [
      'NEXT_PUBLIC_SITE_URL',
      'NEXT_PUBLIC_SANITY_PROJECT_ID',
      'SANITY_API_TOKEN',
      'DATABASE_URL',
      'NEXTAUTH_SECRET',
      'NEXTAUTH_URL',
      'STRIPE_SECRET_KEY',
      'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY',
      'RESEND_API_KEY',
      'EMAIL_FROM'
    ],
    optional: [
      'REDIS_URL',
      'SENTRY_DSN',
      'SENTRY_ORG',
      'SENTRY_PROJECT'
    ]
  }
};

function validateEnvironment() {
  const env = process.env.NODE_ENV || 'development';
  const config = envConfig[env] || envConfig.development;
  
  log(`\n${colors.bold}🔍 Validating environment: ${env}${colors.reset}`, 'blue');
  
  let hasErrors = false;
  let hasWarnings = false;
  
  // Check required variables
  log('\n📋 Required Variables:', 'bold');
  config.required.forEach(varName => {
    const value = process.env[varName];
    if (!value) {
      log(`  ❌ ${varName}: Missing (REQUIRED)`, 'red');
      hasErrors = true;
    } else {
      // Mask sensitive values
      const maskedValue = varName.toLowerCase().includes('secret') || 
                         varName.toLowerCase().includes('key') || 
                         varName.toLowerCase().includes('token')
        ? value.substring(0, 8) + '...'
        : value;
      log(`  ✅ ${varName}: ${maskedValue}`, 'green');
    }
  });
  
  // Check optional variables
  log('\n🔧 Optional Variables:', 'bold');
  config.optional.forEach(varName => {
    const value = process.env[varName];
    if (!value) {
      log(`  ⚠️  ${varName}: Not set (optional)`, 'yellow');
      hasWarnings = true;
    } else {
      const maskedValue = varName.toLowerCase().includes('secret') || 
                         varName.toLowerCase().includes('key') || 
                         varName.toLowerCase().includes('token')
        ? value.substring(0, 8) + '...'
        : value;
      log(`  ✅ ${varName}: ${maskedValue}`, 'green');
    }
  });
  
  // Check for .env file
  const envFile = env === 'development' ? '.env.local' : '.env';
  const envPath = path.join(process.cwd(), envFile);
  
  log('\n📄 Environment Files:', 'bold');
  if (fs.existsSync(envPath)) {
    log(`  ✅ ${envFile}: Found`, 'green');
  } else {
    log(`  ⚠️  ${envFile}: Not found`, 'yellow');
    hasWarnings = true;
  }
  
  // Check env.example
  const envExamplePath = path.join(process.cwd(), 'env.example');
  if (fs.existsSync(envExamplePath)) {
    log(`  ✅ env.example: Available for reference`, 'green');
  }
  
  // Summary
  log('\n📊 Summary:', 'bold');
  if (hasErrors) {
    log('  ❌ Environment validation failed - missing required variables', 'red');
    process.exit(1);
  } else if (hasWarnings) {
    log('  ⚠️  Environment validation passed with warnings', 'yellow');
    log('  💡 Some optional features may not work without missing variables', 'blue');
  } else {
    log('  ✅ Environment validation passed - all variables configured', 'green');
  }
  
  log('\n🚀 Ready to run!', 'green');
}

// Additional validation functions
function validateDatabase() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) return;
  
  log('\n🗄️  Database Configuration:', 'bold');
  
  if (databaseUrl.startsWith('postgresql://') || databaseUrl.startsWith('postgres://')) {
    log('  ✅ PostgreSQL detected', 'green');
  } else if (databaseUrl.startsWith('file:')) {
    log('  ✅ SQLite detected (development)', 'green');
  } else {
    log('  ⚠️  Unknown database type', 'yellow');
  }
}

function validateSanity() {
  const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
  const token = process.env.SANITY_API_TOKEN;
  
  log('\n🎨 Sanity CMS Configuration:', 'bold');
  
  if (projectId) {
    log(`  ✅ Project ID: ${projectId}`, 'green');
  }
  
  if (token) {
    log('  ✅ API Token: Configured', 'green');
  } else {
    log('  ⚠️  API Token: Not set (read-only mode)', 'yellow');
    log('  💡 Some CMS features will use mock data', 'blue');
  }
}

// Run validations
if (require.main === module) {
  validateEnvironment();
  validateDatabase();
  validateSanity();
}

module.exports = { validateEnvironment, validateDatabase, validateSanity };