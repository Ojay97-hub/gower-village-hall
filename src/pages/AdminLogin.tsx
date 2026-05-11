import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabaseClient';
import { Lock, Mail, AlertCircle, Loader2, User as UserIcon, ArrowLeft, ChevronRight, CheckCircle, MailCheck } from 'lucide-react';

type AdminUser = { id: string; email: string; name: string; initials: string };

function getErrorMessage(error: Error): string {
    const msg = error.message?.toLowerCase() ?? '';
    if (msg.includes('not authorized')) {
        return error.message; // Let our custom auth message pass through
    }
    if (msg.includes('invalid login credentials') || msg.includes('invalid_credentials')) {
        return 'Invalid email or password. Please check your credentials and try again.';
    }
    if (msg.includes('email not confirmed')) {
        return 'Your email has not been confirmed. Please check your inbox.';
    }
    if (msg.includes('user not found') || msg.includes('no user found')) {
        return 'No account found with this email address.';
    }
    if (msg.includes('too many requests') || msg.includes('rate limit')) {
        return 'Too many login attempts. Please wait a moment and try again.';
    }
    if (msg.includes('network') || msg.includes('fetch') || msg.includes('failed to fetch')) {
        return 'Network error. Please check your internet connection and try again.';
    }
    return error.message || 'An unexpected error occurred. Please try again.';
}

