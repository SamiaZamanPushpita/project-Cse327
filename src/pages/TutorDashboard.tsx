import React, { useEffect, useState } from 'react';
import {
  Users,
  Calendar,
  FileText,
  HelpCircle,
  CheckCircle,
  Plus,
  BookOpen,
  Megaphone,
  Clock,
  Award,
  ChevronRight,
  Send,
  Undo2,
  Download,
  ClipboardList,
  CheckSquare,
  Check,
  X,
  Search,
  UserPlus,
  Video,
  Link,
  Trash2,
  PlusCircle
} from 'lucide-react';
import { tutorApi } from '../services/api';
import { CalendarView } from '../components/CalendarView';
import { UserRole } from '../types';

interface TutorDashboardProps {
  role: UserRole;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const TutorDashboard: React.FC<TutorDashboardProps> = ({ role, activeTab, setActiveTab }) => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Modals state
  const [showBatchModal, setShowBatchModal] = useState(false);
  const [showEnrollModal, setShowEnrollModal] = useState<number | null>(null);
  const [showMaterialModal, setShowMaterialModal] = useState(false);
  const [showAssignmentModal, setShowAssignmentModal] = useState(false);
  const [showQuizModal, setShowQuizModal] = useState(false);
  const [showAnnouncementModal, setShowAnnouncementModal] = useState(false);
  const [showLogModal, setShowLogModal] = useState<number | null>(null);

  // Form Inputs
  const [batchName, setBatchName] = useState('');
  const [batchSubject, setBatchSubject] = useState('Computer Science');
  const [batchSchedule, setBatchSchedule] = useState('Sun & Tue | 06:00 PM');
  
  const [matTitle, setMatTitle] = useState('');
  const [matDesc, setMatDesc] = useState('');

  const [assignTitle, setAssignTitle] = useState('');
  const [assignDesc, setAssignDesc] = useState('');
  const [assignDeadline, setAssignDeadline] = useState('');

  const [quizTitle, setQuizTitle] = useState('');
  const [quizDesc, setQuizDesc] = useState('');
  const [quizTime, setQuizTime] = useState(20);
  const [quizType, setQuizType] = useState<'MCQ' | 'VIDEO_CALL'>('MCQ');
  const [quizMeetLink, setQuizMeetLink] = useState('');
  const [quizMeetInstructions, setQuizMeetInstructions] = useState('');
  const [quizQuestions, setQuizQuestions] = useState([
    { questionText: '', options: ['', '', '', ''], correctAnswer: '', marks: 10 }
  ]);
  const [quizSubmissions, setQuizSubmissions] = useState<any[]>([]);
  const [showQuizSubmissions, setShowQuizSubmissions] = useState(false);

  const [annTitle, setAnnTitle] = useState('');
  const [annContent, setAnnContent] = useState('');

  const [topicsCovered, setTopicsCovered] = useState('');
  const [homework, setHomework] = useState('');
  const [notes, setNotes] = useState('');

  const [selectedStudentForEnroll, setSelectedStudentForEnroll] = useState<number>(1);
  const [allStudents, setAllStudents] = useState<any[]>([]);

  // Attendance Marking State
  const [selectedAttendanceSession, setSelectedAttendanceSession] = useState<number>(1);
  const [attendanceRecords, setAttendanceRecords] = useState<Record<number, string>>({});

