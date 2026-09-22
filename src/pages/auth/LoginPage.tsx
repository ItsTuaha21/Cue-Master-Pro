import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Lock,
  Building2,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  X,
  HelpCircle,
  PlusCircle
} from 'lucide-react';
import { authService } from '../../services/authService';

export const LoginPage: React.FC = () => {
  const { login, setActiveView } = useApp();
  const [workspaceCode, setWorkspaceCode] = useState('');
  const [password, setPassword] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Forgot Password Modal State
  const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);
  const [forgotWorkspaceCode, setForgotWorkspaceCode] = useState('');
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSubmitting, setForgotSubmitting] = useState(false);
  const [forgotSuccess, setForgotSuccess] = useState<string | null>(null);
  const [forgotError, setForgotError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsSubmitting(true);

    const result = await login({
      workspace_code: workspaceCode,
      password,
    });

    setIsSubmitting(false);

    if (!result.success) {
      setErrorMessage(result.message || 'Authentication failed. Please check credentials.');
    }
  };

  const handleForgotPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotError(null);
    setForgotSubmitting(true);

    const res = await authService.requestPasswordReset(forgotWorkspaceCode, forgotEmail);
    setForgotSubmitting(false);

    if (res.success) {
      setForgotSuccess(res.message);
      setTimeout(() => {
        setIsForgotModalOpen(false);
        setForgotSuccess(null);
      }, 4000);
    } else {
      setForgotError(res.message);
    }
  };

  return (
    <div className="min-h-screen bg-[#060908] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Ambient Luxury Billiard Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[520px] h-[520px] bg-emerald-900/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-80 h-80 bg-amber-600/5 rounded-full blur-3xl pointer-events-none" />

      <div className="relative w-full max-w-md bg-[#0e1612] border border-emerald-900/40 rounded-3xl p-7 sm:p-9 shadow-2xl shadow-black/90 space-y-6 backdrop-blur-xl">
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

        {/* Error Notification */}
        {errorMessage && (
          <div className="p-3.5 rounded-xl bg-rose-950/80 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2.5 shadow-lg">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span className="font-semibold">{errorMessage}</span>
          </div>
        )}

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
                placeholder="Enter workspace / club code"
                className="w-full bg-[#080d0a] border border-emerald-950 focus:border-emerald-500/60 text-white text-xs sm:text-sm rounded-xl pl-10 pr-3.5 py-3 transition focus:outline-none focus:ring-1 focus:ring-emerald-500/40 font-mono uppercase"
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
                onClick={() => {
                  setForgotWorkspaceCode(workspaceCode);
                  setIsForgotModalOpen(true);
                }}
                className="text-[11px] text-amber-400 hover:text-amber-300 font-medium transition cursor-pointer"
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
                placeholder="Enter account password"
                className="w-full bg-[#080d0a] border border-emerald-950 focus:border-emerald-500/60 text-white text-xs sm:text-sm rounded-xl pl-10 pr-3.5 py-3 transition focus:outline-none focus:ring-1 focus:ring-emerald-500/40 font-mono"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full mt-2 py-3.5 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-bold text-xs sm:text-sm rounded-xl shadow-lg shadow-emerald-950/60 transition active:scale-[0.99] flex items-center justify-center gap-2 border border-emerald-400/20 disabled:opacity-50 cursor-pointer"
          >
            <span>{isSubmitting ? 'Authenticating Session...' : 'Sign In to Workspace'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Club Registration Link */}
        <div className="pt-3 border-t border-emerald-950/60 text-center">
          <p className="text-xs text-slate-400">
            Need to register a new venue?{' '}
            <button
              onClick={() => setActiveView('signup')}
              className="text-emerald-400 hover:text-emerald-300 font-bold transition inline-flex items-center gap-1 cursor-pointer"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Register Club</span>
            </button>
          </p>
        </div>

        {/* Security & System Info Footer */}
        <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[11px] text-slate-500">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500/70" />
            <span>Server-Authoritative RBAC</span>
          </div>
          <span className="font-mono text-[10px] text-amber-500/70 font-semibold uppercase">
            CueDesk v2.0
          </span>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {isForgotModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="relative w-full max-w-md bg-[#0e1612] border border-emerald-900/60 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-emerald-950">
              <div className="flex items-center gap-2 text-white font-bold text-sm">
                <HelpCircle className="w-4 h-4 text-amber-400" />
                <span>Reset Workspace Password</span>
              </div>
              <button
                onClick={() => setIsForgotModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {forgotSuccess && (
              <div className="p-3 rounded-xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                <span>{forgotSuccess}</span>
              </div>
            )}

            {forgotError && (
              <div className="p-3 rounded-xl bg-rose-950/80 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                <span>{forgotError}</span>
              </div>
            )}

            <form onSubmit={handleForgotPasswordSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Workspace / Club Code
                </label>
                <input
                  type="text"
                  required
                  placeholder="Enter workspace / club code"
                  value={forgotWorkspaceCode}
                  onChange={(e) => setForgotWorkspaceCode(e.target.value)}
                  className="w-full bg-[#080d0a] border border-emerald-950 text-white text-xs rounded-xl px-3 py-2.5 font-mono uppercase"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Registered Club Email
                </label>
                <input
                  type="email"
                  placeholder="owner@cuedesk.club"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  className="w-full bg-[#080d0a] border border-emerald-950 text-white text-xs rounded-xl px-3 py-2.5 font-mono"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsForgotModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-medium cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={forgotSubmitting}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow disabled:opacity-50 cursor-pointer"
                >
                  {forgotSubmitting ? 'Sending Request...' : 'Dispatch Instructions'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
