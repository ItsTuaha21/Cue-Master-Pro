import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Clock3,
  Wallet,
  AlertTriangle,
  CheckCircle2,
  Lock,
  Unlock,
  SendHorizontal,
  History,
  Info
} from 'lucide-react';

export const ShiftsPage: React.FC = () => {
  const { shifts, activeShift, settings, closeShift, requestCashCollection, currentUser } = useApp();

  const [actualCashCounted, setActualCashCounted] = useState<number>(activeShift?.expected_cash || 0);
  const [discrepancyReason, setDiscrepancyReason] = useState<string>('');
  const [isClosingShift, setIsClosingShift] = useState(false);

  const difference = actualCashCounted - (activeShift?.expected_cash || 0);

  const handleCloseShift = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeShift) return;
    if (difference !== 0 && !discrepancyReason.trim()) {
      alert('A valid operational reason is required for cash discrepancy.');
      return;
    }

    closeShift(actualCashCounted, discrepancyReason);
    setIsClosingShift(false);
    alert('Shift closed successfully and submitted for Owner collection approval.');
  };

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto pb-24 md:pb-8">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
          <Clock3 className="w-6 h-6 text-blue-400" />
          <span>Shift Management & Cash Drawer Custody</span>
        </h1>
        <p className="text-xs text-slate-400 mt-0.5">
          Real-time physical cash audit, opening floats, operational cash expenses, and shift closures.
        </p>
      </div>

      {/* ACTIVE SHIFT SECTION */}
      {activeShift ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xl space-y-6">
          <div className="flex items-center justify-between flex-wrap gap-3 pb-4 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <span className="w-3 h-3 rounded-full bg-emerald-400 animate-ping"></span>
              <div>
                <h3 className="text-base font-bold text-white tracking-tight">{activeShift.shift_name} (Active)</h3>
                <p className="text-xs text-slate-400">
                  Custodian: {activeShift.employee_name} • Started: {new Date(activeShift.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsClosingShift(true)}
              className="bg-rose-600 hover:bg-rose-500 text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow-md transition"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Initiate Shift Close & Handover</span>
            </button>
          </div>

          {/* Real-time Math Breakdown */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800">
              <div className="text-[10px] uppercase font-bold text-slate-400">1. Opening Float</div>
              <div className="text-lg font-black text-white font-mono mt-1">
                {settings.currency_symbol} {activeShift.opening_float.toLocaleString()}
              </div>
              <div className="text-[10px] text-slate-400 mt-1">Initial base cash</div>
            </div>

            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800">
              <div className="text-[10px] uppercase font-bold text-emerald-400">+ 2. Cash Collected</div>
              <div className="text-lg font-black text-emerald-400 font-mono mt-1">
                {settings.currency_symbol} {activeShift.cash_sales_collected.toLocaleString()}
              </div>
              <div className="text-[10px] text-slate-400 mt-1">From games & snacks</div>
            </div>

            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800">
              <div className="text-[10px] uppercase font-bold text-rose-400">- 3. Cash Expenses</div>
              <div className="text-lg font-black text-rose-400 font-mono mt-1">
                {settings.currency_symbol} {activeShift.cash_expenses_paid.toLocaleString()}
              </div>
              <div className="text-[10px] text-slate-400 mt-1">Club cleaning / ice</div>
            </div>

            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30">
              <div className="text-[10px] uppercase font-bold text-amber-300">= Expected in Drawer</div>
              <div className="text-xl font-black text-amber-400 font-mono mt-1">
                {settings.currency_symbol} {activeShift.expected_cash.toLocaleString()}
              </div>
              <div className="text-[10px] text-amber-200/70 mt-1">Must be physically present</div>
            </div>
          </div>

          {/* Secondary Digital Tenders (Non-cash) */}
          <div className="bg-slate-950/40 p-3.5 rounded-xl border border-slate-800/80 flex items-center justify-between text-xs">
            <span className="text-slate-400">Drawer Status & Custody:</span>
            <span className="font-mono font-bold text-blue-400">
              {activeShift.status.toUpperCase()}
            </span>
          </div>

          {/* CLOSE SHIFT ACCORDION / FORM */}
          {isClosingShift && (
            <form onSubmit={handleCloseShift} className="bg-slate-950 border border-amber-500/40 p-5 rounded-2xl space-y-4">
              <div className="flex items-center gap-2 text-amber-300 font-bold text-sm">
                <AlertTriangle className="w-4 h-4" />
                <span>Physical Cash Count & Shift Reconciliation</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Counted Physical Cash in Drawer
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={actualCashCounted}
                    onChange={e => setActualCashCounted(parseInt(e.target.value) || 0)}
                    className="w-full bg-slate-900 border border-slate-700 text-white font-mono text-lg font-bold rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 flex flex-col justify-center">
                  <div className="text-[11px] text-slate-400">Discrepancy (Counted - Expected):</div>
                  <div className={`text-xl font-black font-mono mt-0.5 ${
                    difference === 0 ? 'text-emerald-400' : difference > 0 ? 'text-blue-400' : 'text-rose-400'
                  }`}>
                    {difference >= 0 ? `+${settings.currency_symbol} ${difference}` : `-${settings.currency_symbol} ${Math.abs(difference)}`}
                  </div>
                </div>
              </div>

              {difference !== 0 && (
                <div>
                  <label className="block text-xs font-semibold text-rose-300 mb-1">
                    * Reason for Discrepancy (Mandatory for Owner Audit):
                  </label>
                  <textarea
                    required
                    placeholder="Explain shortage or excess (e.g. customer change shortfall, unrecorded bottle breakage)..."
                    value={discrepancyReason}
                    onChange={e => setDiscrepancyReason(e.target.value)}
                    className="w-full bg-slate-900 border border-rose-500/50 text-white text-xs rounded-xl p-3 h-20 focus:outline-none focus:ring-1 focus:ring-rose-500"
                  />
                </div>
              )}

              <div className="flex justify-end gap-3 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsClosingShift(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-6 py-2.5 rounded-xl text-xs shadow-lg transition"
                >
                  Confirm Physical Handover
                </button>
              </div>
            </form>
          )}
        </div>
      ) : (
        <div className="p-8 text-center bg-slate-900 border border-dashed border-slate-800 rounded-2xl text-slate-400 text-xs">
          No active shift currently open. Opening a new shift registers employee cash custody.
        </div>
      )}

      {/* HISTORICAL SHIFTS TABLE */}
      <div>
        <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
          <History className="w-4 h-4 text-slate-400" />
          <span>Past Shifts & Custody Audit Trail</span>
        </h3>

        <div className="border border-slate-800 rounded-2xl overflow-hidden bg-slate-900 shadow-md">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-800/80 text-slate-400 font-semibold border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Shift Name</th>
                  <th className="py-3 px-4">Staff</th>
                  <th className="py-3 px-4 text-right">Float</th>
                  <th className="py-3 px-4 text-right">Cash In</th>
                  <th className="py-3 px-4 text-right">Expenses</th>
                  <th className="py-3 px-4 text-right">Expected</th>
                  <th className="py-3 px-4 text-right">Actual Count</th>
                  <th className="py-3 px-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {shifts.map(shift => (
                  <tr key={shift.id} className="hover:bg-slate-850/50 transition">
                    <td className="py-3 px-4 font-bold text-white">{shift.shift_name}</td>
                    <td className="py-3 px-4 text-slate-300">{shift.employee_name}</td>
                    <td className="py-3 px-4 text-right font-mono text-slate-400">{settings.currency_symbol} {shift.opening_float}</td>
                    <td className="py-3 px-4 text-right font-mono text-emerald-400">+{settings.currency_symbol} {shift.cash_sales_collected}</td>
                    <td className="py-3 px-4 text-right font-mono text-rose-400">-{settings.currency_symbol} {shift.cash_expenses_paid}</td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-amber-400">{settings.currency_symbol} {shift.expected_cash}</td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-white">
                      {shift.actual_cash !== undefined ? `${settings.currency_symbol} ${shift.actual_cash}` : '—'}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        shift.status === 'open' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-800 text-slate-400'
                      }`}>
                        {shift.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
