#!/usr/bin/env node

/**
 * Test script for automated course generation
 * Usage: npm run test-course
 */

import * as fs from 'fs';
import * as path from 'path';
import * as yaml from 'yaml';

const ELARA_API = 'http://localhost:3004';

async function generateCourse(outlineFile: string) {
    console.log('\n🚀 COURSE GENERATION TEST\n');
    console.log(`Reading outline from: ${outlineFile}`);

    // Read YAML file
    const yamlContent = fs.readFileSync(outlineFile, 'utf8');
    const outline = yaml.parse(yamlContent);

    console.log(`\nCourse: ${outline.title}`);
    console.log(`Modules: ${outline.modules.length}`);
    console.log(`Lessons: ${outline.modules.reduce((sum: number, m: any) => sum + m.lessons.length, 0)}`);
    console.log(`\nSending to Elara API...`);

    // Call API
    const response = await fetch(`${ELARA_API}/api/generate/auto-course`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ outline })
    });

    const result = await response.json();

    if (result.success) {
        console.log('\n✅ SUCCESS!\n');
        console.log(`Course ID: ${result.course.courseId}`);
        console.log(`URL: ${result.course.url}`);
        console.log(`Status: ${result.course.status}`);
        console.log(`\nStats:`);
        console.log(`  Lessons: ${result.stats.lessons}`);
        console.log(`  Modules: ${result.stats.modules}`);
        console.log(`  Duration: ${result.stats.duration} minutes`);
        console.log(`  Generation Time: ${result.stats.generationTime} seconds`);
        console.log(`  Price: R${result.stats.price}`);
    } else {
        console.log('\n❌ FAILED!\n');
        console.log(`Error: ${result.error}`);
        console.log(`Details: ${result.details}`);
    }
}

// Get outline file from command line or use default
const outlineFile = process.argv[2] || path.join(__dirname, 'examples', 'python-course.yaml');

if (!fs.existsSync(outlineFile)) {
    console.error(`Error: Outline file not found: ${outlineFile}`);
    process.exit(1);
}

generateCourse(outlineFile)
    .then(() => {
        console.log('\n✅ Test complete\n');
        process.exit(0);
    })
    .catch((error) => {
        console.error('\n❌ Test failed:', error);
        process.exit(1);
    });
