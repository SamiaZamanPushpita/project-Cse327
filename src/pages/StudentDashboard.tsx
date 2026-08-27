import React, { useEffect, useState } from 'react';
import {
  Calendar as CalendarIcon,
  BookOpen,
  FileText,
  HelpCircle,
  TrendingUp,
  CheckCircle,
  Clock,
  Send,
  Award,
  Sliders,
  AlertCircle,
  Download,
  ClipboardList,
  CheckSquare,
  Megaphone,
  Video,
  Link
} from 'lucide-react';
import { studentApi } from '../services/api';
import { QuizRunnerModal } from '../components/QuizRunnerModal';
import { CalendarView } from '../components/CalendarView';
import { UserRole } from '../types';

interface StudentDashboardProps {
  role: UserRole;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({ role, activeTab, setActiveTab }) => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  // Strategy Pattern evaluation state
  const [strategy, setStrategy] = useState<'weighted' | 'standard' | 'attendance_bonus'>('weighted');
  const [evalResult, setEvalResult] = useState<any>(null);

  // Active Quiz Modal
  const [activeQuizId, setActiveQuizId] = useState<number | null>(null);

  // Video call exam submission
  const [activeVideoQuiz, setActiveVideoQuiz] = useState<any | null>(null);
  const [videoSubmissionText, setVideoSubmissionText] = useState('');

  // Submit Assignment Modal
  const [activeAssignId, setActiveAssignId] = useState<number | null>(null);
  const [assignContent, setAssignContent] = useState('');

  // Schedule Change Modal
  const [showReschedModal, setShowReschedModal] = useState(false);
  const [reschedSession, setReschedSession] = useState<any>(null);
  const [reqStart, setReqStart] = useState('');
  const [reqEnd, setReqEnd] = useState('');
  const [reqReason, setReqReason] = useState('');

