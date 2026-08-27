import React, { useEffect, useState } from 'react';
import { MessageSquare, Send, PlusCircle, X, Search, UserCircle } from 'lucide-react';
import { chatApi, apiRequest } from '../services/api';
import { ChatConversation, ChatMessage, User } from '../types';

interface ChatPageProps {
  currentUser: User;
}

export const ChatPage: React.FC<ChatPageProps> = ({ currentUser }) => {
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [activeConvId, setActiveConvId] = useState<number | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMsg, setInputMsg] = useState('');
  const [loading, setLoading] = useState(true);

  // New conversation modal
  const [showNewChat, setShowNewChat] = useState(false);
  const [availableUsers, setAvailableUsers] = useState<any[]>([]);
  const [userSearch, setUserSearch] = useState('');
  const [startingChat, setStartingChat] = useState(false);

  const messagesEndRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadConversations();
  }, []);

  useEffect(() => {
    if (activeConvId) {
      loadMessages(activeConvId);
      const timer = setInterval(() => loadMessages(activeConvId), 4000);
      return () => clearInterval(timer);
    }
  }, [activeConvId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadConversations = async () => {
    try {
      setLoading(true);
      const res = await chatApi.getConversations();
      if (res.success) {
        setConversations(res.conversations);
        if (res.conversations.length > 0 && !activeConvId) {
          setActiveConvId(res.conversations[0].id);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async (convId: number) => {
    try {
      const res = await chatApi.getMessages(convId);
      if (res.success) {
        setMessages(res.messages);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeConvId || !inputMsg.trim()) return;
    try {
      const text = inputMsg;
      setInputMsg('');
      await chatApi.sendMessage(activeConvId, text);
      loadMessages(activeConvId);
    } catch (e) {
      console.error(e);
    }
  };

  const openNewChatModal = async () => {
    setShowNewChat(true);
    setUserSearch('');
    try {
      // Fetch all users except self to start a chat with
      const res = await apiRequest<any>('/chat/available-users');
      if (res.success) setAvailableUsers(res.users);
    } catch (e) {
      console.error(e);
    }
  };

  const startChatWith = async (targetUserId: number) => {
    setStartingChat(true);
    try {
      const res = await chatApi.startConversation(targetUserId);
      if (res.success) {
        setShowNewChat(false);
        await loadConversations();
        setActiveConvId(res.conversationId);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setStartingChat(false);
    }
  };

  if (loading) {
    return (
      <div className="h-[calc(100vh-8rem)] flex items-center justify-center text-xs text-slate-500">
        Loading chat conversations...
      </div>
    );
  }

  const activeConv = conversations.find(c => c.id === activeConvId);
  const filteredUsers = availableUsers.filter(u =>
    u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
    u.role.toLowerCase().includes(userSearch.toLowerCase())
  );

  const roleColor = (role: string) => {
    if (role === 'TUTOR') return 'bg-brand-950 text-brand-300 border-brand-800';
    if (role === 'STUDENT') return 'bg-emerald-950 text-emerald-300 border-emerald-800';
    return 'bg-purple-950 text-purple-300 border-purple-800';
  };

  return (
    <div className="h-[calc(100vh-8rem)] glass-card rounded-3xl border border-slate-200 dark:border-slate-800 flex overflow-hidden shadow-xl relative">

      {/* Conversations List Sidebar */}
      <div className="w-80 border-r border-slate-200 dark:border-slate-800 flex flex-col bg-slate-50/50 dark:bg-slate-900/50 shrink-0">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <MessageSquare className="w-5 h-5 text-brand-600" />
            <h3 className="font-bold text-sm text-slate-900 dark:text-white font-display">
              Direct Messaging
            </h3>
          </div>
          <button
            onClick={openNewChatModal}
            title="Start new conversation"
            className="p-1.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white transition-all shadow"
          >
            <PlusCircle className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {conversations.length === 0 && (
            <div className="p-4 text-center text-xs text-slate-500 space-y-2">
              <MessageSquare className="w-8 h-8 mx-auto opacity-30" />
              <p>No conversations yet.</p>
              <button
                onClick={openNewChatModal}
                className="px-3 py-1.5 bg-brand-600 text-white rounded-xl text-xs font-bold"
              >
                Start a Chat
              </button>
            </div>
          )}
          {conversations.map((conv) => {
            const isSelected = conv.id === activeConvId;
            return (
              <button
                key={conv.id}
                onClick={() => setActiveConvId(conv.id)}
                className={`w-full p-3 rounded-2xl text-left transition-all flex items-center space-x-3 ${
                  isSelected
                    ? 'bg-brand-500 text-white shadow-md'
                    : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                }`}
              >
                <div className="w-10 h-10 rounded-xl bg-slate-200 dark:bg-slate-700 flex items-center justify-center font-bold text-sm shrink-0 text-slate-700 dark:text-slate-200">
                  {conv.otherParticipant?.name?.charAt(0) || 'C'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs truncate">{conv.otherParticipant?.name || conv.title}</span>
                    {conv.otherParticipant?.role && (
                      <span className={`ml-1 shrink-0 text-[9px] font-bold px-1.5 py-0.5 rounded border ${isSelected ? 'bg-white/20 text-white border-white/30' : roleColor(conv.otherParticipant.role)}`}>
                        {conv.otherParticipant.role}
                      </span>
                    )}
                  </div>
                  <p className={`text-[11px] truncate mt-0.5 ${isSelected ? 'text-brand-100' : 'text-slate-500'}`}>
                    {conv.last_message || 'No messages yet — say hello!'}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Active Conversation Messages */}
      <div className="flex-1 flex flex-col bg-white dark:bg-slate-900 min-w-0">
        {activeConv ? (
          <>
            {/* Header */}
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center space-x-3">
              <div className="w-9 h-9 rounded-xl bg-brand-100 text-brand-700 dark:bg-brand-950 dark:text-brand-300 flex items-center justify-center font-bold text-sm shrink-0">
                {activeConv.otherParticipant?.name?.charAt(0) || 'C'}
              </div>
              <div>
                <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                  {activeConv.otherParticipant?.name || activeConv.title}
                </h4>
                <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded border ${roleColor(activeConv.otherParticipant?.role || '')}`}>
                  {activeConv.otherParticipant?.role || 'Member'}
                </span>
              </div>
            </div>

            {/* Messages Scroll Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.length === 0 && (
                <div className="flex flex-col items-center justify-center h-full text-xs text-slate-400 space-y-2">
                  <MessageSquare className="w-10 h-10 opacity-20" />
                  <p>No messages yet. Be the first to say something!</p>
                </div>
              )}
              {messages.map((m) => {
                const isMe = m.sender_id === currentUser.id;
                return (
                  <div key={m.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-md p-3.5 rounded-2xl text-xs space-y-1 shadow-sm ${
                      isMe
                        ? 'bg-brand-600 text-white rounded-br-none'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-bl-none'
                    }`}>
                      <div className="font-semibold text-[10px] opacity-80">{m.sender_name}</div>
                      <p className="leading-relaxed">{m.content}</p>
                      <div className="text-[9px] opacity-60 text-right">
                        {new Date(m.sent_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Form */}
            <form onSubmit={handleSend} className="p-3 border-t border-slate-200 dark:border-slate-800 flex items-center space-x-2">
              <input
                type="text"
                placeholder="Type your message..."
                value={inputMsg}
                onChange={(e) => setInputMsg(e.target.value)}
                className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs focus:ring-2 focus:ring-brand-500 outline-none text-slate-900 dark:text-white"
              />
              <button
                type="submit"
                disabled={!inputMsg.trim()}
                className="p-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 disabled:opacity-40 text-white font-bold shadow-md transition-all"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-xs text-slate-400 space-y-3">
            <MessageSquare className="w-12 h-12 opacity-20" />
            <p>Select a conversation or start a new one.</p>
            <button
              onClick={openNewChatModal}
              className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl text-xs flex items-center gap-2 shadow"
            >
              <PlusCircle className="w-4 h-4" />
              Start New Chat
            </button>
          </div>
        )}
      </div>

      {/* New Chat Modal */}
      {showNewChat && (
        <div className="absolute inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 rounded-3xl">
          <div className="bg-slate-900 rounded-3xl p-6 w-full max-w-sm shadow-2xl border border-slate-700 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <PlusCircle className="w-5 h-5 text-brand-400" />
                <h3 className="font-bold text-white font-display">New Conversation</h3>
              </div>
              <button onClick={() => setShowNewChat(false)} className="text-slate-400 hover:text-slate-200">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Search */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search by name or role..."
                value={userSearch}
                onChange={e => setUserSearch(e.target.value)}
                autoFocus
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:ring-2 focus:ring-brand-500 outline-none placeholder:text-slate-600"
              />
            </div>

            <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
              {filteredUsers.length === 0 && (
                <div className="text-center text-xs text-slate-500 py-6">
                  <UserCircle className="w-8 h-8 mx-auto opacity-30 mb-2" />
                  No users found.
                </div>
              )}
              {filteredUsers.map(u => (
                <button
                  key={u.id}
                  disabled={startingChat}
                  onClick={() => startChatWith(u.id)}
                  className="w-full flex items-center gap-3 p-3 rounded-2xl bg-slate-800/60 hover:bg-slate-700/80 border border-slate-700 text-left transition-all group"
                >
                  <div className="w-9 h-9 rounded-xl bg-slate-700 flex items-center justify-center font-bold text-sm text-white shrink-0">
                    {u.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-xs text-white truncate">{u.name}</div>
                    <div className="text-[10px] text-slate-400">{u.email}</div>
                  </div>
                  <span className={`shrink-0 text-[9px] font-bold px-1.5 py-0.5 rounded border ${roleColor(u.role)}`}>
                    {u.role}
                  </span>
                </button>
              ))}
            </div>

            <p className="text-[10px] text-slate-500 text-center">
              If a conversation already exists, you'll be taken to it directly.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
