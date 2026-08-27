package com.tms.patterns.factory;

import java.util.*;

/**
 * DESIGN PATTERN IMPLEMENTATION: Factory Method Pattern (Java)
 * 
 * Pattern: Factory Method (Creational)
 * Purpose: Defines an interface for creating objects, but lets subclasses or factory methods
 *          decide which class to instantiate for User types and Assessment types.
 */

abstract class User {
    protected int id;
    protected String name;
    protected String email;
    protected String role;

    public User(int id, String name, String email, String role) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.role = role;
    }

    public abstract List<String> getPermissions();
}

class TutorUser extends User {
    private String specialization;

    public TutorUser(int id, String name, String email, String specialization) {
        super(id, name, email, "TUTOR");
        this.specialization = specialization;
    }

    @Override
    public List<String> getPermissions() {
        return Arrays.asList("CREATE_BATCH", "SCHEDULE_SESSION", "UPLOAD_MATERIAL", "CREATE_ASSIGNMENT", "GRADE_SUBMISSION", "CREATE_QUIZ", "MARK_ATTENDANCE");
    }
}

class StudentUser extends User {
    private String institution;

    public StudentUser(int id, String name, String email, String institution) {
        super(id, name, email, "STUDENT");
        this.institution = institution;
    }

    @Override
    public List<String> getPermissions() {
        return Arrays.asList("VIEW_SCHEDULE", "SUBMIT_ASSIGNMENT", "ATTEMPT_QUIZ", "VIEW_GRADES", "REQUEST_SCHEDULE_CHANGE", "CHAT_TUTOR");
    }
}

class ParentUser extends User {
    private String occupation;

    public ParentUser(int id, String name, String email, String occupation) {
        super(id, name, email, "PARENT");
        this.occupation = occupation;
    }

    @Override
    public List<String> getPermissions() {
        return Arrays.asList("VIEW_CHILD_SCHEDULE", "VIEW_CHILD_PROGRESS", "VIEW_CHILD_ATTENDANCE", "CHAT_TUTOR");
    }
}

// User Factory
public class UserAndAssessmentFactory {
    public static User createUser(int id, String name, String email, String role, String extraDetail) {
        switch (role.toUpperCase()) {
            case "TUTOR":
                return new TutorUser(id, name, email, extraDetail);
            case "STUDENT":
                return new StudentUser(id, name, email, extraDetail);
            case "PARENT":
                return new ParentUser(id, name, email, extraDetail);
            default:
                throw new IllegalArgumentException("Unknown role: " + role);
        }
    }
}
