import express from 'express';
import { primaryEducation } from '../../index';

const router = express.Router();

// GET /grades - List all primary grades and their details
router.get('/grades', (_req, res) => {
    try {
        const grades = Array.from(primaryEducation.getAllGrades().values());
        res.json(grades);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch grades' });
    }
});

// POST /enroll - Enroll a student in a grade
router.post('/enroll', async (req, res) => {
    try {
        const { studentId, gradeLevel, preferences } = req.body;
        // In a real app, studentId would come from auth token
        const result = await primaryEducation.enrollStudent(studentId, gradeLevel, preferences || {});
        res.json(result);
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
});

// GET /student/:studentId - Get student progress
router.get('/student/:studentId', (req, res) => {
    try {
        const { studentId } = req.params;
        const progress = primaryEducation.getStudentProgress(studentId);
        if (!progress) {
            return res.status(404).json({ error: 'Student record not found' });
        }
        return res.json(progress);
    } catch (error) {
        return res.status(500).json({ error: 'Failed to fetch student progress' });
    }
});

export default router;
