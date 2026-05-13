import { useState, useMemo, useEffect, useRef } from 'react';
import { DayPicker } from 'react-day-picker';
import { useEvents } from '../../context/EventContext';
import { Clock, Calendar as CalendarIcon, ChevronLeft, ChevronRight, Lock } from 'lucide-react';
import { Coffee, Palette, Music, Users, Star, BookOpen, Heart, Smile } from 'lucide-react';
import 'react-day-picker/dist/style.css';
import './ActivityCalendar.css';

const iconMap: Record<string, React.ElementType> = {
    Coffee, Palette, Music, Users, Star, BookOpen, Heart, Smile
};

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

const eventColor = { bgColor: '#eff6ff', textColor: '#1e40af', borderColor: '#3b82f6', dotColor: '#3b82f6' };
const bookingColor = { bgColor: '#f3e8ff', textColor: '#6b21a8', borderColor: '#9333ea', dotColor: '#9333ea' };

export interface PrivateBooking {
    id: string;
    name: string;
    date: string;
    end_date: string | null;
    event_type: string | null;
}

interface ActivityCalendarProps {
    privateBookings?: PrivateBooking[];
}

interface CalendarItem {
    id: string;
    title: string;
    type: 'event' | 'activity' | 'booking';
    date: Date;
    startTime: string | null;
    endTime: string | null;
    description: string | null;
    schedule?: string | null;
    icon?: string;
    colorTheme: string;
    sessionType?: string | null;
}

const dayOfWeekMap: Record<string, number> = {
    'sunday': 0, 'sundays': 0,
    'monday': 1, 'mondays': 1,
    'tuesday': 2, 'tuesdays': 2,
    'wednesday': 3, 'wednesdays': 3,
    'thursday': 4, 'thursdays': 4,
    'friday': 5, 'fridays': 5,
    'saturday': 6, 'saturdays': 6,
};

const ordinalMap: Record<string, number> = {
    'first': 1, '1st': 1,
    'second': 2, '2nd': 2,
    'third': 3, '3rd': 3,
    'fourth': 4, '4th': 4,
    'last': -1,
};

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

function getDayOccurrencesInMonth(year: number, month: number, dayOfWeek: number): Date[] {
    const dates: Date[] = [];
    const date = new Date(year, month, 1);
    while (date.getDay() !== dayOfWeek) {
        date.setDate(date.getDate() + 1);
    }
    while (date.getMonth() === month) {
        dates.push(new Date(date));
        date.setDate(date.getDate() + 7);
    }
    return dates;
}

function getNthDayOfMonth(year: number, month: number, dayOfWeek: number, n: number): Date | null {
    const occurrences = getDayOccurrencesInMonth(year, month, dayOfWeek);
    if (n === -1) return occurrences[occurrences.length - 1] || null;
    return occurrences[n - 1] || null;
}

function generateRecurringDates(schedule: string, year: number, month: number): Date[] {
    const scheduleLower = schedule.toLowerCase();
    const dates: Date[] = [];
    for (const [ordinalWord, ordinalNum] of Object.entries(ordinalMap)) {
        if (new RegExp(`\\b${ordinalWord}\\b`).test(scheduleLower)) {
            for (const [dayWord, dayNum] of Object.entries(dayOfWeekMap)) {
                if (scheduleLower.includes(dayWord)) {
                    const date = getNthDayOfMonth(year, month, dayNum, ordinalNum);
                    if (date) dates.push(date);
                    break;
                }
            }
        }
    }
    if (dates.length > 0) return dates;
    for (const [dayWord, dayNum] of Object.entries(dayOfWeekMap)) {
        if (scheduleLower.includes(dayWord)) {
            return getDayOccurrencesInMonth(year, month, dayNum);
        }
    }
    return dates;
}

function generateDateRange(startDate: string, endDate: string | null): Date[] {
    const [sy, sm, sd] = startDate.split('-').map(Number);
    const start = new Date(sy, sm - 1, sd);
    if (!endDate) return [start];
    const [ey, em, ed] = endDate.split('-').map(Number);
    const end = new Date(ey, em - 1, ed);
    const dates: Date[] = [];
    const current = new Date(start);
    while (current <= end) {
        dates.push(new Date(current));
        current.setDate(current.getDate() + 1);
    }
    return dates;
}

function formatSession(eventType: string | null): string {
    if (!eventType) return '';
    const labels: Record<string, string> = {
        morning: 'Morning (8am–12pm)',
        afternoon: 'Afternoon (12pm–5pm)',
        evening: 'Evening (5pm–10pm)',
        allday: 'All Day',
    };
    return eventType.split(',').map(s => labels[s.trim()] ?? s.trim()).join(' + ');
}

function getTheme(item: CalendarItem) {
    if (item.colorTheme === 'event') return eventColor;
    if (item.colorTheme === 'booking') return bookingColor;
    return colorMap[item.colorTheme] || colorMap.sage;
}

