import { describe, it, expect } from 'vitest';
import {
    getActivityDatesForMonth,
    getNextOccurrence,
    describeRecurrence,
    toDateKey,
    RecurringSchedulable,
} from '../src/lib/recurrence';

const base: RecurringSchedulable = {
    schedule: null,
    schedule_date: null,
    recurrence_type: 'none',
    recurrence_day: null,
    recurrence_week: null,
    recurrence_start_date: null,
    recurrence_end_date: null,
};

const keys = (activity: RecurringSchedulable, year: number, month: number) =>
    getActivityDatesForMonth(activity, year, month).map(toDateKey);

describe('weekly recurrence', () => {
    const weekly: RecurringSchedulable = { ...base, recurrence_type: 'weekly', recurrence_day: 2 }; // Tuesdays

    it('returns every matching weekday in the month', () => {
        // August 2026 Tuesdays: 4, 11, 18, 25
        expect(keys(weekly, 2026, 7)).toEqual(['2026-08-04', '2026-08-11', '2026-08-18', '2026-08-25']);
    });

    it('respects the start date ("from this date")', () => {
        const fromMid = { ...weekly, recurrence_start_date: '2026-08-12' };
        expect(keys(fromMid, 2026, 7)).toEqual(['2026-08-18', '2026-08-25']);
        expect(keys(fromMid, 2026, 6)).toEqual([]); // July: before start
    });

    it('respects the end date', () => {
        const ending = { ...weekly, recurrence_end_date: '2026-08-12' };
        expect(keys(ending, 2026, 7)).toEqual(['2026-08-04', '2026-08-11']);
        expect(keys(ending, 2026, 8)).toEqual([]); // September: after end
    });
});

describe('fortnightly recurrence', () => {
    // First session Tuesday 4 August 2026, repeating every 2 weeks
    const fortnightly: RecurringSchedulable = {
        ...base,
        recurrence_type: 'fortnightly',
        recurrence_day: 2,
        recurrence_start_date: '2026-08-04',
    };

    it('returns alternate weeks anchored to the start date', () => {
        expect(keys(fortnightly, 2026, 7)).toEqual(['2026-08-04', '2026-08-18']);
        // September: 1 Sep (28 days after anchor), 15 Sep, 29 Sep
        expect(keys(fortnightly, 2026, 8)).toEqual(['2026-09-01', '2026-09-15', '2026-09-29']);
    });

    it('keeps the cadence across a DST boundary', () => {
        // UK clocks go back 25 Oct 2026; cadence should stay 14 days apart
        expect(keys(fortnightly, 2026, 9)).toEqual(['2026-10-13', '2026-10-27']);
        expect(keys(fortnightly, 2026, 10)).toEqual(['2026-11-10', '2026-11-24']);
    });

    it('derives the weekday from the anchor when recurrence_day is missing', () => {
        const noDay = { ...fortnightly, recurrence_day: null };
        expect(keys(noDay, 2026, 7)).toEqual(['2026-08-04', '2026-08-18']);
    });

    it('has no occurrences before the first session', () => {
        expect(keys(fortnightly, 2026, 6)).toEqual([]);
    });
});

describe('monthly recurrence', () => {
    it('returns the nth weekday of the month', () => {
        const firstSaturday: RecurringSchedulable = {
            ...base, recurrence_type: 'monthly', recurrence_day: 6, recurrence_week: 1,
        };
        expect(keys(firstSaturday, 2026, 7)).toEqual(['2026-08-01']);
        expect(keys(firstSaturday, 2026, 8)).toEqual(['2026-09-05']);
    });

    it('supports "last" week', () => {
        const lastFriday: RecurringSchedulable = {
            ...base, recurrence_type: 'monthly', recurrence_day: 5, recurrence_week: -1,
        };
        expect(keys(lastFriday, 2026, 7)).toEqual(['2026-08-28']);
    });
});

