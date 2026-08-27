/**
 * DESIGN PATTERN IMPLEMENTATION: Facade Pattern
 * 
 * Pattern: Facade (Structural)
 * Purpose: Provides a simplified, unified interface to complex, multi-table database queries 
 *          and backend subsystems for Tutor, Student, and Parent dashboards.
 */

const db = require('../../database/db');
const { GradingContext, WeightedAverageStrategy } = require('../strategy/GradingStrategy');

class TutorDashboardFacade {
    static async getDashboardOverview(tutorUserId) {
        // Find tutor entry
        const tutor = await db.get(`SELECT id FROM tutors WHERE user_id = ?`, [tutorUserId]);
        if (!tutor) throw new Error('Tutor profile not found');
        const tutorId = tutor.id;

        // 1. Batches & Enrolled Students count
        const batches = await db.query(
            `SELECT b.*, COUNT(e.id) as enrolled_count 
             FROM batches b 
             LEFT JOIN enrollments e ON b.id = e.batch_id AND e.status = 'ACTIVE' 
             WHERE b.tutor_id = ? 
             GROUP BY b.id`,
            [tutorId]
        );

        // 1-on-1 Students
        const oneToOneStudents = await db.query(
            `SELECT s.id as student_id, u.name, u.email, s.institution, s.academic_level 
             FROM students s 
             JOIN users u ON s.user_id = u.id 
             JOIN session_participants sp ON s.id = sp.student_id 
             JOIN sessions sess ON sp.session_id = sess.id 
             WHERE sess.tutor_id = ? AND sess.session_type = 'ONE_TO_ONE' 
             GROUP BY s.id`,
            [tutorId]
        );

        // 2. Upcoming Sessions
        const upcomingSessions = await db.query(
            `SELECT s.*, b.name as batch_name, u.name as student_name 
             FROM sessions s 
             LEFT JOIN batches b ON s.batch_id = b.id 
             LEFT JOIN students st ON s.student_id = st.id 
             LEFT JOIN users u ON st.user_id = u.id 
             WHERE s.tutor_id = ? AND s.status IN ('SCHEDULED', 'RESCHEDULED') 
             ORDER BY s.start_time ASC LIMIT 5`,
            [tutorId]
        );

        // 3. Pending Submissions to Grade
        const pendingSubmissions = await db.query(
            `SELECT sub.*, a.title as assignment_title, u.name as student_name 
             FROM assignment_submissions sub 
             JOIN assignments a ON sub.assignment_id = a.id 
             JOIN students st ON sub.student_id = st.id 
             JOIN users u ON st.user_id = u.id 
             WHERE a.tutor_id = ? AND sub.score IS NULL`,
            [tutorId]
        );

        // 4. Pending Schedule Change Requests
        const pendingScheduleRequests = await db.query(
            `SELECT req.*, sess.title as session_title, u.name as student_name 
             FROM schedule_change_requests req 
             JOIN sessions sess ON req.session_id = sess.id 
             JOIN students st ON req.student_id = st.id 
             JOIN users u ON st.user_id = u.id 
             WHERE sess.tutor_id = ? AND req.status = 'PENDING'`,
            [tutorId]
        );

        // 5. Recent Session Logs
        const recentLogs = await db.query(
            `SELECT log.*, s.title as session_title 
             FROM session_logs log 
             JOIN sessions s ON log.session_id = s.id 
             WHERE log.tutor_id = ? 
             ORDER BY log.created_at DESC LIMIT 5`,
            [tutorId]
        );

        return {
            tutorId,
            summary: {
                totalBatches: batches.length,
                totalOneToOneStudents: oneToOneStudents.length,
                upcomingSessionsCount: upcomingSessions.length,
                pendingGradesCount: pendingSubmissions.length,
                pendingScheduleRequestsCount: pendingScheduleRequests.length
            },
            batches,
            oneToOneStudents,
            upcomingSessions,
            pendingSubmissions,
            pendingScheduleRequests,
            recentLogs
        };
    }
}

