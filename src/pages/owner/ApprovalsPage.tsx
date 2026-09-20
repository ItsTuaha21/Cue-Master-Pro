import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ApprovalType, ApprovalStatus } from '../../types';
import {
  ShieldAlert,
  CheckCircle2,
  XCircle,
  Clock3,
  Filter,
  AlertTriangle,
  Receipt,
  Wallet,
  Tag
} from 'lucide-react';

export const ApprovalsPage: React.FC = () => {
  const { approvalRequests, approveRequest, rejectRequest, settings } = useApp();
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('pending');

  const filteredRequests = approvalRequests.filter(req => {
    const matchesType = filterType === 'all' || req.request_type === filterType;
    const matchesStatus = filterStatus === 'all' || req.status === filterStatus;
    return matchesType && matchesStatus;
  });

  const getTypeIcon = (type: ApprovalType) => {
    switch (type) {
      case 'cash_collection':
        return <Wallet className="w-4 h-4 text-emerald-400" />;
      case 'invoice_void':
        return <Receipt className="w-4 h-4 text-rose-400" />;
      case 'large_discount':
        return <Tag className="w-4 h-4 text-amber-400" />;
      default:
        return <AlertTriangle className="w-4 h-4 text-blue-400" />;
    }
  };

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto pb-24 md:pb-8">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
            <ShieldAlert className="w-6 h-6 text-amber-400" />
            <span>Dual-Control Owner Approval Center</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Sensitive financial and operational activities requiring direct Owner sign-off before committing.
          </p>
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-2 bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs">
          <button
            onClick={() => setFilterStatus('pending')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition ${
              filterStatus === 'pending' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            Pending ({approvalRequests.filter(r => r.status === 'pending').length})
          </button>
          <button
            onClick={() => setFilterStatus('approved')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition ${
              filterStatus === 'approved' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            Approved
          </button>
          <button
            onClick={() => setFilterStatus('rejected')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition ${
              filterStatus === 'rejected' ? 'bg-rose-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            Rejected
          </button>
          <button
            onClick={() => setFilterStatus('all')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition ${
              filterStatus === 'all' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            All
          </button>
        </div>
      </div>

      {/* Requests Stream */}
      {filteredRequests.length === 0 ? (
        <div className="p-12 text-center bg-slate-900 border border-dashed border-slate-800 rounded-2xl text-slate-400 text-xs">
          No approval requests matching this criteria.
        </div>
      ) : (
        <div className="space-y-4">
          {filteredRequests.map(req => (
            <div
              key={req.id}
              className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-md flex items-center justify-between flex-wrap gap-4 hover:border-slate-700 transition"
            >
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center shrink-0">
                  {getTypeIcon(req.request_type)}
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white uppercase tracking-wider">
                      {req.request_type.replace('_', ' ')}
                    </span>
                    <span className="text-[11px] text-slate-400 font-mono">
                      • {new Date(req.created_at).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                    </span>
                  </div>
                  <div className="text-sm font-semibold text-slate-200">
                    {req.reason}
                  </div>
                  <div className="text-xs text-slate-400">
                    Requested by <span className="text-slate-300 font-semibold">{req.requested_by_name}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons or Status Badge */}
              <div className="flex items-center gap-3">
                {req.status === 'pending' ? (
                  <>
                    <button
                      onClick={() => rejectRequest(req.id, 'Declined by Club Owner.')}
                      className="px-4 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-bold transition flex items-center gap-1.5"
                    >
                      <XCircle className="w-4 h-4" />
                      <span>Reject</span>
                    </button>
                    <button
                      onClick={() => approveRequest(req.id)}
                      className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-950/40 transition flex items-center gap-1.5"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Authorize & Sign-off</span>
                    </button>
                  </>
                ) : (
                  <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                    req.status === 'approved'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                  }`}>
                    {req.status}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
