import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { LoginPage } from './pages/LoginPage';
import { TutorDashboard } from './pages/TutorDashboard';
import { StudentDashboard } from './pages/StudentDashboard';
import { ParentDashboard } from './pages/ParentDashboard';
import { DesignPatternsShowcase } from './pages/DesignPatternsShowcase';
import { ChatPage } from './pages/ChatPage';
import { NotificationsModal } from './components/NotificationsModal';
import { User } from './types';
import { authApi } from './services/api';

export const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');

  useEffect(() => {
    // Check dark mode preference
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setDarkMode(true);
    }

    // Verify existing session
    const token = localStorage.getItem('tms_token');
    if (token) {
      authApi.me()
        .then(res => {
          if (res.success) {
            setUser(res.user);
          } else {
            localStorage.removeItem('tms_token');
          }
        })
        .catch(() => localStorage.removeItem('tms_token'))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const handleLoginSuccess = (loggedInUser: User, token: string) => {
    setUser(loggedInUser);
    setActiveTab('dashboard');
  };

  const handleLogout = () => {
    localStorage.removeItem('tms_token');
    setUser(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center text-xs">
        Initializing Tutor Management System...
      </div>
    );
  }

  if (!user) {
    return <LoginPage onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col transition-colors">
      <Header
        user={user}
        onLogout={handleLogout}
        onOpenPatterns={() => setActiveTab('patterns')}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      <div className="flex-1 flex overflow-hidden">
        <Sidebar role={user.role} activeTab={activeTab} setActiveTab={setActiveTab} />

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8">
          {activeTab === 'patterns' ? (
            <DesignPatternsShowcase />
          ) : activeTab === 'chat' ? (
            <ChatPage currentUser={user} />
          ) : activeTab === 'notifications' ? (
            <NotificationsModal setActiveTab={setActiveTab} />
          ) : user.role === 'TUTOR' ? (
            <TutorDashboard role={user.role} activeTab={activeTab} setActiveTab={setActiveTab} />
          ) : user.role === 'STUDENT' ? (
            <StudentDashboard role={user.role} activeTab={activeTab} setActiveTab={setActiveTab} />
          ) : (
            <ParentDashboard role={user.role} activeTab={activeTab} setActiveTab={setActiveTab} />
          )}
        </main>
      </div>
    </div>
  );
};
