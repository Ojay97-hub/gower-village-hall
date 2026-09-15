import { Mail, Sparkles } from 'lucide-react';

const ENQUIRY_EMAIL = 'info@penmaenandnicholastonvh.co.uk';

const [EMAIL_LOCAL, EMAIL_DOMAIN] = ENQUIRY_EMAIL.split('@');

const EXAMPLES = ['Yoga', 'Crafts', 'Book club', 'Choir', 'Fitness', 'Toddler group'];

/** Banner inviting visitors to propose their own regular activity at the hall. */
export function ActivityEnquiryCTA() {
    return (
        <div className="relative mt-10 overflow-hidden rounded-3xl bg-white p-6 shadow-[0_1px_2px_rgba(62,69,55,0.06),0_16px_40px_-20px_rgba(62,69,55,0.35)] ring-1 ring-primary-100 sm:p-8">
            {/* Soft brand bloom for depth — the page background is primary-50, so the card stays white to lift off it */}
            <div
                aria-hidden="true"
                className="pointer-events-none absolute -left-20 -top-32 h-72 w-72 rounded-full bg-primary-200/55 blur-3xl"
            />
            <div
                aria-hidden="true"
                className="pointer-events-none absolute -bottom-36 left-1/3 h-64 w-64 rounded-full bg-primary-200/35 blur-3xl"
            />

            <div className="relative flex flex-col gap-7 lg:flex-row lg:items-center lg:gap-10">
                {/* Pitch */}
                <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2.5">
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary-600 text-white shadow-sm">
                            <Sparkles className="h-4.5 w-4.5" />
                        </span>
                        <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-primary-700">
                            New activities welcome
                        </span>
                    </div>

                    <h3 className="mt-4 font-serif text-2xl font-semibold leading-snug text-gray-900 sm:text-3xl">
                        Bring your own activity to the hall
                    </h3>
                    <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-600">
                        If you'd like to run something regular — weekly, fortnightly or monthly — we'll help
                        you find a slot and get it on the hall calendar.
                    </p>

                    <div className="mt-5 flex flex-wrap items-center gap-2">
                        <span className="text-[11px] font-medium uppercase tracking-wide text-gray-500">
                            For example
                        </span>
                        {EXAMPLES.map((example) => (
                            <span
                                key={example}
                                className="rounded-full border border-primary-100 bg-primary-50 px-2.5 py-1 text-xs font-medium text-primary-800"
                            >
                                {example}
                            </span>
                        ))}
                    </div>
                </div>

                {/* Contact */}
                <div className="w-full shrink-0 rounded-2xl bg-primary-50 p-4 ring-1 ring-primary-100 sm:max-w-md sm:p-5 lg:w-[22rem] lg:max-w-none">
                    <div className="flex items-center gap-2 text-primary-700">
                        <Mail className="h-4 w-4" />
                        <span className="text-[11px] font-semibold uppercase tracking-[0.12em]">
                            Email us
                        </span>
                    </div>
                    <p className="mt-2 break-words font-serif text-sm font-semibold text-gray-900 sm:text-base">
                        {EMAIL_LOCAL}@<wbr />
                        {EMAIL_DOMAIN}
                    </p>
                    <p className="mt-3 text-xs leading-5 text-gray-600">
                        Tell us what you'd like to run, how often, and the day and time that would suit you.
                    </p>
                </div>
            </div>
        </div>
    );
}
