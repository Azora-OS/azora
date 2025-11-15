// Mentor and skills marketplace data for Azora Sapiens
export interface Mentor {
  id: string
  name: string
  image: string
  title: string
  bio: string
  expertise: string[]
  yearsExperience: number
  hourlyRate: number
  rating: number
  reviewCount: number
  responseTime: string
  availability: string
  languages: string[]
  mentees: number
  sessionCount: number
  verified: boolean
  badges: string[]
}

export interface Skill {
  id: string
  name: string
  category: string
  demandLevel: "low" | "medium" | "high"
  azrValue: number
  description: string
  prerequisites: string[]
  courseId?: string
  marketTrend: number // percentage change
}

export interface MentorshipSession {
  id: string
  mentorId: string
  mentorName: string
  studentId: string
  studentName: string
  topic: string
  duration: number
  scheduledTime: string
  status: "pending" | "active" | "completed" | "cancelled"
  rate: number
  notes: string
}

export const mentorsData: Mentor[] = [
  {
    id: "mentor-1",
    name: "Dr. Amara Okafor",
    image: "/placeholder.svg?key=mentor1",
    title: "Senior Data Scientist & Python Expert",
    bio: "Industry veteran with 12+ years of experience in data science, machine learning, and AI. Published researcher and open-source contributor. Passionate about mentoring the next generation of tech leaders.",
    expertise: ["Python", "Machine Learning", "Data Science", "AI", "Statistics"],
    yearsExperience: 12,
    hourlyRate: 85,
    rating: 4.9,
    reviewCount: 287,
    responseTime: "< 2 hours",
    availability: "Mon-Fri 2-8pm UTC, Sat-Sun Flexible",
    languages: ["English", "Yoruba", "French"],
    mentees: 34,
    sessionCount: 892,
    verified: true,
    badges: ["Top Mentor", "Expert", "Responsive"],
  },
  {
    id: "mentor-2",
    name: "Kwame Mensah",
    image: "/placeholder.svg?key=mentor2",
    title: "Digital Marketing Strategist",
    bio: "Former marketing director at tech startup. Specializes in digital marketing strategy, SEO, content marketing, and growth hacking. Helped 100+ businesses scale their digital presence.",
    expertise: ["Digital Marketing", "SEO", "Content Marketing", "Analytics", "Growth Hacking"],
    yearsExperience: 10,
    hourlyRate: 65,
    rating: 4.8,
    reviewCount: 156,
    responseTime: "< 1 hour",
    availability: "Mon-Fri 9am-5pm UTC",
    languages: ["English", "Twi"],
    mentees: 22,
    sessionCount: 456,
    verified: true,
    badges: ["Expert", "Fast Responder"],
  },
  {
    id: "mentor-3",
    name: "Zainab Hassan",
    image: "/placeholder.svg?key=mentor3",
    title: "UX/UI Design Lead",
    bio: "Design leader with experience at top tech companies. Expert in user research, interaction design, and design systems. Advocate for inclusive and accessible design.",
    expertise: ["UX Design", "UI Design", "Design Systems", "User Research", "Figma"],
    yearsExperience: 9,
    hourlyRate: 75,
    rating: 4.9,
    reviewCount: 198,
    responseTime: "< 3 hours",
    availability: "Tue-Sat 10am-6pm UTC",
    languages: ["English", "Arabic", "French"],
    mentees: 28,
    sessionCount: 634,
    verified: true,
    badges: ["Top Mentor", "Expert", "Inclusive Design"],
  },
]

export const skillsMarketplaceData: Skill[] = [
  {
    id: "skill-1",
    name: "Python Programming",
    category: "Technology",
    demandLevel: "high",
    azrValue: 500,
    description: "Master Python from basics to advanced applications including data science and web development.",
    prerequisites: [],
    courseId: "python-101",
    marketTrend: 15,
  },
  {
    id: "skill-2",
    name: "Machine Learning",
    category: "Technology",
    demandLevel: "high",
    azrValue: 750,
    description: "Build and deploy machine learning models for real-world applications.",
    prerequisites: ["Python Programming", "Statistics"],
    marketTrend: 22,
  },
  {
    id: "skill-3",
    name: "Digital Marketing Strategy",
    category: "Business",
    demandLevel: "high",
    azrValue: 400,
    description: "Create comprehensive digital marketing strategies for business growth.",
    prerequisites: ["Analytics Basics"],
    marketTrend: 18,
  },
  {
    id: "skill-4",
    name: "UX Design",
    category: "Design",
    demandLevel: "high",
    azrValue: 600,
    description: "Design user-centered interfaces and experiences.",
    prerequisites: ["Design Fundamentals"],
    marketTrend: 12,
  },
  {
    id: "skill-5",
    name: "React Development",
    category: "Technology",
    demandLevel: "high",
    azrValue: 550,
    description: "Build modern web applications using React.",
    prerequisites: ["JavaScript Basics"],
    marketTrend: 20,
  },
  {
    id: "skill-6",
    name: "Data Analysis",
    category: "Technology",
    demandLevel: "medium",
    azrValue: 350,
    description: "Analyze and visualize data for business insights.",
    prerequisites: ["Statistics", "SQL"],
    marketTrend: 8,
  },
  {
    id: "skill-7",
    name: "Cloud Architecture",
    category: "Technology",
    demandLevel: "high",
    azrValue: 700,
    description: "Design and implement scalable cloud solutions.",
    prerequisites: ["System Design", "DevOps Basics"],
    marketTrend: 25,
  },
  {
    id: "skill-8",
    name: "Product Management",
    category: "Business",
    demandLevel: "medium",
    azrValue: 450,
    description: "Lead product development and strategy.",
    prerequisites: ["Business Fundamentals"],
    marketTrend: 10,
  },
]
