-- ============================================
-- MEDITECK - SETUP INIZIALE
-- Esegui questo SQL nel SQL Editor di Supabase
-- ============================================

-- Aggiungi cliente
INSERT INTO clients (id, name, domain) 
VALUES ('mediteck', 'Mediteck BeOnTop', 'mediteck-beontop.it')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;

-- Contenuti Homepage
INSERT INTO content (client_id, page, section, field, value) VALUES
('mediteck', 'home', 'hero', 'title', 'Benvenuti in Mediteck BeOnTop'),
('mediteck', 'home', 'hero', 'subtitle', 'Super agenzia specializzata nella commercializzazione e assistenza per la ricostruzione articolare e biologica con 7 persone sul territorio lombardo.'),
('mediteck', 'home', 'hero', 'cta', 'Scopri i nostri prodotti'),
('mediteck', 'home', 'about', 'title', '15+ Anni di Esperienza'),
('mediteck', 'home', 'about', 'text', 'Dopo oltre 15 anni di esperienza commerciale e manageriale in una delle più grandi aziende ortopediche globali, Enrico Spada crea Mediteck.')
ON CONFLICT (client_id, page, section, field) DO UPDATE SET value = EXCLUDED.value;

-- Contenuti Contatti
INSERT INTO content (client_id, page, section, field, value) VALUES
('mediteck', 'contatti', 'info', 'email', 'info@mediteck-beontop.it'),
('mediteck', 'contatti', 'info', 'territorio', 'Lombardia, Italia'),
('mediteck', 'contatti', 'info', 'team', '7 persone sul territorio')
ON CONFLICT (client_id, page, section, field) DO UPDATE SET value = EXCLUDED.value;

-- Categorie Prodotti
INSERT INTO content (client_id, page, section, field, value) VALUES
('mediteck', 'prodotti', 'recon', 'name', 'RECON'),
('mediteck', 'prodotti', 'recon', 'subtitle', 'Ricostruzione Articolare'),
('mediteck', 'prodotti', 'recon', 'description', 'Quando un''articolazione viene colpita da malattie degenerative e non c''è più spazio per la medicina conservativa, una delle soluzioni adottate da tempo è la protesi articolare.'),
('mediteck', 'prodotti', 'sportmed', 'name', 'SPORTMED'),
('mediteck', 'prodotti', 'sportmed', 'subtitle', 'Medicina Sportiva'),
('mediteck', 'prodotti', 'sportmed', 'description', 'Ogni giorno avvengono eventi traumatici che comportano lesioni alle componenti strutturali delle articolazioni.'),
('mediteck', 'prodotti', 'biologic', 'name', 'BIOLOGICS'),
('mediteck', 'prodotti', 'biologic', 'subtitle', 'Biotecnologie Rigenerative'),
('mediteck', 'prodotti', 'biologic', 'description', 'Oggi in medicina c''è molta attenzione sulla ricerca di biotecnologie che possano portare benefici ai pazienti senza chirurgia.'),
('mediteck', 'prodotti', 'beontop', 'name', 'BEONTOP'),
('mediteck', 'prodotti', 'beontop', 'subtitle', 'Calze a Compressione Made in Italy'),
('mediteck', 'prodotti', 'beontop', 'description', 'BeOnTop nasce dalla sinergia tra professionisti sanitari e un''azienda leader mondiale nel ramo manifatturiero made in Italy.'),
('mediteck', 'prodotti', 'criotherapy', 'name', 'CRIOTHERAPY NICE®'),
('mediteck', 'prodotti', 'criotherapy', 'subtitle', 'Criopressoterapia Computerizzata'),
('mediteck', 'prodotti', 'criotherapy', 'description', 'La crioterapia, attraverso specifiche fasce termiche, combina compressione e raffreddamento per una guarigione accelerata.')
ON CONFLICT (client_id, page, section, field) DO UPDATE SET value = EXCLUDED.value;
