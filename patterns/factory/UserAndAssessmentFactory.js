/**
 * DESIGN PATTERN IMPLEMENTATION: Factory Method Pattern
 * 
 * Pattern: Factory Method (Creational)
 * Purpose: Defines an interface for creating objects, but lets subclasses or factory methods
 *          decide which class to instantiate. Solves the issue of direct object instantiation 
 *          for different user roles and educational assessment types.
 */

// Base User Class
class BaseUser {
    constructor(data) {
        this.id = data.id;
        this.name = data.name;
        this.email = data.email;
        this.role = data.role;
    }

    getPermissions() {
        return [];
    }
}

class TutorUser extends BaseUser {
    constructor(data) {
        super(data);
        this.specialization = data.specialization || 'General Subject Tutor';
        this.bio = data.bio || '';
    }

    getPermissions() {
        return ['CREATE_BATCH', 'SCHEDULE_SESSION', 'UPLOAD_MATERIAL', 'CREATE_ASSIGNMENT', 'GRADE_SUBMISSION', 'CREATE_QUIZ', 'MARK_ATTENDANCE'];
    }
}

class StudentUser extends BaseUser {
    constructor(data) {
        super(data);
        this.institution = data.institution || 'University';
        this.academicLevel = data.academic_level || 'Undergraduate';
    }

    getPermissions() {
        return ['VIEW_SCHEDULE', 'SUBMIT_ASSIGNMENT', 'ATTEMPT_QUIZ', 'VIEW_GRADES', 'REQUEST_SCHEDULE_CHANGE', 'CHAT_TUTOR'];
    }
}

class ParentUser extends BaseUser {
    constructor(data) {
        super(data);
        this.occupation = data.occupation || 'Guardian';
    }

    getPermissions() {
        return ['VIEW_CHILD_SCHEDULE', 'VIEW_CHILD_PROGRESS', 'VIEW_CHILD_ATTENDANCE', 'CHAT_TUTOR'];
    }
}

// User Factory
class UserFactory {
    static createUser(data) {
        switch (data.role) {
            case 'TUTOR':
                return new TutorUser(data);
            case 'STUDENT':
                return new StudentUser(data);
            case 'PARENT':
                return new ParentUser(data);
            default:
                throw new Error(`Unknown user role: ${data.role}`);
        }
    }
}

// Assessment Classes & Factory
class QuizAssessment {
    constructor(data) {
        this.id = data.id;
        this.title = data.title;
        this.timeLimitMins = data.time_limit_mins || 30;
        this.totalMarks = data.total_marks || 100;
        this.type = 'QUIZ';
    }

    calculateGrade(submittedAnswers, answerKey) {
        // Automatic MCQ Grading logic
        let score = 0;
        for (const [qId, ans] of Object.entries(submittedAnswers)) {
            if (answerKey[qId] && answerKey[qId].correct === ans) {
                score += answerKey[qId].marks || 10;
            }
        }
        return score;
    }
}

class AssignmentAssessment {
    constructor(data) {
        this.id = data.id;
        this.title = data.title;
        this.deadline = data.deadline;
        this.totalMarks = data.total_marks || 100;
        this.type = 'ASSIGNMENT';
    }

    calculateGrade(manualScore, feedback) {
        return {
            score: Math.min(manualScore, this.totalMarks),
            feedback: feedback || 'Graded by tutor.'
        };
    }
}

class AssessmentFactory {
    static createAssessment(type, data) {
        if (type === 'QUIZ') {
            return new QuizAssessment(data);
        } else if (type === 'ASSIGNMENT') {
            return new AssignmentAssessment(data);
        }
        throw new Error(`Unsupported assessment type: ${type}`);
    }
}

module.exports = {
    UserFactory,
    AssessmentFactory,
    TutorUser,
    StudentUser,
    ParentUser,
    QuizAssessment,
    AssignmentAssessment
};
