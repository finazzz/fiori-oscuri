-- =====================================================
-- FIORI OSCURI - DATABASE SCHEMA (Invite Code Version)
-- Incolla in Supabase SQL Editor → Run
-- =====================================================
-- IMPORTANTE: Prima di eseguire questo script, assicurati di aver
-- abilitato Phone Auth in Supabase Dashboard:
-- Authentication → Providers → Phone → Enable
-- Con le credenziali Twilio configurate.
-- =====================================================

-- CLEANUP (rimuove tutto e ricrea da zero)
DROP TABLE IF EXISTS pending_registrations CASCADE;
DROP TABLE IF EXISTS flowers CASCADE;
DROP TABLE IF EXISTS flower_transactions CASCADE;
DROP TABLE IF EXISTS invites CASCADE;
DROP TABLE IF EXISTS participations CASCADE;
DROP TABLE IF EXISTS events CASCADE;
DROP TABLE IF EXISTS admin_users CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

DROP FUNCTION IF EXISTS handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;
DROP FUNCTION IF EXISTS generate_invite_code() CASCADE;

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- HELPER FUNCTIONS
-- =====================================================

-- Genera codice invito univoco (6 caratteri alfanumerici)
CREATE OR REPLACE FUNCTION generate_invite_code()
RETURNS TEXT AS $$
DECLARE
  chars TEXT := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  code TEXT := '';
  i INTEGER;
BEGIN
  FOR i IN 1..6 LOOP
    code := code || substr(chars, floor(random() * length(chars) + 1)::int, 1);
  END LOOP;
  RETURN code;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- TABLES
-- =====================================================

-- Profili utenti con codice invito
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  phone TEXT UNIQUE NOT NULL,
  display_name TEXT NOT NULL,
  username TEXT UNIQUE,
  avatar_url TEXT,
  bio TEXT,
  city TEXT CHECK (city IN ('milano', 'roma', 'madrid', 'londra')),
  instagram_username TEXT,
  invite_code TEXT UNIQUE DEFAULT generate_invite_code(),
  flower_count INTEGER DEFAULT 0,
  wilted_flowers INTEGER DEFAULT 0,
  bails_count INTEGER DEFAULT 0,
  events_attended INTEGER DEFAULT 0,
  invites_sent INTEGER DEFAULT 0,
  invited_by UUID REFERENCES profiles(id),
  first_event_attended BOOLEAN DEFAULT FALSE,
  is_frozen BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Eventi
CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  location TEXT NOT NULL,
  event_date TIMESTAMPTZ NOT NULL,
  image_url TEXT,
  max_participants INTEGER,
  shareable_slug TEXT UNIQUE,
  is_public BOOLEAN DEFAULT FALSE,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Partecipazioni agli eventi
CREATE TABLE participations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'confirmed',
  invited_by UUID REFERENCES profiles(id),
  is_first_event BOOLEAN DEFAULT FALSE,
  rsvp_date TIMESTAMPTZ DEFAULT NOW(),
  attended_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, event_id)
);

-- Inviti pendenti (codici usati ma non ancora completati)
CREATE TABLE invites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code TEXT NOT NULL,
  inviter_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  invitee_phone TEXT,
  used BOOLEAN DEFAULT FALSE,
  used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Storico transazioni fiori
CREATE TABLE flower_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  from_user_id UUID REFERENCES profiles(id),
  to_user_id UUID REFERENCES profiles(id),
  amount INTEGER NOT NULL,
  transaction_type TEXT NOT NULL,
  event_id UUID REFERENCES events(id),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Fiori individuali con sistema di strike
