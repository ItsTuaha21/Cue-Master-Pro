import React, { useState } from 'react';
import { PhysicalTable } from '../../types';
import { useApp } from '../../context/AppContext';
import { X, PlayCircle, Users, Plus, Trash2, Clock, Trophy } from 'lucide-react';

interface OpenTableModalProps {
  table: PhysicalTable;
  onClose: () => void;
}

export const OpenTableModal: React.FC<OpenTableModalProps> = ({ table, onClose }) => {
  const { rates, members, openTable, settings } = useApp();
  const [selectedRateId, setSelectedRateId] = useState<string>(rates[0]?.id || '');
  const [players, setPlayers] = useState<string[]>(['Player 1', 'Player 2']);
  const [viewers, setViewers] = useState<string[]>([]);
  const [newPlayerInput, setNewPlayerInput] = useState('');
  const [newViewerInput, setNewViewerInput] = useState('');

  const handleAddPlayer = () => {
    if (!newPlayerInput.trim()) return;
    setPlayers(prev => [...prev, newPlayerInput.trim()]);
    setNewPlayerInput('');
  };

  const handleRemovePlayer = (idx: number) => {
    if (players.length <= 1) return;
    setPlayers(prev => prev.filter((_, i) => i !== idx));
  };

  const handleAddViewer = () => {
    if (!newViewerInput.trim()) return;
    setViewers(prev => [...prev, newViewerInput.trim()]);
    setNewViewerInput('');
  };

  const handleRemoveViewer = (idx: number) => {
    setViewers(prev => prev.filter((_, i) => i !== idx));
  };

  const handleStartSession = (e: React.FormEvent) => {
    e.preventDefault();
    if (players.length === 0) return;
    openTable(table.id, selectedRateId, players, viewers);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-slate-800/90 border-b border-slate-700 px-6 py-4 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-white tracking-tight">Open {table.table_number}</h3>
            <p className="text-xs text-slate-400">{table.name} ({table.table_type})</p>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700 transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleStartSession} className="p-6 space-y-5">
          {/* Rate Selection */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
              Select Pricing Rate
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {rates.map(rate => (
                <button
                  key={rate.id}
                  type="button"
                  onClick={() => setSelectedRateId(rate.id)}
                  className={`p-3 rounded-xl border text-left transition ${
                    selectedRateId === rate.id
                      ? 'bg-emerald-600/20 border-emerald-500 text-white font-semibold'
                      : 'bg-slate-950/50 border-slate-800 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <div className="text-xs font-bold">{rate.name}</div>
                  <div className="text-[11px] text-emerald-400 mt-1">
                    {settings.currency_symbol} {rate.base_rate} {rate.rate_type === 'hourly' ? '/ hr' : '/ frame'}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Players Roster */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
                Playing Patrons ({players.length})
              </label>
              <span className="text-[11px] text-slate-400">Min. 1 player</span>
            </div>

            <div className="space-y-1.5 mb-2 max-h-36 overflow-y-auto">
              {players.map((player, idx) => (
                <div key={idx} className="flex items-center justify-between p-2 rounded-lg bg-slate-950/60 border border-slate-800 text-xs">
                  <span className="font-semibold text-white">{player}</span>
                  {players.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemovePlayer(idx)}
                      className="text-slate-400 hover:text-rose-400"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Enter player name..."
                value={newPlayerInput}
                onChange={e => setNewPlayerInput(e.target.value)}
                className="flex-1 bg-slate-950 border border-slate-800 text-white text-xs rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddPlayer();
                  }
                }}
              />
              <button
                type="button"
                onClick={handleAddPlayer}
                className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                Add
              </button>
            </div>
          </div>

          {/* Viewers (Optional) */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
              Viewers (Non-playing visitors)
            </label>
            {viewers.length > 0 && (
              <div className="space-y-1.5 mb-2 max-h-24 overflow-y-auto">
                {viewers.map((viewer, idx) => (
                  <div key={idx} className="flex items-center justify-between p-2 rounded-lg bg-slate-950/40 border border-slate-800 text-xs text-slate-300">
                    <span>{viewer}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveViewer(idx)}
                      className="text-slate-400 hover:text-rose-400"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Viewer name (e.g. Usman)..."
                value={newViewerInput}
                onChange={e => setNewViewerInput(e.target.value)}
                className="flex-1 bg-slate-950 border border-slate-800 text-white text-xs rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddViewer();
                  }
                }}
              />
              <button
                type="button"
                onClick={handleAddViewer}
                className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Viewer
              </button>
            </div>
          </div>

          {/* Submit */}
          <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-6 py-2.5 rounded-xl text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-emerald-950/40 transition"
            >
              <PlayCircle className="w-4 h-4" />
              <span>Start Table Match</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
