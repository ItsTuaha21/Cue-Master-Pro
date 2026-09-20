import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Wallet,
  ShieldCheck,
  ArrowRight,
  CheckCircle2,
  Clock3,
  AlertCircle,
  Building2,
  Plus
} from 'lucide-react';

export const CollectionsPage: React.FC = () => {
  const {
    collections,
    shifts,
    settings,
    currentUser,
    approveCashCollection,
    requestCashCollection
  } = useApp();

  const [handoverAmount, setHandoverAmount] = useState<number>(10000);
  const [handoverNotes, setHandoverNotes] = useState<string>('');
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);

  // Active shift with cash
  const activeShift = shifts.find(s => s.status === 'open');
  const pendingCollections = collections.filter(c => c.status === 'pending');
  const approvedCollections = collections.filter(c => c.status === 'approved');

  const handleRequestSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeShift) return;
    requestCashCollection(activeShift.id, handoverAmount, handoverNotes);
    setIsRequestModalOpen(false);
    setHandoverNotes('');
    alert('Cash handover request submitted for Owner sign-off.');
  };

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto pb-24 md:pb-8">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
            <Wallet className="w-6 h-6 text-emerald-400" />
            <span>Cash Collection & Vault Governance</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Custodial transfer of physical cash from staff drawers into the secure club vault.
          </p>
        </div>

        {currentUser.role === 'employee' && activeShift && (
          <button
            onClick={() => setIsRequestModalOpen(true)}
            className="bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs px-4 py-2 rounded-xl flex items-center gap-1.5 shadow-md transition"
          >
            <Plus className="w-4 h-4" />
            <span>Submit Handover to Owner</span>
          </button>
        )}
      </div>

      {/* CUSTODY AUDIT BANNER */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
            <Clock3 className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-slate-400 uppercase font-bold">Uncollected Cash Floating with Employees</div>
            <div className="text-2xl font-black text-amber-400 font-mono mt-0.5">
              {settings.currency_symbol} {activeShift ? activeShift.expected_cash.toLocaleString() : '0'}
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">
              Sitting in active custody of {activeShift?.employee_name || 'No active staff'}.
            </div>
          </div>
        </div>

        <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs text-slate-400 max-w-md">
          <div className="flex items-center gap-1.5 text-blue-300 font-bold mb-1">
            <ShieldCheck className="w-4 h-4" />
            Dual-Control Security Principle
          </div>
          Cash collections transfer physical funds into the vault and update custodian balance without inflating game or F&B sales revenue.
        </div>
      </div>

      {/* PENDING APPROVALS LIST (OWNER ACTION) */}
      <div>
        <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
          <span>Pending Handover Approvals</span>
          {pendingCollections.length > 0 && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold">
              {pendingCollections.length} Pending
            </span>
          )}
        </h3>

        {pendingCollections.length === 0 ? (
          <div className="p-6 text-center bg-slate-900 border border-dashed border-slate-800 rounded-2xl text-slate-400 text-xs">
            No cash handover requests currently awaiting owner sign-off.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pendingCollections.map(col => (
              <div key={col.id} className="p-5 rounded-2xl bg-slate-900 border border-amber-500/40 space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="text-xs text-slate-400">Shift Handover from</div>
                    <div className="text-base font-bold text-white">{col.employee_name}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-slate-400">Amount to Vault</div>
                    <div className="text-xl font-black text-amber-400 font-mono">
                      {settings.currency_symbol} {col.amount.toLocaleString()}
                    </div>
                  </div>
                </div>

                {col.notes && (
                  <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 text-xs text-slate-300">
                    "{col.notes}"
                  </div>
                )}

                <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400">
                    Requested: {new Date(col.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>

                  {currentUser.role === 'owner' ? (
                    <button
                      onClick={() => approveCashCollection(col.id)}
                      className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow-md shadow-emerald-950/40 transition"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Approve & Vault Cash</span>
                    </button>
                  ) : (
                    <span className="text-xs text-amber-400 font-medium">Awaiting Owner Approval</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* APPROVED COLLECTIONS HISTORY */}
      <div>
        <h3 className="text-sm font-bold text-white mb-3">Historical Vault Receipts</h3>
        <div className="border border-slate-800 rounded-2xl overflow-hidden bg-slate-900">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-800/80 text-slate-400 font-semibold border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Date & Time</th>
                <th className="py-3 px-4">Shift Custodian</th>
                <th className="py-3 px-4">Approved By</th>
                <th className="py-3 px-4 text-right">Amount Vaulted</th>
                <th className="py-3 px-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {approvedCollections.map(col => (
                <tr key={col.id} className="hover:bg-slate-850/50 transition">
                  <td className="py-3 px-4 text-slate-400">
                    {new Date(col.created_at).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                  </td>
                  <td className="py-3 px-4 font-semibold text-white">{col.employee_name}</td>
                  <td className="py-3 px-4 text-slate-300">{col.collected_by_name || 'Club Owner'}</td>
                  <td className="py-3 px-4 text-right font-mono font-bold text-emerald-400">
                    {settings.currency_symbol} {col.amount.toLocaleString()}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-500/20 text-emerald-300">
                      Vaulted
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* REQUEST MODAL FOR EMPLOYEE */}
      {isRequestModalOpen && activeShift && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="relative w-full max-w-md bg-slate-900 border border-slate-700 rounded-2xl p-6 space-y-4">
            <h3 className="text-base font-bold text-white">Submit Drawer Handover to Owner</h3>
            <p className="text-xs text-slate-400">
              Current drawer balance: {settings.currency_symbol} {activeShift.expected_cash.toLocaleString()}
            </p>

            <form onSubmit={handleRequestSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Handover Amount</label>
                <input
                  type="number"
                  min="1"
                  max={activeShift.expected_cash}
                  value={handoverAmount}
                  onChange={e => setHandoverAmount(parseInt(e.target.value) || 0)}
                  className="w-full bg-slate-950 border border-slate-700 text-white font-mono text-base font-bold rounded-xl p-2.5"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Notes / Safe Reference</label>
                <input
                  type="text"
                  placeholder="e.g. Mid-shift cash drop for safe storage..."
                  value={handoverNotes}
                  onChange={e => setHandoverNotes(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 text-white text-xs rounded-xl p-2.5"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsRequestModalOpen(false)}
                  className="px-4 py-2 text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-5 py-2 rounded-xl text-xs"
                >
                  Submit Handover
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
