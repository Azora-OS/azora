/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

/**
 * GLOBAL QUALIFICATIONS FRAMEWORK
 * Comprehensive database of all educational qualifications, certifications, and credentials worldwide
 */

export interface Qualification {
  id: string;
  name: string;
  shortName?: string;
  category: QualificationCategory;
  level: QualificationLevel;
  type: QualificationType;
  country?: string; // ISO country code or "International"
  issuingBody: string;
  description: string;
  duration?: string;
  prerequisites?: string[];
  recognizedIn?: string[]; // List of countries/regions
  equivalents?: string[]; // Equivalent qualifications
  azrReward?: number; // AZR tokens earned upon completion
  verifiable: boolean;
  tags: string[];
}

export enum QualificationCategory {
  // Academic
  PRIMARY_EDUCATION = "Primary Education",
  SECONDARY_EDUCATION = "Secondary Education",
  UNDERGRADUATE = "Undergraduate",
  POSTGRADUATE = "Postgraduate",
  DOCTORAL = "Doctoral",
  
  // Professional
  PROFESSIONAL_CERTIFICATION = "Professional Certification",
  VOCATIONAL = "Vocational Training",
  TRADE_CERTIFICATION = "Trade Certification",
  
  // Technology
  IT_CERTIFICATION = "IT Certification",
  SOFTWARE_DEVELOPMENT = "Software Development",
  CLOUD_COMPUTING = "Cloud Computing",
  CYBERSECURITY = "Cybersecurity",
  
  // Business & Finance
  BUSINESS_MANAGEMENT = "Business Management",
  ACCOUNTING_FINANCE = "Accounting & Finance",
  MARKETING_SALES = "Marketing & Sales",
  
  // Healthcare
  MEDICAL_CERTIFICATION = "Medical Certification",
  NURSING = "Nursing",
  ALLIED_HEALTH = "Allied Health",
  
  // Legal
  LAW_CERTIFICATION = "Law Certification",
  LEGAL_PRACTICE = "Legal Practice",
  
  // Engineering
  ENGINEERING = "Engineering",
  
  // Arts & Design
  ARTS_DESIGN = "Arts & Design",
  CREATIVE_MEDIA = "Creative Media",
  
  // Language
  LANGUAGE_PROFICIENCY = "Language Proficiency",
  
  // Other
  CONTINUING_EDUCATION = "Continuing Education",
  MICRO_CREDENTIALS = "Micro-credentials",
  ONLINE_CERTIFICATION = "Online Certification"
}

export enum QualificationLevel {
  LEVEL_1 = "Entry Level",
  LEVEL_2 = "Foundation",
  LEVEL_3 = "Intermediate",
  LEVEL_4 = "Advanced Intermediate",
  LEVEL_5 = "Advanced",
  LEVEL_6 = "Professional",
  LEVEL_7 = "Expert",
  LEVEL_8 = "Master Level",
  LEVEL_9 = "Doctoral Level",
  LEVEL_10 = "Post-Doctoral"
}

export enum QualificationType {
  DEGREE = "Degree",
  DIPLOMA = "Diploma",
  CERTIFICATE = "Certificate",
  CERTIFICATION = "Certification",
  LICENSE = "License",
  CREDENTIAL = "Credential",
  BADGE = "Digital Badge",
  MICRO_CREDENTIAL = "Micro-credential"
}

/**
 * COMPREHENSIVE GLOBAL QUALIFICATIONS DATABASE
 */
