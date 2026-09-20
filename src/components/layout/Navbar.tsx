import React from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Shield, 
  UserCheck, 
  Clock, 
  CircleDot, 
  Bell, 
  LogOut,
  Wallet,
  Building2,
  ArrowLeftRight
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const { currentUser, switchUserRole, activeShift, approvalRequests, setActiveView, settings } = useApp();
  const pendingApprovalsCount = approvalRequests.filter(a => a.status === 'pending').length;

  return (
    <header className="bg-slate-900 border-b border-slate-800 text-white sticky top-0 z-40 px-4 py-3 flex items-center justify-between shadow-md">
      {/* Brand & Club */}
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-emerald-600 text-white shadow-md shadow-emerald-900/30">
          <CircleDot className="w-6 h-6" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="font-bold text-lg tracking-tight text-white">CueMaster<span className="text-emerald-400">Pro</span></span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700 font-medium">v1.0</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <Building2 className="w-3 h-3 text-emerald-400" />
            <span>{settings.club_name}</span>
          </div>
        </div>
      </div>

      {/* Middle Status Indicators */}
      <div className="hidden md:flex items-center gap-4">
        {activeShift && (
          <div className="flex items-center gap-2 bg-slate-800/80 border border-slate-700 px-3 py-1.5 rounded-lg text-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="text-slate-300 font-medium">Active Shift:</span>
            <span className="text-white font-semibold">{activeShift.employee_name}</span>
            <span className="text-slate-400">|</span>
            <span className="text-emerald-400 font-medium">Cash in Drawer: {settings.currency_symbol} {activeShift.expected_cash.toLocaleString()}</span>
          </div>
        )}

        {currentUser.role === 'owner' && pendingApprovalsCount > 0 && (
          <button 
            onClick={() => setActiveView('approvals')}
            className="flex items-center gap-1.5 bg-amber-500/10 border border-amber-500/30 text-amber-300 hover:bg-amber-500/20 px-3 py-1.5 rounded-lg text-xs font-medium transition"
          >
            <Bell className="w-3.5 h-3.5 text-amber-400 animate-bounce" />
            <span>{pendingApprovalsCount} Approval{pendingApprovalsCount > 1 ? 's' : ''} Pending</span>
          </button>
        )}
      </div>

      {/* Right Controls: Role Switcher & Profile */}
      <div className="flex items-center gap-3">
        {/* Fast Role Switcher for Evaluation */}
        <div className="flex items-center bg-slate-800 p-1 rounded-xl border border-slate-700">
          <button
            onClick={() => switchUserRole('owner')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium transition ${
              currentUser.role === 'owner'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
            title="Switch to Owner view"
          >
            <Shield className="w-3.5 h-3.5" />
            <span>Owner</span>
          </button>
          <button
            onClick={() => switchUserRole('employee')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium transition ${
              currentUser.role === 'employee'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
            title="Switch to Employee view (Tablet/Mobile optimized)"
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>Employee</span>
          </button>
        </div>

        {/* User Card */}
        <div className="flex items-center gap-2.5 pl-2 border-l border-slate-800">
          <div className="w-8 h-8 rounded-full bg-slate-700 border border-slate-600 flex items-center justify-center font-bold text-xs text-white">
            {currentUser.full_name.charAt(0)}
          </div>
          <div className="hidden sm:block text-left">
            <div className="text-xs font-semibold text-white leading-tight">{currentUser.full_name}</div>
            <div className="text-[10px] text-slate-400 uppercase tracking-wider font-medium">
              {currentUser.role === 'owner' ? 'Club Owner' : 'Floor Employee'}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
