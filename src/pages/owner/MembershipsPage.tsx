import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  IdCard,
  Plus,
  Search,
  CheckCircle2,
  Calendar,
  Phone,
  Percent,
  Star,
  UserCheck,
  X
} from 'lucide-react';

export const MembershipsPage: React.FC = () => {
  const { members, membershipPlans, settings, addMember } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [successBanner, setSuccessBanner] = useState<string | null>(null);

  // New member form
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [selectedPlanId, setSelectedPlanId] = useState(membershipPlans[0]?.id || '');

  const filteredMembers = members.filter(m =>
    m.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.membership_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.phone.includes(searchQuery)
  );

  const handleAddMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !phone.trim()) return;

    const plan = membershipPlans.find(p => p.id === selectedPlanId);
    addMember({
      club_id: 'club-main',
      full_name: fullName.trim(),
      phone: phone.trim(),
      email: email.trim(),
      plan_name: plan?.name || 'Gold VIP',
      discount_percentage: plan?.table_discount_percentage || 15,
      start_date: new Date().toISOString().slice(0, 10),
      expiry_date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
      is_active: true,
    });

    setIsModalOpen(false);
    setFullName('');
    setPhone('');
    setEmail('');
    setSuccessBanner('Member successfully registered in CueDesk registry.');
    setTimeout(() => setSuccessBanner(null), 4000);
  };

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto pb-24 md:pb-8">
      {/* Success Notification Banner */}
      {successBanner && (
        <div className="p-3.5 rounded-xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-xs flex items-center justify-between shadow-lg">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span className="font-semibold">{successBanner}</span>
          </div>
          <button onClick={() => setSuccessBanner(null)} className="text-emerald-400 hover:text-white cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
            <IdCard className="w-6 h-6 text-amber-400" />
            <span>Memberships & Player Loyalty</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            VIP club tiers, discount privileges, player directory, and CueDesk loyalty cards.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-bold text-xs px-4 py-2.5 rounded-xl flex items-center gap-1.5 shadow-md shadow-amber-950/40 transition cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Register New Member</span>
        </button>
      </div>

      {/* Plans Tier Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {membershipPlans.map(plan => (
          <div key={plan.id} className="p-5 rounded-2xl bg-[#0e1612] border border-emerald-900/30 flex flex-col justify-between shadow-xl shadow-black/40">
            <div>
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-white text-base flex items-center gap-1.5">
                  <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                  <span>{plan.name}</span>
                </h3>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-500/30 font-semibold font-mono">
                  {plan.table_discount_percentage}% OFF
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">Café discount: {plan.fnb_discount_percentage}% off</p>
            </div>
            <div className="mt-4 pt-3 border-t border-emerald-950 flex items-center justify-between">
              <span className="text-xs text-slate-400">{plan.duration_days} Days validity</span>
              <span className="text-sm font-bold text-amber-400 font-mono">
                {settings.currency_symbol} {plan.price.toLocaleString()}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="Search members by name, card #, or mobile..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className="w-full bg-[#0e1612] border border-emerald-900/30 text-white text-xs rounded-xl pl-9 pr-4 py-2.5 focus:outline-none focus:ring-1 focus:ring-amber-500"
        />
      </div>

      {/* Members Table */}
      <div className="border border-emerald-900/30 rounded-2xl overflow-hidden bg-[#0e1612] shadow-xl shadow-black/40">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#080d0a] text-slate-400 font-semibold border-b border-emerald-950">
              <tr>
                <th className="py-3 px-4">Member #</th>
                <th className="py-3 px-4">Player Name</th>
                <th className="py-3 px-4">Mobile Number</th>
                <th className="py-3 px-4">Membership Tier</th>
                <th className="py-3 px-4 text-right">Discount</th>
                <th className="py-3 px-4 text-right">Expiry Date</th>
                <th className="py-3 px-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-emerald-950/60">
              {filteredMembers.map(m => (
                <tr key={m.id} className="hover:bg-[#121c17]/50 transition">
                  <td className="py-3 px-4 font-mono font-bold text-amber-300">{m.membership_number}</td>
                  <td className="py-3 px-4 font-bold text-white">
                    <div>{m.full_name}</div>
                    {m.email && <div className="text-[10px] text-slate-500 font-normal">{m.email}</div>}
                  </td>
                  <td className="py-3 px-4 text-slate-300 font-mono">{m.phone}</td>
                  <td className="py-3 px-4 font-semibold text-slate-200">{m.plan_name}</td>
                  <td className="py-3 px-4 text-right font-mono font-bold text-emerald-400">
                    {m.discount_percentage}%
                  </td>
                  <td className="py-3 px-4 text-right font-mono text-slate-300">
                    {m.expiry_date}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                      m.is_active ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-slate-800 text-slate-400'
                    }`}>
                      {m.is_active ? 'Active' : 'Expired'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* REGISTER MEMBER MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="relative w-full max-w-md bg-[#0e1612] border border-emerald-900/40 rounded-2xl p-6 space-y-4 shadow-2xl shadow-black/80">
            <div className="flex items-center justify-between border-b border-emerald-950 pb-3">
              <h3 className="text-base font-bold text-white">Register Club Member</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddMember} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Daniyal Sheikh"
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  className="w-full bg-[#080d0a] border border-emerald-900/40 text-white text-xs rounded-xl p-2.5 focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Mobile Number</label>
                <input
                  type="tel"
                  required
                  placeholder="e.g. +92 300 1234567"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  className="w-full bg-[#080d0a] border border-emerald-900/40 text-white text-xs rounded-xl p-2.5 focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Email (Optional)</label>
                <input
                  type="email"
                  placeholder="e.g. player@cuedesk.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full bg-[#080d0a] border border-emerald-900/40 text-white text-xs rounded-xl p-2.5 focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Membership Tier</label>
                <select
                  value={selectedPlanId}
                  onChange={e => setSelectedPlanId(e.target.value)}
                  className="w-full bg-[#080d0a] border border-emerald-900/40 text-white text-xs rounded-xl p-2.5 focus:outline-none focus:ring-1 focus:ring-amber-500"
                >
                  {membershipPlans.map(plan => (
                    <option key={plan.id} value={plan.id}>
                      {plan.name} ({plan.table_discount_percentage}% discount)
                    </option>
                  ))}
                </select>
              </div>

              <div className="pt-3 border-t border-emerald-950 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-bold px-5 py-2.5 rounded-xl text-xs shadow-md shadow-amber-950/40 transition cursor-pointer"
                >
                  Complete Registration
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
