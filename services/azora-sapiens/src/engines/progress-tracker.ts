interface Activity {
  type: 'lesson_complete' | 'quiz_passed' | 'project_submitted' | 'assessment_passed' | 'help_peer';
  data: any;
  studentId: string;
  timestamp: Date;
}

interface Progress {
  studentId: string;
  activity: string;
  timestamp: Date;
  data: any;
  azrEarned: number;
}

interface StudentProgressSummary {
  totalActivities: number;
  totalAZR: number;
  completionRate: number;
  streak: number;
  level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
}

class ProgressTracker {
  trackProgress(studentId: string, activity: Activity): Progress {
    return {
      studentId,
      activity: activity.type,
      timestamp: new Date(),
      data: activity.data,
      azrEarned: this.calculateAZR(activity),
    };
  }

  calculateAZR(activity: Activity): number {
    const rates = {
      lesson_complete: 10,
      quiz_passed: 25,
      project_submitted: 50,
      assessment_passed: 100,
      help_peer: 15,
    };
    return rates[activity.type] || 0;
  }

  getStudentProgress(studentId: string, activities: Progress[]): StudentProgressSummary {
    const studentActivities = activities.filter(a => a.studentId === studentId);

    return {
      totalActivities: studentActivities.length,
      totalAZR: studentActivities.reduce((sum, a) => sum + a.azrEarned, 0),
      completionRate: this.calculateCompletionRate(studentActivities),
      streak: this.calculateStreak(studentActivities),
      level: this.determineLevel(studentActivities),
    };
  }

  calculateCompletionRate(activities: Progress[]): number {
    if (activities.length === 0) return 0;
    const completed = activities.filter(a => a.data.completed).length;
    return (completed / activities.length) * 100;
  }

  calculateStreak(activities: Progress[]): number {
    const sorted = [...activities].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    let streak = 0;
    let lastDate = new Date();

    for (const activity of sorted) {
      const daysDiff = Math.floor((lastDate.getTime() - activity.timestamp.getTime()) / (1000 * 60 * 60 * 24));
      if (daysDiff <= 1) {
        streak++;
        lastDate = activity.timestamp;
      } else {
        break;
      }
    }

    return streak;
  }

  determineLevel(activities: Progress[]): 'beginner' | 'intermediate' | 'advanced' | 'expert' {
    const totalAZR = activities.reduce((sum, a) => sum + a.azrEarned, 0);
    if (totalAZR >= 10000) return 'expert';
    if (totalAZR >= 5000) return 'advanced';
    if (totalAZR >= 1000) return 'intermediate';
    return 'beginner';
  }
}

export default new ProgressTracker();
