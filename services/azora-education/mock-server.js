import express from 'express';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 4006;

app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    service: 'azora-education',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Education API endpoints
app.get('/api/courses', (req, res) => {
  res.json({
    courses: [
      { id: 1, title: 'Constitutional AI Basics', students: 150 },
      { id: 2, title: 'Ubuntu Philosophy', students: 200 },
      { id: 3, title: 'Blockchain Development', students: 100 }
    ]
  });
});

app.get('/api/students', (req, res) => {
  res.json({
    totalStudents: 450,
    activeStudents: 380,
    earnings: '15,000 AZR'
  });
});

app.post('/api/enroll', (req, res) => {
  res.json({
    success: true,
    message: 'Enrolled successfully',
    courseId: req.body.courseId
  });
});

app.listen(PORT, () => {
  console.log(`🎓 Azora Education service running on port ${PORT}`);
  console.log(`📚 Courses: http://localhost:${PORT}/api/courses`);
  console.log(`👥 Students: http://localhost:${PORT}/api/students`);
  console.log(`🏥 Health: http://localhost:${PORT}/health`);
});