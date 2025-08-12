
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = https://pritacouhsqmrukolbbo.supabase.co;
const supabaseKey = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InByaXRhY291aHNxbXJ1a29sYmJvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ5NDAxMTcsImV4cCI6MjA3MDUxNjExN30.ibkv6KaQkpIwxJojIZTKKdiTllfyaKZ-edOUWLr6Quk;

export const supabase = createClient(supabaseUrl, supabaseKey);
        