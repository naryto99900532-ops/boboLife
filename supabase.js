import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm'

const supabaseUrl = 'https://dikfugzhszrqkounopms.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRpa2Z1Z3poc3pycWtvdW5vcG1zIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAxMjM4NDksImV4cCI6MjA4NTY5OTg0OX0.fNEFld6HO8ciHuVDp1yIaZXjQkuv6E6a8Tg_mNFN3Y4'
export const supabase = createClient(supabaseUrl, supabaseKey)
