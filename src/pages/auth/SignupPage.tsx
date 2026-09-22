import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Building2,
  User,
  Phone,
  Mail,
  Lock,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  ChevronLeft
} from 'lucide-react';

export const SignupPage: React.FC = () => {
  const { signup, setActiveView } = useApp();

  const [clubName, setClubName] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match.');
      return;
    }

    if (password.length < 8) {
      setErrorMessage('Password must be at least 8 characters long.');
      return;
    }

    setIsSubmitting(true);
    const result = await signup({
      club_name: clubName,
      owner_name: ownerName,
      phone,
      email,
      password,
      confirm_password: confirmPassword,
    });

    setIsSubmitting(false);

    if (!result.success) {
      setErrorMessage(result.message || 'Registration failed. Please check details.');
    }
    // If successful, AppContext updates authentication & onboardingStatus automatically!
  };

  return (
    <div className="min-h-screen bg-[#060908] flex items-center justify-center p-4 relative overflow-hidden py-12">
      {/* Ambient Luxury Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[580px] h-[580px] bg-emerald-950/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-80 h-80 bg-amber-600/5 rounded-full blur-3xl pointer-events-none" />

      <div className="relative w-full max-w-lg bg-[#0e1612] border border-emerald-900/40 rounded-3xl p-7 sm:p-9 shadow-2xl shadow-black/90 space-y-6 backdrop-blur-xl">
        {/* Navigation back to Sign In */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => setActiveView('login')}
            className="text-xs text-slate-400 hover:text-emerald-300 flex items-center gap-1 font-semibold transition cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Back to Sign In</span>
          </button>
          <span className="text-[10px] font-mono text-emerald-400 font-bold bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800/40 uppercase">
            Club Onboarding
          </span>
        </div>

        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-600/30 to-emerald-950/80 border border-emerald-500/30 text-emerald-400 shadow-lg shadow-emerald-950/60 mb-1">
            <span className="w-5 h-5 rounded-full bg-emerald-500/20 border border-emerald-400 flex items-center justify-center text-[10px] font-black text-emerald-300">
              8
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center justify-center gap-1.5">
            Register Club with Cue<span className="text-emerald-400">Desk</span>
          </h1>
          <p className="text-xs text-slate-400 font-medium">
            Commercial snooker & billiards club workspace provisioning
          </p>
        </div>

        {/* Error Callout */}
        {errorMessage && (
          <div className="p-3.5 rounded-xl bg-rose-950/80 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2.5 shadow-lg">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span className="font-semibold">{errorMessage}</span>
          </div>
        )}

        {/* Onboarding Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Club Name */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Club / Venue Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                  <Building2 className="w-3.5 h-3.5 text-emerald-500/70" />
                </div>
                <input
                  type="text"
                  required
                  placeholder="e.g. Royal Cue Lounge"
                  value={clubName}
                  onChange={e => setClubName(e.target.value)}
                  className="w-full bg-[#080d0a] border border-emerald-950 focus:border-emerald-500/60 text-white text-xs rounded-xl pl-9 pr-3 py-2.5 transition focus:outline-none focus:ring-1 focus:ring-emerald-500/40"
                />
              </div>
            </div>

            {/* Owner Full Name */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Owner Full Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                  <User className="w-3.5 h-3.5 text-emerald-500/70" />
                </div>
                <input
                  type="text"
                  required
                  placeholder="e.g. Malik Taha"
                  value={ownerName}
                  onChange={e => setOwnerName(e.target.value)}
                  className="w-full bg-[#080d0a] border border-emerald-950 focus:border-emerald-500/60 text-white text-xs rounded-xl pl-9 pr-3 py-2.5 transition focus:outline-none focus:ring-1 focus:ring-emerald-500/40"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Mobile / Phone */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Mobile / Phone
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                  <Phone className="w-3.5 h-3.5 text-emerald-500/70" />
                </div>
                <input
                  type="tel"
                  required
                  placeholder="e.g. +92 300 1234567"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  className="w-full bg-[#080d0a] border border-emerald-950 focus:border-emerald-500/60 text-white text-xs rounded-xl pl-9 pr-3 py-2.5 transition focus:outline-none focus:ring-1 focus:ring-emerald-500/40 font-mono"
                />
              </div>
            </div>

            {/* Email Address */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                  <Mail className="w-3.5 h-3.5 text-emerald-500/70" />
                </div>
                <input
                  type="email"
                  required
                  placeholder="owner@cuedesk.club"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full bg-[#080d0a] border border-emerald-950 focus:border-emerald-500/60 text-white text-xs rounded-xl pl-9 pr-3 py-2.5 transition focus:outline-none focus:ring-1 focus:ring-emerald-500/40"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Password */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                  <Lock className="w-3.5 h-3.5 text-emerald-500/70" />
                </div>
                <input
                  type="password"
                  required
                  placeholder="Min 8 characters"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full bg-[#080d0a] border border-emerald-950 focus:border-emerald-500/60 text-white text-xs rounded-xl pl-9 pr-3 py-2.5 transition focus:outline-none focus:ring-1 focus:ring-emerald-500/40 font-mono"
                />
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Confirm Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                  <Lock className="w-3.5 h-3.5 text-emerald-500/70" />
                </div>
                <input
                  type="password"
                  required
                  placeholder="Repeat password"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  className="w-full bg-[#080d0a] border border-emerald-950 focus:border-emerald-500/60 text-white text-xs rounded-xl pl-9 pr-3 py-2.5 transition focus:outline-none focus:ring-1 focus:ring-emerald-500/40 font-mono"
                />
              </div>
            </div>
          </div>

          {/* Verification Notice */}
          <div className="p-3 rounded-xl bg-[#080d0a] border border-emerald-950 text-[11px] text-slate-400 space-y-1">
            <div className="flex items-center gap-1.5 text-emerald-400 font-semibold">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>SaaS Tenancy Notice</span>
            </div>
            <p>
              Newly registered clubs generate a unique Workspace Code and enter the <strong className="text-amber-300">pending_review</strong> onboarding status before live floor timers and POS billing can be initiated.
            </p>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full mt-2 py-3.5 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-bold text-xs sm:text-sm rounded-xl shadow-lg shadow-emerald-950/60 transition active:scale-[0.99] flex items-center justify-center gap-2 border border-emerald-400/20 disabled:opacity-50 cursor-pointer"
          >
            <span>{isSubmitting ? 'Registering Workspace...' : 'Submit Club Registration'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Existing account footer */}
        <div className="text-center pt-2 border-t border-emerald-950">
          <p className="text-xs text-slate-400">
            Already have a registered club workspace?{' '}
            <button
              onClick={() => setActiveView('login')}
              className="text-emerald-400 hover:text-emerald-300 font-bold transition cursor-pointer"
            >
              Sign In with Workspace Code
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};
