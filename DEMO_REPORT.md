# Tutor Management System — Semester Project Demo Report

**Course**: CSE327 Software Engineering  
**Project**: Tutor Management System (TMS)  
**Deliverable**: Prototype Web Application & Design Patterns Report  

---

## 📌 1. Project Overview & Scope

The **Tutor Management System (TMS)** is a web-based management application designed for independent tutors teaching 1-on-1 private students and group batch classes. 

### Core Roles Supported
1. **Tutor**: Manages batches, 1-on-1 students, session calendar, learning materials, assignments, autograded quizzes, attendance registers, session logs, announcements, and direct chat.
2. **Student**: Accesses personal schedule, submits assignments, takes autograded online quizzes, reviews grades/feedback, checks session logs, requests schedule changes, and chats with tutor.
3. **Parent**: Monitors linked child academic progress, attendance rates, graded assignments, quiz results, session logs, and direct tutor communication.

---

## 🏗️ 2. System Architecture

- **Backend**: Node.js / Express API Server (Layered MVC)
- **Database**: Relational SQLite Database (`schema.sql` with FK constraints and indices)
- **Frontend**: React (Vite + TypeScript) + Tailwind CSS + Lucide Icons
- **Design Patterns Suite**: 8 Classic GoF Design Patterns explicitly integrated in backend + standalone Java source code (`docs/java_patterns/`).

---

## 🧪 3. Key Feature Matrix

| Feature Module | Tutor Capabilities | Student Capabilities | Parent Capabilities |
|---|---|---|---|
| **Authentication** | RBAC Login, Profile | RBAC Login, Profile | RBAC Login, Linked Child |
| **Batch & Students** | Create batches, enroll students | View enrolled batches | View child's batch |
| **Session Calendar** | Schedule, Reschedule, Cancel, Undo | View schedule, Request change | View child schedule |
| **Materials Library** | Upload files (Adapter Pattern) | Download materials | N/A |
| **Assignments & Quizzes** | Create, grade submissions, build quizzes | Submit work, take online quiz | View scores & feedback |
| **Attendance & Logs** | Mark present/absent, record topics | View attendance history | View child attendance & logs |
| **Messaging & Alerts** | In-app alerts, direct chat | Notifications, chat | Alerts, chat with tutor |

---

## 🚀 4. Seed Demo Credentials

| Role | Name | Email | Password |
|---|---|---|---|
| **Tutor** | Dr. Alan Turing | `tutor@tms.edu` | `password123` |
| **Student (1-on-1)** | Rahul Sharma | `rahul@student.tms.edu` | `password123` |
| **Student (Batch A)** | Ananya Roy | `ananya@student.tms.edu` | `password123` |
| **Parent** | Mrs. Sunita Sharma | `mrs.sharma@parent.tms.edu` | `password123` |
