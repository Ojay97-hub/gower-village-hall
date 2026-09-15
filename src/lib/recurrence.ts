// Shared recurrence engine for regular activities.
//
// Activities can be scheduled three ways, checked in this order:
//   1. Structured recurrence (recurrence_type = weekly | fortnightly | monthly)
//   2. A one-off date (schedule_date)
//   3. Legacy free-text schedule parsing ("First Saturday", "Every Tuesday", ...)
//      kept as a fallback for rows created before structured recurrence existed.

export type RecurrenceType = 'none' | 'weekly' | 'fortnightly' | 'monthly';

export type RecurringSchedulable = {
    schedule: string | null;
    schedule_date: string | null;
    recurrence_type?: RecurrenceType | null;
    recurrence_day?: number | null;        // 0=Sunday .. 6=Saturday
    recurrence_week?: number | null;       // 1..4 = nth occurrence, -1 = last (monthly only)
    recurrence_start_date?: string | null; // no occurrences before this date
    recurrence_end_date?: string | null;   // no occurrences after this date
};

export const WEEKDAY_NAMES = [
    'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday',
];

export const ORDINAL_NAMES: Record<number, string> = {
    1: 'First', 2: 'Second', 3: 'Third', 4: 'Fourth', [-1]: 'Last',
};

/** Parse YYYY-MM-DD (possibly with a time suffix) as a local Date at midnight. */
export function parseISODateLocal(dateStr: string): Date {
    const [y, m, d] = dateStr.slice(0, 10).split('-').map(Number);
    return new Date(y, m - 1, d);
}

