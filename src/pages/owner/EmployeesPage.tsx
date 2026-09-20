import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  Users,
  ShieldCheck,
  UserCheck,
  Lock,
  CheckCircle2,
  Clock,
  Phone,
  Mail
} from 'lucide-react';

export const EmployeesPage: React.FC = () => {
  const { employees, shifts } = useApp();

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto pb-24 md:pb-8">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
          <Users className="w-6 h-6 text-emerald-400" />
          <span>Staff Directory & Strict 2-Role Permission Matrix</span>
        </h1>
        <p className="text-xs text-slate-400 mt-0.5">
          CueMaster Pro operates with strictly two roles: Club Owner and Club Employee.
        </p>
      </div>

      {/* Role Definitions Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Owner Card */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-amber-500/30 space-y-3">
          <div className="flex items-center gap-2 text-amber-400 font-bold text-base">
            <ShieldCheck className="w-5 h-5" />
            <span>Role 1: Club Owner</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Ultimate governance authority. Views full gross & net operating revenue, wholesale profit margins, reviews pending cash handover requests, authorizes voided invoices, and manages club rate settings.
          </p>
          <div className="text-[11px] text-slate-400 pt-2 border-t border-slate-800 space-y-1">
            <div className="flex items-center gap-1.5 text-emerald-400">
              <CheckCircle2 className="w-3.5 h-3.5" /> Full Financial Audit & Vault Sign-off
            </div>
            <div className="flex items-center gap-1.5 text-emerald-400">
              <CheckCircle2 className="w-3.5 h-3.5" /> Whitelist / Reversal Approval Center
            </div>
          </div>
        </div>

        {/* Employee Card */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-blue-500/30 space-y-3">
          <div className="flex items-center gap-2 text-blue-400 font-bold text-base">
            <UserCheck className="w-5 h-5" />
            <span>Role 2: Club Employee</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Frontline floor and cashier operator. Manages table match sessions, adds snacks & drinks with item-level ownership, executes fast walk-in retail sales, opens daily shifts, and submits cash collections to Owner.
          </p>
          <div className="text-[11px] text-slate-400 pt-2 border-t border-slate-800 space-y-1">
            <div className="flex items-center gap-1.5 text-blue-300">
              <CheckCircle2 className="w-3.5 h-3.5" /> Tablet & Mobile Touch-Optimized UI
            </div>
            <div className="flex items-center gap-1.5 text-blue-300">
              <CheckCircle2 className="w-3.5 h-3.5" /> Shift Float & Cash Drawer Accountability
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
              <div key={emp.id} className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white text-base">{emp.full_name}</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                      emp.role === 'owner' ? 'bg-amber-500/20 text-amber-300' : 'bg-blue-500/20 text-blue-300'
                    }`}>
                      {emp.role}
                    </span>
                  </div>
                  <div className="text-xs text-slate-400 flex items-center gap-3">
                    <span className="flex items-center gap-1">
                      <Phone className="w-3 h-3 text-slate-400" />
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
                    <span className="text-xs text-slate-400 font-medium">Off Duty</span>
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
