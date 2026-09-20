import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  DollarSign,
  Wallet,
  CheckCircle2,
  TrendingUp,
  CircleDot,
  AlertTriangle,
  Receipt,
  Users,
  Boxes,
  ArrowUpRight,
  ShieldCheck,
  Clock,
  Sparkles
} from 'lucide-react';

export const OwnerDashboard: React.FC = () => {
  const {
    settings,
    tables,
    sessions,
    invoices,
    products,
    approvalRequests,
    shifts,
    collections,
    expenses,
    setActiveView,
    setSelectedTableForModal,
  } = useApp();

  const activeTablesCount = tables.filter(t => t.status === 'occupied').length;
  const pendingApprovals = approvalRequests.filter(a => a.status === 'pending');
  const lowStockProducts = products.filter(p => p.current_stock <= p.low_stock_threshold);

  // Financial aggregates
  const totalGrossRevenue = invoices.reduce((sum, inv) => sum + (inv.status === 'paid' ? inv.grand_total : 0), 0) +
    sessions.filter(s => s.status === 'active').reduce((sum, s) => sum + s.final_amount, 0);

  const tableRevenue = invoices.reduce((sum, inv) => sum + (inv.status === 'paid' ? inv.table_revenue_subtotal : 0), 0) +
    sessions.filter(s => s.status === 'active').reduce((sum, s) => sum + s.table_charge_amount, 0);

  const fnbRevenue = invoices.reduce((sum, inv) => sum + (inv.status === 'paid' ? inv.fnb_revenue_subtotal : 0), 0) +
    sessions.filter(s => s.status === 'active').reduce((sum, s) => sum + s.fnb_charge_amount, 0);

  const approvedCollectionsTotal = collections.filter(c => c.status === 'approved').reduce((sum, c) => sum + c.amount, 0);
  
  // Active shift cash
  const activeShift = shifts.find(s => s.status === 'open');
  const uncollectedCash = activeShift ? activeShift.expected_cash : 0;

  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  const netOperatingMargin = totalGrossRevenue - totalExpenses;

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Top Greeting & Action Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">Executive Dashboard</h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time club financial governance, active occupancy, and staff auditing.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveView('tables')}
            className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-1.5 shadow-md transition"
          >
            <CircleDot className="w-4 h-4" />
            <span>Floor Table Grid</span>
          </button>
          <button
            onClick={() => setActiveView('reports')}
            className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold px-4 py-2 rounded-xl border border-slate-700 flex items-center gap-1.5 transition"
          >
            <TrendingUp className="w-4 h-4 text-emerald-400" />
            <span>Financial Z-Report</span>
          </button>
        </div>
      </div>

      {/* PENDING APPROVALS ALERT (Dual-control callout) */}
      {pendingApprovals.length > 0 && (
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-bold text-amber-300">
                {pendingApprovals.length} Operational Action{pendingApprovals.length > 1 ? 's' : ''} Require Owner Approval
              </div>
              <div className="text-xs text-slate-400">
                Floor staff requested sensitive actions (discounts, shift cash collections, or invoice voids).
              </div>
            </div>
          </div>
          <button
            onClick={() => setActiveView('approvals')}
            className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-4 py-2 rounded-xl text-xs shadow-md transition"
          >
            Review Approval Center
          </button>
        </div>
      )}

      {/* PRIMARY 4 FINANCIAL KPIS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Gross Revenue */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
          <div className="flex items-center justify-between text-xs text-slate-400 font-semibold mb-2">
            <span>Today's Total Revenue</span>
            <DollarSign className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-white font-mono">
            {settings.currency_symbol} {totalGrossRevenue.toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-400 mt-2 flex items-center justify-between pt-2 border-t border-slate-800/80">
            <span>Table: {settings.currency_symbol} {tableRevenue.toLocaleString()}</span>
            <span>F&B: {settings.currency_symbol} {fnbRevenue.toLocaleString()}</span>
          </div>
        </div>

        {/* Uncollected Cash (With Employees) */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
          <div className="flex items-center justify-between text-xs text-slate-400 font-semibold mb-2">
            <span>Uncollected Cash in Drawers</span>
            <Wallet className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-black text-amber-400 font-mono">
            {settings.currency_symbol} {uncollectedCash.toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-400 mt-2 flex items-center justify-between pt-2 border-t border-slate-800/80">
            <span>Active Custody: Ali Raza</span>
            <button onClick={() => setActiveView('collections')} className="text-amber-400 hover:underline">
              Collect &rarr;
            </button>
          </div>
        </div>

        {/* Collected & Vaulted */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
          <div className="flex items-center justify-between text-xs text-slate-400 font-semibold mb-2">
            <span>Approved Vault Collections</span>
            <CheckCircle2 className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-black text-blue-400 font-mono">
            {settings.currency_symbol} {approvedCollectionsTotal.toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-400 mt-2 pt-2 border-t border-slate-800/80">
            <span>Verified in safe deposit</span>
          </div>
        </div>

        {/* Net Operating Margin */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
          <div className="flex items-center justify-between text-xs text-slate-400 font-semibold mb-2">
            <span>Net Operating Margin</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-emerald-400 font-mono">
            {settings.currency_symbol} {netOperatingMargin.toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-400 mt-2 pt-2 border-t border-slate-800/80">
            <span>Expenses deducted: {settings.currency_symbol} {totalExpenses.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* 2-COLUMN SECTION: FLOOR OCCUPANCY & LOW STOCK / ALERTS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Floor Occupancy Visualizer (2 Cols) */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-white tracking-tight">Active Floor Matrix</h3>
              <p className="text-xs text-slate-400">
                {activeTablesCount} of {tables.length} tables currently running matches
              </p>
            </div>
            <button
              onClick={() => setActiveView('tables')}
              className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1"
            >
              <span>Manage Floor</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {tables.map(table => {
              const session = sessions.find(s => s.id === table.current_session_id && s.status === 'active');
              return (
                <div
                  key={table.id}
                  onClick={() => {
                    if (session) {
                      setSelectedTableForModal(table);
                    } else {
                      setActiveView('tables');
                    }
                  }}
                  className={`p-3.5 rounded-xl border transition cursor-pointer ${
                    table.status === 'occupied'
                      ? 'bg-amber-500/10 border-amber-500/40 hover:border-amber-400'
                      : table.status === 'available'
                      ? 'bg-emerald-500/5 border-emerald-500/20 hover:border-emerald-500/40'
                      : 'bg-slate-950/40 border-slate-800'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-white">{table.table_number}</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                      table.status === 'occupied'
                        ? 'bg-amber-500/20 text-amber-300'
                        : table.status === 'available'
                        ? 'bg-emerald-500/20 text-emerald-300'
                        : 'bg-slate-800 text-slate-400'
                    }`}>
                      {table.status}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1 truncate">{table.name}</div>

                  {session && (
                    <div className="mt-2 pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs">
                      <span className="text-slate-400 font-mono">
                        {session.participants.filter(p => p.is_active && p.participant_role === 'player').length} Players
                      </span>
                      <span className="font-bold text-emerald-400 font-mono">
                        {settings.currency_symbol} {session.final_amount}
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Inventory Stock & Alerts (1 Col) */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-white tracking-tight">Stock & Inventory Alerts</h3>
                <p className="text-xs text-slate-400">Automated threshold warnings</p>
              </div>
              <button
                onClick={() => setActiveView('inventory')}
                className="text-xs text-blue-400 hover:text-blue-300 font-semibold flex items-center gap-1"
              >
                <span>Inventory</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {lowStockProducts.length === 0 ? (
              <div className="p-4 text-center rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs">
                All snack & beverage inventory levels are optimal.
              </div>
            ) : (
              <div className="space-y-2">
                {lowStockProducts.map(prod => (
                  <div
                    key={prod.id}
                    className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="font-bold text-white">{prod.name}</div>
                      <div className="text-[10px] text-rose-300">
                        Remaining: <span className="font-bold">{prod.current_stock} {prod.unit}s</span> (Min: {prod.low_stock_threshold})
                      </div>
                    </div>
                    <button
                      onClick={() => setActiveView('inventory')}
                      className="text-[11px] bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 px-2.5 py-1 rounded-lg font-semibold"
                    >
                      Reorder
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800 text-xs text-slate-400 flex items-center justify-between">
            <span>Total Catalog SKUs:</span>
            <span className="font-bold text-white">{products.length} products</span>
          </div>
        </div>
      </div>
    </div>
  );
};
