import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://qvxnkdzggijciklxjcgg.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF2eG5rZHpnZ2lqY2lrbHhqY2dnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE2NDU4MTcsImV4cCI6MjA2NzIyMTgxN30.SqAesdk2vcTikmVYbq4evtgcEdAWYWcibz2zz2H3LWM";

export const supabase = createClient(supabaseUrl, supabaseKey);
