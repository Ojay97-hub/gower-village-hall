import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useEvents, Event } from '../context/EventContext';
import { useAuth } from '../context/AuthContext';
import { EventForm } from '../components/events/EventForm';
import { Calendar, Clock, MapPin, Plus, Edit2, Trash2, LogIn, AlertTriangle, X } from 'lucide-react';

export function Events() {
    const { events, loading, deleteEvent } = useEvents();
    const { isAdmin } = useAuth();
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingEvent, setEditingEvent] = useState<Event | undefined>(undefined);
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    const [eventToDelete, setEventToDelete] = useState<Event | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const handleEdit = (event: Event) => {
        setEditingEvent(event);
        setIsDialogOpen(true);
    };

    const handleCreate = () => {
        setEditingEvent(undefined);
        setIsDialogOpen(true);
    };

    const handleClose = () => {
        setIsDialogOpen(false);
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

    const formatTime = (timeString: string | null) => {
        if (!timeString) return '';
        return timeString.substring(0, 5);
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Hero Section */}
            <section className="bg-primary-600 text-white py-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h1 className="text-4xl font-bold mb-4">Events Schedule</h1>
                    <p className="text-xl text-primary-100 max-w-2xl">
                        See what's happening at the village hall. Join us for community gatherings,
                        classes, and special events.
                    </p>
                </div>
            </section>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <div className="flex justify-between items-center mb-12">
                    <h2 className="text-2xl font-bold text-gray-900">Upcoming Events</h2>

                    {isAdmin ? (
                        <button
                            onClick={handleCreate}
                            className="flex items-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors"
                        >
                            <Plus className="w-5 h-5" />
                            Add Event
                        </button>
                    ) : (
                        <Link
                            to="/admin/login"
                            className="flex items-center gap-2 text-primary-600 hover:text-primary-700 transition-colors"
                        >
                            <LogIn className="w-5 h-5" />
                            Admin Login
                        </Link>
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
                                        <div className="flex justify-between items-start gap-4">
                                            <div className="space-y-2">
                                                <span className="inline-flex items-center px-4 py-1 rounded-full text-xs font-semibold bg-primary-100 text-primary-800 tracking-wide uppercase">
                                                    {event.type || 'Event'}
                                                </span>
                                                <h3 className="text-2xl font-bold text-gray-900 leading-tight group-hover:text-primary-600 transition-colors duration-200">
                                                    {event.title}
                                                </h3>
                                            </div>

                                            {/* Admin Actions */}
                                            {isAdmin && (
                                                <div className="flex gap-2">
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
                                                </div>
                                            )}
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
            </div>

            {/* Modal */}
            {isDialogOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div
                        className="absolute inset-0 bg-black/50"
                        onClick={handleClose}
                    />
                    <div className="relative bg-white rounded-2xl shadow-2xl p-8 w-full max-w-7xl max-h-[90vh] overflow-y-auto">
                        <EventForm
                            initialData={editingEvent}
                            onSuccess={handleClose}
                            onCancel={handleClose}
                        />
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {deleteConfirmOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        onClick={handleDeleteCancel}
                    />
                    <div className="relative bg-white rounded-2xl shadow-2xl p-8 w-80 mx-auto">
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
                </div>
            )}
        </div>
    );
}
