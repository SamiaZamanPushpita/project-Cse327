const express = require('express');
const router = express.Router();
const db = require('../database/db');
const { verifyToken, requireRole } = require('../middleware/auth');

const {
    StudentDashboardFacade,
    AssessmentFactory,
    GradingContext,
    StandardPercentageStrategy,
    WeightedAverageStrategy,
    AttendanceBonusStrategy,
    notificationPublisher
} = require('../patterns');

router.use(verifyToken, requireRole('STUDENT'));

// 1. Student Dashboard (Facade Pattern)
router.get('/dashboard', async (req, res) => {
    try {
        const dashboardData = await StudentDashboardFacade.getDashboardOverview(req.user.id);
        res.json({ success: true, data: dashboardData });
    } catch (err) {
        console.error('Student Dashboard Error:', err);
        res.status(500).json({ success: false, message: err.message });
    }
});

// 2. Submit Assignment
router.post('/assignments/:id/submit', async (req, res) => {
    try {
        const assignmentId = req.params.id;
        const student = await db.get(`SELECT id FROM students WHERE user_id = ?`, [req.user.id]);
        const { content, fileUrl } = req.body;

        await db.run(
            `INSERT INTO assignment_submissions (assignment_id, student_id, content, file_url, submitted_at)
             VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)
             ON CONFLICT(assignment_id, student_id) DO UPDATE SET
             content = excluded.content,
             file_url = excluded.file_url,
             submitted_at = CURRENT_TIMESTAMP`,
            [assignmentId, student.id, content || '', fileUrl || '']
        );

        res.json({ success: true, message: 'Assignment submitted successfully.' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// 3. Get Quiz Details & Take Quiz
router.get('/quizzes/:id', async (req, res) => {
    try {
        const quizId = req.params.id;
        const quiz = await db.get(`SELECT * FROM quizzes WHERE id = ?`, [quizId]);
        if (!quiz) return res.status(404).json({ success: false, message: 'Quiz not found.' });

        const questions = await db.query(
            `SELECT id, question_text, question_type, options_json, marks FROM quiz_questions WHERE quiz_id = ?`,
            [quizId]
        );

        const parsedQuestions = questions.map(q => ({
            ...q,
            options: q.options_json ? JSON.parse(q.options_json) : []
        }));

        res.json({ success: true, quiz: { ...quiz, questions: parsedQuestions } });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// Submit Quiz Attempt (Autograded via AssessmentFactory)
router.post('/quizzes/:id/submit', async (req, res) => {
    try {
        const quizId = req.params.id;
        const student = await db.get(`SELECT id FROM students WHERE user_id = ?`, [req.user.id]);
        const { answers } = req.body; // e.g. { questionId: "Singleton" }

        const quizData = await db.get(`SELECT * FROM quizzes WHERE id = ?`, [quizId]);
        const questions = await db.query(`SELECT * FROM quiz_questions WHERE quiz_id = ?`, [quizId]);

        // Build answer key
        const answerKey = {};
        questions.forEach(q => {
            answerKey[q.id] = { correct: q.correct_answer, marks: q.marks };
        });

        // Use Factory Method pattern to get QuizAssessment domain object
        const quizAssessment = AssessmentFactory.createAssessment('QUIZ', quizData);
        const score = quizAssessment.calculateGrade(answers, answerKey);

        await db.run(
            `INSERT INTO quiz_attempts (quiz_id, student_id, answers_json, score, attempted_at, graded_at)
             VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
            [quizId, student.id, JSON.stringify(answers), score]
        );

        res.json({
            success: true,
            score,
            totalMarks: quizData.total_marks,
            message: 'Quiz submitted and autograded via Factory Method Pattern.'
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// 4. Dynamic Strategy Evaluation for Student Progress
router.get('/progress/evaluate', async (req, res) => {
    try {
        const { strategy } = req.query; // 'weighted', 'standard', 'attendance_bonus'
        const student = await db.get(`SELECT id FROM students WHERE user_id = ?`, [req.user.id]);

        const assignments = await db.query(
            `SELECT score FROM assignment_submissions WHERE student_id = ? AND score IS NOT NULL`,
            [student.id]
        );
        const quizzes = await db.query(
            `SELECT score FROM quiz_attempts WHERE student_id = ? AND score IS NOT NULL`,
            [student.id]
        );
        const attendances = await db.query(
            `SELECT status FROM attendances WHERE student_id = ?`,
            [student.id]
        );

        const presentCount = attendances.filter(a => a.status === 'PRESENT').length;
        const attPct = attendances.length > 0 ? (presentCount / attendances.length) * 100 : 100;

        const assignScores = assignments.map(a => a.score);
        const quizScores = quizzes.map(q => q.score);

        let strategyInstance = new WeightedAverageStrategy();
        if (strategy === 'standard') strategyInstance = new StandardPercentageStrategy();
        else if (strategy === 'attendance_bonus') strategyInstance = new AttendanceBonusStrategy();

        const context = new GradingContext(strategyInstance);
        const result = context.evaluateStudentProgress({
            assignmentScores: assignScores,
            quizScores: quizScores,
            attendancePercentage: Math.round(attPct)
        });

        res.json({ success: true, result });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// 5. Submit Schedule Change Request
router.post('/schedule-change-request', async (req, res) => {
    try {
        const student = await db.get(`SELECT id FROM students WHERE user_id = ?`, [req.user.id]);
        const { sessionId, requestedStart, requestedEnd, reason } = req.body;

        await db.run(
            `INSERT INTO schedule_change_requests (session_id, student_id, requested_start, requested_end, reason, status)
             VALUES (?, ?, ?, ?, ?, 'PENDING')`,
            [sessionId, student.id, requestedStart, requestedEnd, reason]
        );

        // Notify Tutor via Observer Pattern
        await notificationPublisher.notify('schedule_change_requested', {
            title: 'Schedule Change Requested',
            message: `A student requested to reschedule a session. Reason: ${reason}`,
            link: '/dashboard'
        });

        res.status(201).json({ success: true, message: 'Schedule change request submitted to tutor.' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

module.exports = router;
