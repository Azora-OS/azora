export interface StudyRoom {
  id: string;
  name: string;
  description: string;
  courseId?: string;
  subject: string;
  createdBy: string;
  creatorName: string;
  type: 'public' | 'private' | 'course';
  capacity: number;
  participants: Participant[];
  status: 'active' | 'inactive' | 'archived';
  features: RoomFeatures;
  lectureSession?: string;
  whiteboard?: string;
  notes: CollaborativeNote[];
  assignments: Assignment[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Participant {
  userId: string;
  userName: string;
  role: 'owner' | 'moderator' | 'member';
  joinedAt: Date;
  lastActive: Date;
  status: 'online' | 'offline' | 'away';
  pokEarned: number;
  contributionScore: number;
}

export interface RoomFeatures {
  videoLecture: boolean;
  whiteboard: boolean;
  notes: boolean;
  chat: boolean;
  screenShare: boolean;
  aiTutor: boolean;
  assignments: boolean;
  pokRewards: boolean;
}

export interface CollaborativeNote {
  id: string;
  roomId: string;
  title: string;
  content: string;
  contributors: NoteContributor[];
  version: number;
  lastEditedBy: string;
  lastEditedAt: Date;
  createdAt: Date;
}

export interface NoteContributor {
  userId: string;
  userName: string;
  edits: number;
  lastEdit: Date;
}

export interface Assignment {
  id: string;
  roomId: string;
  title: string;
  description: string;
  dueDate: Date;
  totalPoints: number;
  submissions: Submission[];
  createdBy: string;
  createdAt: Date;
}

export interface Submission {
  id: string;
  assignmentId: string;
  studentId: string;
  studentName: string;
  fileUrl?: string;
  content?: string;
  submittedAt: Date;
  grade?: number;
  feedback?: string;
  pokAwarded?: number;
}

export interface AITutorSession {
  id: string;
  roomId: string;
  userId: string;
  userName: string;
  messages: AIMessage[];
  topic: string;
  startedAt: Date;
  endedAt?: Date;
  pokEarned: number;
}

export interface AIMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface PeerLearningGroup {
  id: string;
  roomId: string;
  name: string;
  members: string[];
  topic: string;
  schedule?: string;
  pokPool: number;
  createdAt: Date;
}

export interface POKReward {
  userId: string;
  roomId: string;
  amount: number;
  reason: 'participation' | 'contribution' | 'assignment' | 'helping_peer' | 'ai_learning';
  timestamp: Date;
}
