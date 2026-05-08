import React, { useState } from 'react';
import { useEvents, RegularActivity } from '../../context/EventContext';
import { X, Coffee, Palette, Music, Users, Star, BookOpen, Heart, Smile } from 'lucide-react';

type RegularActivityFormProps = {
    initialData?: RegularActivity;
    onSuccess: () => void;
    onCancel: () => void;
};

export function RegularActivityForm({ initialData, onSuccess, onCancel }: RegularActivityFormProps) {
    const { addRegularActivity, updateRegularActivity } = useEvents();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        title: initialData?.title || '',
        description: initialData?.description || '',
        icon: initialData?.icon || 'Coffee',
        schedule: initialData?.schedule || '',
        schedule_date: initialData?.schedule_date || '',
        start_time: initialData?.start_time || '',
        end_time: initialData?.end_time || '',
        color_theme: initialData?.color_theme || 'sage',
        action_type: initialData?.action_type || 'none',
        action_text: initialData?.action_text || '',
        action_link: initialData?.action_link || '',
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            // Convert empty strings to null for optional fields to satisfy database constraints
            const submitData = {
                title: formData.title,
                description: formData.description || null,
                icon: formData.icon,
                schedule: formData.schedule || null,
                schedule_date: formData.schedule_date || null,
                start_time: formData.start_time || null,
                end_time: formData.end_time || null,
                color_theme: formData.color_theme,
                action_type: formData.action_type,
                action_text: formData.action_type !== 'none' ? (formData.action_text || null) : null,
                action_link: (formData.action_type === 'button' || formData.action_type === 'link') ? (formData.action_link || null) : null,
            };

            if (initialData) {
                await updateRegularActivity(initialData.id, submitData);
            } else {
                await addRegularActivity(submitData);
            }
            onSuccess();
        } catch (err) {
            setError('Failed to save activity. Please try again.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const inputClasses = "w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-gray-50 text-gray-900";
    const selectClasses = "w-full pl-4 pr-10 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-gray-50 text-gray-900";
    const labelClasses = "block text-sm font-medium text-gray-700 mb-2";

    const icons = [
        { value: 'Coffee', label: 'Coffee Cup', icon: Coffee },
        { value: 'Palette', label: 'Palette', icon: Palette },
        { value: 'Music', label: 'Music Note', icon: Music },
        { value: 'Users', label: 'Users Group', icon: Users },
        { value: 'Star', label: 'Star', icon: Star },
        { value: 'BookOpen', label: 'Book', icon: BookOpen },
        { value: 'Heart', label: 'Heart', icon: Heart },
        { value: 'Smile', label: 'Smile', icon: Smile },
    ];

    const colors = [
        { value: 'forest', label: 'Forest Green', class: 'bg-green-700' },
        { value: 'sage', label: 'Sage', class: 'bg-green-400' },
        { value: 'olive', label: 'Olive', class: 'bg-lime-600' },
        { value: 'moss', label: 'Moss', class: 'bg-green-600' },
        { value: 'stone', label: 'Stone', class: 'bg-gray-400' },
        { value: 'slate', label: 'Slate', class: 'bg-slate-500' },
        { value: 'charcoal', label: 'Charcoal', class: 'bg-zinc-600' },
        { value: 'warm', label: 'Warm Gray', class: 'bg-stone-400' },
    ];

    return (
        <form onSubmit={handleSubmit} className="space-y-5">
            <div className="flex justify-between items-center pb-4 border-b border-gray-200">
                <h3 className="text-xl font-bold text-gray-900">
                    {initialData ? 'Edit Regular Activity' : 'Add Regular Activity'}
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
                <label htmlFor="title" className={labelClasses}>
                    Activity Title *
                </label>
                <input
                    type="text"
                    id="title"
                    name="title"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g. Village Coffee Mornings"
                    className={inputClasses}
                />
            </div>

            <div>
                <label htmlFor="description" className={labelClasses}>
                    Description
                </label>
                <textarea
                    id="description"
                    name="description"
                    rows={3}
                    value={formData.description || ''}
                    onChange={(e) =>
                        setFormData({ ...formData, description: e.target.value })
                    }
                    placeholder="Brief description of the activity"
                    className={inputClasses}
                />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                <div>
                    <label htmlFor="icon" className={labelClasses}>
                        Icon
                    </label>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem' }}>
                        {icons.map((item) => {
                            const IconComp = item.icon;
                            return (
                                <button
                                    key={item.value}
                                    type="button"
                                    onClick={() => setFormData({ ...formData, icon: item.value })}
                                    className={`px-2 py-4 rounded-lg border flex flex-col items-center justify-center gap-1 transition-all ${formData.icon === item.value
                                        ? 'border-primary-500 bg-primary-50 text-primary-600'
                                        : 'border-gray-200 hover:bg-gray-50 text-gray-600'
                                        }`}
                                    title={item.label}
                                >
                                    <IconComp className="w-5 h-5" />
                                </button>
                            );
                        })}
                    </div>
                </div>

                <div>
                    <label htmlFor="color_theme" className={labelClasses}>
                        Colour Theme
                    </label>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem' }}>
                        {colors.map((color) => (
                            <button
                                key={color.value}
                                type="button"
                                onClick={() => setFormData({ ...formData, color_theme: color.value })}
                                className={`px-2 py-4 rounded-lg border flex flex-col items-center justify-center gap-1 transition-all ${formData.color_theme === color.value
                                    ? 'border-primary-500 bg-primary-50 text-primary-600'
                                    : 'border-gray-200 hover:bg-gray-50 text-gray-600'
                                    }`}
                                title={color.label}
                            >
                                <span className="text-xs font-medium capitalize">{color.value}</span>
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: '1rem' }}>
                <div>
                    <label htmlFor="schedule" className={labelClasses}>
                        Schedule Text
                    </label>
                    <input
                        type="text"
                        id="schedule"
                        name="schedule"
                        value={formData.schedule || ''}
                        onChange={(e) => setFormData({ ...formData, schedule: e.target.value })}
                        placeholder="e.g. First Saturday, 10:30 - 12:30"
                        className={inputClasses}
                    />
                </div>
                <div>
                    <label htmlFor="schedule_date" className={labelClasses}>
                        Date
                    </label>
                    <input
                        type="date"
                        id="schedule_date"
                        name="schedule_date"
                        value={formData.schedule_date || ''}
                        onChange={(e) => setFormData({ ...formData, schedule_date: e.target.value })}
                        className={inputClasses}
                    />
                </div>
                <div>
                    <label htmlFor="start_time" className={labelClasses}>
                        Start Time
                    </label>
                    <input
                        type="time"
                        id="start_time"
                        name="start_time"
                        value={formData.start_time || ''}
                        onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                        className={inputClasses}
                    />
                </div>
                <div>
                    <label htmlFor="end_time" className={labelClasses}>
                        End Time
                    </label>
                    <input
                        type="time"
                        id="end_time"
                        name="end_time"
                        value={formData.end_time || ''}
                        onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                        className={inputClasses}
                    />
                </div>
            </div>

            <div className="border-t border-gray-200 pt-4 mt-2">
                <h4 className="text-sm font-semibold text-gray-900 mt-4 mb-4">Call to Action (Optional)</h4>

                <div className="mb-4">
                    <label htmlFor="action_type" className={labelClasses}>
                        Action Type
                    </label>
                    <select
                        id="action_type"
                        name="action_type"
                        value={formData.action_type || 'none'}
                        onChange={(e) => setFormData({ ...formData, action_type: e.target.value })}
                        className={selectClasses}
                    >
                        <option value="none">None</option>
                        <option value="text">Just Text (non-clickable)</option>
                        <option value="button">Button</option>
                        <option value="link">Text Link</option>
                    </select>
                </div>

                {formData.action_type !== 'none' && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="action_text" className={labelClasses}>
                                Action Label
                            </label>
                            <input
                                type="text"
                                id="action_text"
                                name="action_text"
                                value={formData.action_text || ''}
                                onChange={(e) => setFormData({ ...formData, action_text: e.target.value })}
                                placeholder="e.g. Learn More"
                                className={inputClasses}
                            />
                        </div>
                        {(formData.action_type === 'button' || formData.action_type === 'link') && (
                            <div>
                                <label htmlFor="action_link" className={labelClasses}>
                                    Link URL
                                </label>
                                <input
                                    type="text"
                                    id="action_link"
                                    name="action_link"
                                    value={formData.action_link || ''}
                                    onChange={(e) => setFormData({ ...formData, action_link: e.target.value })}
                                    placeholder="https://..."
                                    className={inputClasses}
                                />
                            </div>
                        )}
                    </div>
                )}
            </div>

            <div className="pt-8 pb-4 flex justify-center gap-6 border-t border-gray-200 mt-4">
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
                    {loading ? 'Saving...' : initialData ? 'Update Activity' : 'Create Activity'}
                </button>
            </div>
        </form>
    );
}
