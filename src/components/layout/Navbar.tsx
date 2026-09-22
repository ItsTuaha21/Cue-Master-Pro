import React from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Shield, 
  UserCheck, 
  Bell, 
  LogOut,
  Building2,
  Users
} from 'lucide-react';
import { ROLE_LABELS } from '../../types';

export const Navbar: React.FC = () => {
  const { currentUser, currentWorkspace, activeShift, approvalRequests, setActiveView, settings, logout } = useApp();
  const pendingApprovalsCount = approvalRequests.filter(a => a.status === 'pending').length;

  const role = currentUser?.role || 'cashier';

  return (
    <header className="bg-[#0b120f] border-b border-emerald-900/25 text-white sticky top-0 z-40 px-4 py-2.5 flex items-center justify-between shadow-xl shadow-black/40 backdrop-blur-md">
      {/* Brand & Club */}
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-600 to-emerald-800 text-white shadow-md shadow-emerald-950/60 border border-emerald-400/20">
          <span className="font-black text-sm text-emerald-200 tracking-tighter">8</span>
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="font-black text-lg tracking-tight text-white flex items-center">
              Cue<span className="text-emerald-400">Desk</span>
            </span>
            {currentWorkspace?.workspace_code && (
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-950/70 text-emerald-400 border border-emerald-800/50 font-mono font-bold uppercase tracking-wider">
                {currentWorkspace.workspace_code}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <Building2 className="w-3 h-3 text-emerald-400/80" />
            <span className="truncate max-w-[170px] sm:max-w-xs">{currentWorkspace?.name || settings.club_name}</span>
          </div>
        </div>
      </div>

      {/* Middle Status Indicators */}
      <div className="hidden lg:flex items-center gap-3">
        {activeShift && (
          <div className="flex items-center gap-2.5 bg-[#0e1713] border border-emerald-900/40 px-3.5 py-1.5 rounded-xl text-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-sm shadow-emerald-400"></span>
            <span className="text-slate-400 font-medium">Drawer Custody:</span>
            <span className="text-white font-semibold">{activeShift.employee_name}</span>
            <span className="text-slate-700">|</span>
            <span className="text-emerald-400 font-mono font-medium">
              Float: {settings.currency_symbol} {activeShift.expected_cash.toLocaleString()}
            </span>
          </div>
        )}

        {role === 'owner' && pendingApprovalsCount > 0 && (
          <button 
            onClick={() => setActiveView('approvals')}
            className="flex items-center gap-1.5 bg-amber-500/10 border border-amber-500/30 text-amber-300 hover:bg-amber-500/20 px-3 py-1.5 rounded-xl text-xs font-medium transition cursor-pointer"
          >
            <Bell className="w-3.5 h-3.5 text-amber-400 animate-bounce" />
            <span>{pendingApprovalsCount} Action Required</span>
          </button>
        )}
      </div>

      {/* Right Controls: Authenticated Role Context & Profile */}
      <div className="flex items-center gap-3">
        {/* Verified Server Role Badge (Immutable - No Client-Side Switching) */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#070b09] border border-emerald-900/40 text-xs">
          {role === 'owner' && <Shield className="w-3.5 h-3.5 text-emerald-400" />}
          {role === 'manager' && <Users className="w-3.5 h-3.5 text-amber-400" />}
          {role === 'cashier' && <UserCheck className="w-3.5 h-3.5 text-emerald-500" />}
          <span className="font-semibold text-slate-200">{ROLE_LABELS[role]}</span>
        </div>

        {/* User Card & Logout */}
        <div className="flex items-center gap-2 pl-2 border-l border-white/10">
          <div className="w-8 h-8 rounded-xl bg-emerald-950/80 border border-emerald-600/30 flex items-center justify-center font-bold text-xs text-emerald-300">
            {currentUser?.full_name ? currentUser.full_name.charAt(0) : 'U'}
          </div>
          <div className="hidden sm:block text-left">
            <div className="text-xs font-bold text-white leading-tight">{currentUser?.full_name || 'Authenticated User'}</div>
            <div className="text-[10px] text-slate-400 font-mono">
              {currentUser?.email || 'Verified Session'}
            </div>
          </div>
          <button
            onClick={() => logout()}
            title="Sign out of workspace"
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-950/30 transition cursor-pointer ml-1"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
