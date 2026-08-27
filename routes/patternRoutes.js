/**
 * Dedicated Design Patterns Demonstration API Router
 * Allows faculty to trigger and verify all 8 implemented design patterns in real-time.
 */

const express = require('express');
const router = express.Router();

const {
    UserFactory,
    AssessmentFactory,
    dbSingleton,
    notificationPublisher,
    GradingContext,
    StandardPercentageStrategy,
    WeightedAverageStrategy,
    AttendanceBonusStrategy,
    CommandInvoker,
    ScheduleSessionCommand,
    RescheduleSessionCommand,
    CancelSessionCommand,
    TutorDashboardFacade,
    StorageService,
    LocalStorageAdapter,
    MockCloudStorageAdapter,
    SessionStateContext
} = require('../patterns');

// GET /api/patterns/demonstrate - Executes all 8 design patterns and returns proof of execution
router.get('/demonstrate', async (req, res) => {
    try {
        const results = [];

        // 1. Factory Method Pattern
        const tutorUser = UserFactory.createUser({ id: 1, name: 'Dr. Turing', email: 'tutor@tms.edu', role: 'TUTOR' });
        const studentUser = UserFactory.createUser({ id: 2, name: 'Rahul', email: 'rahul@student.tms.edu', role: 'STUDENT' });
        const quizAssessment = AssessmentFactory.createAssessment('QUIZ', { id: 101, title: 'GoF Quiz', total_marks: 50 });
        
        results.push({
            patternId: 1,
            name: 'Factory Method Pattern (Creational)',
            description: 'Instantiates specialized domain objects (User types & Assessment types) based on role and type parameter.',
            fileRef: 'backend/patterns/factory/UserAndAssessmentFactory.js',
            executionResult: {
                tutorPermissionsCount: tutorUser.getPermissions().length,
                studentPermissionsCount: studentUser.getPermissions().length,
                createdAssessmentType: quizAssessment.constructor.name
            }
        });

        // 2. Singleton Pattern
        const db1 = dbSingleton;
        const db2 = require('../database/db');
        
        results.push({
            patternId: 2,
            name: 'Singleton Pattern (Creational)',
            description: 'Guarantees a single database connection instance across the application lifecycle.',
            fileRef: 'backend/database/db.js',
            executionResult: {
                areInstancesIdentical: (db1 === db2),
                databaseType: 'SQLite3'
            }
        });

        // 3. Observer Pattern
        let observerLog = [];
        const mockObserver = {
            update: async (event, data) => {
                observerLog.push(`Received '${event}' with message: ${data.message}`);
            }
        };
        notificationPublisher.subscribe(mockObserver);
        await notificationPublisher.notify('faculty_demo_event', { title: 'Demo', message: 'Testing Observer Broadcasting' });
        notificationPublisher.unsubscribe(mockObserver);

        results.push({
            patternId: 3,
            name: 'Observer Pattern (Behavioral)',
            description: 'Broadcasting system events to decoupled subscribers (Database notifications, Parent alerts, Audit loggers).',
            fileRef: 'backend/patterns/observer/NotificationPublisherObserver.js',
            executionResult: {
                observersNotified: notificationPublisher.observers.length,
                sampleLog: observerLog[0]
            }
        });

        // 4. Strategy Pattern
        const sampleScores = { assignmentScores: [90, 95], quizScores: [85, 90], attendancePercentage: 96 };
        const ctxStandard = new GradingContext(new StandardPercentageStrategy()).evaluateStudentProgress(sampleScores);
        const ctxWeighted = new GradingContext(new WeightedAverageStrategy()).evaluateStudentProgress(sampleScores);
        const ctxBonus = new GradingContext(new AttendanceBonusStrategy()).evaluateStudentProgress(sampleScores);

        results.push({
            patternId: 4,
            name: 'Strategy Pattern (Behavioral)',
            description: 'Interchangeable algorithms for calculating student overall scores and academic performance.',
            fileRef: 'backend/patterns/strategy/GradingStrategy.js',
            executionResult: {
                standardScore: ctxStandard.overallScore,
                weightedScore: ctxWeighted.overallScore,
                attendanceBonusScore: ctxBonus.overallScore
            }
        });

        // 5. Command Pattern
        const invoker = new CommandInvoker();
        const schedCmd = new ScheduleSessionCommand({
            tutorId: 1,
            title: 'Pattern Demonstration Session',
            description: 'Live testing',
            startTime: '2026-09-01 10:00:00',
            endTime: '2026-09-01 11:30:00',
            sessionType: 'ONE_TO_ONE'
        });
        const execResult = await invoker.executeCommand(schedCmd);
        const undoResult = await invoker.undoLastCommand();

        results.push({
            patternId: 5,
            name: 'Command Pattern (Behavioral)',
            description: 'Encapsulates session lifecycle operations with undo capability.',
            fileRef: 'backend/patterns/command/SessionCommand.js',
            executionResult: {
                commandExecuted: 'ScheduleSessionCommand',
                createdSessionId: execResult.sessionId,
                commandUndone: undoResult.success
            }
        });

        // 6. Facade Pattern
        const tutorOverview = await TutorDashboardFacade.getDashboardOverview(1);

        results.push({
            patternId: 6,
            name: 'Facade Pattern (Structural)',
            description: 'Unified high-level interface consolidating multi-table subsystem queries for tutor/student/parent views.',
            fileRef: 'backend/patterns/facade/DashboardFacade.js',
            executionResult: {
                batchesAggregated: tutorOverview.summary.totalBatches,
                upcomingSessionsCount: tutorOverview.summary.upcomingSessionsCount
            }
        });

        // 7. Adapter Pattern
        const localStorageSvc = new StorageService(new LocalStorageAdapter());
        const cloudStorageSvc = new StorageService(new MockCloudStorageAdapter());

        const localUpload = await localStorageSvc.saveMaterial(Buffer.from('test'), 'demo_local.pdf');
        const cloudUpload = await cloudStorageSvc.saveMaterial(Buffer.from('test'), 'demo_cloud.pdf');

        results.push({
            patternId: 7,
            name: 'Adapter Pattern (Structural)',
            description: 'Standardizes storage provider interface for local file saving vs Cloud S3 uploads.',
            fileRef: 'backend/patterns/adapter/StorageAdapter.js',
            executionResult: {
                localUrl: localUpload.url,
                cloudUrl: cloudUpload.url
            }
        });

        // 8. State Pattern
        const sessionStateContext = new SessionStateContext(99, 'SCHEDULED');
        const completeTransition = sessionStateContext.completeSession();

        results.push({
            patternId: 8,
            name: 'State Pattern (Behavioral)',
            description: 'Enforces valid lifecycle status transitions (SCHEDULED -> COMPLETED / CANCELLED / RESCHEDULED).',
            fileRef: 'backend/patterns/state/SessionState.js',
            executionResult: {
                initialStatus: 'SCHEDULED',
                transitionedStatus: completeTransition.status,
                message: completeTransition.message
            }
        });

        res.json({
            success: true,
            totalPatternsImplemented: 8,
            patterns: results
        });

    } catch (err) {
        console.error('Pattern demo error:', err);
        res.status(500).json({ success: false, message: err.message });
    }
});

module.exports = router;