export function AdminLogin() {
    type LoginStep = 'select-user' | 'enter-password' | 'manual-login' | 'set-password' | 'forgot-password';

    // Detect invite/recovery flow. The flag is set in main.tsx before any lazy-loading
    // happens, because by the time this component mounts Supabase may have already
    // processed and cleared the ?code= query param from the URL.
    const [isInviteFlow] = useState(() => {
        const flag = sessionStorage.getItem('supabase_invite_flow') === '1';
        if (flag) sessionStorage.removeItem('supabase_invite_flow'); // consume it
        return flag;
    });

    const [isRecoveryFlow, setIsRecoveryFlow] = useState(() => {
        const fromSession = sessionStorage.getItem('supabase_recovery_flow') === '1';
        // localStorage persists across tabs (email links open in new tabs)
        const fromLocal = localStorage.getItem('supabase_pending_recovery') === '1';
        if (fromSession) sessionStorage.removeItem('supabase_recovery_flow');
        if (fromLocal) localStorage.removeItem('supabase_pending_recovery');
        return fromSession || fromLocal;
    });

    const [adminUsers, setAdminUsers] = useState<AdminUser[]>([]);
    const [loadingUsers, setLoadingUsers] = useState(true);
    const [step, setStep] = useState<LoginStep>('select-user');
    const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [displayName, setDisplayName] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [settingPassword, setSettingPassword] = useState(false);
    const [resetEmail, setResetEmail] = useState('');
    const [resetLoading, setResetLoading] = useState(false);
    const [resetSent, setResetSent] = useState(false);
    const [rememberMe, setRememberMe] = useState(() => {
        return localStorage.getItem('admin_remember_me') === 'true';
    });

    const { signIn, isAdmin, isLoading } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const from = location.state?.from?.pathname || '/';

    // Fetch the list of admin users to populate "Choose an Account"
    useEffect(() => {
        async function loadAdminUsers() {
            try {
                const res = await fetch('/api/admin/list-login-users');
                if (!res.ok) return;
                const { users: raw } = await res.json();
                const users: AdminUser[] = (raw || []).map((u: { id: string; email: string; name: string }) => ({
                    id: u.id,
                    email: u.email,
                    name: u.name,
                    initials: (u.name || u.email).charAt(0).toUpperCase(),
                }));
                setAdminUsers(users);
            } catch (e) {
                console.error('Failed to load admin users:', e);
            } finally {
                setLoadingUsers(false);
            }
        }
        loadAdminUsers();
    }, []);

    // Listen for Supabase PASSWORD_RECOVERY event as a reliable fallback
    // (the event fires even if the URL-based flag was missed due to timing)
    useEffect(() => {
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
            if (event === 'PASSWORD_RECOVERY') {
                setIsRecoveryFlow(true);
                setStep('set-password');
            }
        });
        return () => subscription.unsubscribe();
    }, []);

    // Auto-redirect if already authenticated; for invite/recovery flow, prompt password setup first
    useEffect(() => {
        if (!isLoading && isAdmin) {
            if ((isInviteFlow || isRecoveryFlow) && step !== 'set-password') {
                setStep('set-password');
            } else if (!isInviteFlow && !isRecoveryFlow) {
                navigate(from, { replace: true });
            }
        }
    }, [isAdmin, isLoading, navigate, from, isInviteFlow, isRecoveryFlow, step]);

    const handleSetPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        if (!isRecoveryFlow && !displayName.trim()) {
            setError('Please enter your name.');
            return;
        }
        if (newPassword.length < 8) {
            setError('Password must be at least 8 characters.');
            return;
        }
        if (newPassword !== confirmPassword) {
            setError("Passwords don't match.");
            return;
        }
        setSettingPassword(true);
        const updatePayload: Parameters<typeof supabase.auth.updateUser>[0] = { password: newPassword };
        if (!isRecoveryFlow && displayName.trim()) {
            updatePayload.data = { name: displayName.trim() };
        }
        const { error: updateError } = await supabase.auth.updateUser(updatePayload);
        setSettingPassword(false);
        if (updateError) {
            setError(updateError.message);
        } else {
            navigate(from, { replace: true });
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        if (rememberMe) {
            localStorage.setItem('admin_remember_me', 'true');
        } else {
            localStorage.removeItem('admin_remember_me');
        }

        const targetEmail = step === 'enter-password' && selectedUser ? selectedUser.email : email;
        const { error, isAdmin: signedInAsAdmin } = await signIn(targetEmail, password);

        if (error) {
            setError(getErrorMessage(error));
            setLoading(false);
        } else if (signedInAsAdmin) {
            navigate(from);
        } else {
            // Fallback just in case
            setError('You are not authorized to access the admin panel.');
            setLoading(false);
        }
    };

    const handleUserSelect = (user: AdminUser) => {
        setSelectedUser(user);
        setPassword('');
        setError(null);
        setStep('enter-password');
    };

    const handleBack = () => {
        setStep('select-user');
        setSelectedUser(null);
        setError(null);
        setPassword('');
    };

    const handleOpenForgotPassword = () => {
        setResetEmail(selectedUser?.email ?? email);
        setResetSent(false);
        setError(null);
        setStep('forgot-password');
    };

    const handleForgotPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setResetLoading(true);
        // Use localStorage so the flag survives across tabs (email links open in a new tab)
        localStorage.setItem('supabase_pending_recovery', '1');
        const { error: resetError } = await supabase.auth.resetPasswordForEmail(resetEmail, {
            redirectTo: `${window.location.origin}/admin/login`,
        });
        setResetLoading(false);
        if (resetError) {
            localStorage.removeItem('supabase_pending_recovery');
            setError(resetError.message);
        } else {
            setResetSent(true);
        }
    };

    // Show nothing while checking session (avoids flash)
    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <Loader2 className="h-8 w-8 text-primary-600 animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center py-12 px-4">

            {/* Header / Logo */}
            <div className="mb-8 text-center">
                <Lock className="h-10 w-10 text-primary-600 mx-auto mb-4" />
                <h2 className="text-3xl font-bold text-gray-900 tracking-tight font-serif">
                    Hall Administration
                </h2>
            </div>

            <div className="w-full" style={{ maxWidth: '440px' }}>
                <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100 transition-all duration-300">

                    {/* View: User Selection */}
                    {step === 'select-user' && (
                        <div className="p-8 pt-10">
                            <h3 className="text-xl font-bold text-gray-900 mb-6 text-center">
                                Choose an Account
                            </h3>
                            <div className="space-y-3">
                                {loadingUsers ? (
                                    <div className="flex justify-center py-4">
                                        <Loader2 className="w-5 h-5 text-gray-400 animate-spin" />
                                    </div>
                                ) : (
                                    adminUsers.map((user) => (
                                        <button
                                            key={user.id}
                                            onClick={() => handleUserSelect(user)}
                                            className="w-full group flex items-center justify-between p-4 rounded-xl border border-gray-100 hover:border-primary-200 hover:bg-primary-50 transition-all duration-200 text-left"
                                        >
                                            <div className="flex items-center space-x-4">
                                                <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-lg shrink-0">
                                                    {user.initials}
                                                </div>
                                                <div>
                                                    <div className="font-semibold text-gray-900 group-hover:text-primary-800 transition-colors">
                                                        {user.name || user.email}
                                                    </div>
                                                    <div className="text-sm text-gray-500">
                                                        {user.name ? user.email : 'Administrator'}
                                                    </div>
                                                </div>
                                            </div>
                                            <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-primary-600 transition-colors" />
                                        </button>
                                    ))
                                )}
                            </div>

                            <div className="mt-8 pt-6 border-t border-gray-100">
                                <button
                                    onClick={() => {
                                        setStep('manual-login');
                                        setError(null);
                                    }}
                                    className="w-full flex items-center justify-center space-x-2 p-3 text-sm font-medium text-gray-600 hover:text-primary-600 hover:bg-gray-50 rounded-lg transition-colors"
                                >
                                    <UserIcon className="w-5 h-5" />
                                    <span>Log in with another account</span>
                                </button>
                            </div>
                        </div>
                    )}

                    {/* View: Password Entry & Manual Login */}
                    {(step === 'enter-password' || step === 'manual-login') && (
                        <div className="p-8 pt-6">
                            <button
                                type="button"
                                onClick={handleBack}
                                className="flex items-center text-sm font-medium text-gray-500 hover:text-gray-900 mb-6 transition-colors"
                            >
                                <ArrowLeft className="w-4 h-4 mr-1" />
                                Back
                            </button>

                            {step === 'enter-password' && selectedUser && (
                                <div className="text-center mb-8">
                                    <div className="w-20 h-20 mx-auto rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-3xl mb-4 shadow-sm">
                                        {selectedUser.initials}
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900">
                                        {selectedUser.name ? `Welcome back, ${selectedUser.name}` : 'Welcome back'}
                                    </h3>
                                    <p className="text-sm text-gray-500 mt-1">
                                        {selectedUser.email}
                                    </p>
                                </div>
                            )}

                            {step === 'manual-login' && (
                                <div className="text-center mb-8 mt-4">
                                    <h3 className="text-xl font-bold text-gray-900">
                                        Manual Login
                                    </h3>
                                    <p className="text-sm text-gray-500 mt-1">
                                        Enter your email and password
                                    </p>
                                </div>
                            )}

                            <form onSubmit={handleSubmit}>
                                {error && (
                                    <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2 mb-6 animate-in fade-in slide-in-from-top-2">
                                        <AlertCircle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
                                        <p className="text-sm text-red-600">{error}</p>
                                    </div>
                                )}

                                <div className="space-y-5">
                                    {step === 'manual-login' && (
                                        <div>
                                            <div className="flex items-center gap-2 mb-2">
                                                <Mail className="h-4 w-4 text-gray-500" />
                                                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                                                    Email address
                                                </label>
                                            </div>
                                            <input
                                                id="email"
                                                name="email"
                                                type="email"
                                                autoComplete="email"
                                                required
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                className="block w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                                                placeholder="admin@example.com"
                                                disabled={loading}
                                            />
                                        </div>
                                    )}

                                    <div>
                                        <div className="flex items-center gap-2 mb-2">
                                            <Lock className="h-4 w-4 text-gray-500" />
                                            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                                                Password
                                            </label>
                                        </div>
                                        <input
                                            id="password"
                                            name="password"
                                            type="password"
                                            autoComplete="current-password"
                                            required
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            autoFocus={step === 'enter-password'}
                                            className="block w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all text-lg tracking-widest placeholder:tracking-normal"
                                            placeholder="••••••••"
                                            disabled={loading}
                                        />
                                    </div>

                                    <div className="flex items-center justify-between pt-2">
                                        <div className="flex items-center gap-2">
                                            <input
                                                id="remember-me"
                                                name="remember-me"
                                                type="checkbox"
                                                checked={rememberMe}
                                                onChange={(e) => setRememberMe(e.target.checked)}
                                                className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500 cursor-pointer"
                                                disabled={loading}
                                            />
                                            <label htmlFor="remember-me" className="text-sm text-gray-600 cursor-pointer select-none">
                                                Keep me signed in
                                            </label>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={handleOpenForgotPassword}
                                            className="text-sm text-primary-600 hover:text-primary-700 font-medium transition-colors"
                                        >
                                            Forgot password?
                                        </button>
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading || !password}
                                    className="w-full mt-8 flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-xl text-sm font-semibold text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg"
                                >
                                    {loading ? (
                                        <>
                                            <Loader2 className="h-5 w-5 animate-spin" />
                                            Signing in…
                                        </>
                                    ) : (
                                        'Continue'
                                    )}
                                </button>
                            </form>
                        </div>
                    )}

                    {/* View: Forgot Password */}
                    {step === 'forgot-password' && (
                        <div className="p-8 pt-6">
                            <button
                                type="button"
                                onClick={() => setStep(selectedUser ? 'enter-password' : 'manual-login')}
                                className="flex items-center text-sm font-medium text-gray-500 hover:text-gray-900 mb-6 transition-colors"
                            >
                                <ArrowLeft className="w-4 h-4 mr-1" />
                                Back
                            </button>

                            {resetSent ? (
                                <div className="text-center py-4">
                                    <MailCheck className="h-12 w-12 text-primary-600 mx-auto mb-4" />
                                    <h3 className="text-xl font-bold text-gray-900 mb-2">Check your inbox</h3>
                                    <p className="text-sm text-gray-500 leading-relaxed">
                                        We've sent a password reset link to{' '}
                                        <span className="font-medium text-gray-700">{resetEmail}</span>.
                                        Follow the link in the email to set a new password.
                                    </p>
                                    <p className="text-xs text-gray-400 mt-4">Didn't receive it? Check your spam folder.</p>
                                </div>
                            ) : (
                                <>
                                    <div className="text-center mb-8 mt-4">
                                        <h3 className="text-xl font-bold text-gray-900">Reset Password</h3>
                                        <p className="text-sm text-gray-500 mt-1">
                                            We'll send a reset link to your email address.
                                        </p>
                                    </div>

                                    <form onSubmit={handleForgotPassword}>
                                        {error && (
                                            <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2 mb-6 animate-in fade-in slide-in-from-top-2">
                                                <AlertCircle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
                                                <p className="text-sm text-red-600">{error}</p>
                                            </div>
                                        )}

                                        <div>
                                            <div className="flex items-center gap-2 mb-2">
                                                <Mail className="h-4 w-4 text-gray-500" />
                                                <label htmlFor="reset-email" className="block text-sm font-medium text-gray-700">
                                                    Email address
                                                </label>
                                            </div>
                                            <input
                                                id="reset-email"
                                                type="email"
                                                autoComplete="email"
                                                required
                                                autoFocus
                                                value={resetEmail}
                                                onChange={(e) => setResetEmail(e.target.value)}
                                                className="block w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                                                placeholder="admin@example.com"
                                                disabled={resetLoading}
                                            />
                                        </div>

                                        <button
                                            type="submit"
                                            disabled={resetLoading || !resetEmail}
                                            className="w-full mt-6 flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-xl text-sm font-semibold text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg"
                                        >
                                            {resetLoading ? (
                                                <>
                                                    <Loader2 className="h-5 w-5 animate-spin" />
                                                    Sending…
                                                </>
                                            ) : (
                                                'Send reset link'
                                            )}
                                        </button>
                                    </form>
                                </>
                            )}
                        </div>
                    )}

                    {/* View: Set Password (invite / recovery flow) */}
                    {step === 'set-password' && (
                        <div className="p-8 pt-10">
                            <div className="text-center mb-8">
                                <CheckCircle className="h-12 w-12 text-primary-600 mx-auto mb-4" />
                                <h3 className="text-xl font-bold text-gray-900">
                                    {isRecoveryFlow ? 'Set a new password' : 'Welcome to the team!'}
                                </h3>
                                <p className="text-sm text-gray-500 mt-2">
                                    {isRecoveryFlow
                                        ? 'Choose a new password for your admin account.'
                                        : 'Set a password to complete your admin account setup.'}
                                </p>
                            </div>

                            <form onSubmit={handleSetPassword} className="space-y-5">
                                {error && (
                                    <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2">
                                        <AlertCircle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
                                        <p className="text-sm text-red-600">{error}</p>
                                    </div>
                                )}

                                {!isRecoveryFlow && (
                                    <div>
                                        <div className="flex items-center gap-2 mb-2">
                                            <UserIcon className="h-4 w-4 text-gray-500" />
                                            <label htmlFor="display-name" className="block text-sm font-medium text-gray-700">
                                                Your Name
                                            </label>
                                        </div>
                                        <input
                                            id="display-name"
                                            type="text"
                                            autoComplete="name"
                                            required
                                            autoFocus
                                            value={displayName}
                                            onChange={(e) => setDisplayName(e.target.value)}
                                            className="block w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                                            placeholder="e.g. Joe Bloggs"
                                            disabled={settingPassword}
                                        />
                                    </div>
                                )}

                                <div>
                                    <div className="flex items-center gap-2 mb-2">
                                        <Lock className="h-4 w-4 text-gray-500" />
                                        <label htmlFor="new-password" className="block text-sm font-medium text-gray-700">
                                            New Password
                                        </label>
                                    </div>
                                    <input
                                        id="new-password"
                                        type="password"
                                        autoComplete="new-password"
                                        required
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        className="block w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all text-lg tracking-widest placeholder:tracking-normal"
                                        placeholder="••••••••"
                                        disabled={settingPassword}
                                    />
                                </div>

                                <div>
                                    <div className="flex items-center gap-2 mb-2">
                                        <Lock className="h-4 w-4 text-gray-500" />
                                        <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700">
                                            Confirm Password
                                        </label>
                                    </div>
                                    <input
                                        id="confirm-password"
                                        type="password"
                                        autoComplete="new-password"
                                        required
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        className="block w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all text-lg tracking-widest placeholder:tracking-normal"
                                        placeholder="••••••••"
                                        disabled={settingPassword}
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={settingPassword || !newPassword || !confirmPassword}
                                    className="w-full mt-4 flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-xl text-sm font-semibold text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg"
                                >
                                    {settingPassword ? (
                                        <>
                                            <Loader2 className="h-5 w-5 animate-spin" />
                                            Saving…
                                        </>
                                    ) : (
                                        'Set Password & Continue'
                                    )}
                                </button>
                            </form>
                        </div>
                    )}

                </div>

                <p className="text-center text-xs text-gray-400 mt-8">
                    &copy; 2026 Penmaen & Nicholaston Village Hall
                </p>
            </div>
        </div>
    );
}
