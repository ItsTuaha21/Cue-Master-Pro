import React, { useState } from 'react';
import { TableSession, PhysicalTable } from '../../types';
import { useApp } from '../../context/AppContext';
import {
  X,
  Clock,
  Receipt,
  Users,
  Eye,
  Plus,
  Trash2,
  Trophy,
  Coffee,
  CheckCircle2,
  AlertCircle,
  CreditCard,
  PauseCircle,
  PlayCircle
} from 'lucide-react';

interface RunningBillModalProps {
  session: TableSession;
  table: PhysicalTable;
  onClose: () => void;
  onProceedToCheckout: (session: TableSession) => void;
}

export const RunningBillModal: React.FC<RunningBillModalProps> = ({
  session,
  table,
  onClose,
  onProceedToCheckout,
}) => {
  const {
    settings,
    products,
    categories,
    addOrderToSession,
    removeOrderItemFromSession,
    assignSessionLoser,
    setChargeAssignmentMode,
    addParticipantToSession,
    removeParticipantFromSession,
    pauseSession,
    resumeSession,
  } = useApp();

  // Tab State: 'bill' | 'add_order' | 'participants'
  const [activeTab, setActiveTab] = useState<'bill' | 'add_order' | 'participants'>('bill');

  // New Participant Form
  const [newPartName, setNewPartName] = useState('');
  const [newPartRole, setNewPartRole] = useState<'player' | 'viewer'>('player');

  // New Order Item State
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedProductId, setSelectedProductId] = useState<string>(products[0]?.id || '');
  const [orderQuantity, setOrderQuantity] = useState<number>(1);
  const [assignedParticipantId, setAssignedParticipantId] = useState<string>(session.participants[0]?.id || '');
  const [isSharedOrder, setIsSharedOrder] = useState<boolean>(false);

  const players = session.participants.filter(p => p.participant_role === 'player' && p.is_active);
  const viewers = session.participants.filter(p => p.participant_role === 'viewer' && p.is_active);

  const selectedProduct = products.find(p => p.id === selectedProductId);

  const handleAddOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProductId) return;
    addOrderToSession(
      session.id,
      selectedProductId,
      isSharedOrder ? undefined : assignedParticipantId,
      isSharedOrder,
      orderQuantity
    );
    // Reset order form
    setOrderQuantity(1);
    setActiveTab('bill');
  };

  const handleAddParticipant = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPartName.trim()) return;
    addParticipantToSession(session.id, newPartName.trim(), newPartRole);
    setNewPartName('');
  };

  const filteredProducts = selectedCategory === 'all'
    ? products
    : products.filter(p => p.category_id === selectedCategory);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-slate-800/90 border-b border-slate-700 px-6 py-4 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3">
              <span className="text-xl font-bold text-white tracking-tight">{session.table_number}</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-semibold border border-amber-500/30">
                Active Session
              </span>
              <span className="text-xs text-slate-400 font-medium">({session.table_name})</span>
            </div>
            <div className="flex items-center gap-4 text-xs text-slate-400 mt-1">
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                Started: {new Date(session.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} ({session.total_duration_minutes || 60} mins)
              </span>
              <span>•</span>
              <span>Rate: {session.rate_name}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {session.status === 'active' ? (
              <button
                onClick={() => pauseSession(session.id)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-xs text-slate-200 transition"
              >
                <PauseCircle className="w-3.5 h-3.5 text-amber-400" />
                <span>Pause</span>
              </button>
            ) : (
              <button
                onClick={() => resumeSession(session.id)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-600 text-xs text-white transition"
              >
                <PlayCircle className="w-3.5 h-3.5 text-white" />
                <span>Resume</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700/80 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Selection */}
        <div className="bg-slate-900/60 border-b border-slate-800 px-6 py-2 flex items-center gap-2">
          <button
            onClick={() => setActiveTab('bill')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${
              activeTab === 'bill'
                ? 'bg-amber-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            Running Bill & Orders ({session.orders.length})
          </button>
          <button
            onClick={() => setActiveTab('add_order')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${
              activeTab === 'add_order'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Coffee className="w-3.5 h-3.5" />
            <span>+ Add Snacks & Drinks</span>
          </button>
          <button
            onClick={() => setActiveTab('participants')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${
              activeTab === 'participants'
                ? 'bg-slate-700 text-white shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Manage Players ({players.length}) & Viewers ({viewers.length})</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* TAB 1: RUNNING BILL & LOSER ASSIGNMENT */}
          {activeTab === 'bill' && (
            <div className="space-y-6">
              {/* CORE BUSINESS RULE CALLOUT: LOSER CHARGE ASSIGNMENT */}
              <div className="bg-slate-800/70 border border-slate-700 rounded-xl p-4">
                <div className="flex items-center justify-between flex-wrap gap-2 mb-3">
                  <div className="flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-amber-400" />
                    <div>
                      <span className="text-sm font-bold text-white">Table / Game Charge Liability</span>
                      <p className="text-[11px] text-slate-400">
                        Select who is responsible for the table time ({settings.currency_symbol} {session.table_charge_amount}). Snacks & drinks maintain independent ownership!
                      </p>
                    </div>
                  </div>

                  {/* Mode switcher */}
                  <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-lg border border-slate-700 text-xs">
                    <button
                      onClick={() => setChargeAssignmentMode(session.id, 'loser_pays')}
                      className={`px-2.5 py-1 rounded font-medium transition ${
                        session.table_charge_assignment === 'loser_pays' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400'
                      }`}
                    >
                      Loser Pays
                    </button>
                    <button
                      onClick={() => setChargeAssignmentMode(session.id, 'split_equally')}
                      className={`px-2.5 py-1 rounded font-medium transition ${
                        session.table_charge_assignment === 'split_equally' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400'
                      }`}
                    >
                      Split Equally
                    </button>
                    <button
                      onClick={() => setChargeAssignmentMode(session.id, 'single_designated')}
                      className={`px-2.5 py-1 rounded font-medium transition ${
                        session.table_charge_assignment === 'single_designated' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400'
                      }`}
                    >
                      Designated Player
                    </button>
                  </div>
                </div>

                {/* Player Chips to Select Loser */}
                {session.table_charge_assignment === 'loser_pays' && (
                  <div>
                    <div className="text-xs font-semibold text-slate-300 mb-2">
                      Designate Frame Loser:
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {players.map(player => (
                        <button
                          key={player.id}
                          type="button"
                          onClick={() => assignSessionLoser(session.id, player.id)}
                          className={`p-2.5 rounded-xl border text-left transition flex items-center justify-between ${
                            player.is_loser
                              ? 'bg-rose-500/20 border-rose-500 text-white font-bold ring-1 ring-rose-500'
                              : 'bg-slate-900/80 border-slate-700 text-slate-300 hover:border-slate-600'
                          }`}
                        >
                          <div>
                            <div className="text-xs font-semibold">{player.display_name}</div>
                            <div className="text-[10px] text-slate-400">{player.is_loser ? 'OWNS GAME CHARGE' : 'Player'}</div>
                          </div>
                          {player.is_loser && <CheckCircle2 className="w-4 h-4 text-rose-400" />}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* ITEMIZED ORDERS TABLE (WITH CLEAR WHO ORDERED WHAT) */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                    Consumed Snacks & Drinks ({session.orders.length} items)
                  </h4>
                  <button
                    onClick={() => setActiveTab('add_order')}
                    className="text-xs text-blue-400 hover:text-blue-300 font-medium flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Add More Items
                  </button>
                </div>

                {session.orders.length === 0 ? (
                  <div className="p-6 text-center border border-dashed border-slate-800 rounded-xl bg-slate-950/20 text-xs text-slate-400">
                    No snacks or drinks ordered yet for this session.
                  </div>
                ) : (
                  <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-950/40">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-800/80 text-slate-400 font-semibold border-b border-slate-800">
                        <tr>
                          <th className="py-2.5 px-3">Item</th>
                          <th className="py-2.5 px-3">Ordered By (Ownership)</th>
                          <th className="py-2.5 px-3 text-center">Qty</th>
                          <th className="py-2.5 px-3 text-right">Price</th>
                          <th className="py-2.5 px-3 text-right">Subtotal</th>
                          <th className="py-2.5 px-2 text-center w-8"></th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60">
                        {session.orders.map(item => (
                          <tr key={item.id} className="hover:bg-slate-800/30 transition">
                            <td className="py-2.5 px-3 font-medium text-white">{item.product_name}</td>
                            <td className="py-2.5 px-3">
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-800 text-amber-300 border border-slate-700">
                                {item.assigned_name || 'Shared / Table'}
                              </span>
                            </td>
                            <td className="py-2.5 px-3 text-center font-mono text-slate-300">{item.quantity}</td>
                            <td className="py-2.5 px-3 text-right text-slate-400 font-mono">
                              {settings.currency_symbol} {item.unit_price}
                            </td>
                            <td className="py-2.5 px-3 text-right font-bold text-white font-mono">
                              {settings.currency_symbol} {item.subtotal}
                            </td>
                            <td className="py-2.5 px-2 text-center">
                              <button
                                onClick={() => removeOrderItemFromSession(session.id, item.id)}
                                className="p-1 rounded text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition"
                                title="Remove item & restock"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* INDIVIDUAL RECIPIENT SUMMARY BREAKDOWN */}
              <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2.5">
                  Individual Liability Breakdown
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 text-xs">
                  {/* Players Breakdown */}
                  {players.map(p => {
                    const playerItems = session.orders.filter(o => o.assigned_participant_id === p.id);
                    const playerSnacksTotal = playerItems.reduce((sum, o) => sum + o.subtotal, 0);
                    const isLoser = p.is_loser && session.table_charge_assignment === 'loser_pays';
                    const tableShare = isLoser
                      ? session.table_charge_amount
                      : (session.table_charge_assignment === 'split_equally' ? session.table_charge_amount / players.length : 0);
                    const totalLiability = playerSnacksTotal + tableShare;

                    return (
                      <div key={p.id} className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                        <div className="flex items-center justify-between font-semibold text-white">
                          <span>{p.display_name}</span>
                          <span className="font-mono text-emerald-400">{settings.currency_symbol} {totalLiability}</span>
                        </div>
                        <div className="text-[11px] text-slate-400 mt-1 space-y-0.5">
                          {isLoser && <div className="text-rose-400 font-medium">• Table Charge: {settings.currency_symbol} {tableShare}</div>}
                          {!isLoser && tableShare > 0 && <div>• Table Share: {settings.currency_symbol} {tableShare}</div>}
                          <div>• Snacks & Drinks: {settings.currency_symbol} {playerSnacksTotal} ({playerItems.length} items)</div>
                        </div>
                      </div>
                    );
                  })}

                  {/* Viewers Breakdown */}
                  {viewers.map(v => {
                    const viewerItems = session.orders.filter(o => o.assigned_participant_id === v.id);
                    const viewerSnacksTotal = viewerItems.reduce((sum, o) => sum + o.subtotal, 0);
                    return (
                      <div key={v.id} className="p-3 rounded-lg bg-slate-900/60 border border-slate-800/80">
                        <div className="flex items-center justify-between font-semibold text-slate-300">
                          <span>{v.display_name}</span>
                          <span className="font-mono text-slate-200">{settings.currency_symbol} {viewerSnacksTotal}</span>
                        </div>
                        <div className="text-[11px] text-slate-400 mt-1">
                          <div>• Viewer Drinks: {settings.currency_symbol} {viewerSnacksTotal} ({viewerItems.length} items)</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: ADD SNACKS & DRINKS */}
          {activeTab === 'add_order' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-white">Add Snacks & Drinks to Table</h4>
                <div className="flex items-center gap-1 overflow-x-auto pb-1 max-w-full">
                  <button
                    onClick={() => setSelectedCategory('all')}
                    className={`px-3 py-1 rounded-lg text-xs font-medium transition whitespace-nowrap ${
                      selectedCategory === 'all' ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-300'
                    }`}
                  >
                    All Items
                  </button>
                  {categories.map(cat => (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCategory(cat.id)}
                      className={`px-3 py-1 rounded-lg text-xs font-medium transition whitespace-nowrap ${
                        selectedCategory === cat.id ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-300'
                      }`}
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Form to Select Product, Qty and Person */}
              <form onSubmit={handleAddOrder} className="bg-slate-800/60 p-4 rounded-xl border border-slate-700 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* Select Product */}
                  <div className="sm:col-span-1">
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Select Product</label>
                    <select
                      value={selectedProductId}
                      onChange={e => setSelectedProductId(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 text-white text-xs rounded-xl p-2.5 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    >
                      {filteredProducts.map(p => (
                        <option key={p.id} value={p.id}>
                          {p.name} — {settings.currency_symbol} {p.selling_price} (Stock: {p.current_stock})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Quantity */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Quantity</label>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setOrderQuantity(Math.max(1, orderQuantity - 1))}
                        className="w-9 h-9 rounded-lg bg-slate-700 text-white font-bold flex items-center justify-center hover:bg-slate-600"
                      >
                        -
                      </button>
                      <input
                        type="number"
                        min="1"
                        max={selectedProduct?.current_stock || 99}
                        value={orderQuantity}
                        onChange={e => setOrderQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                        className="w-16 text-center bg-slate-900 border border-slate-700 text-white text-sm rounded-lg py-1.5 font-bold"
                      />
                      <button
                        type="button"
                        onClick={() => setOrderQuantity(orderQuantity + 1)}
                        className="w-9 h-9 rounded-lg bg-slate-700 text-white font-bold flex items-center justify-center hover:bg-slate-600"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {/* Assign to Participant */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-xs font-semibold text-slate-300">Assign Order To</label>
                      <label className="flex items-center gap-1 text-[11px] text-amber-300 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={isSharedOrder}
                          onChange={e => setIsSharedOrder(e.target.checked)}
                          className="rounded bg-slate-900 border-slate-700 text-emerald-500"
                        />
                        <span>Shared/Table</span>
                      </label>
                    </div>
                    <select
                      disabled={isSharedOrder}
                      value={assignedParticipantId}
                      onChange={e => setAssignedParticipantId(e.target.value)}
                      className={`w-full bg-slate-900 border border-slate-700 text-white text-xs rounded-xl p-2.5 focus:ring-2 focus:ring-emerald-500 focus:outline-none ${
                        isSharedOrder ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                    >
                      <optgroup label="Players">
                        {players.map(p => (
                          <option key={p.id} value={p.id}>
                            {p.display_name} (Player)
                          </option>
                        ))}
                      </optgroup>
                      {viewers.length > 0 && (
                        <optgroup label="Viewers">
                          {viewers.map(v => (
                            <option key={v.id} value={v.id}>
                              {v.display_name} (Viewer)
                            </option>
                          ))}
                        </optgroup>
                      )}
                    </select>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-700">
                  <div className="text-xs text-slate-400">
                    Item Total: <span className="text-white font-bold font-mono">{settings.currency_symbol} {(selectedProduct?.selling_price || 0) * orderQuantity}</span>
                  </div>
                  <button
                    type="submit"
                    className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow-md"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Confirm & Add to Bill</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* TAB 3: MANAGE PARTICIPANTS */}
          {activeTab === 'participants' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-white">Active Floor Roster</h4>
              </div>

              {/* Add Participant Input */}
              <form onSubmit={handleAddParticipant} className="flex gap-2 bg-slate-800/60 p-3 rounded-xl border border-slate-700">
                <input
                  type="text"
                  placeholder="Enter name (e.g. Kamran, Viewer 3)"
                  value={newPartName}
                  onChange={e => setNewPartName(e.target.value)}
                  className="flex-1 bg-slate-900 border border-slate-700 text-white text-xs rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
                <select
                  value={newPartRole}
                  onChange={e => setNewPartRole(e.target.value as 'player' | 'viewer')}
                  className="bg-slate-900 border border-slate-700 text-white text-xs rounded-lg px-2.5 py-2"
                >
                  <option value="player">Player</option>
                  <option value="viewer">Viewer</option>
                </select>
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold px-4 py-2 rounded-lg flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add
                </button>
              </form>

              {/* Players & Viewers Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800">
                  <div className="text-xs font-bold text-amber-300 uppercase tracking-wider mb-2">Players</div>
                  <div className="space-y-1.5">
                    {players.map(p => (
                      <div key={p.id} className="flex items-center justify-between p-2 rounded-lg bg-slate-900 border border-slate-800 text-xs">
                        <span className="font-semibold text-white">{p.display_name}</span>
                        <div className="flex items-center gap-2">
                          {p.is_loser && <span className="text-[10px] bg-rose-500/20 text-rose-300 px-1.5 py-0.5 rounded font-bold">Loser</span>}
                          <button
                            type="button"
                            onClick={() => removeParticipantFromSession(session.id, p.id)}
                            className="text-slate-400 hover:text-rose-400"
                            title="Mark player as left"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800">
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Viewers (Non-players)</div>
                  <div className="space-y-1.5">
                    {viewers.length === 0 ? (
                      <div className="text-xs text-slate-400 py-3 text-center">No viewers registered.</div>
                    ) : (
                      viewers.map(v => (
                        <div key={v.id} className="flex items-center justify-between p-2 rounded-lg bg-slate-900 border border-slate-800 text-xs">
                          <span className="font-medium text-slate-300">{v.display_name}</span>
                          <button
                            type="button"
                            onClick={() => removeParticipantFromSession(session.id, v.id)}
                            className="text-slate-400 hover:text-rose-400"
                            title="Mark viewer as left"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer: Grand Total & Settlement Action */}
        <div className="bg-slate-950 border-t border-slate-800 p-4 sm:p-5 flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-6">
            <div>
              <div className="text-[11px] uppercase tracking-wider font-semibold text-slate-400">Table Charge</div>
              <div className="text-sm font-bold text-white font-mono">{settings.currency_symbol} {session.table_charge_amount}</div>
            </div>
            <div>
              <div className="text-[11px] uppercase tracking-wider font-semibold text-slate-400">Snacks & Drinks</div>
              <div className="text-sm font-bold text-white font-mono">{settings.currency_symbol} {session.fnb_charge_amount}</div>
            </div>
            <div className="pl-4 border-l border-slate-800">
              <div className="text-[11px] uppercase tracking-wider font-semibold text-amber-400">Running Grand Total</div>
              <div className="text-xl sm:text-2xl font-black text-emerald-400 font-mono">
                {settings.currency_symbol} {session.final_amount.toLocaleString()}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-300 hover:bg-slate-800 transition"
            >
              Keep Session Running
            </button>
            <button
              onClick={() => onProceedToCheckout(session)}
              className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-6 py-2.5 rounded-xl text-xs sm:text-sm shadow-lg shadow-emerald-950/50 transition active:scale-95"
            >
              <CreditCard className="w-4 h-4" />
              <span>Finish Game & Take Payment</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
