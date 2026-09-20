import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  TrendingUp,
  FileSpreadsheet,
  DollarSign,
  Calendar,
  PieChart,
  BarChart3,
  Coffee,
  CircleDot,
  ArrowUpRight
} from 'lucide-react';

export const ReportsPage: React.FC = () => {
  const { invoices, sessions, products, expenses, tables, settings } = useApp();

  const [dateRange, setDateRange] = useState('today');

  // Revenue computations
  const totalTableRevenue = invoices.reduce((sum, inv) => sum + (inv.status === 'paid' ? inv.table_revenue_subtotal : 0), 0) +
    sessions.filter(s => s.status === 'active').reduce((sum, s) => sum + s.table_charge_amount, 0);

  const totalFnbRevenue = invoices.reduce((sum, inv) => sum + (inv.status === 'paid' ? inv.fnb_revenue_subtotal : 0), 0) +
    sessions.filter(s => s.status === 'active').reduce((sum, s) => sum + s.fnb_charge_amount, 0);

  const grossRevenue = totalTableRevenue + totalFnbRevenue;
  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  const netMargin = grossRevenue - totalExpenses;

  // Payment Breakdown
  const cashPayments = invoices.flatMap(i => i.payments).filter(p => p.payment_method === 'cash').reduce((sum, p) => sum + p.amount, 0);
  const cardPayments = invoices.flatMap(i => i.payments).filter(p => p.payment_method === 'card').reduce((sum, p) => sum + p.amount, 0);
  const bankPayments = invoices.flatMap(i => i.payments).filter(p => p.payment_method === 'bank_transfer').reduce((sum, p) => sum + p.amount, 0);

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto pb-24 md:pb-8">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
            <TrendingUp className="w-6 h-6 text-emerald-400" />
            <span>Financial Analytics & Daily Z-Report</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            End-of-day revenue reconciliation, table turnover, F&B profit margins, and payment tender distribution.
          </p>
        </div>

        {/* Date Filter */}
        <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs">
          {['today', 'this_week', 'this_month'].map(r => (
            <button
              key={r}
              onClick={() => setDateRange(r)}
              className={`px-3 py-1.5 rounded-lg font-semibold capitalize transition ${
                dateRange === r ? 'bg-emerald-600 text-white font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              {r.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* P&L Executive Summary Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <h3 className="text-sm font-bold text-white mb-4 flex items-center justify-between">
          <span>Profit & Loss Statement ({dateRange.replace('_', ' ').toUpperCase()})</span>
          <span className="text-xs font-mono text-emerald-400">All figures in {settings.currency}</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2 text-xs">
            <div className="font-bold text-emerald-400 uppercase text-[11px]">Revenue Streams</div>
            <div className="flex justify-between text-slate-300">
              <span>Table / Game Fees:</span>
              <span className="font-mono font-bold text-white">{settings.currency_symbol} {totalTableRevenue.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-slate-300">
              <span>Snacks & Beverages:</span>
              <span className="font-mono font-bold text-white">{settings.currency_symbol} {totalFnbRevenue.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-slate-300">
              <span>Club Memberships:</span>
              <span className="font-mono font-bold text-white">{settings.currency_symbol} 0</span>
            </div>
            <div className="pt-2 border-t border-slate-800 flex justify-between font-bold text-sm text-emerald-400">
              <span>Gross Total:</span>
              <span className="font-mono">{settings.currency_symbol} {grossRevenue.toLocaleString()}</span>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2 text-xs">
            <div className="font-bold text-rose-400 uppercase text-[11px]">Operating Outflows</div>
            <div className="flex justify-between text-slate-300">
              <span>Club Expenses:</span>
              <span className="font-mono font-bold text-rose-300">-{settings.currency_symbol} {totalExpenses.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-slate-300">
              <span>Estimated Cost of Goods (F&B):</span>
              <span className="font-mono text-slate-400">-{settings.currency_symbol} {Math.round(totalFnbRevenue * 0.55).toLocaleString()}</span>
            </div>
            <div className="pt-2 border-t border-slate-800 flex justify-between font-bold text-sm text-rose-400">
              <span>Total Outflow:</span>
              <span className="font-mono">-{settings.currency_symbol} {(totalExpenses + Math.round(totalFnbRevenue * 0.55)).toLocaleString()}</span>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex flex-col justify-between">
            <div>
              <div className="font-bold text-emerald-300 uppercase text-[11px]">Net Operating Margin</div>
              <div className="text-3xl font-black text-emerald-400 font-mono mt-2">
                {settings.currency_symbol} {netMargin.toLocaleString()}
              </div>
              <p className="text-xs text-emerald-200/70 mt-1">
                Net operational profitability after club consumables & floor costs.
              </p>
            </div>
            <div className="text-[11px] text-emerald-300 font-medium">
              Margin percentage: {grossRevenue > 0 ? Math.round((netMargin / grossRevenue) * 100) : 0}%
            </div>
          </div>
        </div>
      </div>

      {/* 2-Column: Payment Tenders & Top Selling Snacks */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Payment Tenders */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
            <PieChart className="w-4 h-4 text-blue-400" />
            <span>Tender Methods Distribution</span>
          </h3>

          <div className="space-y-3 text-xs">
            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between">
              <div>
                <div className="font-bold text-amber-300">Physical Cash (Drawer)</div>
                <div className="text-[11px] text-slate-400">Subject to shift drawer verification</div>
              </div>
              <div className="text-right font-mono font-bold text-amber-400 text-sm">
                {settings.currency_symbol} {cashPayments.toLocaleString()}
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between">
              <div>
                <div className="font-bold text-blue-300">POS Card Payments</div>
                <div className="text-[11px] text-slate-400">Direct merchant settlement</div>
              </div>
              <div className="text-right font-mono font-bold text-blue-400 text-sm">
                {settings.currency_symbol} {cardPayments.toLocaleString()}
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between">
              <div>
                <div className="font-bold text-emerald-300">Bank Transfer / Raast</div>
                <div className="text-[11px] text-slate-400">Direct account deposit</div>
              </div>
              <div className="text-right font-mono font-bold text-emerald-400 text-sm">
                {settings.currency_symbol} {bankPayments.toLocaleString()}
              </div>
            </div>
          </div>
        </div>

        {/* Top Products */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
            <Coffee className="w-4 h-4 text-amber-400" />
            <span>F&B Product Margin Performance</span>
          </h3>

          <div className="space-y-2 text-xs">
            {products.slice(0, 4).map(p => (
              <div key={p.id} className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between">
                <div>
                  <div className="font-bold text-white">{p.name}</div>
                  <div className="text-[10px] text-slate-400">Selling: {settings.currency_symbol}{p.selling_price} • Cost: {settings.currency_symbol}{p.cost_price}</div>
                </div>
                <div className="text-right font-mono text-emerald-400 font-bold">
                  +{settings.currency_symbol} {p.selling_price - p.cost_price} / unit ({Math.round(((p.selling_price - p.cost_price) / p.selling_price) * 100)}%)
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
