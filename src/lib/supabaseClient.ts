import { createClient } from '@supabase/supabase-js';

// NOTA: Em produção, estas chaves devem estar no arquivo .env
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://sua-url-aqui.supabase.co';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sua-chave-anonima-aqui';

export const supabase = createClient(supabaseUrl, supabaseKey);
