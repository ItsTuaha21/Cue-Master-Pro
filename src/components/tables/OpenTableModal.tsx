import React, { useState } from 'react';
import { PhysicalTable, MatchType, MATCH_TYPE_LABELS } from '../../types';
import { useApp } from '../../context/AppContext';
import { X, PlayCircle, Users, Plus, Trash2, Trophy, Swords } from 'lucide-react';

interface OpenTableModalProps {
  table: PhysicalTable;
  onClose: () => void;
}

export const OpenTableModal: React.FC<OpenTableModalProps> = ({ table, onClose }) => {
  const { rates, openTable, settings } = useApp();
  const [selectedRateId, setSelectedRateId] = useState<string>(rates[0]?.id || '');
  const [matchType, setMatchType] = useState<MatchType>('1v1');
  const [players, setPlayers] = useState<string[]>(['Player 1', 'Player 2']);
  const [viewers, setViewers] = useState<string[]>([]);
  const [newPlayerInput, setNewPlayerInput] = useState('');
  const [newViewerInput, setNewViewerInput] = useState('');

  const handleSelectMatchType = (type: MatchType) => {
    setMatchType(type);
    if (type === '1v1') {
      setPlayers(['Player 1', 'Player 2']);
    } else if (type === '3_rotation') {
      setPlayers(['Player 1', 'Player 2', 'Player 3']);
    } else if (type === '4_rotation') {
      setPlayers(['Player 1', 'Player 2', 'Player 3', 'Player 4']);
    } else if (type === '2v2_team') {
      setPlayers(['Team A - P1', 'Team A - P2', 'Team B - P1', 'Team B - P2']);
    }
  };

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <div className="relative w-full max-w-lg bg-[#0e1612] border border-emerald-900/40 rounded-2xl shadow-2xl overflow-hidden shadow-black/80">
        {/* Header */}
        <div className="bg-[#090f0c] border-b border-emerald-900/30 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="w-8 h-8 rounded-xl bg-emerald-950 border border-emerald-500/30 flex items-center justify-center text-xs font-black text-emerald-400">
              8
            </span>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">Open {table.table_number}</h3>
              <p className="text-xs text-slate-400">{table.name} • {table.table_type}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleStartSession} className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
          {/* Match Type Foundation */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-emerald-400/90 mb-2 font-mono flex items-center gap-1.5">
              <Swords className="w-3.5 h-3.5 text-emerald-400" />
              <span>Match Format</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
              {(['1v1', '3_rotation', '4_rotation', '2v2_team', 'custom'] as MatchType[]).map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => handleSelectMatchType(type)}
                  className={`px-2.5 py-2 rounded-xl text-xs font-semibold border transition text-center cursor-pointer ${
                    matchType === type
                      ? 'bg-emerald-600/30 border-emerald-400 text-emerald-200 shadow-sm shadow-emerald-950'
                      : 'bg-[#080d0a] border-emerald-950/80 text-slate-400 hover:text-white hover:border-emerald-800'
                  }`}
                >
                  {MATCH_TYPE_LABELS[type]}
                </button>
              ))}
            </div>
          </div>

          {/* Rate Selection */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-emerald-400/90 mb-2 font-mono">
              Select Pricing Tariff
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {rates.map(rate => (
                <button
                  key={rate.id}
                  type="button"
                  onClick={() => setSelectedRateId(rate.id)}
                  className={`p-3 rounded-xl border text-left transition cursor-pointer ${
                    selectedRateId === rate.id
                      ? 'bg-emerald-950/70 border-emerald-400 text-white font-semibold ring-1 ring-emerald-400/30'
                      : 'bg-[#080d0a] border-emerald-950/80 text-slate-300 hover:border-emerald-800'
                  }`}
                >
                  <div className="text-xs font-bold">{rate.name}</div>
                  <div className="text-[11px] text-amber-400 font-mono mt-1">
                    {settings.currency_symbol} {rate.base_rate} {rate.rate_type === 'hourly' ? '/ hr' : '/ frame'}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Players Roster */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-emerald-400/90 font-mono flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-emerald-400" />
                <span>Patrons / Competitors ({players.length})</span>
              </label>
              <span className="text-[11px] text-slate-500">Min. 1 player</span>
            </div>

            <div className="space-y-1.5 mb-2 max-h-36 overflow-y-auto">
              {players.map((player, idx) => (
                <div key={idx} className="flex items-center justify-between p-2 px-3 rounded-xl bg-[#080d0a] border border-emerald-950 text-xs">
                  <span className="font-semibold text-white">{player}</span>
                  {players.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemovePlayer(idx)}
                      className="text-slate-500 hover:text-rose-400 transition cursor-pointer"
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
                className="flex-1 bg-[#080d0a] border border-emerald-950 text-white text-xs rounded-xl px-3 py-2 focus:outline-none focus:ring-1 focus:ring-emerald-500"
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
                className="px-3.5 py-2 bg-[#121d17] hover:bg-[#182820] text-emerald-300 border border-emerald-800/40 rounded-xl text-xs font-semibold flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                Add
              </button>
            </div>
          </div>

          {/* Viewers (Optional) */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
              Spectators & Guests (Non-playing)
            </label>
            {viewers.length > 0 && (
              <div className="space-y-1.5 mb-2 max-h-24 overflow-y-auto">
                {viewers.map((viewer, idx) => (
                  <div key={idx} className="flex items-center justify-between p-2 px-3 rounded-xl bg-[#080d0a]/60 border border-emerald-950 text-xs text-slate-300">
                    <span>{viewer}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveViewer(idx)}
                      className="text-slate-500 hover:text-rose-400 transition cursor-pointer"
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
                placeholder="Spectator name..."
                value={newViewerInput}
                onChange={e => setNewViewerInput(e.target.value)}
                className="flex-1 bg-[#080d0a] border border-emerald-950 text-white text-xs rounded-xl px-3 py-2 focus:outline-none focus:ring-1 focus:ring-emerald-500"
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
                className="px-3.5 py-2 bg-[#121d17] hover:bg-[#182820] text-slate-300 border border-emerald-900/30 rounded-xl text-xs font-semibold flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                Add
              </button>
            </div>
          </div>

          {/* Submit */}
          <div className="pt-3 border-t border-emerald-950 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-bold px-6 py-2.5 rounded-xl text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-emerald-950/60 transition active:scale-[0.98] border border-emerald-400/20 cursor-pointer"
            >
              <PlayCircle className="w-4 h-4" />
              <span>Start Match Timer</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
