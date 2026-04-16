import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://fmsrakinxicxiejjujlr.supabase.co'
const supabaseAnonKey =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZtc3Jha2lueGljeGllamp1amxyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ1MTUwODUsImV4cCI6MjA5MDA5MTA4NX0.U0eRsy_U_VExqWJVGHjlx_ibvxTsKmjpyadZogB_Zm0'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
