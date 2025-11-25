/**
 * Code Signing Script for AzStudio
 * 
 * This script handles Windows Authenticode code signing for the built application.
 * It supports both development (self-signed) and production (commercial certificate) signing.
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Configuration
const config = {
  // Certificate paths (from environment variables)
  certificatePath: process.env.CSC_LINK || process.env.WIN_CSC_LINK,
  certificatePassword: process.env.CSC_KEY_PASSWORD || process.env.WIN_CSC_KEY_PASSWORD,
  
  // Timestamp servers (fallback list)
  timestampServers: [
    'http://timestamp.digicert.com',
    'http://timestamp.comodoca.com',
    'http://timestamp.sectigo.com',
    'http://timestamp.globalsign.com'
  ],
  
  // Signing options
  signTool: 'signtool.exe', // Windows SDK tool
  algorithm: 'sha256',
  description: 'AzStudio - Desktop IDE for Azora',
  url: 'https://azora.com/azstudio'
};

/**
 * Check if code signing is configured
 */
function isSigningConfigured() {
  if (!config.certificatePath) {
    console.log('⚠️  Code signing not configured (CSC_LINK not set)');
    return false;
  }
  
  if (!fs.existsSync(config.certificatePath)) {
    console.error('❌ Certificate file not found:', config.certificatePath);
    return false;
  }
  
  if (!config.certificatePassword) {
    console.error('❌ Certificate password not set (CSC_KEY_PASSWORD)');
    return false;
  }
  
  return true;
}

/**
 * Sign a file using Windows Authenticode
 */
function signFile(filePath, timestampUrl) {
  const command = [
    config.signTool,
    'sign',
    '/f', `"${config.certificatePath}"`,
    '/p', `"${config.certificatePassword}"`,
    '/fd', config.algorithm,
    '/tr', timestampUrl,
    '/td', config.algorithm,
    '/d', `"${config.description}"`,
    '/du', `"${config.url}"`,
    `"${filePath}"`
  ].join(' ');
  
  try {
    execSync(command, { stdio: 'inherit' });
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Sign with timestamp server fallback
 */
function signWithFallback(filePath) {
  console.log(`📝 Signing: ${path.basename(filePath)}`);
  
  for (const timestampUrl of config.timestampServers) {
    console.log(`   Trying timestamp server: ${timestampUrl}`);
    
    if (signFile(filePath, timestampUrl)) {
      console.log(`✅ Successfully signed with ${timestampUrl}`);
      return true;
    }
    
    console.log(`   Failed, trying next server...`);
  }
  
  console.error(`❌ Failed to sign ${filePath} with all timestamp servers`);
  return false;
}

/**
 * Verify a signed file
 */
function verifySignature(filePath) {
  console.log(`🔍 Verifying signature: ${path.basename(filePath)}`);
  
  try {
    execSync(`${config.signTool} verify /pa "${filePath}"`, { stdio: 'inherit' });
    console.log('✅ Signature verified successfully');
    return true;
  } catch (error) {
    console.error('❌ Signature verification failed');
    return false;
  }
}

/**
 * Create a self-signed certificate for development
 */
function createSelfSignedCert() {
  console.log('🔧 Creating self-signed certificate for development...');
  
  const certPath = path.join(__dirname, '..', 'build', 'dev-cert.pfx');
  const certPassword = 'development';
  
  try {
    // Create certificate using PowerShell
    const psScript = `
      $cert = New-SelfSignedCertificate -Type CodeSigningCert -Subject "CN=AzStudio Development" -CertStoreLocation Cert:\\CurrentUser\\My
      $pwd = ConvertTo-SecureString -String "${certPassword}" -Force -AsPlainText
      Export-PfxCertificate -Cert $cert -FilePath "${certPath}" -Password $pwd
      Remove-Item -Path "Cert:\\CurrentUser\\My\\$($cert.Thumbprint)"
    `;
    
    execSync(`powershell -Command "${psScript}"`, { stdio: 'inherit' });
    
    console.log('✅ Self-signed certificate created');
    console.log(`   Path: ${certPath}`);
    console.log(`   Password: ${certPassword}`);
    console.log('\n⚠️  This certificate is for DEVELOPMENT ONLY');
    console.log('   Users will see security warnings when installing');
    console.log('   For production, obtain a commercial code signing certificate\n');
    
    return { path: certPath, password: certPassword };
  } catch (error) {
    console.error('❌ Failed to create self-signed certificate:', error.message);
    return null;
  }
}

/**
 * Main signing function
 */
function main() {
  console.log('🔐 AzStudio Code Signing\n');
  
  // Check if signing is configured
  if (!isSigningConfigured()) {
    console.log('\n📋 To enable code signing:');
    console.log('   1. Obtain a Windows code signing certificate (.pfx)');
    console.log('   2. Set environment variables:');
    console.log('      - CSC_LINK=path/to/certificate.pfx');
    console.log('      - CSC_KEY_PASSWORD=your_password');
    console.log('   3. Run the build again\n');
    console.log('   Or create a development certificate:');
    console.log('      node scripts/sign.js --create-dev-cert\n');
    
    if (process.argv.includes('--create-dev-cert')) {
      createSelfSignedCert();
    }
    
    return;
  }
  
  // Find files to sign
  const releaseDir = path.join(__dirname, '..', 'release');
  const filesToSign = [];
  
  // Sign executables
  if (fs.existsSync(releaseDir)) {
    const files = fs.readdirSync(releaseDir);
    
    for (const file of files) {
      if (file.endsWith('.exe')) {
        filesToSign.push(path.join(releaseDir, file));
      }
    }
    
    // Sign unpacked executable
    const unpackedExe = path.join(releaseDir, 'win-unpacked', 'AzStudio.exe');
    if (fs.existsSync(unpackedExe)) {
      filesToSign.push(unpackedExe);
    }
  }
  
  if (filesToSign.length === 0) {
    console.log('⚠️  No files found to sign');
    console.log('   Build the application first: npm run build');
    return;
  }
  
  // Sign all files
  console.log(`Found ${filesToSign.length} file(s) to sign\n`);
  
  let successCount = 0;
  for (const file of filesToSign) {
    if (signWithFallback(file)) {
      successCount++;
      
      // Verify signature
      if (process.argv.includes('--verify')) {
        verifySignature(file);
      }
    }
  }
  
  console.log(`\n✅ Signed ${successCount}/${filesToSign.length} file(s)`);
  
  if (successCount < filesToSign.length) {
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = {
  isSigningConfigured,
  signFile,
  signWithFallback,
  verifySignature,
  createSelfSignedCert
};
