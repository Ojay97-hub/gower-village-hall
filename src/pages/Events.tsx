import { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { useEvents, Event, RegularActivity } from '../context/EventContext';
import { useAuth } from '../context/AuthContext';
import { EventForm } from '../components/events/EventForm';
import { RegularActivityForm } from '../components/events/RegularActivityForm';
import { ActivityCalendar, PrivateBooking } from '../components/events/ActivityCalendar';
import { AddToCalendarButton } from '../components/events/AddToCalendarButton';
import { supabase } from '../lib/supabaseClient';
import {
    Calendar, Clock, MapPin, Plus, Edit2, Trash2, AlertTriangle, X,
    Coffee, Palette, Music, Users, Star, BookOpen, Heart, Smile, Lock, User, Phone, Mail
} from 'lucide-react';

// Icon mapping helper
const iconMap: Record<string, React.ElementType> = {
    Coffee, Palette, Music, Users, Star, BookOpen, Heart, Smile
};

// Color theme mapping helper - using hex colors for inline styles since Tailwind classes aren't pre-generated
const colorMap: Record<string, {
    borderColor: string,
    bgColor: string,
    textColor: string,
    descColor: string,
    iconBgColor: string,
    iconTextColor: string,
    buttonBgColor: string,
    buttonTextColor: string,
    buttonHoverBgColor: string
}> = {
    forest: {
        borderColor: '#166534', bgColor: '#dcfce7', textColor: '#14532d', descColor: '#166534',
        iconBgColor: '#bbf7d0', iconTextColor: '#15803d',
        buttonBgColor: '#86efac', buttonTextColor: '#14532d', buttonHoverBgColor: '#4ade80'
    },
    sage: {
        borderColor: '#22c55e', bgColor: '#f0fdf4', textColor: '#166534', descColor: '#15803d',
        iconBgColor: '#dcfce7', iconTextColor: '#16a34a',
        buttonBgColor: '#bbf7d0', buttonTextColor: '#166534', buttonHoverBgColor: '#86efac'
    },
    olive: {
        borderColor: '#65a30d', bgColor: '#ecfccb', textColor: '#365314', descColor: '#4d7c0f',
        iconBgColor: '#d9f99d', iconTextColor: '#65a30d',
        buttonBgColor: '#bef264', buttonTextColor: '#365314', buttonHoverBgColor: '#a3e635'
    },
    moss: {
        borderColor: '#0d9488', bgColor: '#ccfbf1', textColor: '#134e4a', descColor: '#0f766e',
        iconBgColor: '#99f6e4', iconTextColor: '#14b8a6',
        buttonBgColor: '#5eead4', buttonTextColor: '#134e4a', buttonHoverBgColor: '#2dd4bf'
    },
    stone: {
        borderColor: '#78716c', bgColor: '#f5f5f4', textColor: '#292524', descColor: '#44403c',
        iconBgColor: '#e7e5e4', iconTextColor: '#57534e',
        buttonBgColor: '#d6d3d1', buttonTextColor: '#292524', buttonHoverBgColor: '#a8a29e'
    },
    slate: {
        borderColor: '#475569', bgColor: '#f1f5f9', textColor: '#1e293b', descColor: '#334155',
        iconBgColor: '#cbd5e1', iconTextColor: '#475569',
        buttonBgColor: '#94a3b8', buttonTextColor: '#1e293b', buttonHoverBgColor: '#64748b'
    },
    charcoal: {
        borderColor: '#3f3f46', bgColor: '#fafafa', textColor: '#18181b', descColor: '#27272a',
        iconBgColor: '#e4e4e7', iconTextColor: '#3f3f46',
        buttonBgColor: '#a1a1aa', buttonTextColor: '#18181b', buttonHoverBgColor: '#71717a'
    },
    warm: {
        borderColor: '#b45309', bgColor: '#fef3c7', textColor: '#78350f', descColor: '#92400e',
        iconBgColor: '#fde68a', iconTextColor: '#d97706',
        buttonBgColor: '#fcd34d', buttonTextColor: '#78350f', buttonHoverBgColor: '#fbbf24'
    },
};

interface BookingRecord extends PrivateBooking {
    email: string;
    phone: string | null;
    message: string | null;
}

function getBookingDateStrings(date: string, endDate: string | null): string[] {
    const [sy, sm, sd] = date.split('-').map(Number);
    const start = new Date(sy, sm - 1, sd);
    const end = endDate ? (() => { const [ey, em, ed] = endDate.split('-').map(Number); return new Date(ey, em - 1, ed); })() : start;
    const dates: string[] = [];
    const cur = new Date(start);
    while (cur <= end) {
        dates.push(`${cur.getFullYear()}-${String(cur.getMonth() + 1).padStart(2, '0')}-${String(cur.getDate()).padStart(2, '0')}`);
        cur.setDate(cur.getDate() + 1);
    }
    return dates;
}

function sessionOverlapsEvent(eventType: string | null, eventStartTime: string | null): boolean {
    if (!eventType || eventType === 'allday') return true;
    if (!eventStartTime) return true;
    const hours = parseInt(eventStartTime.split(':')[0]);
    return eventType.split(',').map(s => s.trim()).some(s => {
        if (s === 'allday') return true;
        if (s === 'morning' && hours < 12) return true;
        if (s === 'afternoon' && hours >= 12 && hours < 17) return true;
        if (s === 'evening' && hours >= 17) return true;
        return false;
    });
}

function buildEventDateTimes(
    dateStr: string,
    startTime: string | null,
    endTime: string | null,
    endDateStr?: string | null,
): { start: Date; end: Date | null; allDay: boolean } {
    const [y, m, d] = dateStr.split('-').map(Number);
    if (!startTime) {
        const end = endDateStr
            ? (() => { const [ey, em, ed] = endDateStr.split('-').map(Number); return new Date(ey, em - 1, ed); })()
            : null;
        return { start: new Date(y, m - 1, d), end, allDay: true };
    }
    const [sh, sm] = startTime.split(':').map(Number);
    const start = new Date(y, m - 1, d, sh, sm);
    let end: Date | null = null;
    if (endDateStr) {
        const [ey, em, ed] = endDateStr.split('-').map(Number);
        end = endTime
            ? (() => { const [eh, emin] = endTime.split(':').map(Number); return new Date(ey, em - 1, ed, eh, emin); })()
            : new Date(ey, em - 1, ed);
    } else if (endTime) {
        const [eh, em] = endTime.split(':').map(Number);
        end = new Date(y, m - 1, d, eh, em);
    }
    return { start, end, allDay: false };
}

function formatSession(eventType: string | null): string {
    if (!eventType) return 'Session TBC';
    const labels: Record<string, string> = {
        morning: 'Morning (8am–12pm)',
        afternoon: 'Afternoon (12pm–5pm)',
        evening: 'Evening (5pm–10pm)',
        allday: 'All Day',
    };
    return eventType.split(',').map(s => labels[s.trim()] ?? s.trim()).join(' + ');
}

export function Events() {
    const { events, regularActivities, loading, deleteEvent, deleteRegularActivity } = useEvents();
    const { hasRole, isMasterAdmin } = useAuth();
    const canManageEvents = hasRole('events');
    const canViewPrivateBookings = isMasterAdmin || hasRole('events') || hasRole('bookings');

    // Event State
    const [showEventForm, setShowEventForm] = useState(false);
    const [editingEvent, setEditingEvent] = useState<Event | undefined>(undefined);
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    const [eventToDelete, setEventToDelete] = useState<Event | null>(null);

    // Regular Activity State
    const [showActivityForm, setShowActivityForm] = useState(false);
    const [editingActivity, setEditingActivity] = useState<RegularActivity | undefined>(undefined);
    const [deleteActivityConfirmOpen, setDeleteActivityConfirmOpen] = useState(false);
    const [activityToDelete, setActivityToDelete] = useState<RegularActivity | null>(null);

    const [isDeleting, setIsDeleting] = useState(false);

    // Private bookings
    const [activeTab, setActiveTab] = useState<'upcoming' | 'private'>('upcoming');
    const [privateBookings, setPrivateBookings] = useState<BookingRecord[]>([]);
    const [bookingsLoading, setBookingsLoading] = useState(false);

    useEffect(() => {
        if (!canViewPrivateBookings) return;
        setBookingsLoading(true);
        supabase
            .from('bookings')
            .select('id, name, email, phone, date, end_date, event_type, message')
            .eq('status', 'confirmed')
            .order('date', { ascending: true })
            .then(({ data }) => {
                setPrivateBookings(data ?? []);
                setBookingsLoading(false);
            });
    }, [canViewPrivateBookings]);

    const conflicts = useMemo(() => {
        if (!canViewPrivateBookings) return [];
        const results: Array<{ booking: BookingRecord; event: Event; date: string }> = [];
        privateBookings.forEach(booking => {
            const bookingDates = new Set(getBookingDateStrings(booking.date, booking.end_date));
            events.forEach(event => {
                if (bookingDates.has(event.date) && sessionOverlapsEvent(booking.event_type, event.start_time)) {
                    results.push({ booking, event, date: event.date });
                }
            });
        });
        return results;
    }, [privateBookings, events, canViewPrivateBookings]);

    // --- Event Handlers ---
    const handleEdit = (event: Event) => {
        setEditingEvent(event);
        setShowEventForm(true);
        setTimeout(() => {
            document.getElementById('event-form-section')?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
    };

    const handleCreate = () => {
        setEditingEvent(undefined);
        setShowEventForm(true);
        setTimeout(() => {
            document.getElementById('event-form-section')?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
    };

    const handleClose = () => {
        setShowEventForm(false);
        setEditingEvent(undefined);
    };

    const handleDeleteClick = (event: Event) => {
        setEventToDelete(event);
        setDeleteConfirmOpen(true);
    };

    const handleDeleteConfirm = async () => {
        if (eventToDelete) {
            setIsDeleting(true);
            try {
                await deleteEvent(eventToDelete.id);
                setDeleteConfirmOpen(false);
                setEventToDelete(null);
            } catch (error: any) {
                console.error(error);
                alert(error?.message || "Failed to delete event. You might not have permission.");
            } finally {
                setIsDeleting(false);
            }
        }
    };

    const handleDeleteCancel = () => {
        setDeleteConfirmOpen(false);
        setEventToDelete(null);
    };

    // --- Regular Activity Handlers ---
    const handleActivityEdit = (activity: RegularActivity) => {
        setEditingActivity(activity);
        setShowActivityForm(true);
        setTimeout(() => {
            document.getElementById('activity-form-section')?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
    };

    const handleActivityCreate = () => {
        setEditingActivity(undefined);
        setShowActivityForm(true);
        setTimeout(() => {
            document.getElementById('activity-form-section')?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
    };

    const handleActivityClose = () => {
        setShowActivityForm(false);
        setEditingActivity(undefined);
    };

    const handleActivityDeleteClick = (activity: RegularActivity) => {
        setActivityToDelete(activity);
        setDeleteActivityConfirmOpen(true);
    };

    const handleActivityDeleteConfirm = async () => {
        if (activityToDelete) {
            setIsDeleting(true);
            try {
                await deleteRegularActivity(activityToDelete.id);
                setDeleteActivityConfirmOpen(false);
                setActivityToDelete(null);
            } catch (error: any) {
                console.error(error);
                alert(error?.message || "Failed to delete activity. You might not have permission.");
            } finally {
                setIsDeleting(false);
            }
        }
    };

    const handleActivityDeleteCancel = () => {
        setDeleteActivityConfirmOpen(false);
        setActivityToDelete(null);
    };

    const formatTime = (timeString: string | null) => {
        if (!timeString) return '';
        return timeString.substring(0, 5);
    };

    const featuredActivity = useMemo(
        () => regularActivities.find(activity => activity.is_featured)
            || regularActivities.find(activity => activity.title.toLowerCase().includes('coffee morning')),
        [regularActivities]
    );

    const otherActivities = useMemo(
        () => regularActivities.filter(activity => activity.id !== featuredActivity?.id),
        [regularActivities, featuredActivity]
    );

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col" >
            {/* Hero Section */}
            <section className="bg-primary-300 py-16 relative">
                <div className="max-w-7xl mx-auto mb-12 mt-4 px-4 sm:px-6 lg:px-8">
                    <h1 className="text-4xl font-bold mb-4">Events Schedule</h1>
                    <p className="text-xl text-gray-800 max-w-2xl">
                        See what's happening at the village hall. Join us for community gatherings,
                        classes, and special events.
                    </p>
                </div>
                {/* Curved bottom */}
                <div className="absolute bottom-0 left-0 right-0 overflow-hidden" style={{ height: '60px' }}>
                    <svg
                        viewBox="0 0 1440 60"
                        preserveAspectRatio="none"
                        className="w-full h-full"
                        style={{ display: 'block' }}
                    >
                        <path
                            d="M0,0 C360,60 1080,60 1440,0 L1440,60 L0,60 Z"
                            fill="#f9fafb"
                        />
                    </svg>
                </div>
            </section>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 w-full">

                {/* Calendar Section */}
                <div className="mb-16">
                    <div className="flex justify-between items-center mb-8">
                        <div>
                            <span className="inline-block px-4 py-2 bg-primary-100 text-primary-700 rounded-full text-sm font-medium mb-4">
                                At a Glance
                            </span>
                            <h2 className="text-2xl font-bold text-gray-900">Activity Calendar</h2>
                        </div>
                    </div>
                    <ActivityCalendar privateBookings={canViewPrivateBookings ? privateBookings : []} />
                </div>

                <div className="flex justify-between items-center mb-12">
                    {canViewPrivateBookings ? (
                        <div className="flex items-center gap-1 bg-gray-100 rounded-xl p-1">
                            <button
                                onClick={() => setActiveTab('upcoming')}
                                className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all ${
                                    activeTab === 'upcoming'
                                        ? 'bg-white text-gray-900 shadow-sm'
                                        : 'text-gray-500 hover:text-gray-700'
                                }`}
                            >
                                Upcoming Events
                            </button>
                            <button
                                onClick={() => setActiveTab('private')}
                                className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-semibold transition-all ${
                                    activeTab === 'private'
                                        ? 'bg-white text-gray-900 shadow-sm'
                                        : 'text-gray-500 hover:text-gray-700'
                                }`}
                            >
                                <Lock className="w-3.5 h-3.5" />
                                Private Bookings
                                {conflicts.length > 0 && (
                                    <span className="flex items-center justify-center w-5 h-5 rounded-full bg-amber-500 text-white text-[10px] font-bold">
                                        {conflicts.length}
                                    </span>
                                )}
                            </button>
                        </div>
                    ) : (
                        <h2 className="text-2xl font-bold text-gray-900">Upcoming Events</h2>
                    )}

                    {canManageEvents && activeTab === 'upcoming' && (
                        <button
                            onClick={handleCreate}
                            className="flex items-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors"
                        >
                            <Plus className="w-5 h-5" />
                            Add Event
                        </button>
                    )}
                </div>

                {/* Double-booking warning banner */}
                {activeTab === 'private' && canViewPrivateBookings && conflicts.length > 0 && (
                    <div className="mb-6 bg-amber-50 border border-amber-200 rounded-2xl p-5">
                        <div className="flex items-start gap-3">
                            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                            <div className="flex-1 min-w-0">
                                <h4 className="font-semibold text-amber-900 mb-2">
                                    {conflicts.length} potential double-booking{conflicts.length > 1 ? 's' : ''} detected
                                </h4>
                                <div className="space-y-1.5">
                                    {conflicts.map((c, i) => (
                                        <div key={i} className="text-sm text-amber-800">
                                            <span className="font-medium">{c.booking.name}</span>
                                            {' '}overlaps with public event{' '}
                                            <span className="font-medium">"{c.event.title}"</span>
                                            {' '}on{' '}
                                            <span className="font-medium">
                                                {(() => { const [y,m,d] = c.date.split('-').map(Number); return new Date(y, m-1, d).toLocaleDateString('en-GB', { day: 'numeric', month: 'long' }); })()}
                                            </span>
                                            {c.booking.email && (
                                                <> — <a href={`mailto:${c.booking.email}`} className="underline hover:text-amber-900">contact hirer</a></>
                                            )}
                                        </div>
                                    ))}
                                </div>
                                <p className="text-xs text-amber-700 mt-3">
                                    Contact hirers to reschedule or confirm the arrangement is intentional.
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Private Bookings Tab */}
                {activeTab === 'private' && canViewPrivateBookings && (
                    bookingsLoading ? (
                        <div className="flex justify-center items-center py-20 min-h-[400px]">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
                        </div>
                    ) : privateBookings.filter(b => new Date(b.date) >= new Date(new Date().toDateString())).length === 0 ? (
                        <div className="text-center py-16 bg-white rounded-2xl shadow-sm border border-gray-200">
                            <Lock className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">No upcoming private bookings</h3>
                            <p className="text-gray-500">Confirmed hall hire bookings will appear here.</p>
                        </div>
                    ) : (
                        <div className="grid gap-6">
                            {privateBookings
                                .filter(b => new Date(b.date) >= new Date(new Date().toDateString()))
                                .map(booking => {
                                    const isMultiDay = !!booking.end_date;
                                    const [bY, bM, bD] = booking.date.split('-').map(Number);
                                    const startDate = new Date(bY, bM - 1, bD);
                                    return (
                                        <div
                                            key={booking.id}
                                            className="group relative bg-white rounded-2xl shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-purple-100 overflow-hidden"
                                        >
                                            <div className="p-4 sm:p-6 md:p-8 flex gap-4 sm:gap-6 md:gap-8">
                                                <div className="shrink-0">
                                                    <div className="w-16 h-16 md:w-20 md:h-20 bg-purple-50 rounded-2xl flex flex-col items-center justify-center border border-purple-100 group-hover:bg-purple-600 group-hover:border-purple-600 transition-colors duration-300 shadow-sm">
                                                        <span className="text-xl md:text-2xl font-bold text-purple-600 group-hover:text-white transition-colors duration-300">
                                                            {startDate.getDate()}
                                                        </span>
                                                        <span className="text-xs md:text-sm font-bold uppercase tracking-wider text-purple-700 group-hover:text-purple-100 transition-colors duration-300">
                                                            {startDate.toLocaleDateString('en-GB', { month: 'short' })}
                                                        </span>
                                                    </div>
                                                </div>

                                                <div className="grow min-w-0">
                                                    <div className="flex flex-col gap-2 md:flex-row md:items-center md:gap-4 w-full">
                                                        <div className="flex items-center gap-3 flex-1 min-w-0">
                                                            <Lock className="w-4 h-4 text-purple-400 shrink-0" />
                                                            <h3 className="text-xl md:text-2xl font-bold text-gray-900 leading-tight group-hover:text-purple-600 transition-colors min-w-0">
                                                                {booking.name}
                                                            </h3>
                                                        </div>
                                                        <span className="inline-flex items-center px-4 mt-2 md:mt-0 py-1 md:py-2 rounded-full text-xs font-semibold bg-purple-100 text-purple-800 uppercase tracking-wide self-start md:self-auto">
                                                            Private Hire
                                                        </span>
                                                    </div>

                                                    <div className="mt-4 flex flex-wrap items-center gap-3 text-sm">
                                                        {booking.email && (
                                                            <div className="flex items-center gap-2 text-gray-600 bg-gray-50 px-3 py-1.5 rounded-xl border border-gray-100">
                                                                <Mail className="w-3.5 h-3.5 text-purple-400" />
                                                                <a href={`mailto:${booking.email}`} className="font-medium hover:text-purple-600 transition-colors">{booking.email}</a>
                                                            </div>
                                                        )}
                                                        {booking.phone && (
                                                            <div className="flex items-center gap-2 text-gray-600 bg-gray-50 px-3 py-1.5 rounded-xl border border-gray-100">
                                                                <Phone className="w-3.5 h-3.5 text-purple-400" />
                                                                <span className="font-medium">{booking.phone}</span>
                                                            </div>
                                                        )}
                                                    </div>

                                                    <div className="mt-3 flex flex-wrap items-center gap-4 text-sm">
                                                        <div className="flex items-center gap-2 text-gray-600 bg-gray-50 px-4 py-2 rounded-xl border border-gray-100">
                                                            <Clock className="w-4 h-4 text-purple-400" />
                                                            <span className="font-medium">{formatSession(booking.event_type)}</span>
                                                        </div>
                                                        {isMultiDay && booking.end_date && (
                                                            <div className="flex items-center gap-2 text-gray-600 bg-gray-50 px-4 py-2 rounded-xl border border-gray-100">
                                                                <Calendar className="w-4 h-4 text-purple-400" />
                                                                <span className="font-medium">
                                                                    Until {new Date(booking.end_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                                                                </span>
                                                            </div>
                                                        )}
                                                    </div>

                                                    {booking.message && (
                                                        <p className="mt-4 text-gray-500 text-sm leading-relaxed line-clamp-2 italic">
                                                            "{booking.message}"
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                        </div>
                    )
                )}

                {/* Upcoming Events Tab */}
                {activeTab === 'upcoming' && loading ? (
                    <div className="flex justify-center items-center py-20 min-h-[400px]">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
                    </div>
                ) : activeTab === 'upcoming' && events.filter(event => new Date(event.end_date ?? event.date) >= new Date(new Date().toDateString())).length === 0 ? (
                    <div className="text-center py-16 bg-white rounded-2xl shadow-sm border border-gray-200">
                        <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No upcoming events</h3>
                        <p className="text-gray-500">Check back soon for updates!</p>
                    </div>
                ) : activeTab === 'upcoming' ? (
                    <div className="grid gap-6">
                        {events.filter(event => new Date(event.end_date ?? event.date) >= new Date(new Date().toDateString())).map((event) => (
                            <div
                                key={event.id}
                                className="group relative bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
                            >
                                <div className="p-4 sm:p-6 md:p-8 flex gap-4 sm:gap-6 md:gap-8">
                                    {/* Date Side - Always on left */}
                                    <div className="shrink-0 self-stretch">
                                        {event.end_date ? (
                                            <div className="h-full w-20 md:w-24 bg-primary-50 rounded-2xl flex flex-col items-center justify-center border border-primary-100 group-hover:bg-primary-600 group-hover:border-primary-600 transition-colors duration-300 shadow-sm px-2 py-3 gap-1">
                                                <span className="text-sm md:text-base font-bold uppercase tracking-wide text-primary-700 group-hover:text-primary-100 transition-colors duration-300">
                                                    {new Date(event.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                                                </span>
                                                <span className="text-xs text-primary-400 group-hover:text-primary-200 transition-colors duration-300 leading-none">to</span>
                                                <span className="text-sm md:text-base font-bold uppercase tracking-wide text-primary-700 group-hover:text-primary-100 transition-colors duration-300">
                                                    {new Date(event.end_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                                                </span>
                                            </div>
                                        ) : (
                                            <div className="w-16 h-16 md:w-20 md:h-20 bg-primary-50 rounded-2xl flex flex-col items-center justify-center border border-primary-100 group-hover:bg-primary-600 group-hover:border-primary-600 transition-colors duration-300 shadow-sm">
                                                <span className="text-xl md:text-2xl font-bold text-primary-600 group-hover:text-white transition-colors duration-300">
                                                    {new Date(event.date).toLocaleDateString('en-GB', { day: 'numeric' })}
                                                </span>
                                                <span className="text-xs md:text-sm font-bold uppercase tracking-wider text-primary-700 group-hover:text-primary-100 transition-colors duration-300">
                                                    {new Date(event.date).toLocaleDateString('en-GB', { month: 'short' })}
                                                </span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Content Side */}
                                    <div className="grow min-w-0">
                                        <div className="flex flex-col gap-2 md:flex-row md:items-center md:gap-4 w-full">
                                            <h3 className="text-xl md:text-2xl font-bold text-gray-900 leading-tight min-w-0 flex-1">
                                                {event.title}
                                            </h3>

                                            <div className="flex items-center gap-2 md:gap-3 shrink-0">
                                                <span className="inline-flex items-center px-4 mt-2 md:mt-0 py-1 md:py-2 rounded-full text-xs font-semibold bg-primary-100 text-primary-800 uppercase tracking-wide">
                                                    {event.type || 'Event'}
                                                </span>

                                                {/* Admin Actions */}
                                                {canManageEvents && (
                                                    <div className="flex items-center gap-1 md:gap-2">
                                                        <button
                                                            onClick={() => handleEdit(event)}
                                                            className="p-2 text-gray-400 hover:text-primary-600 hover:bg-gray-50 rounded-lg transition"
                                                            title="Edit"
                                                        >
                                                            <Edit2 className="w-5 h-5" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteClick(event)}
                                                            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition"
                                                            title="Delete"
                                                        >
                                                            <Trash2 className="w-5 h-5" />
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <p className="mt-4 text-gray-600 leading-relaxed line-clamp-3">
                                            {event.description}
                                        </p>

                                        <div className="mt-6 flex flex-wrap items-center gap-4 text-sm">
                                            {(event.start_time || event.end_time) && (
                                                <div className="flex items-center gap-4 text-gray-600 bg-gray-50 px-4 py-2 rounded-xl border border-gray-100">
                                                    <Clock className="w-4 h-4 text-primary-500" />
                                                    <span className="font-medium">
                                                        {formatTime(event.start_time)}
                                                        {event.end_time && ` - ${formatTime(event.end_time)}`}
                                                    </span>
                                                </div>
                                            )}

                                            {event.location && (
                                                <div className="flex items-center gap-4 text-gray-600 bg-gray-50 px-4 py-2 rounded-xl border border-gray-100">
                                                    <MapPin className="w-4 h-4 text-primary-500" />
                                                    <span className="font-medium">{event.location}</span>
                                                </div>
                                            )}

                                            {(() => {
                                                const { start, end, allDay } = buildEventDateTimes(
                                                    event.date,
                                                    event.start_time,
                                                    event.end_time,
                                                    event.end_date,
                                                );
                                                return (
                                                    <AddToCalendarButton
                                                        title={event.title}
                                                        description={event.description}
                                                        location={event.location ?? 'Penmaen and Nicholaston Village Hall'}
                                                        startDate={start}
                                                        endDate={end}
                                                        allDay={allDay}
                                                        className="group/cta cursor-pointer flex items-center gap-3 text-sm font-medium text-gray-600 bg-gray-50 hover:bg-primary-600 hover:text-white hover:border-primary-600 hover:shadow-md hover:-translate-y-0.5 px-4 py-2 rounded-xl border border-gray-100 transition-all duration-200"
                                                        iconClassName="w-4 h-4 text-primary-500 group-hover/cta:text-white transition-colors duration-200"
                                                        chevronClassName="w-3.5 h-3.5 text-gray-400 group-hover/cta:text-white transition-colors duration-200"
                                                    />
                                                );
                                            })()}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : null}

                {/* Inline Event Form */}
                {showEventForm && (
                    <div id="event-form-section" className="mt-12 bg-white rounded-2xl shadow-sm border border-gray-200 p-8 animate-in fade-in slide-in-from-bottom-4 duration-300">

                        <EventForm
                            initialData={editingEvent}
                            onSuccess={handleClose}
                            onCancel={handleClose}
                        />
                    </div>
                )}
            </div>

            {/* Wave Divider */}
            <div className="relative bg-gray-50">
                <svg
                    viewBox="0 0 1440 100"
                    preserveAspectRatio="none"
                    className="w-full"
                    style={{ display: 'block', height: '80px' }}
                >
                    <path
                        d="M0,100 C360,50 720,80 1080,30 C1260,5 1380,20 1440,10 L1440,100 L0,100 Z"
                        fill="#f0f4f0"
                    />
                </svg>
            </div>

            {/* Regular Activities Section */}
            <section className="py-16 pb-64 relative grow" style={{ backgroundColor: '#f0f4f0' }}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center mb-12">
                        <div>
                            <span className="inline-block px-4 py-2 bg-primary-100 text-primary-700 rounded-full text-sm font-medium mb-4">
                                Weekly & Monthly
                            </span>
                            <h2 className="text-2xl font-bold text-gray-900">Regular Activities</h2>
                        </div>
                        {canManageEvents && (
                            <button
                                onClick={handleActivityCreate}
                                className="flex items-center gap-2 bg-white text-primary-600 border border-primary-200 px-4 py-2 rounded-lg hover:bg-primary-50 transition-colors shadow-sm"
                            >
                                <Plus className="w-5 h-5" />
                                Add Activity
                            </button>
                        )}
                    </div>

                    {featuredActivity && (() => {
                        const IconComponent = iconMap[featuredActivity.icon] || Coffee;
                        const theme = colorMap[featuredActivity.color_theme] || colorMap.warm;
                        const isCoffeeMorning = featuredActivity.title.toLowerCase().includes('coffee morning');
                        const featuredActionText = isCoffeeMorning && (!featuredActivity.action_text || featuredActivity.action_text === 'See dates')
                            ? 'See more'
                            : featuredActivity.action_text;
                        const featuredActionLink = isCoffeeMorning && (!featuredActivity.action_link || featuredActivity.action_link === '/contact')
                            ? '/hall/coffee-morning'
                            : featuredActivity.action_link;

                        return (
                            <div className="mb-8 overflow-hidden rounded-2xl border border-primary-100 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
                                <div className="grid gap-0 lg:grid-cols-[1.15fr_0.85fr]">
                                    <div className="relative p-6 sm:p-8">
                                        <div className="absolute inset-x-0 top-0 h-1.5 bg-primary-200" />
                                        <div className="mb-5 flex items-start gap-4">
                                            <div
                                                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border shadow-sm"
                                                style={{
                                                    backgroundColor: theme.bgColor,
                                                    borderColor: theme.borderColor,
                                                    color: theme.iconTextColor
                                                }}
                                            >
                                                <IconComponent className="h-6 w-6" />
                                            </div>

                                            <div className="min-w-0 grow">
                                                <h3 className="text-2xl font-bold leading-tight text-gray-900">
                                                    {featuredActivity.title}
                                                </h3>
                                                <span className="mt-3 inline-flex rounded-full bg-primary-50 px-3 py-1 text-xs font-semibold text-primary-800 ring-1 ring-primary-100">
                                                    Featured monthly event
                                                </span>
                                            </div>

                                            {canManageEvents && (
                                                <div className="flex shrink-0 gap-2">
                                                    <button
                                                        onClick={() => handleActivityEdit(featuredActivity)}
                                                        className="rounded-xl p-2 text-gray-400 transition-all duration-200 hover:bg-primary-50 hover:text-primary-600"
                                                        title="Edit"
                                                    >
                                                        <Edit2 className="h-4 w-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleActivityDeleteClick(featuredActivity)}
                                                        className="rounded-xl p-2 text-gray-400 transition-all duration-200 hover:bg-red-50 hover:text-red-500"
                                                        title="Delete"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            )}
                                        </div>

                                        {featuredActivity.description && (
                                            <p className="max-w-3xl text-lg leading-8 text-gray-600">
                                                {featuredActivity.description}
                                            </p>
                                        )}
                                    </div>

                                    <div className="flex flex-col justify-center gap-4 border-t border-primary-100 bg-primary-50/60 p-6 sm:p-8 lg:border-l lg:border-t-0">
                                        <div className="flex flex-wrap gap-3">
                                            {featuredActivity.schedule && (
                                                <span className="inline-flex items-center rounded-full bg-white px-4 py-2 text-sm font-semibold text-primary-900 shadow-sm ring-1 ring-primary-100">
                                                    {featuredActivity.schedule}
                                                </span>
                                            )}
                                            {featuredActivity.schedule_date && (
                                                <span className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm ring-1 ring-primary-100">
                                                    <Calendar className="h-4 w-4 text-primary-600" />
                                                    {new Date(featuredActivity.schedule_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                                                </span>
                                            )}
                                            {(featuredActivity.start_time || featuredActivity.end_time) && (
                                                <span className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm ring-1 ring-primary-100">
                                                    <Clock className="h-4 w-4 text-primary-600" />
                                                    {formatTime(featuredActivity.start_time)}
                                                    {featuredActivity.end_time && ` - ${formatTime(featuredActivity.end_time)}`}
                                                </span>
                                            )}
                                        </div>

                                        <p className="text-sm leading-6 text-gray-600">
                                            A friendly monthly fixture at the hall, with coffee, cake, and time to catch up with neighbours.
                                        </p>

                                        {featuredActionText && featuredActionLink && (
                                            <a
                                                href={featuredActionLink}
                                                className="inline-flex w-fit items-center justify-center rounded-lg bg-primary-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-primary-700"
                                            >
                                                {featuredActionText}
                                            </a>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })()}

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {regularActivities.length === 0 ? (
                            <p className="text-gray-500 italic text-center py-8 col-span-full">No regular activities listed yet.</p>
                        ) : (
                            otherActivities.map((activity) => {
                                const IconComponent = iconMap[activity.icon] || Coffee;
                                const theme = colorMap[activity.color_theme] || colorMap.sage;

                                return (
                                    <div
                                        key={activity.id}
                                        className="rounded-2xl bg-white border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative group overflow-hidden flex flex-col h-full"
                                    >
                                        {/* Card Content */}
                                        <div className="p-6 flex flex-col h-full">
                                            {/* Top Row: Icon + Title + Admin Controls */}
                                            <div className="flex items-start gap-4 mb-4">
                                                {/* Icon Badge */}
                                                <div
                                                    className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-all duration-300 group-hover:scale-105 border shadow-sm"
                                                    style={{
                                                        backgroundColor: theme.bgColor,
                                                        borderColor: theme.borderColor,
                                                        color: theme.iconTextColor
                                                    }}
                                                >
                                                    <IconComponent className="w-5 h-5" />
                                                </div>

                                                {/* Title */}
                                                <h3 className="text-xl font-bold text-gray-900 leading-tight group-hover:text-primary-600 transition-colors duration-200 grow pt-1">
                                                    {activity.title}
                                                </h3>

                                                {/* Admin Controls */}
                                                {canManageEvents && (
                                                    <div className="flex gap-2 shrink-0">
                                                        <button
                                                            onClick={() => handleActivityEdit(activity)}
                                                            className="p-2 text-gray-400 hover:text-primary-600 hover:bg-gray-50 rounded-xl transition-all duration-200"
                                                            title="Edit"
                                                        >
                                                            <Edit2 className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleActivityDeleteClick(activity)}
                                                            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all duration-200"
                                                            title="Delete"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Content Section */}
                                            <div className="space-y-3 grow">
                                                {/* Description */}
                                                {activity.description && (
                                                    <p className="text-gray-600 leading-relaxed line-clamp-2">
                                                        {activity.description}
                                                    </p>
                                                )}

                                                {/* Schedule Badge */}
                                                {activity.schedule && (
                                                    <span className="inline-flex items-center px-4 py-1 rounded-full text-[11px] font-medium bg-gray-100 text-gray-600 border border-gray-200">
                                                        {activity.schedule}
                                                    </span>
                                                )}
                                            </div>

                                            {/* Bottom Section: Schedule Pills & Action */}
                                            <div className="mt-auto pt-4 space-y-4">
                                                {/* Schedule Info Pills */}
                                                <div className="flex flex-wrap items-center gap-4 text-sm">
                                                    {activity.schedule_date && (
                                                        <div className="flex items-center gap-4 text-gray-600 bg-gray-50 px-4 py-2 rounded-xl border border-gray-100">
                                                            <Calendar className="w-4 h-4 text-primary-500" />
                                                            <span className="font-medium">
                                                                {new Date(activity.schedule_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                                                            </span>
                                                        </div>
                                                    )}
                                                    {(activity.start_time || activity.end_time) && (
                                                        <div className="flex items-center gap-4 text-gray-600 bg-gray-50 px-4 py-2 rounded-xl border border-gray-100">
                                                            <Clock className="w-4 h-4 text-primary-500" />
                                                            <span className="font-medium">
                                                                {formatTime(activity.start_time)}
                                                                {activity.end_time && ` - ${formatTime(activity.end_time)}`}
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>


                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>

                {/* Inline Regular Activity Form */}
                {showActivityForm && (
                    <div id="activity-form-section" className="mt-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
                            <RegularActivityForm
                                initialData={editingActivity}
                                onSuccess={handleActivityClose}
                                onCancel={handleActivityClose}
                            />
                        </div>
                    </div>
                )}
            </section>



            {/* Delete Confirmation Modal (Events) */}
            {deleteConfirmOpen && createPortal(
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center p-4"
                    style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 9999 }}
                >
                    <div
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        onClick={handleDeleteCancel}
                    />
                    <div className="relative bg-white rounded-2xl shadow-2xl p-8 w-80 mx-auto animate-in fade-in zoom-in-95 duration-200 border border-gray-300">
                        {/* Close button */}
                        <button
                            onClick={handleDeleteCancel}
                            className="absolute top-3 right-3 p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            <X className="w-4 h-4" />
                        </button>

                        {/* Icon */}
                        <div className="flex justify-center mb-4">
                            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                                <AlertTriangle className="w-6 h-6 text-red-600" />
                            </div>
                        </div>

                        {/* Content */}
                        <div className="text-center mb-6">
                            <h3 className="text-base font-bold text-gray-900 mb-2">
                                Delete Event?
                            </h3>
                            <p className="text-sm text-gray-600 leading-relaxed">
                                Are you sure you want to delete{' '}
                                <span className="font-semibold text-gray-900">
                                    "{eventToDelete?.title}"
                                </span>
                                ? This action cannot be undone.
                            </p>
                        </div>

                        {/* Actions */}
                        <div className="flex flex-row gap-4">
                            <button
                                onClick={handleDeleteCancel}
                                className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition-colors text-sm"
                                disabled={isDeleting}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDeleteConfirm}
                                style={{ backgroundColor: '#dc2626' }}
                                className="flex-1 px-4 py-3 text-white font-medium rounded-xl hover:opacity-90 transition-colors flex items-center justify-center gap-2 text-sm"
                                disabled={isDeleting}
                            >
                                {isDeleting ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        Deleting...
                                    </>
                                ) : (
                                    <>
                                        <Trash2 className="w-4 h-4" />
                                        Delete
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>,
                document.body
            )}

            {/* Delete Confirmation Modal (Regular Activities) */}
            {deleteActivityConfirmOpen && createPortal(
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center p-4"
                    style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 9999 }}
                >
                    <div
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        onClick={handleDeleteCancel} // Reuse cancel handler if appropriate closes both or create specific
                    />
                    <div className="relative bg-white rounded-2xl shadow-2xl p-8 w-80 mx-auto animate-in fade-in zoom-in-95 duration-200 border border-gray-300">
                        {/* Close button */}
                        <button
                            onClick={handleActivityDeleteCancel}
                            className="absolute top-3 right-3 p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            <X className="w-4 h-4" />
                        </button>

                        <div className="flex justify-center mb-4">
                            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                                <AlertTriangle className="w-6 h-6 text-red-600" />
                            </div>
                        </div>

                        <div className="text-center mb-6">
                            <h3 className="text-base font-bold text-gray-900 mb-2">
                                Delete Activity?
                            </h3>
                            <p className="text-sm text-gray-600 leading-relaxed">
                                Are you sure you want to delete{' '}
                                <span className="font-semibold text-gray-900">
                                    "{activityToDelete?.title}"
                                </span>
                                ? This action cannot be undone.
                            </p>
                        </div>

                        <div className="flex flex-row gap-4">
                            <button
                                onClick={handleActivityDeleteCancel}
                                className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition-colors text-sm"
                                disabled={isDeleting}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleActivityDeleteConfirm}
                                style={{ backgroundColor: '#dc2626' }}
                                className="flex-1 px-4 py-3 text-white font-medium rounded-xl hover:opacity-90 transition-colors flex items-center justify-center gap-2 text-sm"
                                disabled={isDeleting}
                            >
                                {isDeleting ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        Deleting...
                                    </>
                                ) : (
                                    <>
                                        <Trash2 className="w-4 h-4" />
                                        Delete
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </div>
    );
}
