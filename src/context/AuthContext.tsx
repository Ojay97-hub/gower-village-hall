import React, { createContext, useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { supabaseAdmin } from '../lib/supabaseAdmin';
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
            const { data: authData, error: authError } = await supabaseAdmin.auth.admin.listUsers();
            if (authError) throw authError;

            const { data: adminData, error: adminError } = await supabaseAdmin
                .from('admin_users')
                .select('*');
            if (adminError) throw adminError;

            const allowedIds = new Set(adminData.map((a: any) => a.user_id));
            const users: AdminUser[] = authData.users
                .filter(u => allowedIds.has(u.id))
                .map(u => {
                    const rec = adminData.find((a: any) => a.user_id === u.id);
                    return {
                        id: u.id,
                        email: u.email || '',
                        name: u.user_metadata?.name || u.user_metadata?.full_name || '',
                        created_at: rec?.created_at || u.created_at,
                        roles: rec?.roles ?? [],
                        is_master_admin: rec?.is_master_admin ?? false,
                    };
                });

            setAdminUsersList(users);
        } catch (error) {
            console.error('Error fetching admin users:', error);
        }
    };

    const inviteAdminUser = async (email: string): Promise<{ error: Error | null; existingUser?: boolean }> => {
        if (!isMasterAdmin) return { error: new Error('Unauthorized') };

        try {
            const { data, error } = await supabaseAdmin.auth.admin.inviteUserByEmail(email, {
                redirectTo: 'https://www.penmaenandnicholastonvh.co.uk/admin/login',
            });
            if (error) return { error };

            // If email_confirmed_at is already set, this is an existing confirmed user —
            // Supabase silently skips sending an invite email in this case.
            const existingUser = !!(data.user?.email_confirmed_at);

            if (data.user) {
                const { error: dbError } = await supabaseAdmin
                    .from('admin_users')
                    .insert([{ user_id: data.user.id }]);
                if (dbError && !dbError.message?.includes('duplicate') && !dbError.code?.includes('23505')) {
                    return { error: dbError };
                }
            }

            await fetchAdminUsers();
            return { error: null, existingUser };
        } catch (error: any) {
            return { error };
        }
    };

    const removeAdminUser = async (id: string) => {
        if (!isMasterAdmin) return { error: new Error('Unauthorized') };

        try {
            if (id === user?.id) return { error: new Error('Cannot remove yourself.') };

            // Remove from allowlist — use service role to bypass RLS
            const { error: dbError } = await supabaseAdmin
                .from('admin_users')
                .delete()
                .eq('user_id', id);
            if (dbError) return { error: dbError };

            // Delete the auth user entirely — Supabase Auth is only used for admin
            // login on this site, so revoking access means full account removal
            const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(id);
            if (authError) return { error: authError };

            await fetchAdminUsers();
            return { error: null };
        } catch (error: any) {
            return { error };
        }
    };

    const updateAdminUserRoles = async (userId: string, roles: string[]) => {
        if (!isMasterAdmin) return { error: new Error('Unauthorized') };

        try {
            const { error } = await supabaseAdmin
                .from('admin_users')
                .update({ roles })
                .eq('user_id', userId);
            if (error) return { error };

            await fetchAdminUsers();
            return { error: null };
        } catch (error: any) {
            return { error };
        }
    };

    const promoteMasterAdmin = async (userId: string) => {
        if (!isMasterAdmin) return { error: new Error('Unauthorized') };
        try {
            const { error } = await supabaseAdmin
                .from('admin_users')
                .update({ is_master_admin: true })
                .eq('user_id', userId);
            if (error) return { error };
            await fetchAdminUsers();
            return { error: null };
        } catch (error: any) {
            return { error };
        }
    };

    const demoteMasterAdmin = async (userId: string) => {
        if (!isMasterAdmin) return { error: new Error('Unauthorized') };
        try {
            const { error } = await supabaseAdmin
                .from('admin_users')
                .update({ is_master_admin: false })
                .eq('user_id', userId);
            if (error) return { error };
            await fetchAdminUsers();
            return { error: null };
        } catch (error: any) {
            return { error };
        }
    };

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
