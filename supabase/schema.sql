-- Genshin Build Tracker Schema
-- Run this in your Supabase SQL editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- CHARACTERS TABLE (reference data)
-- =============================================
CREATE TABLE IF NOT EXISTS characters (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  element TEXT NOT NULL,
  weapon_type TEXT NOT NULL,
  role TEXT NOT NULL,
  rarity INTEGER NOT NULL DEFAULT 5,
  priority TEXT NOT NULL DEFAULT 'B',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE characters IS 'Reference table for character metadata';

-- =============================================
-- BUILD CHECKLISTS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS build_checklists (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  char_id TEXT NOT NULL REFERENCES characters(id),
  weapon_tier TEXT DEFAULT 'none' CHECK (weapon_tier IN ('none', 'f2p', 'bp', 'bis')),
  flower BOOLEAN DEFAULT FALSE,
  feather BOOLEAN DEFAULT FALSE,
  sands BOOLEAN DEFAULT FALSE,
  goblet BOOLEAN DEFAULT FALSE,
  circlet BOOLEAN DEFAULT FALSE,
  flower_lv INTEGER DEFAULT 0 CHECK (flower_lv BETWEEN 0 AND 20),
  feather_lv INTEGER DEFAULT 0 CHECK (feather_lv BETWEEN 0 AND 20),
  sands_lv INTEGER DEFAULT 0 CHECK (sands_lv BETWEEN 0 AND 20),
  goblet_lv INTEGER DEFAULT 0 CHECK (goblet_lv BETWEEN 0 AND 20),
  circlet_lv INTEGER DEFAULT 0 CHECK (circlet_lv BETWEEN 0 AND 20),
  stat_goal_1 BOOLEAN DEFAULT FALSE,
  stat_goal_2 BOOLEAN DEFAULT FALSE,
  stat_goal_3 BOOLEAN DEFAULT FALSE,
  skill_talent BOOLEAN DEFAULT FALSE,
  burst_talent BOOLEAN DEFAULT FALSE,
  char_level INTEGER DEFAULT 1 CHECK (char_level BETWEEN 1 AND 90),
  const_current INTEGER DEFAULT 0 CHECK (const_current BETWEEN 0 AND 6),
  const_goal INTEGER DEFAULT 0 CHECK (const_goal BETWEEN 0 AND 6),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, char_id)
);

COMMENT ON TABLE build_checklists IS 'Build progress checklist for each character per user';

-- =============================================
-- TODO ITEMS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS todo_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  char_id TEXT NOT NULL REFERENCES characters(id),
  text TEXT NOT NULL,
  completed BOOLEAN DEFAULT FALSE,
  scheduled_for DATE,
  resource_type TEXT,
  resource_target INTEGER,
  resource_current INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE todo_items IS 'Per-character task list items';

-- =============================================
-- NOTES TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  char_id TEXT NOT NULL REFERENCES characters(id),
  general TEXT DEFAULT '',
  plans TEXT DEFAULT '',
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, char_id)
);

COMMENT ON TABLE notes IS 'Free-form notes and plans per character';

-- =============================================
-- ACTIVITY LOG TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS activity_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  char_id TEXT REFERENCES characters(id),
  type TEXT NOT NULL,
  description TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE activity_log IS 'Log of user actions for recent activity feed';

-- =============================================
-- UPCOMING EVENTS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS upcoming_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  event_date DATE,
  char_id TEXT REFERENCES characters(id),
  completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE upcoming_events IS 'Upcoming game events and farming plans';

-- =============================================
-- INDEXES
-- =============================================
CREATE INDEX IF NOT EXISTS idx_build_checklists_user ON build_checklists(user_id);
CREATE INDEX IF NOT EXISTS idx_todo_items_user ON todo_items(user_id);
CREATE INDEX IF NOT EXISTS idx_todo_items_char ON todo_items(user_id, char_id);
CREATE INDEX IF NOT EXISTS idx_notes_user ON notes(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_log_user ON activity_log(user_id);
CREATE INDEX IF NOT EXISTS idx_upcoming_events_user ON upcoming_events(user_id);

-- =============================================
-- ROW LEVEL SECURITY
-- =============================================

ALTER TABLE build_checklists ENABLE ROW LEVEL SECURITY;
ALTER TABLE todo_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE upcoming_events ENABLE ROW LEVEL SECURITY;

-- Users can only access their own data
CREATE POLICY "Users can manage their own checklists"
  ON build_checklists FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can manage their own todos"
  ON todo_items FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can manage their own notes"
  ON notes FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can manage their own activity"
  ON activity_log FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can manage their own events"
  ON upcoming_events FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Characters table is public read
ALTER TABLE characters ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Characters are publicly readable" ON characters FOR SELECT USING (true);
