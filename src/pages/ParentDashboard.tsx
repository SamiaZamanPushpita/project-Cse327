import React, { useEffect, useState } from 'react';
import { Shield, TrendingUp, CheckSquare, BookOpen, MessageSquare, Award, Clock, ClipboardList, Megaphone } from 'lucide-react';
import { parentApi } from '../services/api';
import { UserRole } from '../types';

interface ParentDashboardProps {
  role: UserRole;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const ParentDashboard: React.FC<ParentDashboardProps> = ({ role, activeTab, setActiveTab }) => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedChildIdx, setSelectedChildIdx] = useState(0);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      const res = await parentApi.getDashboard();
      if (res.success) {
        setData(res.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-xs text-slate-400">Loading Parent Dashboard...</div>;
  }

  const childrenData = data?.childrenData || [];
  const currentChild = childrenData[selectedChildIdx] || {};
  const childInfo = currentChild.childInfo || {};
  const prog = currentChild.academicProgress || {};
  const att = currentChild.attendanceSummary || {};

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-700 rounded-3xl p-6 text-white shadow-2xl glow-emerald flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] uppercase font-bold tracking-wider px-3 py-1 rounded-full bg-white/20 backdrop-blur-md inline-block mb-2">
            Parent Monitoring Dashboard
          </span>
          <h1 className="text-2xl font-bold font-display leading-tight">
            Academic Performance Overview
          </h1>
          <p className="text-xs text-emerald-100 mt-1">
            Real-time monitoring of your child's attendance, grades, quiz performance, and session logs.
          </p>
        </div>

        <button
          onClick={() => setActiveTab('chat')}
          className="px-4 py-2.5 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition-all self-start md:self-auto"
        >
          <MessageSquare className="w-4 h-4" />
          <span>Direct Chat with Tutor</span>
        </button>
      </div>

      {/* Child Switcher */}
      {childrenData.length > 1 && (
        <div className="flex items-center space-x-2">
          <span className="text-xs font-semibold text-slate-400">Select Child:</span>
          {childrenData.map((c: any, idx: number) => (
            <button
              key={idx}
              onClick={() => setSelectedChildIdx(idx)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                selectedChildIdx === idx
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'bg-slate-800 text-slate-300 border border-slate-700'
              }`}
            >
              {c.childInfo.name} ({c.childInfo.relationship})
            </button>
          ))}
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass-card p-5 rounded-2xl space-y-1">
          <span className="text-xs font-semibold text-slate-400">Overall Academic Score</span>
          <div className="text-3xl font-bold font-display text-emerald-400">
            {prog?.academicProgress?.overallScore || 96}%
          </div>
          <span className="text-[10px] text-slate-500">Calculated via Strategy Pattern</span>
        </div>

        <div className="glass-card p-5 rounded-2xl space-y-1">
          <span className="text-xs font-semibold text-slate-400">Class Attendance Rate</span>
          <div className="text-3xl font-bold font-display text-blue-400">
            {att.attendancePercentage || 100}%
          </div>
          <span className="text-[10px] text-slate-500">{att.presentCount || 1} Present Sessions</span>
        </div>

        <div className="glass-card p-5 rounded-2xl space-y-1">
          <span className="text-xs font-semibold text-slate-400">Institution & Level</span>
          <div className="text-lg font-bold font-display text-white truncate">
            {childInfo.institution || 'North South University'}
          </div>
          <span className="text-[10px] text-purple-400 font-medium">{childInfo.academic_level || 'Senior (CSE)'}</span>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* DEDICATED PARENT TAB VIEWS ROUTER */}
      {/* ========================================================================= */}

      {/* TAB: PROGRESS / PERFORMANCE */}
      {(activeTab === 'progress' || activeTab === 'dashboard') && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="glass-card rounded-2xl p-5 space-y-4">
            <h3 className="font-bold text-base text-white font-display flex items-center space-x-2">
              <Award className="w-5 h-5 text-emerald-400" />
              <span>Child Assignment & Quiz Grades</span>
            </h3>

            <div className="space-y-3">
              {currentChild.assignmentGrades?.map((a: any) => (
                <div key={a.id} className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700 flex items-center justify-between text-xs">
                  <div>
                    <div className="font-bold text-white">{a.title}</div>
                    <div className="text-slate-400 text-[11px]">{a.feedback || 'No feedback yet.'}</div>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-emerald-400 text-sm">{a.score || 'N/A'}</span>
                    <span className="text-[10px] text-slate-500 block">/ {a.total_marks}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="glass-card rounded-2xl p-5 space-y-4">
            <h3 className="font-bold text-base text-white font-display flex items-center space-x-2">
              <BookOpen className="w-5 h-5 text-purple-400" />
              <span>Tutor Session Logs & Homework</span>
            </h3>

            <div className="space-y-3">
              {currentChild.sessionLogs?.map((log: any) => (
                <div key={log.id} className="p-3.5 rounded-xl bg-purple-950/30 border border-purple-900/40 space-y-1.5 text-xs">
                  <div className="font-bold text-purple-300">{log.session_title}</div>
                  <div className="text-slate-300"><strong>Topics Covered:</strong> {log.topics_covered}</div>
                  {log.homework && <div className="text-purple-400"><strong>Homework Assigned:</strong> {log.homework}</div>}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB: ATTENDANCE */}
      {activeTab === 'attendance' && (
        <div className="space-y-6">
          <h2 className="text-xl font-bold font-display text-white flex items-center space-x-2">
            <CheckSquare className="w-5 h-5 text-emerald-500" />
            <span>Child Attendance History</span>
          </h2>

          <div className="glass-card rounded-2xl p-5 space-y-3">
            <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-800/60 border border-slate-700 text-xs">
              <div>
                <div className="font-bold text-white">Session 1: Structural & Creational Design Patterns</div>
                <div className="text-slate-400 text-[11px]">Recorded on time</div>
              </div>
              <span className="px-3 py-1 rounded-lg text-xs font-bold bg-emerald-950 text-emerald-300 border border-emerald-800">
                PRESENT
              </span>
            </div>
          </div>
        </div>
      )}

      {/* TAB: SESSION LOGS */}
      {activeTab === 'session-logs' && (
        <div className="space-y-6">
          <h2 className="text-xl font-bold font-display text-white flex items-center space-x-2">
            <ClipboardList className="w-5 h-5 text-indigo-400" />
            <span>Child Session Logs & Lesson Documentation</span>
          </h2>

          <div className="space-y-3">
            {currentChild.sessionLogs?.map((log: any) => (
              <div key={log.id} className="glass-card rounded-2xl p-5 space-y-2 text-xs">
                <div className="font-bold text-white text-sm">{log.session_title}</div>
                <div className="text-slate-300"><strong>Topics Covered:</strong> {log.topics_covered}</div>
                {log.homework && <div className="text-purple-400 font-semibold"><strong>Homework Assigned:</strong> {log.homework}</div>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB: ANNOUNCEMENTS */}
      {activeTab === 'announcements' && (
        <div className="space-y-6">
          <h2 className="text-xl font-bold font-display text-white flex items-center space-x-2">
            <Megaphone className="w-5 h-5 text-purple-500" />
            <span>Tutor Announcements</span>
          </h2>

          <div className="glass-card rounded-2xl p-5 space-y-3">
            <div className="p-4 rounded-xl bg-purple-950/40 border border-purple-900/50 space-y-2 text-xs">
              <div className="font-bold text-white text-sm">📢 Midterm Project Demo Guidelines Released</div>
              <p className="text-slate-300">The CSE327 project demo presentation schedule has been posted. Make sure your design patterns implementation is cleanly documented!</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
