-- ============================================
-- CRG ITALIA SETUP - ESEGUI DOPO supabase_init.sql
-- Vai su: Supabase Dashboard > SQL Editor > New Query
-- ============================================

-- Inserisci il cliente CRG Italia
INSERT INTO clients (id, name, domain) 
VALUES ('crg-italia', 'CRG Italia S.R.L.', 'crgitalia.com')
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- CONTENUTI INIZIALI
-- ============================================

-- HERO
INSERT INTO content (client_id, page, section, field, value) VALUES
('crg-italia', 'home', 'hero', 'subtitle', 'Spedizioni Internazionali & Logistica'),
('crg-italia', 'home', 'hero', 'title', 'L''ECCELLENZA NEL TRASPORTO MERCI'),
('crg-italia', 'home', 'hero', 'description', 'Velocità, Precisione e Affidabilità dal 2002. Il tuo partner ideale per il mercato europeo.'),
('crg-italia', 'home', 'hero', 'cta_primary', 'Richiedi Preventivo'),
('crg-italia', 'home', 'hero', 'cta_secondary', 'Scopri i Servizi')
ON CONFLICT (client_id, page, section, field) DO UPDATE SET value = EXCLUDED.value;

-- STATS
INSERT INTO content (client_id, page, section, field, value) VALUES
('crg-italia', 'home', 'stats', 'years', '30'),
('crg-italia', 'home', 'stats', 'years_label', 'Anni di Esperienza'),
('crg-italia', 'home', 'stats', 'availability', '24'),
('crg-italia', 'home', 'stats', 'availability_label', 'Disponibilità Operativa'),
('crg-italia', 'home', 'stats', 'coverage', '100'),
('crg-italia', 'home', 'stats', 'coverage_label', 'Copertura Europea'),
('crg-italia', 'home', 'stats', 'revenue', '5'),
('crg-italia', 'home', 'stats', 'revenue_label', 'Fatturato Annuo')
ON CONFLICT (client_id, page, section, field) DO UPDATE SET value = EXCLUDED.value;

-- ABOUT
INSERT INTO content (client_id, page, section, field, value) VALUES
('crg-italia', 'home', 'about', 'subtitle', 'CHI SIAMO'),
('crg-italia', 'home', 'about', 'title', 'Più di una semplice azienda di trasporti'),
('crg-italia', 'home', 'about', 'lead', 'Un''azienda a conduzione familiare... una garanzia in più per scegliere CRG ITALIA.'),
('crg-italia', 'home', 'about', 'description', 'Fondata nel 2002 dalle sorelle Cristina e Roberta Gritti, CRG Italia porta con sé un''eredità di oltre 30 anni nel settore logistico. Siamo specializzati in spedizioni internazionali e trasporti con sede ad Alzano Lombardo, nel cuore industriale pulsante della Lombardia.'),
('crg-italia', 'home', 'about', 'feature_1', 'Servizio personale e responsabilità diretta'),
('crg-italia', 'home', 'about', 'feature_2', 'Relazioni a lungo termine con i clienti'),
('crg-italia', 'home', 'about', 'feature_3', 'Flessibilità e rapidità decisionale')
ON CONFLICT (client_id, page, section, field) DO UPDATE SET value = EXCLUDED.value;

-- SERVIZI
INSERT INTO content (client_id, page, section, field, value) VALUES
('crg-italia', 'home', 'services', 'subtitle', 'COSA FACCIAMO'),
('crg-italia', 'home', 'services', 'title', 'Soluzioni Logistiche Su Misura'),

('crg-italia', 'home', 'services', 'service1_title', 'Carichi Espressi'),
('crg-italia', 'home', 'services', 'service1_description', 'Specializzazione in servizi time-critical per il settore Automotive. Disponibilità 24/7, inclusi weekend e festivi, senza sovrapprezzi.'),
('crg-italia', 'home', 'services', 'service1_detail1', 'Copertura tutta Europa'),
('crg-italia', 'home', 'services', 'service1_detail2', 'Mezzi ADR e Frigo'),
('crg-italia', 'home', 'services', 'service1_detail3', 'Doppio autista'),

