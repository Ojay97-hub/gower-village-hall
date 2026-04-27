import { supabase } from '../lib/supabaseClient';
import type { Church, Service, Announcement } from '../types/church';

export async function getChurchesWithRelations(): Promise<Church[]> {
  const { data, error } = await supabase
    .from('churches')
    .select(`
      *,
      services (*),
      content_blocks (*),
      announcements (*)
    `)
    .order('name');

  if (error) throw error;
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

export async function addAnnouncement(payload: Omit<Announcement, 'id'>): Promise<void> {
  const { error } = await supabase.from('announcements').insert([payload]);
  if (error) throw error;
}

export async function updateAnnouncement(
  id: string,
  updates: Partial<Pick<Announcement, 'message' | 'expiry_date'>>
): Promise<void> {
  const { error } = await supabase.from('announcements').update(updates).eq('id', id);
  if (error) throw error;
}

export async function deleteAnnouncement(id: string): Promise<void> {
  const { error } = await supabase.from('announcements').delete().eq('id', id);
  if (error) throw error;
}
