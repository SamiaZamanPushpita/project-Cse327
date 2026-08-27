import React, { useEffect, useState } from 'react';
import { Bell, CheckCircle, Info, Calendar, GraduationCap, X, CheckCheck } from 'lucide-react';
import { NotificationItem } from '../types';
import { notificationApi } from '../services/api';

interface NotificationsModalProps {
  onClose?: () => void;
  setActiveTab: (tab: string) => void;
}

export const NotificationsModal: React.FC<NotificationsModalProps> = ({ onClose, setActiveTab }) => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const res = await notificationApi.getNotifications();
      if (res.success) {
        setNotifications(res.notifications);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkRead = async (id: number) => {
    try {
      await notificationApi.markRead(id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: 1 } : n));
    } catch (e) {
      console.error(e);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationApi.markAllRead();
      setNotifications(prev => prev.map(n => ({ ...n, is_read: 1 })));
    } catch (e) {
      console.error(e);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'CALENDAR':
        return <Calendar className="w-4 h-4 text-blue-500" />;
      case 'ACADEMIC':
        return <CheckCircle className="w-4 h-4 text-emerald-500" />;
      default:
        return <Info className="w-4 h-4 text-brand-500" />;
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Bell className="w-5 h-5 text-brand-600" />
          <h2 className="text-xl font-bold font-display text-slate-900 dark:text-white">In-App Notifications</h2>
        </div>
        <button
          onClick={handleMarkAllRead}
          className="flex items-center space-x-1 text-xs font-semibold text-brand-600 dark:text-brand-400 hover:underline"
        >
          <CheckCheck className="w-4 h-4" />
          <span>Mark All Read</span>
        </button>
      </div>

      {loading ? (
        <div className="p-8 text-center text-xs text-slate-500">Loading notifications...</div>
      ) : notifications.length === 0 ? (
        <div className="p-8 text-center glass-card rounded-2xl text-slate-500 text-xs">
          No notifications yet.
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map((n) => (
            <div
              key={n.id}
              onClick={() => {
                handleMarkRead(n.id);
                if (n.link) setActiveTab(n.link.replace('/', ''));
              }}
              className={`p-4 rounded-xl border transition-all cursor-pointer flex items-start space-x-3 ${
                n.is_read
                  ? 'bg-white/60 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 opacity-75'
                  : 'bg-white dark:bg-slate-800 border-brand-200 dark:border-brand-900/50 shadow-sm'
              }`}
            >
              <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-700 shrink-0">
                {getTypeIcon(n.type)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">{n.title}</h4>
                  <span className="text-[10px] text-slate-400">{new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">{n.message}</p>
              </div>
              {!n.is_read && (
                <span className="w-2 h-2 rounded-full bg-brand-500 shrink-0 mt-2"></span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
