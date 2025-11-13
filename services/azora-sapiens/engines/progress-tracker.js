class ProgressTracker {
  trackProgress(studentId, activity) {
    return {
      studentId,
      activity: activity.type,
      timestamp: new Date(),
      data: activity.data,
      azrEarned: this.calculateAZR(activity)
    };
  }

  calculateAZR(activity) {
    const rates = {
      lesson_complete: 10,
      quiz_passed: 25,
      project_submitted: 50,
      assessment_passed: 100,
      help_peer: 15
    };
    return rates[activity.type] || 0;
  }

  getStudentProgress(studentId, activities) {
    const studentActivities = activities.filter(a => a.studentId === studentId);
    
    return {
      totalActivities: studentActivities.length,
      totalAZR: studentActivities.reduce((sum, a) => sum + a.azrEarned, 0),
      completionRate: this.calculateCompletionRate(studentActivities),
      streak: this.calculateStreak(studentActivities),
      level: this.determineLevel(studentActivities)
    };
  }

  calculateCompletionRate(activities) {
    const completed = activities.filter(a => a.data.completed).length;
    return activities.length > 0 ? (completed / activities.length) * 100 : 0;
  }

  calculateStreak(activities) {
    const sorted = activities.sort((a, b) => b.timestamp - a.timestamp);
    let streak = 0;
    let lastDate = new Date();
    
    for (const activity of sorted) {
      const daysDiff = Math.floor((lastDate - activity.timestamp) / (1000 * 60 * 60 * 24));
      if (daysDiff <= 1) {
        streak++;
        lastDate = activity.timestamp;
      } else {
        break;
      }
    }
    
    return streak;
  }

  determineLevel(activities) {
    const totalAZR = activities.reduce((sum, a) => sum + a.azrEarned, 0);
    if (totalAZR >= 10000) return 'expert';
    if (totalAZR >= 5000) return 'advanced';
    if (totalAZR >= 1000) return 'intermediate';
    return 'beginner';
  }
}

module.exports = new ProgressTracker();
