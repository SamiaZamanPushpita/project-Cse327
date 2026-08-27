/**
 * DESIGN PATTERN IMPLEMENTATION: Observer Pattern
 * 
 * Pattern: Observer (Behavioral)
 * Purpose: Defines a one-to-many dependency between objects so that when one object (Subject) 
 *          changes state, all its dependents (Observers) are automatically notified and updated.
 *          Used for decouple notification broadcasting (in-app notifications, parent alerts, progress updates).
 */

const db = require('../../database/db');

// Subject Interface / Class
class EventSubject {
    constructor() {
        this.observers = [];
    }

    subscribe(observer) {
        if (!this.observers.includes(observer)) {
            this.observers.push(observer);
        }
    }

    unsubscribe(observer) {
        this.observers = this.observers.filter(obs => obs !== observer);
    }

    async notify(eventType, data) {
        console.log(`📡 [Observer Pattern] Subject publishing event '${eventType}' to ${this.observers.length} observers.`);
        for (const observer of this.observers) {
            try {
                await observer.update(eventType, data);
            } catch (err) {
                console.error(`Error in observer ${observer.constructor.name}:`, err.message);
            }
        }
    }
}

// Observer 1: Database Notification Observer
class DatabaseNotificationObserver {
    async update(eventType, data) {
        if (data.userIds && data.userIds.length > 0) {
            for (const userId of data.userIds) {
                await db.run(
                    `INSERT INTO notifications (user_id, title, message, type, link) VALUES (?, ?, ?, ?, ?)`,
                    [userId, data.title || 'System Notification', data.message || '', data.type || 'INFO', data.link || '/dashboard']
                );
            }
            console.log(`   └─ [DatabaseNotificationObserver] Persisted ${data.userIds.length} notifications to SQLite DB.`);
        }
    }
}

// Observer 2: Parent Alert Observer
class ParentAlertObserver {
    async update(eventType, data) {
        if (['grade_published', 'session_cancelled', 'attendance_absent'].includes(eventType)) {
            if (data.studentId) {
                // Find linked parents
                const parents = await db.query(
                    `SELECT parent_id, user_id FROM parent_students ps 
                     JOIN parents p ON ps.parent_id = p.id 
                     WHERE ps.student_id = ?`,
                    [data.studentId]
                );

                for (const p of parents) {
                    await db.run(
                        `INSERT INTO notifications (user_id, title, message, type, link) VALUES (?, ?, ?, ?, ?)`,
                        [p.user_id, `Parent Alert: ${data.title}`, `Update regarding your child: ${data.message}`, 'ACADEMIC', '/parent-dashboard']
                    );
                }
                console.log(`   └─ [ParentAlertObserver] Alerted ${parents.length} parents regarding studentId ${data.studentId}.`);
            }
        }
    }
}

// Observer 3: System Audit Logger Observer
class SystemAuditLoggerObserver {
    async update(eventType, data) {
        console.log(`   └─ [SystemAuditLoggerObserver] AUDIT LOG: Event='${eventType}', Timestamp='${new Date().toISOString()}', Payload=${JSON.stringify(data)}`);
    }
}

// Singleton Event Bus Subject Instance
class NotificationPublisher extends EventSubject {
    static instance = null;

    constructor() {
        super();
        if (NotificationPublisher.instance) {
            return NotificationPublisher.instance;
        }

        // Register default observers
        this.subscribe(new DatabaseNotificationObserver());
        this.subscribe(new ParentAlertObserver());
        this.subscribe(new SystemAuditLoggerObserver());

        NotificationPublisher.instance = this;
    }

    static getInstance() {
        if (!NotificationPublisher.instance) {
            NotificationPublisher.instance = new NotificationPublisher();
        }
        return NotificationPublisher.instance;
    }
}

module.exports = NotificationPublisher.getInstance();
