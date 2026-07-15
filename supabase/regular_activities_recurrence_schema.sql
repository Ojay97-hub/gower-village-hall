-- Structured recurrence for regular activities
-- (Applied to the live database on 2026-07-15 via migration `regular_activities_recurrence`.)
--
-- recurrence_type: none (one-off / legacy text), weekly, fortnightly, monthly
-- recurrence_day: 0=Sunday .. 6=Saturday
-- recurrence_week: for monthly — 1..4 = 1st..4th occurrence, -1 = last
-- recurrence_start_date: "from this date" anchor; required to pace fortnightly
-- recurrence_end_date: optional last date the activity runs

ALTER TABLE public.regular_activities
  ADD COLUMN IF NOT EXISTS recurrence_type text NOT NULL DEFAULT 'none'
    CHECK (recurrence_type IN ('none', 'weekly', 'fortnightly', 'monthly')),
  ADD COLUMN IF NOT EXISTS recurrence_day smallint NULL
    CHECK (recurrence_day BETWEEN 0 AND 6),
  ADD COLUMN IF NOT EXISTS recurrence_week smallint NULL
    CHECK (recurrence_week = -1 OR recurrence_week BETWEEN 1 AND 4),
  ADD COLUMN IF NOT EXISTS recurrence_start_date date NULL,
  ADD COLUMN IF NOT EXISTS recurrence_end_date date NULL;

-- Backfill: coffee mornings run on the first Saturday of each month
UPDATE public.regular_activities
SET recurrence_type = 'monthly',
    recurrence_day = 6,
    recurrence_week = 1
WHERE lower(title) LIKE '%coffee morning%'
  AND recurrence_type = 'none';
