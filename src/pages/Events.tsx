import { useState } from 'react';
import { createPortal } from 'react-dom';
import { useEvents, Event, RegularActivity } from '../context/EventContext';
import { useAuth } from '../context/AuthContext';
import { EventForm } from '../components/events/EventForm';
import { RegularActivityForm } from '../components/events/RegularActivityForm';
import { ActivityCalendar } from '../components/events/ActivityCalendar';
import {
    Calendar, Clock, MapPin, Plus, Edit2, Trash2, AlertTriangle, X,
    Coffee, Palette, Music, Users, Star, BookOpen, Heart, Smile
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

export function Events() {
    const { events, regularActivities, loading, deleteEvent, deleteRegularActivity } = useEvents();
    const { isAdmin } = useAuth();

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
            await deleteEvent(eventToDelete.id);
            setIsDeleting(false);
            setDeleteConfirmOpen(false);
            setEventToDelete(null);
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
            await deleteRegularActivity(activityToDelete.id);
            setIsDeleting(false);
            setDeleteActivityConfirmOpen(false);
            setActivityToDelete(null);
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

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col" >
            {/* Hero Section */}
            <section className="bg-primary-600 text-white py-16 relative">
                <div className="max-w-7xl mx-auto mb-12 mt-4 px-4 sm:px-6 lg:px-8">
                    <h1 className="text-4xl font-bold mb-4">Events Schedule</h1>
                    <p className="text-xl text-primary-100 max-w-2xl">
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
                    <ActivityCalendar />
                </div>

                <div className="flex justify-between items-center mb-12">
                    <h2 className="text-2xl font-bold text-gray-900">Upcoming Events</h2>

                    {isAdmin && (
                        <button
                            onClick={handleCreate}
                            className="flex items-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors"
                        >
                            <Plus className="w-5 h-5" />
                            Add Event
                        </button>
                    )}
                </div>

                {loading ? (
                    <div className="flex justify-center items-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
                    </div>
                ) : events.length === 0 ? (
                    <div className="text-center py-16 bg-white rounded-2xl shadow-sm border border-gray-200">
                        <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No upcoming events</h3>
                        <p className="text-gray-500">Check back soon for updates!</p>
                    </div>
                ) : (
                    <div className="grid gap-6">
                        {events.map((event) => (
                            <div
                                key={event.id}
                                className="group relative bg-white rounded-2xl shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-gray-100 overflow-hidden"
                            >
                                <div className="p-6 md:p-8 flex gap-6 md:gap-8">
                                    {/* Date Side - Always on left */}
                                    <div className="flex-shrink-0">
                                        <div className="w-16 h-16 md:w-20 md:h-20 bg-primary-50 rounded-2xl flex flex-col items-center justify-center border border-primary-100 group-hover:bg-primary-600 group-hover:border-primary-600 transition-colors duration-300 shadow-sm">
                                            <span className="text-xl md:text-2xl font-bold text-primary-600 group-hover:text-white transition-colors duration-300">
                                                {new Date(event.date).toLocaleDateString('en-GB', { day: 'numeric' })}
                                            </span>
                                            <span className="text-xs md:text-sm font-bold uppercase tracking-wider text-primary-400 group-hover:text-primary-100 transition-colors duration-300">
                                                {new Date(event.date).toLocaleDateString('en-GB', { month: 'short' })}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Content Side */}
                                    <div className="flex-grow min-w-0">
                                        <div className="flex justify-between items-center gap-4">
                                            <h3 className="text-2xl font-bold text-gray-900 leading-tight group-hover:text-primary-600 transition-colors duration-200">
                                                {event.title}
                                            </h3>

                                            <div className="flex items-center gap-2 flex-shrink-0">
                                                <span className="inline-flex items-center px-4 py-2 rounded-full text-xs font-semibold bg-primary-100 text-primary-800 tracking-wide uppercase">
                                                    {event.type || 'Event'}
                                                </span>

                                                {/* Admin Actions */}
                                                {isAdmin && (
                                                    <>
                                                        <button
                                                            onClick={() => handleEdit(event)}
                                                            className="p-2 text-gray-400 hover:text-primary-600 hover:bg-gray-50 rounded-xl transition-all duration-200"
                                                            title="Edit"
                                                        >
                                                            <Edit2 className="w-5 h-5" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteClick(event)}
                                                            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all duration-200"
                                                            title="Delete"
                                                        >
                                                            <Trash2 className="w-5 h-5" />
                                                        </button>
                                                    </>
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
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

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
            <section className="py-16 pb-64 relative flex-grow" style={{ backgroundColor: '#f0f4f0' }}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center mb-12">
                        <div>
                            <span className="inline-block px-4 py-2 bg-primary-100 text-primary-700 rounded-full text-sm font-medium mb-4">
                                Weekly & Monthly
                            </span>
                            <h2 className="text-2xl font-bold text-gray-900">Regular Activities</h2>
                        </div>
                        {isAdmin && (
                            <button
                                onClick={handleActivityCreate}
                                className="flex items-center gap-2 bg-white text-primary-600 border border-primary-200 px-4 py-2 rounded-lg hover:bg-primary-50 transition-colors shadow-sm"
                            >
                                <Plus className="w-5 h-5" />
                                Add Activity
                            </button>
                        )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {regularActivities.length === 0 ? (
                            <p className="text-gray-500 italic text-center py-8 col-span-full">No regular activities listed yet.</p>
                        ) : (
                            regularActivities.map((activity, index) => {
                                const IconComponent = iconMap[activity.icon] || Coffee;
                                const theme = colorMap[activity.color_theme] || colorMap.sage;

                                // Check if this is the last item and alone in its row
                                const totalItems = regularActivities.length;
                                const isLastItem = index === totalItems - 1;
                                const remainder = totalItems % 3; // Based on lg:grid-cols-3
                                const isAloneInRow = isLastItem && remainder === 1;

                                return (
                                    <div
                                        key={activity.id}
                                        className={`rounded-2xl bg-white border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative group overflow-hidden flex flex-col ${isAloneInRow ? 'md:col-span-2 lg:col-span-3' : 'aspect-square'}`}
                                    >
                                        {/* Card Content */}
                                        <div className="p-6 flex flex-col h-full">
                                            {/* Top Row: Icon + Title + Admin Controls */}
                                            <div className="flex items-start gap-4 mb-4">
                                                {/* Icon Badge */}
                                                <div
                                                    className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-300 group-hover:scale-105 border shadow-sm"
                                                    style={{
                                                        backgroundColor: theme.bgColor,
                                                        borderColor: theme.borderColor,
                                                        color: theme.iconTextColor
                                                    }}
                                                >
                                                    <IconComponent className="w-5 h-5" />
                                                </div>

                                                {/* Title */}
                                                <h3 className="text-xl font-bold text-gray-900 leading-tight group-hover:text-primary-600 transition-colors duration-200 flex-grow pt-1">
                                                    {activity.title}
                                                </h3>

                                                {/* Admin Controls */}
                                                {isAdmin && (
                                                    <div className="flex gap-2 flex-shrink-0">
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
                                            <div className="space-y-3 flex-grow">
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
