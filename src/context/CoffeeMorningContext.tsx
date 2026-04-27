import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from './AuthContext';

export type CoffeeMorningUpdate = {
    id: string;
    created_at: string;
    updated_at: string;
    created_by: string | null;
    updated_by: string | null;
    title: string;
    slug: string;
    excerpt: string;
    content_markdown: string;
    hero_image_url: string | null;
    event_date: string | null;
    fundraising_for: string | null;
    amount_raised: number | null;
    published: boolean;
    published_at: string | null;
};

type CoffeeMorningContextType = {
    updates: CoffeeMorningUpdate[];
    loading: boolean;
    error: Error | null;
    refreshUpdates: (opts?: { includeDrafts?: boolean }) => Promise<void>;
    createUpdate: (data: Omit<CoffeeMorningUpdate, 'id' | 'created_at' | 'updated_at' | 'created_by' | 'updated_by'>) => Promise<CoffeeMorningUpdate>;
    updateUpdate: (id: string, updates: Partial<CoffeeMorningUpdate>) => Promise<void>;
    deleteUpdate: (id: string, imageUrl?: string | null) => Promise<void>;
    uploadHeroImage: (file: File) => Promise<string>;
};

const CoffeeMorningContext = createContext<CoffeeMorningContextType | undefined>(undefined);

const STORAGE_BUCKET = 'coffee-morning-images';

export function CoffeeMorningProvider({ children }: { children: React.ReactNode }) {
    const [updates, setUpdates] = useState<CoffeeMorningUpdate[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);
    const { isAdmin, isAuthenticated } = useAuth();

    const refreshUpdates = async (opts?: { includeDrafts?: boolean }) => {
        try {
            setLoading(true);
            setError(null);

            let query = supabase
                .from('coffee_morning_updates')
                .select('*')
                .order('event_date', { ascending: false, nullsFirst: false })
                .order('created_at', { ascending: false });

            if (opts?.includeDrafts === false || !isAdmin) {
                query = query.eq('published', true);
            }

            const { data, error } = await query;

            if (error) throw error;
            setUpdates(data as CoffeeMorningUpdate[]);
        } catch (err: any) {
            console.error('Error fetching coffee morning updates:', err);
            setError(err);
        } finally {
            setLoading(false);
        }
    };

    const createUpdate = async (data: Omit<CoffeeMorningUpdate, 'id' | 'created_at' | 'updated_at' | 'created_by' | 'updated_by'>) => {
        try {
            const { data: inserted, error } = await supabase
                .from('coffee_morning_updates')
                .insert([data])
                .select()
                .single();

            if (error) throw error;
            await refreshUpdates({ includeDrafts: isAdmin });
            return inserted as CoffeeMorningUpdate;
        } catch (err) {
            console.error('Error creating coffee morning update:', err);
            throw err;
        }
    };

    const updateUpdate = async (id: string, updates: Partial<CoffeeMorningUpdate>) => {
        try {
            const { error } = await supabase
                .from('coffee_morning_updates')
                .update(updates)
                .eq('id', id);

            if (error) throw error;
            await refreshUpdates({ includeDrafts: isAdmin });
        } catch (err) {
            console.error('Error updating coffee morning update:', err);
            throw err;
        }
    };

    const deleteUpdate = async (id: string, imageUrl?: string | null) => {
        try {
            if (imageUrl && imageUrl.includes(STORAGE_BUCKET)) {
                const urlParts = imageUrl.split(`${STORAGE_BUCKET}/`);
                if (urlParts.length === 2) {
                    const filePath = urlParts[1];
                    const { error: storageError } = await supabase.storage
                        .from(STORAGE_BUCKET)
                        .remove([filePath]);

                    if (storageError) {
                        console.error('Failed to delete image from storage:', storageError);
                    }
                }
            }

            const { error } = await supabase
                .from('coffee_morning_updates')
                .delete()
                .eq('id', id);

            if (error) throw error;
            await refreshUpdates({ includeDrafts: isAdmin });
        } catch (err) {
            console.error('Error deleting coffee morning update:', err);
            throw err;
        }
    };

    const uploadHeroImage = async (file: File): Promise<string> => {
        try {
            const fileExt = file.name.split('.').pop();
            const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
            const filePath = `${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from(STORAGE_BUCKET)
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            const { data } = supabase.storage
                .from(STORAGE_BUCKET)
                .getPublicUrl(filePath);

            return data.publicUrl;
        } catch (err) {
            console.error('Error uploading image:', err);
            throw err;
        }
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            refreshUpdates({ includeDrafts: isAdmin });
        }, 50);
        return () => clearTimeout(timer);
    }, [isAdmin, isAuthenticated]);

    return (
        <CoffeeMorningContext.Provider
            value={{
                updates,
                loading,
                error,
                refreshUpdates,
                createUpdate,
                updateUpdate,
                deleteUpdate,
                uploadHeroImage,
            }}
        >
            {children}
        </CoffeeMorningContext.Provider>
    );
}

export function useCoffeeMorning() {
    const context = useContext(CoffeeMorningContext);
    if (context === undefined) {
        throw new Error('useCoffeeMorning must be used within a CoffeeMorningProvider');
    }
    return context;
}
