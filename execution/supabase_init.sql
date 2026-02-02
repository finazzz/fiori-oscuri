-- ============================================
-- SUPABASE INIT - ESEGUI QUESTO UNA VOLTA SOLA
-- Vai su: Supabase Dashboard > SQL Editor > New Query
-- Incolla tutto e clicca RUN
-- ============================================

-- Tabella clienti
CREATE TABLE IF NOT EXISTS clients (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    domain TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Tabella contenuti
CREATE TABLE IF NOT EXISTS content (
    id SERIAL PRIMARY KEY,
    client_id TEXT REFERENCES clients(id),
    page TEXT NOT NULL,
    section TEXT NOT NULL,
    field TEXT NOT NULL,
    value TEXT,
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(client_id, page, section, field)
);

-- Tabella prodotti
CREATE TABLE IF NOT EXISTS products (
    id SERIAL PRIMARY KEY,
    client_id TEXT REFERENCES clients(id),
    category TEXT NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    image_url TEXT,
    display_order INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE
);

-- Abilita accesso pubblico (per anon key)
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE content ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Policy per permettere lettura/scrittura con anon key
CREATE POLICY "Allow all for clients" ON clients FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for content" ON content FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for products" ON products FOR ALL USING (true) WITH CHECK (true);

-- ============================================
-- DOPO AVER ESEGUITO QUESTO, ESEGUI mediteck_setup.sql
-- ============================================
