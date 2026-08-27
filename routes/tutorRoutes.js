const express = require('express');
const router = express.Router();
const db = require('../database/db');
const { verifyToken, requireRole } = require('../middleware/auth');

// Import Design Patterns
const {
    TutorDashboardFacade,
    CommandInvoker,
    ScheduleSessionCommand,
    RescheduleSessionCommand,
    CancelSessionCommand,
    StorageService,
    LocalStorageAdapter,
    SessionStateContext,
    notificationPublisher
} = require('../patterns');

const commandInvoker = new CommandInvoker();
const storageService = new StorageService(new LocalStorageAdapter());

// Apply auth middleware to all tutor routes
router.use(verifyToken, requireRole('TUTOR'));

// 1. Dashboard Facade Endpoint
router.get('/dashboard', async (req, res) => {
    try {
        const dashboardData = await TutorDashboardFacade.getDashboardOverview(req.user.id);
        res.json({ success: true, data: dashboardData });
    } catch (err) {
        console.error('Tutor Dashboard Error:', err);
        res.status(500).json({ success: false, message: err.message });
    }
});

// 2. Batches Management
router.get('/batches', async (req, res) => {
    try {
        const tutor = await db.get(`SELECT id FROM tutors WHERE user_id = ?`, [req.user.id]);
        const batches = await db.query(
            `SELECT b.*, COUNT(e.id) as enrolled_count 
             FROM batches b 
             LEFT JOIN enrollments e ON b.id = e.batch_id AND e.status = 'ACTIVE' 
             WHERE b.tutor_id = ? 
             GROUP BY b.id`,
            [tutor.id]
        );
        res.json({ success: true, batches });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

router.post('/batches', async (req, res) => {
    try {
        const tutor = await db.get(`SELECT id FROM tutors WHERE user_id = ?`, [req.user.id]);
        const { name, subject, description, scheduleInfo } = req.body;

        const result = await db.run(
            `INSERT INTO batches (tutor_id, name, subject, description, schedule_info) VALUES (?, ?, ?, ?, ?)`,
            [tutor.id, name, subject, description || '', scheduleInfo || '']
        );
        res.status(201).json({ success: true, batchId: result.id, message: 'Batch created successfully.' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// Enroll Student into Batch
router.post('/batches/:id/enroll', async (req, res) => {
    try {
        const batchId = req.params.id;
        const { studentId } = req.body;

        await db.run(`INSERT INTO enrollments (batch_id, student_id) VALUES (?, ?)`, [batchId, studentId]);
        res.json({ success: true, message: 'Student enrolled successfully.' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// List all Students (for enrollment modal)
router.get('/students', async (req, res) => {
    try {
        const students = await db.query(
            `SELECT s.id as studentId, u.name, u.email, u.phone, s.institution, s.academic_level 
             FROM students s 
             JOIN users u ON s.user_id = u.id`
        );
        res.json({ success: true, students });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// 3. Sessions Management (Command Pattern & State Pattern)
router.post('/sessions', async (req, res) => {
    try {
        const tutor = await db.get(`SELECT id FROM tutors WHERE user_id = ?`, [req.user.id]);
        const { title, description, startTime, endTime, location, sessionType, batchId, studentId } = req.body;

        const command = new ScheduleSessionCommand({
            tutorId: tutor.id,
            batchId,
            studentId,
            title,
            description,
            startTime,
            endTime,
            location,
            sessionType
        });

        const result = await commandInvoker.executeCommand(command);
        res.status(201).json({ success: true, ...result, message: 'Session scheduled via Command Pattern.' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// Reschedule Session (Command Pattern)
router.put('/sessions/:id/reschedule', async (req, res) => {
    try {
        const sessionId = req.params.id;
        const { startTime, endTime } = req.body;

        const command = new RescheduleSessionCommand(sessionId, startTime, endTime);
        const result = await commandInvoker.executeCommand(command);
        res.json({ success: true, ...result, message: 'Session rescheduled via Command Pattern.' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// Cancel Session (Command Pattern)
router.put('/sessions/:id/cancel', async (req, res) => {
    try {
        const sessionId = req.params.id;
        const command = new CancelSessionCommand(sessionId);
        const result = await commandInvoker.executeCommand(command);
        res.json({ success: true, ...result, message: 'Session cancelled via Command Pattern.' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// Complete Session (State Pattern)
router.put('/sessions/:id/complete', async (req, res) => {
    try {
        const sessionId = req.params.id;
        const session = await db.get(`SELECT status FROM sessions WHERE id = ?`, [sessionId]);
        if (!session) return res.status(404).json({ success: false, message: 'Session not found.' });

        const stateContext = new SessionStateContext(sessionId, session.status);
        const transition = stateContext.completeSession();

        await db.run(`UPDATE sessions SET status = ? WHERE id = ?`, [transition.status, sessionId]);
        res.json({ success: true, transition, message: 'Session status updated via State Pattern.' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// Undo Last Session Command (Command Pattern Undo!)
router.post('/sessions/undo', async (req, res) => {
    try {
        const result = await commandInvoker.undoLastCommand();
        res.json({ success: true, result, message: 'Last session command undone successfully.' });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
});

// 4. Session Logs (Create / View)
router.post('/sessions/:id/log', async (req, res) => {
    try {
        const sessionId = req.params.id;
        const tutor = await db.get(`SELECT id FROM tutors WHERE user_id = ?`, [req.user.id]);
        const { topicsCovered, homework, notes, nextSessionPlan } = req.body;

        await db.run(
            `INSERT INTO session_logs (session_id, tutor_id, topics_covered, homework, notes, next_session_plan)
             VALUES (?, ?, ?, ?, ?, ?)
             ON CONFLICT(session_id) DO UPDATE SET
             topics_covered = excluded.topics_covered,
             homework = excluded.homework,
             notes = excluded.notes,
             next_session_plan = excluded.next_session_plan`,
            [sessionId, tutor.id, topicsCovered, homework || '', notes || '', nextSessionPlan || '']
        );

        res.json({ success: true, message: 'Session log saved successfully.' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// 5. Attendance Register Marking
router.post('/sessions/:id/attendance', async (req, res) => {
    try {
        const sessionId = req.params.id;
        const { attendanceRecords } = req.body; // Array of { studentId, status, notes }

        for (const rec of attendanceRecords) {
            await db.run(
                `INSERT INTO attendances (session_id, student_id, status, notes)
                 VALUES (?, ?, ?, ?)
                 ON CONFLICT(session_id, student_id) DO UPDATE SET
                 status = excluded.status,
                 notes = excluded.notes,
                 marked_at = CURRENT_TIMESTAMP`,
                [sessionId, rec.studentId, rec.status, rec.notes || '']
            );
        }

        res.json({ success: true, message: 'Attendance marked successfully.' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// 6. Learning Materials (Adapter Pattern)
router.post('/materials', async (req, res) => {
    try {
        const tutor = await db.get(`SELECT id FROM tutors WHERE user_id = ?`, [req.user.id]);
        const { title, description, fileUrl, batchId, fileType } = req.body;

        // Demonstrate storage adapter saving
        const saveRes = await storageService.saveMaterial(
            Buffer.from(description || title),
            `${title}.pdf`
        );

        const result = await db.run(
            `INSERT INTO learning_materials (tutor_id, batch_id, title, description, file_url, file_type)
             VALUES (?, ?, ?, ?, ?, ?)`,
            [tutor.id, batchId || null, title, description || '', fileUrl || saveRes.url, fileType || 'PDF']
        );

        res.status(201).json({ success: true, materialId: result.id, message: 'Material published via Storage Adapter.' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// 7. Assignments & Grading
router.post('/assignments', async (req, res) => {
    try {
        const tutor = await db.get(`SELECT id FROM tutors WHERE user_id = ?`, [req.user.id]);
        const { title, description, deadline, totalMarks, batchId } = req.body;

        const result = await db.run(
            `INSERT INTO assignments (tutor_id, batch_id, title, description, deadline, total_marks)
             VALUES (?, ?, ?, ?, ?, ?)`,
            [tutor.id, batchId || null, title, description, deadline, totalMarks || 100]
        );

        // Broadcast notification via Observer Pattern
        await notificationPublisher.notify('assignment_created', {
            title: 'New Assignment Published',
            message: `Assignment '${title}' due on ${deadline}.`,
            link: '/assignments'
        });

        res.status(201).json({ success: true, assignmentId: result.id, message: 'Assignment published.' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// Grade Assignment Submission
router.post('/submissions/:id/grade', async (req, res) => {
    try {
        const submissionId = req.params.id;
        const { score, feedback } = req.body;

        const submission = await db.get(`SELECT student_id, assignment_id FROM assignment_submissions WHERE id = ?`, [submissionId]);
        if (!submission) return res.status(404).json({ success: false, message: 'Submission not found.' });

        await db.run(
            `UPDATE assignment_submissions SET score = ?, feedback = ?, graded_at = CURRENT_TIMESTAMP WHERE id = ?`,
            [score, feedback || '', submissionId]
        );

        // Notify Student & Parent via Observer Pattern
        await notificationPublisher.notify('grade_published', {
            title: 'Assignment Graded',
            message: `Your submission score is ${score}. Feedback: ${feedback || 'Graded'}`,
            studentId: submission.student_id,
            link: '/grades'
        });

        res.json({ success: true, message: 'Submission graded successfully.' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// 8. Quizzes & Questions
router.post('/quizzes', async (req, res) => {
    try {
        const tutor = await db.get(`SELECT id FROM tutors WHERE user_id = ?`, [req.user.id]);
        const { title, description, timeLimitMins, batchId, questions, quizType, meetLink } = req.body;
        const examType = quizType || 'MCQ';

        // Insert quiz with placeholder total_marks (will be updated after questions)
        const qRes = await db.run(
            `INSERT INTO quizzes (tutor_id, batch_id, title, description, time_limit_mins, total_marks, quiz_type, meet_link)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [tutor.id, batchId || null, title, description || '', timeLimitMins || 30, 0, examType, meetLink || '']
        );

        const quizId = qRes.id;
        let computedTotal = 0;

        if (questions && questions.length > 0) {
            for (const q of questions) {
                const qMarks = q.marks || 10;
                computedTotal += qMarks;
                await db.run(
                    `INSERT INTO quiz_questions (quiz_id, question_text, question_type, options_json, correct_answer, marks)
                     VALUES (?, ?, ?, ?, ?, ?)`,
                    [quizId, q.questionText, q.questionType || 'MCQ', JSON.stringify(q.options || []), q.correctAnswer, qMarks]
                );
            }
        }

        // Update total_marks with computed value from questions
        await db.run(`UPDATE quizzes SET total_marks = ? WHERE id = ?`, [computedTotal, quizId]);

        res.status(201).json({ success: true, quizId, totalMarks: computedTotal, message: 'Quiz created successfully.' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// 9. Announcements
router.post('/announcements', async (req, res) => {
    try {
        const tutor = await db.get(`SELECT id FROM tutors WHERE user_id = ?`, [req.user.id]);
        const { title, content, batchId } = req.body;

        const result = await db.run(
            `INSERT INTO announcements (tutor_id, batch_id, title, content) VALUES (?, ?, ?, ?)`,
            [tutor.id, batchId || null, title, content]
        );

        await notificationPublisher.notify('announcement_posted', {
            title: `Announcement: ${title}`,
            message: content,
            link: '/announcements'
        });

        res.status(201).json({ success: true, announcementId: result.id, message: 'Announcement published.' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// 10. Approve / Reject Schedule Change Request
router.put('/schedule-requests/:id', async (req, res) => {
    try {
        const reqId = req.params.id;
        const { status } = req.body; // APPROVED or REJECTED

        const changeReq = await db.get(`SELECT * FROM schedule_change_requests WHERE id = ?`, [reqId]);
        if (!changeReq) return res.status(404).json({ success: false, message: 'Request not found.' });

        await db.run(`UPDATE schedule_change_requests SET status = ? WHERE id = ?`, [status, reqId]);

        if (status === 'APPROVED') {
            const command = new RescheduleSessionCommand(changeReq.session_id, changeReq.requested_start, changeReq.requested_end);
            await commandInvoker.executeCommand(command);
        }

        res.json({ success: true, message: `Schedule change request ${status.toLowerCase()}.` });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

module.exports = router;
