import { useState, useEffect, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';
import { useEvents } from '../../context/EventContext';

interface Booking {
  id: string;
  name: string;
  event_type: string | null;
  date: string;
  end_date: string | null;
  status: 'pending' | 'confirmed' | 'declined';
}

interface CalendarEventItem {
  id: string;
  title: string;
  type: 'event' | 'activity';
  startTime?: string | null;
  endTime?: string | null;
}

interface BookingCalendarProps {
  selectedDate?: string;
  selectedEndDate?: string;
  onDateSelect?: (date: string, endDate: string) => void;
  onBookedSessionsChange?: (sessions: Set<string>) => void;
}

// Session-based colour coding for confirmed bookings
const SESSION_COLORS: Record<string, { bg: string; text: string; border: string; label: string }> = {
  morning:   { bg: '#fef3c7', text: '#78350f', border: '#f59e0b', label: 'Morning' },
  afternoon: { bg: '#e0f2fe', text: '#0c4a6e', border: '#38bdf8', label: 'Afternoon' },
  evening:   { bg: '#ede9fe', text: '#3b0764', border: '#8b5cf6', label: 'Evening' },
  allday:    { bg: '#dcfce7', text: '#14532d', border: '#4ade80', label: 'All Day' },
  multi:     { bg: '#fce7f3', text: '#831843', border: '#f472b6', label: 'Multi-session' },
  unknown:   { bg: '#f1f5f9', text: '#334155', border: '#94a3b8', label: 'Booked' },
};

// Colours for scheduled events and recurring activities
const SCHEDULE_COLORS = {
  event:    { bg: '#eff6ff', text: '#1e40af', border: '#3b82f6', label: 'Event' },
  activity: { bg: '#fdf4e7', text: '#7c3a00', border: '#b45309', label: 'Activity' },
};

function getSessionColor(eventType: string | null) {
  if (!eventType) return SESSION_COLORS.unknown;
  const s = eventType.toLowerCase().replace(/[\s-]/g, '');
  if (s === 'allday' || s === 'fullday') return SESSION_COLORS.allday;
  const hasMorning   = s.includes('morning');
  const hasAfternoon = s.includes('afternoon');
  const hasEvening   = s.includes('evening');
  const count = [hasMorning, hasAfternoon, hasEvening].filter(Boolean).length;
  if (count > 1) return SESSION_COLORS.multi;
  if (hasMorning)   return SESSION_COLORS.morning;
  if (hasAfternoon) return SESSION_COLORS.afternoon;
  if (hasEvening)   return SESSION_COLORS.evening;
  return SESSION_COLORS.unknown;
}

function getSessionTag(eventType: string | null): string {
  if (!eventType) return '';
  const s = eventType.toLowerCase().replace(/[\s-]/g, '');
  if (s === 'allday' || s === 'fullday') return 'All Day';
  const parts: string[] = [];
  if (s.includes('morning'))   parts.push('AM');
  if (s.includes('afternoon')) parts.push('PM');
  if (s.includes('evening'))   parts.push('Eve');
  return parts.join(' · ');
}

// Recurring-schedule helpers (mirrored from ActivityCalendar)
const DOW_MAP: Record<string, number> = {
  sunday: 0, sundays: 0,
  monday: 1, mondays: 1,
  tuesday: 2, tuesdays: 2,
  wednesday: 3, wednesdays: 3,
  thursday: 4, thursdays: 4,
  friday: 5, fridays: 5,
  saturday: 6, saturdays: 6,
};

const ORDINAL_MAP: Record<string, number> = {
  first: 1, '1st': 1,
  second: 2, '2nd': 2,
  third: 3, '3rd': 3,
  fourth: 4, '4th': 4,
  last: -1,
};

function getDowOccurrences(year: number, month: number, dow: number): Date[] {
  const dates: Date[] = [];
  const d = new Date(year, month, 1);
  while (d.getDay() !== dow) d.setDate(d.getDate() + 1);
  while (d.getMonth() === month) {
    dates.push(new Date(d));
    d.setDate(d.getDate() + 7);
  }
  return dates;
}

function generateRecurringDates(schedule: string, year: number, month: number): Date[] {
  const lower = schedule.toLowerCase();
  const dates: Date[] = [];

  for (const [ord, ordNum] of Object.entries(ORDINAL_MAP)) {
    if (new RegExp(`\\b${ord}\\b`).test(lower)) {
      for (const [dayWord, dow] of Object.entries(DOW_MAP)) {
        if (lower.includes(dayWord)) {
          const occurrences = getDowOccurrences(year, month, dow);
          const date = ordNum === -1
            ? occurrences[occurrences.length - 1]
            : occurrences[ordNum - 1];
          if (date) dates.push(date);
          break;
        }
      }
    }
  }
  if (dates.length > 0) return dates;

  for (const [dayWord, dow] of Object.entries(DOW_MAP)) {
    if (lower.includes(dayWord)) {
      return getDowOccurrences(year, month, dow);
    }
  }

  return [];
}

const DAYS_OF_WEEK = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number): number {
  const day = new Date(year, month, 1).getDay();
  return day === 0 ? 6 : day - 1;
}

