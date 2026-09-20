import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { PhysicalTable, TableSession, TableStatus } from '../../types';
import { TableCard } from '../../components/tables/TableCard';
import { OpenTableModal } from '../../components/tables/OpenTableModal';
import { RunningBillModal } from '../../components/tables/RunningBillModal';
import { CheckoutModal } from '../../components/tables/CheckoutModal';
import { CircleDot, Plus, Search, Filter } from 'lucide-react';

export const TablesPage: React.FC = () => {
  const { tables, sessions, selectedTableForModal, setSelectedTableForModal } = useApp();

  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modals state
  const [openingTable, setOpeningTable] = useState<PhysicalTable | null>(null);
  const [activeSessionTable, setActiveSessionTable] = useState<{ table: PhysicalTable; session: TableSession } | null>(null);
  const [checkoutSession, setCheckoutSession] = useState<{ table: PhysicalTable; session: TableSession } | null>(null);

  // If a table was selected via context
  React.useEffect(() => {
    if (selectedTableForModal) {
      const sess = sessions.find(s => s.id === selectedTableForModal.current_session_id && s.status === 'active');
      if (sess) {
        setActiveSessionTable({ table: selectedTableForModal, session: sess });
      } else {
        setOpeningTable(selectedTableForModal);
      }
      setSelectedTableForModal(null);
    }
  }, [selectedTableForModal, sessions, setSelectedTableForModal]);

  const filteredTables = tables.filter(t => {
    const matchesStatus = statusFilter === 'all' || t.status === statusFilter;
    const matchesSearch = t.table_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          t.table_type.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto pb-24 md:pb-8">
      {/* Header & Controls */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
            <CircleDot className="w-6 h-6 text-emerald-400" />
            <span>Floor Tables & Active Sessions</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Interactive table matrix. Click any table to open a session, manage orders, or take payment.
          </p>
        </div>

        {/* Filter Badges */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
          {(['all', 'available', 'occupied', 'reserved', 'maintenance'] as (TableStatus | 'all')[]).map(status => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize transition whitespace-nowrap ${
                statusFilter === status
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {status} ({status === 'all' ? tables.length : tables.filter(t => t.status === status).length})
            </button>
          ))}
        </div>
      </div>

      {/* Search Input */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="Search by table number, name, or type..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className="w-full bg-slate-900 border border-slate-800 text-white text-xs rounded-xl pl-9 pr-4 py-2.5 focus:outline-none focus:ring-1 focus:ring-emerald-500"
        />
      </div>

      {/* Tables Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredTables.map(table => {
          const session = sessions.find(s => s.id === table.current_session_id && s.status === 'active');
          return (
            <TableCard
              key={table.id}
              table={table}
              session={session}
              onOpenSession={t => setOpeningTable(t)}
              onViewSession={(t, s) => setActiveSessionTable({ table: t, session: s })}
            />
          );
        })}
      </div>

      {/* MODALS */}
      {openingTable && (
        <OpenTableModal
          table={openingTable}
          onClose={() => setOpeningTable(null)}
        />
      )}

      {activeSessionTable && (
        <RunningBillModal
          table={activeSessionTable.table}
          session={activeSessionTable.session}
          onClose={() => setActiveSessionTable(null)}
          onProceedToCheckout={(s) => {
            setActiveSessionTable(null);
            setCheckoutSession({ table: activeSessionTable.table, session: s });
          }}
        />
      )}

      {checkoutSession && (
        <CheckoutModal
          table={checkoutSession.table}
          session={checkoutSession.session}
          onClose={() => setCheckoutSession(null)}
          onSuccess={() => setCheckoutSession(null)}
        />
      )}
    </div>
  );
};