export function ActivityCalendar({ privateBookings = [] }: ActivityCalendarProps) {
    const { events, regularActivities, loading } = useEvents();
    const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
    const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
    const defaultedRef = useRef(false);

    useEffect(() => {
        if (defaultedRef.current || loading) return;
        defaultedRef.current = true;

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const nextEventDate = events
            .map(event => {
                const [y, m, d] = (event.date as string).split('-').map(Number);
                return new Date(y, m - 1, d);
            })
            .filter(date => date.getTime() >= today.getTime())
            .sort((a, b) => a.getTime() - b.getTime())[0];

        if (nextEventDate) {
            setSelectedDate(nextEventDate);
            setCurrentMonth(new Date(nextEventDate.getFullYear(), nextEventDate.getMonth(), 1));
        }
    }, [events, loading]);

    const calendarItems = useMemo(() => {
        const items: CalendarItem[] = [];
        const year = currentMonth.getFullYear();
        const month = currentMonth.getMonth();

        events.forEach(event => {
            generateDateRange(event.date, event.end_date ?? null).forEach((date, index) => {
                items.push({
                    id: index === 0 ? event.id : `${event.id}-${index}`,
                    title: event.title,
                    type: 'event',
                    date,
                    startTime: index === 0 ? event.start_time : null,
                    endTime: index === 0 ? event.end_time : null,
                    description: event.description,
                    colorTheme: 'event',
                });
            });
        });

        regularActivities.forEach(activity => {
            if (activity.schedule_date) {
                const [ay, am, ad] = (activity.schedule_date as string).split('-').map(Number);
                items.push({
                    id: activity.id,
                    title: activity.title,
                    type: 'activity',
                    date: new Date(ay, am - 1, ad),
                    startTime: activity.start_time,
                    endTime: activity.end_time,
                    description: activity.description,
                    schedule: activity.schedule,
                    icon: activity.icon,
                    colorTheme: activity.color_theme,
                });
            } else if (activity.schedule) {
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

        privateBookings.forEach(booking => {
            generateDateRange(booking.date, booking.end_date).forEach((date, index) => {
                items.push({
                    id: `booking-${booking.id}-${index}`,
                    title: booking.name,
                    type: 'booking',
                    date,
                    startTime: null,
                    endTime: null,
                    description: null,
                    colorTheme: 'booking',
                    sessionType: booking.event_type,
                });
            });
        });

        return items;
    }, [events, regularActivities, currentMonth, privateBookings]);

    const itemsByDate = useMemo(() => {
        const map = new Map<string, CalendarItem[]>();
        calendarItems.forEach(item => {
            const year = item.date.getFullYear();
            const month = String(item.date.getMonth() + 1).padStart(2, '0');
            const day = String(item.date.getDate()).padStart(2, '0');
            const dateKey = `${year}-${month}-${day}`;
            const existing = map.get(dateKey) || [];
            map.set(dateKey, [...existing, item]);
        });
        return map;
    }, [calendarItems]);

    const datesWithItems = useMemo(() => {
        return calendarItems.map(item => item.date);
    }, [calendarItems]);

    const selectedDateItems = useMemo(() => {
        if (!selectedDate) return [];
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

    const renderDay = (date: Date) => {
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
                        {dayItems.slice(0, 3).map((item, idx) => (
                            <span
                                key={idx}
                                className="calendar-dot"
                                style={{ backgroundColor: getTheme(item).dotColor }}
                            />
                        ))}
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
                    modifiers={{ hasItems: datesWithItems }}
                    modifiersClassNames={{ hasItems: 'day-has-items' }}
                    components={{
                        DayContent: ({ date }) => renderDay(date),
                        IconLeft: () => <ChevronLeft className="w-5 h-5" />,
                        IconRight: () => <ChevronRight className="w-5 h-5" />,
                    }}
                    showOutsideDays
                    fixedWeeks
                />
            </div>

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
                                    const theme = getTheme(item);
                                    const IconComponent = item.type === 'booking'
                                        ? Lock
                                        : (item.icon ? iconMap[item.icon] : CalendarIcon);

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
                                                    <div className="flex items-center gap-2">
                                                        <span
                                                            className="item-title"
                                                            style={{ color: theme.textColor }}
                                                        >
                                                            {item.title}
                                                        </span>
                                                        {item.type === 'booking' && (
                                                            <span
                                                                className="text-[10px] font-semibold px-1.5 py-0.5 rounded uppercase tracking-wide"
                                                                style={{ backgroundColor: theme.borderColor, color: '#fff' }}
                                                            >
                                                                Private Hire
                                                            </span>
                                                        )}
                                                    </div>
                                                    {item.type === 'booking' && item.sessionType && (
                                                        <span className="item-time">
                                                            <Clock className="w-3 h-3" />
                                                            {formatSession(item.sessionType)}
                                                        </span>
                                                    )}
                                                    {item.type !== 'booking' && (item.startTime || item.endTime) && (
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
