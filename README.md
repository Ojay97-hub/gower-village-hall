# Penmaen and Nicholaston Village Hall

![Gower Village Hall Home Page](./src/assets/README-screenshot.png)

This repository contains the public website and administrative portal for Penmaen and Nicholaston Village Hall on the Gower Peninsula. The application supports hall bookings, community news, events, churches, committee information, and a role-based admin experience for day-to-day content management.

Supporting documentation is kept in the top-level `docs/` directory.

## Overview

The site is intended for two primary audiences:

- Local residents and visitors who need up-to-date information about events, hall hire, churches, businesses, and community news.
- Village hall committee members and administrators who manage bookings, publish content, and maintain operational information through the admin interface.

## Key Features

- Responsive public website covering hall hire, events, blog content, churches, committee information, businesses, and contact details.
- Public booking flow with calendar visibility for confirmed bookings.
- Newsletter and booking submission flows backed by Vercel API routes and Brevo email delivery.
- Role-based admin tools for blog content, bookings, committee records, coffee morning content, and event management.
- Supabase-backed authentication, database access, and media storage.
- Markdown-based content rendering for blog and coffee morning articles.

## Public Pages

### `/`

Home page and main community landing page.

- Hero image with welcome messaging.
- Community overview tiles.
- Quick links to key sections including hall bookings, blog, churches, and committee information.
- Coffee morning highlight content.
- Newsletter sign-up linked to `/api/send-newsletter`.

### `/hall`

Primary hall hire and booking enquiry page.

- Hall information, rates, parking, and capacity details.
- Booking calendar showing confirmed dates from the `bookings` table.
- Booking enquiry form that sends email notifications and records pending requests.
- Regular weekly activities summary.

### `/hall/events`

Community events schedule and regular activities page.

- Upcoming events fetched from the `events` table.
- Recurring activities fetched from the `regular_activities` table.
- Inline admin controls for users with the `blog` role.

### `/hall/coffee-morning`

Dedicated coffee morning landing page.

- Countdown to the next session.
- Paginated updates from the `coffee_morning_updates` table.
- Responsive gallery with admin image management for authorised users.

### `/hall/coffee-morning/:slug`

Individual coffee morning article page.

- Hero image, metadata, excerpt, and Markdown body.
- Optional fundraising information.
- Previous and next article navigation.

### `/hall/for-families`

Placeholder page for future family-focused content.

### `/blog`

Community news and article listing page.

- Search and category filtering.
- Featured article layout.
- Responsive article grid.

### `/blog/:slug`

Individual blog article page with metadata, excerpt, Markdown content, and previous/next navigation.

### `/churches`

Information page for the local churches.

- Church details loaded from the `churches` table.
- Dedicated churches newsletter sign-up flow.

### `/committee`

Committee and governance information page.

- Charity and council references.
- Trustee records loaded from `committee_members`.
- Meeting and involvement information.

### `/businesses`

Directory of local businesses and attractions.

- Categorised listings with image cards and outbound links.
- Deferred Google Maps embed.

### `/contact`

Contact details and directions page.

- What3Words integration.
- Address, email, and opening information.
- Navigation links for Google Maps, Apple Maps, and Waze.

## Admin System

The admin experience is role-based and protected with route guards.

### `/admin/login`

Admin authentication flow for committee members and authorised users.

- Account selection and password entry flow.
- Invite and recovery support for first-time password setup.
- Manual email/password fallback handling.

### `/admin/blog`

Requires role: `blog`

- Blog article listing, filtering, creation, editing, and deletion.
- Hero image uploads stored in Supabase storage.

### `/admin/bookings`

Requires role: `bookings`

- Booking enquiry review and status management.
- Real-time status updates reflected in the public hall calendar.

### `/admin/committee`

Requires role: `committee`

- Committee member creation, editing, ordering, and deletion.

### `/admin/coffee-morning`

Requires role: `coffee_mornings`

