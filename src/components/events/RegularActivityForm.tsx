import React, { useState, useMemo } from 'react';
import { useEvents, RegularActivity } from '../../context/EventContext';
import { X, Coffee, Palette, Music, Users, Star, BookOpen, Heart, Smile } from 'lucide-react';
import {
    describeRecurrence,
    getNextOccurrence,
    parseISODateLocal,
    RecurringSchedulable,
    WEEKDAY_NAMES,
} from '../../lib/recurrence';

type RegularActivityFormProps = {
    initialData?: RegularActivity;
    onSuccess: () => void;
    onCancel: () => void;
};

type RecurrenceMode = 'weekly' | 'fortnightly' | 'monthly' | 'one_off' | 'none';

const RECURRING_MODES: RecurrenceMode[] = ['weekly', 'fortnightly', 'monthly'];

// Ordered Monday-first for the day picker
const DAY_OPTIONS = [1, 2, 3, 4, 5, 6, 0];

const WEEK_OPTIONS = [
    { value: 1, label: 'First' },
    { value: 2, label: 'Second' },
    { value: 3, label: 'Third' },
    { value: 4, label: 'Fourth' },
    { value: -1, label: 'Last' },
];

export function RegularActivityForm({ initialData, onSuccess, onCancel }: RegularActivityFormProps) {
    const { addRegularActivity, updateRegularActivity } = useEvents();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const initialMode: RecurrenceMode =
        initialData?.recurrence_type && initialData.recurrence_type !== 'none'
            ? initialData.recurrence_type
            : initialData?.schedule_date
                ? 'one_off'
                : initialData
                    ? 'none'
                    : 'weekly';

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
        feature_description: initialData?.feature_description || '',
        is_featured: initialData?.is_featured || false,
        recurrence_mode: initialMode,
        recurrence_day: initialData?.recurrence_day ?? 6,
        recurrence_week: initialData?.recurrence_week ?? 1,
        recurrence_start_date: initialData?.recurrence_start_date || '',
        recurrence_end_date: initialData?.recurrence_end_date || '',
    });

    const isRecurring = RECURRING_MODES.includes(formData.recurrence_mode);

    // Build the recurrence fields as they would be saved, so the same object
    // drives the description, the preview, and the submit payload.
    const buildRecurrence = (data: typeof formData): RecurringSchedulable => {
        const mode = data.recurrence_mode;
        const recurring = RECURRING_MODES.includes(mode);
        const fortnightDay = data.recurrence_start_date
            ? parseISODateLocal(data.recurrence_start_date).getDay()
            : null;
        return {
            schedule: null,
            schedule_date: mode === 'one_off' ? (data.schedule_date || null) : null,
            recurrence_type: recurring ? (mode as 'weekly' | 'fortnightly' | 'monthly') : 'none',
            recurrence_day: !recurring
                ? null
                : mode === 'fortnightly'
                    ? fortnightDay
                    : data.recurrence_day,
            recurrence_week: mode === 'monthly' ? data.recurrence_week : null,
            recurrence_start_date: recurring ? (data.recurrence_start_date || null) : null,
            recurrence_end_date: recurring ? (data.recurrence_end_date || null) : null,
        };
    };

    // Update a scheduling field and regenerate the display text to match.
    const applyRecurrenceChange = (patch: Partial<typeof formData>) => {
        setFormData(prev => {
            const next = { ...prev, ...patch };
            if (RECURRING_MODES.includes(next.recurrence_mode)) {
                const description = describeRecurrence(buildRecurrence(next));
                if (description) next.schedule = description;
            }
            return next;
        });
    };

    const upcomingDates = useMemo(() => {
        if (!isRecurring) return [];
        const recurrence = buildRecurrence(formData);
        if (formData.recurrence_mode === 'fortnightly' && !formData.recurrence_start_date) return [];
        const dates: Date[] = [];
        let from = new Date();
        for (let i = 0; i < 3; i++) {
            const next = getNextOccurrence(recurrence, from);
            if (!next) break;
            dates.push(next);
            from = new Date(next);
            from.setDate(from.getDate() + 1);
        }
        return dates;
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [formData.recurrence_mode, formData.recurrence_day, formData.recurrence_week, formData.recurrence_start_date, formData.recurrence_end_date, isRecurring]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (formData.recurrence_mode === 'fortnightly' && !formData.recurrence_start_date) {
            setError('Fortnightly activities need a first session date so we know which weeks they fall on.');
            return;
        }
        if (formData.recurrence_mode === 'one_off' && !formData.schedule_date) {
            setError('Please choose a date for this one-off activity.');
            return;
        }

        setLoading(true);

        try {
            const recurrence = buildRecurrence(formData);

            // Convert empty strings to null for optional fields to satisfy database constraints
            const submitData = {
                title: formData.title,
                description: formData.description || null,
                icon: formData.icon,
                schedule: formData.schedule || null,
                schedule_date: recurrence.schedule_date ?? null,
                start_time: formData.start_time || null,
                end_time: formData.end_time || null,
                color_theme: formData.color_theme,
                action_type: formData.action_type,
                action_text: formData.action_type !== 'none' ? (formData.action_text || null) : null,
                action_link: (formData.action_type === 'button' || formData.action_type === 'link') ? (formData.action_link || null) : null,
                feature_description: formData.feature_description || null,
                is_featured: formData.is_featured,
                recurrence_type: recurrence.recurrence_type ?? 'none',
                recurrence_day: recurrence.recurrence_day ?? null,
                recurrence_week: recurrence.recurrence_week ?? null,
                recurrence_start_date: recurrence.recurrence_start_date ?? null,
                recurrence_end_date: recurrence.recurrence_end_date ?? null,
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

            <div className="border-t border-gray-200 pt-4 mt-2">
                <h4 className="text-sm font-semibold text-gray-900 mt-4 mb-4">Schedule</h4>

                <div className="mb-4">
                    <label htmlFor="recurrence_mode" className={labelClasses}>
                        Repeats
                    </label>
                    <select
                        id="recurrence_mode"
                        name="recurrence_mode"
                        value={formData.recurrence_mode}
                        onChange={(e) => applyRecurrenceChange({ recurrence_mode: e.target.value as RecurrenceMode })}
                        className={selectClasses}
                    >
                        <option value="weekly">Weekly</option>
                        <option value="fortnightly">Fortnightly (every 2 weeks)</option>
                        <option value="monthly">Monthly (e.g. first Saturday)</option>
                        <option value="one_off">One-off date</option>
                        <option value="none">No set date (text only)</option>
                    </select>
                </div>

                {formData.recurrence_mode === 'one_off' && (
                    <div className="mb-4">
                        <label htmlFor="schedule_date" className={labelClasses}>
                            Date *
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
                )}

                {(formData.recurrence_mode === 'weekly' || formData.recurrence_mode === 'monthly') && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                        {formData.recurrence_mode === 'monthly' && (
                            <div>
                                <label htmlFor="recurrence_week" className={labelClasses}>
                                    Which week of the month
                                </label>
                                <select
                                    id="recurrence_week"
                                    value={formData.recurrence_week}
                                    onChange={(e) => applyRecurrenceChange({ recurrence_week: Number(e.target.value) })}
                                    className={selectClasses}
                                >
                                    {WEEK_OPTIONS.map(opt => (
                                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                                    ))}
                                </select>
                            </div>
                        )}
                        <div>
                            <label htmlFor="recurrence_day" className={labelClasses}>
                                Day of the week
                            </label>
                            <select
                                id="recurrence_day"
                                value={formData.recurrence_day}
                                onChange={(e) => applyRecurrenceChange({ recurrence_day: Number(e.target.value) })}
                                className={selectClasses}
                            >
                                {DAY_OPTIONS.map(dow => (
                                    <option key={dow} value={dow}>{WEEKDAY_NAMES[dow]}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label htmlFor="recurrence_start_date" className={labelClasses}>
                                Starts from
                                <span className="ml-1 font-normal text-gray-400">(optional)</span>
                            </label>
                            <input
                                type="date"
                                id="recurrence_start_date"
                                value={formData.recurrence_start_date}
                                onChange={(e) => applyRecurrenceChange({ recurrence_start_date: e.target.value })}
                                className={inputClasses}
                            />
                        </div>
                    </div>
                )}

                {formData.recurrence_mode === 'fortnightly' && (
                    <div className="mb-4">
                        <label htmlFor="recurrence_start_date" className={labelClasses}>
                            First session date *
                        </label>
                        <input
                            type="date"
                            id="recurrence_start_date"
                            value={formData.recurrence_start_date}
                            onChange={(e) => applyRecurrenceChange({ recurrence_start_date: e.target.value })}
                            className={inputClasses}
                        />
                        <p className="mt-2 text-xs text-gray-500">
                            The activity repeats every 2 weeks on the same day as this date.
                        </p>
                    </div>
                )}

                {isRecurring && (
                    <div className="mb-4">
                        <label htmlFor="recurrence_end_date" className={labelClasses}>
                            Ends on
                            <span className="ml-1 font-normal text-gray-400">(optional — leave blank if ongoing)</span>
                        </label>
                        <input
                            type="date"
                            id="recurrence_end_date"
                            value={formData.recurrence_end_date}
                            onChange={(e) => applyRecurrenceChange({ recurrence_end_date: e.target.value })}
                            className={inputClasses}
                        />
                    </div>
                )}

                <div className="grid grid-cols-2 gap-4 mb-4">
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

                <div>
                    <label htmlFor="schedule" className={labelClasses}>
                        Schedule text shown on cards
                        <span className="ml-1 font-normal text-gray-400">(auto-filled — edit if you like)</span>
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

                {isRecurring && upcomingDates.length > 0 && (
                    <div className="mt-4 rounded-lg bg-primary-50 border border-primary-100 p-3">
                        <p className="text-xs font-semibold text-primary-700 mb-1">Next dates</p>
                        <p className="text-sm text-primary-800">
                            {upcomingDates
                                .map(d => d.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' }))
                                .join('  ·  ')}
                        </p>
                        <p className="mt-1 text-xs text-primary-600">
                            These dates appear on the activity calendar and block matching sessions on the hall booking calendar.
                        </p>
                    </div>
                )}
            </div>

            <div className="border-t border-gray-200 pt-4 mt-2">
                <h4 className="text-sm font-semibold text-gray-900 mt-4 mb-4">Display Options</h4>

                <label className="flex items-start gap-3 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700">
                    <input
                        type="checkbox"
                        checked={formData.is_featured}
                        onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
                        className="mt-1 h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    />
                    <span>
                        <span className="block font-medium text-gray-900">Feature this activity</span>
                        <span className="mt-1 block text-gray-600">
                            Shows this activity as the large highlighted card above the regular activity grid.
                        </span>
                    </span>
                </label>

                {formData.is_featured && (
                    <div className="mt-4">
                        <label htmlFor="feature_description" className={labelClasses}>
                            Featured Card Description
                            <span className="ml-1 font-normal text-gray-400">(shown in the right panel of the featured card)</span>
                        </label>
                        <textarea
                            id="feature_description"
                            name="feature_description"
                            rows={3}
                            value={formData.feature_description || ''}
                            onChange={(e) => setFormData({ ...formData, feature_description: e.target.value })}
                            placeholder="A short description shown alongside the schedule details..."
                            className={inputClasses}
                        />
                    </div>
                )}
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
                        <option value="link">Add a link</option>
                    </select>
                </div>

                {formData.action_type !== 'none' && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="action_text" className={labelClasses}>
                                Button Label
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
                    className="px-8 py-3 text-base font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-lg transition-all disabled:opacity-50 shadow-md hover:shadow-lg transform active:scale-95"
                >
                    {loading ? 'Saving...' : initialData ? 'Update Activity' : 'Create Activity'}
                </button>
            </div>
        </form>
    );
}
