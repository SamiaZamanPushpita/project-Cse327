package com.tms.patterns.singleton;

/**
 * DESIGN PATTERN IMPLEMENTATION: Singleton Pattern (Java)
 * 
 * Pattern: Singleton (Creational)
 * Purpose: Ensures a class has only one instance and provides a global point of access to it.
 *          Implements double-checked locking for thread safety.
 */
public class DatabaseService {
    private static volatile DatabaseService instance;
    private String connectionUrl;

    private DatabaseService() {
        // Private constructor prevents direct instantiation
        this.connectionUrl = "jdbc:sqlite:tms_database.sqlite";
        System.out.println("✅ Java Singleton: Connected to Database at " + connectionUrl);
    }

    public static DatabaseService getInstance() {
        if (instance == null) {
            synchronized (DatabaseService.class) {
                if (instance == null) {
                    instance = new DatabaseService();
                }
            }
        }
        return instance;
    }

    public void executeQuery(String sql) {
        System.out.println("Executing SQL Query via Singleton: " + sql);
    }
}