describe('one-off and legacy schedules', () => {
    it('returns a schedule_date only in its own month', () => {
        const oneOff = { ...base, schedule_date: '2026-08-15' };
        expect(keys(oneOff, 2026, 7)).toEqual(['2026-08-15']);
        expect(keys(oneOff, 2026, 8)).toEqual([]);
    });

    it('still parses legacy text schedules', () => {
        const legacy = { ...base, recurrence_type: null, schedule: 'First Saturday, 10:30 - 12:30' };
        expect(keys(legacy, 2026, 7)).toEqual(['2026-08-01']);
    });

    it('prefers structured recurrence over legacy text', () => {
        const both: RecurringSchedulable = {
            ...base,
            schedule: 'Every Monday',
            recurrence_type: 'monthly',
            recurrence_day: 6,
            recurrence_week: 1,
        };
        expect(keys(both, 2026, 7)).toEqual(['2026-08-01']);
    });
});

describe('getNextOccurrence', () => {
    it('finds the next date on or after the given day', () => {
        const firstSaturday: RecurringSchedulable = {
            ...base, recurrence_type: 'monthly', recurrence_day: 6, recurrence_week: 1,
        };
        const next = getNextOccurrence(firstSaturday, new Date(2026, 7, 2)); // 2 Aug, after 1 Aug
        expect(next && toDateKey(next)).toBe('2026-09-05');
    });

    it('returns null when the recurrence has ended', () => {
        const ended: RecurringSchedulable = {
            ...base, recurrence_type: 'weekly', recurrence_day: 2, recurrence_end_date: '2026-01-01',
        };
        expect(getNextOccurrence(ended, new Date(2026, 7, 1))).toBeNull();
    });
});

describe('describeRecurrence', () => {
    it('describes each recurrence type', () => {
        expect(describeRecurrence({ ...base, recurrence_type: 'weekly', recurrence_day: 2 }))
            .toBe('Every Tuesday');
        expect(describeRecurrence({ ...base, recurrence_type: 'fortnightly', recurrence_start_date: '2020-08-04' }))
            .toBe('Fortnightly on Tuesdays');
        expect(describeRecurrence({ ...base, recurrence_type: 'monthly', recurrence_day: 6, recurrence_week: 1 }))
            .toBe('First Saturday of the month');
    });

    it('mentions a future start date', () => {
        const future = new Date();
        future.setDate(future.getDate() + 30);
        const desc = describeRecurrence({
            ...base,
            recurrence_type: 'weekly',
            recurrence_day: 2,
            recurrence_start_date: toDateKey(future),
        });
        expect(desc).toMatch(/^Every Tuesday from /);
    });

    it('returns null for non-recurring activities', () => {
        expect(describeRecurrence(base)).toBeNull();
        expect(describeRecurrence({ ...base, schedule_date: '2026-08-15' })).toBeNull();
    });
});

describe('exception filtering', () => {
    const weekly: RecurringSchedulable = { ...base, recurrence_type: 'weekly', recurrence_day: 4 }; // Thursdays

    it('omits a date present in exceptionDates', () => {
        // September 2026 Thursdays: 3, 10, 17, 24
        const exceptions = new Set(['2026-09-24']);
        expect(getActivityDatesForMonth(weekly, 2026, 8, exceptions).map(toDateKey))
            .not.toContain('2026-09-24');
    });

    it('leaves other occurrences in the month untouched', () => {
        const exceptions = new Set(['2026-09-24']);
        const withExceptions = getActivityDatesForMonth(weekly, 2026, 8, exceptions).map(toDateKey);
        const withoutExceptions = getActivityDatesForMonth(weekly, 2026, 8).map(toDateKey);
        expect(withExceptions).toEqual(withoutExceptions.filter(d => d !== '2026-09-24'));
    });

    it('is a no-op when exceptionDates is omitted or empty', () => {
        expect(getActivityDatesForMonth(weekly, 2026, 8)).toEqual(getActivityDatesForMonth(weekly, 2026, 8, undefined));
        expect(getActivityDatesForMonth(weekly, 2026, 8, new Set())).toEqual(getActivityDatesForMonth(weekly, 2026, 8));
    });

    it('getNextOccurrence skips a cancelled next date and returns the following one', () => {
        // September 2026 Thursdays: 3, 10, 17, 24; October's first Thursday is the 1st
        const exceptions = new Set(['2026-09-24']);
        const next = getNextOccurrence(weekly, new Date(2026, 8, 20), exceptions);
        expect(next && toDateKey(next)).toBe('2026-10-01');
    });
});
