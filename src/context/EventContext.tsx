import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

export type Event = {
    id: string;
    created_at: string;
    title: string;
    description: string | null;
    date: string;
    start_time: string | null;
    end_time: string | null;
    location: string | null;
    type: string | null;
};

type EventContextType = {
    events: Event[];
    loading: boolean;
    addEvent: (event: Omit<Event, 'id' | 'created_at'>) => Promise<void>;
    updateEvent: (id: string, updates: Partial<Event>) => Promise<void>;
    deleteEvent: (id: string) => Promise<void>;
    refreshEvents: () => Promise<void>;
};

const EventContext = createContext<EventContextType | undefined>(undefined);

export function EventProvider({ children }: { children: React.ReactNode }) {
    const [events, setEvents] = useState<Event[]>([]);
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

    useEffect(() => {
        fetchEvents();
    }, []);

    return (
        <EventContext.Provider
            value={{
                events,
                loading,
                addEvent,
                updateEvent,
                deleteEvent,
                refreshEvents: fetchEvents,
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
