import express from 'express';
import { azoraSapiensUniversity } from '../../index';

const router = express.Router();

// GET /programmes - List all university programmes
router.get('/programmes', (_req, res) => {
    try {
        const programmes = azoraSapiensUniversity.getAllProgrammes();
        res.json(programmes);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch programmes' });
    }
});

// GET /faculties - List faculties
router.get('/faculties', (_req, res) => {
    try {
        const details = azoraSapiensUniversity.getUniversityDetails();
        res.json(details.faculties);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch faculties' });
    }
});

// POST /enroll - Enroll a student in a programme
router.post('/enroll', async (req, res) => {
    try {
        const { studentId, programmeId } = req.body;
        const result = await azoraSapiensUniversity.enrollStudent(studentId, programmeId);
        res.json(result);
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
});

// GET /student/:studentId - Get student record
router.get('/student/:studentId', (req, res) => {
    try {
        const { studentId } = req.params;
        const student = azoraSapiensUniversity.getStudent(studentId);
        if (!student) {
            return res.status(404).json({ error: 'Student record not found' });
        }
        return res.json(student);
    } catch (error) {
        return res.status(500).json({ error: 'Failed to fetch student record' });
    }
});

export default router;
