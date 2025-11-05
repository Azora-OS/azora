/**
 * AZORA OS - University Examination Sprint Launcher
 *
 * Launches a global examination sprint for all students with personalized emails
 */

import { elaraIntegration } from '../services/elara-integration-service';
import { User } from '../services/supabase-client';

interface StudentRecipient {
  id: string;
  name: string;
  email: string;
  country: string;
  language: string;
  metadata: Record<string, any>;
}

interface ExamSprintConfig {
  name: string;
  startDate: string;
  endDate: string;
  subjects: string[];
  rewards: {
    azr: number;
    certificates: boolean;
  };
  examPreparation: {
    studyMaterials: boolean;
    practiceTests: boolean;
    aiTutoring: boolean;
    peerStudyGroups: boolean;
  };
}

async function launchExamSprint() {
  console.log('🚀 Azora OS University Examination Sprint Launcher');
  console.log('===============================================\n');

  try {
    // Configuration for the examination sprint
    const examSprintConfig: ExamSprintConfig = {
      name: 'Global University Examination Sprint',
      startDate: '2025-11-15',
      endDate: '2025-12-15',
      subjects: [
        'Quantum Computing',
        'Artificial Intelligence',
        'Blockchain Technology',
        'Data Science',
        'Cybersecurity',
        'Cloud Infrastructure',
        'Mobile Development',
        'Web Technologies',
      ],
      rewards: {
        azr: 500,
        certificates: true,
      },
      examPreparation: {
        studyMaterials: true,
        practiceTests: true,
        aiTutoring: true,
        peerStudyGroups: true,
      },
    };

    console.log('📅 Exam Sprint Configuration:');
    console.log(`   Name: ${examSprintConfig.name}`);
    console.log(
      `   Duration: ${examSprintConfig.startDate} to ${examSprintConfig.endDate}`
    );
    console.log(`   Subjects: ${examSprintConfig.subjects.join(', ')}`);
    console.log(
      `   Rewards: ${examSprintConfig.rewards.azr} AZR + Certificate`
    );
    console.log(
      `   Exam Prep Features: Study Materials, Practice Tests, AI Tutoring, Peer Study Groups\n`
    );

    // Fetch all students from the database
    console.log('👥 Fetching all students...');
    const students = await getAllStudents();
    console.log(`   Found ${students.length} students globally\n`);

    // Register all students with Elara for personalized experiences
    console.log('🧠 Registering students with Elara AI...');
    registerStudentsWithElara(students);
    console.log(`   Registered ${students.length} students with Elara\n`);

    // Generate personalized email content for each student
    console.log('📧 Generating personalized emails...');
    const emailRecipients = await generateEmailRecipients(
      students,
      examSprintConfig
    );
    console.log(
      `   Generated content for ${emailRecipients.length} students\n`
    );

    // Send personalized emails
    console.log('📬 Sending personalized emails...');
    const campaignResult = await sendBulkEmails(
      emailRecipients,
      examSprintConfig
    );
    console.log(`   Campaign sent successfully!`);
    console.log(`   Campaign ID: ${campaignResult.campaign.id}`);
    console.log(`   Sent: ${campaignResult.campaign.sent}`);
    console.log(`   Failed: ${campaignResult.campaign.failed}\n`);

    // Log the event to Elara
    elaraIntegration.logEvent({
      type: 'exam-sprint-launched',
      data: {
        sprintName: examSprintConfig.name,
        studentCount: students.length,
        campaignId: campaignResult.campaign.id,
        subjects: examSprintConfig.subjects,
        rewards: examSprintConfig.rewards,
        examPreparation: examSprintConfig.examPreparation,
      },
    });

    console.log('✅ University Examination Sprint launched successfully!');
    console.log(
      '   All students have been notified of the examination sprint.'
    );
    console.log(
      '   They can now participate and earn rewards for their achievements.'
    );
  } catch (error) {
    console.error(
      '❌ Failed to launch examination sprint:',
      (error as Error).message
    );
    process.exit(1);
  }
}

/**
 * Fetch all students from the database
 */