CREATE TABLE flowers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  source_type TEXT DEFAULT 'welcome',
  strikes INTEGER DEFAULT 0 CHECK (strikes >= 0 AND strikes <= 3),
  is_wilted BOOLEAN DEFAULT FALSE,
  event_id UUID REFERENCES events(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Admin users
CREATE TABLE admin_users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID UNIQUE NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'admin',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- INDEXES
-- =====================================================

CREATE INDEX idx_profiles_phone ON profiles(phone);
CREATE INDEX idx_profiles_invite_code ON profiles(invite_code);
CREATE INDEX idx_flowers_owner ON flowers(owner_id);
CREATE INDEX idx_events_date ON events(event_date);
CREATE INDEX idx_events_slug ON events(shareable_slug);
CREATE INDEX idx_participations_user ON participations(user_id);
CREATE INDEX idx_participations_event ON participations(event_id);

-- =====================================================
-- FUNCTIONS & TRIGGERS
-- =====================================================

-- Gestisce nuovi utenti da Phone Auth
-- Crea profilo base, il resto viene aggiornato dopo
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, phone, display_name, is_frozen, flower_count)
  VALUES (
    NEW.id,
    NEW.phone,
    COALESCE(NEW.raw_user_meta_data->>'display_name', 'Nuovo Membro'),
    FALSE,
    1  -- Fiore di benvenuto
  )
  ON CONFLICT (id) DO NOTHING;

  -- Crea fiore di benvenuto
  INSERT INTO public.flowers (owner_id, source_type)
  VALUES (NEW.id, 'welcome')
  ON CONFLICT DO NOTHING;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Aggiorna automaticamente updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_events_updated_at BEFORE UPDATE ON events
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_flowers_updated_at BEFORE UPDATE ON flowers
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- ROW LEVEL SECURITY
-- =====================================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE participations ENABLE ROW LEVEL SECURITY;
ALTER TABLE invites ENABLE ROW LEVEL SECURITY;
ALTER TABLE flower_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE flowers ENABLE ROW LEVEL SECURITY;

-- Profiles
CREATE POLICY "profiles_select" ON profiles FOR SELECT USING (true);
CREATE POLICY "profiles_insert" ON profiles FOR INSERT WITH CHECK (true);
CREATE POLICY "profiles_update" ON profiles FOR UPDATE USING (true);
CREATE POLICY "profiles_delete" ON profiles FOR DELETE USING (true);

-- Events
CREATE POLICY "events_select" ON events FOR SELECT USING (true);
CREATE POLICY "events_insert" ON events FOR INSERT WITH CHECK (true);
CREATE POLICY "events_update" ON events FOR UPDATE USING (true);
CREATE POLICY "events_delete" ON events FOR DELETE USING (true);

-- Participations
CREATE POLICY "participations_select" ON participations FOR SELECT USING (true);
CREATE POLICY "participations_insert" ON participations FOR INSERT WITH CHECK (true);
CREATE POLICY "participations_update" ON participations FOR UPDATE USING (true);

-- Invites
CREATE POLICY "invites_select" ON invites FOR SELECT USING (true);
CREATE POLICY "invites_insert" ON invites FOR INSERT WITH CHECK (true);
CREATE POLICY "invites_update" ON invites FOR UPDATE USING (true);

-- Flower Transactions
CREATE POLICY "flower_transactions_select" ON flower_transactions FOR SELECT USING (true);
CREATE POLICY "flower_transactions_insert" ON flower_transactions FOR INSERT WITH CHECK (true);

-- Admin Users
CREATE POLICY "admin_select" ON admin_users FOR SELECT USING (true);
CREATE POLICY "admin_insert" ON admin_users FOR INSERT WITH CHECK (true);

-- Flowers
CREATE POLICY "flowers_select" ON flowers FOR SELECT USING (true);
CREATE POLICY "flowers_insert" ON flowers FOR INSERT WITH CHECK (true);
CREATE POLICY "flowers_update" ON flowers FOR UPDATE USING (true);
CREATE POLICY "flowers_delete" ON flowers FOR DELETE USING (true);

-- =====================================================
-- SEED DATA
-- =====================================================

INSERT INTO events (title, description, location, event_date, shareable_slug, is_public) 
VALUES (
  'Cena Oscura - Febbraio',
  'Una cena intima tra ombre e candele. Location segreta nel cuore di Milano.',
  'Via Segreta, Milano',
  NOW() + INTERVAL '7 days',
  'cena-oscura-febbraio',
  FALSE
) ON CONFLICT (shareable_slug) DO NOTHING;

-- =====================================================
-- DONE
-- =====================================================
SELECT 'Schema creato! invite_code pronto.' as status;