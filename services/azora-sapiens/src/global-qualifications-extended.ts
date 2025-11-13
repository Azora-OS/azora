/*
AZORA PROPRIETARY LICENSE
Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.
See LICENSE file for details.
*/

import { Qualification, QualificationCategory, QualificationLevel, QualificationType } from './global-qualifications-framework';

/**
 * EXTENDED GLOBAL QUALIFICATIONS DATABASE
 * Covering all major qualifications from around the world
 */

export const EXTENDED_QUALIFICATIONS: Qualification[] = [
  
  // ========================================
  // PROGRAMMING & SOFTWARE DEVELOPMENT
  // ========================================
  
  {
    id: "qual-oracle-java-cert",
    name: "Oracle Certified Professional: Java SE Programmer",
    shortName: "OCP Java",
    category: QualificationCategory.SOFTWARE_DEVELOPMENT,
    level: QualificationLevel.LEVEL_5,
    type: QualificationType.CERTIFICATION,
    country: "International",
    issuingBody: "Oracle",
    description: "Professional Java programming certification",
    duration: "3-6 months preparation",
    azrReward: 800,
    verifiable: true,
    tags: ["Java", "programming", "Oracle", "software development"],
    recognizedIn: ["Global"]
  },
  
  {
    id: "qual-microsoft-azure-developer",
    name: "Microsoft Certified: Azure Developer Associate",
    category: QualificationCategory.SOFTWARE_DEVELOPMENT,
    level: QualificationLevel.LEVEL_5,
    type: QualificationType.CERTIFICATION,
    country: "International",
    issuingBody: "Microsoft",
    description: "Azure cloud development certification",
    duration: "3-6 months preparation",
    azrReward: 1000,
    verifiable: true,
    tags: ["Azure", "developer", "cloud", "Microsoft"],
    recognizedIn: ["Global"]
  },
  
  {
    id: "qual-google-professional-cloud-developer",
    name: "Google Professional Cloud Developer",
    category: QualificationCategory.CLOUD_COMPUTING,
    level: QualificationLevel.LEVEL_6,
    type: QualificationType.CERTIFICATION,
    country: "International",
    issuingBody: "Google Cloud",
    description: "Google Cloud Platform development certification",
    duration: "4-8 months preparation",
    azrReward: 1200,
    verifiable: true,
    tags: ["GCP", "Google", "cloud", "developer"],
    recognizedIn: ["Global"]
  },
  
  // ========================================
  // BUSINESS & MANAGEMENT
  // ========================================
  
  {
    id: "qual-pmp",
    name: "Project Management Professional",
    shortName: "PMP",
    category: QualificationCategory.BUSINESS_MANAGEMENT,
    level: QualificationLevel.LEVEL_6,
    type: QualificationType.CERTIFICATION,
    country: "International",
    issuingBody: "Project Management Institute (PMI)",
    description: "Gold standard project management certification",
    duration: "3-6 months preparation",
    prerequisites: ["3-5 years PM experience", "35 hours PM education"],
    azrReward: 1500,
    verifiable: true,
    tags: ["project management", "PMP", "PMI", "professional"],
    recognizedIn: ["Global"]
  },
  
  {
    id: "qual-six-sigma-black-belt",
    name: "Six Sigma Black Belt",
    shortName: "SSBB",
    category: QualificationCategory.BUSINESS_MANAGEMENT,
    level: QualificationLevel.LEVEL_7,
    type: QualificationType.CERTIFICATION,
    country: "International",
    issuingBody: "Various (ASQ, IASSC, etc.)",
    description: "Advanced process improvement and quality management",
    duration: "6-12 months",
    azrReward: 2000,
    verifiable: true,
    tags: ["Six Sigma", "quality", "process improvement", "lean"],
    recognizedIn: ["Global"]
  },
  
  {
    id: "qual-scrum-master",
    name: "Certified ScrumMaster",
    shortName: "CSM",
    category: QualificationCategory.BUSINESS_MANAGEMENT,
    level: QualificationLevel.LEVEL_4,
    type: QualificationType.CERTIFICATION,
    country: "International",
    issuingBody: "Scrum Alliance",
    description: "Agile project management certification",
    duration: "2 days training + exam",
    azrReward: 600,
    verifiable: true,
    tags: ["Scrum", "Agile", "project management", "CSM"],
    recognizedIn: ["Global"]
  },
  
  // ========================================
  // ACCOUNTING & FINANCE
  // ========================================
  
  {
    id: "qual-cpa",
    name: "Certified Public Accountant",
    shortName: "CPA",
    category: QualificationCategory.ACCOUNTING_FINANCE,
    level: QualificationLevel.LEVEL_7,
    type: QualificationType.LICENSE,
    country: "US",
    issuingBody: "State Boards of Accountancy",
    description: "Professional accounting license in the United States",
    duration: "1-2 years preparation",
    prerequisites: ["Bachelor's degree in accounting", "150 credit hours"],
    azrReward: 3000,
    verifiable: true,
    tags: ["CPA", "accounting", "finance", "license"],
    recognizedIn: ["USA", "International"]
  },
  
  {
    id: "qual-acca",
    name: "Association of Chartered Certified Accountants",
    shortName: "ACCA",
    category: QualificationCategory.ACCOUNTING_FINANCE,
    level: QualificationLevel.LEVEL_7,
    type: QualificationType.CERTIFICATION,
    country: "International",
    issuingBody: "ACCA",
    description: "Global professional accounting qualification",
    duration: "3-4 years",
    azrReward: 4000,
    verifiable: true,
    tags: ["ACCA", "accounting", "chartered", "international"],
    recognizedIn: ["Global", "180+ countries"]
  },
  
  {
    id: "qual-cfa",
    name: "Chartered Financial Analyst",
    shortName: "CFA",
    category: QualificationCategory.ACCOUNTING_FINANCE,
    level: QualificationLevel.LEVEL_8,
    type: QualificationType.CERTIFICATION,
    country: "International",
    issuingBody: "CFA Institute",
    description: "Premier investment management designation",
    duration: "2-4 years (3 exam levels)",
    azrReward: 5000,
    verifiable: true,
    tags: ["CFA", "finance", "investment", "analyst"],
    recognizedIn: ["Global"]
  },
  
  {
    id: "qual-cima",
    name: "Chartered Institute of Management Accountants",
    shortName: "CIMA",
    category: QualificationCategory.ACCOUNTING_FINANCE,
    level: QualificationLevel.LEVEL_7,
    type: QualificationType.CERTIFICATION,
    country: "International",
    issuingBody: "CIMA",
    description: "Management accounting qualification",
    duration: "3-4 years",
    azrReward: 3500,
    verifiable: true,
    tags: ["CIMA", "management accounting", "finance"],
    recognizedIn: ["Global"]
  },
  
  // ========================================
  // MEDICAL & HEALTHCARE
  // ========================================
  
  {
    id: "qual-registered-nurse",
    name: "Registered Nurse",
    shortName: "RN",
    category: QualificationCategory.NURSING,
    level: QualificationLevel.LEVEL_6,
    type: QualificationType.LICENSE,
    country: "International",
    issuingBody: "National Nursing Councils",
    description: "Licensed nursing professional",
    duration: "2-4 years",
    prerequisites: ["Nursing degree or diploma"],
    azrReward: 4000,
    verifiable: true,
    tags: ["nursing", "RN", "healthcare", "medical"],
    recognizedIn: ["Country-specific"]
  },
  
  {
    id: "qual-nurse-practitioner",
    name: "Nurse Practitioner",
    shortName: "NP",
    category: QualificationCategory.NURSING,
    level: QualificationLevel.LEVEL_7,
    type: QualificationType.LICENSE,
    country: "US",
    issuingBody: "State Nursing Boards",
    description: "Advanced practice registered nurse",
    duration: "2-3 years postgraduate",
    prerequisites: ["RN license", "Bachelor's in Nursing"],
    azrReward: 6000,
    verifiable: true,
    tags: ["NP", "nursing", "advanced practice", "healthcare"],
    recognizedIn: ["USA", "Select countries"]
  },
  
  {
    id: "qual-pharmacist",
    name: "Doctor of Pharmacy",
    shortName: "PharmD",
    category: QualificationCategory.MEDICAL_CERTIFICATION,
    level: QualificationLevel.LEVEL_8,
    type: QualificationType.DEGREE,
    country: "International",
    issuingBody: "Pharmacy Schools",
    description: "Professional pharmacy degree",
    duration: "4 years",
    prerequisites: ["Pre-pharmacy requirements"],
    azrReward: 8000,
    verifiable: true,
    tags: ["pharmacy", "PharmD", "healthcare", "medicine"],
    recognizedIn: ["Global"]
  },
  
  {
    id: "qual-physical-therapist",
    name: "Doctor of Physical Therapy",
    shortName: "DPT",
    category: QualificationCategory.ALLIED_HEALTH,
    level: QualificationLevel.LEVEL_8,
    type: QualificationType.DEGREE,
    country: "US",
    issuingBody: "Physical Therapy Schools",
    description: "Professional physical therapy degree",
    duration: "3 years",
    prerequisites: ["Bachelor's degree", "Prerequisites"],
    azrReward: 7000,
    verifiable: true,
    tags: ["physical therapy", "DPT", "rehabilitation", "healthcare"],
    recognizedIn: ["USA", "International"]
  },
  
  // ========================================
  // LEGAL QUALIFICATIONS
  // ========================================
  
  {
    id: "qual-llb",
    name: "Bachelor of Laws",
    shortName: "LLB",
    category: QualificationCategory.LAW_CERTIFICATION,
    level: QualificationLevel.LEVEL_6,
    type: QualificationType.DEGREE,
    country: "International",
    issuingBody: "Law Schools (Commonwealth)",
    description: "Undergraduate law degree in Commonwealth countries",
    duration: "3-4 years",
    azrReward: 6000,
    verifiable: true,
    tags: ["law", "LLB", "legal", "Commonwealth"],
    recognizedIn: ["UK", "Commonwealth", "International"]
  },
  
  {
    id: "qual-bar-exam",
    name: "Bar Examination (Attorney License)",
    category: QualificationCategory.LEGAL_PRACTICE,
    level: QualificationLevel.LEVEL_8,
    type: QualificationType.LICENSE,
    country: "US",
    issuingBody: "State Bar Associations",
    description: "License to practice law in a US state",
    duration: "Bar exam preparation",
    prerequisites: ["JD or LLM"],
    azrReward: 5000,
    verifiable: true,
    tags: ["bar exam", "attorney", "law", "license"],
    recognizedIn: ["State-specific"]
  },
  
  {
    id: "qual-solicitor-uk",
    name: "Solicitor of England and Wales",
    category: QualificationCategory.LEGAL_PRACTICE,
    level: QualificationLevel.LEVEL_7,
    type: QualificationType.LICENSE,
    country: "GB",
    issuingBody: "Solicitors Regulation Authority",
    description: "Qualified solicitor in England and Wales",
    duration: "2 years training contract",
    prerequisites: ["LLB or GDL", "LPC"],
    azrReward: 6000,
    verifiable: true,
    tags: ["solicitor", "UK law", "legal practice"],
    recognizedIn: ["UK"]
  },
  
  // ========================================
  // ENGINEERING CERTIFICATIONS
  // ========================================
  
  {
    id: "qual-pe-engineer",
    name: "Professional Engineer",
    shortName: "PE",
    category: QualificationCategory.ENGINEERING,
    level: QualificationLevel.LEVEL_7,
    type: QualificationType.LICENSE,
    country: "US",
    issuingBody: "State Licensing Boards",
    description: "Licensed professional engineer in the United States",
    duration: "4+ years experience",
    prerequisites: ["Engineering degree", "FE exam", "Experience"],
    azrReward: 4000,
    verifiable: true,
    tags: ["PE", "engineer", "professional", "license"],
    recognizedIn: ["USA"]
  },
  
  {
    id: "qual-chartered-engineer",
    name: "Chartered Engineer",
    shortName: "CEng",
    category: QualificationCategory.ENGINEERING,
    level: QualificationLevel.LEVEL_7,
    type: QualificationType.CERTIFICATION,
    country: "GB",
    issuingBody: "Engineering Council UK",
    description: "Chartered professional engineer status in the UK",
    duration: "Experience-based",
    prerequisites: ["Engineering degree", "Professional experience"],
    azrReward: 4000,
    verifiable: true,
    tags: ["CEng", "chartered", "engineering", "UK"],
    recognizedIn: ["UK", "Commonwealth"]
  },
  
  // ========================================
  // LANGUAGE PROFICIENCY
  // ========================================
  
  {
    id: "qual-ielts",
    name: "International English Language Testing System",
    shortName: "IELTS",
    category: QualificationCategory.LANGUAGE_PROFICIENCY,
    level: QualificationLevel.LEVEL_4,
    type: QualificationType.CERTIFICATION,
    country: "International",
    issuingBody: "British Council, IDP, Cambridge",
    description: "English language proficiency test",
    duration: "Test-based",
    azrReward: 300,
    verifiable: true,
    tags: ["English", "language", "IELTS", "proficiency"],
    recognizedIn: ["Global", "10,000+ institutions"]
  },
  
  {
    id: "qual-toefl",
    name: "Test of English as a Foreign Language",
    shortName: "TOEFL",
    category: QualificationCategory.LANGUAGE_PROFICIENCY,
    level: QualificationLevel.LEVEL_4,
    type: QualificationType.CERTIFICATION,
    country: "International",
    issuingBody: "Educational Testing Service (ETS)",
    description: "English language proficiency test",
    duration: "Test-based",
    azrReward: 300,
    verifiable: true,
    tags: ["English", "language", "TOEFL", "proficiency"],
    recognizedIn: ["Global", "USA primarily"]
  },
  
  {
    id: "qual-dele",
    name: "Diplomas de Español como Lengua Extranjera",
    shortName: "DELE",
    category: QualificationCategory.LANGUAGE_PROFICIENCY,
    level: QualificationLevel.LEVEL_4,
    type: QualificationType.DIPLOMA,
    country: "ES",
    issuingBody: "Instituto Cervantes",
    description: "Spanish language proficiency certification",
    duration: "Test-based",
    azrReward: 300,
    verifiable: true,
    tags: ["Spanish", "language", "DELE", "proficiency"],
    recognizedIn: ["Global"]
  },
  
  {
    id: "qual-jlpt",
    name: "Japanese Language Proficiency Test",
    shortName: "JLPT",
    category: QualificationCategory.LANGUAGE_PROFICIENCY,
    level: QualificationLevel.LEVEL_4,
    type: QualificationType.CERTIFICATION,
    country: "JP",
    issuingBody: "Japan Foundation",
    description: "Japanese language proficiency test (N5-N1)",
    duration: "Test-based",
    azrReward: 400,
    verifiable: true,
    tags: ["Japanese", "language", "JLPT", "proficiency"],
    recognizedIn: ["Global"]
  },
  
  {
    id: "qual-hsk",
    name: "Hanyu Shuiping Kaoshi (Chinese Proficiency Test)",
    shortName: "HSK",
    category: QualificationCategory.LANGUAGE_PROFICIENCY,
    level: QualificationLevel.LEVEL_4,
    type: QualificationType.CERTIFICATION,
    country: "CN",
    issuingBody: "Hanban",
    description: "Chinese language proficiency test (HSK 1-6)",
    duration: "Test-based",
    azrReward: 400,
    verifiable: true,
    tags: ["Chinese", "Mandarin", "HSK", "proficiency"],
    recognizedIn: ["Global"]
  },
  
  {
    id: "qual-delf-dalf",
    name: "DELF/DALF French Proficiency",
    shortName: "DELF/DALF",
    category: QualificationCategory.LANGUAGE_PROFICIENCY,
    level: QualificationLevel.LEVEL_4,
    type: QualificationType.DIPLOMA,
    country: "FR",
    issuingBody: "French Ministry of Education",
    description: "French language proficiency diplomas",
    duration: "Test-based",
    azrReward: 350,
    verifiable: true,
    tags: ["French", "language", "DELF", "DALF"],
    recognizedIn: ["Global"]
  },
  
  // ========================================
  // TRADE CERTIFICATIONS
  // ========================================
  
  {
    id: "qual-electrician-journeyman",
    name: "Journeyman Electrician License",
    category: QualificationCategory.TRADE_CERTIFICATION,
    level: QualificationLevel.LEVEL_5,
    type: QualificationType.LICENSE,
    country: "US",
    issuingBody: "State Licensing Boards",
    description: "Licensed electrician able to work independently",
    duration: "4 years apprenticeship",
    prerequisites: ["Apprenticeship completion", "Exam"],
    azrReward: 2000,
    verifiable: true,
    tags: ["electrician", "trades", "journeyman", "license"],
    recognizedIn: ["State-specific"]
  },
  
  {
    id: "qual-plumber-master",
    name: "Master Plumber License",
    category: QualificationCategory.TRADE_CERTIFICATION,
    level: QualificationLevel.LEVEL_6,
    type: QualificationType.LICENSE,
    country: "US",
    issuingBody: "State/Local Licensing Boards",
    description: "Advanced plumbing license",
    duration: "2+ years as journeyman",
    prerequisites: ["Journeyman license", "Experience", "Exam"],
    azrReward: 2500,
    verifiable: true,
    tags: ["plumber", "master", "trades", "license"],
    recognizedIn: ["State-specific"]
  },
  
  {
    id: "qual-hvac-certification",
    name: "HVAC Excellence Certification",
    category: QualificationCategory.TRADE_CERTIFICATION,
    level: QualificationLevel.LEVEL_5,
    type: QualificationType.CERTIFICATION,
    country: "US",
    issuingBody: "HVAC Excellence",
    description: "HVAC technician certification",
    duration: "Training + exam",
    azrReward: 1500,
    verifiable: true,
    tags: ["HVAC", "heating", "cooling", "trades"],
    recognizedIn: ["USA"]
  },
  
  {
    id: "qual-welder-certification",
    name: "Certified Welder",
    category: QualificationCategory.TRADE_CERTIFICATION,
    level: QualificationLevel.LEVEL_5,
    type: QualificationType.CERTIFICATION,
    country: "International",
    issuingBody: "AWS (American Welding Society)",
    description: "Professional welder certification",
    duration: "Training + practical exam",
    azrReward: 1800,
    verifiable: true,
    tags: ["welder", "welding", "trades", "AWS"],
    recognizedIn: ["Global"]
  },
  
  // Continue with more qualifications...
];
