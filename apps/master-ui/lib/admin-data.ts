// Admin panel and moderation data for Azora Sapiens
export interface AdminUser {
  id: string
  name: string
  email: string
  role: "super_admin" | "moderator" | "content_manager"
  permissions: string[]
  lastActive: string
  status: "active" | "inactive"
}

export interface ModerationItem {
  id: string
  type: "forum_post" | "course" | "mentor_profile" | "user_profile"
  title: string
  author: string
  reportedBy: string
  reason: string
  severity: "low" | "medium" | "high"
  createdAt: string
  status: "pending" | "reviewing" | "resolved" | "dismissed"
}

export interface PlatformMetrics {
  totalUsers: number
  activeUsers: number
  totalCourses: number
  totalEnrollments: number
  totalMentorSessions: number
  azrTokensMinted: number
  platformRevenue: number
  userGrowthRate: number
  engagementRate: number
}

export interface ContentItem {
  id: string
  title: string
  type: "course" | "mentor_profile" | "resource"
  status: "draft" | "published" | "flagged" | "archived"
  creator: string
  createdAt: string
  views: number
  rating: number
}

export const adminUsersData: AdminUser[] = [
  {
    id: "admin-1",
    name: "Kofi Adjei",
    email: "kofi@azorasapiens.com",
    role: "super_admin",
    permissions: [
      "manage_users",
      "manage_courses",
      "manage_mentors",
      "moderate_content",
      "view_analytics",
      "manage_admins",
    ],
    lastActive: "2024-11-08T14:30:00",
    status: "active",
  },
  {
    id: "admin-2",
    name: "Fatima Al-Rashid",
    email: "fatima@azorasapiens.com",
    role: "moderator",
    permissions: ["moderate_content", "view_analytics", "manage_users"],
    lastActive: "2024-11-08T12:15:00",
    status: "active",
  },
  {
    id: "admin-3",
    name: "Samuel Okonkwo",
    email: "samuel@azorasapiens.com",
    role: "content_manager",
    permissions: ["manage_courses", "manage_mentors", "view_analytics"],
    lastActive: "2024-11-07T09:45:00",
    status: "active",
  },
]

export const moderationItemsData: ModerationItem[] = [
  {
    id: "mod-1",
    type: "forum_post",
    title: "Inappropriate language in technical discussion",
    author: "User_12345",
    reportedBy: "User_67890",
    reason: "Harassment and inappropriate language",
    severity: "high",
    createdAt: "2024-11-08T10:20:00",
    status: "reviewing",
  },
  {
    id: "mod-2",
    type: "course",
    title: "Unaccredited Finance Course",
    author: "NewTeacher_2024",
    reportedBy: "Content_Team",
    reason: "Course lacks proper credentials and certifications",
    severity: "medium",
    createdAt: "2024-11-08T08:45:00",
    status: "pending",
  },
  {
    id: "mod-3",
    type: "mentor_profile",
    title: "Suspicious Mentor Profile Claims",
    author: "Mentor_5678",
    reportedBy: "User_11111",
    reason: "Unverifiable experience claims",
    severity: "medium",
    createdAt: "2024-11-07T15:30:00",
    status: "reviewing",
  },
  {
    id: "mod-4",
    type: "user_profile",
    title: "Spam Profile with Promotional Content",
    author: "SpamUser_999",
    reportedBy: "AutoMod_System",
    reason: "Profile full of promotional links and spam",
    severity: "high",
    createdAt: "2024-11-06T20:10:00",
    status: "resolved",
  },
]

export const platformMetricsData: PlatformMetrics = {
  totalUsers: 247150,
  activeUsers: 89340,
  totalCourses: 892,
  totalEnrollments: 456230,
  totalMentorSessions: 12340,
  azrTokensMinted: 45230000,
  platformRevenue: 1234560,
  userGrowthRate: 12.5,
  engagementRate: 67.3,
}

export const contentItemsData: ContentItem[] = [
  {
    id: "content-1",
    title: "Python for Data Science Mastery",
    type: "course",
    status: "published",
    creator: "Dr. Amara Okafor",
    createdAt: "2024-01-15",
    views: 15420,
    rating: 4.8,
  },
  {
    id: "content-2",
    title: "Digital Marketing & Social Strategy",
    type: "course",
    status: "published",
    creator: "Kwame Mensah",
    createdAt: "2024-02-01",
    views: 12350,
    rating: 4.7,
  },
  {
    id: "content-3",
    title: "Advanced Data Science Specialization",
    type: "course",
    status: "flagged",
    creator: "NewTeacher_2024",
    createdAt: "2024-10-20",
    views: 234,
    rating: 2.1,
  },
]
