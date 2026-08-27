const db = require('./db');
const bcrypt = require('bcryptjs');

async function seedDatabase() {
    console.log('🌱 Seeding SQLite database for Tutor Management System...');

    const salt = await bcrypt.genSalt(10);
    const defaultPasswordHash = await bcrypt.hash('password123', salt);

    try {
        // Clear existing tables
        const tables = [
            'schedule_change_requests', 'messages', 'conversation_participants', 'conversations',
            'notifications', 'announcements', 'attendances', 'quiz_attempts', 'quiz_questions',
            'quizzes', 'assignment_submissions', 'assignments', 'learning_materials',
            'session_logs', 'session_participants', 'sessions', 'enrollments', 'batches',
            'parent_students', 'parents', 'students', 'tutors', 'users'
        ];

        for (const table of tables) {
            await db.run(`DELETE FROM ${table}`);
            await db.run(`DELETE FROM sqlite_sequence WHERE name='${table}'`);
        }

        console.log('🧹 Cleaned existing database tables.');

        // 1. Create Users
        // Tutor
        const tutorUserRes = await db.run(
            `INSERT INTO users (name, email, password_hash, phone, role, profile_image) VALUES (?, ?, ?, ?, ?, ?)`,
            ['Dr. Alan Turing', 'tutor@tms.edu', defaultPasswordHash, '+1 555-0199', 'TUTOR', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150']
        );
        const tutorUserId = tutorUserRes.id;

        const tutorRes = await db.run(
            `INSERT INTO tutors (user_id, specialization, bio) VALUES (?, ?, ?)`,
            [tutorUserId, 'Computer Science & Software Architecture', 'Senior Academic Tutor specializing in Software Engineering, Design Patterns, and Data Structures with 10+ years experience.']
        );
        const tutorId = tutorRes.id;

        // Students
        const studentData = [
            { name: 'Rahul Sharma', email: 'rahul@student.tms.edu', institution: 'North South University', level: 'Senior (CSE)', phone: '+1 555-0101' },
            { name: 'Ananya Roy', email: 'ananya@student.tms.edu', institution: 'BRAC University', level: 'Junior (CSE)', phone: '+1 555-0102' },
            { name: 'Zayan Ahmed', email: 'zayan@student.tms.edu', institution: 'Independent University', level: 'Sophomore (CSE)', phone: '+1 555-0103' },
            { name: 'Priya Das', email: 'priya@student.tms.edu', institution: 'UIU', level: 'Freshman (CSE)', phone: '+1 555-0104' },
        ];

        const studentIds = [];
        for (const s of studentData) {
            const uRes = await db.run(
                `INSERT INTO users (name, email, password_hash, phone, role, profile_image) VALUES (?, ?, ?, ?, ?, ?)`,
                [s.name, s.email, defaultPasswordHash, s.phone, 'STUDENT', `https://api.dicebear.com/7.x/avataaars/svg?seed=${s.name.replace(' ', '')}`]
            );
            const sRes = await db.run(
                `INSERT INTO students (user_id, institution, academic_level) VALUES (?, ?, ?)`,
                [uRes.id, s.institution, s.level]
            );
            studentIds.push({ userId: uRes.id, studentId: sRes.id, name: s.name });
        }

        // Parents
        const parent1User = await db.run(
            `INSERT INTO users (name, email, password_hash, phone, role, profile_image) VALUES (?, ?, ?, ?, ?, ?)`,
            ['Mrs. Sunita Sharma', 'mrs.sharma@parent.tms.edu', defaultPasswordHash, '+1 555-0201', 'PARENT', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sunita']
        );
        const parent1Res = await db.run(`INSERT INTO parents (user_id, occupation) VALUES (?, ?)`, [parent1User.id, 'Architect']);
        await db.run(`INSERT INTO parent_students (parent_id, student_id, relationship) VALUES (?, ?, ?)`, [parent1Res.id, studentIds[0].studentId, 'Mother']);

        const parent2User = await db.run(
            `INSERT INTO users (name, email, password_hash, phone, role, profile_image) VALUES (?, ?, ?, ?, ?, ?)`,
            ['Mr. Subhash Roy', 'mr.roy@parent.tms.edu', defaultPasswordHash, '+1 555-0202', 'PARENT', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Subhash']
        );
        const parent2Res = await db.run(`INSERT INTO parents (user_id, occupation) VALUES (?, ?)`, [parent2User.id, 'Software Executive']);
        await db.run(`INSERT INTO parent_students (parent_id, student_id, relationship) VALUES (?, ?, ?)`, [parent2Res.id, studentIds[1].studentId, 'Father']);

        console.log('✅ Users, Tutors, Students & Parents created.');

        // 2. Create Batches & Enrollments
        const batch1 = await db.run(
            `INSERT INTO batches (tutor_id, name, subject, description, schedule_info) VALUES (?, ?, ?, ?, ?)`,
            [tutorId, 'CSE327 - Software Engineering', 'Computer Science', 'Comprehensive course covering SDLC, Agile, UML modeling, clean code principles, and GoF design patterns.', 'Sun & Tue | 06:00 PM - 07:30 PM']
        );
        const batch2 = await db.run(
            `INSERT INTO batches (tutor_id, name, subject, description, schedule_info) VALUES (?, ?, ?, ?, ?)`,
            [tutorId, 'CSE225 - Data Structures & Algorithms', 'Computer Science', 'Mastering trees, graphs, dynamic programming, space-time complexity analysis, and coding interview techniques.', 'Mon & Wed | 04:00 PM - 05:30 PM']
        );

        // Enroll students into Batch 1 (Ananya & Zayan)
        await db.run(`INSERT INTO enrollments (batch_id, student_id) VALUES (?, ?)`, [batch1.id, studentIds[1].studentId]);
        await db.run(`INSERT INTO enrollments (batch_id, student_id) VALUES (?, ?)`, [batch1.id, studentIds[2].studentId]);

        // Enroll student into Batch 2 (Priya)
        await db.run(`INSERT INTO enrollments (batch_id, student_id) VALUES (?, ?)`, [batch2.id, studentIds[3].studentId]);

        console.log('✅ Batches & Enrollments created.');

        // 3. Create Sessions (Past & Upcoming, Batch & 1-on-1)
        const now = new Date();
        const pastDate1 = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString().replace('T', ' ').substring(0, 19);
        const pastDate1End = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000 + 90 * 60 * 1000).toISOString().replace('T', ' ').substring(0, 19);
        const pastDate2 = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString().replace('T', ' ').substring(0, 19);
        const pastDate2End = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000 + 90 * 60 * 1000).toISOString().replace('T', ' ').substring(0, 19);

        const futureDate1 = new Date(now.getTime() + 1 * 24 * 60 * 60 * 1000).toISOString().replace('T', ' ').substring(0, 19);
        const futureDate1End = new Date(now.getTime() + 1 * 24 * 60 * 60 * 1000 + 90 * 60 * 1000).toISOString().replace('T', ' ').substring(0, 19);
        const futureDate2 = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000).toISOString().replace('T', ' ').substring(0, 19);
        const futureDate2End = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000 + 90 * 60 * 1000).toISOString().replace('T', ' ').substring(0, 19);

        // Past Batch Session 1
        const s1 = await db.run(
            `INSERT INTO sessions (tutor_id, batch_id, title, description, start_time, end_time, location, session_type, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [tutorId, batch1.id, 'Session 1: Structural & Creational Design Patterns', 'Discussion on Factory Method, Singleton, and Facade patterns in real-world systems.', pastDate2, pastDate2End, 'Online (Google Meet)', 'BATCH', 'COMPLETED']
        );
        await db.run(`INSERT INTO session_participants (session_id, student_id) VALUES (?, ?)`, [s1.id, studentIds[1].studentId]);
        await db.run(`INSERT INTO session_participants (session_id, student_id) VALUES (?, ?)`, [s1.id, studentIds[2].studentId]);
        
        await db.run(
            `INSERT INTO session_logs (session_id, tutor_id, topics_covered, homework, notes, next_session_plan) VALUES (?, ?, ?, ?, ?, ?)`,
            [s1.id, tutorId, 'Factory Method, Singleton, Facade Pattern implementation details', 'Implement Singleton Database class in Node.js', 'All students attended and asked great questions on thread safety.', 'Behavioral patterns: Observer & Strategy']
        );
        await db.run(`INSERT INTO attendances (session_id, student_id, status, notes) VALUES (?, ?, ?, ?)`, [s1.id, studentIds[1].studentId, 'PRESENT', 'On time']);
        await db.run(`INSERT INTO attendances (session_id, student_id, status, notes) VALUES (?, ?, ?, ?)`, [s1.id, studentIds[2].studentId, 'PRESENT', 'On time']);

        // Past 1-on-1 Session (Rahul)
        const s2 = await db.run(
            `INSERT INTO sessions (tutor_id, student_id, title, description, start_time, end_time, location, session_type, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [tutorId, studentIds[0].studentId, '1-on-1 Mentorship: Advanced Microservices & Architecture', 'Deep dive into Observer pattern and event-driven architectures.', pastDate1, pastDate1End, 'Online (Zoom)', 'ONE_TO_ONE', 'COMPLETED']
        );
        await db.run(`INSERT INTO session_participants (session_id, student_id) VALUES (?, ?)`, [s2.id, studentIds[0].studentId]);
        await db.run(
            `INSERT INTO session_logs (session_id, tutor_id, topics_covered, homework, notes, next_session_plan) VALUES (?, ?, ?, ?, ?, ?)`,
            [s2.id, tutorId, 'Observer Pattern, Event-driven pub-sub architecture, JWT auth', 'Refactor backend API endpoints to use Facade pattern', 'Rahul showed great grasp of decouple event handling.', 'Database indexing & query optimization']
        );
        await db.run(`INSERT INTO attendances (session_id, student_id, status, notes) VALUES (?, ?, ?, ?)`, [s2.id, studentIds[0].studentId, 'PRESENT', 'Active participation']);

        // Future Batch Session
        const s3 = await db.run(
            `INSERT INTO sessions (tutor_id, batch_id, title, description, start_time, end_time, location, session_type, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [tutorId, batch1.id, 'Session 2: Behavioral Design Patterns & Command Pattern', 'Interactive coding session implementing Observer, Strategy, and Command patterns.', futureDate1, futureDate1End, 'Online (Google Meet)', 'BATCH', 'SCHEDULED']
        );
        await db.run(`INSERT INTO session_participants (session_id, student_id) VALUES (?, ?)`, [s3.id, studentIds[1].studentId]);
        await db.run(`INSERT INTO session_participants (session_id, student_id) VALUES (?, ?)`, [s3.id, studentIds[2].studentId]);

        // Future 1-on-1 Session (Rahul)
        const s4 = await db.run(
            `INSERT INTO sessions (tutor_id, student_id, title, description, start_time, end_time, location, session_type, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [tutorId, studentIds[0].studentId, '1-on-1 Review: System Design & Project Presentation', 'Reviewing final CSE327 project diagrams and live demo rehearsal.', futureDate2, futureDate2End, 'Online (Zoom)', 'ONE_TO_ONE', 'SCHEDULED']
        );
        await db.run(`INSERT INTO session_participants (session_id, student_id) VALUES (?, ?)`, [s4.id, studentIds[0].studentId]);

        console.log('✅ Sessions, Participants, Session Logs & Attendance created.');

        // 4. Learning Materials
        await db.run(
            `INSERT INTO learning_materials (tutor_id, batch_id, title, description, file_url, file_type) VALUES (?, ?, ?, ?, ?, ?)`,
            [tutorId, batch1.id, 'GoF Design Patterns Reference Manual', 'Comprehensive guide covering Creational, Structural, and Behavioral patterns with UML diagrams.', 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', 'PDF']
        );
        await db.run(
            `INSERT INTO learning_materials (tutor_id, batch_id, title, description, file_url, file_type) VALUES (?, ?, ?, ?, ?, ?)`,
            [tutorId, batch1.id, 'Software Architecture & MVC Cheat Sheet', 'Quick reference for layered architecture, controller setup, and REST API conventions.', 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', 'PDF']
        );

        console.log('✅ Learning Materials created.');

        // 5. Assignments & Submissions
        const a1 = await db.run(
            `INSERT INTO assignments (tutor_id, batch_id, title, description, deadline, total_marks) VALUES (?, ?, ?, ?, ?, ?)`,
            [tutorId, batch1.id, 'Assignment 1: UML Modeling & Design Pattern Specs', 'Draw UML Class and Sequence diagrams for a Tutor Management System and implement 3 core design patterns.', futureDate1, 100]
        );

        // Submissions
        await db.run(
            `INSERT INTO assignment_submissions (assignment_id, student_id, content, file_url, score, feedback, graded_at) VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [a1.id, studentIds[1].studentId, 'Completed UML Class Diagram and implemented Factory and Observer patterns in TypeScript.', 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', 95.0, 'Excellent class structure and clean observer subscription mechanism!', pastDate1]
        );
        await db.run(
            `INSERT INTO assignment_submissions (assignment_id, student_id, content, file_url, score, feedback, graded_at) VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [a1.id, studentIds[0].studentId, 'Submitted 1-on-1 custom implementation with full test coverage and design documentation.', 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', 98.0, 'Outstanding work, clear separation of concerns and pattern documentation.', pastDate1]
        );

        console.log('✅ Assignments & Submissions created.');

        // 6. Quizzes & Attempts
        const q1 = await db.run(
            `INSERT INTO quizzes (tutor_id, batch_id, title, description, time_limit_mins, total_marks) VALUES (?, ?, ?, ?, ?, ?)`,
            [tutorId, batch1.id, 'Quiz 1: Software Design Patterns & Principles', 'Test your knowledge on SOLID principles, Singleton, Observer, Strategy, and Facade patterns.', 20, 30]
        );

        await db.run(
            `INSERT INTO quiz_questions (quiz_id, question_text, question_type, options_json, correct_answer, marks) VALUES (?, ?, ?, ?, ?, ?)`,
            [q1.id, 'Which design pattern ensures a class has only one instance and provides a global point of access to it?', 'MCQ', JSON.stringify(['Factory Method', 'Singleton', 'Observer', 'Adapter']), 'Singleton', 10]
        );
        await db.run(
            `INSERT INTO quiz_questions (quiz_id, question_text, question_type, options_json, correct_answer, marks) VALUES (?, ?, ?, ?, ?, ?)`,
            [q1.id, 'Which pattern defines a one-to-many dependency between objects so that when one object changes state, all its dependents are notified automatically?', 'MCQ', JSON.stringify(['Strategy', 'Facade', 'Observer', 'Command']), 'Observer', 10]
        );
        await db.run(
            `INSERT INTO quiz_questions (quiz_id, question_text, question_type, options_json, correct_answer, marks) VALUES (?, ?, ?, ?, ?, ?)`,
            [q1.id, 'Briefly explain the main benefit of using the Strategy Pattern over hardcoded conditional logic.', 'SHORT_ANSWER', null, 'It encapsulates algorithms into interchangeable classes, promoting Open/Closed Principle and dynamic runtime swapping.', 10]
        );

        // Attempt by Ananya
        await db.run(
            `INSERT INTO quiz_attempts (quiz_id, student_id, answers_json, score, graded_at) VALUES (?, ?, ?, ?, ?)`,
            [q1.id, studentIds[1].studentId, JSON.stringify({ 1: 'Singleton', 2: 'Observer', 3: 'It allows swapping algorithms dynamically without altering client code.' }), 28.5, pastDate1]
        );

        console.log('✅ Quizzes, Questions & Attempts created.');

        // 7. Announcements & Notifications
        await db.run(
            `INSERT INTO announcements (tutor_id, batch_id, title, content) VALUES (?, ?, ?, ?)`,
            [tutorId, batch1.id, '🚀 Welcome to Summer 2026 Tutor Portal', 'Welcome everyone! Please check the calendar for upcoming live sessions, review lecture materials, and check Assignment 1 instructions. All questions can be directed via the in-app chat.']
        );
        await db.run(
            `INSERT INTO announcements (tutor_id, title, content) VALUES (?, ?, ?)`,
            [tutorId, '📢 Midterm Project Demo Guidelines Released', 'The CSE327 project demo presentation schedule has been posted. Make sure your design patterns implementation is cleanly documented in your code!']
        );

        // Notifications
        for (const s of studentIds) {
            await db.run(
                `INSERT INTO notifications (user_id, title, message, type, link) VALUES (?, ?, ?, ?, ?)`,
                [s.userId, 'Welcome to Tutor Management System', 'Your student account is active. Explore your calendar, materials, and assignments.', 'INFO', '/dashboard']
            );
            await db.run(
                `INSERT INTO notifications (user_id, title, message, type, link) VALUES (?, ?, ?, ?, ?)`,
                [s.userId, 'New Session Scheduled', 'Upcoming session scheduled for tomorrow at 06:00 PM.', 'CALENDAR', '/calendar']
            );
        }

        // Parent notification
        await db.run(
            `INSERT INTO notifications (user_id, title, message, type, link) VALUES (?, ?, ?, ?, ?)`,
            [parent1User.id, 'Academic Update for Rahul Sharma', 'Rahul achieved 98/100 on Assignment 1 and maintains 100% attendance.', 'ACADEMIC', '/parent-dashboard']
        );

        console.log('✅ Announcements & Notifications created.');

        // 8. Conversations & Messages
        const conv1 = await db.run(`INSERT INTO conversations (title) VALUES (?)`, ['Dr. Alan Turing & Rahul Sharma']);
        await db.run(`INSERT INTO conversation_participants (conversation_id, user_id) VALUES (?, ?)`, [conv1.id, tutorUserId]);
        await db.run(`INSERT INTO conversation_participants (conversation_id, user_id) VALUES (?, ?)`, [conv1.id, studentIds[0].userId]);

        await db.run(
            `INSERT INTO messages (conversation_id, sender_id, content, sent_at) VALUES (?, ?, ?, ?)`,
            [conv1.id, studentIds[0].userId, 'Good afternoon Dr. Turing! I have submitted Assignment 1 and pushed the code for review.', pastDate2]
        );
        await db.run(
            `INSERT INTO messages (conversation_id, sender_id, content, sent_at) VALUES (?, ?, ?, ?)`,
            [conv1.id, tutorUserId, 'Great job Rahul! I reviewed your submission — impressive design pattern separation.', pastDate1]
        );

        // Parent chat
        const conv2 = await db.run(`INSERT INTO conversations (title) VALUES (?)`, ['Dr. Alan Turing & Mrs. Sunita Sharma']);
        await db.run(`INSERT INTO conversation_participants (conversation_id, user_id) VALUES (?, ?)`, [conv2.id, tutorUserId]);
        await db.run(`INSERT INTO conversation_participants (conversation_id, user_id) VALUES (?, ?)`, [conv2.id, parent1User.id]);

        await db.run(
            `INSERT INTO messages (conversation_id, sender_id, content, sent_at) VALUES (?, ?, ?, ?)`,
            [conv2.id, parent1User.id, 'Hello Dr. Turing, how is Rahul performing in his 1-on-1 sessions?', pastDate1]
        );
        await db.run(
            `INSERT INTO messages (conversation_id, sender_id, content, sent_at) VALUES (?, ?, ?, ?)`,
            [conv2.id, tutorUserId, 'Hello Mrs. Sharma! Rahul is doing exceptionally well. He is consistently scoring top grades and participating actively.', pastDate1]
        );

        // Ananya ↔ Tutor chat
        const conv3 = await db.run(`INSERT INTO conversations (title) VALUES (?)`, ['Dr. Alan Turing & Ananya Roy']);
        await db.run(`INSERT INTO conversation_participants (conversation_id, user_id) VALUES (?, ?)`, [conv3.id, tutorUserId]);
        await db.run(`INSERT INTO conversation_participants (conversation_id, user_id) VALUES (?, ?)`, [conv3.id, studentIds[1].userId]);

        await db.run(
            `INSERT INTO messages (conversation_id, sender_id, content, sent_at) VALUES (?, ?, ?, ?)`,
            [conv3.id, tutorUserId, 'Hi Ananya, just a reminder that the batch session is scheduled for next week. Please review the Factory Pattern notes beforehand.', pastDate2]
        );
        await db.run(
            `INSERT INTO messages (conversation_id, sender_id, content, sent_at) VALUES (?, ?, ?, ?)`,
            [conv3.id, studentIds[1].userId, 'Thank you Dr. Turing! I have already gone through the slides. Should I also look at the Singleton pattern notes?', pastDate1]
        );
        await db.run(
            `INSERT INTO messages (conversation_id, sender_id, content, sent_at) VALUES (?, ?, ?, ?)`,
            [conv3.id, tutorUserId, 'Yes, please do! Both patterns will be covered in the upcoming session. Great initiative Ananya!', pastDate1]
        );

        console.log('✅ Conversations & Messages created.');


        // 9. Schedule Change Requests
        await db.run(
            `INSERT INTO schedule_change_requests (session_id, student_id, requested_start, requested_end, reason, status) VALUES (?, ?, ?, ?, ?, ?)`,
            [s3.id, studentIds[1].studentId, futureDate2, futureDate2End, 'Clash with university lab examination.', 'PENDING']
        );

        console.log('✅ Schedule Change Requests created.');
        console.log('🎉 Database Seeding Complete! Demo ready.');

    } catch (err) {
        console.error('❌ Seeding error:', err);
    }
}

// Execute if run directly
if (require.main === module) {
    seedDatabase().then(() => process.exit(0));
}

module.exports = seedDatabase;
