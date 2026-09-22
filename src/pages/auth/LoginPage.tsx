import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Lock, Building2, User, ArrowRight, Shield, Sparkles } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { setActiveView, currentUser, switchUserRole } = useApp();
  const [workspaceCode, setWorkspaceCode] = useState('ARENA-01');
  const [username, setUsername] = useState('admin@cuedesk.club');
  const [password, setPassword] = useState('••••••••••••');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      // In Phase 1 foundation: navigate directly into the active role dashboard
      setIsSubmitting(false);
      setActiveView('dashboard');
    }, 400);
  };

  return (
    <div className="min-h-screen bg-[#060908] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Refined Ambient Billiard Felt Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-emerald-900/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-80 h-80 bg-amber-600/5 rounded-full blur-3xl pointer-events-none" />

      <div className="relative w-full max-w-md bg-[#0e1612] border border-emerald-900/30 rounded-3xl p-7 sm:p-9 shadow-2xl shadow-black/80 space-y-7 backdrop-blur-xl">
        {/* CueDesk Brand Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-600/30 to-emerald-950/80 border border-emerald-500/30 text-emerald-400 shadow-lg shadow-emerald-950/60 mb-1">
            <div className="relative flex items-center justify-center">
              <span className="w-5 h-5 rounded-full bg-emerald-500/20 border border-emerald-400 flex items-center justify-center text-[10px] font-black text-emerald-300">
                8
              </span>
            </div>
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center justify-center gap-1.5">
              Cue<span className="text-emerald-400">Desk</span>
            </h1>
            <p className="text-xs text-slate-400 font-medium mt-1">
              Snooker & Billiards Club Management System
            </p>
          </div>
        </div>

        {/* Credentials Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Workspace / Club Code
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                <Building2 className="w-4 h-4 text-emerald-500/60" />
              </div>
              <input
                type="text"
                required
                value={workspaceCode}
                onChange={(e) => setWorkspaceCode(e.target.value)}
                placeholder="e.g. ARENA-01 or club code"
                className="w-full bg-[#080d0a] border border-emerald-950/80 focus:border-emerald-500/60 text-white text-xs sm:text-sm rounded-xl pl-10 pr-3.5 py-3 transition focus:outline-none focus:ring-1 focus:ring-emerald-500/40 font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Username or Registered Email
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                <User className="w-4 h-4 text-emerald-500/60" />
              </div>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="name@club.com or username"
                className="w-full bg-[#080d0a] border border-emerald-950/80 focus:border-emerald-500/60 text-white text-xs sm:text-sm rounded-xl pl-10 pr-3.5 py-3 transition focus:outline-none focus:ring-1 focus:ring-emerald-500/40"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-300">
                Password
              </label>
              <button
                type="button"
                onClick={() => alert('Password recovery link has been dispatched to workspace administrator email.')}
                className="text-[11px] text-amber-400 hover:text-amber-300 font-medium transition"
              >
                Forgot Password?
              </button>
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                <Lock className="w-4 h-4 text-emerald-500/60" />
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className="w-full bg-[#080d0a] border border-emerald-950/80 focus:border-emerald-500/60 text-white text-xs sm:text-sm rounded-xl pl-10 pr-3.5 py-3 transition focus:outline-none focus:ring-1 focus:ring-emerald-500/40 font-mono"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full mt-2 py-3.5 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-bold text-xs sm:text-sm rounded-xl shadow-lg shadow-emerald-950/60 transition active:scale-[0.99] flex items-center justify-center gap-2 border border-emerald-400/20 disabled:opacity-50 cursor-pointer"
          >
            <span>{isSubmitting ? 'Authenticating...' : 'Sign In to Workspace'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Security & System Info Footer */}
        <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[11px] text-slate-500">
          <div className="flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5 text-emerald-500/70" />
            <span>Role-Based Access Verified</span>
          </div>
          <span className="font-mono text-[10px] text-amber-500/70 font-semibold uppercase">
            CueDesk v2.0
          </span>
        </div>
      </div>
    </div>
  );
};
