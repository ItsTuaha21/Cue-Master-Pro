import React from 'react';
import { PhysicalTable, TableSession } from '../../types';
import { useApp } from '../../context/AppContext';
import { 
  CircleDot, 
  Users, 
  Clock, 
  Receipt, 
  PlayCircle, 
  ChevronRight,
  Sparkles,
  Wrench
} from 'lucide-react';

interface TableCardProps {
  table: PhysicalTable;
  session?: TableSession;
  onOpenSession: (table: PhysicalTable) => void;
  onViewSession: (table: PhysicalTable, session: TableSession) => void;
}

export const TableCard: React.FC<TableCardProps> = ({
  table,
  session,
  onOpenSession,
  onViewSession,
}) => {
  const { settings } = useApp();

  const getStatusBadge = () => {
    switch (table.status) {
      case 'available':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-950/80 text-emerald-400 border border-emerald-500/30 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            Available
          </span>
        );
      case 'occupied':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-950/80 text-amber-300 border border-amber-500/40 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-amber-400"></span>
            Live Match
          </span>
        );
      case 'reserved':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-sky-950/80 text-sky-300 border border-sky-500/30">
            <span className="w-2 h-2 rounded-full bg-sky-400"></span>
            Reserved
          </span>
        );
      case 'maintenance':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-950/80 text-rose-300 border border-rose-500/30">
            <Wrench className="w-3 h-3" />
            Maintenance
          </span>
        );
      default:
        return null;
    }
  };

  const getCardClasses = () => {
    switch (table.status) {
      case 'available':
        return 'border-emerald-900/30 hover:border-emerald-500/40 bg-[#0e1612] hover:shadow-emerald-950/20';
      case 'occupied':
        return 'border-amber-500/40 bg-[#121915] shadow-lg shadow-black/50 ring-1 ring-amber-500/20';
      case 'reserved':
        return 'border-sky-900/40 bg-[#0e1612]';
      case 'maintenance':
        return 'border-slate-800/80 bg-[#0a0f0c] opacity-75';
      default:
        return 'border-emerald-900/30 bg-[#0e1612]';
    }
  };

  // Duration display calculation
  const getElapsedString = () => {
    if (!session?.start_time) return '00:00';
    const start = new Date(session.start_time).getTime();
    const diffMins = Math.max(0, Math.floor((Date.now() - start) / 60000));
    const hrs = Math.floor(diffMins / 60);
    const mins = diffMins % 60;
    return `${hrs.toString().padStart(2, '0')}h ${mins.toString().padStart(2, '0')}m`;
  };

  const players = session?.participants.filter(p => p.participant_role === 'player' && p.is_active) || [];
  const viewers = session?.participants.filter(p => p.participant_role === 'viewer' && p.is_active) || [];

  return (
    <div
      className={`rounded-2xl border transition-all duration-200 p-5 flex flex-col justify-between shadow-xl ${getCardClasses()}`}
    >
      {/* Header */}
      <div>
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-emerald-950/80 border border-emerald-500/30 flex items-center justify-center text-[11px] font-black text-emerald-400">
                {table.table_number.replace(/\D/g, '') || '#'}
              </span>
              <h3 className="text-base sm:text-lg font-black text-white tracking-tight">{table.table_number}</h3>
              <span className="text-[11px] text-slate-400 font-medium">({table.table_type})</span>
            </div>
            <p className="text-xs text-slate-400 mt-1 font-medium">{table.name}</p>
          </div>
          {getStatusBadge()}
        </div>

        {/* OCCUPIED CONTENT */}
        {table.status === 'occupied' && session && (
          <div className="mt-4 space-y-3">
            {/* Live Metrics Ribbon */}
            <div className="grid grid-cols-2 gap-2 bg-[#080d0a] p-2.5 rounded-xl border border-emerald-950/80">
              <div className="flex items-center gap-2.5">
                <Clock className="w-4 h-4 text-amber-400 shrink-0" />
                <div>
                  <div className="text-[10px] text-slate-400 uppercase font-semibold">Active Time</div>
                  <div className="text-sm font-bold text-white font-mono">{getElapsedString()}</div>
                </div>
              </div>
              <div className="flex items-center gap-2.5">
                <Receipt className="w-4 h-4 text-emerald-400 shrink-0" />
                <div>
                  <div className="text-[10px] text-slate-400 uppercase font-semibold">Live Tab</div>
                  <div className="text-sm font-bold text-emerald-400 font-mono">
                    {settings.currency_symbol} {session.final_amount.toLocaleString()}
                  </div>
                </div>
              </div>
            </div>

            {/* Players & Viewers Roster */}
            <div>
              <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5">
                <span className="flex items-center gap-1 font-medium">
                  <Users className="w-3.5 h-3.5 text-emerald-400/80" />
                  Players ({players.length}):
                </span>
                {viewers.length > 0 && (
                  <span className="text-slate-500">Viewers ({viewers.length})</span>
                )}
              </div>
              <div className="flex flex-wrap gap-1.5">
                {players.map((p) => (
                  <span
                    key={p.id}
                    className={`text-xs px-2.5 py-0.5 rounded-lg font-medium transition ${
                      p.is_loser
                        ? 'bg-rose-950/80 text-rose-300 border border-rose-500/40 font-bold'
                        : 'bg-[#15221b] text-slate-200 border border-emerald-900/40'
                    }`}
                  >
                    {p.display_name} {p.is_loser && '(Loser)'}
                  </span>
                ))}
              </div>
            </div>

            {/* F&B Orders Count */}
            {session.orders.length > 0 && (
              <div className="text-xs text-slate-400 flex items-center justify-between bg-[#090e0b] px-3 py-1.5 rounded-xl border border-emerald-950/80">
                <span>Café Tab:</span>
                <span className="font-semibold text-slate-200 font-mono">
                  {session.orders.length} items ({settings.currency_symbol} {session.fnb_charge_amount.toLocaleString()})
                </span>
              </div>
            )}
          </div>
        )}

        {/* AVAILABLE CONTENT */}
        {table.status === 'available' && (
          <div className="mt-4 py-4 text-center border border-dashed border-emerald-900/30 rounded-xl bg-[#080d0a]/60">
            <Sparkles className="w-5 h-5 text-emerald-400/60 mx-auto mb-1" />
            <div className="text-xs font-semibold text-slate-200">Table Ready for Play</div>
            <div className="text-[11px] text-slate-500 mt-0.5">Standard Rate: {settings.currency_symbol} 600/hr</div>
          </div>
        )}

        {/* RESERVED CONTENT */}
        {table.status === 'reserved' && (
          <div className="mt-4 p-3 rounded-xl bg-sky-950/20 border border-sky-900/30 text-xs">
            <div className="text-sky-300 font-semibold">{table.maintenance_notes || 'Advance Booking'}</div>
            <div className="text-slate-400 mt-1">Check-in customer when they arrive at the desk.</div>
          </div>
        )}

        {/* MAINTENANCE CONTENT */}
        {table.status === 'maintenance' && (
          <div className="mt-4 p-3 rounded-xl bg-[#080d0a] border border-slate-800 text-xs text-slate-400">
            {table.maintenance_notes || 'Service in progress. Felt cleaning / re-cushioning.'}
          </div>
        )}
      </div>

      {/* Action Footer */}
      <div className="mt-5 pt-3 border-t border-emerald-900/20">
        {table.status === 'occupied' && session && (
          <button
            onClick={() => onViewSession(table, session)}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-bold px-4 py-2.5 rounded-xl text-xs sm:text-sm shadow-md shadow-amber-950/50 transition active:scale-[0.98] cursor-pointer"
          >
            <Receipt className="w-4 h-4" />
            <span>Manage Bill & Live Match</span>
            <ChevronRight className="w-4 h-4 ml-auto" />
          </button>
        )}

        {table.status === 'available' && (
          <button
            onClick={() => onOpenSession(table)}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-semibold px-4 py-2.5 rounded-xl text-xs sm:text-sm shadow-md shadow-emerald-950/40 transition active:scale-[0.98] border border-emerald-400/20 cursor-pointer"
          >
            <PlayCircle className="w-4 h-4" />
            <span>Open Table Session</span>
          </button>
        )}

        {table.status === 'reserved' && (
          <button
            onClick={() => onOpenSession(table)}
            className="w-full flex items-center justify-center gap-2 bg-sky-600 hover:bg-sky-500 text-white font-semibold px-4 py-2.5 rounded-xl text-xs sm:text-sm transition cursor-pointer"
          >
            <span>Start Reserved Match</span>
          </button>
        )}

        {table.status === 'maintenance' && (
          <div className="text-center text-[11px] text-slate-500 py-1 font-medium">
            Temporarily Disabled
          </div>
        )}
      </div>
    </div>
  );
};
