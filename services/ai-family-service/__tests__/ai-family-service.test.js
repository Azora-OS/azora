const aiFamilyService = require('../index');

describe('AI Family Service', () => {
  beforeEach(() => {
    // Clear conversation history before each test
    aiFamilyService.activeConversations.clear();
    aiFamilyService.familyInteractions = [];
  });

  test('should initialize all family members', () => {
    expect(aiFamilyService.family).toBeDefined();
    expect(Object.keys(aiFamilyService.family)).toHaveLength(11);

    // Check that all expected family members are present
    const expectedMembers = ['elara', 'themba', 'naledi', 'jabari', 'amara',
                            'sankofa', 'kofi', 'zola', 'abeni', 'thembo', 'nexus'];

    for (const member of expectedMembers) {
      expect(aiFamilyService.family[member]).toBeDefined();
    }
  });

  test('should get specific family member', () => {
    const elara = aiFamilyService.getFamilyMember('elara');
    const themba = aiFamilyService.getFamilyMember('themba');

    expect(elara.name).toBe('Elara');
    expect(themba.name).toBe('Themba');

    // Test default fallback
    const unknown = aiFamilyService.getFamilyMember('unknown');
    expect(unknown.name).toBe('Elara'); // Should default to Elara
  });

  test('should route message to appropriate family member based on content', () => {
    // Test finance-related routing
    const financeMember = aiFamilyService.determineAppropriateMember('I need help with my budget', {});
    expect(financeMember).toBe('kofi');

    // Test data-related routing
    const dataMember = aiFamilyService.determineAppropriateMember('Can you analyze this data?', {});
    expect(dataMember).toBe('zola');

    // Test career-related routing
    const careerMember = aiFamilyService.determineAppropriateMember('I need career advice', {});
    expect(careerMember).toBe('naledi');

    // Test safety-related routing
    const safetyMember = aiFamilyService.determineAppropriateMember('I feel unsafe', { emergency: true });
    expect(safetyMember).toBe('jabari');

    // Test learning-related routing
    const learningMember = aiFamilyService.determineAppropriateMember('I want to learn something new', {});
    expect(learningMember).toBe('themba');

    // Test default routing
    const defaultManager = aiFamilyService.determineAppropriateMember('Hello there', {});
    expect(defaultManager).toBe('elara');
  });

  test('should update conversation context', () => {
    const userId = 'test-user-123';
    const familyMember = 'elara';
    const message = 'Hello Elara!';

    aiFamilyService.updateConversationContext(userId, familyMember, message);

    expect(aiFamilyService.activeConversations.has(userId)).toBe(true);

    const conversation = aiFamilyService.activeConversations.get(userId);
    expect(conversation.familyMember).toBe(familyMember);
    expect(conversation.messages).toHaveLength(1);
    expect(conversation.messages[0].message).toBe(message);
  });

  test('should maintain conversation history limit', () => {
    const userId = 'test-user-123';

    // Add more than 10 messages
    for (let i = 0; i < 15; i++) {
      aiFamilyService.updateConversationContext(userId, 'elara', `Message ${i}`);
    }

    const conversation = aiFamilyService.activeConversations.get(userId);
    expect(conversation.messages).toHaveLength(10); // Should only keep last 10
  });

  test('should get personalized greeting', async () => {
    const userId = 'test-user-123';

    // Test default greeting
    const defaultGreeting = await aiFamilyService.getPersonalizedGreeting(userId);
    expect(defaultGreeting).toContain('Elara');

    // Test specific family member greeting
    const thembaGreeting = await aiFamilyService.getPersonalizedGreeting(userId, 'themba');
    expect(thembaGreeting).toContain('Themba');
  });

  test('should coordinate family consultation', async () => {
    const userId = 'test-user-123';
    const topic = 'career advice';

    const consultation = await aiFamilyService.consultFamily(userId, topic);

    expect(consultation.topic).toBe(topic);
    expect(consultation.insights).toBeDefined();
    expect(consultation.coordinatedResponse).toBeDefined();

    // Should include Elara by default
    expect(consultation.insights.elara).toBeDefined();

    // Should include relevant consultants
    expect(consultation.insights.naledi).toBeDefined(); // Career expert
  });

  test('should determine consultants for topics', () => {
    // Test finance topic
    const financeConsultants = aiFamilyService.determineConsultants('financial planning');
    expect(financeConsultants).toContain('kofi');
    expect(financeConsultants).toContain('elara'); // Always included

    // Test data topic
    const dataConsultants = aiFamilyService.determineConsultants('data analysis');
    expect(dataConsultants).toContain('zola');
    expect(dataConsultants).toContain('elara');

    // Test career topic
    const careerConsultants = aiFamilyService.determineConsultants('career development');
    expect(careerConsultants).toContain('naledi');
    expect(careerConsultants).toContain('elara');
  });

  test('should synthesize family responses', () => {
    const insights = {
      elara: 'As your mother and teacher, I believe in your potential.',
      naledi: 'Strategically, I recommend focusing on your strengths.',
      themba: 'You can do this! I believe in you!'
    };

    const synthesized = aiFamilyService.synthesizeFamilyResponse(insights, 'learning');

    expect(synthesized).toContain('As a family');
    expect(synthesized).toContain('Elara');
    expect(synthesized).toContain('Naledi');
    expect(synthesized).toContain('Themba');
  });

  test('should get family configuration', () => {
    const config = aiFamilyService.getFamilyConfig();

    expect(config).toBeDefined();
    expect(config.elara).toBeDefined();
    expect(config.themba).toBeDefined();

    // Check that config contains expected properties
    expect(config.elara.name).toBe('Elara');
    expect(config.elara.role).toBe('Mother & Teacher');
  });

  test('should track family interactions', async () => {
    const userId = 'test-user-123';
    const message = 'Hello family!';
    const response = 'Hello there!';

    // Simulate a family interaction
    aiFamilyService.familyInteractions.push({
      userId,
      familyMember: 'elara',
      message,
      response,
      timestamp: new Date()
    });

    const stats = aiFamilyService.getInteractionStats();

    expect(stats.totalInteractions).toBe(1);
    expect(stats.familyMemberUsage.elara).toBe(1);
    expect(stats.recentInteractions).toHaveLength(1);
  });

  test('should route message and track interaction', async () => {
    const userId = 'test-user-123';
    const message = 'Tell me about Ubuntu philosophy';

    // Mock the response to avoid external dependencies
    jest.spyOn(aiFamilyService.family.elara, 'respondToUser').mockResolvedValue('Ubuntu means "I am because we are"');

    const result = await aiFamilyService.routeMessage(userId, message, {});

    expect(result.from).toBe('elara');
    expect(result.response).toBe('Ubuntu means "I am because we are"');

    // Check that interaction was tracked
    expect(aiFamilyService.familyInteractions).toHaveLength(1);
    expect(aiFamilyService.familyInteractions[0].userId).toBe(userId);
    expect(aiFamilyService.familyInteractions[0].message).toBe(message);
  });
});
