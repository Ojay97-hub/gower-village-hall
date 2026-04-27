-- =============================================
-- Churches: dynamic church pages schema
-- Run in Supabase SQL editor
-- =============================================

CREATE TABLE churches (
  id             UUID         DEFAULT gen_random_uuid() PRIMARY KEY,
  name           TEXT         NOT NULL,
  description    TEXT         NOT NULL,
  address        TEXT         NOT NULL,
  image_url      TEXT         NOT NULL,
  image_position TEXT         DEFAULT 'center',
  created_at     TIMESTAMPTZ  DEFAULT NOW()
);

CREATE TABLE services (
  id             UUID         DEFAULT gen_random_uuid() PRIMARY KEY,
  church_id      UUID         NOT NULL REFERENCES churches(id) ON DELETE CASCADE,
  title          TEXT         NOT NULL,
  date_time      TIMESTAMPTZ  NOT NULL,
  -- Optional human-readable label for recurring services,
  -- e.g. "Every Sunday at 9:30 AM". When set this overrides
  -- the formatted date_time in the display. Set date_time far
  -- in the future (e.g. 2099-12-31) to keep recurring entries
  -- in the "upcoming" pool indefinitely.
  recurring_text TEXT,
  description    TEXT,
  created_at     TIMESTAMPTZ  DEFAULT NOW()
);
CREATE INDEX services_church_date_idx ON services (church_id, date_time);

CREATE TABLE content_blocks (
  id         UUID         DEFAULT gen_random_uuid() PRIMARY KEY,
  church_id  UUID         NOT NULL REFERENCES churches(id) ON DELETE CASCADE,
  type       TEXT         NOT NULL CHECK (type IN ('visiting', 'about')),
  title      TEXT         NOT NULL,
  content    TEXT         NOT NULL,
  created_at TIMESTAMPTZ  DEFAULT NOW()
);

CREATE TABLE announcements (
  id          UUID         DEFAULT gen_random_uuid() PRIMARY KEY,
  church_id   UUID         NOT NULL REFERENCES churches(id) ON DELETE CASCADE,
  message     TEXT         NOT NULL,
  expiry_date TIMESTAMPTZ  NOT NULL,
  created_at  TIMESTAMPTZ  DEFAULT NOW()
);
CREATE INDEX announcements_church_expiry_idx ON announcements (church_id, expiry_date);

-- =============================================
-- Row-level security
-- =============================================
ALTER TABLE churches       ENABLE ROW LEVEL SECURITY;
ALTER TABLE services       ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcements  ENABLE ROW LEVEL SECURITY;

-- Public read
CREATE POLICY "Public read churches"       ON churches       FOR SELECT USING (true);
CREATE POLICY "Public read services"       ON services       FOR SELECT USING (true);
CREATE POLICY "Public read content_blocks" ON content_blocks FOR SELECT USING (true);
CREATE POLICY "Public read announcements"  ON announcements  FOR SELECT USING (true);

-- Authenticated write (admins are authenticated via Supabase Auth)
CREATE POLICY "Auth write churches"       ON churches       FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Auth write services"       ON services       FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Auth write content_blocks" ON content_blocks FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Auth write announcements"  ON announcements  FOR ALL USING (auth.role() = 'authenticated');

-- =============================================
-- Seed data — update image URLs after uploading
-- to Supabase Storage or another host
-- =============================================
-- INSERT INTO churches (name, description, address, image_url, image_position) VALUES
--   (
--     'St Johns Church, Penmaen',
--     'A beautiful historic church serving the Penmaen community for centuries. St Johns welcomes all visitors and continues to be a place of worship, reflection, and community gathering.',
--     'Penmaen, Gower, Swansea SA3 2HH',
--     'https://<project>.supabase.co/storage/v1/object/public/church-images/st-johns-church.png',
--     'center'
--   ),
--   (
--     'St Nicholas Church',
--     'Set in the picturesque village of Nicholaston, this historic church has served the local community for generations. The church features beautiful architecture and a peaceful atmosphere for worship and contemplation.',
--     'Nicholaston, Gower, Swansea SA3 2HL',
--     'https://<project>.supabase.co/storage/v1/object/public/church-images/st-nicholas-church.png',
--     'bottom'
--   );
--
-- INSERT INTO services (church_id, title, date_time, recurring_text) VALUES
--   ('<st-johns-id>',   'Sunday Morning Service', '2099-12-31 09:30:00+00', 'Every Sunday at 9:30 AM'),
--   ('<st-nicholas-id>','Sunday Morning Service', '2099-12-31 11:00:00+00', 'Every Sunday at 11:00 AM'),
--   ('<st-nicholas-id>','Evening Prayer',         '2099-12-31 18:00:00+00', 'Wednesdays at 6:00 PM');
--
-- INSERT INTO content_blocks (church_id, type, title, content) VALUES
--   ('<st-johns-id>',   'visiting', 'Visiting', 'The church welcomes visitors throughout the year.\nPlease contact us to arrange a visit or for more\ninformation about the church history.'),
--   ('<st-nicholas-id>','visiting', 'Visiting', 'Visitors are always welcome. The church is typically\nopen during daylight hours, and guided tours\ncan be arranged by appointment.');
