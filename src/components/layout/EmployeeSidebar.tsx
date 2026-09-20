import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  CircleDot,
  ShoppingBag,
  Clock3,
  FileText,
  CalendarDays,
  SendHorizontal,
  LayoutGrid,
} from 'lucide-react';

export const EmployeeSidebar: React.FC = () => {
  const { activeView, setActiveView } = useApp();

  const navItems = [
    { id: 'dashboard', label: 'Floor Overview', icon: LayoutGrid },
    { id: 'tables', label: 'Active Tables', icon: CircleDot },
    { id: 'sales', label: 'Walk-in Sale (POS)', icon: ShoppingBag },
    { id: 'invoices', label: 'Invoices & Receipts', icon: FileText },
    { id: 'shifts', label: 'My Shift & Float', icon: Clock3 },
    { id: 'bookings', label: 'Reservations', icon: CalendarDays },
    { id: 'requests', label: 'My Requests', icon: SendHorizontal },
  ];

  return (
    <>
      {/* Desktop / Tablet Sidebar */}
      <aside className="hidden md:flex w-60 bg-slate-900 border-r border-slate-800 flex-col h-[calc(100vh-61px)] sticky top-[61px] shrink-0 p-3">
        <div className="bg-blue-950/40 border border-blue-800/40 rounded-xl p-3 mb-3">
          <div className="text-xs font-semibold text-blue-300">Employee Terminal</div>
          <div className="text-[11px] text-blue-200/70 mt-0.5">High-speed floor & table session operations.</div>
        </div>

        <nav className="space-y-1.5 flex-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeView === item.id || (item.id === 'tables' && activeView === 'sessions');
            return (
              <button
                key={item.id}
                onClick={() => setActiveView(item.id)}
                className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm font-medium transition touch-manipulation ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-900/30 font-semibold'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </aside>

      {/* Mobile Bottom Navigation Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-slate-900/95 backdrop-blur border-t border-slate-800 px-2 py-1.5 flex items-center justify-around shadow-2xl">
        {navItems.slice(0, 5).map((item) => {
          const Icon = item.icon;
          const isActive = activeView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveView(item.id)}
              className={`flex flex-col items-center gap-1 py-1 px-2 rounded-lg text-[10px] font-medium transition touch-manipulation ${
                isActive ? 'text-blue-400 font-bold' : 'text-slate-400'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'text-blue-400' : 'text-slate-400'}`} />
              <span>{item.label.split(' ')[0]}</span>
            </button>
          );
        })}
      </div>
    </>
  );
};
