// Fiori Oscuri - Supabase Configuration
// Questo file è usato sia dall'app React che dall'admin HTML

const SUPABASE_URL = 'https://mfkvkqflomqqngogdfrn.supabase.co';
const SUPABASE_KEY = 'sb_publishable_gnnXKDQuPnFzJDuLLqgfAA_nNFqhdrR';

// Export for ES modules (React app)
export const supabaseUrl = SUPABASE_URL;
export const supabaseAnonKey = SUPABASE_KEY;

// For browser scripts
if (typeof window !== 'undefined') {
  window.SUPABASE_URL = SUPABASE_URL;
  window.SUPABASE_KEY = SUPABASE_KEY;
}
