/**
 * Publish Release Script
 * 
 * Organizes built installers into channel-specific directories
 * and generates update manifests for the update server.
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const yaml = require('js-yaml');

const RELEASE_DIR = path.join(__dirname, '..', 'release');
const PACKAGE_JSON = require('../package.json');

/**
 * Get file hash
 */
function getFileHash(filePath, algorithm = 'sha512') {
  const fileBuffer = fs.readFileSync(filePath);
  const hashSum = crypto.createHash(algorithm);
  hashSum.update(fileBuffer);
  return hashSum.digest('base64');
}

/**
 * Get file size
 */
function getFileSize(filePath) {
  const stats = fs.statSync(filePath);
  return stats.size;
}

/**
 * Generate update manifest (latest.yml)
 */
function generateManifest(channel, version, files) {
  const manifest = {
    version,
    releaseDate: new Date().toISOString(),
    files: files.map(file => ({
      url: `https://updates.azora.com/azstudio/${channel}/${version}/${file.name}`,
      sha512: file.hash,
      size: file.size
    }))
  };
  
  return yaml.dump(manifest);
}

/**
 * Publish release to channel
 */
function publishRelease(channel = 'stable') {
  console.log(`📦 Publishing AzStudio ${PACKAGE_JSON.version} to ${channel} channel\n`);
  
  // Create channel directory
  const channelDir = path.join(RELEASE_DIR, channel);
  const versionDir = path.join(channelDir, PACKAGE_JSON.version);
  
  if (!fs.existsSync(channelDir)) {
    fs.mkdirSync(channelDir, { recursive: true });
  }
  
  if (!fs.existsSync(versionDir)) {
    fs.mkdirSync(versionDir, { recursive: true });
  }
  
  // Find installer files
  const installerFiles = fs.readdirSync(RELEASE_DIR)
    .filter(file => file.endsWith('.exe') || file.endsWith('.appx'))
    .map(file => ({
      name: file,
      source: path.join(RELEASE_DIR, file),
      dest: path.join(versionDir, file)
    }));
  
  if (installerFiles.length === 0) {
    console.error('❌ No installer files found in release directory');
    console.log('   Run "npm run package" first');
    process.exit(1);
  }
  
  // Copy files and calculate hashes
  const fileInfo = [];
  
  for (const file of installerFiles) {
    console.log(`📄 Processing ${file.name}...`);
    
    // Copy file
    fs.copyFileSync(file.source, file.dest);
    
    // Calculate hash and size
    const hash = getFileHash(file.dest);
    const size = getFileSize(file.dest);
    
    fileInfo.push({
      name: file.name,
      hash,
      size
    });
    
    console.log(`   ✓ Copied to ${channel}/${PACKAGE_JSON.version}/`);
    console.log(`   ✓ Size: ${(size / 1024 / 1024).toFixed(2)} MB`);
    console.log(`   ✓ SHA512: ${hash.substring(0, 16)}...`);
  }
  
  // Generate manifest
  console.log(`\n📝 Generating update manifest...`);
  const manifest = generateManifest(channel, PACKAGE_JSON.version, fileInfo);
  const manifestPath = path.join(channelDir, 'latest.yml');
  fs.writeFileSync(manifestPath, manifest);
  console.log(`   ✓ Manifest saved to ${channel}/latest.yml`);
  
  // Generate release notes template
  const releaseNotesPath = path.join(versionDir, 'RELEASE_NOTES.md');
  if (!fs.existsSync(releaseNotesPath)) {
    const releaseNotes = `# AzStudio ${PACKAGE_JSON.version} Release Notes

## What's New

- Feature 1
- Feature 2
- Feature 3

## Bug Fixes

- Fix 1
- Fix 2

## Improvements

- Improvement 1
- Improvement 2

## Breaking Changes

None

## Known Issues

None

---

Released: ${new Date().toLocaleDateString()}
`;
    fs.writeFileSync(releaseNotesPath, releaseNotes);
    console.log(`   ✓ Release notes template created`);
  }
  
  console.log(`\n✅ Release published successfully!`);
  console.log(`\nNext steps:`);
  console.log(`  1. Edit release notes: ${releaseNotesPath}`);
  console.log(`  2. Upload ${channel}/ directory to update server`);
  console.log(`  3. Test update: npm run test:update`);
  console.log(`  4. Announce release to users\n`);
}

/**
 * Promote release between channels
 */
function promoteRelease(fromChannel, toChannel, version) {
  console.log(`🚀 Promoting ${version} from ${fromChannel} to ${toChannel}\n`);
  
  const sourceDir = path.join(RELEASE_DIR, fromChannel, version);
  const targetDir = path.join(RELEASE_DIR, toChannel, version);
  
  if (!fs.existsSync(sourceDir)) {
    console.error(`❌ Source version not found: ${fromChannel}/${version}`);
    process.exit(1);
  }
  
  // Copy version directory
  fs.cpSync(sourceDir, targetDir, { recursive: true });
  console.log(`✓ Copied ${fromChannel}/${version} to ${toChannel}/${version}`);
  
  // Update manifest
  const sourceManifest = path.join(RELEASE_DIR, fromChannel, 'latest.yml');
  const targetManifest = path.join(RELEASE_DIR, toChannel, 'latest.yml');
  
  if (fs.existsSync(sourceManifest)) {
    const manifest = fs.readFileSync(sourceManifest, 'utf-8');
    const updatedManifest = manifest.replace(new RegExp(fromChannel, 'g'), toChannel);
    fs.writeFileSync(targetManifest, updatedManifest);
    console.log(`✓ Updated manifest for ${toChannel} channel`);
  }
  
  console.log(`\n✅ Promotion complete!`);
}

// CLI
const args = process.argv.slice(2);
const command = args[0];

if (command === 'publish') {
  const channel = args[1] || 'stable';
  publishRelease(channel);
} else if (command === 'promote') {
  const fromChannel = args[1];
  const toChannel = args[2];
  const version = args[3] || PACKAGE_JSON.version;
  
  if (!fromChannel || !toChannel) {
    console.error('Usage: node publish-release.js promote <from-channel> <to-channel> [version]');
    process.exit(1);
  }
  
  promoteRelease(fromChannel, toChannel, version);
} else {
  console.log('AzStudio Release Publisher\n');
  console.log('Usage:');
  console.log('  node publish-release.js publish [channel]');
  console.log('  node publish-release.js promote <from-channel> <to-channel> [version]');
  console.log('\nChannels: alpha, beta, stable');
  console.log('\nExamples:');
  console.log('  node publish-release.js publish alpha');
  console.log('  node publish-release.js promote beta stable 0.1.0');
}
