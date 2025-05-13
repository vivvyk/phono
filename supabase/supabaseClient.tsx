import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  'https://wigpjgdplntvtcutkxem.supabase.co',       // replace with your URL
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndpZ3BqZ2RwbG50dnRjdXRreGVtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY0MDMwNzEsImV4cCI6MjA2MTk3OTA3MX0.f-bWfkZ7gk_NK5jpJpaYU8S19D8jZYChZlqQIuEDKLY'
)
