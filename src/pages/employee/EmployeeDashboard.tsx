import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  CircleDot,
  PlayCircle,
  Receipt,
  ShoppingBag,
  Clock,
  Wallet,
  CalendarDays,
  Plus,
  ArrowRight,
  TrendingUp,
  AlertCircle
} from 'lucide-react';
import { TableCard } from '../../components/tables/TableCard';

export const EmployeeDashboard: React.FC = () => {
  const {
    settings,
    tables,
    sessions,
    activeShift,
    setActiveView,
    setSelectedTableForModal,
  } = useApp();

  const occupiedTables = tables.filter(t => t.status === 'occupied');
  const availableTables = tables.filter(t => t.status === 'available');

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto pb-24 md:pb-8">
      {/* Top Banner: Shift & Drawer Quick Overview */}
      <div className="bg-gradient-to-r from-blue-900/40 via-slate-900 to-slate-900 border border-blue-800/40 rounded-2xl p-4 sm:p-5 shadow-lg">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
              <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">Floor Operational Terminal</h2>
            </div>
            <p className="text-xs text-blue-200/70 mt-0.5">
              Shift: {activeShift ? activeShift.shift_name : 'Default Floor'} • Logged in as Ali Raza
            </p>
          </div>

          {/* Quick Cash Drawer Widget */}
          {activeShift && (
            <div className="flex items-center gap-3 bg-slate-950/80 border border-slate-800 px-4 py-2.5 rounded-xl">
              <div>
                <div className="text-[10px] uppercase font-bold text-slate-400">Cash in Drawer</div>
                <div className="text-lg font-black text-emerald-400 font-mono">
                  {settings.currency_symbol} {activeShift.expected_cash.toLocaleString()}
                </div>
              </div>
              <button
                onClick={() => setActiveView('shifts')}
                className="text-xs bg-blue-600 hover:bg-blue-500 text-white font-semibold px-3 py-1.5 rounded-lg transition"
              >
                Close Shift
              </button>
            </div>
          )}
        </div>
      </div>

      {/* QUICK ACTION TILES (Touch-Optimized for Tablet & Floor Phones) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <button
          onClick={() => setActiveView('tables')}
          className="p-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white text-left shadow-lg shadow-emerald-950/40 transition active:scale-[0.98] flex flex-col justify-between h-28"
        >
          <div className="flex items-center justify-between w-full">
            <PlayCircle className="w-6 h-6" />
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-700">
              {availableTables.length} Free
            </span>
          </div>
          <div>
            <div className="font-bold text-sm">Open Table</div>
            <div className="text-[11px] text-emerald-100">Start new match</div>
          </div>
        </button>

        <button
          onClick={() => setActiveView('sales')}
          className="p-4 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white text-left shadow-lg shadow-blue-950/40 transition active:scale-[0.98] flex flex-col justify-between h-28"
        >
          <div className="flex items-center justify-between w-full">
            <ShoppingBag className="w-6 h-6" />
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-blue-700">POS</span>
          </div>
          <div>
            <div className="font-bold text-sm">Walk-in Sale</div>
            <div className="text-[11px] text-blue-100">Drinks & snacks</div>
          </div>
        </button>

        <button
          onClick={() => setActiveView('bookings')}
          className="p-4 rounded-2xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white text-left shadow-md transition active:scale-[0.98] flex flex-col justify-between h-28"
        >
          <div className="flex items-center justify-between w-full">
            <CalendarDays className="w-6 h-6 text-amber-400" />
            <span className="text-xs text-slate-400">Today</span>
          </div>
          <div>
            <div className="font-bold text-sm">Reservations</div>
            <div className="text-[11px] text-slate-400">Check bookings</div>
          </div>
        </button>

        <button
          onClick={() => setActiveView('shifts')}
          className="p-4 rounded-2xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white text-left shadow-md transition active:scale-[0.98] flex flex-col justify-between h-28"
        >
          <div className="flex items-center justify-between w-full">
            <Wallet className="w-6 h-6 text-emerald-400" />
            <span className="text-xs text-slate-400">Float</span>
          </div>
          <div>
            <div className="font-bold text-sm">Cash Drawer</div>
            <div className="text-[11px] text-slate-400">Shift handover</div>
          </div>
        </button>
      </div>

      {/* ACTIVE TABLES SECTION (HIGH PRIORITY ON MOBILE/TABLET) */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
              <span>Active Tables & Running Bills</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30">
                {occupiedTables.length} Active
              </span>
            </h3>
            <p className="text-xs text-slate-400">Tap any table card to manage session, add snacks, or process checkout.</p>
          </div>
          <button
            onClick={() => setActiveView('tables')}
            className="text-xs text-blue-400 hover:underline font-medium"
          >
            View all tables &rarr;
          </button>
        </div>

        {occupiedTables.length === 0 ? (
          <div className="p-8 text-center bg-slate-900 border border-dashed border-slate-800 rounded-2xl text-slate-400 text-xs">
            No tables currently in play. Open an available table to begin.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {occupiedTables.map(table => {
              const session = sessions.find(s => s.id === table.current_session_id && s.status === 'active');
              return (
                <TableCard
                  key={table.id}
                  table={table}
                  session={session}
                  onOpenSession={() => {}}
                  onViewSession={(t) => setSelectedTableForModal(t)}
                />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
