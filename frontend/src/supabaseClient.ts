// src/supabaseClient.ts
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://kwdzovhgthkazpmyrysg.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt3ZHpvdmhndGhrYXpwbXlyeXNnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEyMjk3MDgsImV4cCI6MjA2NjgwNTcwOH0.7a5Uh4prILp3vRQ5QrWuqg9EpjiNyfdfjPwV8ttgHXY';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);