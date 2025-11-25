const express = require('express');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

const JWT_SECRET = process.env.JWT_SECRET || 'azora-ubuntu-constitutional-ai-secret-2025';

// Initialize SQLite database
const dbPath = path.join(__dirname, 'lms.db');
const db = new sqlite3.Database(dbPath);

// Initialize database tables
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS courses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT,
    instructor TEXT,
    duration TEXT,
    students INTEGER DEFAULT 0,
    is_published BOOLEAN DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);
  
  db.run(`CREATE TABLE IF NOT EXISTS enrollments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    course_id INTEGER NOT NULL,
    progress INTEGER DEFAULT 0,
    status TEXT DEFAULT 'active',
    enrolled_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    completed_at DATETIME,
    last_accessed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (course_id) REFERENCES courses (id)
  )`);
  
  db.run(`CREATE TABLE IF NOT EXISTS lessons (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    course_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    content TEXT,
    order_index INTEGER DEFAULT 0,
    duration_minutes INTEGER DEFAULT 30,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (course_id) REFERENCES courses (id)
  )`);
  
  db.run(`CREATE TABLE IF NOT EXISTS lesson_progress (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    enrollment_id INTEGER NOT NULL,
    lesson_id INTEGER NOT NULL,
    completed BOOLEAN DEFAULT 0,
    completed_at DATETIME,
    time_spent_minutes INTEGER DEFAULT 0,
    FOREIGN KEY (enrollment_id) REFERENCES enrollments (id),
    FOREIGN KEY (lesson_id) REFERENCES lessons (id),
    UNIQUE(enrollment_id, lesson_id)
  )`);
  
  // Insert default courses
  db.run(`INSERT OR IGNORE INTO courses (id, title, description, instructor, duration, students) VALUES 
    (1, 'Introduction to Ubuntu Philosophy', 'Learn the foundational principles of Ubuntu: "I am because we are"', 'Elara AI', '4 weeks', 1250),
    (2, 'Constitutional AI Fundamentals', 'Understanding how AI systems can embody constitutional principles', 'Sankofa AI', '6 weeks', 890),
    (3, 'Azora Token Economics', 'Master the AZR cryptocurrency and proof-of-knowledge mining', 'Kofi AI', '3 weeks', 567)`);
    
  // Insert default lessons
  db.run(`INSERT OR IGNORE INTO lessons (id, course_id, title, content, order_index) VALUES 
    (1, 1, 'What is Ubuntu?', 'Understanding the philosophy of "I am because we are"', 1),
    (2, 1, 'Ubuntu in Practice', 'Applying Ubuntu principles in daily life', 2),
    (3, 1, 'Ubuntu and Technology', 'How Ubuntu shapes our approach to AI and technology', 3),
    (4, 2, 'Constitutional Principles', 'Core principles of constitutional governance', 1),
    (5, 2, 'AI Ethics Framework', 'Building ethical AI systems', 2),
    (6, 3, 'AZR Token Basics', 'Understanding Azora cryptocurrency', 1)`);
});

// Authentication middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token == null) return res.sendStatus(401);

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', service: 'lms', database: 'sqlite' });
});

// Get all courses
app.get('/api/courses', authenticateToken, (req, res) => {
  db.all('SELECT * FROM courses WHERE is_published = 1', (err, courses) => {
    if (err) {
      return res.status(500).json({ success: false, error: 'Database error' });
    }
    res.json({ success: true, data: courses });
  });
});

// Get specific course with lessons
app.get('/api/courses/:id', authenticateToken, (req, res) => {
  db.get('SELECT * FROM courses WHERE id = ?', [req.params.id], (err, course) => {
    if (err) {
      return res.status(500).json({ success: false, error: 'Database error' });
    }
    if (!course) {
      return res.status(404).json({ success: false, error: 'Course not found' });
    }
    
    // Get lessons for this course
    db.all('SELECT * FROM lessons WHERE course_id = ? ORDER BY order_index', [req.params.id], (err, lessons) => {
      if (err) {
        return res.status(500).json({ success: false, error: 'Database error' });
      }
      
      course.lessons = lessons;
      res.json({ success: true, data: course });
    });
  });
});