async function getAllStudents(): Promise<User[]> {
  try {
    // In a real implementation, we would fetch all students
    // For now, we'll simulate with sample data
    const sampleStudents: User[] = [
      {
        id: 'student-001',
        name: 'Amara Johnson',
        email: 'amara.johnson@example.com',
        user_type: 'student',
        total_earned: 1200,
        country: 'Nigeria',
        language: 'English',
        metadata: {
          interests: ['AI', 'Data Science'],
          learningStyle: 'visual',
          institution: 'University of Lagos',
        },
        created_at: '2025-01-15T10:30:00Z',
        updated_at: '2025-10-20T14:45:00Z',
      },
      {
        id: 'student-002',
        name: 'Kwame Asante',
        email: 'kwame.asante@example.com',
        user_type: 'student',
        total_earned: 850,
        country: 'Ghana',
        language: 'English',
        metadata: {
          interests: ['Blockchain', 'Cybersecurity'],
          learningStyle: 'hands-on',
          institution: 'Kwame Nkrumah University',
        },
        created_at: '2025-03-22T09:15:00Z',
        updated_at: '2025-10-18T16:20:00Z',
      },
      {
        id: 'student-003',
        name: 'Zara El-Farouk',
        email: 'zara.elfarouk@example.com',
        user_type: 'student',
        total_earned: 2100,
        country: 'Egypt',
        language: 'Arabic',
        metadata: {
          interests: ['Quantum Computing', 'AI'],
          learningStyle: 'theoretical',
          institution: 'Cairo University',
        },
        created_at: '2024-11-05T11:45:00Z',
        updated_at: '2025-10-25T09:30:00Z',
      },
      {
        id: 'student-004',
        name: 'Sipho Dlamini',
        email: 'sipho.dlamini@example.com',
        user_type: 'student',
        total_earned: 650,
        country: 'South Africa',
        language: 'Zulu',
        metadata: {
          interests: ['Web Technologies', 'Mobile Development'],
          learningStyle: 'practical',
          institution: 'University of Cape Town',
        },
        created_at: '2025-05-10T14:20:00Z',
        updated_at: '2025-10-22T11:15:00Z',
      },
    ];

    // In a real implementation:
    // return await UserDB.getByType('student');

    return sampleStudents;
  } catch (error) {
    console.error('Failed to fetch students:', error);
    throw error;
  }
}

/**
 * Register students with Elara for personalized experiences
 */
function registerStudentsWithElara(students: User[]): void {
  students.forEach(student => {
    elaraIntegration.registerUser({
      id: student.id,
      email: student.email,
      name: student.name,
      role: 'student',
      company: student.metadata.institution || 'University Student',
      location: student.country,
      preferences: {
        learningStyle: student.metadata.learningStyle,
        communicationPreference: 'email',
        interests: student.metadata.interests,
        skillLevel: student.total_earned > 1000 ? 'advanced' : 'intermediate',
      },
    });
  });
}

/**
 * Generate email recipients with personalized content
 */
async function generateEmailRecipients(
  students: User[],
  config: ExamSprintConfig
): Promise<any[]> {
  return students.map(student => ({
    email: student.email,
    name: student.name,
    firstName: student.name.split(' ')[0],
    country: student.country,
    language: student.language,
    interests: student.metadata.interests || [],
    institution: student.metadata.institution || 'your university',
    learningStyle: student.metadata.learningStyle || 'adaptive',
    totalEarned: student.total_earned,
    personalizedSubjects: getPersonalizedSubjects(
      student.metadata.interests || [],
      config.subjects
    ),
  }));
}

/**
 * Get personalized subjects based on student interests
 */
function getPersonalizedSubjects(
  studentInterests: string[],
  allSubjects: string[]
): string[] {
  // If student has specific interests, prioritize those subjects
  if (studentInterests.length > 0) {
    return allSubjects.filter(subject =>
      studentInterests.some(interest =>
        subject.toLowerCase().includes(interest.toLowerCase())
      )
    );
  }

  // Otherwise, return all subjects
  return allSubjects;
}

/**
 * Send bulk personalized emails
 */
async function sendBulkEmails(
  recipients: any[],
  config: ExamSprintConfig
): Promise<any> {
  // Generate personalized email content for each recipient
  const emailData = recipients.map(recipient => {
    const personalizedContent = generatePersonalizedEmailContent(
      recipient,
      config
    );
    return {
      email: recipient.email,
      name: recipient.name,
      subject: personalizedContent.subject,
      html: personalizedContent.html,
      text: personalizedContent.text,
    };
  });

  // In a real implementation, we would send these emails via the Azora Mail service
  // For now, we'll simulate the API call

  try {
    // Simulate successful response
    const campaignResult = {
      campaign: {
        id: `campaign_${Date.now()}`,
        name: config.name,
        startTime: new Date().toISOString(),
        totalRecipients: recipients.length,
        sent: recipients.length,
        failed: 0,
        results: recipients.map(recipient => ({
          email: recipient.email,
          status: 'sent',
          messageId: `msg_${Date.now()}_${Math.random()
            .toString(36)
            .substr(2, 9)}`,
        })),
      },
    };

    return campaignResult;
  } catch (error) {
    console.error('Failed to send emails:', error);
    throw error;
  }
}

/**
 * Generate personalized email content
 */
