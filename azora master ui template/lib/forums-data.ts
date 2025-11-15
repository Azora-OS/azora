// Forums and community data for Azora Sapiens
export interface ForumCategory {
  id: string
  name: string
  description: string
  icon: string
  threads: number
  members: number
  lastActivity: string
}

export interface ForumThread {
  id: string
  title: string
  content: string
  author: string
  authorImage: string
  authorRole: "student" | "educator" | "mentor"
  category: string
  courseId?: string
  courseName?: string
  createdAt: string
  replies: number
  views: number
  likes: number
  isPinned: boolean
  isSolved: boolean
  tags: string[]
  posts: ForumPost[]
}

export interface ForumPost {
  id: string
  content: string
  author: string
  authorImage: string
  authorRole: "student" | "educator" | "mentor"
  createdAt: string
  likes: number
  isAnswer: boolean
  replies: ForumReply[]
}

export interface ForumReply {
  id: string
  content: string
  author: string
  authorImage: string
  createdAt: string
  likes: number
}

export const forumCategories: ForumCategory[] = [
  {
    id: "general",
    name: "General Discussion",
    description: "General topics and announcements",
    icon: "💬",
    threads: 2840,
    members: 15420,
    lastActivity: "2024-11-08",
  },
  {
    id: "tech-help",
    name: "Technical Support",
    description: "Get help with technical issues",
    icon: "🛠️",
    threads: 1650,
    members: 9230,
    lastActivity: "2024-11-08",
  },
  {
    id: "course-specific",
    name: "Course Discussions",
    description: "Course-specific Q&A and discussions",
    icon: "📚",
    threads: 4220,
    members: 12000,
    lastActivity: "2024-11-08",
  },
  {
    id: "career",
    name: "Career & Jobs",
    description: "Career advice and job opportunities",
    icon: "💼",
    threads: 890,
    members: 5600,
    lastActivity: "2024-11-07",
  },
  {
    id: "projects",
    name: "Project Showcase",
    description: "Share and discuss your projects",
    icon: "🚀",
    threads: 1234,
    members: 4800,
    lastActivity: "2024-11-08",
  },
  {
    id: "resources",
    name: "Learning Resources",
    description: "Share and find learning materials",
    icon: "📖",
    threads: 756,
    members: 6200,
    lastActivity: "2024-11-07",
  },
]

export const forumThreadsData: ForumThread[] = [
  {
    id: "thread-1",
    title: "Best practices for data cleaning in pandas",
    content:
      "I'm working with a large dataset and having trouble with null values. What are the best practices for data cleaning?",
    author: "Amina Ibrahim",
    authorImage: "/placeholder.svg?key=user1",
    authorRole: "student",
    category: "course-specific",
    courseId: "python-101",
    courseName: "Python for Data Science",
    createdAt: "2024-11-08T14:30:00",
    replies: 8,
    views: 342,
    likes: 45,
    isPinned: true,
    isSolved: true,
    tags: ["pandas", "data-cleaning", "python"],
    posts: [
      {
        id: "post-1",
        content:
          "Great question! Here are some key strategies: 1) Use dropna() for missing values, 2) Forward fill or backward fill for time series, 3) Use fillna() with mean/median for numeric data.",
        author: "Dr. Amara Okafor",
        authorImage: "/placeholder.svg?key=educator1",
        authorRole: "educator",
        createdAt: "2024-11-08T15:45:00",
        likes: 52,
        isAnswer: true,
        replies: [],
      },
      {
        id: "post-2",
        content:
          "Thanks for the detailed response! I also found that using isnull() to identify missing values first really helps with understanding the data.",
        author: "Chukwu Okafor",
        authorImage: "/placeholder.svg?key=user2",
        authorRole: "student",
        createdAt: "2024-11-08T16:20:00",
        likes: 12,
        isAnswer: false,
        replies: [],
      },
    ],
  },
  {
    id: "thread-2",
    title: "Transitioning from beginner to intermediate Python",
    content:
      "I've completed the basics module. What concepts should I focus on next? Should I dive into data science or web development?",
    author: "Kwesi Mensah",
    authorImage: "/placeholder.svg?key=user3",
    authorRole: "student",
    category: "course-specific",
    courseId: "python-101",
    courseName: "Python for Data Science",
    createdAt: "2024-11-07T10:00:00",
    replies: 15,
    views: 589,
    likes: 78,
    isPinned: false,
    isSolved: false,
    tags: ["career", "learning-path", "intermediate"],
    posts: [],
  },
  {
    id: "thread-3",
    title: "API Integration Tips for Digital Marketing Campaigns",
    content: "Looking for best practices when integrating marketing APIs for campaign tracking and analytics.",
    author: "Zara Adeyemi",
    authorImage: "/placeholder.svg?key=user4",
    authorRole: "mentor",
    category: "course-specific",
    courseId: "digital-marketing",
    courseName: "Digital Marketing & Social Strategy",
    createdAt: "2024-11-06T09:15:00",
    replies: 6,
    views: 234,
    likes: 28,
    isPinned: false,
    isSolved: false,
    tags: ["api", "marketing", "integration"],
    posts: [],
  },
]
