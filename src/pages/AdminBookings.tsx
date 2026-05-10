import { useState, useEffect } from 'react';
import { CalendarDays, Loader2, Inbox } from 'lucide-react';
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
                <div className="flex items-center gap-2 text-sm text-gray-500 bg-white border border-gray-100 rounded-xl px-4 py-2 shadow-sm">
                    <CalendarDays className="w-4 h-4 text-primary-500" />
                    {bookings.length} {bookings.length === 1 ? 'enquiry' : 'enquiries'}
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
        </div>
    );
}
