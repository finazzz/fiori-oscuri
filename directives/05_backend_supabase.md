# Directive 05: Backend Setup (Supabase Multi-Tenant)

## Architecture

**UN progetto Supabase → MOLTI clienti**

Ogni cliente ha i suoi dati separati da `client_id`. Questo permette:
- Setup una volta sola
- Aggiunta clienti in 2 minuti
- Costi minimi (free tier copre molti clienti)

## Setup Iniziale (Una Volta Sola)

### 1. Crea Progetto Supabase
1. Vai su https://supabase.com
2. Crea nuovo progetto
3. Salva:
   - **Project URL:** `https://xxxxx.supabase.co`
   - **Anon Key:** `eyJhbGc...` (pubblica, va nel frontend)
   - **Service Key:** `eyJhbGc...` (privata, solo per admin)

### 2. Crea Tabelle (SQL da eseguire una volta)

```sql
-- Tabella clienti
CREATE TABLE clients (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    domain TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Tabella contenuti
CREATE TABLE content (
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
CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    client_id TEXT REFERENCES clients(id),
    category TEXT NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    image_url TEXT,
    display_order INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE
);

-- Abilita RLS (Row Level Security)
ALTER TABLE content ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Policy: ogni client vede solo i suoi dati
CREATE POLICY "Client isolation" ON content
    FOR ALL USING (true);  -- In produzione, aggiungi auth

CREATE POLICY "Client isolation" ON products
    FOR ALL USING (true);
```

### 3. Salva Credenziali nel DOE

Crea file `inputs/supabase_config.json`:
```json
{
    "url": "https://YOUR_PROJECT.supabase.co",
    "anon_key": "YOUR_ANON_KEY"
}
```

## Per Ogni Nuovo Cliente

Quando aggiungi un cliente, esegui:

```sql
-- Aggiungi cliente
INSERT INTO clients (id, name, domain) 
VALUES ('mediteck', 'Mediteck BeOnTop', 'mediteck-beontop.it');

-- Popola contenuti iniziali (esempio)
INSERT INTO content (client_id, page, section, field, value) VALUES
('mediteck', 'home', 'hero', 'title', 'Benvenuti in Mediteck BeOnTop'),
('mediteck', 'home', 'hero', 'subtitle', 'Super agenzia specializzata...'),
('mediteck', 'home', 'hero', 'cta', 'Scopri i nostri prodotti');
```

## Integrazione nel Sito

Il sito carica contenuti da Supabase:

```javascript
// js/supabase-config.js
const SUPABASE_URL = 'https://YOUR_PROJECT.supabase.co';
const SUPABASE_KEY = 'YOUR_ANON_KEY';
const CLIENT_ID = 'mediteck';

async function loadContent(page) {
    const response = await fetch(
        `${SUPABASE_URL}/rest/v1/content?client_id=eq.${CLIENT_ID}&page=eq.${page}`,
        { headers: { 'apikey': SUPABASE_KEY } }
    );
    return await response.json();
}
```

## Integrazione nel CMS

Il CMS salva modifiche su Supabase:

```javascript
async function saveContent(page, section, field, value) {
    await fetch(`${SUPABASE_URL}/rest/v1/content`, {
        method: 'POST',
        headers: {
            'apikey': SUPABASE_KEY,
            'Content-Type': 'application/json',
            'Prefer': 'resolution=merge-duplicates'
        },
        body: JSON.stringify({
            client_id: CLIENT_ID,
            page, section, field, value,
            updated_at: new Date().toISOString()
        })
    });
}
```

## Workflow Completo

1. **Tu:** Crei UN progetto Supabase, esegui SQL iniziale
2. **Tu:** Mi dai URL + anon_key
3. **Io:** Per ogni cliente, genero:
   - SQL per aggiungere cliente
   - Sito HTML con Supabase integrato
   - CMS con Supabase integrato
   - 2 ZIP pronti per hosting
