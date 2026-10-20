import { createClient } from '@supabase/supabase-js';

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  'https://giscopvcchycdvwcffub.supabase.co';
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdpc2NvcHZjY2h5Y2R2d2NmZnViIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTI1MTEwNzEsImV4cCI6MjEwODA4NzA3MX0.PTD84nde14l3DzPKdtbA5J2ohgiLSTwzjb8eu8J4lTE';

export const STORAGE_BUCKET =
  process.env.NEXT_PUBLIC_STORAGE_BUCKET || 'documentos-contrataciones';

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
