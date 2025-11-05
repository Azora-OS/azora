// MongoDB initialization script for Azora Education
/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

db = db.getSiblingDB('azora_education');

// Create collections
db.createCollection('users');
db.createCollection('students');
db.createCollection('curricula');
db.createCollection('lessonplans');
db.createCollection('assessments');
db.createCollection('progressreports');

// Create indexes for better performance
db.users.createIndex({ "email": 1 }, { unique: true });
db.users.createIndex({ "role": 1 });
db.users.createIndex({ "createdAt": 1 });

db.students.createIndex({ "user": 1 }, { unique: true });
db.students.createIndex({ "parent": 1 });
db.students.createIndex({ "grade": 1 });

db.curricula.createIndex({ "subject": 1 });
db.curricula.createIndex({ "grade": 1 });
db.curricula.createIndex({ "createdBy": 1 });
db.curricula.createIndex({ "createdAt": -1 });

db.lessonplans.createIndex({ "student": 1 });
db.lessonplans.createIndex({ "curriculum": 1 });
db.lessonplans.createIndex({ "createdAt": -1 });

db.assessments.createIndex({ "student": 1 });
db.assessments.createIndex({ "subject": 1 });
db.assessments.createIndex({ "createdAt": -1 });
db.assessments.createIndex({ "status": 1 });

db.progressreports.createIndex({ "student": 1 });
db.progressreports.createIndex({ "period.startDate": 1, "period.endDate": 1 });

// Insert sample curriculum data aligned with Department of Education standards
db.curricula.insertMany([
  {
    subject: "mathematics",
    grade: 3,
    title: "Grade 3 Mathematics - Numbers and Operations",
    description: "Comprehensive mathematics curriculum for third grade focusing on number operations and basic algebra",
    standards: ["CCSS.Math.Content.3.OA.A.1", "CCSS.Math.Content.3.OA.A.2", "CCSS.Math.Content.3.OA.A.3"],
    objectives: [
      "Understand multiplication and division",
      "Solve problems involving the four operations",
      "Identify and explain patterns"
    ],
    topics: [
      {
        title: "Multiplication Basics",
        description: "Introduction to multiplication concepts and basic facts",
        duration: 45,
        order: 1,
        resources: [
          {
            type: "video",
            title: "Multiplication Introduction",
            url: "/videos/multiplication-intro.mp4"
          }
        ]
      },
      {
        title: "Division Fundamentals",
        description: "Understanding division as the inverse of multiplication",
        duration: 45,
        order: 2,
        prerequisites: ["Multiplication Basics"]
      }
    ],
    assessments: [
      {
        title: "Multiplication and Division Quiz",
        type: "quiz",
        questions: [
          {
            question: "What is 6 × 7?",
            type: "multiple-choice",
            options: ["42", "36", "48", "54"],
            correctAnswer: "42",
            points: 1
          }
        ],
        passingScore: 70,
        duration: 30
      }
    ],
    aiGenerated: false,
    createdAt: new Date()
  },
  {
    subject: "english",
    grade: 3,
    title: "Grade 3 English Language Arts - Reading Comprehension",
    description: "Literature and informational text reading comprehension curriculum",
    standards: ["CCSS.ELA-Literacy.RL.3.1", "CCSS.ELA-Literacy.RL.3.2", "CCSS.ELA-Literacy.RI.3.1"],
    objectives: [
      "Ask and answer questions about key details in texts",
      "Describe characters, settings, and major events",
      "Explain the relationships between events in texts"
    ],
    topics: [
      {
        title: "Story Elements",
        description: "Understanding characters, setting, and plot",
        duration: 60,
        order: 1
      },
      {
        title: "Reading Comprehension Strategies",
        description: "Techniques for understanding and analyzing texts",
        duration: 60,
        order: 2
      }
    ],
    assessments: [
      {
        title: "Reading Comprehension Assessment",
        type: "test",
        passingScore: 75,
        duration: 45
      }
    ],
    aiGenerated: false,
    createdAt: new Date()
  }
]);

// Insert sample user data
db.users.insertMany([
  {
    email: "admin@azora.education",
    password: "$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewfLkI0qQcO8KQO", // password: admin123
    firstName: "Azora",
    lastName: "Education",
    role: "admin",
    createdAt: new Date(),
    preferences: {
      notifications: true,
      language: "en",
      timezone: "UTC"
    }
  },
  {
    email: "parent@example.com",
    password: "$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewfLkI0qQcO8KQO", // password: parent123
    firstName: "John",
    lastName: "Parent",
    role: "parent",
    createdAt: new Date()
  }
]);

print("Azora Education database initialized successfully!");