  const openReschedModal = (session: any) => {
    setReschedSession(session);
    // Pre-fill with the session's existing times as a starting point
    setReqStart(session.start_time ? session.start_time.replace(' ', 'T').slice(0, 16) : '');
    setReqEnd(session.end_time ? session.end_time.replace(' ', 'T').slice(0, 16) : '');
    setReqReason('');
    setShowReschedModal(true);
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  useEffect(() => {
    loadStrategyEvaluation();
  }, [strategy]);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      const res = await studentApi.getDashboard();
      if (res.success) {
        setData(res.data);
        setEvalResult(res.data.academicProgress);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const loadStrategyEvaluation = async () => {
    try {
      const res = await studentApi.evaluateProgress(strategy);
      if (res.success) {
        setEvalResult(res.result);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSubmitAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeAssignId) return;
    try {
      await studentApi.submitAssignment(activeAssignId, assignContent);
      setActiveAssignId(null);
      setAssignContent('');
      alert('Assignment submitted successfully!');
      loadDashboard();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleSubmitVideoExam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeVideoQuiz) return;
    try {
      // Submit as a quiz attempt with the written text as the answer
      await studentApi.submitQuiz(activeVideoQuiz.id, { video_submission: videoSubmissionText });
      setActiveVideoQuiz(null);
      setVideoSubmissionText('');
      alert('Exam paper submitted to tutor!');
      loadDashboard();
    } catch (err: any) {
      alert(err.message || 'Submission failed.');
    }
  };

  const handleScheduleChangeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reschedSession) return;
    try {
      await studentApi.requestScheduleChange({
        sessionId: reschedSession.id,
        requestedStart: reqStart,
        requestedEnd: reqEnd,
        reason: reqReason
      });
      setShowReschedModal(false);
      setReschedSession(null);
      alert('Schedule change request submitted to your tutor!');
    } catch (err: any) {
      alert(err.message);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-xs text-slate-400">Loading Student Portal...</div>;
  }

  const attSummary = data?.attendanceSummary || { attendancePercentage: 100 };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-indigo-600 via-purple-600 to-brand-700 rounded-3xl p-6 text-white shadow-2xl glow-purple">
        <div>
          <span className="text-[10px] uppercase font-bold tracking-wider px-3 py-1 rounded-full bg-white/20 backdrop-blur-md inline-block mb-2">
            Student Portal
          </span>
          <h1 className="text-2xl font-bold font-display leading-tight">
            Academic Performance & Portal
          </h1>
          <p className="text-xs text-indigo-100 mt-1">
            Track enrolled batches, assignments, autograded quizzes, attendance, and dynamic score algorithms.
          </p>
        </div>


      </div>

      {/* ========================================================================= */}
      {/* FULL DEDICATED TAB VIEWS ROUTER FOR STUDENT */}
      {/* ========================================================================= */}

      {/* TAB 1: SCHEDULE — Sessions list with per-session reschedule requests */}
      {activeTab === 'calendar' && (
        <div className="space-y-6">
          <CalendarView sessions={data?.mySessions || []} role={role} onRefresh={loadDashboard} />

          {/* Session Cards with Reschedule Request */}
          <div className="space-y-3">
            <h2 className="text-base font-bold font-display text-white flex items-center gap-2">
              <Clock className="w-5 h-5 text-indigo-400" />
              My Scheduled Sessions
            </h2>
            {(data?.mySessions || []).length === 0 && (
              <div className="glass-card rounded-2xl p-5 text-xs text-slate-400 text-center">No sessions scheduled yet.</div>
            )}
            {(data?.mySessions || []).map((session: any) => {
              const isPast = session.status === 'COMPLETED' || session.status === 'CANCELLED';
              return (
                <div key={session.id} className="glass-card rounded-2xl p-5 space-y-3 text-xs">
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <h3 className="font-bold text-sm text-white">{session.title}</h3>
                      <div className="flex items-center gap-2 text-slate-400">
                        <CalendarIcon className="w-3.5 h-3.5" />
                        <span>{session.start_time ? new Date(session.start_time).toLocaleString() : 'TBD'}</span>
                        {session.end_time && (
                          <span>→ {new Date(session.end_time).toLocaleString()}</span>
                        )}
                      </div>
                      {session.location && (
                        <div className="text-slate-500">📍 {session.location}</div>
                      )}
                    </div>
                    <span className={`shrink-0 px-2.5 py-1 rounded-lg text-[10px] font-bold border ${
                      session.status === 'COMPLETED' ? 'bg-emerald-950 text-emerald-300 border-emerald-800' :
                      session.status === 'CANCELLED' ? 'bg-rose-950 text-rose-300 border-rose-800' :
                      session.status === 'RESCHEDULED' ? 'bg-amber-950 text-amber-300 border-amber-800' :
                      'bg-indigo-950 text-indigo-300 border-indigo-800'
                    }`}>{session.status}</span>
                  </div>

                  {session.description && (
                    <p className="text-slate-400 leading-relaxed">{session.description}</p>
                  )}

                  {!isPast && (
                    <div className="pt-1 flex justify-end">
                      <button
                        onClick={() => openReschedModal(session)}
                        className="px-3.5 py-2 bg-indigo-600/80 hover:bg-indigo-600 border border-indigo-500/50 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition-all shadow"
                      >
                        <Clock className="w-3.5 h-3.5" />
                        Request Reschedule
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: MATERIALS */}
      {activeTab === 'materials' && (
        <div className="space-y-6">
          <h2 className="text-xl font-bold font-display text-white flex items-center space-x-2">
            <BookOpen className="w-5 h-5 text-purple-500" />
            <span>Course Materials & Downloads</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="glass-card rounded-2xl p-5 space-y-3">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-950 text-rose-300 border border-rose-800">PDF</span>
              <h3 className="font-bold text-sm text-white">GoF Design Patterns Reference Manual</h3>
              <p className="text-xs text-slate-400">Comprehensive guide covering Creational, Structural, and Behavioral patterns with UML diagrams.</p>
              <div className="pt-2 flex justify-end">
                <a href="https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf" target="_blank" rel="noreferrer" className="px-3.5 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-xl flex items-center space-x-1.5 shadow">
                  <Download className="w-4 h-4" />
                  <span>Download Document</span>
                </a>
              </div>
            </div>

            <div className="glass-card rounded-2xl p-5 space-y-3">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-950 text-rose-300 border border-rose-800">PDF</span>
              <h3 className="font-bold text-sm text-white">Software Architecture & MVC Cheat Sheet</h3>
              <p className="text-xs text-slate-400">Quick reference for layered architecture, controller setup, and REST API conventions.</p>
              <div className="pt-2 flex justify-end">
                <a href="https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf" target="_blank" rel="noreferrer" className="px-3.5 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-xl flex items-center space-x-1.5 shadow">
                  <Download className="w-4 h-4" />
                  <span>Download Document</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: ASSIGNMENTS */}
      {activeTab === 'assignments' && (
        <div className="space-y-6">
          <h2 className="text-xl font-bold font-display text-white flex items-center space-x-2">
            <FileText className="w-5 h-5 text-brand-500" />
            <span>My Assigned Work & Submissions</span>
          </h2>

          <div className="space-y-3">
            {data?.assignments?.map((a: any) => (
              <div key={a.id} className="glass-card rounded-2xl p-5 space-y-3 text-xs">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-base text-white">{a.title}</h3>
                  {a.score !== null ? (
                    <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-950 text-emerald-300 border border-emerald-800">
                      Graded: {a.score} / {a.total_marks}
                    </span>
                  ) : a.submitted_at ? (
                    <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-amber-950 text-amber-300 border border-amber-800">
                      Submitted (Awaiting Grade)
                    </span>
                  ) : (
                    <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-rose-950 text-rose-300 border border-rose-800">
                      Pending Submission
                    </span>
                  )}
                </div>
                <p className="text-slate-300 text-sm">{a.description}</p>
                {a.feedback && <div className="text-purple-400 font-semibold p-2.5 rounded-xl bg-purple-950/40 border border-purple-900/50">Tutor Feedback: "{a.feedback}"</div>}
                {!a.score && !a.submitted_at && (
                  <div className="pt-2 flex justify-end">
                    <button
                      onClick={() => setActiveAssignId(a.id)}
                      className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl text-xs shadow"
                    >
                      Submit Response Solution
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: QUIZZES */}
      {activeTab === 'quizzes' && (
        <div className="space-y-6">
          <h2 className="text-xl font-bold font-display text-white flex items-center space-x-2">
            <HelpCircle className="w-5 h-5 text-purple-500" />
            <span>Interactive Quiz Runner & Exams</span>
          </h2>

          <div className="space-y-3">
            {data?.quizzes?.map((q: any) => (
              <div key={q.id} className="glass-card rounded-2xl p-5 space-y-3 text-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    {q.quiz_type === 'VIDEO_CALL' ? (
                      <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-blue-950 text-blue-300 border border-blue-800 flex items-center space-x-1">
                        <Video className="w-3 h-3" />
                        <span>Video Call Exam</span>
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-purple-950 text-purple-300 border border-purple-800">
                        MCQ Quiz
                      </span>
                    )}
                  </div>
                  {q.attempt_score !== null ? (
                    <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-950 text-emerald-300 border border-emerald-800">
                      {q.quiz_type === 'VIDEO_CALL' ? 'Paper Submitted' : `Autograded: ${q.attempt_score} / ${q.total_marks}`}
                    </span>
                  ) : (
                    <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-purple-950 text-purple-300 border border-purple-800">
                      {q.quiz_type === 'VIDEO_CALL' ? 'Exam Pending' : 'Ready to Start'}
                    </span>
                  )}
                </div>

                <h3 className="font-bold text-base text-white">{q.title}</h3>
                <p className="text-slate-300">{q.description}</p>

                {/* Video Call Exam: show meet link prominently */}
                {q.quiz_type === 'VIDEO_CALL' && q.meet_link && (
                  <div className="p-3 rounded-xl bg-blue-950/40 border border-blue-900/50 space-y-2">
                    <div className="flex items-center space-x-1.5 text-blue-300 font-semibold">
                      <Video className="w-3.5 h-3.5" />
                      <span>Video Exam Meeting Link</span>
                    </div>
                    <a
                      href={q.meet_link}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center space-x-1.5 text-blue-400 hover:text-blue-300 font-bold hover:underline"
                    >
                      <Link className="w-3.5 h-3.5" />
                      <span>{q.meet_link}</span>
                    </a>
                    <p className="text-[11px] text-slate-400">Join the call at the scheduled time. Submit your written answer paper below after the exam.</p>
                  </div>
                )}

                {/* MCQ: Start Quiz button */}
                {q.quiz_type !== 'VIDEO_CALL' && q.attempt_score === null && (
                  <div className="pt-2 flex justify-end">
                    <button
                      onClick={() => setActiveQuizId(q.id)}
                      className="px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl text-xs shadow-lg"
                    >
                      Start Quiz Runner (Factory Pattern)
                    </button>
                  </div>
                )}

                {/* Video Call: Submit paper button */}
                {q.quiz_type === 'VIDEO_CALL' && q.attempt_score === null && (
                  <div className="pt-2 flex justify-end">
                    <button
                      onClick={() => setActiveVideoQuiz(q)}
                      className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs shadow-lg flex items-center space-x-2"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Submit Answer Paper</span>
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: PROGRESS & STRATEGY EVALUATOR */}
      {(activeTab === 'progress' || activeTab === 'dashboard') && (
        <div className="space-y-6">
          {/* Dynamic Strategy Pattern Evaluation Card */}
          <div className="glass-card rounded-3xl p-6 border border-purple-900/50 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center space-x-2">
                <div className="p-2 rounded-xl bg-purple-950 text-purple-300">
                  <Sliders className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-white font-display">
                    Dynamic Strategy Pattern Calculation Engine
                  </h3>
                  <p className="text-xs text-slate-400">Switch score algorithms dynamically at runtime!</p>
                </div>
              </div>

              <div className="flex bg-slate-800 p-1 rounded-xl text-xs font-medium self-start">
                <button
                  onClick={() => setStrategy('weighted')}
                  className={`px-3 py-1.5 rounded-lg transition-all ${strategy === 'weighted' ? 'bg-purple-600 text-white font-bold shadow-sm' : 'text-slate-400'}`}
                >
                  Weighted Average
                </button>
                <button
                  onClick={() => setStrategy('standard')}
                  className={`px-3 py-1.5 rounded-lg transition-all ${strategy === 'standard' ? 'bg-purple-600 text-white font-bold shadow-sm' : 'text-slate-400'}`}
                >
                  Standard %
                </button>
                <button
                  onClick={() => setStrategy('attendance_bonus')}
                  className={`px-3 py-1.5 rounded-lg transition-all ${strategy === 'attendance_bonus' ? 'bg-purple-600 text-white font-bold shadow-sm' : 'text-slate-400'}`}
                >
                  Attendance Bonus
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-2 border-t border-slate-800">
              <div className="p-4 rounded-2xl bg-purple-950/40 border border-purple-900/40">
                <span className="text-[11px] font-semibold text-slate-400">Calculated Overall Score</span>
                <div className="text-3xl font-bold font-display text-purple-400">
                  {evalResult?.overallScore || 0}%
                </div>
                <span className="text-[10px] text-purple-300 font-medium">
                  Strategy: {evalResult?.strategyUsed || 'WeightedAverageStrategy'}
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-slate-800/50">
                <span className="text-[11px] font-semibold text-slate-400">Assignment Average</span>
                <div className="text-2xl font-bold text-white">
                  {evalResult?.breakdown?.assignmentAvg || 'N/A'}
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-800/50">
                <span className="text-[11px] font-semibold text-slate-400">Quiz Average</span>
                <div className="text-2xl font-bold text-white">
                  {evalResult?.breakdown?.quizAvg || 'N/A'}
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-800/50">
                <span className="text-[11px] font-semibold text-slate-400">Attendance Rate</span>
                <div className="text-2xl font-bold text-emerald-400">
                  {attSummary.attendancePercentage}%
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 6: ATTENDANCE */}
      {activeTab === 'attendance' && (
        <div className="space-y-6">
          <h2 className="text-xl font-bold font-display text-white flex items-center space-x-2">
            <CheckSquare className="w-5 h-5 text-emerald-500" />
            <span>My Attendance Record & History</span>
          </h2>

          <div className="glass-card rounded-2xl p-5 space-y-3">
            <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-800/60 border border-slate-700 text-xs">
              <div>
                <div className="font-bold text-white">Session 1: Structural & Creational Design Patterns</div>
                <div className="text-slate-400 text-[11px]">On time participation</div>
              </div>
              <span className="px-3 py-1 rounded-lg text-xs font-bold bg-emerald-950 text-emerald-300 border border-emerald-800">
                PRESENT
              </span>
            </div>
          </div>
        </div>
      )}

      {/* TAB 7: SESSION LOGS */}
      {activeTab === 'session-logs' && (
        <div className="space-y-6">
          <h2 className="text-xl font-bold font-display text-white flex items-center space-x-2">
            <ClipboardList className="w-5 h-5 text-indigo-400" />
            <span>My Session Logs & Homework To-Do</span>
          </h2>

          <div className="space-y-3">
            <div className="glass-card rounded-2xl p-5 space-y-2 text-xs">
              <div className="font-bold text-white text-sm">Session 1: Structural & Creational Design Patterns</div>
              <div className="text-slate-300"><strong>Topics Covered:</strong> Factory Method, Singleton, Facade Pattern implementation details</div>
              <div className="text-purple-400 font-semibold"><strong>Homework Assigned:</strong> Implement Singleton Database class in Node.js</div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 8: ANNOUNCEMENTS */}
      {activeTab === 'announcements' && (
        <div className="space-y-6">
          <h2 className="text-xl font-bold font-display text-white flex items-center space-x-2">
            <Megaphone className="w-5 h-5 text-purple-500" />
            <span>Tutor Announcements Feed</span>
          </h2>

          <div className="space-y-3">
            {data?.announcements?.map((ann: any) => (
              <div key={ann.id} className="glass-card rounded-2xl p-5 space-y-2 text-xs">
                <div className="font-bold text-white text-base">{ann.title}</div>
                <p className="text-slate-300 leading-relaxed">{ann.content}</p>
                <span className="text-[10px] text-purple-400 block pt-1">Posted by {ann.tutor_name || 'Dr. Alan Turing'}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quiz Runner Modal */}
      {activeQuizId && (
        <QuizRunnerModal
          quizId={activeQuizId}
          onClose={() => setActiveQuizId(null)}
          onSubmitted={loadDashboard}
        />
      )}

      {/* Video Call Exam Paper Submission Modal */}
      {activeVideoQuiz && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 rounded-3xl p-6 w-full max-w-md shadow-2xl border border-blue-900/50 space-y-4">
            <div className="flex items-center space-x-3">
              <div className="p-2.5 rounded-xl bg-blue-950 text-blue-300">
                <Video className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold font-display text-white">Submit Exam Paper</h3>
                <p className="text-xs text-slate-400">{activeVideoQuiz.title}</p>
              </div>
            </div>
            <form onSubmit={handleSubmitVideoExam} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold mb-1 text-slate-300">Answer Submission</label>
                <textarea
                  rows={5}
                  required
                  placeholder="Paste your written answers, Google Drive link to scanned paper, or key points covered..."
                  value={videoSubmissionText}
                  onChange={(e) => setVideoSubmissionText(e.target.value)}
                  className="w-full p-3 rounded-xl border border-slate-700 bg-slate-800 text-white"
                />
              </div>
              <p className="text-[11px] text-slate-400">
                You may paste a Google Drive or Docs link, or type your answers directly. The tutor will review and grade your submission.
              </p>
              <div className="flex justify-end space-x-2 pt-1">
                <button type="button" onClick={() => setActiveVideoQuiz(null)} className="px-4 py-2 text-slate-400">Cancel</button>
                <button type="submit" className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl flex items-center space-x-1.5">
                  <Send className="w-3.5 h-3.5" />
                  <span>Submit Paper</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Submit Assignment Modal */}
      {activeAssignId && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 rounded-3xl p-6 w-full max-w-md shadow-2xl border border-slate-800 space-y-4">
            <h3 className="text-base font-bold font-display text-white">Submit Assignment Solution</h3>
            <form onSubmit={handleSubmitAssignment} className="space-y-3 text-xs">
              <textarea
                rows={4}
                required
                placeholder="Paste solution code, explanations, or Google Drive link..."
                value={assignContent}
                onChange={(e) => setAssignContent(e.target.value)}
                className="w-full p-3 rounded-xl border border-slate-700 bg-slate-800 text-white"
              />
              <div className="flex justify-end space-x-2">
                <button type="button" onClick={() => setActiveAssignId(null)} className="px-4 py-2 text-slate-400">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-brand-600 text-white font-bold rounded-xl">Submit</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Schedule Change Modal — contextually tied to a specific session */}
      {showReschedModal && reschedSession && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 rounded-3xl p-6 w-full max-w-md shadow-2xl border border-indigo-900/50 space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-indigo-950 text-indigo-300">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold font-display text-white">Request Reschedule</h3>
                <p className="text-xs text-indigo-400 font-medium mt-0.5">Session: {reschedSession.title}</p>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700 text-xs text-slate-400 space-y-1">
              <div className="font-semibold text-slate-300">Current Schedule</div>
              <div>Start: {reschedSession.start_time ? new Date(reschedSession.start_time).toLocaleString() : 'TBD'}</div>
              <div>End: {reschedSession.end_time ? new Date(reschedSession.end_time).toLocaleString() : 'TBD'}</div>
            </div>

            <form onSubmit={handleScheduleChangeSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold mb-1 text-slate-300">Requested New Start Time</label>
                <input type="datetime-local" required value={reqStart} onChange={(e) => setReqStart(e.target.value)} className="w-full p-2.5 rounded-xl border border-slate-700 bg-slate-800 text-white" />
              </div>
              <div>
                <label className="block font-semibold mb-1 text-slate-300">Requested New End Time</label>
                <input type="datetime-local" required value={reqEnd} onChange={(e) => setReqEnd(e.target.value)} className="w-full p-2.5 rounded-xl border border-slate-700 bg-slate-800 text-white" />
              </div>
              <div>
                <label className="block font-semibold mb-1 text-slate-300">Reason for Rescheduling</label>
                <textarea rows={2} required placeholder="e.g. Exam clash, illness, travel..." value={reqReason} onChange={(e) => setReqReason(e.target.value)} className="w-full p-2.5 rounded-xl border border-slate-700 bg-slate-800 text-white" />
              </div>
              <div className="flex justify-end space-x-2 pt-1">
                <button type="button" onClick={() => { setShowReschedModal(false); setReschedSession(null); }} className="px-4 py-2 text-slate-400 hover:text-slate-200">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl flex items-center gap-1.5">
                  <Send className="w-3.5 h-3.5" />
                  Send Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
