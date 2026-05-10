import React, { createContext, useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { User, Session } from '@supabase/supabase-js';

type AdminUser = { id: string; email: string; name: string; created_at: string; roles: string[]; is_master_admin: boolean };

type AuthContextType = {
    user: User | null;
    session: Session | null;
    isAuthenticated: boolean;
    isAdmin: boolean;
    isMasterAdmin: boolean;
    isLoading: boolean;
    userEmail: string | null;
    adminRoles: string[];
    hasRole: (role: string) => boolean;
    isMasterAdminEmail: (email: string | null | undefined) => boolean;
    adminUsersList: AdminUser[];
    fetchAdminUsers: () => Promise<void>;
    inviteAdminUser: (email: string) => Promise<{ error: Error | null; existingUser?: boolean }>;
    removeAdminUser: (id: string) => Promise<{ error: Error | null }>;
    updateAdminUserRoles: (userId: string, roles: string[]) => Promise<{ error: Error | null }>;
    promoteMasterAdmin: (userId: string) => Promise<{ error: Error | null }>;
    demoteMasterAdmin: (userId: string) => Promise<{ error: Error | null }>;
    signIn: (email: string, password: string) => Promise<{ error: Error | null; isAdmin: boolean }>;
    signOut: () => Promise<void>;
    adminLogout: () => Promise<void>;
    switchUser: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/** Fetch admin status + assigned roles for the current user */
async function fetchAdminRecord(userId: string): Promise<{ isAdmin: boolean; roles: string[]; isMasterAdmin: boolean }> {
    const { data, error } = await supabase
        .from('admin_users')
        .select('user_id, roles, is_master_admin')
        .eq('user_id', userId)
        .maybeSingle();

    if (error) {
        console.error('Error checking admin status:', error);
        return { isAdmin: false, roles: [], isMasterAdmin: false };
    }
    return { isAdmin: !!data, roles: data?.roles ?? [], isMasterAdmin: data?.is_master_admin ?? false };
}

/** Build headers including the current Supabase access token for admin API calls. */
async function authHeaders(): Promise<HeadersInit> {
    const { data: { session } } = await supabase.auth.getSession();
    const token = session?.access_token;
    return {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
}

async function parseError(res: Response): Promise<Error> {
    try {
        const body = await res.json();
        return new Error(body?.error || `Request failed (${res.status})`);
    } catch {
        return new Error(`Request failed (${res.status})`);
    }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [session, setSession] = useState<Session | null>(null);
    const [isAdmin, setIsAdmin] = useState(false);
    const [isMasterAdmin, setIsMasterAdmin] = useState(false);
    const [adminRoles, setAdminRoles] = useState<string[]>([]);
    const [adminUsersList, setAdminUsersList] = useState<AdminUser[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();

    const isMasterAdminEmail = (email: string | null | undefined): boolean => {
        if (!email) return false;
        const masterEmails = (import.meta.env.VITE_MASTER_ADMIN_EMAILS || '')
            .split(',')
            .map((e: string) => e.trim().toLowerCase());
        return masterEmails.includes(email.toLowerCase());
    };

    // Resolve admin status + roles whenever user changes.
    // IMPORTANT: We do NOT reset isAdmin/roles to false while re-resolving —
    // doing so causes a brief flicker where AdminRoute sees isAdmin=false and
    // redirects to /admin/login, destroying any open forms (e.g. BlogPostForm).
    // We only clear admin state on actual sign-out (user becomes null).
    useEffect(() => {
        let cancelled = false;

        async function resolve() {
            if (!user) {
                // Actual sign-out — clear everything
                setIsAdmin(false);
                setIsMasterAdmin(false);
                setAdminRoles([]);
                setIsLoading(false);
                return;
            }

            // Keep existing isAdmin/roles values while re-resolving
            // (e.g. during TOKEN_REFRESHED after returning to tab)
            setIsLoading(true);
            const { isAdmin: admin, roles, isMasterAdmin: dbMasterAdmin } = await fetchAdminRecord(user.id);
            if (!cancelled) {
                setIsAdmin(admin);
                setAdminRoles(roles);
                setIsMasterAdmin(isMasterAdminEmail(user.email) || dbMasterAdmin);
                setIsLoading(false);
            }
        }

        resolve();
        return () => { cancelled = true; };
    }, [user]);

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            setUser(session?.user ?? null);
        });

        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            (_event, session) => {
                setSession(session);
                // Only update user if the actual identity changed (sign-in/out).
                // TOKEN_REFRESHED produces a new object reference for the same user,
                // which would trigger the admin-resolve useEffect and cause a loading
                // flicker that can unmount open forms like BlogPostForm.
                setUser(prev => {
                    const newUser = session?.user ?? null;
                    if (prev?.id === newUser?.id) return prev;   // same user — keep stable ref
                    return newUser;
                });
            }
        );

        return () => subscription.unsubscribe();
    }, []);

    /** True if the current user can access a given role-gated section.
     *  Master admins bypass all role checks. */
    const hasRole = (role: string): boolean => {
        if (isMasterAdmin) return true;
        return adminRoles.includes(role);
    };

    const fetchAdminUsers = async () => {
        if (!isMasterAdmin) return;
        try {
            const res = await fetch('/api/admin/list-users', {
                method: 'GET',
                headers: await authHeaders(),
            });
            if (!res.ok) throw await parseError(res);
            const { users } = await res.json();
            setAdminUsersList(users ?? []);
        } catch (error) {
            console.error('Error fetching admin users:', error);
        }
    };

    const inviteAdminUser = async (email: string): Promise<{ error: Error | null; existingUser?: boolean }> => {
        if (!isMasterAdmin) return { error: new Error('Unauthorized') };

        try {
            const res = await fetch('/api/admin/invite-user', {
                method: 'POST',
                headers: await authHeaders(),
                body: JSON.stringify({ email }),
            });
            if (!res.ok) return { error: await parseError(res) };
            const data = await res.json();
            await fetchAdminUsers();
            return { error: null, existingUser: !!data?.existingUser };
        } catch (error: any) {
            return { error };
        }
    };

    const removeAdminUser = async (id: string) => {
        if (!isMasterAdmin) return { error: new Error('Unauthorized') };
        if (id === user?.id) return { error: new Error('Cannot remove yourself.') };

        try {
            const res = await fetch('/api/admin/remove-user', {
                method: 'POST',
                headers: await authHeaders(),
                body: JSON.stringify({ userId: id }),
            });
            if (!res.ok) return { error: await parseError(res) };
            await fetchAdminUsers();
            return { error: null };
        } catch (error: any) {
            return { error };
        }
    };

    const updateAdminUserRoles = async (userId: string, roles: string[]) => {
        if (!isMasterAdmin) return { error: new Error('Unauthorized') };

        try {
            const res = await fetch('/api/admin/update-user-roles', {
                method: 'POST',
                headers: await authHeaders(),
                body: JSON.stringify({ userId, roles }),
            });
            if (!res.ok) return { error: await parseError(res) };
            await fetchAdminUsers();
            return { error: null };
        } catch (error: any) {
            return { error };
        }
    };

    const setMasterAdmin = async (userId: string, isMasterAdminFlag: boolean) => {
        if (!isMasterAdmin) return { error: new Error('Unauthorized') };
        try {
            const res = await fetch('/api/admin/set-master-admin', {
                method: 'POST',
                headers: await authHeaders(),
                body: JSON.stringify({ userId, isMasterAdmin: isMasterAdminFlag }),
            });
            if (!res.ok) return { error: await parseError(res) };
            await fetchAdminUsers();
            return { error: null };
        } catch (error: any) {
            return { error };
        }
    };

    const promoteMasterAdmin = (userId: string) => setMasterAdmin(userId, true);
    const demoteMasterAdmin = (userId: string) => setMasterAdmin(userId, false);

    const signIn = async (email: string, password: string) => {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });

        if (error) return { error, isAdmin: false };

        const admin = await fetchAdminRecord(data.user.id);
        if (!admin.isAdmin) {
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

    const signOut = async () => { await supabase.auth.signOut(); };

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

    return (
        <AuthContext.Provider
            value={{
                user,
                session,
                isAuthenticated: !!user,
                isAdmin,
                isMasterAdmin,
                isLoading,
                userEmail: user?.email ?? null,
                adminRoles,
                hasRole,
                isMasterAdminEmail,
                adminUsersList,
                fetchAdminUsers,
                inviteAdminUser,
                removeAdminUser,
                updateAdminUserRoles,
                promoteMasterAdmin,
                demoteMasterAdmin,
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
