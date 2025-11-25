import { EventEmitter } from 'events';
import axios from 'axios';
import {
  StudyRoom,
  Participant,
  CollaborativeNote,
  Assignment,
  Submission,
  AITutorSession,
  AIMessage,
  PeerLearningGroup,
  POKReward,
  RoomFeatures
} from './types';

export class StudySpacesService extends EventEmitter {
  private rooms: Map<string, StudyRoom> = new Map();
  private notes: Map<string, CollaborativeNote[]> = new Map();
  private aiSessions: Map<string, AITutorSession[]> = new Map();
  private peerGroups: Map<string, PeerLearningGroup[]> = new Map();
  private pokRewards: POKReward[] = [];

  constructor(
    private config: {
      classroomServiceUrl: string;
      sapiensServiceUrl: string;
      mintServiceUrl: string;
      port: number;
    }
  ) {
    super();
  }

  async createRoom(
    name: string,
    description: string,
    createdBy: string,
    creatorName: string,
    subject: string,
    type: StudyRoom['type'] = 'public',
    courseId?: string
  ): Promise<StudyRoom> {
    const roomId = `room_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const room: StudyRoom = {
      id: roomId,
      name,
      description,
      courseId,
      subject,
      createdBy,
      creatorName,
      type,
      capacity: 50,
      participants: [{
        userId: createdBy,
        userName: creatorName,
        role: 'owner',
        joinedAt: new Date(),
        lastActive: new Date(),
        status: 'online',
        pokEarned: 0,
        contributionScore: 0
      }],
      status: 'active',
      features: {
        videoLecture: true,
        whiteboard: true,
        notes: true,
        chat: true,
        screenShare: true,
        aiTutor: true,
        assignments: true,
        pokRewards: true
      },
      notes: [],
      assignments: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.rooms.set(roomId, room);
    this.notes.set(roomId, []);
    this.aiSessions.set(roomId, []);
    this.peerGroups.set(roomId, []);

    this.emit('room-created', room);
    return room;
  }

  async joinRoom(roomId: string, userId: string, userName: string): Promise<{ room: StudyRoom; participant: Participant }> {
    const room = this.rooms.get(roomId);
    if (!room) throw new Error('Room not found');
    if (room.participants.length >= room.capacity) throw new Error('Room is full');

    let participant = room.participants.find(p => p.userId === userId);
    
    if (!participant) {
      participant = {
        userId,
        userName,
        role: 'member',
        joinedAt: new Date(),
        lastActive: new Date(),
        status: 'online',
        pokEarned: 0,
        contributionScore: 0
      };
      room.participants.push(participant);
      await this.awardPOK(userId, roomId, 5, 'participation');
    } else {
      participant.status = 'online';
      participant.lastActive = new Date();
    }

    room.updatedAt = new Date();
    this.emit('participant-joined', { room, participant });
    return { room, participant };
  }

  async leaveRoom(roomId: string, userId: string): Promise<void> {
    const room = this.rooms.get(roomId);
    if (!room) throw new Error('Room not found');

    const participant = room.participants.find(p => p.userId === userId);
    if (participant) {
      participant.status = 'offline';
      participant.lastActive = new Date();
      this.emit('participant-left', { room, participant });
    }
  }

  async startLiveLecture(roomId: string, instructorId: string, title: string, description: string): Promise<string> {
    const room = this.rooms.get(roomId);
    if (!room) throw new Error('Room not found');
    if (!room.features.videoLecture) throw new Error('Video lectures disabled');

    const response = await axios.post(`${this.config.classroomServiceUrl}/sessions`, {
      courseId: room.courseId || roomId,
      courseName: room.name,
      instructorId,
      instructorName: room.creatorName,
      title,
      description,
      scheduledStart: new Date(),
      scheduledEnd: new Date(Date.now() + 2 * 60 * 60 * 1000),
      platform: 'jitsi'
    });

    room.lectureSession = response.data.id;
    room.updatedAt = new Date();
    
    this.emit('lecture-started', { roomId, sessionId: response.data.id });
    return response.data.id;
  }

  async createCollaborativeNote(roomId: string, userId: string, userName: string, title: string, content: string = ''): Promise<CollaborativeNote> {
    const room = this.rooms.get(roomId);
    if (!room) throw new Error('Room not found');
    if (!room.features.notes) throw new Error('Notes disabled');

    const note: CollaborativeNote = {
      id: `note_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      roomId,
      title,
      content,
      contributors: [{
        userId,
        userName,
        edits: 1,
        lastEdit: new Date()
      }],
      version: 1,
      lastEditedBy: userId,
      lastEditedAt: new Date(),
      createdAt: new Date()
    };

