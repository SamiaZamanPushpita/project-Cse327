package com.tms.patterns.facade;

/**
 * DESIGN PATTERN IMPLEMENTATION: Facade Pattern (Java)
 * 
 * Pattern: Facade (Structural)
 * Purpose: Provides a unified interface consolidating multi-subsystem data for Tutor, Student, and Parent dashboards.
 */

class BatchSubsystem {
    public int getActiveBatchesCount(int tutorId) { return 3; }
}

class SessionSubsystem {
    public int getUpcomingSessionsCount(int tutorId) { return 5; }
}

class AssignmentSubsystem {
    public int getPendingGradesCount(int tutorId) { return 2; }
}

public class DashboardFacade {
    private BatchSubsystem batchSubsystem = new BatchSubsystem();
    private SessionSubsystem sessionSubsystem = new SessionSubsystem();
    private AssignmentSubsystem assignmentSubsystem = new AssignmentSubsystem();

    public String getTutorDashboardOverview(int tutorId) {
        int batches = batchSubsystem.getActiveBatchesCount(tutorId);
        int sessions = sessionSubsystem.getUpcomingSessionsCount(tutorId);
        int pending = assignmentSubsystem.getPendingGradesCount(tutorId);

        return String.format("Tutor Dashboard Summary [Batches: %d, Upcoming Sessions: %d, Pending Grades: %d]", batches, sessions, pending);
    }
}
