/**
 * DESIGN PATTERN IMPLEMENTATION: State Pattern
 * 
 * Pattern: State (Behavioral)
 * Purpose: Allows a Session object to alter its behavior when its internal status 
 *          changes (SCHEDULED -> COMPLETED / CANCELLED / RESCHEDULED), enforcing valid state transitions.
 */

class ISessionState {
    complete(context) {
        throw new Error(`Cannot complete session in ${this.constructor.name} state.`);
    }

    cancel(context) {
        throw new Error(`Cannot cancel session in ${this.constructor.name} state.`);
    }

    reschedule(context) {
        throw new Error(`Cannot reschedule session in ${this.constructor.name} state.`);
    }
}

class ScheduledState extends ISessionState {
    complete(context) {
        console.log(`🔄 [State Pattern] Transitioning session ${context.id} from SCHEDULED -> COMPLETED`);
        context.setState(new CompletedState());
        return { status: 'COMPLETED', message: 'Session completed successfully.' };
    }

    cancel(context) {
        console.log(`🔄 [State Pattern] Transitioning session ${context.id} from SCHEDULED -> CANCELLED`);
        context.setState(new CancelledState());
        return { status: 'CANCELLED', message: 'Session cancelled.' };
    }

    reschedule(context) {
        console.log(`🔄 [State Pattern] Transitioning session ${context.id} from SCHEDULED -> RESCHEDULED`);
        context.setState(new RescheduledState());
        return { status: 'RESCHEDULED', message: 'Session rescheduled.' };
    }
}

class RescheduledState extends ISessionState {
    complete(context) {
        console.log(`🔄 [State Pattern] Transitioning session ${context.id} from RESCHEDULED -> COMPLETED`);
        context.setState(new CompletedState());
        return { status: 'COMPLETED', message: 'Rescheduled session completed.' };
    }

    cancel(context) {
        console.log(`🔄 [State Pattern] Transitioning session ${context.id} from RESCHEDULED -> CANCELLED`);
        context.setState(new CancelledState());
        return { status: 'CANCELLED', message: 'Rescheduled session cancelled.' };
    }

    reschedule(context) {
        return { status: 'RESCHEDULED', message: 'Session updated with new time slot.' };
    }
}

class CompletedState extends ISessionState {
    complete(context) {
        return { status: 'COMPLETED', message: 'Session is already completed.' };
    }

    cancel(context) {
        throw new Error('Completed sessions cannot be cancelled.');
    }

    reschedule(context) {
        throw new Error('Completed sessions cannot be rescheduled.');
    }
}

class CancelledState extends ISessionState {
    complete(context) {
        throw new Error('Cancelled sessions cannot be completed directly. Reschedule first.');
    }

    cancel(context) {
        return { status: 'CANCELLED', message: 'Session is already cancelled.' };
    }

    reschedule(context) {
        console.log(`🔄 [State Pattern] Transitioning session ${context.id} from CANCELLED -> RESCHEDULED`);
        context.setState(new RescheduledState());
        return { status: 'RESCHEDULED', message: 'Cancelled session reactivated and rescheduled.' };
    }
}

// Session State Context Wrapper
class SessionStateContext {
    constructor(id, currentStatusStr = 'SCHEDULED') {
        this.id = id;
        this.setStateFromStatus(currentStatusStr);
    }

    setState(stateInstance) {
        this.currentState = stateInstance;
    }

    setStateFromStatus(statusStr) {
        switch (statusStr) {
            case 'COMPLETED':
                this.currentState = new CompletedState();
                break;
            case 'CANCELLED':
                this.currentState = new CancelledState();
                break;
            case 'RESCHEDULED':
                this.currentState = new RescheduledState();
                break;
            case 'SCHEDULED':
            default:
                this.currentState = new ScheduledState();
                break;
        }
    }

    completeSession() {
        return this.currentState.complete(this);
    }

    cancelSession() {
        return this.currentState.cancel(this);
    }

    rescheduleSession() {
        return this.currentState.reschedule(this);
    }
}

module.exports = {
    SessionStateContext,
    ScheduledState,
    CompletedState,
    CancelledState,
    RescheduledState
};
