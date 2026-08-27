const express = require('express');
const router = express.Router();
const db = require('../database/db');
const { verifyToken, requireRole } = require('../middleware/auth');
const { ParentDashboardFacade } = require('../patterns');

router.use(verifyToken, requireRole('PARENT'));

// Parent Dashboard (Facade Pattern)
router.get('/dashboard', async (req, res) => {
    try {
        const dashboardData = await ParentDashboardFacade.getDashboardOverview(req.user.id);
        res.json({ success: true, data: dashboardData });
    } catch (err) {
        console.error('Parent Dashboard Error:', err);
        res.status(500).json({ success: false, message: err.message });
    }
});

// View Specific Child Progress
router.get('/children/:studentId/progress', async (req, res) => {
    try {
        const studentId = req.params.studentId;
        const parent = await db.get(`SELECT id FROM parents WHERE user_id = ?`, [req.user.id]);

        // Verify link
        const link = await db.get(`SELECT id FROM parent_students WHERE parent_id = ? AND student_id = ?`, [parent.id, studentId]);
        if (!link) return res.status(403).json({ success: false, message: 'You are not linked to this student.' });

        const childUser = await db.get(
            `SELECT u.id as user_id, u.name, s.institution, s.academic_level 
             FROM students s JOIN users u ON s.user_id = u.id WHERE s.id = ?`,
            [studentId]
        );

        const assignments = await db.query(
            `SELECT a.title, sub.score, sub.feedback, sub.graded_at 
             FROM assignment_submissions sub 
             JOIN assignments a ON sub.assignment_id = a.id 
             WHERE sub.student_id = ?`,
            [studentId]
        );

        const quizzes = await db.query(
            `SELECT q.title, qa.score, qa.graded_at 
             FROM quiz_attempts qa 
             JOIN quizzes q ON qa.quiz_id = q.id 
             WHERE qa.student_id = ?`,
            [studentId]
        );

        const attendances = await db.query(
            `SELECT att.status, att.notes, s.title as session_title, s.start_time 
             FROM attendances att 
             JOIN sessions s ON att.session_id = s.id 
             WHERE att.student_id = ? 
             ORDER BY s.start_time DESC`,
            [studentId]
        );

        res.json({
            success: true,
            child: childUser,
            assignments,
            quizzes,
            attendances
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

module.exports = router;
