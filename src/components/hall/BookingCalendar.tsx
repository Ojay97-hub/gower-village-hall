import { useState, useEffect, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';

interface Booking {
  id: string;
  name: string;
  event_type: string | null;
  date: string;
  end_date: string | null;
  status: 'pending' | 'confirmed' | 'declined';
}

interface BookingCalendarProps {
  selectedDate?: string;
  selectedEndDate?: string;
  onDateSelect?: (date: string, endDate: string) => void;
}

// Session-based colour coding
const SESSION_COLORS: Record<string, { bg: string; text: string; border: string; label: string }> = {
  morning:   { bg: '#fef3c7', text: '#78350f', border: '#f59e0b', label: 'Morning' },
  afternoon: { bg: '#e0f2fe', text: '#0c4a6e', border: '#38bdf8', label: 'Afternoon' },
  evening:   { bg: '#ede9fe', text: '#3b0764', border: '#8b5cf6', label: 'Evening' },
  allday:    { bg: '#dcfce7', text: '#14532d', border: '#4ade80', label: 'All Day' },
  multi:     { bg: '#fce7f3', text: '#831843', border: '#f472b6', label: 'Multi-session' },
  unknown:   { bg: '#f1f5f9', text: '#334155', border: '#94a3b8', label: 'Booked' },
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

const DAYS_OF_WEEK = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number): number {
  const day = new Date(year, month, 1).getDay();
  // Convert Sunday=0 to Monday-based (Mon=0, Sun=6)
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

export function BookingCalendar({ selectedDate, selectedEndDate, onDateSelect }: BookingCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  // Internal selection state: first click = start, second click = end (or new start)
  const [selectingEnd, setSelectingEnd] = useState(false);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  useEffect(() => {
    fetchBookings();
  }, [year, month]);

  async function fetchBookings() {
    setLoading(true);
    const monthStart = formatDate(year, month, 1);
    const monthEnd = formatDate(year, month, getDaysInMonth(year, month));

    // Fetch bookings whose date range overlaps with this month
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

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const handleDayClick = (day: number) => {
    if (!onDateSelect) return;

    const clickedDate = formatDate(year, month, day);
    const today = new Date();
    const clickedDateObj = new Date(year, month, day);
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());

    // Don't allow selecting past dates
    if (clickedDateObj < todayStart) return;

    if (!selectingEnd || !selectedDate) {
      // First click: set start date, clear end date
      onDateSelect(clickedDate, '');
      setSelectingEnd(true);
    } else {
      // Second click: set end date (if after start) or new start date
      if (clickedDate > selectedDate) {
        onDateSelect(selectedDate, clickedDate);
        setSelectingEnd(false);
      } else {
        // Clicked before start date, reset to new start
        onDateSelect(clickedDate, '');
        setSelectingEnd(true);
      }
    }
  };

  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);
  const monthName = currentDate.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });

  // Build calendar grid
  const calendarDays: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) {
    calendarDays.push(null);
  }
  for (let d = 1; d <= daysInMonth; d++) {
    calendarDays.push(d);
  }
  while (calendarDays.length % 7 !== 0) {
    calendarDays.push(null);
  }

  const today = new Date();
  const isToday = (day: number) =>
    day === today.getDate() && month === today.getMonth() && year === today.getFullYear();

  // Check if a date is in the selected range
  const isSelected = (day: number) => {
    const dateKey = formatDate(year, month, day);
    return dateKey === selectedDate;
  };

  const isEndSelected = (day: number) => {
    const dateKey = formatDate(year, month, day);
    return dateKey === selectedEndDate;
  };

  const isInRange = (day: number) => {
    if (!selectedDate || !selectedEndDate) return false;
    const dateKey = formatDate(year, month, day);
    return dateKey > selectedDate && dateKey < selectedEndDate;
  };

  return (
    <div className="booking-calendar-wrapper">
      {/* Header */}
      <div className="booking-cal-header">
        <h3 className="booking-cal-month">{monthName}</h3>
        <div className="booking-cal-nav">
          <button
            onClick={prevMonth}
            className="booking-cal-nav-btn"
            aria-label="Previous month"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={goToToday}
            className="booking-cal-today-btn"
          >
            Today
          </button>
          <button
            onClick={nextMonth}
            className="booking-cal-nav-btn"
            aria-label="Next month"
          >
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
              <button
                className="booking-cal-clear-btn"
                onClick={() => {
                  onDateSelect('', '');
                  setSelectingEnd(false);
                }}
              >
                Clear
              </button>
            </span>
          )}
          {selectedDate && !selectedEndDate && !selectingEnd && (
            <span className="booking-cal-selection-hint">
              <strong>{formatDateDisplay(selectedDate)}</strong>
              <button
                className="booking-cal-clear-btn"
                onClick={() => {
                  onDateSelect('', '');
                  setSelectingEnd(false);
                }}
              >
                Clear
              </button>
            </span>
          )}
        </div>
      )}

      {/* Day headers */}
      <div className="booking-cal-day-headers">
        {DAYS_OF_WEEK.map(day => (
          <div key={day} className="booking-cal-day-header">
            {day}
          </div>
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
          const todayHighlight = isToday(day);
          const isPast = new Date(year, month, day) < new Date(today.getFullYear(), today.getMonth(), today.getDate());
          const selected = isSelected(day);
          const endSelected = isEndSelected(day);
          const inRange = isInRange(day);
          const isClickable = onDateSelect && !isPast;

          // Monday-based day-of-week (0=Mon … 6=Sun) for spanning logic
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
          ].filter(Boolean).join(' ');

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
                {dayBookings.slice(0, 3).map(({ booking, isStart, isEnd }) => {
                  const color = getSessionColor(booking.event_type);
                  const sessionTag = getSessionTag(booking.event_type);
                  const isMulti = !!(booking.end_date && booking.end_date !== booking.date);
                  const isFirstInRow = !isMulti || isStart || mondayDow === 0;
                  const isLastInRow = !isMulti || isEnd || mondayDow === 6;
                  const extendsLeft = isMulti && !isFirstInRow;
                  const extendsRight = isMulti && !isLastInRow;

                  const cls = [
                    'booking-cal-event',
                    isMulti ? 'booking-cal-event--multi' : '',
                    extendsLeft ? 'booking-cal-event--extends-left' : '',
                    extendsRight ? 'booking-cal-event--extends-right' : '',
                    isMulti && isFirstInRow ? 'booking-cal-event--row-start' : '',
                    isMulti && isLastInRow ? 'booking-cal-event--row-end' : '',
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
                      title={`${booking.name}${booking.end_date && booking.end_date !== booking.date ? ` (${formatDateDisplay(booking.date)} – ${formatDateDisplay(booking.end_date)})` : ''}${booking.event_type ? ` · ${booking.event_type}` : ''}`}
                    >
                      {isFirstInRow ? (
                        <>
                          <span className="booking-cal-event-name">{booking.name}</span>
                          {sessionTag && (
                            <span className="booking-cal-event-session">{sessionTag}</span>
                          )}
                        </>
                      ) : (
                        <span className="booking-cal-event-name">&nbsp;</span>
                      )}
                    </div>
                  );
                })}
                {dayBookings.length > 3 && (
                  <span className="booking-cal-more">+{dayBookings.length - 3} more</span>
                )}
              </div>
            </div>
          );
        })}
      </div>

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
        </div>
        <span className="booking-cal-legend-text">Confirmed bookings only</span>
      </div>
    </div>
  );
}
