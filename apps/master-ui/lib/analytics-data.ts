// Analytics data and types for Azora Sapiens
export interface StudentAnalytics {
  studentId: string
  name: string
  email: string
  enrolledCourses: number
  completionRate: number
  averageScore: number
  totalLearningHours: number
  lastActive: string
  progress: CourseProgress[]
}

export interface CourseProgress {
  courseId: string
  courseName: string
  enrolled: string
  completion: number
  score: number
  learningHours: number
}

export interface CourseAnalytics {
  courseId: string
  courseName: string
  totalEnrollments: number
  activeStudents: number
  averageCompletion: number
  averageScore: number
  engagementRate: number
  dropoutRate: number
  monthlyGrowth: ChartDataPoint[]
  topPerformers: TopStudent[]
  lessonCompletion: LessonStats[]
}

export interface ChartDataPoint {
  month: string
  enrollments: number
  completions: number
  avgScore: number
}

export interface TopStudent {
  id: string
  name: string
  score: number
  completion: number
  learningHours: number
}

export interface LessonStats {
  lessonName: string
  completionRate: number
  avgTimeSpent: number
  quizPassRate: number
}

export const studentAnalyticsData: StudentAnalytics[] = [
  {
    studentId: "1",
    name: "Amina Ibrahim",
    email: "amina@example.com",
    enrolledCourses: 5,
    completionRate: 85,
    averageScore: 92,
    totalLearningHours: 156,
    lastActive: "2024-11-08",
    progress: [
      {
        courseId: "python-101",
        courseName: "Python for Data Science",
        enrolled: "2024-09-01",
        completion: 100,
        score: 95,
        learningHours: 42,
      },
      {
        courseId: "digital-marketing",
        courseName: "Digital Marketing",
        enrolled: "2024-09-15",
        completion: 75,
        score: 88,
        learningHours: 28,
      },
      {
        courseId: "ux-design",
        courseName: "UX/UI Design",
        enrolled: "2024-10-01",
        completion: 45,
        score: 91,
        learningHours: 18,
      },
    ],
  },
  {
    studentId: "2",
    name: "Chukwu Okafor",
    email: "chukwu@example.com",
    enrolledCourses: 3,
    completionRate: 70,
    averageScore: 84,
    totalLearningHours: 98,
    lastActive: "2024-11-07",
    progress: [
      {
        courseId: "python-101",
        courseName: "Python for Data Science",
        enrolled: "2024-10-01",
        completion: 80,
        score: 85,
        learningHours: 35,
      },
      {
        courseId: "digital-marketing",
        courseName: "Digital Marketing",
        enrolled: "2024-10-15",
        completion: 60,
        score: 82,
        learningHours: 22,
      },
    ],
  },
]

export const courseAnalyticsData: CourseAnalytics = {
  courseId: "python-101",
  courseName: "Python for Data Science Mastery",
  totalEnrollments: 15420,
  activeStudents: 8234,
  averageCompletion: 68,
  averageScore: 82,
  engagementRate: 74,
  dropoutRate: 12,
  monthlyGrowth: [
    { month: "Jul", enrollments: 1200, completions: 420, avgScore: 78 },
    { month: "Aug", enrollments: 1850, completions: 680, avgScore: 80 },
    { month: "Sep", enrollments: 2340, completions: 1050, avgScore: 82 },
    { month: "Oct", enrollments: 3210, completions: 1840, avgScore: 83 },
    { month: "Nov", enrollments: 3820, completions: 2350, avgScore: 84 },
  ],
  topPerformers: [
    { id: "1", name: "Amina Ibrahim", score: 95, completion: 100, learningHours: 42 },
    { id: "2", name: "David Mensah", score: 94, completion: 95, learningHours: 38 },
    { id: "3", name: "Zara Adeyemi", score: 93, completion: 90, learningHours: 35 },
  ],
  lessonCompletion: [
    { lessonName: "Python Fundamentals", completionRate: 95, avgTimeSpent: 45, quizPassRate: 92 },
    { lessonName: "Data Structures & Libraries", completionRate: 85, avgTimeSpent: 70, quizPassRate: 88 },
    { lessonName: "NumPy Essentials", completionRate: 78, avgTimeSpent: 65, quizPassRate: 84 },
    { lessonName: "Pandas for Data Manipulation", completionRate: 72, avgTimeSpent: 80, quizPassRate: 79 },
    { lessonName: "Machine Learning Basics", completionRate: 65, avgTimeSpent: 90, quizPassRate: 75 },
  ],
}
