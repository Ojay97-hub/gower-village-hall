-- Enable RLS for events and activities tables
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.regular_activities ENABLE ROW LEVEL SECURITY;

-- Safely drop existing policies if they happen to exist (to avoid errors)
DROP POLICY IF EXISTS "Public read access on events" ON public.events;
DROP POLICY IF EXISTS "Authenticated users can insert events" ON public.events;
DROP POLICY IF EXISTS "Authenticated users can update events" ON public.events;
DROP POLICY IF EXISTS "Authenticated users can delete events" ON public.events;

DROP POLICY IF EXISTS "Public read access on regular_activities" ON public.regular_activities;
DROP POLICY IF EXISTS "Authenticated users can insert regular_activities" ON public.regular_activities;
DROP POLICY IF EXISTS "Authenticated users can update regular_activities" ON public.regular_activities;
DROP POLICY IF EXISTS "Authenticated users can delete regular_activities" ON public.regular_activities;

-- 1. Create PUBLIC READ policies (so visitors can see the events)
CREATE POLICY "Public read access on events" ON public.events FOR SELECT USING (true);
CREATE POLICY "Public read access on regular_activities" ON public.regular_activities FOR SELECT USING (true);

-- 2. Create AUTHENTICATED ADMIN policies (so logged-in admins can edit/delete)
-- For EVENTS
CREATE POLICY "Authenticated users can insert events" ON public.events FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can update events" ON public.events FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can delete events" ON public.events FOR DELETE USING (auth.role() = 'authenticated');

-- For REGULAR ACTIVITIES
CREATE POLICY "Authenticated users can insert regular_activities" ON public.regular_activities FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can update regular_activities" ON public.regular_activities FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can delete regular_activities" ON public.regular_activities FOR DELETE USING (auth.role() = 'authenticated');
