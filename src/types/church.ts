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
  expiry_date: string;
}

export interface Church {
  id: string;
  name: string;
  description: string;
  address: string;
  image_url: string;
  image_position?: string | null;
  services: Service[];
  content_blocks: ContentBlock[];
  announcements: Announcement[];
}
