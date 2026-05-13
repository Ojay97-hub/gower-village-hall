import { supabase } from '../lib/supabaseClient';
import type { Church, Service, Announcement, ContentBlock, ChurchEvent } from '../types/church';

export async function getChurchesWithRelations(): Promise<Church[]> {
  const { data, error } = await supabase
    .from('churches')
    .select(`
      *,
      services (*),
      content_blocks (*),
      announcements (*),
      events:church_events (*)
    `)
    .order('name');

  if (error) {
    if (error.message?.includes('church_events')) {
      const { data: fallbackData, error: fallbackError } = await supabase
        .from('churches')
        .select(`
          *,
          services (*),
          content_blocks (*),
          announcements (*)
        `)
        .order('name');

      if (fallbackError) throw fallbackError;
      return (fallbackData ?? []).map(church => ({ ...church, events: [] })) as Church[];
    }
    throw error;
  }
  return (data ?? []) as Church[];
}

export async function addService(payload: Omit<Service, 'id'>): Promise<void> {
  const { error } = await supabase.from('services').insert([payload]);
  if (error) throw error;
}

export async function deleteService(id: string): Promise<void> {
  const { error } = await supabase.from('services').delete().eq('id', id);
  if (error) throw error;
}

export async function updateService(
  id: string,
  updates: Partial<Pick<Service, 'title' | 'date_time' | 'recurring_text' | 'description'>>
): Promise<void> {
  const { error } = await supabase.from('services').update(updates).eq('id', id);
  if (error) throw error;
}

export async function addAnnouncement(payload: Omit<Announcement, 'id'>): Promise<void> {
  const { start_date, expiry_date, ...rest } = payload;
  const row = {
    ...rest,
    ...(start_date != null ? { start_date } : {}),
    ...(expiry_date != null ? { expiry_date } : {}),
  };
  const { error } = await supabase.from('announcements').insert([row]);
  if (error) throw error;
}

export async function updateAnnouncement(
  id: string,
  updates: Partial<Pick<Announcement, 'message' | 'start_date' | 'expiry_date'>>
): Promise<void> {
  const patch: Record<string, unknown> = { ...updates };
  if ('start_date' in updates) patch.start_date = updates.start_date ?? null;
  if ('expiry_date' in updates) patch.expiry_date = updates.expiry_date ?? null;
  const { error } = await supabase.from('announcements').update(patch).eq('id', id);
  if (error) throw error;
}

export async function deleteAnnouncement(id: string): Promise<void> {
  const { error } = await supabase.from('announcements').delete().eq('id', id);
  if (error) throw error;
}

export async function addChurchEvent(payload: Omit<ChurchEvent, 'id'>): Promise<void> {
  const { error } = await supabase.from('church_events').insert([payload]);
  if (error) throw error;
}

export async function updateChurchEvent(
  id: string,
  updates: Partial<Pick<ChurchEvent, 'title' | 'event_date' | 'description' | 'location'>>
): Promise<void> {
  const { error } = await supabase.from('church_events').update(updates).eq('id', id);
  if (error) throw error;
}

export async function deleteChurchEvent(id: string): Promise<void> {
  const { error } = await supabase.from('church_events').delete().eq('id', id);
  if (error) throw error;
}

export async function updateChurch(
  id: string,
  updates: Partial<Pick<Church, 'name' | 'description' | 'address' | 'image_url' | 'previous_image_url'>>
): Promise<void> {
  const { error } = await supabase.from('churches').update(updates).eq('id', id);
  if (error) throw error;
}

export async function updateContentBlock(
  id: string,
  updates: Partial<Pick<ContentBlock, 'title' | 'content'>>
): Promise<void> {
  const { error } = await supabase.from('content_blocks').update(updates).eq('id', id);
  if (error) throw error;
}

export async function addChurch(
  payload: Pick<Church, 'name' | 'description' | 'address' | 'image_url'>
): Promise<void> {
  const { error } = await supabase.from('churches').insert([payload]);
  if (error) throw error;
}

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const ALLOWED_IMAGE_EXTENSIONS = ['jpg', 'jpeg', 'png', 'webp', 'gif'];
const MAX_IMAGE_BYTES = 5 * 1024 * 1024; // 5 MB

export async function uploadChurchImage(file: File): Promise<string> {
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    throw new Error('Invalid file type. Only JPEG, PNG, WebP, and GIF images are allowed.');
  }
  if (file.size > MAX_IMAGE_BYTES) {
    throw new Error('File is too large. Maximum size is 5 MB.');
  }

  const rawExt = file.name.split('.').pop()?.toLowerCase() ?? '';
  const fileExt = ALLOWED_IMAGE_EXTENSIONS.includes(rawExt) ? rawExt : 'jpg';
  const filePath = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
  const { error } = await supabase.storage.from('church-images').upload(filePath, file, {
    contentType: file.type,
  });
  if (error) throw error;
  const { data } = supabase.storage.from('church-images').getPublicUrl(filePath);
  return data.publicUrl;
}