// Enroll in course
app.post('/api/courses/:id/enroll', authenticateToken, (req, res) => {
  const courseId = req.params.id;
  const userId = req.user.userId;
  
  // Check if course exists
  db.get('SELECT * FROM courses WHERE id = ?', [courseId], (err, course) => {
    if (err) {
      return res.status(500).json({ success: false, error: 'Database error' });
    }
    if (!course) {
      return res.status(404).json({ success: false, error: 'Course not found' });
    }
    
    // Check if already enrolled
    db.get('SELECT * FROM enrollments WHERE user_id = ? AND course_id = ?', [userId, courseId], (err, existing) => {
      if (err) {
        return res.status(500).json({ success: false, error: 'Database error' });
      }
      if (existing) {
        return res.status(400).json({ success: false, error: 'Already enrolled in this course' });
      }
      
      // Create enrollment
      db.run('INSERT INTO enrollments (user_id, course_id) VALUES (?, ?)', [userId, courseId], function(err) {
        if (err) {
          return res.status(500).json({ success: false, error: 'Database error' });
        }
        
        const enrollmentId = this.lastID;
        
        // Create lesson progress entries for all lessons in the course
        db.all('SELECT id FROM lessons WHERE course_id = ?', [courseId], (err, lessons) => {
          if (!err && lessons.length > 0) {
            const progressInserts = lessons.map(lesson => 
              `(${enrollmentId}, ${lesson.id}, 0)`
            ).join(',');
            
            db.run(`INSERT INTO lesson_progress (enrollment_id, lesson_id, completed) VALUES ${progressInserts}`);
          }
        });
        
        // Update student count
        db.run('UPDATE courses SET students = students + 1 WHERE id = ?', [courseId]);
        
        res.json({ 
          success: true, 
          message: `Successfully enrolled in ${course.title}`,
          enrollment: {
            id: enrollmentId,
            courseId: parseInt(courseId),
            userId: userId,
            enrolledAt: new Date().toISOString(),
            progress: 0
          }
        });
      });
    });
  });
});

// Get student progress for a course
app.get('/api/courses/:id/progress', authenticateToken, (req, res) => {
  const courseId = req.params.id;
  const userId = req.user.userId;
  
  db.get('SELECT * FROM enrollments WHERE user_id = ? AND course_id = ?', [userId, courseId], (err, enrollment) => {
    if (err) {
      return res.status(500).json({ success: false, error: 'Database error' });
    }
    if (!enrollment) {
      return res.status(404).json({ success: false, error: 'Not enrolled in this course' });
    }
    
    // Get lesson progress
    db.all(`
      SELECT l.id, l.title, l.order_index, lp.completed, lp.completed_at, lp.time_spent_minutes
      FROM lessons l
      LEFT JOIN lesson_progress lp ON l.id = lp.lesson_id AND lp.enrollment_id = ?
      WHERE l.course_id = ?
      ORDER BY l.order_index
    `, [enrollment.id, courseId], (err, lessons) => {
      if (err) {
        return res.status(500).json({ success: false, error: 'Database error' });
      }
      
      const completedLessons = lessons.filter(l => l.completed).length;
      const totalLessons = lessons.length;
      const progressPercentage = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;
      
      res.json({
        success: true,
        data: {
          enrollment,
          lessons,
          progress: {
            completed: completedLessons,
            total: totalLessons,
            percentage: progressPercentage
          }
        }
      });
    });
  });
});

// Mark lesson as completed
app.post('/api/lessons/:id/complete', authenticateToken, (req, res) => {
  const lessonId = req.params.id;
  const userId = req.user.userId;
  const { timeSpent } = req.body;
  
  // Find enrollment for this lesson's course
  db.get(`
    SELECT e.id as enrollment_id, l.course_id, l.title
    FROM lessons l
    JOIN enrollments e ON l.course_id = e.course_id
    WHERE l.id = ? AND e.user_id = ?
  `, [lessonId, userId], (err, result) => {
    if (err) {
      return res.status(500).json({ success: false, error: 'Database error' });
    }
    if (!result) {
      return res.status(404).json({ success: false, error: 'Lesson not found or not enrolled' });
    }
    
    // Update lesson progress
    db.run(`
      UPDATE lesson_progress 
      SET completed = 1, completed_at = CURRENT_TIMESTAMP, time_spent_minutes = ?
      WHERE enrollment_id = ? AND lesson_id = ?
    `, [timeSpent || 0, result.enrollment_id, lessonId], function(err) {
      if (err) {
        return res.status(500).json({ success: false, error: 'Database error' });
      }
      
      // Update last accessed time for enrollment
      db.run('UPDATE enrollments SET last_accessed_at = CURRENT_TIMESTAMP WHERE id = ?', [result.enrollment_id]);
      
      res.json({
        success: true,
        message: `Lesson "${result.title}" marked as completed`,
        data: {
          lessonId: parseInt(lessonId),
          completed: true,
          completedAt: new Date().toISOString()
        }
      });
    });
  });
});

const PORT = process.env.PORT || 3002;
app.listen(PORT, () => {
  console.log(`🎓 SQLite LMS Service running on port ${PORT}`);
});