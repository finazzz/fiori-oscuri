# Execution Folder

Questa cartella contiene gli script e SQL eseguibili.

## Struttura

```
execution/
├── supabase_init.sql          # Setup iniziale tabelle (una volta sola)
├── scrape_site.py             # Script generico per scraping siti
├── [client]_setup.sql         # SQL per ogni cliente (INSERT contenuti)
└── [client]_scraped_data.json # Dati scrappati (se applicabile)
```

## File Principali

### supabase_init.sql
Crea le tabelle base nel progetto Supabase:
- `clients` - Anagrafica clienti
- `content` - Contenuti dinamici
- `products` - Prodotti (opzionale)

**Esegui UNA VOLTA** nel Supabase SQL Editor.

### scrape_site.py
Script Python per estrarre contenuti da siti esistenti.

```bash
py scrape_site.py https://example.com output.json
```

### [client]_setup.sql
Generato per ogni cliente. Contiene:
- INSERT INTO clients
- INSERT INTO content (tutti i campi)

**Esegui nel Supabase SQL Editor** per ogni nuovo cliente.

## Clienti Configurati

| Client ID | Nome | SQL File |
|-----------|------|----------|
| crg-italia | CRG Italia S.R.L. | crg_italia_setup.sql |
| mediteck | Mediteck BeOnTop | mediteck_setup.sql |
