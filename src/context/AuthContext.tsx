import React, { createContext, useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { supabaseAdmin } from '../lib/supabaseAdmin';
import { User, Session } from '@supabase/supabase-js';

type AuthContextType = {
    user: User | null;
    session: Session | null;
    isAuthenticated: boolean;
    isAdmin: boolean;
    isMasterAdmin: boolean;
    isLoading: boolean;
    userEmail: string | null;
    adminUsersList: { id: string; email: string; name: string; created_at: string }[];
    fetchAdminUsers: () => Promise<void>;
    inviteAdminUser: (email: string) => Promise<{ error: Error | null }>;
    removeAdminUser: (id: string) => Promise<{ error: Error | null }>;
    signIn: (email: string, password: string) => Promise<{ error: Error | null; isAdmin: boolean }>;
    signOut: () => Promise<void>;
    adminLogout: () => Promise<void>;
    switchUser: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/** Check whether a given user id exists in the admin_users allowlist */
async function checkIsAdmin(userId: string): Promise<boolean> {
    const { data, error } = await supabase
        .from('admin_users')
        .select('user_id')
        .eq('user_id', userId)
        .maybeSingle();

    if (error) {
        console.error('Error checking admin status:', error);
        return false;
    }
    return !!data;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [session, setSession] = useState<Session | null>(null);
    const [isAdmin, setIsAdmin] = useState(false);
    const [isMasterAdmin, setIsMasterAdmin] = useState(false);
    const [adminUsersList, setAdminUsersList] = useState<{ id: string; email: string; name: string; created_at: string }[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();

    // Check if current user is master admin based on VITE_MASTER_ADMIN_EMAILS
    const checkIsMasterAdmin = (email: string | undefined | null): boolean => {
        if (!email) return false;
        const masterEmails = (import.meta.env.VITE_MASTER_ADMIN_EMAILS || '').split(',').map((e: string) => e.trim().toLowerCase());
        return masterEmails.includes(email.toLowerCase());
    };

    // Resolve admin status whenever user changes
    useEffect(() => {
        let cancelled = false;

        async function resolve() {
            if (!user) {
                setIsAdmin(false);
                setIsMasterAdmin(false);
                setIsLoading(false);
                return;
            }
            setIsLoading(true);
            const admin = await checkIsAdmin(user.id);
            if (!cancelled) {
                setIsAdmin(admin);
                setIsMasterAdmin(checkIsMasterAdmin(user.email));
                setIsLoading(false);
            }
        }

        resolve();
        return () => { cancelled = true; };
    }, [user]);

    useEffect(() => {
        // Get initial session
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            setUser(session?.user ?? null);
        });

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            (_event, session) => {
                setSession(session);
                setUser(session?.user ?? null);
            }
        );

        return () => subscription.unsubscribe();
    }, []);

    const fetchAdminUsers = async () => {
        if (!checkIsMasterAdmin(user?.email)) return;
        
        try {
            // Get all auth users
            const { data: authData, error: authError } = await supabaseAdmin.auth.admin.listUsers();
            if (authError) throw authError;

            // Get admin allowed list
            const { data: adminData, error: adminError } = await supabase.from('admin_users').select('*');
            if (adminError) throw adminError;

            // Map and combine
            const allowedIds = new Set(adminData.map(a => a.user_id));
            const adminUsers = authData.users
                .filter(u => allowedIds.has(u.id))
                .map(u => {
                    const adminRecord = adminData.find(a => a.user_id === u.id);
                    return {
                        id: u.id,
                        email: u.email || '',
                        name: u.user_metadata?.name || u.user_metadata?.full_name || '',
                        created_at: adminRecord?.created_at || u.created_at
                    };
                });
            
            setAdminUsersList(adminUsers);
        } catch (error) {
            console.error('Error fetching admin users:', error);
        }
    };

    const inviteAdminUser = async (email: string) => {
        if (!checkIsMasterAdmin(user?.email)) return { error: new Error('Unauthorized') };

        try {
            const { data, error } = await supabaseAdmin.auth.admin.inviteUserByEmail(email, {
                redirectTo: 'https://gower-village-hall-real.vercel.app/admin/login'
            });
            if (error) return { error };

            if (data.user) {
                // Add to admin_users allowlist — use service role to bypass RLS
                const { error: dbError } = await supabaseAdmin.from('admin_users').insert([{ user_id: data.user.id }]);
                // Ignore unique-constraint violations (user already granted access)
                if (dbError && !dbError.message?.includes('duplicate') && !dbError.code?.includes('23505')) {
                    return { error: dbError };
                }
            }

            await fetchAdminUsers();
            return { error: null };
        } catch (error: any) {
            return { error };
        }
    };

    const removeAdminUser = async (id: string) => {
        if (!checkIsMasterAdmin(user?.email)) return { error: new Error('Unauthorized') };
        
        try {
            if (id === user?.id) return { error: new Error('Cannot remove yourself.') };
            
            // Remove from allowlist
            const { error: dbError } = await supabase.from('admin_users').delete().eq('user_id', id);
            if (dbError) return { error: dbError };
            
            await fetchAdminUsers();
            return { error: null };
        } catch (error: any) {
            return { error };
        }
    };

    const signIn = async (email: string, password: string) => {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            return { error, isAdmin: false };
        }

        // Check admin allowlist immediately
        const admin = await checkIsAdmin(data.user.id);
        if (!admin) {
            // Not on the allowlist — sign them out and report
            await supabase.auth.signOut();
            return {
                error: new Error('You are not authorized to access the admin panel.'),
                isAdmin: false,
            };
        }

        return { error: null, isAdmin: true };
    };

    const clearAdminStorage = () => {
        const keysToRemove: string[] = [];
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && (key.startsWith('sb-') || key.includes('admin'))) {
                keysToRemove.push(key);
            }
        }
        keysToRemove.forEach((key) => localStorage.removeItem(key));
    };

    const signOut = async () => {
        await supabase.auth.signOut();
    };

    const adminLogout = async () => {
        await supabase.auth.signOut();
        clearAdminStorage();
        navigate('/');
    };

    const switchUser = async () => {
        await supabase.auth.signOut();
        clearAdminStorage();
        navigate('/admin/login');
    };

    const isAuthenticated = !!user;
    const userEmail = user?.email ?? null;

    return (
        <AuthContext.Provider
            value={{
                user,
                session,
                isAuthenticated,
                isAdmin,
                isMasterAdmin,
                isLoading,
                userEmail,
                adminUsersList,
                fetchAdminUsers,
                inviteAdminUser,
                removeAdminUser,
                signIn,
                signOut,
                adminLogout,
                switchUser,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
