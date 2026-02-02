# Directive 06: Workflow Nuovo Cliente CMS

## Input Richiesto

Per creare CMS + Sito per un nuovo cliente, mi servono:

1. **Nome cliente** (es: "Mediteck BeOnTop")
2. **Client ID** (slug, es: "mediteck")
3. **Contenuti** - Uno di questi:
   - File Markdown con info azienda
   - URL del sito esistente da scrappare
   - Lista sezioni e testi

## Output Generato

Per ogni cliente genero:

```
[client-id]-cms/
├── index.html      # Interfaccia admin
├── style.css       # Dark mode styling
├── supabase.js     # Config + API
└── app.js          # Logica CMS

[client-id]-site/
├── index.html      # Sito pubblico
├── style.css       # Premium dark theme
├── main.js         # Animazioni
└── supabase.js     # Carica contenuti

[client-id]-setup.sql  # SQL per Supabase
```

## Credenziali Supabase (FISSE)

```javascript
const SUPABASE_URL = 'https://mfkvkqflomqqngogdfrn.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1ma3ZrcWZsb21xcW5nb2dkZnJuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkzOTYyNzgsImV4cCI6MjA4NDk3MjI3OH0.QgaU5Objhr0LD6ulGKhVZWEAw9P2_vOYST5DspOdIZk';
const CLIENT_ID = '[CAMBIA-PER-CLIENTE]';
```

## Workflow Passo-Passo

### 1. Creo SQL Setup (2 min)
```sql
INSERT INTO clients (id, name, domain) 
VALUES ('client-id', 'Nome Azienda', 'dominio.com')
ON CONFLICT (id) DO NOTHING;

INSERT INTO content (client_id, page, section, field, value) VALUES
('client-id', 'home', 'hero', 'title', '...'),
-- ... tutti i campi
ON CONFLICT (client_id, page, section, field) DO UPDATE SET value = EXCLUDED.value;
```

### 2. Copio Template CMS
- Copio da `crg-italia-cms/` o `take-over-cms/`
- Cambio `CLIENT_ID` in `supabase.js`
- Adatto `app.js` per le sezioni del cliente

### 3. Copio/Creo Sito
- Se esiste sito: copio e aggiungo `supabase.js`
- Se nuovo: creo da zero con sezioni richieste
- Aggiungo ID agli elementi dinamici
- Importo `supabase.js` che carica contenuti

### 4. ZIP
```powershell
Compress-Archive -Path "[client-id]-cms\*" -DestinationPath "[client-id]-cms.zip" -Force
Compress-Archive -Path "[client-id]-site\*" -DestinationPath "[client-id]-site.zip" -Force
```

### 5. Consegna
- SQL da eseguire in Supabase Dashboard
- 2 ZIP pronti per hosting

## Sezioni Standard

La struttura tipica di un sito:

| Sezione | Campi Tipici |
|---------|--------------|
| hero | subtitle, title, description, cta_primary, cta_secondary |
| stats | stat1, stat1_label, stat2, stat2_label... |
| about | subtitle, title, lead, description, feature_1, feature_2, feature_3 |
| services | subtitle, title, service1_title, service1_description... |
| showcase | title, feature1_title, feature1_description... |
| contact | subtitle, title, address, phone, email |
| footer | copyright, piva |

## Funzionalità CMS

### Read (Lettura)
- Usa localStorage per cache (caricamento istantaneo)
- Sync in background con Supabase
- Mostra "Connesso" quando pronto

### Write (Scrittura)
- UPSERT con `on_conflict=client_id,page,section,field`
- Aggiorna cache locale dopo salvataggio
- Toast notification successo/errore

## Checklist Pre-Consegna

- [ ] SQL testato (no errori sintassi)
- [ ] CMS: carica dati ✓
- [ ] CMS: salva modifiche ✓
- [ ] Sito: carica da Supabase ✓
- [ ] ZIP creati con struttura flat
