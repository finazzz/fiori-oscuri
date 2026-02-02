# Orchestration 02: Aggiornamento Contenuti

## Trigger
Cliente vuole modificare contenuti esistenti

## Flow

```
┌─────────────────────────────────────────────────────────────┐
│              INPUT: Modifiche richieste                     │
│  - Client ID esistente                                       │
│  - Nuovi testi/immagini                                      │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│              OPZIONE A: Via CMS                             │
│  - Apri CMS locale o hostato                                │
│  - Modifica campi                                           │
│  - Salva → Supabase aggiornato                              │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│              OPZIONE B: Via SQL                             │
│  UPDATE content                                              │
│  SET value = 'nuovo valore'                                 │
│  WHERE client_id = 'x' AND section = 'y' AND field = 'z';  │
└─────────────────────────────────────────────────────────────┘
```

## Note
- Il sito si aggiorna automaticamente (legge da Supabase)
- Non serve re-deploy del sito
- CMS ha cache locale, refresh per vedere modifiche esterne
