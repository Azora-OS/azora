import express from 'express';
import { secondaryEducation } from '../../index';

const router = express.Router();

// GET /grades - List all secondary grades
router.get('/grades', (_req, res) => {
    try {
        const grades = Array.from(secondaryEducation.getAllGrades().values());
        res.json(grades);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch grades' });
    }
});

// GET /streams - List academic streams (for FET phase)
router.get('/streams', (_req, res) => {
    try {
        const streams = Array.from(secondaryEducation.getAllStreams().values());
        res.json(streams);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch streams' });
    }
});

// POST /enroll - Enroll a student
router.post('/enroll', async (req, res) => {
    try {
        const { studentId, gradeLevel, streamId } = req.body;
        const result = await secondaryEducation.enrollStudent(studentId, gradeLevel, streamId);
        res.json(result);
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
});

// GET /student/:studentId - Get student record
router.get('/student/:studentId', (req, res) => {
    try {
        const { studentId } = req.params;
        const record = secondaryEducation.getStudentRecord(studentId);
        if (!record) {
            return res.status(404).json({ error: 'Student record not found' });
        }
        return res.json(record);
    } catch (error) {
        return res.status(500).json({ error: 'Failed to fetch student record' });
    }
});

export default router;
