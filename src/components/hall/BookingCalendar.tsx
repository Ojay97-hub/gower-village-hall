import { useState, useEffect, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';

interface Booking {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  event_type: string | null;
  date: string;
  end_date: string | null;
  message: string | null;
  status: 'pending' | 'confirmed' | 'declined';
  created_at: string;
}

interface BookingCalendarProps {
  selectedDate?: string;
  selectedEndDate?: string;
  onDateSelect?: (date: string, endDate: string) => void;
}

// Color palette for bookings - vibrant but soft, matching the Hallmaster aesthetic
const BOOKING_COLORS = [
  { bg: '#e0f2fe', text: '#0c4a6e', border: '#38bdf8' },   // sky
  { bg: '#dcfce7', text: '#14532d', border: '#4ade80' },   // green
  { bg: '#fef3c7', text: '#78350f', border: '#fbbf24' },   // amber
  { bg: '#fce7f3', text: '#831843', border: '#f472b6' },   // pink
  { bg: '#e0e7ff', text: '#3730a3', border: '#818cf8' },   // indigo
  { bg: '#ccfbf1', text: '#134e4a', border: '#2dd4bf' },   // teal
  { bg: '#fff7ed', text: '#7c2d12', border: '#fb923c' },   // orange
  { bg: '#f3e8ff', text: '#581c87', border: '#c084fc' },   // purple
];

function getBookingColor(index: number) {
  return BOOKING_COLORS[index % BOOKING_COLORS.length];
}

// Simple hash for consistent color assignment per booking name
function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash);
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
    // Fetch bookings for the visible month range
    const startDate = formatDate(year, month, 1);
    const endDate = formatDate(year, month, getDaysInMonth(year, month));

    const { data, error } = await supabase
      .from('bookings')
      .select('*')
      .eq('status', 'confirmed')
      .gte('date', startDate)
      .lte('date', endDate)
      .order('date', { ascending: true });

    if (!error && data) {
      setBookings(data);
    }
    setLoading(false);
  }

  const bookingsByDate = useMemo(() => {
    const map = new Map<string, Booking[]>();
    bookings.forEach(booking => {
      const dateKey = booking.date;
      const existing = map.get(dateKey) || [];
      map.set(dateKey, [...existing, booking]);
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
                {dayBookings.slice(0, 3).map((booking) => {
                  const color = getBookingColor(hashString(booking.name));
                  return (
                    <div
                      key={booking.id}
                      className="booking-cal-event"
                      style={{
                        backgroundColor: color.bg,
                        color: color.text,
                        borderLeft: `3px solid ${color.border}`,
                      }}
                      title={`${booking.name}${booking.event_type ? ` - ${booking.event_type}` : ''}`}
                    >
                      <span className="booking-cal-event-name">{booking.name}</span>
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
        <span className="booking-cal-legend-text">
          Showing confirmed bookings only
        </span>
      </div>
    </div>
  );
}