    const roomNotes = this.notes.get(roomId) || [];
    roomNotes.push(note);
    this.notes.set(roomId, roomNotes);
    room.notes.push(note);

    await this.awardPOK(userId, roomId, 10, 'contribution');
    this.emit('note-created', note);
    return note;
  }

  async updateNote(noteId: string, userId: string, userName: string, content: string): Promise<CollaborativeNote> {
    let targetNote: CollaborativeNote | undefined;
    
    for (const notes of this.notes.values()) {
      const note = notes.find(n => n.id === noteId);
      if (note) {
        targetNote = note;
        break;
      }
    }

    if (!targetNote) throw new Error('Note not found');

    targetNote.content = content;
    targetNote.version++;
    targetNote.lastEditedBy = userId;
    targetNote.lastEditedAt = new Date();

    let contributor = targetNote.contributors.find(c => c.userId === userId);
    if (contributor) {
      contributor.edits++;
      contributor.lastEdit = new Date();
    } else {
      targetNote.contributors.push({
        userId,
        userName,
        edits: 1,
        lastEdit: new Date()
      });
    }

    await this.awardPOK(userId, targetNote.roomId, 5, 'contribution');
    this.emit('note-updated', targetNote);
    return targetNote;
  }

  async createAssignment(roomId: string, createdBy: string, title: string, description: string, dueDate: Date, totalPoints: number): Promise<Assignment> {
    const room = this.rooms.get(roomId);
    if (!room) throw new Error('Room not found');
    if (!room.features.assignments) throw new Error('Assignments disabled');

    const assignment: Assignment = {
      id: `assign_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      roomId,
      title,
      description,
      dueDate,
      totalPoints,
      submissions: [],
      createdBy,
      createdAt: new Date()
    };

    room.assignments.push(assignment);
    room.updatedAt = new Date();

    this.emit('assignment-created', assignment);
    return assignment;
  }

  async submitAssignment(assignmentId: string, studentId: string, studentName: string, content?: string, fileUrl?: string): Promise<Submission> {
    let targetAssignment: Assignment | undefined;
    let targetRoom: StudyRoom | undefined;

    for (const room of this.rooms.values()) {
      const assignment = room.assignments.find(a => a.id === assignmentId);
      if (assignment) {
        targetAssignment = assignment;
        targetRoom = room;
        break;
      }
    }

    if (!targetAssignment || !targetRoom) throw new Error('Assignment not found');

    const submission: Submission = {
      id: `sub_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      assignmentId,
      studentId,
      studentName,
      content,
      fileUrl,
      submittedAt: new Date()
    };

    targetAssignment.submissions.push(submission);
    await this.awardPOK(studentId, targetRoom.id, 20, 'assignment');

    this.emit('assignment-submitted', submission);
    return submission;
  }

  async gradeSubmission(submissionId: string, grade: number, feedback: string, pokBonus: number = 0): Promise<Submission> {
    let targetSubmission: Submission | undefined;
    let targetRoom: StudyRoom | undefined;

    for (const room of this.rooms.values()) {
      for (const assignment of room.assignments) {
        const submission = assignment.submissions.find(s => s.id === submissionId);
        if (submission) {
          targetSubmission = submission;
          targetRoom = room;
          break;
        }
      }
    }

    if (!targetSubmission || !targetRoom) throw new Error('Submission not found');

    targetSubmission.grade = grade;
    targetSubmission.feedback = feedback;
    targetSubmission.pokAwarded = pokBonus;

    if (pokBonus > 0) {
      await this.awardPOK(targetSubmission.studentId, targetRoom.id, pokBonus, 'assignment');
    }

    this.emit('submission-graded', targetSubmission);
    return targetSubmission;
  }

  async startAITutorSession(roomId: string, userId: string, userName: string, topic: string): Promise<AITutorSession> {
    const room = this.rooms.get(roomId);
    if (!room) throw new Error('Room not found');
    if (!room.features.aiTutor) throw new Error('AI Tutor disabled');

    const session: AITutorSession = {
      id: `ai_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      roomId,
      userId,
      userName,
      messages: [],
      topic,
      startedAt: new Date(),
      pokEarned: 0
    };

    const roomSessions = this.aiSessions.get(roomId) || [];
    roomSessions.push(session);
    this.aiSessions.set(roomId, roomSessions);

    this.emit('ai-session-started', session);
    return session;
  }

  async sendAIMessage(sessionId: string, userId: string, message: string): Promise<AIMessage> {
    let targetSession: AITutorSession | undefined;

    for (const sessions of this.aiSessions.values()) {
      const session = sessions.find(s => s.id === sessionId);
      if (session) {
        targetSession = session;
        break;
      }
    }

    if (!targetSession) throw new Error('AI session not found');

    const userMessage: AIMessage = {
      role: 'user',
      content: message,
      timestamp: new Date()
    };

    targetSession.messages.push(userMessage);

    const aiResponse = await axios.post(`${this.config.sapiensServiceUrl}/chat`, {
      message,
      context: targetSession.topic,
      userId
    });

    const assistantMessage: AIMessage = {
      role: 'assistant',
      content: aiResponse.data.response,
      timestamp: new Date()
    };

    targetSession.messages.push(assistantMessage);
    targetSession.pokEarned += 2;
    
    await this.awardPOK(userId, targetSession.roomId, 2, 'ai_learning');

    this.emit('ai-message', { session: targetSession, message: assistantMessage });
    return assistantMessage;
  }

  async createPeerGroup(roomId: string, name: string, creatorId: string, topic: string, memberIds: string[]): Promise<PeerLearningGroup> {
    const room = this.rooms.get(roomId);
    if (!room) throw new Error('Room not found');

    const group: PeerLearningGroup = {
      id: `group_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      roomId,
      name,
      members: [creatorId, ...memberIds],
      topic,
      pokPool: 0,
      createdAt: new Date()
    };

    const roomGroups = this.peerGroups.get(roomId) || [];
    roomGroups.push(group);
    this.peerGroups.set(roomId, roomGroups);

    this.emit('peer-group-created', group);
    return group;
  }

  private async awardPOK(userId: string, roomId: string, amount: number, reason: POKReward['reason']): Promise<void> {
    const room = this.rooms.get(roomId);
    if (!room || !room.features.pokRewards) return;

    const reward: POKReward = {
      userId,
      roomId,
      amount,
      reason,
      timestamp: new Date()
    };

    this.pokRewards.push(reward);

    const participant = room.participants.find(p => p.userId === userId);
    if (participant) {
      participant.pokEarned += amount;
      participant.contributionScore += amount;
    }

    try {
      await axios.post(`${this.config.mintServiceUrl}/mining/reward`, {
        userId,
        amount,
        source: 'studyspaces',
        metadata: { roomId, reason }
      });
    } catch (error) {
      console.error('Failed to award POK:', error);
    }

    this.emit('pok-awarded', reward);
  }

  getRoom(roomId: string): StudyRoom | undefined {
    return this.rooms.get(roomId);
  }

  getRoomNotes(roomId: string): CollaborativeNote[] {
    return this.notes.get(roomId) || [];
  }

  getRoomAISessions(roomId: string): AITutorSession[] {
    return this.aiSessions.get(roomId) || [];
  }

  getRoomPeerGroups(roomId: string): PeerLearningGroup[] {
    return this.peerGroups.get(roomId) || [];
  }

  getUserPOKRewards(userId: string): POKReward[] {
    return this.pokRewards.filter(r => r.userId === userId);
  }

  listRooms(filter?: { type?: StudyRoom['type']; subject?: string; status?: StudyRoom['status'] }): StudyRoom[] {
    let rooms = Array.from(this.rooms.values());
    
    if (filter?.type) rooms = rooms.filter(r => r.type === filter.type);
    if (filter?.subject) rooms = rooms.filter(r => r.subject === filter.subject);
    if (filter?.status) rooms = rooms.filter(r => r.status === filter.status);
    
    return rooms;
  }
}
