class EnrollmentEngine {
  constructor() {
    this.enrollments = new Map();
  }

  enroll(studentId, courseId, paymentInfo) {
    const enrollment = {
      id: `enroll_${Date.now()}`,
      studentId,
      courseId,
      status: 'active',
      progress: 0,
      completedLessons: [],
      startedAt: new Date(),
      lastAccessedAt: new Date(),
      paymentInfo
    };

    const key = `${studentId}_${courseId}`;
    this.enrollments.set(key, enrollment);
    return enrollment;
  }

  getEnrollment(studentId, courseId) {
    const key = `${studentId}_${courseId}`;
    return this.enrollments.get(key);
  }

  updateProgress(studentId, courseId, lessonId) {
    const enrollment = this.getEnrollment(studentId, courseId);
    if (!enrollment) return { success: false, reason: 'Enrollment not found' };

    if (!enrollment.completedLessons.includes(lessonId)) {
      enrollment.completedLessons.push(lessonId);
      enrollment.lastAccessedAt = new Date();
    }

    return { success: true, enrollment };
  }

  calculateProgress(enrollment, course) {
    const totalLessons = course.modules.reduce((sum, m) => sum + m.lessons.length, 0);
    const completedLessons = enrollment.completedLessons.length;
    return totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0;
  }

  getStudentEnrollments(studentId) {
    const results = [];
    for (const [key, enrollment] of this.enrollments.entries()) {
      if (enrollment.studentId === studentId) {
        results.push(enrollment);
      }
    }
    return results;
  }

  completeCourse(studentId, courseId) {
    const enrollment = this.getEnrollment(studentId, courseId);
    if (!enrollment) return { success: false, reason: 'Enrollment not found' };

    enrollment.status = 'completed';
    enrollment.completedAt = new Date();

    return {
      success: true,
      enrollment,
      certificate: this.generateCertificate(studentId, courseId)
    };
  }

  generateCertificate(studentId, courseId) {
    return {
      id: `cert_${Date.now()}`,
      studentId,
      courseId,
      issuedAt: new Date(),
      blockchainHash: Buffer.from(`${studentId}${courseId}${Date.now()}`).toString('base64')
    };
  }
}

module.exports = new EnrollmentEngine();
