import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  Users,
  ShieldCheck,
  UserCheck,
  CheckCircle2,
  Phone,
  Briefcase
} from 'lucide-react';
import { ROLE_LABELS } from '../../types';

export const EmployeesPage: React.FC = () => {
  const { employees, shifts } = useApp();

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto pb-24 md:pb-8">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
          <Users className="w-6 h-6 text-emerald-400" />
          <span>Staff Directory & 3-Tier Club Roles</span>
        </h1>
        <p className="text-xs text-slate-400 mt-0.5">
          CueDesk role matrix: Club Owner, Manager, and Employee / Cashier.
        </p>
      </div>

      {/* Role Definitions Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Owner Card */}
        <div className="p-5 rounded-2xl bg-[#0e1612] border border-amber-500/30 space-y-3 shadow-lg shadow-black/40">
          <div className="flex items-center gap-2 text-amber-400 font-bold text-sm sm:text-base">
            <ShieldCheck className="w-5 h-5 text-amber-400" />
            <span>1. Club Owner</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Ultimate governance authority. Views gross/net P&L, authorizes invoice voids, approves shift cash collections, and manages rate cards and club settings.
          </p>
          <div className="text-[11px] text-slate-400 pt-2 border-t border-emerald-950 space-y-1">
            <div className="flex items-center gap-1.5 text-amber-400 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5" /> Full Financial Audit & Vault Sign-off
            </div>
            <div className="flex items-center gap-1.5 text-amber-400 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5" /> Reversal & Exception Approvals
            </div>
          </div>
        </div>

        {/* Manager Card */}
        <div className="p-5 rounded-2xl bg-[#0e1612] border border-emerald-600/30 space-y-3 shadow-lg shadow-black/40">
          <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm sm:text-base">
            <Briefcase className="w-5 h-5 text-emerald-400" />
            <span>2. Floor Manager</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Operational supervisor. Oversees floor floor tables, monitors active staff shifts, handles stock replenishment audits, and resolves member inquiries.
          </p>
          <div className="text-[11px] text-slate-400 pt-2 border-t border-emerald-950 space-y-1">
            <div className="flex items-center gap-1.5 text-emerald-400 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5" /> Shift Oversight & Inventory Audits
            </div>
            <div className="flex items-center gap-1.5 text-emerald-400 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5" /> Floor Supervision & Bookings
            </div>
          </div>
        </div>

        {/* Employee / Cashier Card */}
        <div className="p-5 rounded-2xl bg-[#0e1612] border border-emerald-800/30 space-y-3 shadow-lg shadow-black/40">
          <div className="flex items-center gap-2 text-emerald-300 font-bold text-sm sm:text-base">
            <UserCheck className="w-5 h-5 text-emerald-300" />
            <span>3. Employee / Cashier</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Frontline floor and cashier operator. Manages table match sessions, adds café items with individual player attribution, runs POS sales, and balances drawer cash.
          </p>
          <div className="text-[11px] text-slate-400 pt-2 border-t border-emerald-950 space-y-1">
            <div className="flex items-center gap-1.5 text-emerald-300 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5" /> Touch-Optimized Table Timer POS
            </div>
            <div className="flex items-center gap-1.5 text-emerald-300 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5" /> Shift Float & Cash Accountability
            </div>
          </div>
        </div>
      </div>

      {/* Staff Members List */}
      <div>
        <h3 className="text-sm font-bold text-white mb-3">Registered Staff Accounts</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {employees.map(emp => {
            const empShift = shifts.find(s => s.employee_id === emp.id && s.status === 'open');
            return (
              <div key={emp.id} className="p-5 rounded-2xl bg-[#0e1612] border border-emerald-900/30 flex items-center justify-between shadow-lg shadow-black/30">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white text-base">{emp.full_name}</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                      emp.role === 'owner' 
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' 
                        : emp.role === 'manager'
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : 'bg-slate-800 text-slate-300 border border-slate-700'
                    }`}>
                      {ROLE_LABELS[emp.role] || emp.role}
                    </span>
                  </div>
                  <div className="text-xs text-slate-400 flex items-center gap-3">
                    <span className="flex items-center gap-1">
                      <Phone className="w-3 h-3 text-emerald-400" />
                      {emp.phone}
                    </span>
                    <span>•</span>
                    <span className="font-mono text-slate-400">{emp.email}</span>
                  </div>
                </div>

                <div>
                  {empShift ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                      On Duty
                    </span>
                  ) : (
                    <span className="text-xs text-slate-500 font-medium">Off Duty</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
