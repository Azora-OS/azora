// Azora Services Integration Layer
// Connects to all Azora OS services

export const AZORA_SERVICES = {
  onboarding: process.env.NEXT_PUBLIC_AZORA_ONBOARDING_URL || "http://localhost:5500",
  workspace: process.env.NEXT_PUBLIC_AZORA_WORKSPACE_URL || "http://localhost:4100",
  education: process.env.NEXT_PUBLIC_AZORA_EDUCATION_URL || "http://localhost:4200",
  spark: process.env.NEXT_PUBLIC_AZORA_SPARK_URL || "http://localhost:4301",
  enrollment: process.env.NEXT_PUBLIC_AZORA_ENROLLMENT_URL || "http://localhost:8080",
  ledger: process.env.NEXT_PUBLIC_AZORA_LEDGER_URL || "http://localhost:6379",
}

// Elara Autonomous Contract Interface
export const elaraContractService = {
  async registerFounder(founderData: {
    firstName: string
    lastName: string
    role: "retail" | "sales" | "design" | "operations" | "tech"
    idNumber: string
    citizenship: string
    phone: string
    address: string
  }) {
    const response = await fetch(`${AZORA_SERVICES.onboarding}/api/founder/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(founderData),
    })
    return response.json()
  },

  async getFounderProgress(email: string) {
    const response = await fetch(`${AZORA_SERVICES.onboarding}/api/founder/${email}/progress`)
    return response.json()
  },

  async getFounderDetails(email: string) {
    const response = await fetch(`${AZORA_SERVICES.onboarding}/api/founder/${email}`)
    return response.json()
  },
}

// Sapiens (Student) Enrollment & Mining
export const sapiensService = {
  async enrollSapiens(studentData: {
    studentNumber: string
    fullName: string
    program: "blockchain" | "ai" | "full-stack" | "data-science" | "cybersecurity" | "other"
    level: "beginner" | "intermediate" | "advanced"
    idNumber: string
    dateOfBirth: string
    citizenship: string
    phone: string
    institution?: string
  }) {
    const response = await fetch(`${AZORA_SERVICES.onboarding}/api/sapiens/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(studentData),
    })
    return response.json()
  },

  async getSapiensProfile(email: string) {
    const response = await fetch(`${AZORA_SERVICES.onboarding}/api/sapiens/${email}`)
    return response.json()
  },

  async submitKnowledgeProof(
    email: string,
    proof: {
      type: "course-completion" | "quiz" | "project" | "contribution"
      data: Record<string, any>
      verificationData: Record<string, boolean>
    },
  ) {
    const response = await fetch(`${AZORA_SERVICES.onboarding}/api/sapiens/${email}/proof`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(proof),
    })
    return response.json()
  },
}

// Azora Workspace Integration (Email & Collaboration)
export const workspaceService = {
  async getUserEmail(email: string) {
    const response = await fetch(`${AZORA_SERVICES.workspace}/api/emails/${email}`)
    return response.json()
  },

  async sendEmail(recipientEmail: string, subject: string, body: string) {
    const response = await fetch(`${AZORA_SERVICES.workspace}/api/emails/send`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ to: recipientEmail, subject, body }),
    })
    return response.json()
  },

  async getWorkspace(userId: string) {
    const response = await fetch(`${AZORA_SERVICES.workspace}/api/workspaces/${userId}`)
    return response.json()
  },
}

// Azora Education Integration (Homeschool Platform)
export const educationService = {
  async getStudentCurriculum(studentId: string) {
    const response = await fetch(`${AZORA_SERVICES.education}/api/students/${studentId}/curriculum`)
    return response.json()
  },

  async getAssessments(studentId: string) {
    const response = await fetch(`${AZORA_SERVICES.education}/api/assessments/${studentId}`)
    return response.json()
  },

  async generateLessonPlan(subject: string, gradeLevel: string, learningObjectives: string[]) {
    const response = await fetch(`${AZORA_SERVICES.education}/api/ai/lesson-plan`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ subject, gradeLevel, learningObjectives }),
    })
    return response.json()
  },
}

// Azora Spark Analytics
export const sparkService = {
  async getAnalytics(query: { type: string; filter?: Record<string, any> }) {
    const response = await fetch(`${AZORA_SERVICES.spark}/api/analytics`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(query),
    })
    return response.json()
  },

  async processData(rddOperations: Array<{ type: string; function: string }>) {
    const response = await fetch(`${AZORA_SERVICES.spark}/rdd/process`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ operations: rddOperations }),
    })
    return response.json()
  },
}

// Enrollment Service Integration
export const enrollmentService = {
  async enrollStudent(studentId: string, courseId: string) {
    const response = await fetch(`${AZORA_SERVICES.enrollment}/api/enrollments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ studentId, courseId }),
    })
    return response.json()
  },

  async getEnrollmentStatus(studentId: string) {
    const response = await fetch(`${AZORA_SERVICES.enrollment}/api/enrollments/${studentId}`)
    return response.json()
  },
}

// Blockchain Ledger Integration
export const ledgerService = {
  async registerContract(contract: {
    type: string
    participantId: string
    data: Record<string, any>
  }) {
    const response = await fetch(`${AZORA_SERVICES.ledger}/api/contracts`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(contract),
    })
    return response.json()
  },

  async getContractHistory(participantId: string) {
    const response = await fetch(`${AZORA_SERVICES.ledger}/api/contracts/${participantId}`)
    return response.json()
  },

  async verifyCredential(credentialId: string) {
    const response = await fetch(`${AZORA_SERVICES.ledger}/api/verify/${credentialId}`)
    return response.json()
  },
}
