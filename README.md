# Tutor Management System (TMS) — CSE327 Project-Group-3
Samia Zaman Pushpita 2232969042<br>
Sumaiya Basher Riyana 2221686642<br>
Sabbir Hossain 1731900042<br>
Rifaqat Islam Tasin 2211943042

> **A full-stack, web-based Tutor Management System built for CSE327 Software Engineering, supporting Independent Tutors, 1-on-1 Students, Batch Classes, Parents, and 8 Classic GoF Design Patterns.**

---

## ✨ Features & Role Dashboards

- 👨‍🏫 **Tutor Dashboard**: Create batches, enroll students, schedule sessions via Command pattern, upload materials via Adapter pattern, grade assignments, build quizzes, mark attendance, record session logs, publish announcements, and chat with students/parents.
- 🎓 **Student Dashboard**: View personal schedule, submit assignments, take autograded online quizzes (Factory pattern), track attendance, view session logs, evaluate progress dynamically (Strategy pattern), and request schedule changes.
- 👨‍👩‍👧 **Parent Dashboard**: Monitor child academic score, attendance rate, assignment/quiz grades, session logs, announcements, and direct chat with tutor.
- 🧩 **8 Classic GoF Design Patterns**: Dedicated demonstration suite showing live pattern execution, parameters, Java source code, and TypeScript implementation.

---

## ⚡ Quick Start Guide

### Prerequisites
- Node.js (v18+) and npm installed.

### 1. ⚡ Quickest 1-Click Launch (GUI Popup Control Panel)
Simply **double-click** either launcher file in the project root:
- 🖥️ **`DOUBLE_CLICK_TO_LAUNCH.bat`**: Pops up a native Windows GUI Control Panel with buttons to start servers, seed data, run design pattern proofs, and open the web portal!
- 🚀 **`LAUNCH_APPLICATION.bat`**: Automatically seeds data, starts backend + frontend servers, and opens your browser directly to `http://127.0.0.1:3000`!

---

### 2. Manual Command Line Launch (Alternative)
If you prefer running commands manually:
```bash
# Install dependencies
npm run setup

# Seed database
npm run seed

# Start Express Backend & React Frontend
npm run dev
```

Open your browser at **`http://127.0.0.1:3000`**.

---

## 🔐 Pre-Seeded Demo Credentials

| Role | Name | Email | Password |
|---|---|---|---|
| 👨‍🏫 **Tutor** | Dr. Alan Turing | `tutor@tms.edu` | `password123` |
| 🎓 **Student (1-on-1)** | Rahul Sharma | `rahul@student.tms.edu` | `password123` |
| 🎓 **Student (Batch A)** | Ananya Roy | `ananya@student.tms.edu` | `password123` |
| 👨‍👩‍👧 **Parent** | Mrs. Sunita Sharma | `mrs.sharma@parent.tms.edu` | `password123` |

*(Tip: Click any 1-Click Demo Button on the login page for instant faculty presentation!)*

---

## 📐 Implemented GoF Design Patterns

1. **Factory Method Pattern** (`UserAndAssessmentFactory`)
2. **Singleton Pattern** (`DatabaseService`)
3. **Observer Pattern** (`NotificationPublisher`)
4. **Strategy Pattern** (`GradingStrategy`)
5. **Command Pattern** (`SessionCommand`)
6. **Facade Pattern** (`DashboardFacade`)
7. **Adapter Pattern** (`StorageAdapter`)
8. **State Pattern** (`SessionState`)

See [`PRESENTATION_GUIDE.md`](./PRESENTATION_GUIDE.md) and [`DESIGN_PATTERNS.md`](./DESIGN_PATTERNS.md) for faculty demonstration scripts and UML diagrams.
