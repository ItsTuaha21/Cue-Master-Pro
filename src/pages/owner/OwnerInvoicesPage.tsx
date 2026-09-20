import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Invoice, InvoiceStatus } from '../../types';
import {
  FileText,
  Search,
  CheckCircle2,
  AlertCircle,
  Eye,
  Printer,
  Ban,
  Filter
} from 'lucide-react';

export const InvoicesPage: React.FC = () => {
  const { invoices, settings, currentUser, requestInvoiceVoid } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);

  // Void request form
  const [isVoidModalOpen, setIsVoidModalOpen] = useState(false);
  const [voidReason, setVoidReason] = useState('');

  const filteredInvoices = invoices.filter(inv => {
    const matchesSearch = inv.invoice_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (inv.customer_name && inv.customer_name.toLowerCase().includes(searchQuery.toLowerCase())) ||
                          (inv.table_number && inv.table_number.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesStatus = statusFilter === 'all' || inv.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleRequestVoid = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInvoice || !voidReason.trim()) return;
    requestInvoiceVoid(selectedInvoice.id, voidReason.trim());
    setIsVoidModalOpen(false);
    setVoidReason('');
    alert(`Void request submitted for ${selectedInvoice.invoice_number}. Owner approval pending.`);
  };

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto pb-24 md:pb-8">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
            <FileText className="w-6 h-6 text-emerald-400" />
            <span>Invoices & Combined Billing Ledger</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Historical legal records of table time and snack charges. Invoices are non-destructible and audit-protected.
          </p>
        </div>

        {/* Status Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          {(['all', 'paid', 'open', 'partially_paid', 'voided'] as (InvoiceStatus | 'all')[]).map(status => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize transition whitespace-nowrap ${
                statusFilter === status
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {status.replace('_', ' ')} ({status === 'all' ? invoices.length : invoices.filter(i => i.status === status).length})
            </button>
          ))}
        </div>
      </div>

      {/* Search Input */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="Search by invoice number, customer, or table..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className="w-full bg-slate-900 border border-slate-800 text-white text-xs rounded-xl pl-9 pr-4 py-2.5 focus:outline-none focus:ring-1 focus:ring-emerald-500"
        />
      </div>

      {/* Invoices Table */}
      <div className="border border-slate-800 rounded-2xl overflow-hidden bg-slate-900 shadow-md">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-800/80 text-slate-400 font-semibold border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Invoice #</th>
                <th className="py-3 px-4">Date & Time</th>
                <th className="py-3 px-4">Customer / Table</th>
                <th className="py-3 px-4 text-right">Table Fee</th>
                <th className="py-3 px-4 text-right">F&B Total</th>
                <th className="py-3 px-4 text-right">Grand Total</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredInvoices.map(inv => (
                <tr key={inv.id} className="hover:bg-slate-850/50 transition">
                  <td className="py-3 px-4 font-mono font-bold text-white">{inv.invoice_number}</td>
                  <td className="py-3 px-4 text-slate-400">
                    {new Date(inv.created_at).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                  </td>
                  <td className="py-3 px-4 font-medium text-slate-200">
                    <div>{inv.customer_name || 'Floor Guest'}</div>
                    {inv.table_number && <span className="text-[10px] text-amber-400 font-semibold">{inv.table_number}</span>}
                  </td>
                  <td className="py-3 px-4 text-right font-mono text-slate-300">
                    {settings.currency_symbol} {inv.table_revenue_subtotal.toLocaleString()}
                  </td>
                  <td className="py-3 px-4 text-right font-mono text-slate-300">
                    {settings.currency_symbol} {inv.fnb_revenue_subtotal.toLocaleString()}
                  </td>
                  <td className="py-3 px-4 text-right font-mono font-bold text-emerald-400 text-sm">
                    {settings.currency_symbol} {inv.grand_total.toLocaleString()}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      inv.status === 'paid'
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : inv.status === 'voided'
                        ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                        : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    }`}>
                      {inv.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <button
                      onClick={() => setSelectedInvoice(inv)}
                      className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg text-xs font-medium transition"
                    >
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* INVOICE DETAILS MODAL */}
      {selectedInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="relative w-full max-w-lg bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <h3 className="text-base font-bold text-white">{selectedInvoice.invoice_number}</h3>
                <p className="text-xs text-slate-400">{selectedInvoice.table_number || 'Retail'} • Issued by {selectedInvoice.created_by_name}</p>
              </div>
              <button onClick={() => setSelectedInvoice(null)} className="text-slate-400 hover:text-white">
                ✕
              </button>
            </div>

            {/* Line items */}
            <div className="space-y-1.5 max-h-48 overflow-y-auto">
              {selectedInvoice.items.map(item => (
                <div key={item.id} className="p-2 rounded-lg bg-slate-950/60 border border-slate-800 flex items-center justify-between text-xs">
                  <div>
                    <div className="font-semibold text-white">{item.description}</div>
                    {item.assigned_to_name && (
                      <div className="text-[10px] text-amber-400 font-medium">Assigned: {item.assigned_to_name}</div>
                    )}
                  </div>
                  <div className="font-mono text-slate-200">
                    {settings.currency_symbol} {item.total_price}
                  </div>
                </div>
              ))}
            </div>

            {/* Payment Records */}
            <div className="pt-2 border-t border-slate-800">
              <div className="text-xs font-semibold text-slate-400 mb-1">Payment Tender Records:</div>
              {selectedInvoice.payments.map(p => (
                <div key={p.id} className="text-xs text-slate-300 flex justify-between py-0.5">
                  <span>{p.payer_name} ({p.payment_method.toUpperCase()})</span>
                  <span className="font-mono text-emerald-400 font-bold">{settings.currency_symbol} {p.amount}</span>
                </div>
              ))}
            </div>

            {/* Totals */}
            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex justify-between text-xs font-bold">
              <span className="text-white">Grand Total:</span>
              <span className="text-emerald-400 font-mono text-sm">{settings.currency_symbol} {selectedInvoice.grand_total}</span>
            </div>

            {/* Actions */}
            <div className="pt-2 flex items-center justify-between">
              <button
                onClick={() => window.print()}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5" />
                Print Receipt
              </button>

              {selectedInvoice.status === 'paid' && (
                <button
                  onClick={() => setIsVoidModalOpen(true)}
                  className="px-3 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 rounded-lg text-xs font-semibold flex items-center gap-1.5"
                >
                  <Ban className="w-3.5 h-3.5" />
                  Request Void (Owner Approval)
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* VOID REQUEST MODAL */}
      {isVoidModalOpen && selectedInvoice && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="relative w-full max-w-md bg-slate-900 border border-slate-700 rounded-2xl p-5 space-y-4">
            <h3 className="text-sm font-bold text-white">Request Invoice Void & Reversal</h3>
            <p className="text-xs text-slate-400">
              Voiding invoice {selectedInvoice.invoice_number} ({settings.currency_symbol} {selectedInvoice.grand_total}) requires Club Owner dual-control authorization.
            </p>
            <form onSubmit={handleRequestVoid} className="space-y-3">
              <textarea
                required
                placeholder="Mandatory reason for void (e.g. customer dispute, physical damage, erroneous double bill)..."
                value={voidReason}
                onChange={e => setVoidReason(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 text-white text-xs rounded-xl p-3 h-24 focus:outline-none focus:ring-1 focus:ring-rose-500"
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsVoidModalOpen(false)}
                  className="px-3 py-1.5 text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold"
                >
                  Submit Void Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
