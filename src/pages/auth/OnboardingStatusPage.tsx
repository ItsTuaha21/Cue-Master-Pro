import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Clock,
  CreditCard,
  Ban,
  AlertOctagon,
  XCircle,
  ShieldAlert,
  ArrowRight,
  LogOut,
  RefreshCw
} from 'lucide-react';
import { OnboardingStatus } from '../../types';

export const OnboardingStatusPage: React.FC = () => {
  const { currentWorkspace, currentUser, logout, refreshAuth } = useApp();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const status: OnboardingStatus = currentWorkspace?.onboarding_status || 'pending_review';

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refreshAuth();
    setIsRefreshing(false);
  };

  const getStatusConfig = () => {
    switch (status) {
      case 'pending_review':
        return {
          title: 'Club Application Pending Review',
          badge: 'Status: Pending Verification',
          badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
          icon: <Clock className="w-8 h-8 text-amber-400 animate-pulse" />,
          description:
            'Your club registration has been safely received. A CueDesk operations specialist is reviewing your club details and workspace assignment. You will receive activation clearance shortly.',
          actionHint: 'Normal table floor operations and POS billing are paused until review is completed.',
        };
      case 'approved':
      case 'payment_pending':
        return {
          title: 'Subscription Payment Required',
          badge: 'Status: Payment Pending',
          badgeColor: 'bg-sky-500/20 text-sky-300 border-sky-500/30',
          icon: <CreditCard className="w-8 h-8 text-sky-400" />,
          description:
            'Your club application has been verified. To unlock the active commercial floor grid and staff terminal, complete your subscription setup.',
          actionHint: 'Billing and merchant gateway integration is being provisioned.',
        };
      case 'expired':
        return {
          title: 'Workspace Subscription Expired',
          badge: 'Status: Subscription Lapsed',
          badgeColor: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
          icon: <AlertOctagon className="w-8 h-8 text-rose-400" />,
          description:
            'This workspace billing cycle has concluded. Floor sessions, table timers, and staff checkouts are locked to protect data integrity.',
          actionHint: 'Contact your club account manager to renew active service.',
        };
      case 'suspended':
        return {
          title: 'Club Workspace Suspended',
          badge: 'Status: Suspended',
          badgeColor: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
          icon: <Ban className="w-8 h-8 text-rose-400" />,
          description:
            'Access to this workspace has been temporarily suspended by system governance. Club operators are prohibited from conducting table billing.',
          actionHint: 'Please contact CueDesk compliance support.',
        };
      case 'rejected':
        return {
          title: 'Application Rejected',
          badge: 'Status: Rejected',
          badgeColor: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
          icon: <XCircle className="w-8 h-8 text-rose-400" />,
          description:
            'Your club registration could not be verified according to commercial licensing standards.',
          actionHint: 'Review your submission details or submit a fresh registration with valid licensing.',
        };
      default:
        return {
          title: 'Workspace Access Restricted',
          badge: `Status: ${status}`,
          badgeColor: 'bg-slate-800 text-slate-300 border-slate-700',
          icon: <ShieldAlert className="w-8 h-8 text-amber-400" />,
          description: 'Access to this workspace is currently restricted by administration.',
          actionHint: 'Please contact club management.',
        };
    }
  };

  const config = getStatusConfig();

  return (
    <div className="min-h-screen bg-[#060908] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-emerald-950/20 rounded-full blur-3xl pointer-events-none" />

      <div className="relative w-full max-w-lg bg-[#0e1612] border border-emerald-900/40 rounded-3xl p-7 sm:p-9 shadow-2xl shadow-black/90 space-y-6 backdrop-blur-xl">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="w-16 h-16 rounded-2xl bg-[#080d0a] border border-emerald-950 mx-auto flex items-center justify-center shadow-lg">
            {config.icon}
          </div>

          <div>
            <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border mb-2 ${config.badgeColor}`}>
              {config.badge}
            </span>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              {config.title}
            </h1>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              {config.description}
            </p>
          </div>
        </div>

        {/* Tenant Information Card */}
        <div className="p-4 rounded-2xl bg-[#080d0a] border border-emerald-950 space-y-2 text-xs">
          <div className="flex justify-between items-center py-1 border-b border-emerald-950/60">
            <span className="text-slate-400">Club Workspace:</span>
            <span className="font-bold text-white">{currentWorkspace?.name || 'Snooker Club'}</span>
          </div>
          <div className="flex justify-between items-center py-1 border-b border-emerald-950/60 font-mono">
            <span className="text-slate-400">Workspace Code:</span>
            <span className="font-bold text-emerald-400">{currentWorkspace?.workspace_code || '—'}</span>
          </div>
          <div className="flex justify-between items-center py-1 border-b border-emerald-950/60">
            <span className="text-slate-400">Signed In As:</span>
            <span className="font-medium text-slate-200">{currentUser?.full_name} ({currentUser?.role})</span>
          </div>
          <div className="flex justify-between items-center py-1">
            <span className="text-slate-400">Policy:</span>
            <span className="text-amber-400 font-semibold">{config.actionHint}</span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-3 pt-2">
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="flex-1 py-3 bg-[#121d17] hover:bg-[#182820] text-emerald-300 border border-emerald-800/40 font-semibold text-xs rounded-xl flex items-center justify-center gap-2 transition cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>{isRefreshing ? 'Checking...' : 'Check Approval Status'}</span>
          </button>

          <button
            onClick={logout}
            className="py-3 px-4 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 font-semibold text-xs rounded-xl flex items-center justify-center gap-1.5 transition cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </div>
  );
};
