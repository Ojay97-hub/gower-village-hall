import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Lock, Mail, AlertCircle, Loader2, User as UserIcon, ArrowLeft, ChevronRight } from 'lucide-react';

// Hardcoded available users for quick switching
const AVAILABLE_USERS = [
    {
        id: '1',
        name: 'Main Admin',
        email: 'admin@penmaenvillagehall.org',
        role: 'Administrator',
        avatarColor: 'bg-blue-100 text-blue-700',
        initials: 'AD'
    },
    {
        id: '2',
        name: 'Events Manager',
        email: 'events@penmaenvillagehall.org',
        role: 'Event Editor',
        avatarColor: 'bg-emerald-100 text-emerald-700',
        initials: 'EV'
    }
];

function getErrorMessage(error: Error): string {
    const msg = error.message?.toLowerCase() ?? '';
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
    type LoginStep = 'select-user' | 'enter-password' | 'manual-login';

    const [step, setStep] = useState<LoginStep>('select-user');
    const [selectedUser, setSelectedUser] = useState<typeof AVAILABLE_USERS[0] | null>(null);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [rememberMe, setRememberMe] = useState(() => {
        return localStorage.getItem('admin_remember_me') === 'true';
    });

    const { signIn, isAdmin, isLoading } = useAuth();
    const navigate = useNavigate();

    // Auto-redirect if already authenticated
    useEffect(() => {
        if (!isLoading && isAdmin) {
            navigate('/hall/events', { replace: true });
        }
    }, [isAdmin, isLoading, navigate]);

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
        const { error } = await signIn(targetEmail, password);

        if (error) {
            setError(getErrorMessage(error));
            setLoading(false);
        } else {
            navigate('/hall/events');
        }
    };

    const handleUserSelect = (user: typeof AVAILABLE_USERS[0]) => {
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
                                {AVAILABLE_USERS.map((user) => (
                                    <button
                                        key={user.id}
                                        onClick={() => handleUserSelect(user)}
                                        className="w-full group flex items-center justify-between p-4 rounded-xl border border-gray-100 hover:border-primary-200 hover:bg-primary-50 transition-all duration-200 text-left"
                                    >
                                        <div className="flex items-center space-x-4">
                                            <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg flex-shrink-0 ${user.avatarColor}`}>
                                                {user.initials}
                                            </div>
                                            <div>
                                                <div className="font-semibold text-gray-900 group-hover:text-primary-800 transition-colors">
                                                    {user.name}
                                                </div>
                                                <div className="text-sm text-gray-500">
                                                    {user.role}
                                                </div>
                                            </div>
                                        </div>
                                        <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-primary-600 transition-colors" />
                                    </button>
                                ))}
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
                                    <div className={`w-20 h-20 mx-auto rounded-full flex items-center justify-center font-bold text-3xl mb-4 shadow-sm ${selectedUser.avatarColor}`}>
                                        {selectedUser.initials}
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900">
                                        Welcome back, {selectedUser.name.split(' ')[0]}
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
                                        <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
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

                                    <div className="flex items-center gap-2 pt-2">
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

                </div>

                <p className="text-center text-xs text-gray-400 mt-8">
                    &copy; 2026 Penmaen & Nicholaston Village Hall
                </p>
            </div>
        </div>
    );
}
