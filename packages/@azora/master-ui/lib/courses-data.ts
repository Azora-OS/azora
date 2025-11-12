// Course management data and types for Azora Sapiens
export interface Course {
  id: string
  title: string
  description: string
  instructor: string
  instructorImage: string
  category: string
  level: string
  students: number
  rating: number
  duration: string
  price: number
  azrReward: number
  modules: Module[]
  image: string
  certification: boolean
  language: string
  createdAt: string
}

export interface Module {
  id: string
  title: string
  lessons: Lesson[]
  duration: string
}

export interface Lesson {
  id: string
  title: string
  type: "video" | "text" | "quiz" | "assignment"
  duration: string
  videoUrl?: string
  content?: string
}

export const coursesData: Course[] = [
  {
    id: "python-101",
    title: "Python for Data Science Mastery",
    description:
      "Master Python programming and data science from basics to advanced analytics. Learn from industry experts and build real-world projects.",
    instructor: "Dr. Amara Okafor",
    instructorImage: "/amara.jpg",
    category: "Technology",
    level: "Beginner to Intermediate",
    students: 15420,
    rating: 4.8,
    duration: "8 weeks",
    price: 49,
    azrReward: 500,
    language: "English",
    certification: true,
    image: "/python-logo.png",
    createdAt: "2024-01-15",
    modules: [
      {
        id: "mod-1",
        title: "Python Fundamentals",
        duration: "2 weeks",
        lessons: [
          { id: "les-1", title: "Introduction to Python", type: "video", duration: "45 min" },
          { id: "les-2", title: "Variables and Data Types", type: "video", duration: "60 min" },
          { id: "les-3", title: "Control Flow", type: "video", duration: "50 min" },
          { id: "les-4", title: "Quiz: Fundamentals", type: "quiz", duration: "30 min" },
        ],
      },
      {
        id: "mod-2",
        title: "Data Structures & Libraries",
        duration: "3 weeks",
        lessons: [
          { id: "les-5", title: "NumPy Essentials", type: "video", duration: "70 min" },
          { id: "les-6", title: "Pandas for Data Manipulation", type: "video", duration: "80 min" },
          { id: "les-7", title: "Project: Data Analysis", type: "assignment", duration: "4 hours" },
        ],
      },
      {
        id: "mod-3",
        title: "Advanced Analytics & Visualization",
        duration: "3 weeks",
        lessons: [
          { id: "les-8", title: "Matplotlib & Seaborn", type: "video", duration: "60 min" },
          { id: "les-9", title: "Machine Learning Basics", type: "video", duration: "90 min" },
          { id: "les-10", title: "Capstone Project", type: "assignment", duration: "8 hours" },
        ],
      },
    ],
  },
  {
    id: "digital-marketing",
    title: "Digital Marketing & Social Strategy",
    description:
      "Build a complete digital marketing strategy. Learn SEO, content marketing, social media, and analytics to grow your brand online.",
    instructor: "Kwame Mensah",
    instructorImage: "/kwame.jpg",
    category: "Business",
    level: "Beginner to Intermediate",
    students: 12350,
    rating: 4.7,
    duration: "6 weeks",
    price: 39,
    azrReward: 400,
    language: "English",
    certification: true,
    image: "/digital-marketing.jpg",
    createdAt: "2024-02-01",
    modules: [
      {
        id: "mod-dm1",
        title: "Digital Marketing Foundations",
        duration: "2 weeks",
        lessons: [
          { id: "les-dm1", title: "Overview of Digital Marketing", type: "video", duration: "45 min" },
          { id: "les-dm2", title: "Understanding Your Audience", type: "video", duration: "50 min" },
          { id: "les-dm3", title: "Quiz: Foundations", type: "quiz", duration: "30 min" },
        ],
      },
    ],
  },
  {
    id: "ux-design",
    title: "UX/UI Design Fundamentals",
    description:
      "Learn to design user-centered interfaces. Master design thinking, wireframing, prototyping, and user testing principles.",
    instructor: "Zainab Hassan",
    instructorImage: "/zainab.jpg",
    category: "Design",
    level: "Beginner",
    students: 9870,
    rating: 4.9,
    duration: "7 weeks",
    price: 44,
    azrReward: 450,
    language: "English",
    certification: true,
    image: "/ux-design.jpg",
    createdAt: "2024-01-20",
    modules: [],
  },
]

export function getCourseById(id: string): Course | undefined {
  return coursesData.find((course) => course.id === id)
}

export function getCoursesByCategory(category: string): Course[] {
  return coursesData.filter((course) => course.category === category)
}

export function getTopCourses(limit = 5): Course[] {
  return coursesData.sort((a, b) => b.rating - a.rating).slice(0, limit)
}

export function searchCourses(query: string): Course[] {
  const lowerQuery = query.toLowerCase()
  return coursesData.filter(
    (course) =>
      course.title.toLowerCase().includes(lowerQuery) ||
      course.description.toLowerCase().includes(lowerQuery) ||
      course.category.toLowerCase().includes(lowerQuery),
  )
}