('crg-italia', 'home', 'services', 'service2_title', 'Carichi Completi & Groupage'),
('crg-italia', 'home', 'services', 'service2_description', 'Partenze giornaliere per carichi completi e spedizioni consolidate. Affidabilità e puntualità garantite.'),
('crg-italia', 'home', 'services', 'service2_detail1', 'Bilici 13.60m Tautliner'),
('crg-italia', 'home', 'services', 'service2_detail2', 'Mega Trailer (100 m³)'),
('crg-italia', 'home', 'services', 'service2_detail3', 'Camion Frigo'),

('crg-italia', 'home', 'services', 'service3_title', 'Intermodale'),
('crg-italia', 'home', 'services', 'service3_description', 'Combinazione intelligente di trasporto strada, ferrovia e mare per ottimizzare costi e ridurre l''impatto ambientale.'),
('crg-italia', 'home', 'services', 'service3_detail1', 'Tratte europee lunghe'),
('crg-italia', 'home', 'services', 'service3_detail2', 'Efficienza energetica'),
('crg-italia', 'home', 'services', 'service3_detail3', 'Riduzione costi')
ON CONFLICT (client_id, page, section, field) DO UPDATE SET value = EXCLUDED.value;

-- SHOWCASE
INSERT INTO content (client_id, page, section, field, value) VALUES
('crg-italia', 'home', 'showcase', 'title', 'IL TUO CARICO, LA NOSTRA MISSIONE'),
('crg-italia', 'home', 'showcase', 'feature1_title', 'Preventivo Immediato'),
('crg-italia', 'home', 'showcase', 'feature1_description', 'Nessuna attesa. Miglior prezzo e transit time alla prima chiamata.'),
('crg-italia', 'home', 'showcase', 'feature2_title', 'Sicurezza Totale'),
('crg-italia', 'home', 'showcase', 'feature2_description', 'Tracciamento costante e certificazione ISO 9001:2015.'),
('crg-italia', 'home', 'showcase', 'feature3_title', 'Copertura Totale'),
('crg-italia', 'home', 'showcase', 'feature3_description', 'Dall''Italia verso tutta Europa e tratte Intra-Europee.')
ON CONFLICT (client_id, page, section, field) DO UPDATE SET value = EXCLUDED.value;

-- CONTATTI
INSERT INTO content (client_id, page, section, field, value) VALUES
('crg-italia', 'home', 'contact', 'subtitle', 'CONTATTACI'),
('crg-italia', 'home', 'contact', 'title', 'Inizia a spedire con CRG Italia'),
('crg-italia', 'home', 'contact', 'address_title', 'Sede Operativa'),
('crg-italia', 'home', 'contact', 'address', 'Via Locatelli, n°3, 24022 Alzano Lombardo (BG), Italia'),
('crg-italia', 'home', 'contact', 'phone_title', 'Telefono & Fax'),
('crg-italia', 'home', 'contact', 'phone', '+39 035 41.23.284'),
('crg-italia', 'home', 'contact', 'fax', '+39 035 41.23.395'),
('crg-italia', 'home', 'contact', 'email_title', 'Email'),
('crg-italia', 'home', 'contact', 'email', 'info@crgitalia.com'),
('crg-italia', 'home', 'contact', 'email_secondary', 'cristina@crgitalia.com')
ON CONFLICT (client_id, page, section, field) DO UPDATE SET value = EXCLUDED.value;

-- FOOTER
INSERT INTO content (client_id, page, section, field, value) VALUES
('crg-italia', 'home', 'footer', 'copyright', '© 2026 CRG ITALIA S.R.L. - Tutti i diritti riservati.'),
('crg-italia', 'home', 'footer', 'piva', 'P.IVA IT 02969500160')
ON CONFLICT (client_id, page, section, field) DO UPDATE SET value = EXCLUDED.value;
