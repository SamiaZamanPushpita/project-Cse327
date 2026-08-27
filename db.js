/**
 * DESIGN PATTERN IMPLEMENTATION: Singleton Pattern
 * 
 * Pattern: Singleton
 * Purpose: Ensures that only a single instance of the SQLite Database connection 
 *          exists throughout the lifespan of the backend application, preventing resource leaks
 *          and race conditions on file-level locks.
 */

const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

class DatabaseService {
    static instance = null;

    constructor() {
        if (DatabaseService.instance) {
            return DatabaseService.instance;
        }

        const dbPath = path.resolve(__dirname, 'tms_database.sqlite');
        this.db = new sqlite3.Database(dbPath, (err) => {
            if (err) {
                console.error('❌ Failed to connect to SQLite Database:', err.message);
            } else {
                console.log('✅ Connected to SQLite Database at:', dbPath);
            }
        });

        // Initialize table schema
        this.initSchema();

        DatabaseService.instance = this;
    }

    /**
     * Singleton accessor method
     */
    static getInstance() {
        if (!DatabaseService.instance) {
            DatabaseService.instance = new DatabaseService();
        }
        return DatabaseService.instance;
    }

    initSchema() {
        const schemaPath = path.resolve(__dirname, 'schema.sql');
        const schemaSql = fs.readFileSync(schemaPath, 'utf-8');
        this.db.exec(schemaSql, (err) => {
            if (err) {
                console.error('❌ Schema initialization error:', err.message);
            } else {
                console.log('✅ SQLite Schema initialized successfully.');
            }
        });
    }

    // Promisified query helpers
    query(sql, params = []) {
        return new Promise((resolve, reject) => {
            this.db.all(sql, params, (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            });
        });
    }

    get(sql, params = []) {
        return new Promise((resolve, reject) => {
            this.db.get(sql, params, (err, row) => {
                if (err) reject(err);
                else resolve(row);
            });
        });
    }

    run(sql, params = []) {
        return new Promise((resolve, reject) => {
            this.db.run(sql, params, function (err) {
                if (err) reject(err);
                else resolve({ id: this.lastID, changes: this.changes });
            });
        });
    }
}

// Export singleton instance
module.exports = DatabaseService.getInstance();
