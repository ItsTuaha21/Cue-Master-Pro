import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  LayoutDashboard,
  CircleDot,
  History,
  UtensilsCrossed,
  Boxes,
  FileText,
  CreditCard,
  Receipt,
  Users,
  CalendarDays,
  UserCog,
  Clock3,
  BadgeDollarSign,
  CheckCheck,
  BarChart3,
  ShieldAlert,
  Settings,
} from 'lucide-react';

export const OwnerSidebar: React.FC = () => {
  const { activeView, setActiveView, approvalRequests } = useApp();
  const pendingApprovalsCount = approvalRequests.filter(a => a.status === 'pending').length;

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'tables', label: 'Tables & Floor', icon: CircleDot },
    { id: 'sessions', label: 'Sessions History', icon: History },
    { id: 'products', label: 'Snacks & Drinks', icon: UtensilsCrossed },
    { id: 'inventory', label: 'Inventory & Stock', icon: Boxes },
    { id: 'invoices', label: 'Invoices & Billing', icon: FileText },
    { id: 'payments', label: 'Payments Ledger', icon: CreditCard },
    { id: 'expenses', label: 'Club Expenses', icon: Receipt },
    { id: 'members', label: 'Members Directory', icon: Users },
    { id: 'bookings', label: 'Bookings & Calendar', icon: CalendarDays },
    { id: 'employees', label: 'Staff Accounts', icon: UserCog },
    { id: 'shifts', label: 'Shifts & Drawers', icon: Clock3 },
    { id: 'collections', label: 'Cash Collections', icon: BadgeDollarSign },
    { id: 'approvals', label: 'Approval Center', icon: CheckCheck, badge: pendingApprovalsCount },
    { id: 'reports', label: 'Financial Reports', icon: BarChart3 },
    { id: 'audit-logs', label: 'Audit Logs', icon: ShieldAlert },
    { id: 'settings', label: 'Club Settings', icon: Settings },
  ];

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col h-[calc(100vh-61px)] sticky top-[61px] shrink-0 overflow-y-auto">
      <div className="p-3">
        <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 px-3 py-2">
          Owner Management Suite
        </div>
        <nav className="space-y-1 mt-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveView(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-sm font-medium transition ${
                  isActive
                    ? 'bg-emerald-600 text-white shadow-sm font-semibold'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge !== undefined && item.badge > 0 && (
                  <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                    isActive ? 'bg-white text-emerald-700' : 'bg-amber-500 text-slate-950 animate-pulse'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      <div className="mt-auto p-4 border-t border-slate-800/80 bg-slate-950/40">
        <div className="text-xs text-slate-400 leading-relaxed">
          <span className="font-semibold text-slate-200">Owner Access</span>
          <p className="mt-0.5 text-[11px]">Full system governance, pricing control & financial audit authority.</p>
        </div>
      </div>
    </aside>
  );
};
