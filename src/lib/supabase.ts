import { createClient } from '@supabase/supabase-js';

// Hardcoded for deployment stability as requested
const supabaseUrl = "https://yhbfdplcwizmdvemanci.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InloYmZkcGxjd2l6bWR2ZW1hbmNpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc3MDAxOTMsImV4cCI6MjA4MzI3NjE5M30.ppM_r9Ebup53vVaZJxvWDPm3y2xwnxavhT00y_AQuZ4";

if (!supabaseUrl) throw new Error('VITE_SUPABASE_URL is missing');
if (!supabaseAnonKey) throw new Error('VITE_SUPABASE_ANON_KEY is missing');

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
