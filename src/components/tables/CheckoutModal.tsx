import React, { useState } from 'react';
import { TableSession, PhysicalTable, PaymentMethod } from '../../types';
import { useApp } from '../../context/AppContext';
import {
  X,
  CreditCard,
  Receipt,
  CheckCircle,
  Printer,
  ArrowRight,
  Wallet,
  Building,
  UserCheck,
  Split,
  Users
} from 'lucide-react';

interface CheckoutModalProps {
  session: TableSession;
  table: PhysicalTable;
  onClose: () => void;
  onSuccess: (invoiceId: string) => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  session,
  table,
  onClose,
  onSuccess,
}) => {
  const { settings, closeTableSession, settleInvoice } = useApp();

  // Mode: 'single' | 'individual' | 'split_tender'
  const [settlementMode, setSettlementMode] = useState<'single' | 'individual' | 'split_tender'>('single');

  // For 'single' mode
  const defaultPayer = session.assigned_loser_name || session.participants[0]?.display_name || 'Floor Patron';
  const [singlePayerName, setSinglePayerName] = useState(defaultPayer);
  const [singlePaymentMethod, setSinglePaymentMethod] = useState<PaymentMethod>('cash');

  // For 'split_tender' mode
  const [cashTender, setCashTender] = useState<number>(session.final_amount);
  const [cardTender, setCardTender] = useState<number>(0);

  // Completed State
  const [completedInvoiceId, setCompletedInvoiceId] = useState<string | null>(null);

  const players = session.participants.filter(p => p.participant_role === 'player' && p.is_active);
  const viewers = session.participants.filter(p => p.participant_role === 'viewer' && p.is_active);

  // Calculate each participant's portion
  const participantDues = [...players, ...viewers].map(p => {
    const items = session.orders.filter(o => o.assigned_participant_id === p.id);
    const snacks = items.reduce((sum, o) => sum + o.subtotal, 0);
    const isLoser = p.is_loser && session.table_charge_assignment === 'loser_pays';
    const tableShare = isLoser
      ? session.table_charge_amount
      : (session.table_charge_assignment === 'split_equally' ? session.table_charge_amount / players.length : 0);
    return {
      participant: p,
      snacksTotal: snacks,
      tableShare,
      totalDue: snacks + tableShare,
      method: 'cash' as PaymentMethod,
    };
  });

  const [individualTenders, setIndividualTenders] = useState(participantDues);

  const handleProcessCheckout = () => {
    // 1. Close session and create invoice
    const invId = closeTableSession(session.id);
    if (!invId) return;

    // 2. Prepare tenders according to settlement mode
    let tenders: { payerName: string; method: PaymentMethod; amount: number }[] = [];

    if (settlementMode === 'single') {
      tenders = [
        {
          payerName: singlePayerName,
          method: singlePaymentMethod,
          amount: session.final_amount,
        },
      ];
    } else if (settlementMode === 'split_tender') {
      if (cashTender > 0) {
        tenders.push({ payerName: singlePayerName, method: 'cash', amount: cashTender });
      }
      if (cardTender > 0) {
        tenders.push({ payerName: singlePayerName, method: 'card', amount: cardTender });
      }
    } else if (settlementMode === 'individual') {
      tenders = individualTenders.map(t => ({
        payerName: t.participant.display_name,
        method: t.method,
        amount: t.totalDue,
      })).filter(t => t.amount > 0);
    }

    // 3. Settle invoice
    settleInvoice(invId, tenders);
    setCompletedInvoiceId(invId);
    onSuccess(invId);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="bg-slate-800/90 border-b border-slate-700 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Receipt className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white tracking-tight">Checkout & Settlement</h3>
              <p className="text-xs text-slate-400">{session.table_number} • Combined Table Invoice</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700 transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {!completedInvoiceId ? (
            <>
              {/* Grand Total Highlight */}
              <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 flex items-center justify-between">
                <div>
                  <div className="text-xs text-slate-400 uppercase font-semibold">Total Amount Due</div>
                  <div className="text-2xl sm:text-3xl font-black text-emerald-400 font-mono mt-0.5">
                    {settings.currency_symbol} {session.final_amount.toLocaleString()}
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1">
                    Table Time: {settings.currency_symbol} {session.table_charge_amount} + F&B Orders: {settings.currency_symbol} {session.fnb_charge_amount}
                  </div>
                </div>

                <div className="text-right">
                  <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/15 text-amber-300 border border-amber-500/30">
                    {session.table_charge_assignment === 'loser_pays' ? `Loser: ${session.assigned_loser_name}` : 'Equal Split'}
                  </span>
                </div>
              </div>

              {/* Settlement Mode Selection */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                  Select Settlement Method
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setSettlementMode('single')}
                    className={`p-3 rounded-xl border text-left transition ${
                      settlementMode === 'single'
                        ? 'bg-emerald-600/20 border-emerald-500 text-white font-bold'
                        : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <UserCheck className="w-4 h-4 text-emerald-400 mb-1" />
                    <div className="text-xs">One Person Pays All</div>
                    <div className="text-[10px] text-slate-400 mt-0.5 font-normal">e.g. Bilal pays Rs {session.final_amount}</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSettlementMode('individual')}
                    className={`p-3 rounded-xl border text-left transition ${
                      settlementMode === 'individual'
                        ? 'bg-emerald-600/20 border-emerald-500 text-white font-bold'
                        : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <Users className="w-4 h-4 text-amber-400 mb-1" />
                    <div className="text-xs">Individual Items</div>
                    <div className="text-[10px] text-slate-400 mt-0.5 font-normal">Each pays own order</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSettlementMode('split_tender')}
                    className={`p-3 rounded-xl border text-left transition ${
                      settlementMode === 'split_tender'
                        ? 'bg-emerald-600/20 border-emerald-500 text-white font-bold'
                        : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <Split className="w-4 h-4 text-blue-400 mb-1" />
                    <div className="text-xs">Multi-Tender Split</div>
                    <div className="text-[10px] text-slate-400 mt-0.5 font-normal">Cash + Card split</div>
                  </button>
                </div>
              </div>

              {/* MODE 1: ONE PERSON PAYS ALL */}
              {settlementMode === 'single' && (
                <div className="bg-slate-800/60 p-4 rounded-xl border border-slate-700 space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Payer Name</label>
                    <input
                      type="text"
                      value={singlePayerName}
                      onChange={e => setSinglePayerName(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 text-white text-xs rounded-xl p-2.5 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                    <p className="text-[11px] text-slate-400 mt-1">
                      Note: Even though {singlePayerName} pays the full bill, individual snack ownership (Ahmed -&gt; Pepsi, Hamza -&gt; Chips) is permanently preserved in the audit database.
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Payment Method</label>
                    <div className="grid grid-cols-3 gap-2">
                      {(['cash', 'card', 'bank_transfer'] as PaymentMethod[]).map(method => (
                        <button
                          key={method}
                          type="button"
                          onClick={() => setSinglePaymentMethod(method)}
                          className={`py-2 px-3 rounded-lg border text-xs font-semibold uppercase tracking-wider transition ${
                            singlePaymentMethod === method
                              ? 'bg-emerald-600 text-white border-emerald-500'
                              : 'bg-slate-900 border-slate-700 text-slate-400 hover:text-white'
                          }`}
                        >
                          {method.replace('_', ' ')}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* MODE 2: INDIVIDUAL ITEM PAYMENTS */}
              {settlementMode === 'individual' && (
                <div className="space-y-2">
                  <div className="text-xs font-semibold text-slate-300 mb-1">
                    Each Person Settles Their Own Balance:
                  </div>
                  <div className="space-y-1.5 max-h-56 overflow-y-auto">
                    {individualTenders.map((due, idx) => (
                      <div key={idx} className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between text-xs">
                        <div>
                          <div className="font-bold text-white">{due.participant.display_name}</div>
                          <div className="text-[11px] text-slate-400">
                            {due.tableShare > 0 && `Table: ${settings.currency_symbol} ${due.tableShare} `}
                            {due.snacksTotal > 0 && `Snacks: ${settings.currency_symbol} ${due.snacksTotal}`}
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <span className="font-mono font-bold text-emerald-400">
                            {settings.currency_symbol} {due.totalDue}
                          </span>
                          <select
                            value={due.method}
                            onChange={e => {
                              const newMethod = e.target.value as PaymentMethod;
                              setIndividualTenders(prev => prev.map((item, i) => i === idx ? { ...item, method: newMethod } : item));
                            }}
                            className="bg-slate-900 border border-slate-700 text-white text-[11px] rounded-lg px-2 py-1"
                          >
                            <option value="cash">Cash</option>
                            <option value="card">Card</option>
                            <option value="bank_transfer">Bank Transfer</option>
                          </select>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* MODE 3: MULTI-TENDER SPLIT */}
              {settlementMode === 'split_tender' && (
                <div className="bg-slate-800/60 p-4 rounded-xl border border-slate-700 space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">Cash Tendered</label>
                      <input
                        type="number"
                        min="0"
                        max={session.final_amount}
                        value={cashTender}
                        onChange={e => {
                          const val = Math.max(0, parseInt(e.target.value) || 0);
                          setCashTender(val);
                          setCardTender(Math.max(0, session.final_amount - val));
                        }}
                        className="w-full bg-slate-900 border border-slate-700 text-white font-mono text-sm font-bold rounded-xl p-2.5"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">Card / Transfer Tendered</label>
                      <input
                        type="number"
                        min="0"
                        max={session.final_amount}
                        value={cardTender}
                        onChange={e => {
                          const val = Math.max(0, parseInt(e.target.value) || 0);
                          setCardTender(val);
                          setCashTender(Math.max(0, session.final_amount - val));
                        }}
                        className="w-full bg-slate-900 border border-slate-700 text-white font-mono text-sm font-bold rounded-xl p-2.5"
                      />
                    </div>
                  </div>
                  <div className="text-xs text-slate-400 flex items-center justify-between pt-2 border-t border-slate-700">
                    <span>Sum of Tenders:</span>
                    <span className={`font-mono font-bold ${cashTender + cardTender === session.final_amount ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {settings.currency_symbol} {cashTender + cardTender} / {settings.currency_symbol} {session.final_amount}
                    </span>
                  </div>
                </div>
              )}
            </>
          ) : (
            /* Settlement Success & Printable Receipt */
            <div className="text-center py-6 space-y-4">
              <div className="w-14 h-14 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto">
                <CheckCircle className="w-8 h-8" />
              </div>
              <div>
                <h4 className="text-xl font-bold text-white">Payment Received Successfully</h4>
                <p className="text-xs text-slate-400 mt-1">Invoice #{completedInvoiceId} marked as PAID. Table released to Available.</p>
              </div>

              {/* Receipt Preview Card */}
              <div className="max-w-sm mx-auto p-4 bg-slate-950 border border-slate-800 rounded-xl text-left text-xs font-mono text-slate-300 space-y-2">
                <div className="text-center font-bold text-white border-b border-slate-800 pb-2">
                  {settings.club_name.toUpperCase()}
                  <div className="text-[10px] text-slate-400 font-normal">Official Club Receipt</div>
                </div>
                <div className="flex justify-between text-[11px]">
                  <span>Table:</span>
                  <span>{session.table_number}</span>
                </div>
                <div className="flex justify-between text-[11px]">
                  <span>Table Time:</span>
                  <span>{settings.currency_symbol} {session.table_charge_amount}</span>
                </div>
                <div className="flex justify-between text-[11px]">
                  <span>Snacks & Drinks:</span>
                  <span>{settings.currency_symbol} {session.fnb_charge_amount}</span>
                </div>
                <div className="flex justify-between text-[11px] font-bold text-emerald-400 border-t border-slate-800 pt-1">
                  <span>Grand Total:</span>
                  <span>{settings.currency_symbol} {session.final_amount}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-slate-950 border-t border-slate-800 px-6 py-4 flex items-center justify-between">
          {!completedInvoiceId ? (
            <>
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleProcessCheckout}
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-6 py-2.5 rounded-xl text-xs sm:text-sm shadow-lg shadow-emerald-950/50 flex items-center gap-2"
              >
                <CreditCard className="w-4 h-4" />
                <span>Confirm Payment of {settings.currency_symbol} {session.final_amount}</span>
              </button>
            </>
          ) : (
            <div className="w-full flex items-center justify-between">
              <button
                onClick={() => window.print()}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5" />
                Print Thermal Receipt
              </button>
              <button
                onClick={onClose}
                className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-5 py-2.5 rounded-xl"
              >
                Done / Back to Floor
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
