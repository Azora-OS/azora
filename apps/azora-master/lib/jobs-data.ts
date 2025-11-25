export interface JobPosting {
  id: string
  title: string
  company: string
  location: string
  salary: string
  type: "Full-time" | "Part-time" | "Contract" | "Remote"
  description: string
  requirements: string[]
  qualifications: string[]
  skills: string[]
  azrBonus?: number
  applications: number
  posted: string
  deadline?: string
  level: "Entry" | "Mid" | "Senior" | "Executive"
}

export interface EmployerProfile {
  id: string
  name: string
  logo?: string
  industry: string
  location: string
  founded: number
  employees: string
  description: string
  website: string
  rating: number
  reviews: number
  jobsPosted: number
  jobsFilled: number
  verifiedEmployer: boolean
}

export const jobPostings: JobPosting[] = [
  {
    id: "job-001",
    title: "Senior Cloud Architect",
    company: "TechCorp Africa",
    location: "Lagos, Nigeria",
    salary: "$120,000 - $160,000",
    type: "Full-time",
    description:
      "Design and implement scalable cloud solutions for our rapidly growing fintech platform serving 10+ African countries.",
    requirements: [
      "AWS Certified Cloud Architect or equivalent",
      "5+ years experience with cloud infrastructure",
      "Experience with containerization and DevOps",
    ],
    qualifications: ["qual-aws-cca", "qual-cissp"],
    skills: ["AWS", "Docker", "Kubernetes", "Infrastructure as Code", "Security"],
    azrBonus: 2000,
    applications: 24,
    posted: "2025-01-18",
    deadline: "2025-02-18",
    level: "Senior",
  },
  {
    id: "job-002",
    title: "Full-Stack Developer",
    company: "AfriTech Solutions",
    location: "Remote",
    salary: "$60,000 - $90,000",
    type: "Remote",
    description:
      "Build next-generation web applications for the African market. Work with modern tech stack and collaborate with global team.",
    requirements: [
      "Strong JavaScript/TypeScript skills",
      "3+ years full-stack development",
      "Experience with React and Node.js",
    ],
    qualifications: [],
    skills: ["React", "Node.js", "TypeScript", "PostgreSQL", "REST APIs"],
    azrBonus: 1500,
    applications: 45,
    posted: "2025-01-15",
    deadline: "2025-02-15",
    level: "Mid",
  },
  {
    id: "job-003",
    title: "Data Scientist",
    company: "Innovation Hub",
    location: "Cape Town, South Africa",
    salary: "$80,000 - $120,000",
    type: "Full-time",
    description: "Lead data analysis and machine learning initiatives for retail and financial services projects.",
    requirements: [
      "Advanced degree in Data Science or related field",
      "Proficiency with Python and machine learning libraries",
      "3+ years experience in data science roles",
    ],
    qualifications: ["qual-phd"],
    skills: ["Python", "Machine Learning", "SQL", "Data Visualization", "Statistics"],
    azrBonus: 2000,
    applications: 18,
    posted: "2025-01-20",
    level: "Mid",
  },
  {
    id: "job-004",
    title: "Junior Developer",
    company: "Code Academy Africa",
    location: "Remote",
    salary: "$30,000 - $45,000",
    type: "Full-time",
    description: "Start your tech career with us. We mentor junior developers while building real-world applications.",
    requirements: [
      "Bootcamp completion or equivalent self-study",
      "Portfolio with 2-3 projects",
      "Eager to learn and grow",
    ],
    qualifications: [],
    skills: ["JavaScript", "React", "HTML/CSS", "Version Control", "Problem Solving"],
    azrBonus: 500,
    applications: 156,
    posted: "2025-01-10",
    level: "Entry",
  },
  {
    id: "job-005",
    title: "Cybersecurity Analyst",
    company: "SecureAfrica",
    location: "Johannesburg, South Africa",
    salary: "$70,000 - $100,000",
    type: "Full-time",
    description:
      "Protect critical infrastructure and conduct penetration testing for government and enterprise clients.",
    requirements: [
      "CISSP or CEH certification",
      "4+ years cybersecurity experience",
      "Expertise in network and application security",
    ],
    qualifications: ["qual-cissp"],
    skills: ["Network Security", "Penetration Testing", "Incident Response", "Compliance", "Risk Management"],
    azrBonus: 1500,
    applications: 12,
    posted: "2025-01-22",
    deadline: "2025-02-22",
    level: "Mid",
  },
  {
    id: "job-006",
    title: "Business Operations Manager",
    company: "Global Trade Corp",
    location: "Accra, Ghana",
    salary: "$50,000 - $75,000",
    type: "Full-time",
    description: "Oversee daily operations and lead process improvements for our East African division.",
    requirements: [
      "Business management certification or MBA",
      "3+ years operations management",
      "Process optimization expertise",
    ],
    qualifications: ["qual-mba"],
    skills: ["Operations Management", "Process Optimization", "Leadership", "Analytics", "Communication"],
    azrBonus: 1000,
    applications: 8,
    posted: "2025-01-19",
    level: "Mid",
  },
]

export const employers: EmployerProfile[] = [
  {
    id: "emp-001",
    name: "TechCorp Africa",
    industry: "Technology & Fintech",
    location: "Lagos, Nigeria",
    founded: 2018,
    employees: "500-1000",
    description: "Leading fintech company providing payment solutions across Africa.",
    website: "techcorpafrica.com",
    rating: 4.8,
    reviews: 245,
    jobsPosted: 18,
    jobsFilled: 156,
    verifiedEmployer: true,
  },
  {
    id: "emp-002",
    name: "AfriTech Solutions",
    industry: "Software Development",
    location: "Multiple Locations",
    founded: 2015,
    employees: "200-500",
    description: "Building innovative tech solutions for African businesses and consumers.",
    website: "afritechsolutions.com",
    rating: 4.6,
    reviews: 178,
    jobsPosted: 12,
    jobsFilled: 89,
    verifiedEmployer: true,
  },
  {
    id: "emp-003",
    name: "Innovation Hub",
    industry: "Data & Analytics",
    location: "Cape Town, South Africa",
    founded: 2016,
    employees: "100-200",
    description: "Advanced analytics and AI solutions for retail and financial services.",
    website: "innovationhub.co.za",
    rating: 4.7,
    reviews: 156,
    jobsPosted: 8,
    jobsFilled: 67,
    verifiedEmployer: true,
  },
]