export const GLOBAL_QUALIFICATIONS: Qualification[] = [
  
  // ========================================
  // PRIMARY & SECONDARY EDUCATION
  // ========================================
  
  {
    id: "qual-primary-completion",
    name: "Primary School Completion",
    category: QualificationCategory.PRIMARY_EDUCATION,
    level: QualificationLevel.LEVEL_1,
    type: QualificationType.CERTIFICATE,
    country: "International",
    issuingBody: "Various National Education Ministries",
    description: "Completion of primary education (typically grades 1-6 or 1-7)",
    duration: "6-7 years",
    azrReward: 100,
    verifiable: true,
    tags: ["primary", "basic education", "foundational"],
    recognizedIn: ["Global"]
  },
  
  {
    id: "qual-gcse",
    name: "General Certificate of Secondary Education (GCSE)",
    shortName: "GCSE",
    category: QualificationCategory.SECONDARY_EDUCATION,
    level: QualificationLevel.LEVEL_2,
    type: QualificationType.CERTIFICATE,
    country: "GB",
    issuingBody: "UK Exam Boards (AQA, OCR, Edexcel, etc.)",
    description: "UK secondary education qualification typically taken at age 16",
    duration: "2 years",
    azrReward: 500,
    verifiable: true,
    tags: ["UK", "secondary", "O-levels"],
    recognizedIn: ["UK", "Commonwealth countries"]
  },
  
  {
    id: "qual-high-school-diploma-us",
    name: "High School Diploma",
    category: QualificationCategory.SECONDARY_EDUCATION,
    level: QualificationLevel.LEVEL_3,
    type: QualificationType.DIPLOMA,
    country: "US",
    issuingBody: "US High Schools",
    description: "Standard US secondary education completion",
    duration: "4 years",
    azrReward: 500,
    verifiable: true,
    tags: ["USA", "secondary", "high school"],
    recognizedIn: ["USA", "International"]
  },
  
  {
    id: "qual-matric-sa",
    name: "National Senior Certificate (Matric)",
    shortName: "Matric",
    category: QualificationCategory.SECONDARY_EDUCATION,
    level: QualificationLevel.LEVEL_3,
    type: QualificationType.CERTIFICATE,
    country: "ZA",
    issuingBody: "Department of Basic Education (South Africa)",
    description: "South African secondary school leaving certificate",
    duration: "12 years total",
    azrReward: 500,
    verifiable: true,
    tags: ["South Africa", "matric", "NSC", "secondary"],
    recognizedIn: ["South Africa", "International"]
  },
  
  {
    id: "qual-ib-diploma",
    name: "International Baccalaureate Diploma",
    shortName: "IB Diploma",
    category: QualificationCategory.SECONDARY_EDUCATION,
    level: QualificationLevel.LEVEL_4,
    type: QualificationType.DIPLOMA,
    country: "International",
    issuingBody: "International Baccalaureate Organization",
    description: "Internationally recognized pre-university qualification",
    duration: "2 years",
    azrReward: 1000,
    verifiable: true,
    tags: ["IB", "international", "pre-university"],
    recognizedIn: ["Global"]
  },
  
  // ========================================
  // UNDERGRADUATE DEGREES
  // ========================================
  
  {
    id: "qual-associate-degree",
    name: "Associate Degree",
    category: QualificationCategory.UNDERGRADUATE,
    level: QualificationLevel.LEVEL_5,
    type: QualificationType.DEGREE,
    country: "US",
    issuingBody: "Community Colleges and Universities",
    description: "Two-year undergraduate degree",
    duration: "2 years",
    azrReward: 2000,
    verifiable: true,
    tags: ["associate", "undergraduate", "2-year degree"],
    recognizedIn: ["USA", "Canada", "International"]
  },
  
  {
    id: "qual-bachelor-arts",
    name: "Bachelor of Arts",
    shortName: "BA",
    category: QualificationCategory.UNDERGRADUATE,
    level: QualificationLevel.LEVEL_6,
    type: QualificationType.DEGREE,
    country: "International",
    issuingBody: "Universities Worldwide",
    description: "Undergraduate degree in arts, humanities, or social sciences",
    duration: "3-4 years",
    azrReward: 5000,
    verifiable: true,
    tags: ["bachelor", "arts", "humanities", "undergraduate"],
    recognizedIn: ["Global"]
  },
  
  {
    id: "qual-bachelor-science",
    name: "Bachelor of Science",
    shortName: "BSc",
    category: QualificationCategory.UNDERGRADUATE,
    level: QualificationLevel.LEVEL_6,
    type: QualificationType.DEGREE,
    country: "International",
    issuingBody: "Universities Worldwide",
    description: "Undergraduate degree in science, technology, engineering, or mathematics",
    duration: "3-4 years",
    azrReward: 5000,
    verifiable: true,
    tags: ["bachelor", "science", "STEM", "undergraduate"],
    recognizedIn: ["Global"]
  },
  
  {
    id: "qual-bachelor-engineering",
    name: "Bachelor of Engineering",
    shortName: "BEng",
    category: QualificationCategory.ENGINEERING,
    level: QualificationLevel.LEVEL_6,
    type: QualificationType.DEGREE,
    country: "International",
    issuingBody: "Engineering Universities",
    description: "Professional undergraduate engineering degree",
    duration: "4 years",
    azrReward: 6000,
    verifiable: true,
    tags: ["bachelor", "engineering", "BEng", "professional"],
    recognizedIn: ["Global"]
  },
  
  {
    id: "qual-bachelor-commerce",
    name: "Bachelor of Commerce",
    shortName: "BCom",
    category: QualificationCategory.BUSINESS_MANAGEMENT,
    level: QualificationLevel.LEVEL_6,
    type: QualificationType.DEGREE,
    country: "International",
    issuingBody: "Business Schools and Universities",
    description: "Undergraduate degree in business and commerce",
    duration: "3-4 years",
    azrReward: 5000,
    verifiable: true,
    tags: ["bachelor", "business", "commerce", "undergraduate"],
    recognizedIn: ["Global"]
  },
  
  // ========================================
  // POSTGRADUATE DEGREES
  // ========================================
  
  {
    id: "qual-master-arts",
    name: "Master of Arts",
    shortName: "MA",
    category: QualificationCategory.POSTGRADUATE,
    level: QualificationLevel.LEVEL_7,
    type: QualificationType.DEGREE,
    country: "International",
    issuingBody: "Universities Worldwide",
    description: "Postgraduate degree in arts, humanities, or social sciences",
    duration: "1-2 years",
    prerequisites: ["Bachelor's degree"],
    azrReward: 8000,
    verifiable: true,
    tags: ["master", "postgraduate", "arts", "humanities"],
    recognizedIn: ["Global"]
  },
  
  {
    id: "qual-master-science",
    name: "Master of Science",
    shortName: "MSc",
    category: QualificationCategory.POSTGRADUATE,
    level: QualificationLevel.LEVEL_7,
    type: QualificationType.DEGREE,
    country: "International",
    issuingBody: "Universities Worldwide",
    description: "Postgraduate degree in science, technology, or related fields",
    duration: "1-2 years",
    prerequisites: ["Bachelor's degree in related field"],
    azrReward: 8000,
    verifiable: true,
    tags: ["master", "postgraduate", "science", "STEM"],
    recognizedIn: ["Global"]
  },
  
  {
    id: "qual-mba",
    name: "Master of Business Administration",
    shortName: "MBA",
    category: QualificationCategory.BUSINESS_MANAGEMENT,
    level: QualificationLevel.LEVEL_7,
    type: QualificationType.DEGREE,
    country: "International",
    issuingBody: "Business Schools Worldwide",
    description: "Premier postgraduate business management degree",
    duration: "1-2 years",
    prerequisites: ["Bachelor's degree", "Work experience often required"],
    azrReward: 10000,
    verifiable: true,
    tags: ["MBA", "business", "management", "executive"],
    recognizedIn: ["Global"]
  },
  
  // ========================================
  // DOCTORAL DEGREES
  // ========================================
  
  {
    id: "qual-phd",
    name: "Doctor of Philosophy",
    shortName: "PhD",
    category: QualificationCategory.DOCTORAL,
    level: QualificationLevel.LEVEL_9,
    type: QualificationType.DEGREE,
    country: "International",
    issuingBody: "Universities Worldwide",
    description: "Highest academic degree, original research contribution",
    duration: "3-7 years",
    prerequisites: ["Master's degree or equivalent"],
    azrReward: 20000,
    verifiable: true,
    tags: ["PhD", "doctorate", "research", "terminal degree"],
    recognizedIn: ["Global"]
  },
  
  {
    id: "qual-md",
    name: "Doctor of Medicine",
    shortName: "MD",
    category: QualificationCategory.MEDICAL_CERTIFICATION,
    level: QualificationLevel.LEVEL_9,
    type: QualificationType.DEGREE,
    country: "International",
    issuingBody: "Medical Schools",
    description: "Professional medical degree for physicians",
    duration: "4-6 years",
    prerequisites: ["Bachelor's degree", "Pre-medical requirements"],
    azrReward: 25000,
    verifiable: true,
    tags: ["MD", "medicine", "doctor", "physician"],
    recognizedIn: ["Global"]
  },
  
  {
    id: "qual-jd",
    name: "Juris Doctor",
    shortName: "JD",
    category: QualificationCategory.LAW_CERTIFICATION,
    level: QualificationLevel.LEVEL_8,
    type: QualificationType.DEGREE,
    country: "US",
    issuingBody: "Law Schools",
    description: "Professional law degree required to practice law in the US",
    duration: "3 years",
    prerequisites: ["Bachelor's degree"],
    azrReward: 15000,
    verifiable: true,
    tags: ["JD", "law", "legal", "attorney"],
    recognizedIn: ["USA", "International"]
  },
  
  // ========================================
  // IT & TECHNOLOGY CERTIFICATIONS
  // ========================================
  
  {
    id: "qual-comptia-a-plus",
    name: "CompTIA A+ Certification",
    shortName: "A+",
    category: QualificationCategory.IT_CERTIFICATION,
    level: QualificationLevel.LEVEL_3,
    type: QualificationType.CERTIFICATION,
    country: "International",
    issuingBody: "CompTIA",
    description: "Entry-level IT certification for computer support specialists",
    duration: "3-6 months preparation",
    azrReward: 500,
    verifiable: true,
    tags: ["IT", "hardware", "support", "entry-level"],
    recognizedIn: ["Global"]
  },
  
  {
    id: "qual-ccna",
    name: "Cisco Certified Network Associate",
    shortName: "CCNA",
    category: QualificationCategory.IT_CERTIFICATION,
    level: QualificationLevel.LEVEL_4,
    type: QualificationType.CERTIFICATION,
    country: "International",
    issuingBody: "Cisco",
    description: "Networking certification covering routing and switching fundamentals",
    duration: "3-6 months preparation",
    azrReward: 800,
    verifiable: true,
    tags: ["networking", "Cisco", "routing", "switching"],
    recognizedIn: ["Global"]
  },
  
  {
    id: "qual-aws-solutions-architect",
    name: "AWS Certified Solutions Architect",
    category: QualificationCategory.CLOUD_COMPUTING,
    level: QualificationLevel.LEVEL_5,
    type: QualificationType.CERTIFICATION,
    country: "International",
    issuingBody: "Amazon Web Services",
    description: "Cloud architecture certification for AWS platform",
    duration: "3-6 months preparation",
    azrReward: 1000,
    verifiable: true,
    tags: ["AWS", "cloud", "architecture", "Amazon"],
    recognizedIn: ["Global"]
  },
  
  {
    id: "qual-azure-administrator",
    name: "Microsoft Certified: Azure Administrator",
    category: QualificationCategory.CLOUD_COMPUTING,
    level: QualificationLevel.LEVEL_5,
    type: QualificationType.CERTIFICATION,
    country: "International",
    issuingBody: "Microsoft",
    description: "Azure cloud platform administration certification",
    duration: "3-6 months preparation",
    azrReward: 1000,
    verifiable: true,
    tags: ["Azure", "Microsoft", "cloud", "administration"],
    recognizedIn: ["Global"]
  },
  
  {
    id: "qual-cissp",
    name: "Certified Information Systems Security Professional",
    shortName: "CISSP",
    category: QualificationCategory.CYBERSECURITY,
    level: QualificationLevel.LEVEL_7,
    type: QualificationType.CERTIFICATION,
    country: "International",
    issuingBody: "(ISC)²",
    description: "Advanced cybersecurity certification",
    duration: "6-12 months preparation",
    prerequisites: ["5 years security experience"],
    azrReward: 2000,
    verifiable: true,
    tags: ["cybersecurity", "security", "CISSP", "professional"],
    recognizedIn: ["Global"]
  },
  
  // Continue in next part...
  
];

// The database continues with thousands more qualifications...
// This is just a sample showing the structure
