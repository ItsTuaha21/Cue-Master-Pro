import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Clock3,
  Wallet,
  AlertTriangle,
  CheckCircle2,
  Lock,
  History,
  X
} from 'lucide-react';

export const ShiftsPage: React.FC = () => {
  const { shifts, activeShift, settings, closeShift } = useApp();

  const [actualCashCounted, setActualCashCounted] = useState<number>(activeShift?.expected_cash || 0);
  const [discrepancyReason, setDiscrepancyReason] = useState<string>('');
  const [isClosingShift, setIsClosingShift] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  const difference = actualCashCounted - (activeShift?.expected_cash || 0);

  const handleCloseShift = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeShift) return;
    if (difference !== 0 && !discrepancyReason.trim()) {
      setValidationError('A valid operational reason is required for cash discrepancy.');
      return;
    }

    setValidationError(null);
    closeShift(actualCashCounted, discrepancyReason);
    setIsClosingShift(false);
    setStatusMessage('Shift closed successfully and submitted for Owner collection approval.');
    setTimeout(() => setStatusMessage(null), 4000);
  };

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto pb-24 md:pb-8">
      {/* Notifications */}
      {statusMessage && (
        <div className="p-3.5 rounded-xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-xs flex items-center justify-between shadow-lg">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span className="font-semibold">{statusMessage}</span>
          </div>
          <button onClick={() => setStatusMessage(null)} className="text-emerald-400 hover:text-white cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
          <Clock3 className="w-6 h-6 text-emerald-400" />
          <span>Shift Custody & Cash Drawer Reconciliation</span>
        </h1>
        <p className="text-xs text-slate-400 mt-0.5">
          Real-time physical drawer tracking, opening floats, operational cash expenses, and shift closures.
        </p>
      </div>

      {/* ACTIVE SHIFT SECTION */}
      {activeShift ? (
        <div className="bg-[#0e1612] border border-emerald-900/40 rounded-2xl p-5 sm:p-6 shadow-xl shadow-black/40 space-y-6">
          <div className="flex items-center justify-between flex-wrap gap-3 pb-4 border-b border-emerald-950">
            <div className="flex items-center gap-3">
              <span className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse"></span>
              <div>
                <h3 className="text-base font-bold text-white tracking-tight">{activeShift.shift_name} (Active)</h3>
                <p className="text-xs text-slate-400">
                  Custodian: {activeShift.employee_name} • Started: {new Date(activeShift.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsClosingShift(true)}
              className="bg-rose-600 hover:bg-rose-500 text-white font-bold px-4 py-2.5 rounded-xl text-xs flex items-center gap-1.5 shadow-md shadow-rose-950/50 transition cursor-pointer"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Initiate Shift Close & Handover</span>
            </button>
          </div>

          {/* Real-time Math Breakdown */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-4 rounded-xl bg-[#080d0a] border border-emerald-950">
              <div className="text-[10px] uppercase font-bold text-slate-400 font-mono">1. Opening Float</div>
              <div className="text-lg font-black text-white font-mono mt-1">
                {settings.currency_symbol} {activeShift.opening_float.toLocaleString()}
              </div>
              <div className="text-[10px] text-slate-500 mt-1">Initial base cash</div>
            </div>

            <div className="p-4 rounded-xl bg-[#080d0a] border border-emerald-950">
              <div className="text-[10px] uppercase font-bold text-emerald-400 font-mono">+ 2. Cash Collected</div>
              <div className="text-lg font-black text-emerald-400 font-mono mt-1">
                {settings.currency_symbol} {activeShift.cash_sales_collected.toLocaleString()}
              </div>
              <div className="text-[10px] text-slate-500 mt-1">From games & café</div>
            </div>

            <div className="p-4 rounded-xl bg-[#080d0a] border border-emerald-950">
              <div className="text-[10px] uppercase font-bold text-rose-400 font-mono">- 3. Cash Expenses</div>
              <div className="text-lg font-black text-rose-400 font-mono mt-1">
                {settings.currency_symbol} {activeShift.cash_expenses_paid.toLocaleString()}
              </div>
              <div className="text-[10px] text-slate-500 mt-1">Club maintenance / supplies</div>
            </div>

            <div className="p-4 rounded-xl bg-amber-950/40 border border-amber-500/30">
              <div className="text-[10px] uppercase font-bold text-amber-300 font-mono">= Expected in Drawer</div>
              <div className="text-xl font-black text-amber-400 font-mono mt-1">
                {settings.currency_symbol} {activeShift.expected_cash.toLocaleString()}
              </div>
              <div className="text-[10px] text-amber-200/70 mt-1">Must be physically present</div>
            </div>
          </div>

          {/* Secondary Digital Tenders (Non-cash) */}
          <div className="bg-[#080d0a] p-3.5 rounded-xl border border-emerald-950 flex items-center justify-between text-xs">
            <span className="text-slate-400">Drawer Status & Custody:</span>
            <span className="font-mono font-bold text-emerald-400 uppercase">
              {activeShift.status}
            </span>
          </div>

          {/* CLOSE SHIFT ACCORDION / FORM */}
          {isClosingShift && (
            <form onSubmit={handleCloseShift} className="bg-[#080d0a] border border-amber-500/40 p-5 rounded-2xl space-y-4 shadow-xl">
              <div className="flex items-center gap-2 text-amber-300 font-bold text-sm">
                <AlertTriangle className="w-4 h-4" />
                <span>Physical Cash Count & Reconciliation</span>
              </div>

              {validationError && (
                <div className="p-2.5 rounded-lg bg-rose-950/70 border border-rose-500/40 text-rose-300 text-xs font-medium">
                  {validationError}
                </div>
              )}

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
                    className="w-full bg-[#0e1612] border border-emerald-900/40 text-white font-mono text-lg font-bold rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div className="p-3 bg-[#0e1612] rounded-xl border border-emerald-950 flex flex-col justify-center">
                  <div className="text-[11px] text-slate-400">Discrepancy (Counted - Expected):</div>
                  <div className={`text-xl font-black font-mono mt-0.5 ${
                    difference === 0 ? 'text-emerald-400' : difference > 0 ? 'text-sky-400' : 'text-rose-400'
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
                    placeholder="Explain shortage or excess..."
                    value={discrepancyReason}
                    onChange={e => setDiscrepancyReason(e.target.value)}
                    className="w-full bg-[#0e1612] border border-rose-500/50 text-white text-xs rounded-xl p-3 h-20 focus:outline-none focus:ring-1 focus:ring-rose-500"
                  />
                </div>
              )}

              <div className="flex justify-end gap-3 pt-2 border-t border-emerald-950">
                <button
                  type="button"
                  onClick={() => setIsClosingShift(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-6 py-2.5 rounded-xl text-xs shadow-lg shadow-emerald-950/60 transition cursor-pointer"
                >
                  Confirm Physical Handover
                </button>
              </div>
            </form>
          )}
        </div>
      ) : (
        <div className="p-8 text-center bg-[#0e1612] border border-dashed border-emerald-900/30 rounded-2xl text-slate-400 text-xs">
          No active shift currently open. Opening a new shift registers employee cash custody.
        </div>
      )}

      {/* HISTORICAL SHIFTS TABLE */}
      <div>
        <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
          <History className="w-4 h-4 text-emerald-400" />
          <span>Past Shifts & Custody Audit Trail</span>
        </h3>

        <div className="border border-emerald-900/30 rounded-2xl overflow-hidden bg-[#0e1612] shadow-xl shadow-black/40">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#080d0a] text-slate-400 font-semibold border-b border-emerald-950">
                <tr>
                  <th className="py-3 px-4">Shift Name</th>
                  <th className="py-3 px-4">Custodian</th>
                  <th className="py-3 px-4 text-right">Float</th>
                  <th className="py-3 px-4 text-right">Cash In</th>
                  <th className="py-3 px-4 text-right">Expenses</th>
                  <th className="py-3 px-4 text-right">Expected</th>
                  <th className="py-3 px-4 text-right">Actual Count</th>
                  <th className="py-3 px-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-emerald-950/60">
                {shifts.map(shift => (
                  <tr key={shift.id} className="hover:bg-[#121c17]/50 transition">
                    <td className="py-3 px-4 font-bold text-white">{shift.shift_name}</td>
                    <td className="py-3 px-4 text-slate-300">{shift.employee_name}</td>
                    <td className="py-3 px-4 text-right font-mono text-slate-400">{settings.currency_symbol} {shift.opening_float.toLocaleString()}</td>
                    <td className="py-3 px-4 text-right font-mono text-emerald-400">+{settings.currency_symbol} {shift.cash_sales_collected.toLocaleString()}</td>
                    <td className="py-3 px-4 text-right font-mono text-rose-400">-{settings.currency_symbol} {shift.cash_expenses_paid.toLocaleString()}</td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-amber-400">{settings.currency_symbol} {shift.expected_cash.toLocaleString()}</td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-white">
                      {shift.actual_cash !== undefined ? `${settings.currency_symbol} ${shift.actual_cash.toLocaleString()}` : '—'}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        shift.status === 'open' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-slate-800 text-slate-400'
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
