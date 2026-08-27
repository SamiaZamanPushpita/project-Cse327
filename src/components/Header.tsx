import React, { useState, useEffect } from 'react';
import { Bell, Moon, Sun, Code, LogOut, User as UserIcon, Shield, ChevronDown } from 'lucide-react';
import { User } from '../types';
import { notificationApi } from '../services/api';

interface HeaderProps {
  user: User;
  onLogout: () => void;
  onOpenPatterns: () => void;
  darkMode: boolean;
  setDarkMode: (val: boolean) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  user,
  onLogout,
  onOpenPatterns,
  darkMode,
  setDarkMode,
  activeTab,
  setActiveTab,
}) => {
  const [unreadCount, setUnreadCount] = useState(0);
  const [showUserMenu, setShowUserMenu] = useState(false);

  useEffect(() => {
    fetchUnread();
    const timer = setInterval(fetchUnread, 15000);
    return () => clearInterval(timer);
  }, []);

  const fetchUnread = async () => {
    try {
      const res = await notificationApi.getNotifications();
      if (res.success) {
        setUnreadCount(res.unreadCount || 0);
      }
    } catch (e) {
      // silent catch
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'TUTOR':
        return 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300 border-purple-200 dark:border-purple-800';
      case 'STUDENT':
        return 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800';
      case 'PARENT':
        return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800';
      default:
        return 'bg-slate-100 text-slate-700';
    }
  };

  return (
    <header className="sticky top-0 z-30 h-16 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-4 sm:px-6 flex items-center justify-between transition-colors">
      <div className="flex items-center space-x-3">
        <div className="flex items-center space-x-2 cursor-pointer" onClick={() => setActiveTab('dashboard')}>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-purple-600 flex items-center justify-center text-white shadow-md shadow-brand-500/20">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <span className="font-display font-bold text-lg text-slate-900 dark:text-white leading-tight block">
              TMS Portal
            </span>
            <span className="text-[10px] uppercase tracking-wider font-semibold text-brand-600 dark:text-brand-400 block">
              CSE327 Software Eng
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center space-x-2 sm:space-x-4">
        {/* GoF Design Patterns Button */}
        <button
          onClick={onOpenPatterns}
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-gradient-to-r from-purple-600 to-brand-600 text-white shadow-sm hover:opacity-95 transition-all transform hover:-translate-y-0.5"
          title="Inspect 8 GoF Design Patterns in Action"
        >
          <Code className="w-4 h-4" />
          <span className="hidden sm:inline">GoF Patterns (8)</span>
        </button>

        {/* Notifications Toggle */}
        <button
          onClick={() => setActiveTab('notifications')}
          className={`relative p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors ${
            activeTab === 'notifications' ? 'bg-slate-100 dark:bg-slate-800 text-brand-600' : ''
          }`}
          title="Notifications"
        >
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 w-4 h-4 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
              {unreadCount}
            </span>
          )}
        </button>

        {/* Dark Mode Toggle */}
        <button
          onClick={() => setDarkMode(!darkMode)}
          className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          title="Toggle Theme"
        >
          {darkMode ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-slate-600" />}
        </button>

        <div className="h-6 w-px bg-slate-200 dark:bg-slate-800 mx-1"></div>

        {/* User Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center space-x-2 p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <img
              src={user.profileImage || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`}
              alt={user.name}
              className="w-8 h-8 rounded-lg object-cover border border-slate-200 dark:border-slate-700"
            />
            <div className="text-left hidden md:block">
              <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 block leading-tight">
                {user.name}
              </span>
              <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold border uppercase inline-block ${getRoleBadgeColor(user.role)}`}>
                {user.role}
              </span>
            </div>
            <ChevronDown className="w-4 h-4 text-slate-400" />
          </button>

          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 py-2 z-50 animate-in fade-in slide-in-from-top-2">
              <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-700">
                <p className="text-xs font-semibold text-slate-900 dark:text-white">{user.name}</p>
                <p className="text-[11px] text-slate-500 truncate">{user.email}</p>
              </div>
              
              <button
                onClick={() => { setShowUserMenu(false); onOpenPatterns(); }}
                className="w-full text-left px-4 py-2 text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/50 flex items-center space-x-2"
              >
                <Code className="w-4 h-4 text-purple-500" />
                <span>Live Pattern Proof (Java/TS)</span>
              </button>

              <div className="my-1 border-t border-slate-100 dark:border-slate-700"></div>

              <button
                onClick={() => { setShowUserMenu(false); onLogout(); }}
                className="w-full text-left px-4 py-2 text-xs text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 flex items-center space-x-2"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