class StudentDashboardFacade {
    static async getDashboardOverview(studentUserId) {
        const student = await db.get(`SELECT id FROM students WHERE user_id = ?`, [studentUserId]);
        if (!student) throw new Error('Student profile not found');
        const studentId = student.id;

        // 1. Enrolled Batches
        const enrolledBatches = await db.query(
            `SELECT b.*, u.name as tutor_name 
             FROM enrollments e 
             JOIN batches b ON e.batch_id = b.id 
             JOIN tutors t ON b.tutor_id = t.id 
             JOIN users u ON t.user_id = u.id 
             WHERE e.student_id = ? AND e.status = 'ACTIVE'`,
            [studentId]
        );

        // 2. Personal Schedule Sessions
        const mySessions = await db.query(
            `SELECT s.*, b.name as batch_name 
             FROM sessions s 
             JOIN session_participants sp ON s.id = sp.session_id 
             LEFT JOIN batches b ON s.batch_id = b.id 
             WHERE sp.student_id = ? 
             ORDER BY s.start_time DESC LIMIT 10`,
            [studentId]
        );

        // 3. Assignments & Submission status
        const assignments = await db.query(
            `SELECT a.*, sub.score, sub.feedback, sub.submitted_at 
             FROM assignments a 
             LEFT JOIN assignment_submissions sub ON a.id = sub.assignment_id AND sub.student_id = ? 
             WHERE a.batch_id IN (SELECT batch_id FROM enrollments WHERE student_id = ? AND status = 'ACTIVE') 
             ORDER BY a.deadline ASC`,
            [studentId, studentId]
        );

        // 4. Quizzes & Attempts
        const quizzes = await db.query(
            `SELECT q.*, qa.score as attempt_score, qa.attempted_at 
             FROM quizzes q 
             LEFT JOIN quiz_attempts qa ON q.id = qa.quiz_id AND qa.student_id = ? 
             WHERE q.batch_id IN (SELECT batch_id FROM enrollments WHERE student_id = ? AND status = 'ACTIVE')`,
            [studentId, studentId]
        );

        // 5. Attendance Summary
        const attendanceRecords = await db.query(
            `SELECT status FROM attendances WHERE student_id = ?`,
            [studentId]
        );
        const presentCount = attendanceRecords.filter(r => r.status === 'PRESENT').length;
        const totalSessionsMarked = attendanceRecords.length;
        const attendancePercentage = totalSessionsMarked > 0 ? Math.round((presentCount / totalSessionsMarked) * 100) : 100;

        // Calculate progress using Strategy Pattern
        const assignScores = assignments.filter(a => a.score !== null).map(a => a.score);
        const quizScores = quizzes.filter(q => q.attempt_score !== null).map(q => q.attempt_score);
        
        const gradingContext = new GradingContext(new WeightedAverageStrategy());
        const progressEval = gradingContext.evaluateStudentProgress({
            assignmentScores: assignScores,
            quizScores: quizScores,
            attendancePercentage: attendancePercentage
        });

        // 6. Announcements
        const announcements = await db.query(
            `SELECT ann.*, u.name as tutor_name 
             FROM announcements ann 
             JOIN tutors t ON ann.tutor_id = t.id 
             JOIN users u ON t.user_id = u.id 
             ORDER BY ann.created_at DESC LIMIT 5`
        );

        return {
            studentId,
            enrolledBatches,
            mySessions,
            assignments,
            quizzes,
            attendanceSummary: {
                presentCount,
                totalSessionsMarked,
                attendancePercentage
            },
            academicProgress: progressEval,
            announcements
        };
    }
}

class ParentDashboardFacade {
    static async getDashboardOverview(parentUserId) {
        const parent = await db.get(`SELECT id FROM parents WHERE user_id = ?`, [parentUserId]);
        if (!parent) throw new Error('Parent profile not found');
        const parentId = parent.id;

        // Get linked children
        const children = await db.query(
            `SELECT s.id as student_id, u.name, u.email, s.institution, s.academic_level, ps.relationship 
             FROM parent_students ps 
             JOIN students s ON ps.student_id = s.id 
             JOIN users u ON s.user_id = u.id 
             WHERE ps.parent_id = ?`,
            [parentId]
        );

        const childrenData = [];
        for (const child of children) {
            const overview = await StudentDashboardFacade.getDashboardOverview(child.name ? child.student_id : null);
            // Fetch session logs for child
            const sessionLogs = await db.query(
                `SELECT log.*, s.title as session_title 
                 FROM session_logs log 
                 JOIN sessions s ON log.session_id = s.id 
                 JOIN session_participants sp ON s.id = sp.session_id 
                 WHERE sp.student_id = ? 
                 ORDER BY log.created_at DESC LIMIT 5`,
                [child.student_id]
            );

            childrenData.push({
                childInfo: child,
                academicProgress: overview.academicProgress,
                attendanceSummary: overview.attendanceSummary,
                recentSessions: overview.mySessions,
                assignmentGrades: overview.assignments,
                quizResults: overview.quizzes,
                sessionLogs: sessionLogs
            });
        }

        return {
            parentId,
            childrenCount: children.length,
            childrenData
        };
    }
}

module.exports = {
    TutorDashboardFacade,
    StudentDashboardFacade,
    ParentDashboardFacade
};
