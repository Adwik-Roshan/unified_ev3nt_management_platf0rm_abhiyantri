import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://kiefsbyxcvevmkyoeyij.supabase.co';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtpZWZzYnl4Y3Zldm1reW9leWlqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc5OTE1MjMsImV4cCI6MjEwMzU2NzUyM30.U-GT0WwFclVt8k9sMMPCSmshweuOuqz1tke0Ipro6dM';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});
