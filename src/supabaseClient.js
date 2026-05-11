import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://fskvvujmoskzcgmcmekz.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZza3Z2dWptb3NremNnbWNtZWt6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM3NDQwMzgsImV4cCI6MjA4OTMyMDAzOH0.8AEhr4tTL5DcSX5kIIYDzhj1tnZrPl_VmdzVO2BD7-U'
export const supabase = createClient(supabaseUrl, supabaseKey)