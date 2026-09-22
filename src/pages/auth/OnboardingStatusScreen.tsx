import React from 'react';
import { OnboardingStatus, WorkspaceTenant, UserProfile } from '../../types';
import {
  Clock,
  AlertOctagon,
  CreditCard,
  Ban,
  CheckCircle,
  ShieldAlert,
  LogOut,
  RefreshCw,
  Mail,
  Building2,
  Lock
} from 'lucide-react';

interface Props {
  status: OnboardingStatus;
  workspace: WorkspaceTenant | null;
  user: UserProfile | null;
  onRefresh: () => void;
  onLogout: () => void;
}

export const OnboardingStatusScreen: React.FC<Props> = ({
  status,
  workspace,
  user,
  onRefresh,
  onLogout,
}) => {
  const getStatusConfig = () => {
    switch (status) {
      case 'pending_review':
        return {
          icon: Clock,
          iconColor: 'text-amber-400',
          badgeBg: 'bg-amber-500/20 border-amber-500/30 text-amber-300',
          title: 'Club Application Under Review',
          subtitle: 'Our club governance team is currently reviewing your registration.',
          description:
            'All newly registered billiard and snooker venues undergo operational verification before the floor terminal and POS workspace can be unlocked. Verification typically concludes within 24 business hours.',
          actionHint: 'Once approved, you will be notified via email to initialize your subscription.',
        };
      case 'approved':
      case 'payment_pending':
        return {
          icon: CreditCard,
          iconColor: 'text-sky-400',
          badgeBg: 'bg-sky-500/20 border-sky-500/30 text-sky-300',
          title: 'Application Approved — Subscription Pending',
          subtitle: 'Your club venue has been authorized. Terminal subscription required.',
          description:
            'Your workspace registration has successfully passed review. Commercial billing and payment activation will be initiated by the platform administrator for this workspace.',
          actionHint: 'Workspace operational floor access is unlocked upon subscription initialization.',
        };
      case 'expired':
        return {
          icon: AlertOctagon,
          iconColor: 'text-rose-400',
          badgeBg: 'bg-rose-500/20 border-rose-500/30 text-rose-300',
          title: 'Workspace Subscription Expired',
          subtitle: 'Terminal operations and floor timer access have been paused.',
          description:
            'Your club active billing term has expired. All historical ledger data, memberships, and session records remain fully preserved and secured in vault custody.',
          actionHint: 'Please renew your workspace subscription to restore floor operations.',
        };
      case 'suspended':
        return {
          icon: Ban,
          iconColor: 'text-rose-400',
          badgeBg: 'bg-rose-500/20 border-rose-500/30 text-rose-300',
          title: 'Workspace Suspended',
          subtitle: 'Access to this club workspace has been temporarily restricted.',
          description:
            'This workspace was suspended by platform administrators due to an administrative hold or policy review.',
          actionHint: 'Contact CueDesk Support (support@cuedesk.club) for dispute resolution.',
        };
      case 'rejected':
        return {
          icon: ShieldAlert,
          iconColor: 'text-slate-400',
          badgeBg: 'bg-rose-500/20 border-rose-500/30 text-rose-300',
          title: 'Club Registration Declined',
          subtitle: 'Your venue onboarding could not be verified.',
          description:
            'The information supplied during onboarding could not satisfy commercial verification standards.',
          actionHint: 'You may register with updated commercial credentials or contact support.',
        };
      default:
        return {
          icon: Lock,
          iconColor: 'text-slate-400',
          badgeBg: 'bg-slate-800 text-slate-300',
          title: 'Workspace Access Restricted',
          subtitle: 'Status not permitted for active floor operations.',
          description: 'Access to this workspace is currently restricted.',
          actionHint: 'Please check your account status or contact support.',
        };
    }
  };

  const config = getStatusConfig();
  const Icon = config.icon;

  return (
    <div className="min-h-screen bg-[#060908] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Ambient Glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-emerald-950/20 rounded-full blur-3xl pointer-events-none" />

      <div className="relative w-full max-w-lg bg-[#0e1612] border border-emerald-900/40 rounded-3xl p-7 sm:p-9 shadow-2xl shadow-black/90 space-y-6 backdrop-blur-xl">
        {/* Brand Header */}
        <div className="flex items-center justify-between pb-4 border-b border-emerald-950">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-black text-xs">
              8
            </div>
            <div>
              <div className="text-base font-black text-white tracking-tight flex items-center gap-1">
                Cue<span className="text-emerald-400">Desk</span>
              </div>
              <div className="text-[10px] text-slate-400">Tenancy Governance Gateway</div>
            </div>
          </div>

          <span className={`text-[11px] px-3 py-1 rounded-full font-bold uppercase border ${config.badgeBg}`}>
            {status.replace('_', ' ')}
          </span>
        </div>

        {/* Status Callout Card */}
        <div className="text-center space-y-3 pt-2">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#080d0a] border border-emerald-950 shadow-inner">
            <Icon className={`w-7 h-7 ${config.iconColor}`} />
          </div>
          <h2 className="text-xl font-black text-white tracking-tight">{config.title}</h2>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">{config.subtitle}</p>
        </div>

        {/* Club Details Box */}
        {workspace && (
          <div className="p-4 rounded-2xl bg-[#080d0a] border border-emerald-950 space-y-2.5 text-xs">
            <div className="flex items-center justify-between text-slate-400">
              <span className="flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-emerald-500" />
                <span>Club Venue:</span>
              </span>
              <span className="font-bold text-white">{workspace.name}</span>
            </div>

            <div className="flex items-center justify-between text-slate-400">
              <span>Workspace / Club Code:</span>
              <span className="font-mono font-bold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/40">
                {workspace.workspace_code}
              </span>
            </div>

            {user && (
              <div className="flex items-center justify-between text-slate-400">
                <span>Account Holder:</span>
                <span className="text-slate-200">{user.full_name} ({user.email})</span>
              </div>
            )}
          </div>
        )}

        {/* Narrative Description */}
        <div className="p-4 rounded-xl bg-slate-950/40 border border-slate-800/80 text-xs text-slate-300 leading-relaxed space-y-2">
          <p>{config.description}</p>
          <p className="text-amber-300/80 font-medium text-[11px]">{config.actionHint}</p>
        </div>

        {/* Controls */}
        <div className="pt-2 flex items-center justify-between gap-3 border-t border-emerald-950">
          <button
            onClick={onLogout}
            className="px-4 py-2.5 bg-[#121d17] hover:bg-[#182820] text-slate-300 hover:text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 border border-emerald-900/30 transition cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>

          <button
            onClick={onRefresh}
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md shadow-emerald-950/60 transition cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Check Status</span>
          </button>
        </div>
      </div>
    </div>
  );
};
