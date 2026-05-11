import { FormEvent, useMemo, useState } from 'react';
import { AlertCircle, CheckCircle2, Eye, EyeOff, KeyRound, Loader2, Mail, Settings, UserRound } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabaseClient';

type Feedback = {
    type: 'success' | 'error';
    message: string;
} | null;

export function AdminAccount() {
    const { user } = useAuth();

    const profileName = useMemo(
        () => user?.user_metadata?.name || user?.user_metadata?.full_name || '',
        [user]
    );

    const [displayName, setDisplayName] = useState(profileName);
    const [email, setEmail] = useState(user?.email || '');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const [savingProfile, setSavingProfile] = useState(false);
    const [savingEmail, setSavingEmail] = useState(false);
    const [savingPassword, setSavingPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const [profileFeedback, setProfileFeedback] = useState<Feedback>(null);
    const [emailFeedback, setEmailFeedback] = useState<Feedback>(null);
    const [passwordFeedback, setPasswordFeedback] = useState<Feedback>(null);

    const renderFeedback = (feedback: Feedback) => {
        if (!feedback) return null;

        return (
            <div
                className={`rounded-xl border px-4 py-3 text-sm flex items-start gap-2 ${
                    feedback.type === 'success'
                        ? 'bg-emerald-50 border-emerald-100 text-emerald-700'
                        : 'bg-red-50 border-red-100 text-red-600'
                }`}
            >
                {feedback.type === 'success' ? (
                    <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                ) : (
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                )}
                <span>{feedback.message}</span>
            </div>
        );
    };

    const handleProfileSave = async (e: FormEvent) => {
        e.preventDefault();
        setProfileFeedback(null);

        const trimmedName = displayName.trim();
        if (!trimmedName) {
            setProfileFeedback({ type: 'error', message: 'Please enter your name.' });
            return;
        }

        setSavingProfile(true);
        const { error } = await supabase.auth.updateUser({
            data: { name: trimmedName },
        });
        setSavingProfile(false);

        if (error) {
            setProfileFeedback({ type: 'error', message: error.message });
            return;
        }

        setProfileFeedback({ type: 'success', message: 'Your profile details have been updated.' });
    };

    const handleEmailSave = async (e: FormEvent) => {
        e.preventDefault();
        setEmailFeedback(null);

        const trimmedEmail = email.trim().toLowerCase();
        if (!trimmedEmail) {
            setEmailFeedback({ type: 'error', message: 'Please enter an email address.' });
            return;
        }

        if (trimmedEmail === (user?.email || '').toLowerCase()) {
            setEmailFeedback({ type: 'error', message: 'That email address is already on your account.' });
            return;
        }

        setSavingEmail(true);
        const { error } = await supabase.auth.updateUser({ email: trimmedEmail });
        setSavingEmail(false);

        if (error) {
            setEmailFeedback({ type: 'error', message: error.message });
            return;
        }

        setEmailFeedback({
            type: 'success',
            message: 'Email change requested. Check both your current and new inboxes for confirmation instructions.',
        });
    };

    const handlePasswordSave = async (e: FormEvent) => {
        e.preventDefault();
        setPasswordFeedback(null);

        if (newPassword.length < 8) {
            setPasswordFeedback({ type: 'error', message: 'Password must be at least 8 characters long.' });
            return;
        }

        if (newPassword !== confirmPassword) {
            setPasswordFeedback({ type: 'error', message: "Passwords don't match." });
            return;
        }

        setSavingPassword(true);
        const { error } = await supabase.auth.updateUser({ password: newPassword });
        setSavingPassword(false);

        if (error) {
            setPasswordFeedback({ type: 'error', message: error.message });
            return;
        }

        let emailWarning = '';
        try {
            const response = await fetch('/api/send-password-change-confirmation', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: user?.email,
                    name: profileName,
                }),
            });

            if (!response.ok) {
                emailWarning = ' Your password was updated, but the confirmation email could not be sent.';
            }
        } catch {
            emailWarning = ' Your password was updated, but the confirmation email could not be sent.';
        }

        setNewPassword('');
        setConfirmPassword('');
        setPasswordFeedback({
            type: 'success',
            message: `Your password has been updated.${emailWarning || ' A confirmation email has been sent to your inbox.'}`,
        });
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <section className="bg-primary-300 py-16">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-12 h-12 rounded-2xl bg-white/70 flex items-center justify-center shadow-sm">
                            <Settings className="w-6 h-6 text-primary-700" />
                        </div>
                        <div>
                            <h1 className="text-4xl font-bold text-gray-900">Manage Account</h1>
                            <p className="text-lg text-gray-800 mt-1">
                                Update your administrator profile, email address, and password.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            <section className="py-12">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 grid gap-6">
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                        <div className="flex items-start gap-3 mb-5">
                            <div className="w-10 h-10 rounded-xl bg-primary-50 flex items-center justify-center">
                                <UserRound className="w-5 h-5 text-primary-600" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-gray-900">Profile</h2>
                                <p className="text-sm text-gray-500">Update the name shown throughout the admin area.</p>
                            </div>
                        </div>

                        <form onSubmit={handleProfileSave} className="space-y-4">
                            {renderFeedback(profileFeedback)}
                            <div>
                                <label htmlFor="display-name" className="block text-sm font-medium text-gray-700 mb-2">
                                    Display Name
                                </label>
                                <input
                                    id="display-name"
                                    type="text"
                                    value={displayName}
                                    onChange={(e) => setDisplayName(e.target.value)}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all"
                                    placeholder="Your name"
                                    disabled={savingProfile}
                                />
                            </div>
                            <div className="flex justify-end">
                                <button
                                    type="submit"
                                    disabled={savingProfile}
                                    className="flex items-center gap-2 bg-primary-600 text-white px-5 py-2.5 rounded-xl hover:bg-primary-700 transition-colors disabled:opacity-60"
                                >
                                    {savingProfile && <Loader2 className="w-4 h-4 animate-spin" />}
                                    Save Profile
                                </button>
                            </div>
                        </form>
                    </div>

                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                        <div className="flex items-start gap-3 mb-5">
                            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                                <Mail className="w-5 h-5 text-blue-600" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-gray-900">Email Address</h2>
                                <p className="text-sm text-gray-500">Request a change to the email address used to sign in.</p>
                            </div>
                        </div>

                        <form onSubmit={handleEmailSave} className="space-y-4">
                            {renderFeedback(emailFeedback)}
                            <div>
                                <label htmlFor="account-email" className="block text-sm font-medium text-gray-700 mb-2">
                                    Current Sign-in Email
                                </label>
                                <input
                                    id="account-email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all"
                                    disabled={savingEmail}
                                />
                            </div>
                            <p className="text-sm text-gray-500">
                                Supabase may require confirmation through your inbox before the new email address becomes active.
                            </p>
                            <div className="flex justify-end">
                                <button
                                    type="submit"
                                    disabled={savingEmail}
                                    className="flex items-center gap-2 bg-primary-600 text-white px-5 py-2.5 rounded-xl hover:bg-primary-700 transition-colors disabled:opacity-60"
                                >
                                    {savingEmail && <Loader2 className="w-4 h-4 animate-spin" />}
                                    Update Email
                                </button>
                            </div>
                        </form>
                    </div>

                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                        <div className="flex items-start gap-3 mb-5">
                            <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center">
                                <KeyRound className="w-5 h-5 text-amber-600" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-gray-900">Password</h2>
                                <p className="text-sm text-gray-500">Set a new password for your administrator account.</p>
                            </div>
                        </div>

                        <form onSubmit={handlePasswordSave} className="space-y-4">
                            {renderFeedback(passwordFeedback)}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="new-password" className="block text-sm font-medium text-gray-700 mb-2">
                                        New Password
                                    </label>
                                    <div className="relative">
                                        <input
                                            id="new-password"
                                            type={showNewPassword ? 'text' : 'password'}
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                            className="w-full px-4 py-3 pr-12 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all"
                                            placeholder="Minimum 8 characters"
                                            disabled={savingPassword}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowNewPassword((prev) => !prev)}
                                            className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-500 hover:text-primary-600 transition-colors"
                                            aria-label={showNewPassword ? 'Hide password' : 'Show password'}
                                        >
                                            {showNewPassword ? (
                                                <EyeOff className="w-5 h-5" />
                                            ) : (
                                                <Eye className="w-5 h-5" />
                                            )}
                                        </button>
                                    </div>
                                </div>
                                <div>
                                    <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700 mb-2">
                                        Confirm Password
                                    </label>
                                    <div className="relative">
                                        <input
                                            id="confirm-password"
                                            type={showConfirmPassword ? 'text' : 'password'}
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            className="w-full px-4 py-3 pr-12 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all"
                                            placeholder="Re-enter password"
                                            disabled={savingPassword}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowConfirmPassword((prev) => !prev)}
                                            className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-500 hover:text-primary-600 transition-colors"
                                            aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                                        >
                                            {showConfirmPassword ? (
                                                <EyeOff className="w-5 h-5" />
                                            ) : (
                                                <Eye className="w-5 h-5" />
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </div>
                            <div className="flex justify-end">
                                <button
                                    type="submit"
                                    disabled={savingPassword}
                                    className="flex items-center gap-2 bg-primary-600 text-white px-5 py-2.5 rounded-xl hover:bg-primary-700 transition-colors disabled:opacity-60"
                                >
                                    {savingPassword && <Loader2 className="w-4 h-4 animate-spin" />}
                                    Update Password
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </section>
        </div>
    );
}