  useEffect(() => {
    loadDashboard();
    loadAllStudents();
  }, []);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      const res = await tutorApi.getDashboard();
      if (res.success) {
        setData(res.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const loadAllStudents = async () => {
    try {
      const res = await tutorApi.getStudents();
      if (res.success) {
        setAllStudents(res.students);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleCreateBatch = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await tutorApi.createBatch({ name: batchName, subject: batchSubject, scheduleInfo: batchSchedule });
      setShowBatchModal(false);
      setBatchName('');
      loadDashboard();
      alert('Batch created successfully!');
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleEnrollStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!showEnrollModal) return;
    try {
      await tutorApi.enrollStudent(showEnrollModal, selectedStudentForEnroll);
      setShowEnrollModal(null);
      loadDashboard();
      alert('Student enrolled into batch!');
    } catch (err: any) {
      alert(err.message || 'Student already enrolled.');
    }
  };

  const handleUploadMaterial = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await tutorApi.uploadMaterial({ title: matTitle, description: matDesc, batchId: 1 });
      setShowMaterialModal(false);
      setMatTitle('');
      setMatDesc('');
      loadDashboard();
      alert('Material published via Storage Adapter Pattern!');
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleCreateAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await tutorApi.createAssignment({ title: assignTitle, description: assignDesc, deadline: assignDeadline, batchId: 1 });
      setShowAssignmentModal(false);
      setAssignTitle('');
      setAssignDesc('');
      loadDashboard();
      alert('Assignment created & published!');
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleAddQuestion = () => {
    setQuizQuestions(prev => [...prev, { questionText: '', options: ['', '', '', ''], correctAnswer: '', marks: 10 }]);
  };

  const handleRemoveQuestion = (idx: number) => {
    setQuizQuestions(prev => prev.filter((_, i) => i !== idx));
  };

  const handleQuestionChange = (idx: number, field: string, value: any) => {
    setQuizQuestions(prev => prev.map((q, i) => i === idx ? { ...q, [field]: value } : q));
  };

  const handleOptionChange = (qIdx: number, optIdx: number, value: string) => {
    setQuizQuestions(prev => prev.map((q, i) => {
      if (i !== qIdx) return q;
      const newOpts = [...q.options];
      newOpts[optIdx] = value;
      return { ...q, options: newOpts };
    }));
  };

  const handleCreateQuiz = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (quizType === 'MCQ') {
        // Validate all questions have text and correct answer
        for (const q of quizQuestions) {
          if (!q.questionText.trim()) { alert('All questions must have text.'); return; }
          if (!q.correctAnswer.trim()) { alert('All questions must have a correct answer.'); return; }
        }
        const formattedQuestions = quizQuestions.map(q => ({
          questionText: q.questionText,
          questionType: 'MCQ',
          options: q.options.filter(o => o.trim() !== ''),
          correctAnswer: q.correctAnswer,
          marks: q.marks
        }));
        await tutorApi.createQuiz({
          title: quizTitle,
          description: quizDesc,
          timeLimitMins: quizTime,
          batchId: 1,
          quizType: 'MCQ',
          questions: formattedQuestions
        });
        alert(`MCQ Quiz created! ${formattedQuestions.length} questions, ${formattedQuestions.reduce((s, q) => s + q.marks, 0)} total marks.`);
      } else {
        if (!quizMeetLink.trim()) { alert('Please provide a meeting link.'); return; }
        await tutorApi.createQuiz({
          title: quizTitle,
          description: quizMeetInstructions || quizDesc,
          timeLimitMins: quizTime,
          batchId: 1,
          quizType: 'VIDEO_CALL',
          meetLink: quizMeetLink,
          questions: []
        });
        alert('Video Call Exam published! Students can submit their paper after the call.');
      }
      setShowQuizModal(false);
      setQuizTitle('');
      setQuizDesc('');
      setQuizMeetLink('');
      setQuizMeetInstructions('');
      setQuizType('MCQ');
      setQuizQuestions([{ questionText: '', options: ['', '', '', ''], correctAnswer: '', marks: 10 }]);
      loadDashboard();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handlePostAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await tutorApi.postAnnouncement({ title: annTitle, content: annContent, batchId: 1 });
      setShowAnnouncementModal(false);
      setAnnTitle('');
      setAnnContent('');
      loadDashboard();
      alert('Announcement published & observers notified!');
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleSaveSessionLog = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!showLogModal) return;
    try {
      await tutorApi.saveSessionLog(showLogModal, {
        topicsCovered,
        homework,
        notes
      });
      setShowLogModal(null);
      setTopicsCovered('');
      setHomework('');
      setNotes('');
      loadDashboard();
      alert('Session log recorded successfully!');
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleUndoSessionCommand = async () => {
    try {
      const res = await tutorApi.undoLastCommand();
      alert(`Command Undone: ${res.message}`);
      loadDashboard();
    } catch (err: any) {
      alert(err.message || 'No command in stack to undo.');
    }
  };

  const handleGradeSubmission = async (subId: number) => {
    const scoreStr = prompt('Enter score (0 - 100):', '95');
    if (!scoreStr) return;
    const feedback = prompt('Enter feedback text:', 'Great work on design pattern implementation!') || '';
    try {
      await tutorApi.gradeSubmission(subId, parseFloat(scoreStr), feedback);
      alert('Submission graded & student/parent notified!');
      loadDashboard();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleScheduleRequest = async (reqId: number, status: 'APPROVED' | 'REJECTED') => {
    try {
      await tutorApi.handleScheduleRequest(reqId, status);
      alert(`Schedule request ${status.toLowerCase()}!`);
      loadDashboard();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleSaveAttendance = async () => {
    const records = Object.entries(attendanceRecords).map(([studentId, status]) => ({
      studentId: parseInt(studentId),
      status,
      notes: 'Marked by Dr. Turing'
    }));

    if (records.length === 0) {
      alert('Please mark attendance for at least one student.');
      return;
    }

    try {
      await tutorApi.markAttendance(selectedAttendanceSession, records);
      alert('Attendance register updated successfully!');
      loadDashboard();
    } catch (err: any) {
      alert(err.message);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-xs text-slate-400">Loading Tutor Control Panel...</div>;
  }

  const summary = data?.summary || {};

  return (
    <div className="space-y-6">
      
      {/* Top Luminous Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-brand-600 via-purple-600 to-indigo-700 rounded-3xl p-6 text-white shadow-2xl glow-brand">
        <div>
          <span className="text-[10px] uppercase font-bold tracking-wider px-3 py-1 rounded-full bg-white/20 backdrop-blur-md inline-block mb-2">
            Tutor Control Panel (Facade Pattern)
          </span>
          <h1 className="text-2xl font-bold font-display leading-tight">
            Dr. Alan Turing — Academic Hub
          </h1>
          <p className="text-xs text-brand-100 mt-1 max-w-xl">
            Centralized management for group batches, 1-on-1 students, calendar, assignments, autograded quizzes, attendance, session logs, and messaging.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setShowBatchModal(true)}
            className="px-3.5 py-2 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>New Batch</span>
          </button>
          <button
            onClick={() => setShowMaterialModal(true)}
            className="px-3.5 py-2 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition-all"
          >
            <BookOpen className="w-4 h-4" />
            <span>Upload Material</span>
          </button>
          <button
            onClick={handleUndoSessionCommand}
            className="px-3.5 py-2 bg-rose-500/80 hover:bg-rose-600 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition-all shadow-md"
            title="Command Pattern Undo Stack"
          >
            <Undo2 className="w-4 h-4" />
            <span>Undo Session Cmd</span>
          </button>
        </div>
      </div>

      {/* Overview Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="glass-card p-4 rounded-2xl space-y-1">
          <span className="text-[11px] font-semibold text-slate-400">Active Batches</span>
          <div className="text-2xl font-bold font-display text-white">
            {summary.totalBatches || 0}
          </div>
          <span className="text-[10px] text-emerald-400 font-medium">Group Classes</span>
        </div>

        <div className="glass-card p-4 rounded-2xl space-y-1">
          <span className="text-[11px] font-semibold text-slate-400">1-on-1 Students</span>
          <div className="text-2xl font-bold font-display text-white">
            {summary.totalOneToOneStudents || 0}
          </div>
          <span className="text-[10px] text-purple-400 font-medium">Direct Mentorship</span>
        </div>

        <div className="glass-card p-4 rounded-2xl space-y-1">
          <span className="text-[11px] font-semibold text-slate-400">Upcoming Sessions</span>
          <div className="text-2xl font-bold font-display text-white">
            {summary.upcomingSessionsCount || 0}
          </div>
          <span className="text-[10px] text-brand-400 font-medium">Scheduled</span>
        </div>

        <div className="glass-card p-4 rounded-2xl space-y-1">
          <span className="text-[11px] font-semibold text-slate-400">Pending Grades</span>
          <div className="text-2xl font-bold font-display text-white">
            {summary.pendingGradesCount || 0}
          </div>
          <span className="text-[10px] text-amber-400 font-medium">Requires Tutor Action</span>
        </div>

        <div className="glass-card p-4 rounded-2xl space-y-1">
          <span className="text-[11px] font-semibold text-slate-400">Change Requests</span>
          <div className="text-2xl font-bold font-display text-white">
            {summary.pendingScheduleRequestsCount || 0}
          </div>
          <span className="text-[10px] text-blue-400 font-medium">Student Requests</span>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* FULL DEDICATED TAB VIEWS ROUTER */}
      {/* ========================================================================= */}

      {/* TAB 1: BATCHES & STUDENTS */}
      {activeTab === 'batches' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold font-display text-white flex items-center space-x-2">
              <Users className="w-5 h-5 text-brand-500" />
              <span>Group Batches & Student Enrollments</span>
            </h2>
            <button
              onClick={() => setShowBatchModal(true)}
              className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold rounded-xl flex items-center space-x-1.5 shadow"
            >
              <Plus className="w-4 h-4" />
              <span>Create New Batch</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {data?.batches?.map((b: any) => (
              <div key={b.id} className="glass-card rounded-2xl p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-white">{b.name}</span>
                  <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-brand-950 text-brand-300 border border-brand-800">
                    {b.enrolled_count || 0} Students Enrolled
                  </span>
                </div>
                <p className="text-xs text-slate-400">{b.description}</p>
                <div className="text-xs text-slate-400 flex items-center space-x-2 pt-2 border-t border-slate-800">
                  <Clock className="w-4 h-4 text-purple-400" />
                  <span>{b.schedule_info}</span>
                </div>
                <div className="pt-2 flex justify-end">
                  <button
                    onClick={() => setShowEnrollModal(b.id)}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-brand-400 text-xs font-semibold rounded-xl flex items-center space-x-1 border border-slate-700"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>Enroll Student</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: CALENDAR */}
      {activeTab === 'calendar' && (
        <CalendarView sessions={data?.upcomingSessions || []} role={role} onRefresh={loadDashboard} />
      )}

      {/* TAB 3: LEARNING MATERIALS */}
      {activeTab === 'materials' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold font-display text-white flex items-center space-x-2">
              <BookOpen className="w-5 h-5 text-purple-500" />
              <span>Learning Materials & Resource Library</span>
            </h2>
            <button
              onClick={() => setShowMaterialModal(true)}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-xl flex items-center space-x-1.5 shadow"
            >
              <Plus className="w-4 h-4" />
              <span>Upload Material (Adapter)</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="glass-card rounded-2xl p-5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-950 text-rose-300 border border-rose-800">PDF</span>
                <span className="text-[10px] text-slate-500">Uploaded Today</span>
              </div>
              <h3 className="font-bold text-sm text-white">GoF Design Patterns Reference Manual</h3>
              <p className="text-xs text-slate-400 line-clamp-2">Comprehensive guide covering Creational, Structural, and Behavioral patterns with UML diagrams.</p>
              <div className="pt-2 flex justify-end">
                <a href="https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf" target="_blank" rel="noreferrer" className="px-3 py-1.5 bg-slate-800 text-purple-400 text-xs font-semibold rounded-xl flex items-center space-x-1 border border-slate-700">
                  <Download className="w-3.5 h-3.5" />
                  <span>Download File</span>
                </a>
              </div>
            </div>

            <div className="glass-card rounded-2xl p-5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-950 text-rose-300 border border-rose-800">PDF</span>
                <span className="text-[10px] text-slate-500">Uploaded Yesterday</span>
              </div>
              <h3 className="font-bold text-sm text-white">Software Architecture & MVC Cheat Sheet</h3>
              <p className="text-xs text-slate-400 line-clamp-2">Quick reference for layered architecture, controller setup, and REST API conventions.</p>
              <div className="pt-2 flex justify-end">
                <a href="https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf" target="_blank" rel="noreferrer" className="px-3 py-1.5 bg-slate-800 text-purple-400 text-xs font-semibold rounded-xl flex items-center space-x-1 border border-slate-700">
                  <Download className="w-3.5 h-3.5" />
                  <span>Download File</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: ASSIGNMENTS & GRADING */}
      {activeTab === 'assignments' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold font-display text-white flex items-center space-x-2">
              <FileText className="w-5 h-5 text-brand-500" />
              <span>Assignments & Grading Hub</span>
            </h2>
            <button
              onClick={() => setShowAssignmentModal(true)}
              className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold rounded-xl flex items-center space-x-1.5 shadow"
            >
              <Plus className="w-4 h-4" />
              <span>Create Assignment</span>
            </button>
          </div>

          <div className="space-y-4">
            <h3 className="font-bold text-sm text-slate-300">Pending Student Submissions</h3>
            {data?.pendingSubmissions?.length === 0 ? (
              <div className="glass-card p-8 text-center text-xs text-slate-400 rounded-2xl">
                All submissions have been reviewed and graded!
              </div>
            ) : (
              <div className="space-y-3">
                {data?.pendingSubmissions?.map((sub: any) => (
                  <div key={sub.id} className="glass-card rounded-2xl p-4 flex items-center justify-between text-xs">
                    <div>
                      <div className="font-bold text-white text-sm">{sub.student_name}</div>
                      <div className="text-slate-400">{sub.assignment_title}</div>
                      <div className="text-[11px] text-slate-500 italic mt-1">"{sub.content}"</div>
                    </div>
                    <button
                      onClick={() => handleGradeSubmission(sub.id)}
                      className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl text-xs shadow"
                    >
                      Grade & Feedback
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 5: QUIZZES */}
      {activeTab === 'quizzes' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold font-display text-white flex items-center space-x-2">
              <HelpCircle className="w-5 h-5 text-purple-500" />
              <span>Quiz Center & Exam Builder</span>
            </h2>
            <button
              onClick={() => setShowQuizModal(true)}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-xl flex items-center space-x-1.5 shadow"
            >
              <Plus className="w-4 h-4" />
              <span>Create Quiz / Exam</span>
            </button>
          </div>

          {/* Live quizzes from DB */}
          <div className="space-y-4">
            <h3 className="font-bold text-sm text-slate-300">Published Quizzes & Exams</h3>
            {data?.quizzes?.length === 0 ? (
              <div className="glass-card p-8 text-center text-xs text-slate-400 rounded-2xl">
                No quizzes published yet. Create one to get started!
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {data?.quizzes?.map((q: any) => (
                  <div key={q.id} className="glass-card rounded-2xl p-5 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold border ${
                        q.quiz_type === 'VIDEO_CALL'
                          ? 'bg-blue-950 text-blue-300 border-blue-800'
                          : 'bg-purple-950 text-purple-300 border-purple-800'
                      }`}>
                        {q.quiz_type === 'VIDEO_CALL' ? '📹 Video Call Exam' : `MCQ · ${q.total_marks} Marks`}
                      </span>
                      <span className="text-xs text-slate-400">{q.time_limit_mins} Min Limit</span>
                    </div>
                    <h3 className="font-bold text-base text-white">{q.title}</h3>
                    <p className="text-xs text-slate-400 line-clamp-2">{q.description}</p>
                    {q.meet_link && (
                      <a href={q.meet_link} target="_blank" rel="noreferrer" className="flex items-center space-x-1.5 text-xs text-blue-400 font-semibold hover:underline">
                        <Link className="w-3.5 h-3.5" />
                        <span>Open Meeting Link</span>
                      </a>
                    )}
                    <div className="pt-2 text-xs text-emerald-400 font-semibold">
                      {q.quiz_type === 'VIDEO_CALL' ? 'Students submit paper after video exam' : 'Autograding Active via Factory Assessment Engine'}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Static demo card for existing DB quiz */}
          <div className="glass-card rounded-2xl p-5 space-y-3 border border-purple-900/40">
            <div className="flex items-center justify-between">
              <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-purple-950 text-purple-300 border border-purple-800">
                MCQ · 20 Marks
              </span>
              <span className="text-xs text-slate-400">20 Mins Limit</span>
            </div>
            <h3 className="font-bold text-base text-white">Quiz 1: Software Design Patterns & Principles</h3>
            <p className="text-xs text-slate-400">Test your knowledge on SOLID principles, Singleton, Observer, Strategy, and Facade patterns. 2 questions × 10 marks each.</p>
            <div className="pt-2 text-xs text-emerald-400 font-semibold">
              Autograding Active via Factory Assessment Engine
            </div>
          </div>
        </div>
      )}

      {/* TAB 6: ATTENDANCE */}
      {activeTab === 'attendance' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold font-display text-white flex items-center space-x-2">
              <CheckSquare className="w-5 h-5 text-emerald-500" />
              <span>Mark Session Attendance Register</span>
            </h2>
            <button
              onClick={handleSaveAttendance}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl flex items-center space-x-1.5 shadow"
            >
              <Check className="w-4 h-4" />
              <span>Save Attendance Register</span>
            </button>
          </div>

          <div className="glass-card rounded-2xl p-6 space-y-4">
            <div className="flex items-center space-x-4">
              <label className="text-xs font-semibold text-slate-400">Select Session:</label>
              <select
                value={selectedAttendanceSession}
                onChange={(e) => setSelectedAttendanceSession(parseInt(e.target.value))}
                className="px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs"
              >
                <option value={1}>Session 1: Structural & Creational Patterns (Batch A)</option>
                <option value={2}>1-on-1 Mentorship: Advanced Architecture (Rahul Sharma)</option>
              </select>
            </div>

            <div className="space-y-2 pt-2">
              {allStudents.map((st) => {
                const currentStatus = attendanceRecords[st.studentId] || 'PRESENT';
                return (
                  <div key={st.studentId} className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700 flex items-center justify-between text-xs">
                    <div>
                      <div className="font-bold text-white">{st.name}</div>
                      <div className="text-slate-400 text-[11px]">{st.institution} • {st.academic_level}</div>
                    </div>

                    <div className="flex space-x-1">
                      <button
                        onClick={() => setAttendanceRecords(prev => ({ ...prev, [st.studentId]: 'PRESENT' }))}
                        className={`px-3 py-1.5 rounded-lg font-bold text-xs ${currentStatus === 'PRESENT' ? 'bg-emerald-600 text-white' : 'bg-slate-700 text-slate-400'}`}
                      >
                        PRESENT
                      </button>
                      <button
                        onClick={() => setAttendanceRecords(prev => ({ ...prev, [st.studentId]: 'ABSENT' }))}
                        className={`px-3 py-1.5 rounded-lg font-bold text-xs ${currentStatus === 'ABSENT' ? 'bg-rose-600 text-white' : 'bg-slate-700 text-slate-400'}`}
                      >
                        ABSENT
                      </button>
                      <button
                        onClick={() => setAttendanceRecords(prev => ({ ...prev, [st.studentId]: 'LATE' }))}
                        className={`px-3 py-1.5 rounded-lg font-bold text-xs ${currentStatus === 'LATE' ? 'bg-amber-600 text-white' : 'bg-slate-700 text-slate-400'}`}
                      >
                        LATE
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* TAB 7: SESSION LOGS */}
      {activeTab === 'session-logs' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold font-display text-white flex items-center space-x-2">
              <ClipboardList className="w-5 h-5 text-indigo-400" />
              <span>Session Logs & Lesson Documentation</span>
            </h2>
          </div>

          <div className="space-y-3">
            {data?.recentLogs?.map((log: any) => (
              <div key={log.id} className="glass-card rounded-2xl p-5 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-white text-sm">{log.session_title}</h3>
                  <span className="text-[10px] text-slate-500">{new Date(log.created_at).toLocaleDateString()}</span>
                </div>
                <div className="text-slate-300"><strong>Topics Covered:</strong> {log.topics_covered}</div>
                {log.homework && <div className="text-purple-400"><strong>Homework Assigned:</strong> {log.homework}</div>}
                {log.notes && <div className="text-slate-400 italic"><strong>Teacher Notes:</strong> "{log.notes}"</div>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 8: ANNOUNCEMENTS */}
      {activeTab === 'announcements' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold font-display text-white flex items-center space-x-2">
              <Megaphone className="w-5 h-5 text-purple-500" />
              <span>Announcements & Observer Notifications</span>
            </h2>
            <button
              onClick={() => setShowAnnouncementModal(true)}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-xl flex items-center space-x-1.5 shadow"
            >
              <Plus className="w-4 h-4" />
              <span>Publish Announcement</span>
            </button>
          </div>

          <div className="glass-card rounded-2xl p-5 space-y-4">
            <div className="p-4 rounded-xl bg-purple-950/40 border border-purple-900/50 space-y-2">
              <div className="font-bold text-white text-sm">🚀 Welcome to Summer 2026 Tutor Portal</div>
              <p className="text-xs text-slate-300">Welcome everyone! Please check the calendar for upcoming live sessions, review lecture materials, and check Assignment 1 instructions.</p>
              <span className="text-[10px] text-purple-400 block pt-1">Broadcasting via Observer Event Subject Pattern</span>
            </div>
          </div>
        </div>
      )}

      {/* DEFAULT OVERVIEW TAB */}
      {activeTab === 'dashboard' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="glass-card rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-base text-white font-display flex items-center space-x-2">
                  <Users className="w-5 h-5 text-brand-500" />
                  <span>Enrolled Batches & 1-on-1 Students</span>
                </h3>
                <button onClick={() => setActiveTab('batches')} className="text-xs font-semibold text-brand-400 hover:underline">
                  View All Batches &rarr;
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {data?.batches?.map((b: any) => (
                  <div key={b.id} className="p-4 rounded-xl bg-slate-800/60 border border-slate-700 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white">{b.name}</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-brand-950 text-brand-300 border border-brand-800">
                        {b.enrolled_count || 0} Enrolled
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 line-clamp-2">{b.description}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="glass-card rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-base text-white font-display flex items-center space-x-2">
                  <Award className="w-5 h-5 text-amber-400" />
                  <span>Assignment Submissions Requiring Grading</span>
                </h3>
                <button onClick={() => setActiveTab('assignments')} className="text-xs font-semibold text-amber-400 hover:underline">
                  View Assignments Hub &rarr;
                </button>
              </div>

              {data?.pendingSubmissions?.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-500">All student submissions are graded!</div>
              ) : (
                <div className="space-y-2">
                  {data?.pendingSubmissions?.map((sub: any) => (
                    <div key={sub.id} className="p-3.5 rounded-xl bg-amber-950/20 border border-amber-900/40 flex items-center justify-between text-xs">
                      <div>
                        <div className="font-bold text-white">{sub.student_name}</div>
                        <div className="text-slate-400">{sub.assignment_title}</div>
                      </div>
                      <button
                        onClick={() => handleGradeSubmission(sub.id)}
                        className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg text-xs shadow"
                      >
                        Grade & Feedback
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="space-y-6">
            <div className="glass-card rounded-2xl p-5 space-y-4">
              <h3 className="font-bold text-base text-white font-display flex items-center space-x-2">
                <Clock className="w-5 h-5 text-blue-400" />
                <span>Student Schedule Requests</span>
              </h3>

              {data?.pendingScheduleRequests?.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-500">No pending schedule change requests.</div>
              ) : (
                <div className="space-y-3">
                  {data?.pendingScheduleRequests?.map((req: any) => (
                    <div key={req.id} className="p-3.5 rounded-xl bg-blue-950/20 border border-blue-900/40 space-y-2 text-xs">
                      <div className="font-bold text-white">{req.student_name}</div>
                      <div className="text-slate-300">Session: {req.session_title}</div>
                      <div className="text-slate-400 italic">Reason: "{req.reason}"</div>
                      <div className="flex space-x-2 pt-1">
                        <button onClick={() => handleScheduleRequest(req.id, 'APPROVED')} className="flex-1 py-1 bg-emerald-600 text-white font-bold rounded-lg text-[11px]">Approve</button>
                        <button onClick={() => handleScheduleRequest(req.id, 'REJECTED')} className="flex-1 py-1 bg-slate-700 text-white font-bold rounded-lg text-[11px]">Reject</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODALS */}
      {/* ========================================================================= */}

      {/* Create Batch Modal */}
      {showBatchModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 rounded-3xl p-6 w-full max-w-md shadow-2xl border border-slate-800 space-y-4">
            <h3 className="text-base font-bold font-display text-white">Create New Batch</h3>
            <form onSubmit={handleCreateBatch} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold mb-1 text-slate-300">Batch Name</label>
                <input type="text" required value={batchName} onChange={e => setBatchName(e.target.value)} placeholder="e.g. CSE327 Batch B" className="w-full p-2.5 rounded-xl border border-slate-700 bg-slate-800 text-white" />
              </div>
              <div>
                <label className="block font-semibold mb-1 text-slate-300">Subject</label>
                <input type="text" value={batchSubject} onChange={e => setBatchSubject(e.target.value)} className="w-full p-2.5 rounded-xl border border-slate-700 bg-slate-800 text-white" />
              </div>
              <div>
                <label className="block font-semibold mb-1 text-slate-300">Schedule Info</label>
                <input type="text" value={batchSchedule} onChange={e => setBatchSchedule(e.target.value)} className="w-full p-2.5 rounded-xl border border-slate-700 bg-slate-800 text-white" />
              </div>
              <div className="flex justify-end space-x-2 pt-2">
                <button type="button" onClick={() => setShowBatchModal(false)} className="px-4 py-2 text-slate-400">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-brand-600 text-white font-bold rounded-xl">Create Batch</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Enroll Student Modal */}
      {showEnrollModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 rounded-3xl p-6 w-full max-w-md shadow-2xl border border-slate-800 space-y-4">
            <h3 className="text-base font-bold font-display text-white">Enroll Student into Batch #{showEnrollModal}</h3>
            <form onSubmit={handleEnrollStudent} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold mb-1 text-slate-300">Select Student</label>
                <select
                  value={selectedStudentForEnroll}
                  onChange={(e) => setSelectedStudentForEnroll(parseInt(e.target.value))}
                  className="w-full p-2.5 rounded-xl border border-slate-700 bg-slate-800 text-white"
                >
                  {allStudents.map(s => (
                    <option key={s.studentId} value={s.studentId}>{s.name} ({s.institution})</option>
                  ))}
                </select>
              </div>
              <div className="flex justify-end space-x-2 pt-2">
                <button type="button" onClick={() => setShowEnrollModal(null)} className="px-4 py-2 text-slate-400">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-brand-600 text-white font-bold rounded-xl">Enroll Student</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Upload Material Modal */}
      {showMaterialModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 rounded-3xl p-6 w-full max-w-md shadow-2xl border border-slate-800 space-y-4">
            <h3 className="text-base font-bold font-display text-white">Upload Learning Material (Adapter Pattern)</h3>
            <form onSubmit={handleUploadMaterial} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold mb-1 text-slate-300">Material Title</label>
                <input type="text" required value={matTitle} onChange={e => setMatTitle(e.target.value)} placeholder="e.g. Lecture 3 - Strategy Pattern" className="w-full p-2.5 rounded-xl border border-slate-700 bg-slate-800 text-white" />
              </div>
              <div>
                <label className="block font-semibold mb-1 text-slate-300">Description</label>
                <textarea rows={2} value={matDesc} onChange={e => setMatDesc(e.target.value)} className="w-full p-2.5 rounded-xl border border-slate-700 bg-slate-800 text-white" />
              </div>
              <div className="flex justify-end space-x-2 pt-2">
                <button type="button" onClick={() => setShowMaterialModal(false)} className="px-4 py-2 text-slate-400">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-purple-600 text-white font-bold rounded-xl">Upload File</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create Assignment Modal */}
      {showAssignmentModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 rounded-3xl p-6 w-full max-w-md shadow-2xl border border-slate-800 space-y-4">
            <h3 className="text-base font-bold font-display text-white">Create Assignment</h3>
            <form onSubmit={handleCreateAssignment} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold mb-1 text-slate-300">Title</label>
                <input type="text" required value={assignTitle} onChange={e => setAssignTitle(e.target.value)} placeholder="e.g. Assignment 2: Strategy Pattern Refactoring" className="w-full p-2.5 rounded-xl border border-slate-700 bg-slate-800 text-white" />
              </div>
              <div>
                <label className="block font-semibold mb-1 text-slate-300">Description</label>
                <textarea rows={2} required value={assignDesc} onChange={e => setAssignDesc(e.target.value)} className="w-full p-2.5 rounded-xl border border-slate-700 bg-slate-800 text-white" />
              </div>
              <div>
                <label className="block font-semibold mb-1 text-slate-300">Deadline</label>
                <input type="date" required value={assignDeadline} onChange={e => setAssignDeadline(e.target.value)} className="w-full p-2.5 rounded-xl border border-slate-700 bg-slate-800 text-white" />
              </div>
              <div className="flex justify-end space-x-2 pt-2">
                <button type="button" onClick={() => setShowAssignmentModal(false)} className="px-4 py-2 text-slate-400">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-brand-600 text-white font-bold rounded-xl">Publish Assignment</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create Quiz Modal */}
      {showQuizModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 rounded-3xl p-6 w-full max-w-2xl shadow-2xl border border-slate-800 space-y-5 my-4">
            {/* Header */}
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold font-display text-white">Create Quiz / Exam</h3>
              <button onClick={() => setShowQuizModal(false)} className="text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
            </div>

            {/* Exam Type Selector */}
            <div>
              <label className="block text-xs font-semibold mb-2 text-slate-300">Exam Type</label>
              <div className="flex space-x-2">
                <button
                  type="button"
                  onClick={() => setQuizType('MCQ')}
                  className={`flex-1 py-3 rounded-xl border text-xs font-bold flex flex-col items-center space-y-1 transition-all ${
                    quizType === 'MCQ' ? 'border-purple-500 bg-purple-950/60 text-purple-300' : 'border-slate-700 bg-slate-800 text-slate-400 hover:border-slate-600'
                  }`}
                >
                  <HelpCircle className="w-5 h-5" />
                  <span>MCQ Exam</span>
                  <span className="text-[10px] font-normal opacity-70">Custom questions, autograded</span>
                </button>
                <button
                  type="button"
                  onClick={() => setQuizType('VIDEO_CALL')}
                  className={`flex-1 py-3 rounded-xl border text-xs font-bold flex flex-col items-center space-y-1 transition-all ${
                    quizType === 'VIDEO_CALL' ? 'border-blue-500 bg-blue-950/60 text-blue-300' : 'border-slate-700 bg-slate-800 text-slate-400 hover:border-slate-600'
                  }`}
                >
                  <Video className="w-5 h-5" />
                  <span>Video Call Exam</span>
                  <span className="text-[10px] font-normal opacity-70">Google Meet / Zoom link</span>
                </button>
              </div>
            </div>

            <form onSubmit={handleCreateQuiz} className="space-y-4 text-xs">
              {/* Common Fields */}
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="block font-semibold mb-1 text-slate-300">Exam Title *</label>
                  <input type="text" required value={quizTitle} onChange={e => setQuizTitle(e.target.value)} placeholder={quizType === 'MCQ' ? 'e.g. Quiz 2: Structural Patterns' : 'e.g. Midterm Viva — Design Patterns'} className="w-full p-2.5 rounded-xl border border-slate-700 bg-slate-800 text-white" />
                </div>
                <div>
                  <label className="block font-semibold mb-1 text-slate-300">Time Limit (mins)</label>
                  <input type="number" min={5} value={quizTime} onChange={e => setQuizTime(parseInt(e.target.value))} className="w-full p-2.5 rounded-xl border border-slate-700 bg-slate-800 text-white" />
                </div>
                <div>
                  <label className="block font-semibold mb-1 text-slate-300">{quizType === 'MCQ' ? 'Description (optional)' : 'Instructions'}</label>
                  <input type="text" value={quizType === 'MCQ' ? quizDesc : quizMeetInstructions} onChange={e => quizType === 'MCQ' ? setQuizDesc(e.target.value) : setQuizMeetInstructions(e.target.value)} placeholder={quizType === 'MCQ' ? 'Brief description...' : 'Join by 9AM, camera on...'} className="w-full p-2.5 rounded-xl border border-slate-700 bg-slate-800 text-white" />
                </div>
              </div>

              {/* VIDEO CALL SPECIFIC */}
              {quizType === 'VIDEO_CALL' && (
                <div className="p-4 rounded-2xl bg-blue-950/30 border border-blue-900/50 space-y-3">
                  <div className="flex items-center space-x-2 text-blue-300 font-semibold">
                    <Video className="w-4 h-4" />
                    <span>Video Call Exam Settings</span>
                  </div>
                  <div>
                    <label className="block font-semibold mb-1 text-slate-300">Meeting Link *</label>
                    <input
                      type="url"
                      value={quizMeetLink}
                      onChange={e => setQuizMeetLink(e.target.value)}
                      placeholder="https://meet.google.com/xxx-xxxx-xxx"
                      className="w-full p-2.5 rounded-xl border border-blue-800 bg-slate-800 text-white"
                    />
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Students will see this link and can submit their written/scanned answer paper via the submission button after the exam.
                  </p>
                </div>
              )}

              {/* MCQ QUESTION BUILDER */}
              {quizType === 'MCQ' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="font-semibold text-slate-300">Questions ({quizQuestions.length})</label>
                    <div className="text-[11px] text-purple-400 font-semibold">
                      Total: {quizQuestions.reduce((s, q) => s + (q.marks || 0), 0)} marks
                    </div>
                  </div>

                  <div className="space-y-4 max-h-80 overflow-y-auto pr-1">
                    {quizQuestions.map((q, qIdx) => (
                      <div key={qIdx} className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700 space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-purple-300">Q{qIdx + 1}</span>
                          {quizQuestions.length > 1 && (
                            <button type="button" onClick={() => handleRemoveQuestion(qIdx)} className="text-rose-400 hover:text-rose-300">
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>

                        <input
                          type="text"
                          required
                          placeholder="Question text..."
                          value={q.questionText}
                          onChange={e => handleQuestionChange(qIdx, 'questionText', e.target.value)}
                          className="w-full p-2 rounded-xl border border-slate-600 bg-slate-900 text-white"
                        />

                        <div className="grid grid-cols-2 gap-2">
                          {q.options.map((opt, optIdx) => (
                            <input
                              key={optIdx}
                              type="text"
                              required
                              placeholder={`Option ${optIdx + 1}`}
                              value={opt}
                              onChange={e => handleOptionChange(qIdx, optIdx, e.target.value)}
                              className="p-2 rounded-lg border border-slate-600 bg-slate-900 text-white text-[11px]"
                            />
                          ))}
                        </div>

                        <div className="flex items-center space-x-2">
                          <div className="flex-1">
                            <label className="block text-[10px] text-slate-400 mb-1">Correct Answer</label>
                            <select
                              required
                              value={q.correctAnswer}
                              onChange={e => handleQuestionChange(qIdx, 'correctAnswer', e.target.value)}
                              className="w-full p-2 rounded-lg border border-emerald-800 bg-slate-900 text-emerald-300 text-[11px]"
                            >
                              <option value="">Select correct answer...</option>
                              {q.options.filter(o => o.trim()).map((opt, i) => (
                                <option key={i} value={opt}>{opt}</option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <label className="block text-[10px] text-slate-400 mb-1">Marks</label>
                            <input
                              type="number"
                              min={1}
                              required
                              value={q.marks}
                              onChange={e => handleQuestionChange(qIdx, 'marks', parseInt(e.target.value) || 1)}
                              className="w-20 p-2 rounded-lg border border-slate-600 bg-slate-900 text-white text-[11px]"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={handleAddQuestion}
                    className="w-full py-2.5 border-2 border-dashed border-slate-600 hover:border-purple-600 text-slate-400 hover:text-purple-300 rounded-xl text-xs font-semibold flex items-center justify-center space-x-1.5 transition-all"
                  >
                    <PlusCircle className="w-4 h-4" />
                    <span>Add Another Question</span>
                  </button>
                </div>
              )}

              <div className="flex justify-end space-x-2 pt-2 border-t border-slate-800">
                <button type="button" onClick={() => setShowQuizModal(false)} className="px-4 py-2 text-slate-400">Cancel</button>
                <button
                  type="submit"
                  className={`px-5 py-2 font-bold rounded-xl text-white ${
                    quizType === 'MCQ' ? 'bg-purple-600 hover:bg-purple-700' : 'bg-blue-600 hover:bg-blue-700'
                  }`}
                >
                  {quizType === 'MCQ' ? 'Publish MCQ Quiz' : 'Publish Video Exam'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create Announcement Modal */}
      {showAnnouncementModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 rounded-3xl p-6 w-full max-w-md shadow-2xl border border-slate-800 space-y-4">
            <h3 className="text-base font-bold font-display text-white">Publish Announcement (Observer Pattern)</h3>
            <form onSubmit={handlePostAnnouncement} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold mb-1 text-slate-300">Announcement Title</label>
                <input type="text" required value={annTitle} onChange={e => setAnnTitle(e.target.value)} placeholder="e.g. Midterm Presentation Schedule" className="w-full p-2.5 rounded-xl border border-slate-700 bg-slate-800 text-white" />
              </div>
              <div>
                <label className="block font-semibold mb-1 text-slate-300">Content</label>
                <textarea rows={3} required value={annContent} onChange={e => setAnnContent(e.target.value)} className="w-full p-2.5 rounded-xl border border-slate-700 bg-slate-800 text-white" />
              </div>
              <div className="flex justify-end space-x-2 pt-2">
                <button type="button" onClick={() => setShowAnnouncementModal(false)} className="px-4 py-2 text-slate-400">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-purple-600 text-white font-bold rounded-xl">Broadcast</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
