import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  TrendingDown,
  Plus,
  Wallet,
  Building,
  Calendar,
  Filter,
  DollarSign
} from 'lucide-react';

export const ExpensesPage: React.FC = () => {
  const { expenses, settings, activeShift, recordExpense } = useApp();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Supplies & Consumables');
  const [amount, setAmount] = useState<number>(500);
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'bank_transfer'>('cash');
  const [notes, setNotes] = useState('');

  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  const drawerCashExpenses = expenses.filter(e => e.is_cash_drawer_deduction).reduce((sum, e) => sum + e.amount, 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || amount <= 0) return;

    recordExpense(title.trim(), category, amount, paymentMethod, notes);
    setIsModalOpen(false);
    setTitle('');
    setAmount(500);
    setNotes('');
    alert('Expense recorded successfully.');
  };

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto pb-24 md:pb-8">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
            <TrendingDown className="w-6 h-6 text-rose-400" />
            <span>Operational Expenses & Cash Outflow</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Log daily club running costs. Cash payouts are automatically reconciled from current shift cash float.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs px-4 py-2 rounded-xl flex items-center gap-1.5 shadow-md transition"
        >
          <Plus className="w-4 h-4" />
          <span>Record Club Expense</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl">
          <div className="text-xs text-slate-400 font-semibold mb-1">Total Operating Expenses</div>
          <div className="text-2xl font-black text-white font-mono">
            {settings.currency_symbol} {totalExpenses.toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Across all categories</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl">
          <div className="text-xs text-rose-300 font-semibold mb-1">Paid via Shift Cash Drawer</div>
          <div className="text-2xl font-black text-rose-400 font-mono">
            {settings.currency_symbol} {drawerCashExpenses.toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Deducted from active float</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl">
          <div className="text-xs text-blue-300 font-semibold mb-1">Paid via Bank / Vault</div>
          <div className="text-2xl font-black text-blue-400 font-mono">
            {settings.currency_symbol} {(totalExpenses - drawerCashExpenses).toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Direct club account wire</div>
        </div>
      </div>

      {/* Expenses Table */}
      <div className="border border-slate-800 rounded-2xl overflow-hidden bg-slate-900 shadow-md">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-800/80 text-slate-400 font-semibold border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Date & Time</th>
                <th className="py-3 px-4">Title / Purpose</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Payer / Tender</th>
                <th className="py-3 px-4 text-right">Amount</th>
                <th className="py-3 px-4">Approved / Recorded By</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {expenses.map(exp => (
                <tr key={exp.id} className="hover:bg-slate-850/50 transition">
                  <td className="py-3 px-4 text-slate-400">
                    {new Date(exp.created_at).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                  </td>
                  <td className="py-3 px-4 font-bold text-white">
                    <div>{exp.recipient_name}</div>
                    {exp.description && <div className="text-[10px] text-slate-400 font-normal">{exp.description}</div>}
                  </td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-800 text-slate-300">
                      {exp.category}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`inline-flex items-center gap-1 font-semibold ${
                      exp.is_cash_drawer_deduction ? 'text-amber-400' : 'text-blue-400'
                    }`}>
                      {exp.is_cash_drawer_deduction ? <Wallet className="w-3 h-3" /> : <Building className="w-3 h-3" />}
                      {exp.payment_method.toUpperCase()} {exp.is_cash_drawer_deduction && '(DRAWER)'}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right font-mono font-bold text-rose-400 text-sm">
                    -{settings.currency_symbol} {exp.amount.toLocaleString()}
                  </td>
                  <td className="py-3 px-4 text-slate-300 font-medium">
                    {exp.recorded_by_name}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="relative w-full max-w-md bg-slate-900 border border-slate-700 rounded-2xl p-6 space-y-4">
            <h3 className="text-base font-bold text-white">Record Operational Expense</h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Expense Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ice bags for drinks cooler, Table cue chalk..."
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 text-white text-xs rounded-xl p-2.5"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Category</label>
                  <select
                    value={category}
                    onChange={e => setCategory(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 text-white text-xs rounded-xl p-2.5"
                  >
                    <option value="Supplies & Consumables">Supplies & Consumables</option>
                    <option value="Table & Cue Maintenance">Table & Cue Maintenance</option>
                    <option value="Cleaning & Sanitation">Cleaning & Sanitation</option>
                    <option value="Utilities & Bills">Utilities & Bills</option>
                    <option value="Staff Refreshments">Staff Refreshments</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Amount</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={amount}
                    onChange={e => setAmount(parseInt(e.target.value) || 0)}
                    className="w-full bg-slate-950 border border-slate-700 text-white font-mono text-xs rounded-xl p-2.5"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Paid From</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('cash')}
                    className={`py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition ${
                      paymentMethod === 'cash'
                        ? 'bg-amber-500/20 border-amber-500 text-amber-300 font-bold'
                        : 'bg-slate-950 border-slate-800 text-slate-400'
                    }`}
                  >
                    <Wallet className="w-3.5 h-3.5" />
                    <span>Drawer Cash</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('bank_transfer')}
                    className={`py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition ${
                      paymentMethod === 'bank_transfer'
                        ? 'bg-blue-600/20 border-blue-500 text-blue-300 font-bold'
                        : 'bg-slate-950 border-slate-800 text-slate-400'
                    }`}
                  >
                    <Building className="w-3.5 h-3.5" />
                    <span>Bank / Direct</span>
                  </button>
                </div>
                {paymentMethod === 'cash' && (
                  <p className="text-[11px] text-amber-400/80 mt-1">
                    * Will immediately deduct {settings.currency_symbol} {amount} from active shift drawer balance.
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Notes / Voucher Reference</label>
                <input
                  type="text"
                  placeholder="Optional receipt or vendor info..."
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 text-white text-xs rounded-xl p-2.5"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-rose-600 hover:bg-rose-500 text-white font-bold px-5 py-2 rounded-xl text-xs"
                >
                  Save Expense
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
