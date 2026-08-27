package com.tms.patterns.state;

/**
 * DESIGN PATTERN IMPLEMENTATION: State Pattern (Java)
 * 
 * Pattern: State (Behavioral)
 * Purpose: Alters session behavior based on internal state transitions (SCHEDULED -> COMPLETED / CANCELLED).
 */

interface SessionStateInterface {
    void complete(SessionContext context);
    void cancel(SessionContext context);
}

class ScheduledStateImpl implements SessionStateInterface {
    @Override
    public void complete(SessionContext context) {
        System.out.println("Transitioning session to COMPLETED state.");
        context.setState(new CompletedStateImpl());
    }

    @Override
    public void cancel(SessionContext context) {
        System.out.println("Transitioning session to CANCELLED state.");
        context.setState(new CancelledStateImpl());
    }
}

class CompletedStateImpl implements SessionStateInterface {
    @Override
    public void complete(SessionContext context) {
        System.out.println("Session is already completed.");
    }

    @Override
    public void cancel(SessionContext context) {
        throw new IllegalStateException("Completed session cannot be cancelled.");
    }
}

class CancelledStateImpl implements SessionStateInterface {
    @Override
    public void complete(SessionContext context) {
        throw new IllegalStateException("Cancelled session cannot be completed directly.");
    }

    @Override
    public void cancel(SessionContext context) {
        System.out.println("Session is already cancelled.");
    }
}

class SessionContext {
    private SessionStateInterface state = new ScheduledStateImpl();

    public void setState(SessionStateInterface state) {
        this.state = state;
    }

    public void complete() {
        state.complete(this);
    }

    public void cancel() {
        state.cancel(this);
    }
}

public class SessionState {
    public static void main(String[] args) {
        SessionContext session = new SessionContext();
        session.complete(); // Transitions SCHEDULED -> COMPLETED
    }
}
