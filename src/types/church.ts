export interface Service {
  id: string;
  church_id: string;
  title: string;
  date_time: string;
  recurring_text?: string | null;
  description?: string | null;
}

export interface ContentBlock {
  id: string;
  church_id: string;
  type: 'visiting' | 'about';
  title: string;
  content: string;
}

export interface Announcement {
  id: string;
  church_id: string;
  message: string;
  start_date?: string | null;
  expiry_date?: string | null;
}

export interface ChurchEvent {
  id: string;
  church_id: string;
  title: string;
  event_date: string;
  description?: string | null;
  location?: string | null;
}

export interface Church {
  id: string;
  name: string;
  description: string;
  address: string;
  image_url: string;
  previous_image_url?: string | null;
  services: Service[];
  content_blocks: ContentBlock[];
  announcements: Announcement[];
  events: ChurchEvent[];
}
