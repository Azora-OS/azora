#!/usr/bin/env node

const aiFamilyService = require('./index');

async function runDemo() {
    console.log('🤖 Azora AI Family Service Demo');
    console.log('================================\n');
    
    // Test 1: Get family configuration
    console.log('1. Family Configuration:');
    const familyConfig = aiFamilyService.getFamilyConfig();
    console.log(`   Family members: ${Object.keys(familyConfig).join(', ')}\n`);
    
    // Test 2: Personalized greeting
    console.log('2. Personalized Greetings:');
    const elaraGreeting = await aiFamilyService.getPersonalizedGreeting('demo-user', 'elara');
    console.log(`   Elara: ${elaraGreeting}\n`);
    
    const sankofaGreeting = await aiFamilyService.getPersonalizedGreeting('demo-user', 'sankofa');
    console.log(`   Sankofa: ${sankofaGreeting}\n`);
    
    // Test 3: Route messages to appropriate family members
    console.log('3. Message Routing:');
    
    // Finance query -> should route to Kofi
    const financeResponse = await aiFamilyService.routeMessage(
        'demo-user', 
        'I need help managing my budget', 
        {}
    );
    console.log(`   Finance query -> ${financeResponse.from}: ${financeResponse.response}\n`);
    
    // Learning query -> should route to Themba
    const learningResponse = await aiFamilyService.routeMessage(
        'demo-user', 
        'I feel stuck in my learning journey', 
        { subject: 'programming', progress: 45 }
    );
    console.log(`   Learning query -> ${learningResponse.from}: ${JSON.stringify(learningResponse.response, null, 2)}\n`);
    
    // Wisdom query -> should route to Sankofa
    const wisdomResponse = await aiFamilyService.routeMessage(
        'demo-user', 
        'I want to learn from the past', 
        {}
    );
    console.log(`   Wisdom query -> ${wisdomResponse.from}: ${wisdomResponse.response}\n`);
    
    // Test 4: Family consultation
    console.log('4. Family Consultation:');
    const consultation = await aiFamilyService.consultFamily('demo-user', 'career development');
    console.log(`   Topic: ${consultation.topic}`);
    console.log(`   Coordinated Response: ${consultation.coordinatedResponse}\n`);
    
    // Test 5: Interaction stats
    console.log('5. Interaction Stats:');
    const stats = aiFamilyService.getInteractionStats();
    console.log(`   Total interactions: ${stats.totalInteractions}`);
    console.log(`   Family member usage: ${JSON.stringify(stats.familyMemberUsage, null, 2)}\n`);
    
    console.log('🎉 Demo completed successfully!');
}

// Run the demo
runDemo().catch(console.error);