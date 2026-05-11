import { FormEvent, useEffect, useState } from 'react';
import {
    AlertCircle, CheckCircle2, Copy, ExternalLink, Inbox,
    Loader2, Mail, ShieldAlert,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabaseClient';

type MailboxRow = {
    id: string;
    email: string;
    login_url: string;
    notes: string | null;
    updated_at: string;
};

type Feedback = { type: 'success' | 'error'; message: string } | null;

export function AdminMailbox() {
    const { isMasterAdmin } = useAuth();

    const [loading, setLoading] = useState(true);
    const [mailbox, setMailbox] = useState<MailboxRow | null>(null);
    const [copiedField, setCopiedField] = useState<string | null>(null);
    const [loadError, setLoadError] = useState<string | null>(null);

    const [editing, setEditing] = useState(false);
    const [formEmail, setFormEmail] = useState('');
    const [formLoginUrl, setFormLoginUrl] = useState('https://mail.hostinger.com');
    const [formNotes, setFormNotes] = useState('');
    const [saving, setSaving] = useState(false);
    const [feedback, setFeedback] = useState<Feedback>(null);

    const loadMailbox = async () => {
        setLoading(true);
        setLoadError(null);
        const { data, error } = await supabase
            .from('mailbox_credentials')
            .select('id, email, login_url, notes, updated_at')
            .order('updated_at', { ascending: false })
            .limit(1)
            .maybeSingle();

        setLoading(false);
        if (error) {
            setLoadError(error.message);
            return;
        }
        setMailbox(data ?? null);
        if (data) {
            setFormEmail(data.email);
            setFormLoginUrl(data.login_url);
            setFormNotes(data.notes ?? '');
        }
    };

    useEffect(() => {
        loadMailbox();
    }, []);

    const handleCopy = async (label: string, value: string) => {
        try {
            await navigator.clipboard.writeText(value);
            setCopiedField(label);
            setTimeout(() => setCopiedField(prev => (prev === label ? null : prev)), 1500);
        } catch {
            // Silently fail — older browsers
        }
    };

    const handleSave = async (e: FormEvent) => {
        e.preventDefault();
        setFeedback(null);

        const email = formEmail.trim();
        const loginUrl = formLoginUrl.trim() || 'https://mail.hostinger.com';
        const notes = formNotes.trim() || null;

        if (!email) {
            setFeedback({ type: 'error', message: 'Email address is required.' });
            return;
        }

        setSaving(true);
        const payload = { email, login_url: loginUrl, notes };
        const { error } = mailbox
            ? await supabase.from('mailbox_credentials').update(payload).eq('id', mailbox.id)
            : await supabase.from('mailbox_credentials').insert(payload);
        setSaving(false);

        if (error) {
            setFeedback({ type: 'error', message: error.message });
            return;
        }

        setFeedback({ type: 'success', message: 'Mailbox details saved.' });
        setEditing(false);
        await loadMailbox();
    };

    const renderFeedback = () => {
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

    const CopyButton = ({ label, value }: { label: string; value: string }) => (
        <button
            type="button"
            onClick={() => handleCopy(label, value)}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-600 bg-gray-50 hover:bg-gray-100 px-3 py-1.5 rounded-lg border border-gray-200 transition-colors cursor-pointer"
            aria-label={`Copy ${label}`}
        >
            {copiedField === label ? (
                <>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Copied
                </>
            ) : (
                <>
                    <Copy className="w-3.5 h-3.5" /> Copy
                </>
            )}
        </button>
    );

    const openMailbox = () => {
        if (!mailbox) return;
        window.open(mailbox.login_url, '_blank', 'noopener,noreferrer');
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <section className="bg-primary-300 py-16">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-12 h-12 rounded-2xl bg-white/70 flex items-center justify-center shadow-sm">
                            <Inbox className="w-6 h-6 text-primary-700" />
                        </div>
                        <div>
                            <h1 className="text-4xl font-bold text-gray-900">Mailbox</h1>
                            <p className="text-lg text-gray-800 mt-1">
                                Quick access to the shared village hall inbox.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            <section className="py-12">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 grid gap-6">
                    {loading ? (
                        <div className="flex justify-center items-center py-16">
                            <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
                        </div>
                    ) : loadError ? (
                        <div className="rounded-2xl border border-red-100 bg-red-50 text-red-700 px-6 py-5 flex items-start gap-3">
                            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                            <div>
                                <p className="font-semibold">Couldn't load mailbox details</p>
                                <p className="text-sm mt-1">{loadError}</p>
                            </div>
                        </div>
                    ) : !mailbox ? (
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                            <div className="flex items-start gap-3 mb-3">
                                <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center">
                                    <ShieldAlert className="w-5 h-5 text-amber-600" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-gray-900">Mailbox not set up yet</h2>
                                    <p className="text-sm text-gray-500 mt-1">
                                        {isMasterAdmin
                                            ? 'Add the email address so other admins can launch the mailbox from here.'
                                            : 'A master admin needs to add the mailbox details. Ask them to set this up.'}
                                    </p>
                                </div>
                            </div>
                            {isMasterAdmin && (
                                <button
                                    type="button"
                                    onClick={() => setEditing(true)}
                                    className="mt-4 inline-flex items-center gap-2 bg-primary-600 text-white px-5 py-2.5 rounded-xl hover:bg-primary-700 transition-colors cursor-pointer"
                                >
                                    <Mail className="w-4 h-4" />
                                    Add mailbox details
                                </button>
                            )}
                        </div>
                    ) : (
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                            <div className="flex items-start justify-between gap-3 mb-5">
                                <div className="flex items-start gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-primary-50 flex items-center justify-center">
                                        <Mail className="w-5 h-5 text-primary-600" />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-bold text-gray-900">Mailbox details</h2>
                                        <p className="text-sm text-gray-500">
                                            Opens webmail in a new tab. Use your saved password to sign in.
                                        </p>
                                    </div>
                                </div>
                                {isMasterAdmin && !editing && (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setEditing(true);
                                            setFeedback(null);
                                        }}
                                        className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-200 transition-colors cursor-pointer"
                                    >
                                        Edit
                                    </button>
                                )}
                            </div>

                            <button
                                type="button"
                                onClick={openMailbox}
                                className="inline-flex items-center gap-2 bg-primary-600 text-white px-5 py-3 rounded-xl hover:bg-primary-700 transition-colors cursor-pointer shadow-sm"
                            >
                                <ExternalLink className="w-4 h-4" />
                                Open mailbox
                            </button>
                            <p className="text-xs text-gray-400 mt-3 break-all">{mailbox.login_url}</p>

                            <div className="grid gap-4 mt-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Email address
                                    </label>
                                    <div className="flex items-center gap-2">
                                        <div className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl font-mono text-sm break-all">
                                            {mailbox.email}
                                        </div>
                                        <CopyButton label="email" value={mailbox.email} />
                                    </div>
                                </div>

                                <div className="bg-blue-50 border border-blue-100 rounded-xl px-4 py-3 text-sm text-blue-800">
                                    <span className="font-semibold">Password reminder:</span>{' '}
                                    The mailbox password isn't stored here. Save it in your password
                                    manager (1Password, Bitwarden, browser-saved passwords) so it
                                    auto-fills when you open the mailbox.
                                </div>

                                {mailbox.notes && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Notes
                                        </label>
                                        <div className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm whitespace-pre-wrap">
                                            {mailbox.notes}
                                        </div>
                                    </div>
                                )}
                            </div>

                            <p className="text-xs text-gray-400 mt-5">
                                Last updated {new Date(mailbox.updated_at).toLocaleString('en-GB')}
                            </p>
                        </div>
                    )}

                    {/* Edit / Setup form */}
                    {isMasterAdmin && editing && (
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                            <div className="flex items-start gap-3 mb-5">
                                <div className="w-10 h-10 rounded-xl bg-primary-50 flex items-center justify-center">
                                    <Mail className="w-5 h-5 text-primary-600" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-gray-900">
                                        {mailbox ? 'Edit mailbox details' : 'Add mailbox details'}
                                    </h2>
                                    <p className="text-sm text-gray-500">
                                        Only master admins can change these.
                                    </p>
                                </div>
                            </div>

                            <form onSubmit={handleSave} className="space-y-4">
                                {renderFeedback()}

                                <div>
                                    <label htmlFor="mailbox-email" className="block text-sm font-medium text-gray-700 mb-2">
                                        Email address
                                    </label>
                                    <input
                                        id="mailbox-email"
                                        type="email"
                                        value={formEmail}
                                        onChange={(e) => setFormEmail(e.target.value)}
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all"
                                        placeholder="info@penmaenandnicholastonvh.co.uk"
                                        disabled={saving}
                                    />
                                </div>

                                <div>
                                    <label htmlFor="mailbox-url" className="block text-sm font-medium text-gray-700 mb-2">
                                        Login URL
                                    </label>
                                    <input
                                        id="mailbox-url"
                                        type="url"
                                        value={formLoginUrl}
                                        onChange={(e) => setFormLoginUrl(e.target.value)}
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all"
                                        disabled={saving}
                                    />
                                </div>

                                <div>
                                    <label htmlFor="mailbox-notes" className="block text-sm font-medium text-gray-700 mb-2">
                                        Notes (optional)
                                    </label>
                                    <textarea
                                        id="mailbox-notes"
                                        value={formNotes}
                                        onChange={(e) => setFormNotes(e.target.value)}
                                        rows={3}
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all resize-none"
                                        placeholder="Anything else to remember (IMAP host, recovery email, etc.)"
                                        disabled={saving}
                                    />
                                </div>

                                <div className="flex justify-end gap-3">
                                    {mailbox && (
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setEditing(false);
                                                setFormEmail(mailbox.email);
                                                setFormLoginUrl(mailbox.login_url);
                                                setFormNotes(mailbox.notes ?? '');
                                                setFeedback(null);
                                            }}
                                            className="px-5 py-2.5 rounded-xl text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 transition-colors cursor-pointer"
                                            disabled={saving}
                                        >
                                            Cancel
                                        </button>
                                    )}
                                    <button
                                        type="submit"
                                        disabled={saving}
                                        className="flex items-center gap-2 bg-primary-600 text-white px-5 py-2.5 rounded-xl hover:bg-primary-700 transition-colors disabled:opacity-60 cursor-pointer"
                                    >
                                        {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                                        Save
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
}
