import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Boxes,
  Plus,
  ArrowDownLeft,
  ArrowUpRight,
  AlertTriangle,
  History,
  FileSpreadsheet
} from 'lucide-react';

export const InventoryPage: React.FC = () => {
  const { products, inventoryTransactions, settings, recordStockMovement } = useApp();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState(products[0]?.id || '');
  const [movementType, setMovementType] = useState<'purchase' | 'damage' | 'adjustment'>('purchase');
  const [quantity, setQuantity] = useState<number>(10);
  const [unitCost, setUnitCost] = useState<number>(100);
  const [reason, setReason] = useState<string>('');

  const handleStockSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProductId) return;

    recordStockMovement(
      selectedProductId,
      movementType,
      quantity,
      unitCost,
      reason || (movementType === 'purchase' ? 'Warehouse replenishment' : 'Damaged / Expired bottle write-off')
    );

    setIsModalOpen(false);
    setQuantity(10);
    setReason('');
    alert('Inventory movement recorded and stock levels updated.');
  };

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto pb-24 md:pb-8">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
            <Boxes className="w-6 h-6 text-blue-400" />
            <span>Inventory & Stock Ledger</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Track wholesale purchases, supplier restocks, damages, and auto-depletions on table consumption.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs px-4 py-2 rounded-xl flex items-center gap-1.5 shadow-md transition"
        >
          <Plus className="w-4 h-4" />
          <span>Record Stock In / Adjustment</span>
        </button>
      </div>

      {/* Stock Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {products.map(p => (
          <div key={p.id} className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 text-xs">
            <div className="font-bold text-white truncate">{p.name}</div>
            <div className="text-[11px] text-slate-400 mt-0.5">{p.category_name}</div>
            <div className="mt-2 text-base font-black font-mono text-emerald-400">
              {p.current_stock} <span className="text-xs font-normal text-slate-400">{p.unit}s</span>
            </div>
          </div>
        ))}
      </div>

      {/* RECENT INVENTORY TRANSACTIONS */}
      <div>
        <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
          <History className="w-4 h-4 text-slate-400" />
          <span>Stock Movement Audit Logs</span>
        </h3>

        <div className="border border-slate-800 rounded-2xl overflow-hidden bg-slate-900 shadow-md">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-800/80 text-slate-400 font-semibold border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Date & Time</th>
                  <th className="py-3 px-4">Product</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4 text-right">Qty Change</th>
                  <th className="py-3 px-4 text-right">Balance</th>
                  <th className="py-3 px-4">Logged By / Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {inventoryTransactions.map(tx => (
                  <tr key={tx.id} className="hover:bg-slate-850/50 transition">
                    <td className="py-3 px-4 text-slate-400">
                      {new Date(tx.created_at).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                    </td>
                    <td className="py-3 px-4 font-bold text-white">{tx.product_name}</td>
                    <td className="py-3 px-4">
                      <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        tx.transaction_type === 'purchase' || tx.transaction_type === 'stock_in'
                          ? 'bg-emerald-500/20 text-emerald-300'
                          : tx.transaction_type === 'sale'
                          ? 'bg-blue-500/20 text-blue-300'
                          : 'bg-rose-500/20 text-rose-300'
                      }`}>
                        {tx.transaction_type.replace('_', ' ')}
                      </span>
                    </td>
                    <td className={`py-3 px-4 text-right font-mono font-bold ${tx.quantity_change > 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {tx.quantity_change > 0 ? `+${tx.quantity_change}` : tx.quantity_change}
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-slate-300">
                      {tx.balance_after}
                    </td>
                    <td className="py-3 px-4 text-slate-400">
                      <div>{tx.notes || '—'}</div>
                      <span className="text-[10px] text-slate-400 font-semibold">By: {tx.performed_by_name}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* RECORD STOCK MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="relative w-full max-w-md bg-slate-900 border border-slate-700 rounded-2xl p-6 space-y-4">
            <h3 className="text-base font-bold text-white">Record Stock In / Adjustment</h3>

            <form onSubmit={handleStockSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Product</label>
                <select
                  value={selectedProductId}
                  onChange={e => setSelectedProductId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 text-white text-xs rounded-xl p-2.5"
                >
                  {products.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.name} (Current: {p.current_stock} {p.unit}s)
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Movement Type</label>
                  <select
                    value={movementType}
                    onChange={e => setMovementType(e.target.value as 'purchase' | 'damage' | 'adjustment')}
                    className="w-full bg-slate-950 border border-slate-700 text-white text-xs rounded-xl p-2.5"
                  >
                    <option value="purchase">Purchase (Stock In)</option>
                    <option value="damaged">Damage / Breakage</option>
                    <option value="adjustment">Manual Adjustment</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Quantity</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={quantity}
                    onChange={e => setQuantity(parseInt(e.target.value) || 1)}
                    className="w-full bg-slate-950 border border-slate-700 text-white font-mono text-xs rounded-xl p-2.5"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Cost Per Unit</label>
                <input
                  type="number"
                  min="0"
                  value={unitCost}
                  onChange={e => setUnitCost(parseInt(e.target.value) || 0)}
                  className="w-full bg-slate-950 border border-slate-700 text-white font-mono text-xs rounded-xl p-2.5"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Reason / Notes</label>
                <input
                  type="text"
                  placeholder="e.g. Received from Metro Cash & Carry..."
                  value={reason}
                  onChange={e => setReason(e.target.value)}
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
                  className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-5 py-2 rounded-xl text-xs"
                >
                  Save Stock Movement
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
