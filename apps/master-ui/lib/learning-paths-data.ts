export interface LearningPath {
  id: string
  title: string
  description: string
  goal: string
  duration: string
  difficulty: "Beginner" | "Intermediate" | "Advanced"
  qualifications: string[]
  azrReward: number
  enrollments: number
  completionRate: number
  skills: string[]
  careerOutcomes: string[]
  prerequisites?: string[]
}

export const learningPaths: LearningPath[] = [
  {
    id: "path-001",
    title: "Full-Stack Web Development",
    description: "Master modern web development from front-end to back-end, building production-ready applications.",
    goal: "Become a professional full-stack web developer",
    duration: "4 months",
    difficulty: "Intermediate",
    qualifications: ["qual-aws-cca", "qual-comptia-security"],
    azrReward: 15000,
    enrollments: 12450,
    completionRate: 68,
    skills: ["JavaScript", "React", "Node.js", "Database Design", "APIs", "DevOps"],
    careerOutcomes: ["Full-Stack Developer", "Software Engineer", "Tech Lead"],
  },
  {
    id: "path-002",
    title: "Data Science Career Track",
    description: "Learn data analysis, machine learning, and AI to become a data-driven professional.",
    goal: "Launch a career in data science and analytics",
    duration: "5 months",
    difficulty: "Advanced",
    qualifications: ["qual-phd"],
    azrReward: 20000,
    enrollments: 8920,
    completionRate: 55,
    skills: ["Python", "Machine Learning", "SQL", "Data Visualization", "Statistics", "Big Data"],
    careerOutcomes: ["Data Scientist", "Machine Learning Engineer", "Analytics Manager"],
  },
  {
    id: "path-003",
    title: "Cybersecurity Professional",
    description: "Build expertise in security systems, ethical hacking, and threat management.",
    goal: "Become a certified cybersecurity professional",
    duration: "6 months",
    difficulty: "Advanced",
    qualifications: ["qual-cissp"],
    azrReward: 18000,
    enrollments: 5640,
    completionRate: 72,
    skills: ["Network Security", "Penetration Testing", "Risk Management", "Compliance", "Incident Response"],
    careerOutcomes: ["Security Analyst", "Penetration Tester", "Security Manager"],
  },
  {
    id: "path-004",
    title: "Business Management & Leadership",
    description: "Develop leadership and business management skills for corporate advancement.",
    goal: "Build a foundation for executive roles",
    duration: "3 months",
    difficulty: "Intermediate",
    qualifications: ["qual-mba"],
    azrReward: 12000,
    enrollments: 15200,
    completionRate: 75,
    skills: ["Strategic Planning", "Team Leadership", "Finance Fundamentals", "Project Management"],
    careerOutcomes: ["Project Manager", "Team Lead", "Operations Manager", "Executive"],
  },
  {
    id: "path-005",
    title: "Cloud Architecture Mastery",
    description: "Design and build scalable cloud solutions on AWS, Azure, and Google Cloud.",
    goal: "Become a certified cloud architect",
    duration: "4 months",
    difficulty: "Advanced",
    qualifications: ["qual-aws-cca"],
    azrReward: 16000,
    enrollments: 7320,
    completionRate: 62,
    skills: ["AWS", "Cloud Architecture", "Infrastructure as Code", "Containerization", "Monitoring"],
    careerOutcomes: ["Cloud Architect", "Cloud Engineer", "DevOps Engineer"],
  },
  {
    id: "path-006",
    title: "English Language Mastery",
    description: "Achieve advanced English proficiency from basics to professional fluency.",
    goal: "Achieve IELTS certification and professional English fluency",
    duration: "3 months",
    difficulty: "Beginner",
    qualifications: ["qual-ielts"],
    azrReward: 5000,
    enrollments: 32100,
    completionRate: 81,
    skills: ["Speaking", "Writing", "Reading", "Listening", "Professional Communication"],
    careerOutcomes: ["English Tutor", "Corporate Communicator", "Content Writer"],
  },
]

export interface Recommendation {
  qualification: string
  reason: string
  match: number
}

export function generateRecommendations(userRole: string, interests: string[]): Recommendation[] {
  const recommendations: Recommendation[] = []

  // Generate recommendations based on role and interests
  if (userRole === "student") {
    if (interests.includes("technology")) {
      recommendations.push(
        { qualification: "qual-aws-cca", reason: "High demand cloud certification", match: 95 },
        { qualification: "qual-cissp", reason: "Growing cybersecurity field", match: 88 },
        { qualification: "qual-comptia-security", reason: "Perfect entry point for IT careers", match: 92 },
      )
    }
    if (interests.includes("business")) {
      recommendations.push(
        { qualification: "qual-mba", reason: "Executive career development", match: 87 },
        { qualification: "qual-pmp", reason: "Project management expertise", match: 90 },
      )
    }
    if (interests.includes("language")) {
      recommendations.push({ qualification: "qual-ielts", reason: "International opportunity expansion", match: 94 })
    }
  }

  if (recommendations.length === 0) {
    recommendations.push(
      { qualification: "qual-mba", reason: "Universally valuable credential", match: 78 },
      { qualification: "qual-aws-cca", reason: "Future-proof digital skill", match: 81 },
      { qualification: "qual-ielts", reason: "Global communication advantage", match: 76 },
    )
  }

  return recommendations.slice(0, 6)
}
