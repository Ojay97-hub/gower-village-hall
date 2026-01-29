import { useState } from 'react';
import { useEvents, Event } from '../../context/EventContext';
import { X } from 'lucide-react';

type EventFormProps = {
    initialData?: Event;
    onSuccess: () => void;
    onCancel: () => void;
};

export function EventForm({ initialData, onSuccess, onCancel }: EventFormProps) {
    const { addEvent, updateEvent } = useEvents();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        title: initialData?.title || '',
        description: initialData?.description || '',
        date: initialData?.date || '',
        start_time: initialData?.start_time || '',
        end_time: initialData?.end_time || '',
        location: initialData?.location || 'Village Hall',
        type: initialData?.type || 'Community',
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            if (initialData) {
                await updateEvent(initialData.id, formData);
            } else {
                await addEvent(formData);
            }
            onSuccess();
        } catch (err) {
            setError('Failed to save event. Please try again.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const inputClasses = "w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-gray-50 text-gray-900";
    const labelClasses = "block text-sm font-medium text-gray-700 mb-2";

    return (
        <form onSubmit={handleSubmit} className="space-y-5">
            <div className="flex justify-between items-center pb-4 border-b border-gray-200">
                <h3 className="text-xl font-bold text-gray-900">
                    {initialData ? 'Edit Event' : 'Add New Event'}
                </h3>
                <button
                    type="button"
                    onClick={onCancel}
                    className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100 transition-colors"
                >
                    <X className="w-6 h-6" />
                </button>
            </div>

            {error && (
                <div className="bg-red-50 text-red-600 p-4 rounded-lg text-sm border border-red-200">
                    {error}
                </div>
            )}

            <div>
                <label className={labelClasses}>
                    Event Title *
                </label>
                <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Enter event title"
                    className={inputClasses}
                />
            </div>

            <div>
                <label className={labelClasses}>
                    Description
                </label>
                <textarea
                    rows={3}
                    value={formData.description || ''}
                    onChange={(e) =>
                        setFormData({ ...formData, description: e.target.value })
                    }
                    placeholder="Brief description of the event"
                    className={inputClasses}
                />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                    <label className={labelClasses}>
                        Date *
                    </label>
                    <input
                        type="date"
                        required
                        value={formData.date}
                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                        className={inputClasses}
                    />
                </div>
                <div>
                    <label className={labelClasses}>
                        Type
                    </label>
                    <select
                        value={formData.type || 'Community'}
                        onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                        className={inputClasses}
                    >
                        <option value="Community">Community</option>
                        <option value="Private">Private</option>
                        <option value="Fundraiser">Fundraiser</option>
                        <option value="Class">Class</option>
                    </select>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                    <label className={labelClasses}>
                        Start Time
                    </label>
                    <input
                        type="time"
                        value={formData.start_time || ''}
                        onChange={(e) =>
                            setFormData({ ...formData, start_time: e.target.value })
                        }
                        className={inputClasses}
                    />
                </div>
                <div>
                    <label className={labelClasses}>
                        End Time
                    </label>
                    <input
                        type="time"
                        value={formData.end_time || ''}
                        onChange={(e) =>
                            setFormData({ ...formData, end_time: e.target.value })
                        }
                        className={inputClasses}
                    />
                </div>
            </div>



            <div className="pt-8 pb-4 flex justify-center gap-6 border-t border-gray-200 mt-8">
                <button
                    type="button"
                    onClick={onCancel}
                    className="px-8 py-3 text-base font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    disabled={loading}
                    className="px-8 py-3 text-base font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-lg transition-colors disabled:opacity-50 shadow-md hover:shadow-lg transform transition-all active:scale-95"
                >
                    {loading ? 'Saving...' : initialData ? 'Update Event' : 'Create Event'}
                </button>
            </div>
        </form>
    );
}
