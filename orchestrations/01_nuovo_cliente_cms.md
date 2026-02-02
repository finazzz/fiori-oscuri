# Orchestration 01: Nuovo Cliente CMS

## Trigger
Utente fornisce info su nuovo cliente (nome, contenuti, URL)

## Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    INPUT UTENTE                              │
│  - Nome cliente + Client ID                                  │
│  - Contenuti (MD file, URL, o testi)                        │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│              STEP 1: ANALIZZA INPUT                         │
│  - Se URL → Scrape sito (execution/scrape_site.py)         │
│  - Se MD → Estrai sezioni                                   │
│  - Genera struttura contenuti                               │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│              STEP 2: GENERA SQL                             │
│  - INSERT INTO clients                                       │
│  - INSERT INTO content (tutti i campi)                      │
│  - Salva in execution/[client]_setup.sql                    │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│              STEP 3: CREA CMS                               │
│  - Copia template da crg-italia-cms/                        │
│  - Modifica CLIENT_ID in supabase.js                        │
│  - Adatta SECTIONS in app.js                                │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│              STEP 4: CREA SITO                              │
│  - Copia template o crea da zero                            │
│  - Modifica CLIENT_ID in supabase.js                        │
│  - Aggiungi ID elementi per contenuti dinamici              │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│              STEP 5: VERIFICA                               │
│  - Browser test: CMS carica dati ✓                          │
│  - Browser test: CMS salva modifiche ✓                      │
│  - Browser test: Sito carica da Supabase ✓                  │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│              STEP 6: PACKAGE                                │
│  - Compress-Archive [client]-cms → [client]-cms.zip        │
│  - Compress-Archive [client]-site → [client]-site.zip      │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│              OUTPUT FINALE                                   │
│  1. SQL da eseguire in Supabase                             │
│  2. [client]-cms.zip                                        │
│  3. [client]-site.zip                                       │
└─────────────────────────────────────────────────────────────┘
```

## Tempo Stimato
- Con contenuti pronti: **5-10 minuti**
- Con scraping sito: **15-20 minuti**

## Dipendenze
- `directives/06_workflow_nuovo_cliente.md`
- `execution/supabase_init.sql` (tabelle già create)
- `inputs/supabase_config.json` (credenziali)
