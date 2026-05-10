export const ADMIN_ROLES = [
    {
        id: 'blog',
        label: 'Blog',
        description: 'Access the Manage Blog area and publish blog content.',
        color: 'blue',
    },
    {
        id: 'events',
        label: 'Events',
        description: 'Access the Events page to add, edit, and remove upcoming events and regular activities.',
        color: 'rose',
    },
    {
        id: 'bookings',
        label: 'Hall Bookings',
        description: 'Access the Manage Bookings area and update hall booking enquiries.',
        color: 'green',
    },
    {
        id: 'coffee_mornings',
        label: 'Coffee Mornings',
        description: 'Access the Manage Coffee Morning area for updates, gallery items, and related content.',
        color: 'amber',
    },
    {
        id: 'committee',
        label: 'Committee',
        description: 'Access the Manage Committee area to maintain trustee and committee member records.',
        color: 'teal',
    },
    {
        id: 'churches',
        label: 'Churches',
        description: 'Access the Manage Churches area and maintain church-related content.',
        color: 'purple',
    },
    {
        id: 'newsletter',
        label: 'Newsletter',
        description: 'Access the Manage Subscribers area to view and manage newsletter sign-ups.',
        color: 'indigo',
    },
] as const;

export type AdminRole = typeof ADMIN_ROLES[number]['id'];

/** Tailwind classes for each role colour */
export const ROLE_COLORS: Record<string, { badge: string; dot: string }> = {
    blue:   { badge: 'bg-blue-50 text-blue-700 border-blue-100',     dot: 'bg-blue-400' },
    rose:   { badge: 'bg-rose-50 text-rose-700 border-rose-100',     dot: 'bg-rose-400' },
    green:  { badge: 'bg-green-50 text-green-700 border-green-100',  dot: 'bg-green-400' },
    amber:  { badge: 'bg-amber-50 text-amber-700 border-amber-100',  dot: 'bg-amber-400' },
    teal:   { badge: 'bg-teal-50 text-teal-700 border-teal-100',     dot: 'bg-teal-400' },
    purple: { badge: 'bg-purple-50 text-purple-700 border-purple-100', dot: 'bg-purple-400' },
    indigo: { badge: 'bg-indigo-50 text-indigo-700 border-indigo-100', dot: 'bg-indigo-400' },
};
