/**
 * DESIGN PATTERN IMPLEMENTATION: Command Pattern
 * 
 * Pattern: Command (Behavioral)
 * Purpose: Encapsulates session management actions (Scheduling, Rescheduling, Cancellation)
 *          as standalone command objects with execute() and undo() capabilities.
 */

const db = require('../../database/db');
const observer = require('../observer/NotificationPublisherObserver');

// Base Command Interface
class ISessionCommand {
    async execute() {
        throw new Error('execute() must be implemented.');
    }

    async undo() {
        throw new Error('undo() must be implemented.');
    }
}

// Concrete Command 1: Schedule Session Command
class ScheduleSessionCommand extends ISessionCommand {
    constructor(sessionData) {
        super();
        this.sessionData = sessionData;
        this.createdSessionId = null;
    }

    async execute() {
        const { tutorId, batchId, studentId, title, description, startTime, endTime, location, sessionType } = this.sessionData;
        const res = await db.run(
            `INSERT INTO sessions (tutor_id, batch_id, student_id, title, description, start_time, end_time, location, session_type, status)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'SCHEDULED')`,
            [tutorId, batchId || null, studentId || null, title, description, startTime, endTime, location || 'Online', sessionType]
        );
        this.createdSessionId = res.id;

        // Add participants
        if (sessionType === 'ONE_TO_ONE' && studentId) {
            await db.run(`INSERT INTO session_participants (session_id, student_id) VALUES (?, ?)`, [this.createdSessionId, studentId]);
        } else if (sessionType === 'BATCH' && batchId) {
            const enrolled = await db.query(`SELECT student_id FROM enrollments WHERE batch_id = ? AND status = 'ACTIVE'`, [batchId]);
            for (const s of enrolled) {
                await db.run(`INSERT INTO session_participants (session_id, student_id) VALUES (?, ?)`, [this.createdSessionId, s.student_id]);
            }
        }

        // Notify observers
        await observer.notify('session_created', {
            title: 'New Session Scheduled',
            message: `Session '${title}' scheduled for ${startTime}.`,
            link: '/calendar',
            studentId: studentId
        });

        console.log(`⚡ [Command Pattern] ScheduleSessionCommand executed -> Session ID ${this.createdSessionId}`);
        return { success: true, sessionId: this.createdSessionId };
    }

    async undo() {
        if (this.createdSessionId) {
            await db.run(`DELETE FROM sessions WHERE id = ?`, [this.createdSessionId]);
            console.log(`↩️ [Command Pattern] ScheduleSessionCommand undone -> Session ID ${this.createdSessionId} deleted`);
            return { success: true };
        }
    }
}

// Concrete Command 2: Reschedule Session Command
class RescheduleSessionCommand extends ISessionCommand {
    constructor(sessionId, newStartTime, newEndTime) {
        super();
        this.sessionId = sessionId;
        this.newStartTime = newStartTime;
        this.newEndTime = newEndTime;
        this.previousStartTime = null;
        this.previousEndTime = null;
        this.previousStatus = null;
    }

    async execute() {
        const session = await db.get(`SELECT start_time, end_time, status, title FROM sessions WHERE id = ?`, [this.sessionId]);
        if (!session) throw new Error('Session not found');

        this.previousStartTime = session.start_time;
        this.previousEndTime = session.end_time;
        this.previousStatus = session.status;

        await db.run(
            `UPDATE sessions SET start_time = ?, end_time = ?, status = 'RESCHEDULED' WHERE id = ?`,
            [this.newStartTime, this.newEndTime, this.sessionId]
        );

        await observer.notify('session_rescheduled', {
            title: 'Session Rescheduled',
            message: `Session '${session.title}' moved to ${this.newStartTime}.`,
            link: '/calendar'
        });

        console.log(`⚡ [Command Pattern] RescheduleSessionCommand executed for Session ID ${this.sessionId}`);
        return { success: true, sessionId: this.sessionId };
    }

    async undo() {
        if (this.sessionId && this.previousStartTime) {
            await db.run(
                `UPDATE sessions SET start_time = ?, end_time = ?, status = ? WHERE id = ?`,
                [this.previousStartTime, this.previousEndTime, this.previousStatus, this.sessionId]
            );
            console.log(`↩️ [Command Pattern] RescheduleSessionCommand undone for Session ID ${this.sessionId}`);
            return { success: true };
        }
    }
}

// Concrete Command 3: Cancel Session Command
class CancelSessionCommand extends ISessionCommand {
    constructor(sessionId) {
        super();
        this.sessionId = sessionId;
        this.previousStatus = null;
    }

    async execute() {
        const session = await db.get(`SELECT status, title FROM sessions WHERE id = ?`, [this.sessionId]);
        if (!session) throw new Error('Session not found');

        this.previousStatus = session.status;
        await db.run(`UPDATE sessions SET status = 'CANCELLED' WHERE id = ?`, [this.sessionId]);

        await observer.notify('session_cancelled', {
            title: 'Session Cancelled',
            message: `Session '${session.title}' has been cancelled.`,
            link: '/calendar'
        });

        console.log(`⚡ [Command Pattern] CancelSessionCommand executed for Session ID ${this.sessionId}`);
        return { success: true };
    }

    async undo() {
        if (this.sessionId && this.previousStatus) {
            await db.run(`UPDATE sessions SET status = ? WHERE id = ?`, [this.previousStatus, this.sessionId]);
            console.log(`↩️ [Command Pattern] CancelSessionCommand undone for Session ID ${this.sessionId}`);
            return { success: true };
        }
    }
}

// Command Invoker
class CommandInvoker {
    constructor() {
        this.history = [];
    }

    async executeCommand(command) {
        const result = await command.execute();
        this.history.push(command);
        return result;
    }

    async undoLastCommand() {
        if (this.history.length === 0) {
            throw new Error('No commands in history to undo.');
        }
        const lastCommand = this.history.pop();
        return await lastCommand.undo();
    }
}

module.exports = {
    CommandInvoker,
    ScheduleSessionCommand,
    RescheduleSessionCommand,
    CancelSessionCommand
};