function formatDate(year: number, month: number, day: number): string {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

function formatDateDisplay(dateStr: string): string {
  const [y, m, d] = dateStr.split('-');
  const date = new Date(parseInt(y), parseInt(m) - 1, parseInt(d));
  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

export function BookingCalendar({ selectedDate, selectedEndDate, onDateSelect, onBookedSessionsChange }: BookingCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectingEnd, setSelectingEnd] = useState(false);

  const { events, regularActivities } = useEvents();

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  useEffect(() => {
    fetchBookings();
  }, [year, month]);

  async function fetchBookings() {
    setLoading(true);
    const monthStart = formatDate(year, month, 1);
    const monthEnd = formatDate(year, month, getDaysInMonth(year, month));

    const { data, error } = await supabase
      .from('bookings')
      .select('id, name, event_type, date, end_date, status')
      .eq('status', 'confirmed')
      .lte('date', monthEnd)
      .or(`end_date.gte.${monthStart},and(end_date.is.null,date.gte.${monthStart})`)
      .order('date', { ascending: true });

    if (!error && data) {
      setBookings(data);
    }
    setLoading(false);
  }

  const bookingsByDate = useMemo(() => {
    const map = new Map<string, { booking: Booking; isStart: boolean; isEnd: boolean }[]>();
    bookings.forEach(booking => {
      const startStr = booking.date;
      const endStr = booking.end_date || booking.date;
      const cur = new Date(startStr + 'T00:00:00');
      const end = new Date(endStr + 'T00:00:00');
      while (cur <= end) {
        const dateKey = `${cur.getFullYear()}-${String(cur.getMonth() + 1).padStart(2, '0')}-${String(cur.getDate()).padStart(2, '0')}`;
        const isStart = dateKey === startStr;
        const isEnd = dateKey === endStr;
        const existing = map.get(dateKey) || [];
        map.set(dateKey, [...existing, { booking, isStart, isEnd }]);
        cur.setDate(cur.getDate() + 1);
      }
    });
    return map;
  }, [bookings]);

  // Build a date→events+activities map for the displayed month
  const calendarEventsByDate = useMemo(() => {
    const map = new Map<string, CalendarEventItem[]>();

    events.forEach(event => {
      const startStr = (event.date as string).slice(0, 10);
      const endStr = event.end_date ? (event.end_date as string).slice(0, 10) : startStr;
      const cur = new Date(startStr + 'T00:00:00');
      const end = new Date(endStr + 'T00:00:00');
      let idx = 0;
      while (cur <= end) {
        const dateKey = `${cur.getFullYear()}-${String(cur.getMonth() + 1).padStart(2, '0')}-${String(cur.getDate()).padStart(2, '0')}`;
        map.set(dateKey, [...(map.get(dateKey) || []), {
          id: idx === 0 ? event.id : `${event.id}-${idx}`,
          title: event.title, type: 'event',
          startTime: idx === 0 ? event.start_time : null,
          endTime: idx === 0 ? event.end_time : null,
        }]);
        cur.setDate(cur.getDate() + 1);
        idx++;
      }
    });

    regularActivities.forEach(activity => {
      if (activity.schedule_date) {
        const dateKey = (activity.schedule_date as string).slice(0, 10);
        map.set(dateKey, [...(map.get(dateKey) || []), {
          id: activity.id, title: activity.title, type: 'activity',
          startTime: activity.start_time, endTime: activity.end_time,
        }]);
      } else if (activity.schedule) {
        generateRecurringDates(activity.schedule, year, month).forEach((date, idx) => {
          const dateKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
          map.set(dateKey, [...(map.get(dateKey) || []), {
            id: `${activity.id}-${idx}`, title: activity.title, type: 'activity',
            startTime: activity.start_time, endTime: activity.end_time,
          }]);
        });
      }
    });

    return map;
  }, [events, regularActivities, year, month]);

  // Returns which booking sessions a time range overlaps with
  function getSessionsForTime(startTime: string | null | undefined, endTime: string | null | undefined): string[] {
    if (!startTime) return [];
    const toMins = (t: string) => { const [h, m] = t.split(':').map(Number); return h * 60 + (m || 0); };
    const start = toMins(startTime);
    const end = endTime ? toMins(endTime) : start + 60;
    const sessions: string[] = [];
    if (start < 720  && end > 480)  sessions.push('morning');   // 8am–12pm
    if (start < 1020 && end > 720)  sessions.push('afternoon'); // 12pm–5pm
    if (start < 1320 && end > 1020) sessions.push('evening');   // 5pm–10pm
    return sessions;
  }

  // Notify parent of which sessions are already booked for the selected date range
  useEffect(() => {
    if (!onBookedSessionsChange) return;

    if (!selectedDate) {
      onBookedSessionsChange(new Set());
      return;
    }

    const booked = new Set<string>();
    const cur = new Date(selectedDate + 'T00:00:00');
    const end = new Date((selectedEndDate || selectedDate) + 'T00:00:00');

    while (cur <= end) {
      const dateKey = `${cur.getFullYear()}-${String(cur.getMonth() + 1).padStart(2, '0')}-${String(cur.getDate()).padStart(2, '0')}`;
      (bookingsByDate.get(dateKey) || []).forEach(({ booking }) => {
        const s = (booking.event_type || '').toLowerCase().replace(/[\s-]/g, '');
        if (s === 'allday' || s === 'fullday') {
          ['morning', 'afternoon', 'evening', 'allday'].forEach(x => booked.add(x));
        } else {
          if (s.includes('morning'))   booked.add('morning');
          if (s.includes('afternoon')) booked.add('afternoon');
          if (s.includes('evening'))   booked.add('evening');
        }
      });

      // Block sessions covered by events/activities on this date
      (calendarEventsByDate.get(dateKey) || []).forEach(item => {
        if (!item.startTime) {
          // No time data stored — block all sessions to prevent double-booking
          ['morning', 'afternoon', 'evening', 'allday'].forEach(s => booked.add(s));
        } else {
          getSessionsForTime(item.startTime, item.endTime).forEach(s => booked.add(s));
        }
      });

      cur.setDate(cur.getDate() + 1);
    }

    // Any individual session taken means allday is also unavailable
    if (booked.has('morning') || booked.has('afternoon') || booked.has('evening')) {
      booked.add('allday');
    }

    onBookedSessionsChange(booked);
  }, [selectedDate, selectedEndDate, bookingsByDate, calendarEventsByDate, onBookedSessionsChange]);

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
  const goToToday  = () => setCurrentDate(new Date());

  const isAllDayBooked = (dateKey: string) =>
    (bookingsByDate.get(dateKey) || []).some(({ booking }) => {
      const s = (booking.event_type || '').toLowerCase().replace(/[\s-]/g, '');
      return s === 'allday' || s === 'fullday';
    });

  const handleDayClick = (day: number) => {
    if (!onDateSelect) return;
    const clickedDate = formatDate(year, month, day);
    const today = new Date();
    const clickedDateObj = new Date(year, month, day);
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    if (clickedDateObj < todayStart) return;
    if (isAllDayBooked(clickedDate)) return;

    if (!selectingEnd || !selectedDate) {
      onDateSelect(clickedDate, '');
      setSelectingEnd(true);
    } else {
      if (clickedDate > selectedDate) {
        onDateSelect(selectedDate, clickedDate);
        setSelectingEnd(false);
      } else {
        onDateSelect(clickedDate, '');
        setSelectingEnd(true);
      }
    }
  };

  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);
  const monthName = currentDate.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });

  const calendarDays: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) calendarDays.push(null);
  for (let d = 1; d <= daysInMonth; d++) calendarDays.push(d);
  while (calendarDays.length % 7 !== 0) calendarDays.push(null);

  const today = new Date();
  const isToday      = (day: number) => day === today.getDate() && month === today.getMonth() && year === today.getFullYear();
  const isSelected   = (day: number) => formatDate(year, month, day) === selectedDate;
  const isEndSelected= (day: number) => formatDate(year, month, day) === selectedEndDate;
  const isInRange    = (day: number) => {
    if (!selectedDate || !selectedEndDate) return false;
    const k = formatDate(year, month, day);
    return k > selectedDate && k < selectedEndDate;
  };

  return (
    <div className="booking-calendar-wrapper">
      {/* Header */}
      <div className="booking-cal-header">
        <h3 className="booking-cal-month">{monthName}</h3>
        <div className="booking-cal-nav">
          <button type="button" onClick={prevMonth} className="booking-cal-nav-btn" aria-label="Previous month">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button type="button" onClick={goToToday} className="booking-cal-today-btn">Today</button>
          <button type="button" onClick={nextMonth} className="booking-cal-nav-btn" aria-label="Next month">
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Selection indicator */}
      {onDateSelect && (
        <div className="booking-cal-selection-bar">
          {!selectedDate && (
            <span className="booking-cal-selection-hint">Click a date to select your booking start date</span>
          )}
          {selectedDate && selectingEnd && !selectedEndDate && (
            <span className="booking-cal-selection-hint">
              <strong>{formatDateDisplay(selectedDate)}</strong> selected — click another date for end date, or continue with single day
            </span>
          )}
          {selectedDate && selectedEndDate && (
            <span className="booking-cal-selection-hint">
              <strong>{formatDateDisplay(selectedDate)}</strong> → <strong>{formatDateDisplay(selectedEndDate)}</strong>
              <button type="button" className="booking-cal-clear-btn" onClick={() => { onDateSelect('', ''); setSelectingEnd(false); }}>
                Clear
              </button>
            </span>
          )}
          {selectedDate && !selectedEndDate && !selectingEnd && (
            <span className="booking-cal-selection-hint">
              <strong>{formatDateDisplay(selectedDate)}</strong>
              <button type="button" className="booking-cal-clear-btn" onClick={() => { onDateSelect('', ''); setSelectingEnd(false); }}>
                Clear
              </button>
            </span>
          )}
        </div>
      )}

      {/* Scrollable area: day headers + grid scroll together on mobile */}
      <div className="booking-cal-scroll-area">

      {/* Day headers */}
      <div className="booking-cal-day-headers">
        {DAYS_OF_WEEK.map(day => (
          <div key={day} className="booking-cal-day-header">{day}</div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="booking-cal-grid">
        {loading && (
          <div className="booking-cal-loading">
            <Loader2 className="w-6 h-6 animate-spin text-primary-600" />
          </div>
        )}
        {calendarDays.map((day, idx) => {
          if (day === null) {
            return <div key={`empty-${idx}`} className="booking-cal-cell booking-cal-cell--empty" />;
          }

          const dateKey = formatDate(year, month, day);
          const dayBookings = bookingsByDate.get(dateKey) || [];
          const dayEventItems = calendarEventsByDate.get(dateKey) || [];
          const totalItems = dayBookings.length + dayEventItems.length;

          const todayHighlight = isToday(day);
          const isPast = new Date(year, month, day) < new Date(today.getFullYear(), today.getMonth(), today.getDate());
          const selected = isSelected(day);
          const endSelected = isEndSelected(day);
          const inRange = isInRange(day);
          const fullyBooked = !isPast && isAllDayBooked(dateKey);
          const isClickable = onDateSelect && !isPast && !fullyBooked;

          const rawDow = new Date(year, month, day).getDay();
          const mondayDow = rawDow === 0 ? 6 : rawDow - 1;

          const cellClasses = [
            'booking-cal-cell',
            todayHighlight ? 'booking-cal-cell--today' : '',
            isPast ? 'booking-cal-cell--past' : '',
            selected ? 'booking-cal-cell--selected' : '',
            endSelected ? 'booking-cal-cell--end-selected' : '',
            inRange ? 'booking-cal-cell--in-range' : '',
            isClickable ? 'booking-cal-cell--clickable' : '',
            fullyBooked ? 'booking-cal-cell--unavailable' : '',
          ].filter(Boolean).join(' ');

          // Slots: show up to 3 items total (bookings first, then events/activities)
          const maxShown = 3;
          const bookingsToShow = dayBookings.slice(0, maxShown);
          const slotsLeft = maxShown - bookingsToShow.length;
          const eventItemsToShow = dayEventItems.slice(0, slotsLeft);
          const overflow = totalItems - maxShown;

          return (
            <div
              key={dateKey}
              className={cellClasses}
              onClick={() => isClickable && handleDayClick(day)}
            >
              <span className={`booking-cal-date${todayHighlight ? ' booking-cal-date--today' : ''}${selected || endSelected ? ' booking-cal-date--selected' : ''}`}>
                {day}
              </span>
              <div className="booking-cal-events">
                {/* Confirmed bookings */}
                {bookingsToShow.map(({ booking, isStart, isEnd }) => {
                  const color = getSessionColor(booking.event_type);
                  const sessionTag = getSessionTag(booking.event_type);
                  const isMulti = !!(booking.end_date && booking.end_date !== booking.date);
                  const isFirstInRow = !isMulti || isStart || mondayDow === 0;
                  const isLastInRow  = !isMulti || isEnd   || mondayDow === 6;
                  const extendsLeft  = isMulti && !isFirstInRow;
                  const extendsRight = isMulti && !isLastInRow;

                  const cls = [
                    'booking-cal-event',
                    isMulti ? 'booking-cal-event--multi' : '',
                    extendsLeft  ? 'booking-cal-event--extends-left'  : '',
                    extendsRight ? 'booking-cal-event--extends-right' : '',
                    isMulti && isFirstInRow ? 'booking-cal-event--row-start' : '',
                    isMulti && isLastInRow  ? 'booking-cal-event--row-end'   : '',
                  ].filter(Boolean).join(' ');

                  return (
                    <div
                      key={`${booking.id}-${dateKey}`}
                      className={cls}
                      style={{
                        backgroundColor: color.bg,
                        color: color.text,
                        borderLeft: isFirstInRow ? `3px solid ${color.border}` : 'none',
                      }}
                      title={`Booked${booking.end_date && booking.end_date !== booking.date ? ` (${formatDateDisplay(booking.date)} – ${formatDateDisplay(booking.end_date)})` : ''}${booking.event_type ? ` · ${booking.event_type}` : ''}`}
                    >
                      {isFirstInRow ? (
                        <>
                          <span className="booking-cal-event-name">Booked</span>
                          {sessionTag && <span className="booking-cal-event-session">{sessionTag}</span>}
                        </>
                      ) : (
                        <span className="booking-cal-event-name">&nbsp;</span>
                      )}
                    </div>
                  );
                })}

                {/* Scheduled events & activities */}
                {eventItemsToShow.map((item) => {
                  const color = SCHEDULE_COLORS[item.type];
                  return (
                    <div
                      key={`${item.type}-${item.id}`}
                      className="booking-cal-event booking-cal-event--scheduled"
                      style={{
                        backgroundColor: color.bg,
                        color: color.text,
                        borderLeft: `3px solid ${color.border}`,
                      }}
                      title={`${color.label}: ${item.title}`}
                    >
                      <span className="booking-cal-event-name">{item.title}</span>
                    </div>
                  );
                })}

                {overflow > 0 && (
                  <span className="booking-cal-more">+{overflow} more</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
      </div>{/* end booking-cal-scroll-area */}

      {/* Legend */}
      <div className="booking-cal-legend">
        <div className="booking-cal-legend-sessions">
          {(Object.entries(SESSION_COLORS) as [string, typeof SESSION_COLORS[keyof typeof SESSION_COLORS]][])
            .filter(([k]) => k !== 'unknown')
            .map(([key, c]) => (
              <span
                key={key}
                className="booking-cal-legend-chip"
                style={{ background: c.bg, color: c.text, borderColor: c.border }}
              >
                {c.label}
              </span>
            ))}
          {(Object.entries(SCHEDULE_COLORS) as [string, typeof SCHEDULE_COLORS[keyof typeof SCHEDULE_COLORS]][])
            .map(([key, c]) => (
              <span
                key={key}
                className="booking-cal-legend-chip"
                style={{ background: c.bg, color: c.text, borderColor: c.border }}
              >
                {c.label}
              </span>
            ))}
        </div>
        <span className="booking-cal-legend-text">Confirmed bookings · scheduled events &amp; activities</span>
      </div>
    </div>
  );
}
