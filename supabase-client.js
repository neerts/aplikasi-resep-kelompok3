// GANTI DENGAN URL PROYEK ANDA
const SUPABASE_URL = 'https://qeepoznubthyfirsbtsz.supabase.co'; 

// GANTI DENGAN KUNCI ANON PUBLIK ANDA
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFlZXBvem51YnRoeWZpcnNidHN6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE2NjIxNjMsImV4cCI6MjA3NzIzODE2M30.2fM6H13dvROlPfvrdVtOeWs5PYL3i9KULxtlFGVPNQU';

// --- PERBAIKAN ADA DI SINI ---
// Kita harus secara eksplisit merujuk ke objek 'supabase' global
// yang dimuat oleh CDN, yang ada di 'window.supabase'.
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
