import React from 'react';
import {
  LayoutDashboard,
  Calendar as CalendarIcon,
  BookOpen,
  FileText,
  HelpCircle,
  CheckSquare,
  ClipboardList,
  Megaphone,
  MessageSquare,
  TrendingUp,
  Users,
  Code
} from 'lucide-react';
import { UserRole } from '../types';

interface SidebarProps {
  role: UserRole;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ role, activeTab, setActiveTab }) => {

  const tutorItems = [
    { id: 'dashboard', label: 'Overview Dashboard', icon: LayoutDashboard },
    { id: 'batches', label: 'Batches & Students', icon: Users },
    { id: 'calendar', label: 'Session Calendar', icon: CalendarIcon },
    { id: 'materials', label: 'Learning Materials', icon: BookOpen },
    { id: 'assignments', label: 'Assignments & Grading', icon: FileText },
    { id: 'quizzes', label: 'Quiz Center', icon: HelpCircle },
    { id: 'attendance', label: 'Mark Attendance', icon: CheckSquare },
    { id: 'session-logs', label: 'Session Logs', icon: ClipboardList },
    { id: 'announcements', label: 'Announcements', icon: Megaphone },
    { id: 'chat', label: 'Messages / Chat', icon: MessageSquare },
    { id: 'patterns', label: '8 Design Patterns Proof', icon: Code, highlight: true },
  ];

  const studentItems = [
    { id: 'dashboard', label: 'Student Dashboard', icon: LayoutDashboard },
    { id: 'calendar', label: 'My Schedule', icon: CalendarIcon },
    { id: 'materials', label: 'Course Materials', icon: BookOpen },
    { id: 'assignments', label: 'My Assignments', icon: FileText },
    { id: 'quizzes', label: 'Take Quizzes', icon: HelpCircle },
    { id: 'progress', label: 'Grades & Analytics', icon: TrendingUp },
    { id: 'session-logs', label: 'Session Logs', icon: ClipboardList },
    { id: 'announcements', label: 'Announcements', icon: Megaphone },
    { id: 'chat', label: 'Chat with Tutor', icon: MessageSquare },
    { id: 'patterns', label: '8 Design Patterns Proof', icon: Code, highlight: true },
  ];

  const parentItems = [
    { id: 'dashboard', label: 'Parent Dashboard', icon: LayoutDashboard },
    { id: 'progress', label: 'Child Performance', icon: TrendingUp },
    { id: 'attendance', label: 'Child Attendance', icon: CheckSquare },
    { id: 'session-logs', label: 'Session Logs', icon: ClipboardList },
    { id: 'announcements', label: 'Announcements', icon: Megaphone },
    { id: 'chat', label: 'Chat with Tutor', icon: MessageSquare },
    { id: 'patterns', label: '8 Design Patterns Proof', icon: Code, highlight: true },
  ];

  const navItems = role === 'TUTOR' ? tutorItems : role === 'STUDENT' ? studentItems : parentItems;

  return (
    <aside className="w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col py-4 hidden md:flex shrink-0">
      <div className="px-4 mb-2">
        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
          Navigation ({role})
        </span>
      </div>

      <nav className="flex-1 space-y-1 px-3">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
                isActive
                  ? 'bg-brand-500 text-white shadow-md shadow-brand-500/20 font-semibold'
                  : item.highlight
                  ? 'bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300 hover:bg-purple-100 dark:hover:bg-purple-900/40 border border-purple-200 dark:border-purple-800'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-white' : item.highlight ? 'text-purple-600 dark:text-purple-400' : 'text-slate-400'}`} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Course Meta Footnote */}
      <div className="p-4 mx-3 mt-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60 text-[11px] text-slate-500 dark:text-slate-400 space-y-1">
        <div className="font-semibold text-slate-700 dark:text-slate-300">CSE327 Project Prototype</div>
        <div>Tutor Management System</div>
        <div className="text-[10px] text-brand-600 dark:text-brand-400 font-medium">8 Design Patterns Integrated</div>
      </div>
    </aside>
  );
};
