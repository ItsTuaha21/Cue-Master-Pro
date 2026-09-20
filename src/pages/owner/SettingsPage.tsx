import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Settings,
  Save,
  CheckCircle2,
  Building,
  DollarSign,
  Clock,
  Shield
} from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const { settings, updateSettings, rates } = useApp();

  const [clubName, setClubName] = useState(settings.club_name);
  const [currencySymbol, setCurrencySymbol] = useState(settings.currency_symbol);
  const [currencyCode, setCurrencyCode] = useState(settings.currency);
  const [gracePeriod, setGracePeriod] = useState(settings.grace_period_minutes);
  const [discountThreshold, setDiscountThreshold] = useState(settings.discount_approval_threshold);

  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings({
      club_name: clubName,
      currency_symbol: currencySymbol,
      currency: currencyCode,
      grace_period_minutes: gracePeriod,
      discount_approval_threshold: discountThreshold,
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-4xl mx-auto pb-24 md:pb-8">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
          <Settings className="w-6 h-6 text-slate-400" />
          <span>Club Configuration & Master Rules</span>
        </h1>
        <p className="text-xs text-slate-400 mt-0.5">
          Configure business name, currency symbols, billing grace periods, and owner authorization thresholds.
        </p>
      </div>

      <form onSubmit={handleSave} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
        {/* Section 1: Business Identity */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-2">
            <Building className="w-4 h-4 text-emerald-400" />
            <span>Club Identity & Localization</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-300 mb-1">Club / Venue Name</label>
              <input
                type="text"
                value={clubName}
                onChange={e => setClubName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 text-white text-xs rounded-xl p-2.5"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Currency Code & Symbol</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={currencyCode}
                  onChange={e => setCurrencyCode(e.target.value)}
                  className="w-1/2 bg-slate-950 border border-slate-700 text-white font-mono text-xs rounded-xl p-2.5"
                  placeholder="PKR"
                />
                <input
                  type="text"
                  value={currencySymbol}
                  onChange={e => setCurrencySymbol(e.target.value)}
                  className="w-1/2 bg-slate-950 border border-slate-700 text-white font-mono text-xs rounded-xl p-2.5"
                  placeholder="Rs"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Floor Match Parameters */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-2">
            <Clock className="w-4 h-4 text-amber-400" />
            <span>Table Session & Billing Rules</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Post-Game Grace Period (Minutes)
              </label>
              <input
                type="number"
                min="0"
                max="30"
                value={gracePeriod}
                onChange={e => setGracePeriod(parseInt(e.target.value) || 0)}
                className="w-full bg-slate-950 border border-slate-700 text-white font-mono text-xs rounded-xl p-2.5"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                Minutes allowed before charging the next full time block.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Max Employee Discount without Owner Approval (%)
              </label>
              <input
                type="number"
                min="0"
                max="100"
                value={discountThreshold}
                onChange={e => setDiscountThreshold(parseInt(e.target.value) || 0)}
                className="w-full bg-slate-950 border border-slate-700 text-white font-mono text-xs rounded-xl p-2.5"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                Any higher discount triggers mandatory Owner sign-off.
              </p>
            </div>
          </div>
        </div>

        {/* Active Rates Overview */}
        <div className="space-y-2">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Configured Rate Cards</h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {rates.map(r => (
              <div key={r.id} className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-xs">
                <div className="font-bold text-white">{r.name}</div>
                <div className="text-emerald-400 font-mono mt-0.5">
                  {settings.currency_symbol} {r.base_rate} ({r.rate_type})
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Save button */}
        <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
          {savedSuccess ? (
            <span className="flex items-center gap-1.5 text-xs text-emerald-400 font-semibold">
              <CheckCircle2 className="w-4 h-4" />
              Settings updated successfully!
            </span>
          ) : (
            <span />
          )}

          <button
            type="submit"
            className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-6 py-2.5 rounded-xl text-xs flex items-center gap-2 shadow-md transition"
          >
            <Save className="w-4 h-4" />
            <span>Save Configuration</span>
          </button>
        </div>
      </form>
    </div>
  );
};
