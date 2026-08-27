import React, { useState } from 'react';
import { Shield, Sparkles, User, Key, ArrowRight, CheckCircle2, UserPlus, Mail, Phone, BookOpen, GraduationCap, Briefcase, ChevronDown } from 'lucide-react';
import { authApi } from '../services/api';
import { User as UserType } from '../types';

interface LoginPageProps {
  onLoginSuccess: (user: UserType, token: string) => void;
}

type AuthMode = 'login' | 'register';
type RegisterRole = 'TUTOR' | 'STUDENT' | 'PARENT';

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
  const [mode, setMode] = useState<AuthMode>('login');

  // Login state
  const [email, setEmail] = useState('tutor@tms.edu');
  const [password, setPassword] = useState('password123');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Register state
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regRole, setRegRole] = useState<RegisterRole>('STUDENT');
  const [regSpecialization, setRegSpecialization] = useState('');
  const [regInstitution, setRegInstitution] = useState('');
  const [regAcademicLevel, setRegAcademicLevel] = useState('Undergraduate');
  const [regOccupation, setRegOccupation] = useState('');

  const demoAccounts = [
    { name: 'Dr. Alan Turing', role: 'TUTOR', email: 'tutor@tms.edu', desc: 'Tutor (CSE327 Lead Instructor)' },
    { name: 'Rahul Sharma', role: 'STUDENT', email: 'rahul@student.tms.edu', desc: '1-on-1 Student (NSU)' },
    { name: 'Ananya Roy', role: 'STUDENT', email: 'ananya@student.tms.edu', desc: 'Batch Student (BRACU)' },
    { name: 'Mrs. Sunita Sharma', role: 'PARENT', email: 'mrs.sharma@parent.tms.edu', desc: 'Parent of Rahul' },
  ];

  const handleLogin = async (e?: React.FormEvent, overrideEmail?: string) => {
    if (e) e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const loginEmail = overrideEmail || email;
      const res = await authApi.login({ email: loginEmail, password });
      if (res.success) {
        localStorage.setItem('tms_token', res.token);
        onLoginSuccess(res.user, res.token);
      }
    } catch (err: any) {
      setError(err.message || 'Login failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (regPassword !== regConfirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (regPassword.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    setLoading(true);
    try {
      const payload: any = {
        name: regName,
        email: regEmail,
        password: regPassword,
        role: regRole,
        phone: regPhone,
      };
      if (regRole === 'TUTOR') payload.specialization = regSpecialization;
      if (regRole === 'STUDENT') { payload.institution = regInstitution; payload.academicLevel = regAcademicLevel; }
      if (regRole === 'PARENT') payload.occupation = regOccupation;

      const res = await authApi.register(payload);
      if (res.success) {
        localStorage.setItem('tms_token', res.token);
        onLoginSuccess(res.user, res.token);
      }
    } catch (err: any) {
      setError(err.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  const selectDemoAccount = (accEmail: string) => {
    setEmail(accEmail);
    setPassword('password123');
    handleLogin(undefined, accEmail);
  };

  const switchMode = (m: AuthMode) => {
    setMode(m);
    setError('');
  };

  const roleColors: Record<RegisterRole, string> = {
    TUTOR: 'from-brand-600 to-brand-800',
    STUDENT: 'from-emerald-600 to-teal-800',
    PARENT: 'from-purple-600 to-purple-800',
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Dynamic Background Accents */}
      <div className="absolute top-0 -left-20 w-96 h-96 bg-brand-600/30 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-0 -right-20 w-96 h-96 bg-purple-600/30 rounded-full blur-3xl pointer-events-none"></div>

      <div className="w-full max-w-4xl bg-slate-900/80 backdrop-blur-2xl rounded-3xl border border-slate-800 shadow-2xl overflow-hidden relative z-10">

        {/* Top Mode Switcher Tabs */}
        <div className="flex border-b border-slate-800">
          <button
            onClick={() => switchMode('login')}
            className={`flex-1 py-4 text-sm font-bold transition-all flex items-center justify-center gap-2 ${mode === 'login' ? 'bg-brand-600/20 text-brand-300 border-b-2 border-brand-500' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'}`}
          >
            <Key className="w-4 h-4" />
            Sign In
          </button>
          <button
            onClick={() => switchMode('register')}
            className={`flex-1 py-4 text-sm font-bold transition-all flex items-center justify-center gap-2 ${mode === 'register' ? 'bg-purple-600/20 text-purple-300 border-b-2 border-purple-500' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'}`}
          >
            <UserPlus className="w-4 h-4" />
            Create Account
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2">
          {/* Left Info Panel */}
          <div className="p-8 sm:p-10 bg-gradient-to-br from-brand-900/50 to-purple-950/50 flex flex-col justify-between border-b md:border-b-0 md:border-r border-slate-800">
            <div>
              <div className="flex items-center space-x-2 mb-6">
                <div className="w-10 h-10 rounded-xl bg-brand-500 flex items-center justify-center text-white shadow-lg shadow-brand-500/30">
                  <Shield className="w-6 h-6" />
                </div>
                <div>
                  <span className="font-display font-bold text-xl text-white block">Tutor Management</span>
                  <span className="text-xs font-semibold text-brand-400">CSE327 Software Engineering</span>
                </div>
              </div>

              <h1 className="text-2xl font-bold font-display text-white leading-tight mb-3">
                {mode === 'login' ? 'Welcome Back!' : 'Join the Platform'}
              </h1>
              <p className="text-xs text-slate-300 leading-relaxed mb-6">
                {mode === 'login'
                  ? 'Sign in to access your personalized dashboard for tutoring, classes, quizzes, assignments and more.'
                  : 'Create your account as a Tutor, Student, or Parent to get started with the full platform experience.'}
              </p>

              <div className="space-y-2.5 text-xs text-slate-300">
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span><strong>8 GoF Classic Design Patterns</strong> explicitly built into backend</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Full Java Source Code Export for faculty evaluation</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Role-based RBAC Authentication & Dashboards</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>MCQ & Video Call Exam Support</span>
                </div>
              </div>
            </div>

            <div className="pt-8 text-[11px] text-slate-500 border-t border-slate-800 mt-6">
              CSE327 Semester Project Prototype • 2026
            </div>
          </div>

          {/* Right Panel */}
          <div className="p-8 sm:p-10 flex flex-col justify-center">
            {mode === 'login' ? (
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-bold font-display text-white mb-1">Sign In</h2>
                  <p className="text-xs text-slate-400">Use your credentials or pick a demo role below.</p>
                </div>

                {/* Quick Demo Role Picker */}
                <div className="space-y-2">
                  <div className="flex items-center text-[11px] font-semibold text-purple-400 uppercase tracking-wider gap-1">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>1-Click Faculty Demo Switcher</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {demoAccounts.map((acc) => (
                      <button
                        key={acc.email}
                        type="button"
                        onClick={() => selectDemoAccount(acc.email)}
                        className="p-2.5 rounded-xl bg-slate-800/80 hover:bg-brand-600/30 border border-slate-700/80 text-left transition-all group"
                      >
                        <div className="text-xs font-bold text-slate-200 group-hover:text-brand-300 truncate">{acc.name}</div>
                        <div className="text-[10px] text-slate-400 truncate">{acc.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="relative flex items-center justify-center">
                  <div className="border-t border-slate-800 w-full"></div>
                  <span className="bg-slate-900 px-3 text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Or Enter Credentials</span>
                </div>

                {error && (
                  <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-800 text-rose-300 text-xs">{error}</div>
                )}

                <form onSubmit={handleLogin} className="space-y-4 text-xs">
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Email Address</label>
                    <div className="relative">
                      <User className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white focus:ring-2 focus:ring-brand-500 outline-none"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Password</label>
                    <div className="relative">
                      <Key className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                      <input
                        type="password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white focus:ring-2 focus:ring-brand-500 outline-none"
                      />
                    </div>
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-brand-600 to-purple-600 hover:from-brand-500 hover:to-purple-500 text-white font-bold shadow-lg shadow-brand-600/30 transition-all flex items-center justify-center space-x-2"
                  >
                    <span>{loading ? 'Authenticating...' : 'Sign In to Portal'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>

                <p className="text-center text-xs text-slate-500">
                  No account?{' '}
                  <button onClick={() => switchMode('register')} className="text-purple-400 hover:text-purple-300 font-semibold transition-colors">
                    Create one here
                  </button>
                </p>
              </div>
            ) : (
              /* ── Register Form ── */
              <div className="space-y-5">
                <div>
                  <h2 className="text-lg font-bold font-display text-white mb-1">Create Account</h2>
                  <p className="text-xs text-slate-400">Fill in your details to register as Tutor, Student, or Parent.</p>
                </div>

                {error && (
                  <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-800 text-rose-300 text-xs">{error}</div>
                )}

                {/* Role Selector */}
                <div className="grid grid-cols-3 gap-2 text-xs">
                  {(['TUTOR', 'STUDENT', 'PARENT'] as RegisterRole[]).map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setRegRole(r)}
                      className={`py-2 rounded-xl border font-bold transition-all ${regRole === r
                        ? 'bg-gradient-to-br ' + roleColors[r] + ' border-transparent text-white shadow-lg'
                        : 'bg-slate-800/60 border-slate-700 text-slate-400 hover:text-slate-200'
                        }`}
                    >
                      {r === 'TUTOR' ? '🎓 Tutor' : r === 'STUDENT' ? '📚 Student' : '👨‍👩‍👧 Parent'}
                    </button>
                  ))}
                </div>

                <form onSubmit={handleRegister} className="space-y-3 text-xs">
                  {/* Full Name */}
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Full Name *</label>
                    <div className="relative">
                      <User className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                      <input type="text" required value={regName} onChange={e => setRegName(e.target.value)}
                        placeholder="Your full name"
                        className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white focus:ring-2 focus:ring-purple-500 outline-none placeholder:text-slate-600" />
                    </div>
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Email Address *</label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                      <input type="email" required value={regEmail} onChange={e => setRegEmail(e.target.value)}
                        placeholder="your@email.com"
                        className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white focus:ring-2 focus:ring-purple-500 outline-none placeholder:text-slate-600" />
                    </div>
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Phone (optional)</label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                      <input type="tel" value={regPhone} onChange={e => setRegPhone(e.target.value)}
                        placeholder="+880..."
                        className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white focus:ring-2 focus:ring-purple-500 outline-none placeholder:text-slate-600" />
                    </div>
                  </div>

                  {/* Role-specific fields */}
                  {regRole === 'TUTOR' && (
                    <div>
                      <label className="block text-slate-300 font-semibold mb-1">Specialization</label>
                      <div className="relative">
                        <BookOpen className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                        <input type="text" value={regSpecialization} onChange={e => setRegSpecialization(e.target.value)}
                          placeholder="e.g. Mathematics, CS, Physics"
                          className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white focus:ring-2 focus:ring-brand-500 outline-none placeholder:text-slate-600" />
                      </div>
                    </div>
                  )}

                  {regRole === 'STUDENT' && (
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-slate-300 font-semibold mb-1">Institution</label>
                        <div className="relative">
                          <GraduationCap className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                          <input type="text" value={regInstitution} onChange={e => setRegInstitution(e.target.value)}
                            placeholder="NSU, BRACU..."
                            className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white focus:ring-2 focus:ring-emerald-500 outline-none placeholder:text-slate-600" />
                        </div>
                      </div>
                      <div>
                        <label className="block text-slate-300 font-semibold mb-1">Level</label>
                        <div className="relative">
                          <ChevronDown className="w-4 h-4 text-slate-500 absolute right-3 top-3 pointer-events-none" />
                          <select value={regAcademicLevel} onChange={e => setRegAcademicLevel(e.target.value)}
                            className="w-full pr-9 pl-3 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white focus:ring-2 focus:ring-emerald-500 outline-none appearance-none">
                            <option>Undergraduate</option>
                            <option>Postgraduate</option>
                            <option>High School</option>
                            <option>Middle School</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  )}

                  {regRole === 'PARENT' && (
                    <div>
                      <label className="block text-slate-300 font-semibold mb-1">Occupation</label>
                      <div className="relative">
                        <Briefcase className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                        <input type="text" value={regOccupation} onChange={e => setRegOccupation(e.target.value)}
                          placeholder="e.g. Engineer, Doctor, Guardian"
                          className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white focus:ring-2 focus:ring-purple-500 outline-none placeholder:text-slate-600" />
                      </div>
                    </div>
                  )}

                  {/* Password */}
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-slate-300 font-semibold mb-1">Password *</label>
                      <div className="relative">
                        <Key className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                        <input type="password" required value={regPassword} onChange={e => setRegPassword(e.target.value)}
                          placeholder="Min 6 chars"
                          className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white focus:ring-2 focus:ring-purple-500 outline-none placeholder:text-slate-600" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-slate-300 font-semibold mb-1">Confirm *</label>
                      <div className="relative">
                        <Key className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                        <input type="password" required value={regConfirmPassword} onChange={e => setRegConfirmPassword(e.target.value)}
                          placeholder="Repeat password"
                          className={`w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-800 border text-white focus:ring-2 outline-none placeholder:text-slate-600 ${regConfirmPassword && regPassword !== regConfirmPassword ? 'border-rose-600 focus:ring-rose-500' : 'border-slate-700 focus:ring-purple-500'}`} />
                      </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-600 to-brand-600 hover:from-purple-500 hover:to-brand-500 text-white font-bold shadow-lg shadow-purple-600/30 transition-all flex items-center justify-center gap-2 mt-2"
                  >
                    <UserPlus className="w-4 h-4" />
                    <span>{loading ? 'Creating Account...' : `Register as ${regRole}`}</span>
                  </button>
                </form>

                <p className="text-center text-xs text-slate-500">
                  Already have an account?{' '}
                  <button onClick={() => switchMode('login')} className="text-brand-400 hover:text-brand-300 font-semibold transition-colors">
                    Sign in here
                  </button>
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
