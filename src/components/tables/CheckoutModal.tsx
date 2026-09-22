import React, { useState } from 'react';
import { TableSession, PhysicalTable, PaymentMethod, PAYMENT_METHOD_LABELS } from '../../types';
import { useApp } from '../../context/AppContext';
import {
  X,
  CreditCard,
  Receipt,
  CheckCircle,
  Printer,
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
      : (session.table_charge_assignment === 'split_equally' ? session.table_charge_amount / (players.length || 1) : 0);
    return {
      participant: p,
      snacksTotal: snacks,
      tableShare,
      totalDue: snacks + tableShare,
      method: 'cash' as PaymentMethod,
    };
  });

  const [individualTenders, setIndividualTenders] = useState(participantDues);

  const supportedMethods: PaymentMethod[] = [
    'cash',
    'jazzcash',
    'easypaisa',
    'bank_transfer',
    'debit_card',
    'credit_card',
  ];

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
        tenders.push({ payerName: singlePayerName, method: 'debit_card', amount: cardTender });
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-[#0e1612] border border-emerald-900/40 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] shadow-black/80">
        {/* Header */}
        <div className="bg-[#080d0a] border-b border-emerald-900/30 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-950 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Receipt className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">Checkout & Settlement</h3>
              <p className="text-xs text-slate-400">{session.table_number} • CueDesk Settlement</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {!completedInvoiceId ? (
            <>
              {/* Grand Total Highlight */}
              <div className="bg-[#080d0a] border border-emerald-900/40 rounded-2xl p-4 flex items-center justify-between">
                <div>
                  <div className="text-xs text-slate-400 uppercase font-bold tracking-wider font-mono">Total Amount Due</div>
                  <div className="text-2xl sm:text-3xl font-black text-emerald-400 font-mono mt-0.5">
                    {settings.currency_symbol} {session.final_amount.toLocaleString()}
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1">
                    Table: {settings.currency_symbol} {session.table_charge_amount.toLocaleString()} + Café: {settings.currency_symbol} {session.fnb_charge_amount.toLocaleString()}
                  </div>
                </div>

                <div className="text-right">
                  <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-amber-950/80 text-amber-300 border border-amber-500/40">
                    {session.table_charge_assignment === 'loser_pays' ? `Loser: ${session.assigned_loser_name}` : 'Equal Split'}
                  </span>
                </div>
              </div>

              {/* Settlement Mode Selection */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-emerald-400/90 mb-2 font-mono">
                  Settlement Allocation Mode
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setSettlementMode('single')}
                    className={`p-3 rounded-xl border text-left transition cursor-pointer ${
                      settlementMode === 'single'
                        ? 'bg-emerald-950/70 border-emerald-400 text-white font-bold ring-1 ring-emerald-400/30'
                        : 'bg-[#080d0a] border-emerald-950/80 text-slate-300 hover:border-emerald-800'
                    }`}
                  >
                    <UserCheck className="w-4 h-4 text-emerald-400 mb-1" />
                    <div className="text-xs font-semibold">Single Payer</div>
                    <div className="text-[10px] text-slate-400 mt-0.5 font-normal">One person pays all</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSettlementMode('individual')}
                    className={`p-3 rounded-xl border text-left transition cursor-pointer ${
                      settlementMode === 'individual'
                        ? 'bg-emerald-950/70 border-emerald-400 text-white font-bold ring-1 ring-emerald-400/30'
                        : 'bg-[#080d0a] border-emerald-950/80 text-slate-300 hover:border-emerald-800'
                    }`}
                  >
                    <Users className="w-4 h-4 text-amber-400 mb-1" />
                    <div className="text-xs font-semibold">Individual Tabs</div>
                    <div className="text-[10px] text-slate-400 mt-0.5 font-normal">Each pays own order</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSettlementMode('split_tender')}
                    className={`p-3 rounded-xl border text-left transition cursor-pointer ${
                      settlementMode === 'split_tender'
                        ? 'bg-emerald-950/70 border-emerald-400 text-white font-bold ring-1 ring-emerald-400/30'
                        : 'bg-[#080d0a] border-emerald-950/80 text-slate-300 hover:border-emerald-800'
                    }`}
                  >
                    <Split className="w-4 h-4 text-sky-400 mb-1" />
                    <div className="text-xs font-semibold">Split Tender</div>
                    <div className="text-[10px] text-slate-400 mt-0.5 font-normal">Cash + Card split</div>
                  </button>
                </div>
              </div>

              {/* MODE 1: ONE PERSON PAYS ALL */}
              {settlementMode === 'single' && (
                <div className="bg-[#080d0a] p-4 rounded-xl border border-emerald-950 space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Primary Payer Name</label>
                    <input
                      type="text"
                      value={singlePayerName}
                      onChange={e => setSinglePayerName(e.target.value)}
                      className="w-full bg-[#0c120f] border border-emerald-900/40 text-white text-xs rounded-xl p-2.5 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-2">Payment Method</label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {supportedMethods.map(method => (
                        <button
                          key={method}
                          type="button"
                          onClick={() => setSinglePaymentMethod(method)}
                          className={`py-2 px-2.5 rounded-xl border text-xs font-semibold transition cursor-pointer ${
                            singlePaymentMethod === method
                              ? 'bg-emerald-600 text-white border-emerald-400 shadow-sm'
                              : 'bg-[#0c120f] border-emerald-950 text-slate-400 hover:text-white'
                          }`}
                        >
                          {PAYMENT_METHOD_LABELS[method]}
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
                    Each Patron Settles Their Assigned Total:
                  </div>
                  <div className="space-y-1.5 max-h-56 overflow-y-auto">
                    {individualTenders.map((due, idx) => (
                      <div key={idx} className="p-3 rounded-xl bg-[#080d0a] border border-emerald-950 flex items-center justify-between text-xs">
                        <div>
                          <div className="font-bold text-white">{due.participant.display_name}</div>
                          <div className="text-[11px] text-slate-400">
                            {due.tableShare > 0 && `Table: ${settings.currency_symbol} ${due.tableShare} `}
                            {due.snacksTotal > 0 && `Café: ${settings.currency_symbol} ${due.snacksTotal}`}
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
                            className="bg-[#0c120f] border border-emerald-900/40 text-white text-[11px] rounded-lg px-2 py-1"
                          >
                            {supportedMethods.map(m => (
                              <option key={m} value={m}>{PAYMENT_METHOD_LABELS[m]}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* MODE 3: MULTI-TENDER SPLIT */}
              {settlementMode === 'split_tender' && (
                <div className="bg-[#080d0a] p-4 rounded-xl border border-emerald-950 space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">Cash Tender ({settings.currency_symbol})</label>
                      <input
                        type="number"
                        value={cashTender}
                        onChange={e => setCashTender(Number(e.target.value))}
                        className="w-full bg-[#0c120f] border border-emerald-900/40 text-white text-xs rounded-xl p-2.5 font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">Digital/Card Tender ({settings.currency_symbol})</label>
                      <input
                        type="number"
                        value={cardTender}
                        onChange={e => setCardTender(Number(e.target.value))}
                        className="w-full bg-[#0c120f] border border-emerald-900/40 text-white text-xs rounded-xl p-2.5 font-mono"
                      />
                    </div>
                  </div>
                  <div className="text-xs text-slate-400 flex items-center justify-between pt-2 border-t border-emerald-950">
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
              <div className="max-w-sm mx-auto p-4 bg-[#080d0a] border border-emerald-900/40 rounded-xl text-left text-xs font-mono text-slate-300 space-y-2">
                <div className="text-center font-bold text-white border-b border-emerald-950 pb-2">
                  <div className="text-emerald-400 font-black tracking-tight text-sm">CUEDESK POS</div>
                  <div>{settings.club_name.toUpperCase()}</div>
                  <div className="text-[10px] text-slate-500 font-normal">Official Club Receipt</div>
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
                  <span>Café Orders:</span>
                  <span>{settings.currency_symbol} {session.fnb_charge_amount}</span>
                </div>
                <div className="flex justify-between text-[11px] font-bold text-emerald-400 border-t border-emerald-950 pt-1">
                  <span>Grand Total:</span>
                  <span>{settings.currency_symbol} {session.final_amount}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-[#080d0a] border-t border-emerald-900/30 px-6 py-4 flex items-center justify-between">
          {!completedInvoiceId ? (
            <>
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleProcessCheckout}
                className="bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-bold px-6 py-2.5 rounded-xl text-xs sm:text-sm shadow-lg shadow-emerald-950/60 flex items-center gap-2 border border-emerald-400/20 cursor-pointer"
              >
                <CreditCard className="w-4 h-4" />
                <span>Confirm Settlement ({settings.currency_symbol} {session.final_amount.toLocaleString()})</span>
              </button>
            </>
          ) : (
            <div className="w-full flex items-center justify-between">
              <button
                onClick={() => window.print()}
                className="px-4 py-2 bg-[#121d17] hover:bg-[#182820] text-emerald-300 border border-emerald-800/40 rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                Print Receipt
              </button>
              <button
                onClick={onClose}
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-6 py-2 rounded-xl text-xs cursor-pointer"
              >
                Done
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
