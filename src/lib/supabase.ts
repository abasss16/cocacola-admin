import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://shkaxqevgiuyobuprpjz.supabase.co';
const supabaseKey = 'sb_publishable_izJ4J29D9wBI4urtgz2Acg_Ur43bh3g';

export const supabase = createClient(supabaseUrl, supabaseKey);
