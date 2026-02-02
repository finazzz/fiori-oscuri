-- =====================================================
-- FIORI OSCURI - FIX DUPLICATI E TELEFONI
-- Copia e incolla questo script in Supabase SQL Editor → Run
-- =====================================================

-- STEP 1: Vedi i duplicati (esegui prima questo per vedere cosa c'è)
SELECT 
    phone,
    CASE WHEN phone LIKE '+%' THEN phone ELSE '+' || phone END as normalized,
    COUNT(*) as count
FROM profiles 
WHERE phone IS NOT NULL
GROUP BY phone
HAVING COUNT(*) > 1
   OR CASE WHEN phone LIKE '+%' THEN phone ELSE '+' || phone END IN (
       SELECT phone FROM profiles WHERE phone LIKE '+%'
   );

-- =====================================================
-- STEP 2: Se ci sono duplicati, prima cancella quello senza + 
-- (quello corretto è con il +)
-- =====================================================

-- Prima vediamo i profili da eliminare (quelli senza + che hanno un duplicato con +)
SELECT p1.id, p1.phone, p1.display_name, 'DA ELIMINARE - duplicato senza +' as action
FROM profiles p1
WHERE p1.phone NOT LIKE '+%'
  AND EXISTS (
    SELECT 1 FROM profiles p2 
    WHERE p2.phone = '+' || p1.phone
  );

-- Elimina i duplicati (quelli senza + che hanno già una versione con +)
DELETE FROM profiles 
WHERE phone NOT LIKE '+%'
  AND EXISTS (
    SELECT 1 FROM profiles p2 
    WHERE p2.phone = '+' || profiles.phone
  );

-- =====================================================
-- STEP 3: Ora normalizza tutti i restanti
-- =====================================================

UPDATE profiles 
SET phone = '+' || phone 
WHERE phone IS NOT NULL 
  AND phone != '' 
  AND phone NOT LIKE '+%';

-- Verifica finale
SELECT id, display_name, phone, invite_code, flower_count 
FROM profiles 
ORDER BY created_at DESC 
LIMIT 10;
