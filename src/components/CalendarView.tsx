import React, { useState } from 'react';
import { Calendar as CalendarIcon, Clock, MapPin, User, Users, Plus, CheckCircle, XCircle, RefreshCw } from 'lucide-react';
import { Session, UserRole } from '../types';
import { tutorApi } from '../services/api';

interface CalendarViewProps {
  sessions: Session[];
  role: UserRole;
  onRefresh: () => void;
}

export const CalendarView: React.FC<CalendarViewProps> = ({ sessions, role, onRefresh }) => {
  const [filterType, setFilterType] = useState<string>('ALL');
  const [showScheduleModal, setShowScheduleModal] = useState(false);

  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [sessionType, setSessionType] = useState<'ONE_TO_ONE' | 'BATCH'>('BATCH');
  const [location, setLocation] = useState('Online (Google Meet)');
  const [submitting, setSubmitting] = useState(false);

  const filteredSessions = sessions.filter(s => {
    if (filterType === 'ONE_TO_ONE') return s.session_type === 'ONE_TO_ONE';
    if (filterType === 'BATCH') return s.session_type === 'BATCH';
    return true;
  });

  const handleScheduleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      await tutorApi.scheduleSession({
        title,
        description,
        startTime,
        endTime,
        sessionType,
        location,
        batchId: sessionType === 'BATCH' ? 1 : null,
        studentId: sessionType === 'ONE_TO_ONE' ? 1 : null,
      });
      setShowScheduleModal(false);
      setTitle('');
      setDescription('');
      onRefresh();
    } catch (err: any) {
      alert(err.message || 'Error scheduling session.');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">COMPLETED</span>;
      case 'CANCELLED':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300">CANCELLED</span>;
      case 'RESCHEDULED':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300">RESCHEDULED</span>;
      default:
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300">SCHEDULED</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold font-display text-slate-900 dark:text-white flex items-center space-x-2">
            <CalendarIcon className="w-5 h-5 text-brand-600" />
            <span>Interactive Session Calendar</span>
          </h2>
          <p className="text-xs text-slate-500">Supports both One-to-One and Batch-based session scheduling.</p>
        </div>

        <div className="flex items-center space-x-2">
          <div className="bg-white dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700 flex text-xs">
            <button
              onClick={() => setFilterType('ALL')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all ${filterType === 'ALL' ? 'bg-brand-500 text-white shadow-sm' : 'text-slate-600 dark:text-slate-400'}`}
            >
              All
            </button>
            <button
              onClick={() => setFilterType('BATCH')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all ${filterType === 'BATCH' ? 'bg-brand-500 text-white shadow-sm' : 'text-slate-600 dark:text-slate-400'}`}
            >
              Batches
            </button>
            <button
              onClick={() => setFilterType('ONE_TO_ONE')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all ${filterType === 'ONE_TO_ONE' ? 'bg-brand-500 text-white shadow-sm' : 'text-slate-600 dark:text-slate-400'}`}
            >
              1-on-1
            </button>
          </div>

          {role === 'TUTOR' && (
            <button
              onClick={() => setShowScheduleModal(true)}
              className="flex items-center space-x-1.5 px-3 py-2 bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold rounded-xl shadow-md transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Schedule Session</span>
            </button>
          )}
        </div>
      </div>

      {/* Sessions Grid */}
      {filteredSessions.length === 0 ? (
        <div className="glass-card p-12 text-center rounded-2xl text-slate-500 text-xs">
          No sessions found for the selected filter.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredSessions.map((session) => (
            <div
              key={session.id}
              className="glass-card rounded-2xl p-5 hover:shadow-lg transition-all space-y-3 relative overflow-hidden group"
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded-md text-[10px] font-semibold mb-1.5 ${
                    session.session_type === 'BATCH' ? 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300' : 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300'
                  }`}>
                    {session.session_type === 'BATCH' ? <Users className="w-3 h-3 mr-1" /> : <User className="w-3 h-3 mr-1" />}
                    {session.session_type === 'BATCH' ? 'Batch Session' : '1-on-1 Mentorship'}
                  </span>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white leading-snug">
                    {session.title}
                  </h3>
                </div>
                {getStatusBadge(session.status)}
              </div>

              {session.description && (
                <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                  {session.description}
                </p>
              )}

              <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300 pt-2 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-center space-x-2">
                  <Clock className="w-3.5 h-3.5 text-brand-500" />
                  <span>{new Date(session.start_time).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}</span>
                </div>

                <div className="flex items-center space-x-2">
                  <MapPin className="w-3.5 h-3.5 text-emerald-500" />
                  <span className="truncate">{session.location}</span>
                </div>

                {(session.batch_name || session.student_name) && (
                  <div className="flex items-center space-x-2 text-[11px] text-slate-400">
                    <User className="w-3.5 h-3.5" />
                    <span>{session.batch_name || session.student_name}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Schedule Modal */}
      {showScheduleModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 w-full max-w-md shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4 animate-in fade-in zoom-in-95">
            <h3 className="text-lg font-bold font-display text-slate-900 dark:text-white">
              Schedule New Session (Command Pattern)
            </h3>
            
            <form onSubmit={handleScheduleSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold mb-1">Session Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Design Patterns Practice Lab"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border dark:border-slate-700 dark:bg-slate-800 focus:ring-2 focus:ring-brand-500 outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Session Type</label>
                <select
                  value={sessionType}
                  onChange={(e: any) => setSessionType(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border dark:border-slate-700 dark:bg-slate-800 focus:ring-2 focus:ring-brand-500 outline-none"
                >
                  <option value="BATCH">Batch Session (CSE327 Batch)</option>
                  <option value="ONE_TO_ONE">1-on-1 Session (Rahul Sharma)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold mb-1">Start Time</label>
                  <input
                    type="datetime-local"
                    required
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border dark:border-slate-700 dark:bg-slate-800"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">End Time</label>
                  <input
                    type="datetime-local"
                    required
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border dark:border-slate-700 dark:bg-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1">Location / Video Link</label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border dark:border-slate-700 dark:bg-slate-800"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Description / Agenda</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Topics to cover..."
                  className="w-full px-3 py-2 rounded-xl border dark:border-slate-700 dark:bg-slate-800"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowScheduleModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-300 font-semibold hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold shadow-md"
                >
                  {submitting ? 'Executing Command...' : 'Schedule Session'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
