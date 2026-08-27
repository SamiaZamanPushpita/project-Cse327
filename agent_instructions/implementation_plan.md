# Tutor Management System — Implementation Plan

Build a comprehensive, modern web application for independent tutors, students, and parents with role-based access control, rich interactive dashboards, and **8 classic design patterns** explicitly integrated into the backend architecture.

## User Review Required

> [!IMPORTANT]
> **Key Architecture & Stack Choice**:
> - **Backend**: Node.js / Express with SQLite database and modular MVC architecture.
> - **Frontend**: React (Vite + TypeScript) with Tailwind CSS / CSS design system, Lucide icons, responsive navigation, dark/light presentation theme, integrated calendar, interactive quiz builder/runner, assignment submitter/grader, progress graphs, and real-time chat.
> - **Design Patterns**: 8 classic GoF design patterns explicitly implemented in `backend/patterns/` with clean abstractions, comments, and dedicated API demonstrations.
> - **Deliverables**: Complete app, SQLite seed script, `PRESENTATION_GUIDE.md`, `DESIGN_PATTERNS.md`, and `DEMO_REPORT.md`.

## Open Questions

> [!NOTE]
> None at this stage. All requirements from `One-shot Project Completion Prompt.txt` and `Further Agentic Instructions.txt` have been analyzed and mapped out.

## Proposed Design Patterns (8 GoF Classic Patterns)

1. **Observer Pattern** (`backend/patterns/observer/`):
   - `SessionSubject` / `NotificationPublisher` notifies `StudentObserver`, `ParentObserver`, and `ProgressTrackerObserver` when sessions are created/changed, grades published, or announcements posted.
2. **Factory Method Pattern** (`backend/patterns/factory/`):
   - `UserFactory` creates specialized user roles (`TutorUser`, `StudentUser`, `ParentUser`).
   - `AssessmentFactory` creates `Quiz` vs `Assignment` instances with specialized validation and behavior.
3. **Singleton Pattern** (`backend/patterns/singleton/`):
   - `DatabaseService` & `AppConfigManager` ensure single shared connection pool and configuration across the app.
4. **Strategy Pattern** (`backend/patterns/strategy/`):
   - `GradingStrategy` (`WeightedAverageStrategy`, `StandardPercentageStrategy`, `AttendanceWeightedStrategy`) for calculating dynamic student overall grades and progress metrics.
5. **Command Pattern** (`backend/patterns/command/`):
   - `ISessionCommand` (`ScheduleSessionCommand`, `RescheduleSessionCommand`, `CancelSessionCommand`, `ApproveScheduleChangeCommand`) encapsulates session lifecycle changes with execute & undo functionality.
6. **Facade Pattern** (`backend/patterns/facade/`):
   - `DashboardFacade` (`TutorDashboardFacade`, `StudentDashboardFacade`, `ParentDashboardFacade`) aggregates complex subsystem calls (batches, calendar, materials, assignments, quizzes, attendance, logs, notifications) into clean dashboard view models.
7. **Adapter Pattern** (`backend/patterns/adapter/`):
   - `IStorageAdapter` (`LocalStorageAdapter`, `MockCloudStorageAdapter`) standardizes material file uploads and storage providers.
8. **State Pattern** (`backend/patterns/state/`):
   - `SessionState` (`ScheduledState`, `CompletedState`, `CancelledState`, `RescheduledState`) encapsulates status transitions and valid actions per session state.

---

## Proposed System Architecture & Components

### Component 1: Database & Seed Data (`/backend/database/`)
- `schema.sql`: Full relational schema covering Users, Tutors, Students, Parents, ParentStudent links, Batches, Enrollments, Sessions, SessionParticipants, SessionLogs, Materials, Assignments, Submissions, Quizzes, QuizQuestions, QuizAttempts, Attendance, Announcements, Notifications, Conversations, Messages, and ScheduleChangeRequests.
- `seed.js`: Realistic demonstration seed dataset with 1 Tutor, 4 Students, 2 Parents, 2 Batches, 1-on-1 tutoring sessions, assignments, quiz questions, submissions, attendance logs, announcements, and messages.

### Component 2: Backend API & Patterns (`/backend/`)
- Controllers & Services for Authentication, Users, Batches, Sessions, Materials, Assignments, Quizzes, Attendance, Session Logs, Announcements, Notifications, Chat, and Progress.
- Dedicated `backend/patterns/` directory containing clean, documented implementations of the 8 design patterns.
- Express API server running on port 5000.

### Component 3: Frontend Web Application (`/frontend/`)
- React + Vite + TypeScript application with modern education/productivity UI design.
- Role switcher on login (Tutor, Student, Parent demo credentials pre-filled).
- **Tutor View**:
  - Overview Dashboard (Stats cards, quick actions, upcoming sessions, recent activities).
  - Batches & 1-on-1 Students Management.
  - Interactive Session Calendar (Schedule, Reschedule, Cancel).
  - Learning Materials Library (Upload, categorize, share).
  - Assignments & Grading Hub (Create, inspect submissions, grade & give feedback).
  - Quiz Builder & Evaluation Center (Create quiz questions, view student scores).
  - Attendance Marker (Batch & 1-on-1 session attendance register).
  - Session Log Tracker (Topics, homework, notes).
  - Announcements Publisher.
  - Student Progress & Performance Analytics.
  - Real-Time Messaging / Chat.
- **Student View**:
  - Student Dashboard & Calendar.
  - Course Materials Download.
  - Assignment Submissions.
  - Interactive Online Quiz Runner with timer & instant evaluation.
  - Grades, Feedback & Progress Overview.
  - Attendance History & Session Logs.
  - Schedule Change Request Submitter.
  - Chat with Tutor.
- **Parent View**:
  - Linked Child Selector & Performance Overview.
  - Child Calendar & Session Attendance log.
  - Child Assignment & Quiz Grades + Feedback.
  - Announcements & Direct Chat with Tutor.
- In-App Notifications Dropdown across all pages.
- Design Patterns Demonstration Modal / Page showing faculty live execution of patterns in the backend.

### Component 4: Presentation & Documentation (`/docs/` & root)
- `PRESENTATION_GUIDE.md`: Step-by-step faculty presentation playbook (demonstration order, role switching, key design patterns to highlight).
- `DESIGN_PATTERNS.md`: Full architectural breakdown of the 8 implemented design patterns with UML diagrams and line references.
- `DEMO_REPORT.md`: Printable semester project report with feature overview, screenshots layout, and system architecture.

---

## Verification Plan

### Automated Verification
- Start API server and frontend server.
- Run automated API endpoint test suite (`npm run test:api`) covering:
  - Auth flow (login, token validation, role check).
  - Design Pattern executions (Factory, Strategy, Observer, Command, Facade, Adapter, State, Singleton).
  - CRUD operations for Batches, Sessions, Assignments, Quizzes, Attendance, and Messages.

### Manual Verification
- Test end-to-end user flows in the web UI for Tutor, Student, and Parent roles.
- Verify role switching, session scheduling, assignment grading, quiz taking, schedule change requests, and chat.
- Verify notification delivery when actions occur.