- Coffee morning article management.
- Gallery upload, ordering, and layout controls.

### `/admin/users`

Requires master admin access.

- Admin user overview.
- Role assignment and access control management.

### Admin Toolbar

A floating admin toolbar is available to logged-in admins throughout the site, providing quick links to the relevant management areas, session switching, and logout.

### Role Summary

| Role | Access |
|---|---|
| `blog` | Blog CMS and event management |
| `bookings` | Booking management |
| `committee` | Committee management |
| `coffee_mornings` | Coffee morning CMS and gallery |
| Master Admin | All admin areas plus user management |

## API Routes

### `POST /api/send-booking`

Handles booking enquiries submitted from the hall page.

- Validates required fields.
- Sends an email to the hall administrator.
- Sends a confirmation email to the user.
- Inserts a pending booking record into Supabase.

### `POST /api/send-newsletter`

Handles newsletter and friends sign-ups from the hall and churches pages.

- Validates that an email address is present.
- Sends an admin notification and subscriber confirmation.
- Adds the subscriber to the relevant Brevo mailing list.

## Technology Stack

- React 18 with TypeScript for the frontend application.
- Vite for development, bundling, and local tooling.
- React Router for public and admin route handling.
- Tailwind CSS 4 for styling.
- Radix UI primitives with local wrappers in `src/components/ui`.
- Lucide React for icons.
- React Hook Form for form handling.
- React Markdown with `remark-gfm` for article rendering.
- Supabase for PostgreSQL data, authentication, storage, and role-based access patterns.
- Vercel for deployment, SPA rewrites, and serverless API execution.
- Nodemailer and Brevo for transactional email and mailing list integration.
- Vitest, React Testing Library, and jsdom for automated testing.

## Getting Started

### Prerequisites

- Node.js
- npm

### Installation

1. Install dependencies:

   ```bash
   npm install
   ```

2. Create a `.env` file with the required environment variables:

   ```env
   VITE_SUPABASE_URL="..."
   VITE_SUPABASE_ANON_KEY="..."
   VITE_SUPABASE_SERVICE_ROLE_KEY="..."
   VITE_MASTER_ADMIN_EMAILS="name@example.com"

   BREVO_SMTP_USER="..."
   BREVO_SMTP_PASS="..."
   BREVO_FROM_EMAIL="..."
   NOTIFICATION_EMAIL="..."

   BREVO_API_KEY="..."
   BREVO_HALL_LIST_ID="..."
   BREVO_CHURCHES_LIST_ID="..."
   ```

3. Start the development server:

   ```bash
   npm run dev
   ```

## Testing

The project uses Vitest and React Testing Library. The current suite contains 34 tests across 6 files.

### Run the tests

```bash
npx vitest run
npx vitest
```

### Current Coverage Areas

| Test file | Tests | Coverage |
|---|---|---|
| `tests/escapeHtml.test.ts` | 7 | HTML escaping behaviour used in email content |
| `tests/auth.logic.test.ts` | 11 | Master admin detection and role-gating logic |
| `tests/AdminRoute.test.tsx` | 5 | Protected route behaviour for role-based admin access |
| `tests/MasterAdminRoute.test.tsx` | 3 | Master admin route protection |
| `tests/send-booking.test.js` | 6 | Validation rules for the booking API handler |
| `tests/send-newsletter.test.js` | 2 | Validation rules for the newsletter API handler |

Note: the production email-sending path relies on Nodemailer in the API handlers, so email delivery itself should be verified with end-to-end testing against a deployed environment.

## Design Reference

Original design concepts are available in Figma:

[Gower Village Hall Figma](https://www.figma.com/design/nFqAeB7GiD6K3kmQlD6KMj/gower-village-hall)

Additional project notes:

- [Attributions](./docs/Attributions.md)
- [Guidelines](./docs/Guidelines.md)
- [Proposed Feature Layout](./docs/FeatureLayout.md)
