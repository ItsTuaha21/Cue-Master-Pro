import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Shield,
  Search,
  History,
  Lock,
  Filter,
  User,
  Clock
} from 'lucide-react';

export const AuditLogsPage: React.FC = () => {
  const { auditLogs } = useApp();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredLogs = auditLogs.filter(log =>
    log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
    log.actor_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    log.details.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto pb-24 md:pb-8">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
            <Shield className="w-6 h-6 text-emerald-400" />
            <span>Immutable Security & Operational Audit Trail</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Non-destructive audit records of all table closures, inventory shifts, approvals, and cash drawer handovers.
          </p>
        </div>

        {/* Search */}
        <div className="relative max-w-xs w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Filter audit logs..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 text-white text-xs rounded-xl pl-8 pr-3 py-2"
          />
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="border border-slate-800 rounded-2xl overflow-hidden bg-slate-900 shadow-md">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-800/80 text-slate-400 font-semibold border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">Action Event</th>
                <th className="py-3 px-4">Entity</th>
                <th className="py-3 px-4">Actor (Staff)</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4">Operational Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {filteredLogs.map(log => (
                <tr key={log.id} className="hover:bg-slate-850/50 transition font-sans">
                  <td className="py-3 px-4 text-slate-400 font-mono text-[11px]">
                    {new Date(log.created_at).toLocaleString([], { dateStyle: 'short', timeStyle: 'medium' })}
                  </td>
                  <td className="py-3 px-4 font-bold text-white">
                    <span className="px-2 py-0.5 rounded bg-slate-800 text-emerald-300 text-[11px] font-semibold border border-slate-700">
                      {log.action}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-400 text-xs font-mono">{log.entity_name}</td>
                  <td className="py-3 px-4 text-slate-200 font-semibold">{log.actor_name}</td>
                  <td className="py-3 px-4">
                    <span className={`text-[10px] px-2 py-0.5 rounded uppercase font-bold ${
                      log.actor_role === 'owner' ? 'bg-amber-500/20 text-amber-300' : 'bg-blue-500/20 text-blue-300'
                    }`}>
                      {log.actor_role}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-300 text-xs">{log.details}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
