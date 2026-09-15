import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

export type Event = {
    id: string;
    created_at: string;
    title: string;
    description: string | null;
    date: string;
    end_date: string | null;
    start_time: string | null;
    end_time: string | null;
    location: string | null;
    type: string | null;
};

export type RegularActivity = {
    id: string;
    created_at: string;
    title: string;
    description: string | null;
    icon: string;
    schedule: string | null;
    schedule_date: string | null;
    start_time: string | null;
    end_time: string | null;
    color_theme: string;
    action_type: string;
    action_text: string | null;
    action_link: string | null;
    feature_description?: string | null;
    is_featured: boolean | null;
    recurrence_type?: 'none' | 'weekly' | 'fortnightly' | 'monthly' | null;
    recurrence_day?: number | null;
    recurrence_week?: number | null;
    recurrence_start_date?: string | null;
    recurrence_end_date?: string | null;
};

export type RegularActivityException = {
    id: string;
    activity_id: string;
    exception_date: string;
    created_at: string;
};

type EventContextType = {
    events: Event[];
    regularActivities: RegularActivity[];
    activityExceptions: RegularActivityException[];
    exceptionDatesByActivity: Map<string, Set<string>>;
    loading: boolean;
    addEvent: (event: Omit<Event, 'id' | 'created_at'>) => Promise<void>;
    updateEvent: (id: string, updates: Partial<Event>) => Promise<void>;
    deleteEvent: (id: string) => Promise<void>;
    addRegularActivity: (activity: Omit<RegularActivity, 'id' | 'created_at'>) => Promise<void>;
    updateRegularActivity: (id: string, updates: Partial<RegularActivity>) => Promise<void>;
    deleteRegularActivity: (id: string) => Promise<void>;
    cancelActivityOccurrence: (activityId: string, dateStr: string) => Promise<void>;
    restoreActivityOccurrence: (activityId: string, dateStr: string) => Promise<void>;
    refreshEvents: () => Promise<void>;
};

const EventContext = createContext<EventContextType | undefined>(undefined);

export function EventProvider({ children }: { children: React.ReactNode }) {
    const [events, setEvents] = useState<Event[]>([]);
    const [regularActivities, setRegularActivities] = useState<RegularActivity[]>([]);
    const [activityExceptions, setActivityExceptions] = useState<RegularActivityException[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchEvents = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('events')
                .select('*')
                .order('date', { ascending: true });

            if (error) throw error;
            setEvents(data || []);
        } catch (error) {
            console.error('Error fetching events:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchRegularActivities = async () => {
        try {
            const { data, error } = await supabase
                .from('regular_activities')
                .select('*')
                .order('created_at', { ascending: true });

            if (error) throw error;
            setRegularActivities(data || []);
        } catch (error) {
            console.error('Error fetching regular activities:', error);
        }
    };

    const fetchActivityExceptions = async () => {
        try {
            const { data, error } = await supabase
                .from('regular_activity_exceptions')
                .select('*');

            if (error) throw error;
            setActivityExceptions(data || []);
        } catch (error) {
            console.error('Error fetching activity exceptions:', error);
        }
    };

    const refreshData = async () => {
        setLoading(true);
        await Promise.all([fetchEvents(), fetchRegularActivities(), fetchActivityExceptions()]);
        setLoading(false);
    };

    const addEvent = async (event: Omit<Event, 'id' | 'created_at'>) => {
        try {
            const { error } = await supabase.from('events').insert([event]);
            if (error) throw error;
            await fetchEvents();
        } catch (error) {
            console.error('Error adding event:', error);
            throw error;
        }
    };

    const updateEvent = async (id: string, updates: Partial<Event>) => {
        try {
            const { error } = await supabase
                .from('events')
                .update(updates)
                .eq('id', id);
            if (error) throw error;
            await fetchEvents();
        } catch (error) {
            console.error('Error updating event:', error);
            throw error;
        }
    };

    const deleteEvent = async (id: string) => {
        try {
            const { error } = await supabase.from('events').delete().eq('id', id);
            if (error) throw error;
            await fetchEvents();
        } catch (error) {
            console.error('Error deleting event:', error);
            throw error;
        }
    };

    const addRegularActivity = async (activity: Omit<RegularActivity, 'id' | 'created_at'>) => {
        try {
            if (activity.is_featured) {
                await supabase
                    .from('regular_activities')
                    .update({ is_featured: false })
                    .eq('is_featured', true);
            }

            const { error } = await supabase.from('regular_activities').insert([activity]);
            if (error) throw error;
            await fetchRegularActivities();
        } catch (error) {
            console.error('Error adding regular activity:', error);
            throw error;
        }
    };

    const updateRegularActivity = async (id: string, updates: Partial<RegularActivity>) => {
        try {
            if (updates.is_featured) {
                await supabase
                    .from('regular_activities')
                    .update({ is_featured: false })
                    .eq('is_featured', true)
                    .neq('id', id);
            }

            const { error } = await supabase
                .from('regular_activities')
                .update(updates)
                .eq('id', id);
            if (error) throw error;
            await fetchRegularActivities();
        } catch (error) {
            console.error('Error updating regular activity:', error);
            throw error;
        }
    };

    const deleteRegularActivity = async (id: string) => {
        try {
            const { error } = await supabase.from('regular_activities').delete().eq('id', id);
            if (error) throw error;
            await fetchRegularActivities();
        } catch (error) {
            console.error('Error deleting regular activity:', error);
            throw error;
        }
    };

    const cancelActivityOccurrence = async (activityId: string, dateStr: string) => {
        try {
            const { error } = await supabase
                .from('regular_activity_exceptions')
                .insert([{ activity_id: activityId, exception_date: dateStr }]);
            // 23505 = unique violation — this date is already cancelled, treat as success.
            if (error && (error as { code?: string }).code !== '23505') throw error;
            await fetchActivityExceptions();
        } catch (error) {
            console.error('Error cancelling activity occurrence:', error);
            throw error;
        }
    };

    const restoreActivityOccurrence = async (activityId: string, dateStr: string) => {
        try {
            const { error } = await supabase
                .from('regular_activity_exceptions')
                .delete()
                .eq('activity_id', activityId)
                .eq('exception_date', dateStr);
            if (error) throw error;
            await fetchActivityExceptions();
        } catch (error) {
            console.error('Error restoring activity occurrence:', error);
            throw error;
        }
    };

    const exceptionDatesByActivity = useMemo(() => {
        const map = new Map<string, Set<string>>();
        activityExceptions.forEach(exc => {
            const set = map.get(exc.activity_id) ?? new Set<string>();
            set.add(exc.exception_date.slice(0, 10));
            map.set(exc.activity_id, set);
        });
        return map;
    }, [activityExceptions]);

    useEffect(() => {
        refreshData();
    }, []);

    return (
        <EventContext.Provider
            value={{
                events,
                regularActivities,
                activityExceptions,
                exceptionDatesByActivity,
                loading,
                addEvent,
                updateEvent,
                deleteEvent,
                addRegularActivity,
                updateRegularActivity,
                deleteRegularActivity,
                cancelActivityOccurrence,
                restoreActivityOccurrence,
                refreshEvents: refreshData,
            }}
        >
            {children}
        </EventContext.Provider>
    );
}

export function useEvents() {
    const context = useContext(EventContext);
    if (context === undefined) {
        throw new Error('useEvents must be used within an EventProvider');
    }
    return context;
}
