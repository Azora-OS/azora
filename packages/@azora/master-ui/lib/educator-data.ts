export interface Course {
  id: string
  title: string
  description: string
  category: string
  level: string
  duration: string
  studentsEnrolled: number
  rating: number
  reviews: number
  price?: number
  azrReward: number
  certifiable: boolean
  instructor: string
  image?: string
}

export interface EducatorProfile {
  id: string
  name: string
  email: string
  bio: string
  country: string
  expertise: string[]
  totalStudents: number
  totalCourses: number
  averageRating: number
  coursesCreated: number
  verifiedBadge: boolean
  profileImage?: string
  joinedDate: string
  courses?: Course[]
}

export const educatorProfiles: EducatorProfile[] = [
  {
    id: "edu-001",
    name: "Dr. Amara Okafor",
    email: "amara@azora.edu",
    bio: "Leading computer science educator from Nigeria with 15+ years of experience in curriculum design and AI education.",
    country: "Nigeria",
    expertise: ["Computer Science", "Machine Learning", "Web Development", "African Tech"],
    totalStudents: 5420,
    totalCourses: 12,
    averageRating: 4.8,
    coursesCreated: 12,
    verifiedBadge: true,
    joinedDate: "2023-01-15",
    courses: [
      {
        id: "course-001",
        title: "Python for Data Science",
        description: "Master Python for data analysis and visualization",
        category: "Technology & IT",
        level: "Intermediate",
        duration: "8 weeks",
        studentsEnrolled: 2340,
        rating: 4.9,
        reviews: 856,
        azrReward: 5000,
        certifiable: true,
        instructor: "Dr. Amara Okafor",
      },
      {
        id: "course-002",
        title: "Introduction to Machine Learning",
        description: "Get started with ML fundamentals and applications",
        category: "Technology & IT",
        level: "Intermediate",
        duration: "10 weeks",
        studentsEnrolled: 1890,
        rating: 4.7,
        reviews: 634,
        azrReward: 7000,
        certifiable: true,
        instructor: "Dr. Amara Okafor",
      },
    ],
  },
  {
    id: "edu-002",
    name: "Prof. Kwame Mensah",
    email: "kwame@azora.edu",
    bio: "Business management expert from Ghana specializing in entrepreneurship and African markets.",
    country: "Ghana",
    expertise: ["Business Management", "Entrepreneurship", "Finance", "African Markets"],
    totalStudents: 3890,
    totalCourses: 8,
    averageRating: 4.6,
    coursesCreated: 8,
    verifiedBadge: true,
    joinedDate: "2023-02-20",
  },
]

export interface InstitutionProfile {
  id: string
  name: string
  country: string
  website: string
  bio: string
  accreditation: string[]
  totalPrograms: number
  totalStudents: number
  logo?: string
  established: number
  rankingGlobal?: number
  qualificationsOffered: string[]
}

export const institutions: InstitutionProfile[] = [
  {
    id: "inst-001",
    name: "University of Lagos",
    country: "Nigeria",
    website: "unilag.edu.ng",
    bio: "Premier institution for higher education in West Africa with world-class research facilities.",
    accreditation: ["WAEC", "NUC", "UNESCO"],
    totalPrograms: 150,
    totalStudents: 28000,
    established: 1962,
    rankingGlobal: 1201,
    qualificationsOffered: ["Bachelor Degrees", "Master Degrees", "PhD Programs"],
  },
  {
    id: "inst-002",
    name: "University of Cape Town",
    country: "South Africa",
    website: "uct.ac.za",
    bio: "Africa's leading research institution with global recognition in multiple disciplines.",
    accreditation: ["SAQA", "CHE", "QS"],
    totalPrograms: 200,
    totalStudents: 32000,
    established: 1829,
    rankingGlobal: 184,
    qualificationsOffered: ["Bachelor Degrees", "Master Degrees", "PhD Programs", "Executive Education"],
  },
]
