-- Update existing events with full descriptions based on their titles
UPDATE public.events 
SET description = 'Annual Easter egg hunt for children aged 3-12. Bring a basket and wear your wellies!'
WHERE title = 'Children’s Easter Egg Hunt';

UPDATE public.events 
SET description = 'Annual General Meeting for the Village Hall Committee to discuss finances, upcoming projects, and community feedback.'
WHERE title = 'AGM Village Hall Committee';

UPDATE public.events 
SET description = 'An evening showcasing incredible artwork, sculptures, and crafts from talented residents of our village and surrounding areas.'
WHERE title = 'Celebration of Local Artists';

UPDATE public.events 
SET description = 'A classic summer BBQ followed by a live ceilidh band. Bring your dancing shoes! Tickets include food.'
WHERE title = 'BBQ and Ceilidh';

UPDATE public.events 
SET description = 'A relaxed evening featuring artisan wood-fired pizzas, prosecco, and fantastic acoustic sets from local vocalists. (Exact date in September TBC)'
WHERE title = 'Pizza and Prosecco';

UPDATE public.events 
SET description = 'Join us for a wonderful supper accompanied by a fascinating talk from our special guest speaker. (Exact date in November TBC)'
WHERE title = 'An Audience With';

UPDATE public.events 
SET description = 'Our beloved annual winter celebration featuring a traditional festive feast, mulled wine, and carols.'
WHERE title = 'Christmas Village Feast';
