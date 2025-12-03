// Error Check Script
const fs = require("fs");
const path = require("path");

const errors = [];
const warnings = [];

// Check for syntax errors in common files
function checkFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, "utf8");
    
    // Check for common issues
    if (content.includes("undefined") && content.includes("require(")) {
      warnings.push(`Potential undefined require in: ${filePath}`);
    }
    
    // Check JSON files
    if (filePath.endsWith(".json")) {
      try {
        JSON.parse(content);
      } catch (e) {
        errors.push(`Invalid JSON: ${filePath} - ${e.message}`);
      }
    }
  } catch (e) {
    errors.push(`Cannot read: ${filePath} - ${e.message}`);
  }
}

// Check critical files
const criticalFiles = [
  "package.json",
  "tsconfig.json",
  "next.config.ts",
  "hardhat.config.ts"
];

criticalFiles.forEach(checkFile);

console.log("=== Error Check Results ===");
if (errors.length > 0) {
  console.log("\n❌ Errors:");
  errors.forEach(e => console.log(`  - ${e}`));
} else {
  console.log("\n✅ No critical errors found");
}

if (warnings.length > 0) {
  console.log("\n⚠️  Warnings:");
  warnings.forEach(w => console.log(`  - ${w}`));
}