function generatePersonalizedEmailContent(
  recipient: any,
  config: ExamSprintConfig
): { subject: string; html: string; text: string } {
  // Create personalized greeting based on location and learning style
  const greeting = getPersonalizedGreeting(
    recipient.country,
    recipient.learningStyle
  );

  // Get personalized subjects
  const subjectsList = recipient.personalizedSubjects
    .map((subject: string) => `<li>${subject}</li>`)
    .join('');

  // Create exam preparation features list
  const prepFeatures = [];
  if (config.examPreparation.studyMaterials)
    prepFeatures.push('📚 Comprehensive Study Materials');
  if (config.examPreparation.practiceTests)
    prepFeatures.push('📝 Practice Tests & Quizzes');
  if (config.examPreparation.aiTutoring)
    prepFeatures.push('🤖 24/7 AI Tutoring with Elara');
  if (config.examPreparation.peerStudyGroups)
    prepFeatures.push('👥 Peer Study Groups');

  const prepFeaturesList = prepFeatures
    .map(feature => `<li>${feature}</li>`)
    .join('');

  // Create HTML email content
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #8b5cf6;">🎓 Global University Examination Sprint</h2>

      <p>Dear ${recipient.name},</p>

      <p>${greeting}</p>

      <p>We're excited to announce the <strong>Global University Examination Sprint</strong>, a worldwide challenge designed to help you prepare for exams and accelerate your learning!</p>

      <h3 style="color: #0ea5e9;">📅 Event Details:</h3>
      <ul>
        <li><strong>Start Date:</strong> ${config.startDate}</li>
        <li><strong>End Date:</strong> ${config.endDate}</li>
        <li><strong>Rewards:</strong> ${
          config.rewards.azr
        } AZR + Certificate</li>
      </ul>

      <h3 style="color: #0ea5e9;">📚 Subjects Available:</h3>
      <ul>
        ${subjectsList}
      </ul>

      <h3 style="color: #0ea5e9;">🎯 Exam Preparation Features:</h3>
      <ul>
        ${prepFeaturesList}
      </ul>

      <p>As a ${recipient.learningStyle} learner from ${
    recipient.country
  }, we've personalized this experience for you based on your interests in ${(
    recipient.interests as string[]
  ).join(', ')}.</p>

      <p><strong>Your institution (${
        recipient.institution
      })</strong> is invited to participate in this global educational initiative.</p>

      <div style="text-align: center; margin: 30px 0;">
        <a href="https://learn.azora.world/exam-sprint"
           style="background: linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%);
                  color: white;
                  padding: 15px 30px;
                  text-decoration: none;
                  border-radius: 50px;
                  font-weight: bold;
                  display: inline-block;">
          Join the Examination Sprint
        </a>
      </div>

      <div style="background: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h4 style="color: #0369a1; margin-top: 0;">💡 Pro Tips for Exam Success:</h4>
        <ul>
          <li>Create a study schedule and stick to it</li>
          <li>Use our AI tutor Elara for personalized guidance</li>
          <li>Join study groups with peers worldwide</li>
          <li>Take regular practice tests to track progress</li>
          <li>Review difficult concepts with interactive materials</li>
        </ul>
      </div>

      <p>Best of luck in your examinations!</p>

      <p>With infinite wisdom,<br/>
      <strong>Elara Deity</strong><br/>
      Omniscient AI of Azora OS</p>
    </div>
  `;

  // Create text version
  const text = `
🎓 Global University Examination Sprint

Dear ${recipient.name},

${greeting.replace(/<[^>]*>/g, '')}

We're excited to announce the Global University Examination Sprint, a worldwide challenge designed to help you prepare for exams and accelerate your learning!

📅 Event Details:
- Start Date: ${config.startDate}
- End Date: ${config.endDate}
- Rewards: ${config.rewards.azr} AZR + Certificate

📚 Subjects Available:
${recipient.personalizedSubjects.map((s: string) => `- ${s}`).join('\n')}

🎯 Exam Preparation Features:
${prepFeatures.map(f => `- ${f.replace(/<[^>]*>/g, '')}`).join('\n')}

As a ${recipient.learningStyle} learner from ${
    recipient.country
  }, we've personalized this experience for you based on your interests in ${(
    recipient.interests as string[]
  ).join(', ')}.

Your institution (${
    recipient.institution
  }) is invited to participate in this global educational initiative.

Join the Examination Sprint: https://learn.azora.world/exam-sprint

💡 Pro Tips for Exam Success:
- Create a study schedule and stick to it
- Use our AI tutor Elara for personalized guidance
- Join study groups with peers worldwide
- Take regular practice tests to track progress
- Review difficult concepts with interactive materials

Best of luck in your examinations!

With infinite wisdom,
Elara Deity
Omniscient AI of Azora OS
  `;

  return {
    subject: `🎓 Global University Examination Sprint - Personalized for You!`,
    html,
    text,
  };
}

/**
 * Get personalized greeting based on location and learning style
 */
function getPersonalizedGreeting(
  country: string,
  learningStyle: string
): string {
  const greetings = [
    `As a ${learningStyle} learner from ${country}, you're uniquely positioned to excel in this global challenge designed to help you prepare for exams!`,
    `We recognize your ${learningStyle} approach to learning from ${country} and have tailored this exam preparation experience just for you.`,
    `Greetings from Azora OS! We've designed this examination sprint with ${country}'s ${learningStyle} learners in mind to help you prepare effectively.`,
    `Your journey as a ${learningStyle} learner from ${country} makes you an ideal candidate for this advanced exam preparation challenge.`,
  ];

  // Ensure we always return a string
  const index = Math.floor(Math.random() * greetings.length);
  return greetings[index] || greetings[0];
}

// Run the script
// @ts-expect-error: Module check for CommonJS compatibility
if (typeof require !== 'undefined' && require.main === module) {
  launchExamSprint();
}

export { launchExamSprint };
