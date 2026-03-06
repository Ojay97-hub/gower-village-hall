import { useState, useMemo } from 'react';
import { DayPicker } from 'react-day-picker';
import { useEvents } from '../../context/EventContext';
import { Clock, Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { Coffee, Palette, Music, Users, Star, BookOpen, Heart, Smile } from 'lucide-react';
import 'react-day-picker/dist/style.css';
import './ActivityCalendar.css';

// Icon mapping helper
const iconMap: Record<string, React.ElementType> = {
    Coffee, Palette, Music, Users, Star, BookOpen, Heart, Smile
};

// Color theme mapping - reusing from Events.tsx
const colorMap: Record<string, {
    bgColor: string,
    textColor: string,
    borderColor: string,
    dotColor: string,
}> = {
    forest: { bgColor: '#dcfce7', textColor: '#14532d', borderColor: '#166534', dotColor: '#16a34a' },
    sage: { bgColor: '#f0fdf4', textColor: '#166534', borderColor: '#22c55e', dotColor: '#22c55e' },
    olive: { bgColor: '#ecfccb', textColor: '#365314', borderColor: '#65a30d', dotColor: '#84cc16' },
    moss: { bgColor: '#ccfbf1', textColor: '#134e4a', borderColor: '#0d9488', dotColor: '#14b8a6' },
    stone: { bgColor: '#f5f5f4', textColor: '#292524', borderColor: '#78716c', dotColor: '#78716c' },
    slate: { bgColor: '#f1f5f9', textColor: '#1e293b', borderColor: '#475569', dotColor: '#64748b' },
    charcoal: { bgColor: '#fafafa', textColor: '#18181b', borderColor: '#3f3f46', dotColor: '#52525b' },
    warm: { bgColor: '#fef3c7', textColor: '#78350f', borderColor: '#b45309', dotColor: '#f59e0b' },
};

// Event color (for one-time events)
const eventColor = { bgColor: '#eff6ff', textColor: '#1e40af', borderColor: '#3b82f6', dotColor: '#3b82f6' };

interface CalendarItem {
    id: string;
    title: string;
    type: 'event' | 'activity';
    date: Date;
    startTime: string | null;
    endTime: string | null;
    description: string | null;
    schedule?: string | null;
    icon?: string;
    colorTheme: string;
}

// Day of week mapping
const dayOfWeekMap: Record<string, number> = {
    'sunday': 0, 'sundays': 0,
    'monday': 1, 'mondays': 1,
    'tuesday': 2, 'tuesdays': 2,
    'wednesday': 3, 'wednesdays': 3,
    'thursday': 4, 'thursdays': 4,
    'friday': 5, 'fridays': 5,
    'saturday': 6, 'saturdays': 6,
};

// Ordinal mapping for "first", "second", etc.
const ordinalMap: Record<string, number> = {
    'first': 1, '1st': 1,
    'second': 2, '2nd': 2,
    'third': 3, '3rd': 3,
    'fourth': 4, '4th': 4,
    'last': -1,
};

// Parse time from schedule string (e.g., "10am", "2pm", "10:30am")
function parseTimeFromSchedule(schedule: string): string | null {
    const timeMatch = schedule.match(/(\d{1,2})(?::(\d{2}))?\s*(am|pm)/i);
    if (timeMatch) {
        let hours = parseInt(timeMatch[1]);
        const minutes = timeMatch[2] || '00';
        const period = timeMatch[3].toLowerCase();

        if (period === 'pm' && hours !== 12) hours += 12;
        if (period === 'am' && hours === 12) hours = 0;

        return `${hours.toString().padStart(2, '0')}:${minutes}`;
    }
    return null;
}

// Get all occurrences of a day of week in a month
function getDayOccurrencesInMonth(year: number, month: number, dayOfWeek: number): Date[] {
    const dates: Date[] = [];
    const date = new Date(year, month, 1);

    // Find first occurrence
    while (date.getDay() !== dayOfWeek) {
        date.setDate(date.getDate() + 1);
    }

    // Get all occurrences
    while (date.getMonth() === month) {
        dates.push(new Date(date));
        date.setDate(date.getDate() + 7);
    }

    return dates;
}

// Get the nth occurrence of a day in a month
function getNthDayOfMonth(year: number, month: number, dayOfWeek: number, n: number): Date | null {
    const occurrences = getDayOccurrencesInMonth(year, month, dayOfWeek);

    if (n === -1) {
        // Last occurrence
        return occurrences[occurrences.length - 1] || null;
    }

    return occurrences[n - 1] || null;
}

// Generate dates for a recurring activity in a given month
function generateRecurringDates(schedule: string, year: number, month: number): Date[] {
    const scheduleLower = schedule.toLowerCase();
    const dates: Date[] = [];

    // Check for ordinal patterns first (e.g., "First Saturday", "Last Wednesday")
    for (const [ordinalWord, ordinalNum] of Object.entries(ordinalMap)) {
        if (scheduleLower.includes(ordinalWord)) {
            for (const [dayWord, dayNum] of Object.entries(dayOfWeekMap)) {
                if (scheduleLower.includes(dayWord)) {
                    const date = getNthDayOfMonth(year, month, dayNum, ordinalNum);
                    if (date) dates.push(date);
                    return dates;
                }
            }
        }
    }

    // Check for weekly patterns (e.g., "Thursdays", "Every Thursday")
    for (const [dayWord, dayNum] of Object.entries(dayOfWeekMap)) {
        if (scheduleLower.includes(dayWord)) {
            return getDayOccurrencesInMonth(year, month, dayNum);
        }
    }

    return dates;
}

export function ActivityCalendar() {
    const { events, regularActivities, loading } = useEvents();
    const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
    const [currentMonth, setCurrentMonth] = useState<Date>(new Date());

    // Combine events and activities into a unified format
    const calendarItems = useMemo(() => {
        const items: CalendarItem[] = [];
        const year = currentMonth.getFullYear();
        const month = currentMonth.getMonth();

        // Add one-time events
        events.forEach(event => {
            // Parse YYYY-MM-DD exactly to avoid timezone shift pushing it to the previous day
            const [y, m, d] = (event.date as string).split('-');
            const localDate = new Date(parseInt(y), parseInt(m) - 1, parseInt(d));

            items.push({
                id: event.id,
                title: event.title,
                type: 'event',
                date: localDate,
                startTime: event.start_time,
                endTime: event.end_time,
                description: event.description,
                colorTheme: 'event',
            });
        });

        // Add regular activities
        regularActivities.forEach(activity => {
            // If there's a specific schedule_date, use it
            if (activity.schedule_date) {
                items.push({
                    id: activity.id,
                    title: activity.title,
                    type: 'activity',
                    date: new Date(activity.schedule_date),
                    startTime: activity.start_time,
                    endTime: activity.end_time,
                    description: activity.description,
                    schedule: activity.schedule,
                    icon: activity.icon,
                    colorTheme: activity.color_theme,
                });
            }
            // Otherwise, try to generate dates from the schedule pattern
            else if (activity.schedule) {
                const generatedDates = generateRecurringDates(activity.schedule, year, month);
                const parsedTime = parseTimeFromSchedule(activity.schedule);

                generatedDates.forEach((date, index) => {
                    items.push({
                        id: `${activity.id}-${index}`,
                        title: activity.title,
                        type: 'activity',
                        date: date,
                        startTime: activity.start_time || parsedTime,
                        endTime: activity.end_time,
                        description: activity.description,
                        schedule: activity.schedule,
                        icon: activity.icon,
                        colorTheme: activity.color_theme,
                    });
                });
            }
        });

        return items;
    }, [events, regularActivities, currentMonth]);

    // Group items by date for quick lookup
    const itemsByDate = useMemo(() => {
        const map = new Map<string, CalendarItem[]>();
        calendarItems.forEach(item => {
            // Safely format local date to YYYY-MM-DD
            const year = item.date.getFullYear();
            const month = String(item.date.getMonth() + 1).padStart(2, '0');
            const day = String(item.date.getDate()).padStart(2, '0');
            const dateKey = `${year}-${month}-${day}`;

            const existing = map.get(dateKey) || [];
            map.set(dateKey, [...existing, item]);
        });
        return map;
    }, [calendarItems]);

    // Get all dates that have events/activities
    const datesWithItems = useMemo(() => {
        return calendarItems.map(item => item.date);
    }, [calendarItems]);

    // Get items for selected date
    const selectedDateItems = useMemo(() => {
        if (!selectedDate) return [];
        // Safely format local date to YYYY-MM-DD
        const year = selectedDate.getFullYear();
        const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
        const day = String(selectedDate.getDate()).padStart(2, '0');
        const dateKey = `${year}-${month}-${day}`;
        return itemsByDate.get(dateKey) || [];
    }, [selectedDate, itemsByDate]);

    const formatTime = (timeString: string | null) => {
        if (!timeString) return '';
        return timeString.substring(0, 5);
    };

    // Custom day content to show activity dots
    const renderDay = (date: Date) => {
        // Safely format local date to YYYY-MM-DD
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const dateKey = `${year}-${month}-${day}`;

        const dayItems = itemsByDate.get(dateKey) || [];

        return (
            <div className="calendar-day-content">
                <span>{date.getDate()}</span>
                {dayItems.length > 0 && (
                    <div className="calendar-dots">
                        {dayItems.slice(0, 3).map((item, idx) => {
                            const theme = item.colorTheme === 'event'
                                ? eventColor
                                : (colorMap[item.colorTheme] || colorMap.sage);
                            return (
                                <span
                                    key={idx}
                                    className="calendar-dot"
                                    style={{ backgroundColor: theme.dotColor }}
                                />
                            );
                        })}
                        {dayItems.length > 3 && (
                            <span className="calendar-dot-more">+{dayItems.length - 3}</span>
                        )}
                    </div>
                )}
            </div>
        );
    };

    if (loading) {
        return (
            <div className="calendar-loading">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    return (
        <div className="activity-calendar">
            <div className="calendar-container">
                <DayPicker
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    month={currentMonth}
                    onMonthChange={setCurrentMonth}
                    modifiers={{
                        hasItems: datesWithItems,
                    }}
                    modifiersClassNames={{
                        hasItems: 'day-has-items',
                    }}
                    components={{
                        DayContent: ({ date }) => renderDay(date),
                        IconLeft: () => <ChevronLeft className="w-5 h-5" />,
                        IconRight: () => <ChevronRight className="w-5 h-5" />,
                    }}
                    showOutsideDays
                    fixedWeeks
                />
            </div>

            {/* Selected day panel */}
            <div className="calendar-details">
                {selectedDate ? (
                    <>
                        <h3 className="details-header">
                            <CalendarIcon className="w-5 h-5" />
                            {selectedDate.toLocaleDateString('en-GB', {
                                weekday: 'long',
                                day: 'numeric',
                                month: 'long'
                            })}
                        </h3>

                        {selectedDateItems.length > 0 ? (
                            <div className="details-list">
                                {selectedDateItems.map(item => {
                                    const theme = item.colorTheme === 'event'
                                        ? eventColor
                                        : (colorMap[item.colorTheme] || colorMap.sage);
                                    const IconComponent = item.icon ? iconMap[item.icon] : CalendarIcon;

                                    return (
                                        <div
                                            key={item.id}
                                            className="details-item"
                                            style={{
                                                borderLeftColor: theme.borderColor,
                                                backgroundColor: theme.bgColor
                                            }}
                                        >
                                            <div className="item-header">
                                                <div
                                                    className="item-icon"
                                                    style={{
                                                        backgroundColor: theme.bgColor,
                                                        color: theme.textColor
                                                    }}
                                                >
                                                    <IconComponent className="w-4 h-4" />
                                                </div>
                                                <div className="item-info">
                                                    <span
                                                        className="item-title"
                                                        style={{ color: theme.textColor }}
                                                    >
                                                        {item.title}
                                                    </span>
                                                    {(item.startTime || item.endTime) && (
                                                        <span className="item-time">
                                                            <Clock className="w-3 h-3" />
                                                            {formatTime(item.startTime)}
                                                            {item.endTime && ` - ${formatTime(item.endTime)}`}
                                                        </span>
                                                    )}
                                                    {item.schedule && (
                                                        <span className="item-schedule">{item.schedule}</span>
                                                    )}
                                                </div>
                                            </div>
                                            {item.description && (
                                                <p className="item-description">{item.description}</p>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <p className="details-empty">No activities scheduled for this day.</p>
                        )}
                    </>
                ) : (
                    <div className="details-placeholder">
                        <CalendarIcon className="w-12 h-12 text-gray-300" />
                        <p>Select a day to see scheduled activities</p>
                    </div>
                )}
            </div>
        </div>
    );
}
