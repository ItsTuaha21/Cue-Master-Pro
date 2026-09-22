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

  const sections = [
    {
      title: 'OVERVIEW',
      items: [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
      ]
    },
    {
      title: 'OPERATIONS',
      items: [
        { id: 'tables', label: 'Tables & Floor', icon: CircleDot },
        { id: 'sessions', label: 'Sessions History', icon: History },
        { id: 'bookings', label: 'Bookings', icon: CalendarDays },
        { id: 'products', label: 'Café & Retail', icon: UtensilsCrossed },
        { id: 'inventory', label: 'Inventory Ledger', icon: Boxes },
      ]
    },
    {
      title: 'CUSTOMERS',
      items: [
        { id: 'members', label: 'Members Directory', icon: Users },
      ]
    },
    {
      title: 'BILLING & FINANCE',
      items: [
        { id: 'invoices', label: 'Invoices & Billing', icon: FileText },
        { id: 'payments', label: 'Payments Ledger', icon: CreditCard },
        { id: 'expenses', label: 'Club Expenses', icon: Receipt },
        { id: 'collections', label: 'Cash Collections', icon: BadgeDollarSign },
        { id: 'reports', label: 'Financial Reports', icon: BarChart3 },
      ]
    },
    {
      title: 'STAFF & GOVERNANCE',
      items: [
        { id: 'employees', label: 'Staff Accounts', icon: UserCog },
        { id: 'shifts', label: 'Shifts & Float', icon: Clock3 },
        { id: 'approvals', label: 'Approval Center', icon: CheckCheck, badge: pendingApprovalsCount },
        { id: 'audit-logs', label: 'Security Audit Logs', icon: ShieldAlert },
        { id: 'settings', label: 'Club Settings', icon: Settings },
      ]
    }
  ];

  return (
    <aside className="w-64 bg-[#0b120f] border-r border-emerald-900/25 flex flex-col h-[calc(100vh-61px)] sticky top-[61px] shrink-0 overflow-y-auto">
      <div className="p-3 space-y-4">
        {sections.map((sec, sIdx) => (
          <div key={sIdx}>
            <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-500/70 px-3 py-1 font-mono">
              {sec.title}
            </div>
            <nav className="space-y-0.5 mt-1">
              {sec.items.map((item) => {
                const Icon = item.icon;
                const isActive = activeView === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveView(item.id)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition cursor-pointer ${
                      isActive
                        ? 'bg-gradient-to-r from-emerald-600 to-emerald-700 text-white shadow-md shadow-emerald-950/60 border border-emerald-400/25'
                        : 'text-slate-300 hover:bg-[#111c16] hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                      <span>{item.label}</span>
                    </div>
                    {item.badge !== undefined && item.badge > 0 && (
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        isActive 
                          ? 'bg-white text-emerald-900' 
                          : 'bg-amber-500 text-black animate-pulse font-mono shadow-sm shadow-amber-500/40'
                      }`}>
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>
        ))}
      </div>

      <div className="mt-auto p-3.5 border-t border-emerald-900/20 bg-[#070c09]">
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span className="font-semibold text-slate-200">CueDesk SaaS</span>
          <span className="text-[10px] text-amber-400/80 font-mono ml-auto">PRO</span>
        </div>
      </div>
    </aside>
  );
};
