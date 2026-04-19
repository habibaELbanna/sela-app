import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://exuaiuwmxgybxykqxown.supabase.co'
const supabaseAnonKey =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV4dWFpdXdteGd5Ynh5a3F4b3duIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NjUwMjQyMywiZXhwIjoyMDkyMDc4NDIzfQ.cT0MB46G34aUbveka-5fWR1DUk7vsWfFOh2f95pRsys'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
