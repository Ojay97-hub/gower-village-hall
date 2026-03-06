import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://jqgdlwzpelyjztngmtgb.supabase.co';
const supabaseKey = 'sb_publishable_iOZgl5xbbPw9WClcW8UqSw_wXU7VgxV';
const supabase = createClient(supabaseUrl, supabaseKey);

const events = [
  {
    title: "Children’s Easter Egg Hunt",
    description: "Time TBC",
    date: "2026-04-05",
    start_time: null,
    type: "Community"
  },
  {
    title: "AGM Village Hall Committee",
    description: "Annual General Meeting",
    date: "2026-04-14",
    start_time: "19:00:00",
    type: "Meeting"
  },
  {
    title: "Celebration of Local Artists",
    description: "Exhibition and celebration of local artistry.",
    date: "2026-06-03",
    start_time: null,
    type: "Event"
  },
  {
    title: "BBQ and Ceilidh",
    description: "Join us for a fun BBQ and Ceilidh dancing evening.",
    date: "2026-06-27",
    start_time: "18:00:00",
    type: "Community"
  },
  {
    title: "Pizza and Prosecco",
    description: "Featuring local vocalists. (Exact date TBC)",
    date: "2026-09-15",
    start_time: null,
    type: "Event"
  },
  {
    title: "An Audience With...",
    description: "Specialist speaker and supper. (Exact date TBC)",
    date: "2026-11-15",
    start_time: null,
    type: "Event"
  },
  {
    title: "Christmas Village Feast",
    description: "Annual festive celebration and feast.",
    date: "2026-12-12",
    start_time: null,
    type: "Community"
  }
];

async function seed() {
  console.log("Deleting existing events...");
  const { error: deleteError } = await supabase
    .from('events')
    .delete()
    .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all

  if (deleteError) {
    console.error("Error deleting events:", deleteError);
    return;
  }
  
  console.log("Inserting new events...");
  const { data, error } = await supabase
    .from('events')
    .insert(events)
    .select();
    
  if (error) {
    console.error("Error inserting events:", error);
  } else {
    console.log("Successfully inserted", data.length, "events.");
  }
}

seed();
