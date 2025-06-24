#!/usr/bin/env node

/**
 * ETERNAL CAPSULE - Development Environment Setup
 * Phase 2: Infrastructure Setup Script
 * 
 * This script helps set up a complete development environment
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ENV_FILE = '.env.local';
const DB_FILE = './prisma/dev.db';

console.log('🚀 Eternal Capsule - Development Environment Setup');
console.log('================================================\n');

// Required environment variables for development
const requiredEnvVars = {
  // Database
  DATABASE_URL: 'file:./prisma/dev.db',
  
  // NextAuth
  NEXTAUTH_URL: 'http://localhost:3000',
  NEXTAUTH_SECRET: 'eternal-capsule-super-secret-key-minimum-32-characters-for-development-only',
  
  // App Configuration
  NEXT_PUBLIC_APP_URL: 'http://localhost:3000',
  
  // Cache
  CACHE_DEFAULT_TTL: '300',
  
  // Feature Flags
  NEXT_PUBLIC_GUESTBOOK_ENABLED: 'true',
  NEXT_PUBLIC_NFC_ENABLED: 'true',
  NEXT_PUBLIC_MAPS_ENABLED: 'true',
  
  // Rate Limiting
  RATE_LIMIT_GUESTBOOK_WINDOW: '900000',
  RATE_LIMIT_GUESTBOOK_MAX: '5',
  RATE_LIMIT_MEMORIAL_WINDOW: '3600000',
  RATE_LIMIT_MEMORIAL_MAX: '3'
};

function checkExistingEnv() {
  console.log('📋 Checking existing environment configuration...');
  
  if (fs.existsSync(ENV_FILE)) {
    const existing = fs.readFileSync(ENV_FILE, 'utf8');
    const existingVars = {};
    
    existing.split('\n').forEach(line => {
      const [key, value] = line.split('=');
      if (key && value) {
        existingVars[key.trim()] = value.trim();
      }
    });
    
    console.log(`✅ Found existing ${ENV_FILE}`);
    return existingVars;
  }
  
  console.log(`❌ No ${ENV_FILE} found`);
  return {};
}

function updateEnvFile(existingVars) {
  console.log('\n🔧 Updating environment configuration...');
  
  // Merge existing with required, prioritizing existing values
  const finalVars = { ...requiredEnvVars, ...existingVars };
  
  // Write the updated env file
  const envContent = Object.entries(finalVars)
    .map(([key, value]) => `${key}=${value}`)
    .join('\n');
  
  try {
    fs.writeFileSync(ENV_FILE, envContent);
    console.log(`✅ Updated ${ENV_FILE} with ${Object.keys(finalVars).length} variables`);
  } catch (error) {
    console.error('❌ Failed to write environment file:', error.message);
    process.exit(1);
  }
}

function setupDatabase() {
  console.log('\n🗄️  Setting up development database...');
  
  try {
    // Check if database exists
    if (fs.existsSync(DB_FILE)) {
      console.log('✅ Database file already exists');
    } else {
      console.log('📦 Creating new SQLite database...');
    }
    
    // Generate Prisma client
    console.log('⚙️  Generating Prisma client...');
    execSync('npx prisma generate', { stdio: 'inherit' });
    
    // Push database schema
    console.log('📊 Pushing database schema...');
    execSync('DATABASE_URL="file:./prisma/dev.db" npx prisma db push', { stdio: 'inherit' });
    
    console.log('✅ Database setup complete');
  } catch (error) {
    console.error('❌ Database setup failed:', error.message);
    console.log('💡 Try running: npx prisma db push --force-reset');
  }
}

function verifySetup() {
  console.log('\n🔍 Verifying setup...');
  
  const checks = [
    {
      name: 'Environment file',
      check: () => fs.existsSync(ENV_FILE),
      fix: 'Run this script again'
    },
    {
      name: 'Database file', 
      check: () => fs.existsSync(DB_FILE),
      fix: 'Run: npx prisma db push'
    },
    {
      name: 'Node modules',
      check: () => fs.existsSync('node_modules'),
      fix: 'Run: npm install'
    }
  ];
  
  let allPassed = true;
  
  checks.forEach(({ name, check, fix }) => {
    if (check()) {
      console.log(`✅ ${name}`);
    } else {
      console.log(`❌ ${name} - Fix: ${fix}`);
      allPassed = false;
    }
  });
  
  return allPassed;
}

function main() {
  try {
    // Step 1: Check existing environment
    const existingVars = checkExistingEnv();
    
    // Step 2: Update environment file
    updateEnvFile(existingVars);
    
    // Step 3: Setup database
    setupDatabase();
    
    // Step 4: Verify everything is working
    const allGood = verifySetup();
    
    if (allGood) {
      console.log('\n🎉 Development environment setup complete!');
      console.log('\nNext steps:');
      console.log('1. Run: npm run dev');
      console.log('2. Visit: http://localhost:3000');
      console.log('3. Test: curl http://localhost:3000/api/health');
    } else {
      console.log('\n⚠️  Setup completed with warnings. Please address the issues above.');
    }
    
  } catch (error) {
    console.error('\n💥 Setup failed:', error.message);
    process.exit(1);
  }
}

// Only run if called directly
if (require.main === module) {
  main();
}

module.exports = { main, checkExistingEnv, updateEnvFile, setupDatabase, verifySetup }; 