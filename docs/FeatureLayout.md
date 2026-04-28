# Proposed Feature Layout

This document outlines a next-step folder structure for the application that keeps shared infrastructure global while grouping feature code by domain.

## Goals

- Make related files easier to find.
- Reduce cross-folder hopping between `pages`, `components`, `context`, `services`, and `types`.
- Keep shared UI primitives and platform setup separate from feature code.

## Suggested Direction

```text
src/
  app/
    App.tsx
    main.tsx
    routes.tsx
    providers/

  components/
    layout/
      Header.tsx
      Footer.tsx
      AdminToolbar.tsx
    ui/
      ...

  features/
    auth/
      components/
      context/
      routes/
      utils/

    blog/
      components/
      pages/
      context/
      types/

    bookings/
      components/
      pages/
      types/
      api/

    churches/
      components/
      pages/
      services/
      types/

    coffee-morning/
      components/
      pages/
      context/
      types/

    committee/
      components/
      pages/
      context/
      types/

    events/
      components/
      pages/
      context/
      types/

    hall/
      components/
      pages/

  lib/
    supabase/
      client.ts
      admin.ts
    auth/
      adminRoles.ts

  assets/
  styles/
  types/
```

## Low-Risk Moves for a Future Pass

- Move layout-level components such as `Header`, `Footer`, `AdminToolbar`, `AdminRoute`, `MasterAdminRoute`, `CanonicalUrl`, and `ScrollToTop` into `src/components/layout/`.
- Group admin-only forms with their owning feature instead of keeping them in the root `src/components/`.
- Consolidate Supabase helpers under `src/lib/supabase/`.
- Move `churchService.ts` into a `churches` feature area unless it becomes a genuinely shared service.
- Consider colocating small feature types inside feature folders and keeping `src/types/` for only shared global types.

## Current Safe Tidy Already Applied

- Non-runtime markdown files moved from `src/` into top-level `docs/`.
- Test files moved from `src/__tests__/` into top-level `tests/`.
- Vitest setup moved from `src/test/setup.ts` to `tests/setup.ts`.
