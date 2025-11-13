class CourseEngine {
  constructor() {
    this.courses = new Map();
  }

  createCourse(instructorId, courseData) {
    const course = {
      id: `course_${Date.now()}`,
      instructorId,
      title: courseData.title,
      description: courseData.description,
      category: courseData.category,
      level: courseData.level,
      modules: [],
      enrollments: [],
      price: courseData.price || 0,
      currency: courseData.currency || 'AZR',
      status: 'draft',
      createdAt: new Date()
    };

    this.courses.set(course.id, course);
    return course;
  }

  addModule(courseId, moduleData) {
    const course = this.courses.get(courseId);
    if (!course) return { success: false, reason: 'Course not found' };

    const module = {
      id: `module_${Date.now()}`,
      title: moduleData.title,
      description: moduleData.description,
      order: course.modules.length + 1,
      lessons: [],
      duration: moduleData.duration || 0
    };

    course.modules.push(module);
    return { success: true, module };
  }

  addLesson(courseId, moduleId, lessonData) {
    const course = this.courses.get(courseId);
    if (!course) return { success: false, reason: 'Course not found' };

    const module = course.modules.find(m => m.id === moduleId);
    if (!module) return { success: false, reason: 'Module not found' };

    const lesson = {
      id: `lesson_${Date.now()}`,
      title: lessonData.title,
      content: lessonData.content,
      type: lessonData.type,
      duration: lessonData.duration,
      order: module.lessons.length + 1,
      resources: lessonData.resources || []
    };

    module.lessons.push(lesson);
    return { success: true, lesson };
  }

  publishCourse(courseId) {
    const course = this.courses.get(courseId);
    if (!course) return { success: false, reason: 'Course not found' };

    if (course.modules.length === 0) {
      return { success: false, reason: 'Course must have at least one module' };
    }

    course.status = 'published';
    course.publishedAt = new Date();
    return { success: true, course };
  }

  getCourse(courseId) {
    return this.courses.get(courseId);
  }

  searchCourses(query) {
    const results = [];
    for (const course of this.courses.values()) {
      if (course.status === 'published' && 
          (course.title.toLowerCase().includes(query.toLowerCase()) ||
           course.description.toLowerCase().includes(query.toLowerCase()))) {
        results.push(course);
      }
    }
    return results;
  }
}

module.exports = new CourseEngine();
