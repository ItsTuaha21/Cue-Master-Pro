import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  CalendarDays,
  Plus,
  Clock,
  User,
  Phone,
  CheckCircle2,
  PlayCircle,
  X
} from 'lucide-react';

export const BookingsPage: React.FC = () => {
  const { bookings, tables, settings, addBooking, checkInBooking } = useApp();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [tableId, setTableId] = useState(tables[0]?.id || '');
  const [bookingTime, setBookingTime] = useState(new Date().toISOString().slice(0, 16));
  const [durationMinutes, setDurationMinutes] = useState(60);
  const [advanceDeposit, setAdvanceDeposit] = useState(500);

  const handleAddBooking = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim() || !tableId) return;

    const targetTable = tables.find(t => t.id === tableId);
    addBooking({
      club_id: 'club-main',
      table_id: tableId,
      table_name: targetTable?.name || 'Table',
      customer_name: customerName.trim(),
      phone: customerPhone.trim(),
      booking_date: bookingTime.slice(0, 10),
      start_time: bookingTime.slice(11, 16),
      end_time: '23:00',
      deposit_amount: advanceDeposit,
      status: 'confirmed',
    });

    setIsModalOpen(false);
    setCustomerName('');
    setCustomerPhone('');
    alert('Table reservation saved.');
  };

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto pb-24 md:pb-8">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
            <CalendarDays className="w-6 h-6 text-blue-400" />
            <span>Table Reservations & Bookings</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Schedule advance matches, collect booking deposits, and seamless one-click floor check-ins.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs px-4 py-2 rounded-xl flex items-center gap-1.5 shadow-md transition"
        >
          <Plus className="w-4 h-4" />
          <span>New Table Booking</span>
        </button>
      </div>

      {/* Bookings List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {bookings.map(booking => (
          <div key={booking.id} className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center justify-between">
                <span className="font-bold text-base text-white">{booking.table_name}</span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                  booking.status === 'confirmed'
                    ? 'bg-blue-500/20 text-blue-300'
                    : booking.status === 'checked_in'
                    ? 'bg-emerald-500/20 text-emerald-300'
                    : 'bg-slate-800 text-slate-400'
                }`}>
                  {booking.status.replace('_', ' ')}
                </span>
              </div>

              <div className="mt-3 space-y-1.5 text-xs text-slate-300">
                <div className="flex items-center gap-2 font-medium">
                  <User className="w-3.5 h-3.5 text-slate-400" />
                  <span>{booking.customer_name}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-400 font-mono">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  <span>{booking.phone}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-400">
                  <Clock className="w-3.5 h-3.5 text-amber-400" />
                  <span>
                    {booking.booking_date} at {booking.start_time}
                  </span>
                </div>
              </div>

              {booking.deposit_amount > 0 && (
                <div className="mt-3 p-2 rounded-lg bg-slate-950/60 border border-slate-800 text-xs flex justify-between">
                  <span className="text-slate-400">Advance Deposit Paid:</span>
                  <span className="font-bold text-emerald-400 font-mono">
                    {settings.currency_symbol} {booking.deposit_amount}
                  </span>
                </div>
              )}
            </div>

            {booking.status === 'confirmed' && (
              <div className="pt-2 border-t border-slate-800">
                <button
                  onClick={() => {
                    checkInBooking(booking.id);
                    alert(`Checked in ${booking.customer_name} at ${booking.table_name}. Match started!`);
                  }}
                  className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-md transition"
                >
                  <PlayCircle className="w-4 h-4" />
                  <span>Check-In & Start Match</span>
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* NEW BOOKING MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="relative w-full max-w-md bg-slate-900 border border-slate-700 rounded-2xl p-6 space-y-4">
            <h3 className="text-base font-bold text-white">Create Table Reservation</h3>

            <form onSubmit={handleAddBooking} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Customer Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Asad Rehman"
                  value={customerName}
                  onChange={e => setCustomerName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 text-white text-xs rounded-xl p-2.5"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Mobile Phone</label>
                <input
                  type="tel"
                  required
                  placeholder="e.g. +92 321 9876543"
                  value={customerPhone}
                  onChange={e => setCustomerPhone(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 text-white text-xs rounded-xl p-2.5"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Select Table</label>
                  <select
                    value={tableId}
                    onChange={e => setTableId(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 text-white text-xs rounded-xl p-2.5"
                  >
                    {tables.map(t => (
                      <option key={t.id} value={t.id}>
                        {t.table_number} ({t.table_type})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Duration (Mins)</label>
                  <input
                    type="number"
                    min="30"
                    step="30"
                    value={durationMinutes}
                    onChange={e => setDurationMinutes(parseInt(e.target.value) || 60)}
                    className="w-full bg-slate-950 border border-slate-700 text-white font-mono text-xs rounded-xl p-2.5"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Booking Date & Time</label>
                  <input
                    type="datetime-local"
                    value={bookingTime}
                    onChange={e => setBookingTime(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 text-white text-xs rounded-xl p-2.5"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Advance Deposit</label>
                  <input
                    type="number"
                    min="0"
                    value={advanceDeposit}
                    onChange={e => setAdvanceDeposit(parseInt(e.target.value) || 0)}
                    className="w-full bg-slate-950 border border-slate-700 text-white font-mono text-xs rounded-xl p-2.5"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-5 py-2 rounded-xl text-xs"
                >
                  Save Reservation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