export function toDateKey(date: Date): string {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

// ---------------------------------------------------------------------------
// Legacy free-text schedule parsing
// ---------------------------------------------------------------------------

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

function getDowOccurrencesInMonth(year: number, month: number, dow: number): Date[] {
    const dates: Date[] = [];
    const d = new Date(year, month, 1);
    while (d.getDay() !== dow) d.setDate(d.getDate() + 1);
    while (d.getMonth() === month) {
        dates.push(new Date(d));
        d.setDate(d.getDate() + 7);
    }
    return dates;
}

function getNthDowOfMonth(year: number, month: number, dow: number, n: number): Date | null {
    const occurrences = getDowOccurrencesInMonth(year, month, dow);
    if (n === -1) return occurrences[occurrences.length - 1] || null;
    return occurrences[n - 1] || null;
}

function parseLegacySchedule(schedule: string, year: number, month: number): Date[] {
    const lower = schedule.toLowerCase();
    const dates: Date[] = [];

    for (const [ordinalWord, ordinalNum] of Object.entries(ORDINAL_MAP)) {
        if (new RegExp(`\\b${ordinalWord}\\b`).test(lower)) {
            for (const [dayWord, dow] of Object.entries(DOW_MAP)) {
                if (lower.includes(dayWord)) {
                    const date = getNthDowOfMonth(year, month, dow, ordinalNum);
                    if (date) dates.push(date);
                    break;
                }
            }
        }
    }
    if (dates.length > 0) return dates;

    for (const [dayWord, dow] of Object.entries(DOW_MAP)) {
        if (lower.includes(dayWord)) {
            return getDowOccurrencesInMonth(year, month, dow);
        }
    }

    return dates;
}

// ---------------------------------------------------------------------------
// Structured recurrence
// ---------------------------------------------------------------------------

const MS_PER_DAY = 24 * 60 * 60 * 1000;

function daysBetween(a: Date, b: Date): number {
    // Both dates are local midnights; round to absorb DST offsets.
    return Math.round((b.getTime() - a.getTime()) / MS_PER_DAY);
}

function withinBounds(date: Date, activity: RecurringSchedulable): boolean {
    if (activity.recurrence_start_date && date < parseISODateLocal(activity.recurrence_start_date)) {
        return false;
    }
    if (activity.recurrence_end_date && date > parseISODateLocal(activity.recurrence_end_date)) {
        return false;
    }
    return true;
}

function structuredDatesForMonth(activity: RecurringSchedulable, year: number, month: number): Date[] {
    const type = activity.recurrence_type;
    const anchor = activity.recurrence_start_date
        ? parseISODateLocal(activity.recurrence_start_date)
        : null;

    // Fortnightly needs a weekday; derive it from the anchor when not stored.
    const dow = activity.recurrence_day ?? anchor?.getDay() ?? null;
    if (dow === null || dow === undefined) return [];

    if (type === 'monthly') {
        const n = activity.recurrence_week ?? 1;
        const date = getNthDowOfMonth(year, month, dow, n);
        return date && withinBounds(date, activity) ? [date] : [];
    }

    const occurrences = getDowOccurrencesInMonth(year, month, dow)
        .filter(date => withinBounds(date, activity));

    if (type === 'weekly') return occurrences;

    if (type === 'fortnightly') {
        // Without an anchor the cadence is ambiguous; show every week rather
        // than guessing which alternate week is right.
        if (!anchor) return occurrences;
        return occurrences.filter(date => daysBetween(anchor, date) % 14 === 0);
    }

    return [];
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

function hasStructuredRecurrence(activity: RecurringSchedulable): boolean {
    return !!activity.recurrence_type && activity.recurrence_type !== 'none';
}

/**
 * All dates in the given month on which the activity occurs.
 * One-off `schedule_date` activities are included only if they fall in the month.
 *
 * `exceptionDates`, if given, is the set of this activity's own cancelled
 * occurrence dates (as `toDateKey` strings) — matching dates are omitted.
 */
export function getActivityDatesForMonth(
    activity: RecurringSchedulable,
    year: number,
    month: number,
    exceptionDates?: Set<string> | null,
): Date[] {
    let dates: Date[];
    if (hasStructuredRecurrence(activity)) {
        dates = structuredDatesForMonth(activity, year, month);
    } else if (activity.schedule_date) {
        const date = parseISODateLocal(activity.schedule_date);
        dates = date.getFullYear() === year && date.getMonth() === month ? [date] : [];
    } else if (activity.schedule) {
        dates = parseLegacySchedule(activity.schedule, year, month);
    } else {
        dates = [];
    }

    if (!exceptionDates || exceptionDates.size === 0) return dates;
    return dates.filter(date => !exceptionDates.has(toDateKey(date)));
}

/** The next occurrence on or after `from` (defaults to today), or null. Scans 24 months ahead. */
export function getNextOccurrence(
    activity: RecurringSchedulable,
    from: Date = new Date(),
    exceptionDates?: Set<string> | null,
): Date | null {
    const start = new Date(from.getFullYear(), from.getMonth(), from.getDate());
    for (let i = 0; i < 24; i++) {
        const probe = new Date(start.getFullYear(), start.getMonth() + i, 1);
        const match = getActivityDatesForMonth(activity, probe.getFullYear(), probe.getMonth(), exceptionDates)
            .sort((a, b) => a.getTime() - b.getTime())
            .find(date => date >= start);
        if (match) return match;
    }
    return null;
}

/** Human-readable summary of a structured recurrence, e.g. "Fortnightly on Tuesdays from 4 Aug 2026". */
export function describeRecurrence(activity: RecurringSchedulable): string | null {
    if (!hasStructuredRecurrence(activity)) return null;

    const anchor = activity.recurrence_start_date
        ? parseISODateLocal(activity.recurrence_start_date)
        : null;
    const dow = activity.recurrence_day ?? anchor?.getDay();
    if (dow === null || dow === undefined) return null;
    const dayName = WEEKDAY_NAMES[dow];

    let text: string;
    switch (activity.recurrence_type) {
        case 'weekly':
            text = `Every ${dayName}`;
            break;
        case 'fortnightly':
            text = `Fortnightly on ${dayName}s`;
            break;
        case 'monthly': {
            const ordinal = ORDINAL_NAMES[activity.recurrence_week ?? 1] ?? 'First';
            text = `${ordinal} ${dayName} of the month`;
            break;
        }
        default:
            return null;
    }

    const formatShort = (d: Date) =>
        d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (anchor && anchor > today) {
        text += ` from ${formatShort(anchor)}`;
    }
    if (activity.recurrence_end_date) {
        text += ` until ${formatShort(parseISODateLocal(activity.recurrence_end_date))}`;
    }
    return text;
}
