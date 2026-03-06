import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://jqgdlwzpelyjztngmtgb.supabase.co';
const supabaseKey = 'sb_publishable_iOZgl5xbbPw9WClcW8UqSw_wXU7VgxV';
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkEvents() {
    console.log("Fetching events...");
    const { data, error } = await supabase.from('events').select('*');
    if (error) {
        console.error("Error fetching events:", error);
    } else {
        console.log("Events exactly as in DB:", data);
    }
}

checkEvents();
