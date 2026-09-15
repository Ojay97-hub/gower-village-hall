import { useState } from 'react';
import { Check, Copy, Mail, Sparkles } from 'lucide-react';

const ENQUIRY_EMAIL = 'info@penmaenandnicholastonvh.co.uk';

const SUBJECT = 'Regular activity enquiry';

const BODY = `Hi,

I'd like to run a regular activity at the village hall.

Activity:
How often (weekly / fortnightly / monthly):
Preferred day and time:
A little about the activity:

Thanks,
`;

const mailtoHref = `mailto:${ENQUIRY_EMAIL}?subject=${encodeURIComponent(SUBJECT)}&body=${encodeURIComponent(BODY)}`;

/** Banner inviting visitors to propose their own regular activity at the hall. */
export function ActivityEnquiryCTA() {
    const [copied, setCopied] = useState(false);

    const handleCopyEmail = async () => {
        try {
            await navigator.clipboard.writeText(ENQUIRY_EMAIL);
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
        } catch {
            // Silently fail — clipboard API unavailable
        }
    };

    return (
        <div className="mt-8 overflow-hidden rounded-2xl border border-primary-100 bg-gradient-to-r from-primary-50 to-white shadow-sm">
            <div className="flex flex-col gap-5 p-6 sm:p-8 md:flex-row md:items-center md:justify-between">
                <div className="flex items-start gap-4">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white text-primary-600 shadow-sm ring-1 ring-primary-100">
                        <Sparkles className="h-5 w-5" />
                    </div>
                    <div>
                        <h3 className="font-serif text-lg font-semibold text-gray-800">
                            Want to run your own activity at the hall?
                        </h3>
                        <p className="mt-1 max-w-xl text-sm leading-6 text-gray-600">
                            Yoga, crafts, a book club, a choir — we'd love to hear your idea. Tell us what
                            you'd like to run and how often (weekly, fortnightly or monthly), and we'll help
                            you find a regular slot.
                        </p>
                    </div>
                </div>
                <div className="flex w-fit shrink-0 flex-col items-start gap-2 md:items-end">
                    <a
                        href={mailtoHref}
                        className="inline-flex w-fit shrink-0 items-center gap-2 rounded-lg bg-primary-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-primary-700"
                    >
                        <Mail className="h-4 w-4" />
                        Email us your idea
                    </a>
                    <button
                        type="button"
                        onClick={handleCopyEmail}
                        className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-500 transition-colors hover:text-gray-700 cursor-pointer"
                    >
                        {copied ? (
                            <>
                                <Check className="h-3.5 w-3.5 text-emerald-600" /> Copied
                            </>
                        ) : (
                            <>
                                <Copy className="h-3.5 w-3.5" /> No mail app? Copy {ENQUIRY_EMAIL}
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
