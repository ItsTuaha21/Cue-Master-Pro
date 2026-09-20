import React from 'react';
import { PhysicalTable, TableSession } from '../../types';
import { useApp } from '../../context/AppContext';
import { 
  CircleDot, 
  Users, 
  Clock, 
  Receipt, 
  AlertCircle, 
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
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            Available
          </span>
        );
      case 'occupied':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/15 text-amber-300 border border-amber-500/30">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
            Occupied
          </span>
        );
      case 'reserved':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-500/15 text-blue-300 border border-blue-500/30">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>
            Reserved
          </span>
        );
      case 'maintenance':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-500/15 text-rose-300 border border-rose-500/30">
            <Wrench className="w-3 h-3" />
            Maintenance
          </span>
        );
      default:
        return null;
    }
  };

  const getBorderColor = () => {
    switch (table.status) {
      case 'available':
        return 'border-emerald-600/30 hover:border-emerald-500/60 bg-slate-900/90';
      case 'occupied':
        return 'border-amber-500/50 bg-slate-900 shadow-lg shadow-amber-950/20';
      case 'reserved':
        return 'border-blue-500/40 bg-slate-900/90';
      case 'maintenance':
        return 'border-slate-700 bg-slate-900/50 opacity-80';
      default:
        return 'border-slate-800 bg-slate-900';
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
      className={`rounded-2xl border transition-all duration-200 p-5 flex flex-col justify-between ${getBorderColor()}`}
    >
      {/* Header */}
      <div>
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold text-white tracking-tight">{table.table_number}</h3>
              <span className="text-xs text-slate-400 font-normal">({table.table_type})</span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">{table.name}</p>
          </div>
          {getStatusBadge()}
        </div>

        {/* OCCUPIED CONTENT */}
        {table.status === 'occupied' && session && (
          <div className="mt-4 space-y-3">
            {/* Live Metrics Ribbon */}
            <div className="grid grid-cols-2 gap-2 bg-slate-950/60 p-2.5 rounded-xl border border-slate-800">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-400 shrink-0" />
                <div>
                  <div className="text-[10px] text-slate-400 uppercase font-medium">Session Time</div>
                  <div className="text-sm font-bold text-white font-mono">{getElapsedString()}</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Receipt className="w-4 h-4 text-emerald-400 shrink-0" />
                <div>
                  <div className="text-[10px] text-slate-400 uppercase font-medium">Running Bill</div>
                  <div className="text-sm font-bold text-emerald-400">
                    {settings.currency_symbol} {session.final_amount.toLocaleString()}
                  </div>
                </div>
              </div>
            </div>

            {/* Players & Viewers Roster */}
            <div>
              <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5">
                <span className="flex items-center gap-1 font-medium">
                  <Users className="w-3.5 h-3.5 text-slate-400" />
                  Players ({players.length}):
                </span>
                {viewers.length > 0 && (
                  <span className="text-slate-400">Viewers ({viewers.length})</span>
                )}
              </div>
              <div className="flex flex-wrap gap-1.5">
                {players.map((p) => (
                  <span
                    key={p.id}
                    className={`text-xs px-2 py-0.5 rounded-md font-medium ${
                      p.is_loser
                        ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                        : 'bg-slate-800 text-slate-200 border border-slate-700'
                    }`}
                  >
                    {p.display_name} {p.is_loser && '(Loser)'}
                  </span>
                ))}
              </div>
            </div>

            {/* F&B Orders Count */}
            {session.orders.length > 0 && (
              <div className="text-xs text-slate-400 flex items-center justify-between bg-slate-800/40 px-2.5 py-1.5 rounded-lg border border-slate-800">
                <span>Snacks & Drinks Orders:</span>
                <span className="font-semibold text-slate-200">{session.orders.length} items ({settings.currency_symbol} {session.fnb_charge_amount})</span>
              </div>
            )}
          </div>
        )}

        {/* AVAILABLE CONTENT */}
        {table.status === 'available' && (
          <div className="mt-4 py-4 text-center border border-dashed border-slate-800 rounded-xl bg-slate-950/30">
            <Sparkles className="w-6 h-6 text-emerald-400/60 mx-auto mb-1.5" />
            <div className="text-xs font-semibold text-slate-300">Ready for Match</div>
            <div className="text-[11px] text-slate-400 mt-0.5">Standard rate: {settings.currency_symbol} 600/hr</div>
          </div>
        )}

        {/* RESERVED CONTENT */}
        {table.status === 'reserved' && (
          <div className="mt-4 p-3 rounded-xl bg-blue-950/20 border border-blue-900/30 text-xs">
            <div className="text-blue-300 font-semibold">{table.maintenance_notes || 'Advance Booking'}</div>
            <div className="text-slate-400 mt-1">Check-in when players arrive.</div>
          </div>
        )}

        {/* MAINTENANCE CONTENT */}
        {table.status === 'maintenance' && (
          <div className="mt-4 p-3 rounded-xl bg-slate-950/40 border border-slate-800 text-xs text-slate-400">
            {table.maintenance_notes || 'Service in progress. Not available for play.'}
          </div>
        )}
      </div>

      {/* Action Footer */}
      <div className="mt-5 pt-3 border-t border-slate-800/80">
        {table.status === 'occupied' && session && (
          <button
            onClick={() => onViewSession(table, session)}
            className="w-full flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-4 py-2.5 rounded-xl text-xs sm:text-sm shadow-md transition active:scale-[0.98]"
          >
            <Receipt className="w-4 h-4" />
            <span>Manage Session & Running Bill</span>
            <ChevronRight className="w-4 h-4 ml-auto" />
          </button>
        )}

        {table.status === 'available' && (
          <button
            onClick={() => onOpenSession(table)}
            className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold px-4 py-2.5 rounded-xl text-xs sm:text-sm shadow-md shadow-emerald-950/40 transition active:scale-[0.98]"
          >
            <PlayCircle className="w-4 h-4" />
            <span>Open Table Session</span>
          </button>
        )}

        {table.status === 'reserved' && (
          <button
            onClick={() => onOpenSession(table)}
            className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold px-4 py-2 rounded-xl text-xs sm:text-sm transition"
          >
            <span>Start Reserved Session</span>
          </button>
        )}

        {table.status === 'maintenance' && (
          <div className="text-center text-[11px] text-slate-400 py-1 font-medium">
            Temporarily Disabled
          </div>
        )}
      </div>
    </div>
  );
};
