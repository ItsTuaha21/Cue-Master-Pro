import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { CircleDot, ShieldCheck, UserCheck, KeyRound, Lock, ArrowRight } from 'lucide-react';

interface LoginPageProps {
  onLoginSuccess: () => void;
}

export const LoginPage: React.FC = () => {
  const { setRole, currentUser, settings } = useApp();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState<'owner' | 'employee'>('owner');

  const handleManualLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setRole(selectedRole);
  };

  const handleQuickLogin = (role: 'owner' | 'employee') => {
    setRole(role);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Subtle Background Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-emerald-600/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto shadow-lg shadow-emerald-950/50">
            <CircleDot className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">CueMaster Pro</h1>
          <p className="text-xs text-slate-400">
            Professional Snooker Club Governance & Pos Terminal
          </p>
        </div>

        {/* Quick 1-Click Access for Evaluation */}
        <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2.5">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider text-center">
            One-Click Terminal Launch
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleQuickLogin('owner')}
              className="p-3 rounded-xl bg-slate-900 hover:bg-slate-850 border border-amber-500/30 hover:border-amber-500 text-left transition group"
            >
              <div className="flex items-center gap-1.5 text-amber-400 font-bold text-xs">
                <ShieldCheck className="w-4 h-4" />
                <span>Owner View</span>
              </div>
              <div className="text-[10px] text-slate-400 mt-1">Full P&L, safe collection, approvals</div>
            </button>

            <button
              type="button"
              onClick={() => handleQuickLogin('employee')}
              className="p-3 rounded-xl bg-slate-900 hover:bg-slate-850 border border-blue-500/30 hover:border-blue-500 text-left transition group"
            >
              <div className="flex items-center gap-1.5 text-blue-400 font-bold text-xs">
                <UserCheck className="w-4 h-4" />
                <span>Employee View</span>
              </div>
              <div className="text-[10px] text-slate-400 mt-1">Table POS, snack orders, shift float</div>
            </button>
          </div>
        </div>

        <div className="relative flex py-1 items-center">
          <div className="flex-grow border-t border-slate-800"></div>
          <span className="flex-shrink mx-3 text-[10px] text-slate-400 uppercase font-semibold">Or Sign In with PIN</span>
          <div className="flex-grow border-t border-slate-800"></div>
        </div>

        {/* Form Login */}
        <form onSubmit={handleManualLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Terminal Role</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setSelectedRole('owner')}
                className={`py-2 rounded-xl text-xs font-bold border transition ${
                  selectedRole === 'owner'
                    ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                    : 'bg-slate-950 border-slate-800 text-slate-400'
                }`}
              >
                Owner
              </button>
              <button
                type="button"
                onClick={() => setSelectedRole('employee')}
                className={`py-2 rounded-xl text-xs font-bold border transition ${
                  selectedRole === 'employee'
                    ? 'bg-blue-600/20 border-blue-500 text-blue-300'
                    : 'bg-slate-950 border-slate-800 text-slate-400'
                }`}
              >
                Employee (Cashier)
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Username</label>
            <input
              type="text"
              defaultValue={selectedRole === 'owner' ? 'usman_owner' : 'ali_cashier'}
              className="w-full bg-slate-950 border border-slate-700 text-white text-xs rounded-xl p-2.5"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Security PIN / Password</label>
            <input
              type="password"
              defaultValue="1234"
              className="w-full bg-slate-950 border border-slate-700 text-white font-mono text-xs rounded-xl p-2.5"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm rounded-xl shadow-lg shadow-emerald-950/40 transition active:scale-98 flex items-center justify-center gap-2"
          >
            <span>Enter Terminal</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
