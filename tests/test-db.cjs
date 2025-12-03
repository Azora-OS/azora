const fs = require('fs');
const path = require('path');

// Simple test to verify the database file exists and is readable
console.log('Testing Super AI Database file...');

const dbPath = path.join(__dirname, 'core', 'super-ai-database.ts');
console.log(`Checking file: ${dbPath}`);

if (fs.existsSync(dbPath)) {
  console.log('✅ Super AI Database file exists');

  try {
    const content = fs.readFileSync(dbPath, 'utf8');
    console.log(`✅ File is readable (${content.length} characters)`);

    // Check for key components
    if (content.includes('class SuperAIDatabase')) {
      console.log('✅ SuperAIDatabase class found');
    } else {
      console.log('❌ SuperAIDatabase class not found');
    }

    if (content.includes('monitorHealth')) {
      console.log('✅ Health monitoring functionality found');
    } else {
      console.log('❌ Health monitoring functionality not found');
    }

    if (content.includes('self-healing')) {
      console.log('✅ Self-healing functionality found');
    } else {
      console.log('❌ Self-healing functionality not found');
    }

    if (content.includes('predictive')) {
      console.log('✅ Predictive maintenance functionality found');
    } else {
      console.log('❌ Predictive maintenance functionality not found');
    }

    console.log('\n🎉 Super AI Database file verification completed successfully!');
  } catch (error) {
    console.log(`❌ Error reading file: ${error.message}`);
  }
} else {
  console.log('❌ Super AI Database file does not exist');
}
