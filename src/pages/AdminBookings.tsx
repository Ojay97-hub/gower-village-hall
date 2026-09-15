import { useState, useEffect, FormEvent } from 'react';
import { createPortal } from 'react-dom';
import { CalendarDays, Loader2, Inbox, Trash2, Plus, X } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

type BookingStatus = 'pending' | 'confirmed' | 'declined';

interface Booking {
    id: string;
    name: string;
    email: string;
    phone: string | null;
    event_type: string | null;
    date: string;
    end_date: string | null;
    message: string | null;
    status: BookingStatus;
    created_at: string;
}

const localDate = (s: string) => { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d); };

const STATUS_STYLES: Record<BookingStatus, string> = {
    pending: 'bg-amber-50 text-amber-700 border-amber-200',
    confirmed: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    declined: 'bg-red-50 text-red-600 border-red-200',
};

const STATUS_DOT: Record<BookingStatus, string> = {
    pending: 'bg-amber-400',
    confirmed: 'bg-emerald-500',
    declined: 'bg-red-500',
};

export function AdminBookings() {
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [updatingId, setUpdatingId] = useState<string | null>(null);
    const [updatingSessionId, setUpdatingSessionId] = useState<string | null>(null);
    const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
    const [deletingId, setDeletingId] = useState<string | null>(null);

    const [showAddModal, setShowAddModal] = useState(false);
    const [addForm, setAddForm] = useState({
        name: '', email: '', phone: '', date: '', endDate: '', session: '', message: '',
    });
    const [addSubmitting, setAddSubmitting] = useState(false);
    const [addError, setAddError] = useState<string | null>(null);

    useEffect(() => {
        fetchBookings();
    }, []);

    async function fetchBookings() {
        setLoading(true);
        setError(null);
        const { data, error: fetchError } = await supabase
            .from('bookings')
            .select('*')
            .order('created_at', { ascending: false });

        if (fetchError) {
            setError(fetchError.message);
        } else {
            setBookings(data ?? []);
        }
        setLoading(false);
    }

    async function updateSession(id: string, session: string) {
        setUpdatingSessionId(id);
        const { error: updateError } = await supabase
            .from('bookings')
            .update({ event_type: session || null })
            .eq('id', id);

        if (!updateError) {
            setBookings(prev =>
                prev.map(b => (b.id === id ? { ...b, event_type: session || null } : b))
            );
        }
        setUpdatingSessionId(null);
    }

    async function deleteBooking(id: string) {
        setDeletingId(id);
        const { error: deleteError } = await supabase
            .from('bookings')
            .delete()
            .eq('id', id);

        if (deleteError) {
            setError(`Failed to delete booking: ${deleteError.message}`);
        } else {
            setBookings(prev => prev.filter(b => b.id !== id));
        }
        setDeletingId(null);
        setConfirmDeleteId(null);
    }

    async function updateStatus(id: string, status: BookingStatus) {
        setUpdatingId(id);
        const { error: updateError } = await supabase
            .from('bookings')
            .update({ status })
            .eq('id', id);

        if (!updateError) {
            setBookings(prev =>
                prev.map(b => (b.id === id ? { ...b, status } : b))
            );
        }
        setUpdatingId(null);
    }

    function closeAddModal() {
        setShowAddModal(false);
        setAddError(null);
        setAddForm({ name: '', email: '', phone: '', date: '', endDate: '', session: '', message: '' });
    }

    async function handleAddBooking(e: FormEvent) {
        e.preventDefault();
        setAddError(null);

        if (!addForm.name.trim()) {
            setAddError('Please enter a name.');
            return;
        }
        if (!addForm.date) {
            setAddError('Please select a date.');
            return;
        }

        setAddSubmitting(true);
        const { data, error: insertError } = await supabase
            .from('bookings')
            .insert([{
                name: addForm.name.trim(),
                email: addForm.email.trim(),
                phone: addForm.phone.trim() || null,
                date: addForm.date,
                end_date: addForm.endDate || null,
                event_type: addForm.session || null,
                message: addForm.message.trim() || null,
                status: 'confirmed',
            }])
            .select()
            .single();

        if (insertError) {
            setAddError(insertError.message);
        } else if (data) {
            setBookings(prev => [data as Booking, ...prev]);
            closeAddModal();
        }
        setAddSubmitting(false);
    }

    if (loading) {
        return (
            <div className="p-8 flex items-center justify-center min-h-[60vh]">
                <div className="w-12 h-12 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-8 max-w-4xl mx-auto mt-10 bg-red-50 text-red-600 rounded-2xl border border-red-200">
                <h2 className="text-xl font-bold mb-2">Error Loading Bookings</h2>
                <p>{error}</p>
            </div>
        );
    }

    return (
        <div className="p-4 sm:p-8 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold font-serif text-gray-900 mb-2">Bookings</h1>
                    <p className="text-gray-500">Hall booking enquiries, ordered by most recent.</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 text-sm text-gray-500 bg-white border border-gray-100 rounded-xl px-4 py-2 shadow-sm">
                        <CalendarDays className="w-4 h-4 text-primary-500" />
                        {bookings.length} {bookings.length === 1 ? 'enquiry' : 'enquiries'}
                    </div>
                    <button
                        type="button"
                        onClick={() => setShowAddModal(true)}
                        className="inline-flex items-center gap-2 rounded-xl bg-primary-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-primary-700 cursor-pointer"
                    >
                        <Plus className="w-4 h-4" />
                        Add Booking
                    </button>
                </div>
            </div>

            {bookings.length === 0 ? (
                <div className="bg-white p-12 rounded-2xl border border-gray-100 text-center">
                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Inbox className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-1">No bookings yet</h3>
                    <p className="text-gray-500">Enquiries submitted via the hall booking form will appear here.</p>
                </div>
            ) : (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50/50 border-b border-gray-100 text-sm font-medium text-gray-500">
                                    <th className="p-4 pl-6 font-medium">Name &amp; Contact</th>
                                    <th className="p-4 font-medium">Date(s)</th>
                                    <th className="p-4 font-medium">Message</th>
                                    <th className="p-4 font-medium">Received</th>
                                    <th className="p-4 pr-6 font-medium">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {bookings.map(booking => (
                                    <tr key={booking.id} className="hover:bg-gray-50/50 transition-colors">
                                        {/* Name & Contact */}
                                        <td className="p-4 pl-6">
                                            <p className="font-bold text-gray-900">{booking.name}</p>
                                            <a
                                                href={`mailto:${booking.email}`}
                                                className="text-sm text-primary-600 hover:underline"
                                            >
                                                {booking.email}
                                            </a>
                                            {booking.phone && (
                                                <p className="text-xs text-gray-400 mt-0.5">{booking.phone}</p>
                                            )}
                                            <select
                                                value={booking.event_type ?? ''}
                                                disabled={updatingSessionId === booking.id}
                                                onChange={e => updateSession(booking.id, e.target.value)}
                                                className="mt-1.5 block text-xs rounded-md border border-gray-200 bg-gray-50 px-2 py-1 text-gray-600 focus:outline-none focus:ring-1 focus:ring-primary-400 disabled:opacity-50 cursor-pointer"
                                            >
                                                <option value="">Session not set</option>
                                                <option value="morning">Morning (8am–12pm)</option>
                                                <option value="afternoon">Afternoon (12pm–5pm)</option>
                                                <option value="evening">Evening (5pm–10pm)</option>
                                                <option value="allday">All Day</option>
                                                <option value="morning, afternoon">Morning + Afternoon</option>
                                                <option value="morning, evening">Morning + Evening</option>
                                                <option value="afternoon, evening">Afternoon + Evening</option>
                                                <option value="morning, afternoon, evening">Morning + Afternoon + Evening</option>
                                            </select>
                                        </td>

                                        {/* Date(s) */}
                                        <td className="p-4 text-sm text-gray-700">
                                            <p>{localDate(booking.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                                            {booking.end_date && (
                                                <p className="text-xs text-gray-400 mt-0.5">
                                                    to {localDate(booking.end_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                                                </p>
                                            )}
                                        </td>

                                        {/* Message */}
                                        <td className="p-4 text-sm text-gray-600 max-w-xs">
                                            <p className="line-clamp-3 whitespace-pre-wrap">{booking.message ?? '—'}</p>
                                        </td>

                                        {/* Received */}
                                        <td className="p-4 text-sm text-gray-500 whitespace-nowrap">
                                            {new Date(booking.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                                        </td>

                                        {/* Status */}
                                        <td className="p-4 pr-6">
                                            {updatingId === booking.id ? (
                                                <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
                                            ) : (
                                                <div className="flex flex-col gap-1.5">
                                                    {(['pending', 'confirmed', 'declined'] as BookingStatus[]).map(s => (
                                                        <button
                                                            key={s}
                                                            onClick={() => {
                                                                if (booking.status !== s) updateStatus(booking.id, s);
                                                            }}
                                                            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border transition-all cursor-pointer ${
                                                                booking.status === s
                                                                    ? STATUS_STYLES[s]
                                                                    : 'bg-white text-gray-400 border-gray-100 hover:border-gray-300 hover:text-gray-600'
                                                            }`}
                                                        >
                                                            <span className={`w-1.5 h-1.5 rounded-full ${booking.status === s ? STATUS_DOT[s] : 'bg-gray-300'}`} />
                                                            {s.charAt(0).toUpperCase() + s.slice(1)}
                                                        </button>
                                                    ))}
                                                    <div className="mt-0.5 pt-1.5 border-t border-gray-100">
                                                        {deletingId === booking.id ? (
                                                            <Loader2 className="w-3 h-3 animate-spin text-gray-400" />
                                                        ) : confirmDeleteId === booking.id ? (
                                                            <div className="flex flex-col gap-1">
                                                                <p className="text-xs text-gray-500">Delete entry?</p>
                                                                <div className="flex gap-1">
                                                                    <button
                                                                        onClick={() => deleteBooking(booking.id)}
                                                                        className="text-xs px-2 py-0.5 rounded bg-red-500 text-white hover:bg-red-600 transition-colors cursor-pointer"
                                                                    >
                                                                        Yes
                                                                    </button>
                                                                    <button
                                                                        onClick={() => setConfirmDeleteId(null)}
                                                                        className="text-xs px-2 py-0.5 rounded bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors cursor-pointer"
                                                                    >
                                                                        No
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <button
                                                                onClick={() => setConfirmDeleteId(booking.id)}
                                                                className="flex items-center gap-1 text-xs text-gray-400 hover:text-red-400 transition-colors cursor-pointer"
                                                            >
                                                                <Trash2 className="w-3 h-3" />
                                                                Delete
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Add Booking Modal */}
            {showAddModal && createPortal(
                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
                    <div
                        className="absolute inset-0 bg-black/60"
                        style={{ backdropFilter: 'blur(4px)' }}
                        onClick={() => !addSubmitting && closeAddModal()}
                    />
                    <div className="relative w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl sm:p-8 max-h-[90vh] overflow-y-auto">
                        <div className="mb-6 flex items-start justify-between gap-4">
                            <div>
                                <h3 className="text-lg font-bold text-gray-900">Add Booking</h3>
                                <p className="mt-1 text-sm text-gray-500">
                                    For enquiries taken by phone, Facebook, or in person. Goes straight in as confirmed.
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() => !addSubmitting && closeAddModal()}
                                className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 cursor-pointer"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form className="space-y-4" onSubmit={handleAddBooking}>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm mb-1.5 text-gray-700 font-medium">
                                        Name <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={addForm.name}
                                        onChange={e => setAddForm(prev => ({ ...prev, name: e.target.value }))}
                                        className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                        disabled={addSubmitting}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm mb-1.5 text-gray-700 font-medium">Phone</label>
                                    <input
                                        type="tel"
                                        value={addForm.phone}
                                        onChange={e => setAddForm(prev => ({ ...prev, phone: e.target.value }))}
                                        className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                        disabled={addSubmitting}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm mb-1.5 text-gray-700 font-medium">Email</label>
                                <input
                                    type="email"
                                    value={addForm.email}
                                    onChange={e => setAddForm(prev => ({ ...prev, email: e.target.value }))}
                                    placeholder="Optional if taken by phone"
                                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                    disabled={addSubmitting}
                                />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm mb-1.5 text-gray-700 font-medium">
                                        Date <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="date"
                                        value={addForm.date}
                                        onChange={e => setAddForm(prev => ({ ...prev, date: e.target.value }))}
                                        className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                        disabled={addSubmitting}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm mb-1.5 text-gray-700 font-medium">End date</label>
                                    <input
                                        type="date"
                                        value={addForm.endDate}
                                        min={addForm.date || undefined}
                                        onChange={e => setAddForm(prev => ({ ...prev, endDate: e.target.value }))}
                                        placeholder="Same day if blank"
                                        className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                        disabled={addSubmitting}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm mb-1.5 text-gray-700 font-medium">Session</label>
                                <select
                                    value={addForm.session}
                                    onChange={e => setAddForm(prev => ({ ...prev, session: e.target.value }))}
                                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent cursor-pointer"
                                    disabled={addSubmitting}
                                >
                                    <option value="">Session not set</option>
                                    <option value="morning">Morning (8am–12pm)</option>
                                    <option value="afternoon">Afternoon (12pm–5pm)</option>
                                    <option value="evening">Evening (5pm–10pm)</option>
                                    <option value="allday">All Day</option>
                                    <option value="morning, afternoon">Morning + Afternoon</option>
                                    <option value="morning, evening">Morning + Evening</option>
                                    <option value="afternoon, evening">Afternoon + Evening</option>
                                    <option value="morning, afternoon, evening">Morning + Afternoon + Evening</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm mb-1.5 text-gray-700 font-medium">Notes</label>
                                <textarea
                                    value={addForm.message}
                                    onChange={e => setAddForm(prev => ({ ...prev, message: e.target.value }))}
                                    rows={3}
                                    placeholder="Any details worth keeping on file..."
                                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                    disabled={addSubmitting}
                                />
                            </div>

                            {addError && (
                                <p className="text-sm text-red-600">{addError}</p>
                            )}

                            <div className="flex justify-end gap-3 pt-2">
                                <button
                                    type="button"
                                    disabled={addSubmitting}
                                    onClick={closeAddModal}
                                    className="rounded-lg px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={addSubmitting}
                                    className="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 disabled:opacity-60 cursor-pointer"
                                >
                                    {addSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                                    Add Booking
                                </button>
                            </div>
                        </form>
                    </div>
                </div>,
                document.body
            )}
        </div>
    );
}
