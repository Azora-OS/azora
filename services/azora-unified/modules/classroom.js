const router = require('express').Router();

const classrooms = new Map();

router.get('/', (req, res) => {
  res.json({ success: true, data: Array.from(classrooms.values()) });
});

router.post('/', (req, res) => {
  const { name, teacherId, capacity = 30 } = req.body;
  const id = Date.now().toString();
  const classroom = { id, name, teacherId, capacity, students: [], createdAt: new Date() };
  classrooms.set(id, classroom);
  res.json({ success: true, data: classroom });
});

router.post('/:id/join', (req, res) => {
  const { studentId } = req.body;
  const classroom = classrooms.get(req.params.id);
  if (!classroom) return res.status(404).json({ error: 'Classroom not found' });
  if (classroom.students.length >= classroom.capacity) {
    return res.status(400).json({ error: 'Classroom full' });
  }
  classroom.students.push(studentId);
  classrooms.set(req.params.id, classroom);
  res.json({ success: true, data: classroom });
});

module.exports = router;
