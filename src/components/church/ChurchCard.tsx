import { useState } from 'react';
import {
  Clock, Calendar, MapPin, Megaphone, ListOrdered, ArrowRight,
  Edit2, Plus, Trash2, X, Loader2,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPortal } from 'react-dom';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import type { Church, Service, ContentBlock } from '../../types/church';
import {
  addService, deleteService, updateService,
  addAnnouncement, deleteAnnouncement,
  updateContentBlock, updateChurch,
} from '../../services/churchService';

function getChurchSlug(name: string): string | null {
  if (/st[\s.'`-]?john/i.test(name)) return 'st-johns';
  if (/st[\s.'`-]?nicholas/i.test(name)) return 'st-nicholas';
  return null;
}

interface ChurchCardProps {
  church: Church;
  imageRight?: boolean;
  visible?: boolean;
  animationDelay?: number;
  isAdmin?: boolean;
  onRefresh?: () => void;
}

// ── Edit Details Modal ───────────────────────────────────────────────────────

function ChurchEditModal({ church, onClose, onSaved }: { church: Church; onClose: () => void; onSaved: () => void }) {
  const [form, setForm] = useState({
    name: church.name,
    description: church.description,
    address: church.address,
    image_url: church.image_url ?? '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim() || !form.description.trim() || !form.address.trim()) {
      setError('Name, description, and address are required.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      await updateChurch(church.id, {
        name: form.name.trim(),
        description: form.description.trim(),
        address: form.address.trim(),
        image_url: form.image_url.trim(),
      });
      onSaved();
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to save.');
      setSaving(false);
    }
  }

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-bold font-serif text-gray-900">Edit Church Details</h2>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <input type="text" required value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea required rows={3} value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none resize-none transition-all" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
            <input type="text" required value={form.address}
              onChange={e => setForm(f => ({ ...f, address: e.target.value }))}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
            <input type="text" value={form.image_url}
              onChange={e => setForm(f => ({ ...f, image_url: e.target.value }))}
              placeholder="https://..."
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all" />
          </div>
          {error && <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-3">{error}</p>}
          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose} disabled={saving}
              className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={saving}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-primary-600 rounded-xl hover:bg-primary-700 transition-colors disabled:opacity-70">
              {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</> : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body,
  );
}

// ── Content Block Inline Edit ────────────────────────────────────────────────

function ContentBlockEdit({ block, onSaved }: { block: ContentBlock; onSaved: () => void }) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ title: block.title, content: block.content });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  function openEdit() {
    setForm({ title: block.title, content: block.content });
    setOpen(true);
  }

  async function handleSave() {
    if (!form.title.trim() || !form.content.trim()) { setError('Title and content are required.'); return; }
    setSaving(true);
    setError('');
    try {
      await updateContentBlock(block.id, { title: form.title.trim(), content: form.content.trim() });
      onSaved();
      setOpen(false);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to save.');
    } finally {
      setSaving(false);
    }
  }

  if (!open) {
    return (
      <button onClick={openEdit}
        className="ml-1.5 text-gray-400 hover:text-primary-600 p-1 rounded hover:bg-primary-50 transition-colors"
        title="Edit visiting info">
        <Edit2 className="w-3.5 h-3.5" />
      </button>
    );
  }

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-bold font-serif text-gray-900">Edit — {block.title}</h2>
          <button onClick={() => setOpen(false)} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
            <input type="text" value={form.title}
              onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none transition-all" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
            <textarea rows={5} value={form.content}
              onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none resize-none transition-all" />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <div className="flex gap-3">
            <button onClick={() => setOpen(false)} disabled={saving}
              className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors">
              Cancel
            </button>
            <button onClick={handleSave} disabled={saving}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-primary-600 rounded-xl hover:bg-primary-700 transition-colors disabled:opacity-70">
              {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</> : 'Save'}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}

// ── Service Timetable Banner ─────────────────────────────────────────────────

function getDayAndTime(service: Service): string {
  if (service.recurring_text) return service.recurring_text;
  const d = new Date(service.date_time);
  return (
    d.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'short' }) +
    ' · ' +
    d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: true })
  );
}

function toDateTimeLocalValue(iso: string): string {
  // Convert ISO timestamp to YYYY-MM-DDTHH:mm in local time for <input type="datetime-local">
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '';
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

// Parse a YYYY-MM-DD string from <input type="date"> as local end-of-day,
// not UTC midnight — otherwise "expires 30 May" can flip to the 29th in some
// timezones and the announcement disappears a day early.
function dateInputToEndOfDayISO(value: string): string {
  const [y, m, d] = value.split('-').map(Number);
  return new Date(y, m - 1, d, 23, 59, 59, 999).toISOString();
}

function ServiceTimetableBanner({
  services,
  isAdmin = false,
  onDelete,
  onUpdate,
  confirmDelId,
  setConfirmDelId,
  saving = false,
}: {
  services: Service[];
  isAdmin?: boolean;
  onDelete?: (id: string) => void;
  onUpdate?: (id: string, payload: { title: string; date_time: string; recurring_text: string | null }) => Promise<void>;
  confirmDelId?: string | null;
  setConfirmDelId?: (id: string | null) => void;
  saving?: boolean;
}) {
  const sorted = [...services].sort(
    (a, b) => new Date(a.date_time).getTime() - new Date(b.date_time).getTime(),
  );

  const [editId, setEditId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDateTime, setEditDateTime] = useState('');
  const [editRecurring, setEditRecurring] = useState('');
  const [editError, setEditError] = useState('');

  function startEdit(s: Service) {
    setEditId(s.id);
    setEditTitle(s.title);
    setEditDateTime(toDateTimeLocalValue(s.date_time));
    setEditRecurring(s.recurring_text ?? '');
    setEditError('');
    setConfirmDelId?.(null);
  }

  function cancelEdit() {
    setEditId(null);
    setEditError('');
  }

  async function saveEdit(id: string) {
    if (!onUpdate) {
      // Edit button is only rendered when onUpdate is provided, so this is
      // a defensive guard — if the prop is missing we can't save, don't
      // close the form silently.
      setEditError('Editing is not available.');
      return;
    }
    if (!editTitle.trim() || !editDateTime) {
      setEditError('Title and date/time are required.');
      return;
    }
    setEditError('');
    try {
      await onUpdate(id, {
        title: editTitle.trim(),
        date_time: new Date(editDateTime).toISOString(),
        recurring_text: editRecurring.trim() || null,
      });
      setEditId(null);
    } catch (err: unknown) {
      setEditError(err instanceof Error ? err.message : 'Failed to update service.');
    }
  }

  if (sorted.length === 0) return null;

  return (
    <div className="mb-8 rounded-2xl overflow-hidden border border-primary-100 shadow-sm">
      <div className="flex items-center gap-2 px-4 sm:px-5 py-3 bg-primary-700">
        <ListOrdered className="w-4 h-4 text-white/80" />
        <span className="text-xs font-bold uppercase tracking-widest text-white/90">Service Timetable</span>
      </div>
      <div className="divide-y divide-gray-100">
        {sorted.map(s => {
          const isEditing = editId === s.id;

          if (isEditing) {
            return (
              <div key={s.id} className="px-4 sm:px-5 py-3 sm:py-3.5 bg-primary-50/40 space-y-2">
                <input type="text" placeholder="Title" value={editTitle}
                  onChange={e => setEditTitle(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary-400" />
                <input type="datetime-local" value={editDateTime}
                  onChange={e => setEditDateTime(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary-400" />
                <input type="text" placeholder='Recurring label — optional (e.g. "Every Sunday at 9:30 AM")' value={editRecurring}
                  onChange={e => setEditRecurring(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary-400" />
                {editError && <p className="text-xs text-red-600">{editError}</p>}
                <div className="flex gap-2">
                  <button onClick={() => saveEdit(s.id)} disabled={saving}
                    className="flex items-center gap-1.5 text-xs px-3 py-1.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 transition-colors cursor-pointer">
                    {saving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Edit2 className="w-3 h-3" />}
                    Save
                  </button>
                  <button onClick={cancelEdit} disabled={saving}
                    className="text-xs px-3 py-1.5 text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
                    Cancel
                  </button>
                </div>
              </div>
            );
          }

          return (
            <div
              key={s.id}
              className="flex items-start sm:items-center gap-3 sm:gap-4 px-4 sm:px-5 py-3 sm:py-3.5 bg-white"
            >
              <div className="shrink-0 pt-0.5 sm:pt-0">
                <Clock className="w-4 h-4 text-primary-400" />
              </div>
              <div className="flex-1 min-w-0 flex flex-col sm:flex-row sm:items-center sm:gap-3">
                <span className="text-sm font-semibold text-gray-700">
                  {s.title}
                </span>
                <span className="text-xs sm:text-sm sm:ml-auto sm:text-right mt-0.5 sm:mt-0 text-gray-500">
                  {getDayAndTime(s)}
                </span>
              </div>
              {isAdmin && onDelete && setConfirmDelId && (
                <div className="shrink-0 flex items-center gap-1">
                  {confirmDelId === s.id ? (
                    <>
                      <button onClick={() => onDelete(s.id)} disabled={saving}
                        className="p-1 text-red-600 hover:bg-red-50 rounded disabled:opacity-50 cursor-pointer" title="Confirm delete">
                        {saving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Trash2 className="w-3 h-3" />}
                      </button>
                      <button onClick={() => setConfirmDelId(null)} className="p-1 text-gray-400 hover:bg-gray-100 rounded cursor-pointer" title="Cancel">
                        <X className="w-3 h-3" />
                      </button>
                    </>
                  ) : (
                    <>
                      {onUpdate && (
                        <button onClick={() => startEdit(s)}
                          className="p-1 text-gray-300 hover:text-primary-600 rounded transition-colors cursor-pointer" title="Edit service">
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                      <button onClick={() => setConfirmDelId(s.id)}
                        className="p-1 text-gray-300 hover:text-red-400 rounded transition-colors cursor-pointer" title="Delete service">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Main ChurchCard ──────────────────────────────────────────────────────────

export function ChurchCard({
  church,
  imageRight = false,
  visible = true,
  animationDelay = 0,
  isAdmin = false,
  onRefresh,
}: ChurchCardProps) {
  const activeAnnouncements = church.announcements.filter(a => new Date(a.expiry_date) > new Date());
  const visitingBlock = church.content_blocks.find((b: ContentBlock) => b.type === 'visiting');

  // Admin: details modal
  const [editDetails, setEditDetails] = useState(false);

  // Admin: services
  const [confirmDelSvc, setConfirmDelSvc] = useState<string | null>(null);
  const [showAddService, setShowAddService] = useState(false);
  const [svcTitle, setSvcTitle] = useState('');
  const [svcDateTime, setSvcDateTime] = useState('');
  const [svcRecurring, setSvcRecurring] = useState('');

  // Admin: announcements
  const [confirmDelAnn, setConfirmDelAnn] = useState<string | null>(null);
  const [showAddAnn, setShowAddAnn] = useState(false);
  const [annMsg, setAnnMsg] = useState('');
  const [annExpiry, setAnnExpiry] = useState('');

  // Shared saving / error
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  async function handleDeleteService(id: string) {
    setSaving(true);
    setError('');
    try {
      await deleteService(id);
      onRefresh?.();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to delete service.');
    } finally {
      setSaving(false);
      setConfirmDelSvc(null);
    }
  }

  async function handleUpdateService(id: string, payload: { title: string; date_time: string; recurring_text: string | null }) {
    setSaving(true);
    setError('');
    try {
      await updateService(id, payload);
      onRefresh?.();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to update service.';
      setError(message);
      throw err instanceof Error ? err : new Error(message);
    } finally {
      setSaving(false);
    }
  }

  async function handleAddService() {
    if (!svcTitle.trim() || !svcDateTime) { setError('Service title and date/time are required.'); return; }
    setSaving(true);
    setError('');
    try {
      await addService({
        church_id: church.id,
        title: svcTitle.trim(),
        date_time: new Date(svcDateTime).toISOString(),
        recurring_text: svcRecurring.trim() || null,
        description: null,
      });
      setSvcTitle(''); setSvcDateTime(''); setSvcRecurring('');
      setShowAddService(false);
      onRefresh?.();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to add service.');
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteAnnouncement(id: string) {
    setSaving(true);
    setError('');
    try {
      await deleteAnnouncement(id);
      onRefresh?.();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to delete announcement.');
    } finally {
      setSaving(false);
      setConfirmDelAnn(null);
    }
  }

  async function handleAddAnnouncement() {
    if (!annMsg.trim() || !annExpiry) { setError('Message and expiry date are required.'); return; }
    setSaving(true);
    setError('');
    try {
      await addAnnouncement({
        church_id: church.id,
        message: annMsg.trim(),
        expiry_date: dateInputToEndOfDayISO(annExpiry),
      });
      setAnnMsg(''); setAnnExpiry('');
      setShowAddAnn(false);
      onRefresh?.();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to add announcement.');
    } finally {
      setSaving(false);
    }
  }

  // All announcements for admin view (including expired), active-only for public
  const displayedAnnouncements = isAdmin ? church.announcements : activeAnnouncements;

  return (
    <div
      className={`bg-white rounded-3xl border border-gray-100 transition-all duration-500 overflow-hidden transform group ${
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
      }`}
      style={{ transitionDelay: `${animationDelay}ms` }}
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 h-full">

        {/* Image */}
        <div className={`${imageRight ? 'order-1 lg:order-2' : ''} overflow-hidden h-80 sm:h-96 lg:h-auto lg:min-h-[500px]`}>
          <ImageWithFallback
            src={church.image_url}
            alt={church.name}
            className="w-full h-full object-cover transition-transform duration-700"
          />
        </div>

        {/* Content */}
        <div className={`${imageRight ? 'order-2 lg:order-1' : ''} p-10 lg:p-16 flex flex-col justify-center`}>

          {/* Admin: Edit Details button */}
          {isAdmin && (
            <div className="flex justify-end mb-3 -mt-2">
              <button
                onClick={() => setEditDetails(true)}
                className="flex items-center gap-1.5 text-xs px-3 py-1.5 text-gray-500 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
              >
                <Edit2 className="w-3 h-3" />
                Edit Details
              </button>
            </div>
          )}

          {/* Admin: inline error */}
          {isAdmin && error && (
            <div className="mb-4 px-3 py-2 text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl">
              {error}
            </div>
          )}

          {/* Announcements */}
          {(displayedAnnouncements.length > 0 || isAdmin) && (
            <div className="mb-6 space-y-2">
              {displayedAnnouncements.map(a => {
                const expired = new Date(a.expiry_date) <= new Date();
                return (
                  <div
                    key={a.id}
                    className={`flex items-start gap-3 p-3 rounded-xl border ${
                      expired
                        ? 'bg-gray-50 border-gray-200'
                        : 'bg-amber-50 border-amber-200'
                    }`}
                  >
                    <Megaphone className={`w-4 h-4 mt-0.5 shrink-0 ${expired ? 'text-gray-400' : 'text-amber-600'}`} />
                    <p className={`text-sm leading-snug flex-1 ${expired ? 'text-gray-400' : 'text-amber-800'}`}>
                      {a.message}
                      {isAdmin && expired && (
                        <span className="ml-2 text-xs italic text-gray-400">
                          (expired {new Date(a.expiry_date).toLocaleDateString('en-GB')})
                        </span>
                      )}
                    </p>
                    {isAdmin && (
                      confirmDelAnn === a.id ? (
                        <div className="flex items-center gap-1 shrink-0">
                          <span className="text-xs text-red-600 font-medium">Delete?</span>
                          <button onClick={() => handleDeleteAnnouncement(a.id)} disabled={saving}
                            className="p-1 text-red-600 hover:bg-red-100 rounded disabled:opacity-50">
                            {saving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Trash2 className="w-3 h-3" />}
                          </button>
                          <button onClick={() => setConfirmDelAnn(null)} className="p-1 text-gray-400 hover:bg-gray-100 rounded">
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ) : (
                        <button onClick={() => setConfirmDelAnn(a.id)}
                          className={`shrink-0 transition-colors ${expired ? 'text-gray-300 hover:text-red-400' : 'text-amber-400 hover:text-red-500'}`}>
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )
                    )}
                  </div>
                );
              })}

              {/* Admin: Add announcement form */}
              {isAdmin && (
                showAddAnn ? (
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl space-y-2">
                    <textarea
                      placeholder="Announcement message"
                      value={annMsg}
                      onChange={e => setAnnMsg(e.target.value)}
                      rows={2}
                      className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary-400 resize-none"
                    />
                    <input
                      type="date"
                      value={annExpiry}
                      onChange={e => setAnnExpiry(e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary-400"
                    />
                    <div className="flex gap-2">
                      <button onClick={handleAddAnnouncement} disabled={saving}
                        className="flex items-center gap-1.5 text-xs px-3 py-1.5 bg-amber-600 text-white rounded-lg hover:bg-amber-700 disabled:opacity-50 transition-colors cursor-pointer">
                        {saving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Plus className="w-3 h-3" />}
                        Add
                      </button>
                      <button onClick={() => { setShowAddAnn(false); setAnnMsg(''); setAnnExpiry(''); }}
                        className="text-xs px-3 py-1.5 text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <button onClick={() => setShowAddAnn(true)}
                    className="flex items-center gap-1.5 text-xs text-amber-700 hover:text-amber-900 transition-colors cursor-pointer">
                    <Plus className="w-3.5 h-3.5" />
                    Add Announcement
                  </button>
                )
              )}
            </div>
          )}

          <h2 className="text-3xl font-serif font-bold text-gray-900 mb-6 drop-shadow-sm">{church.name}</h2>
          <p className="text-lg text-gray-600 mb-8 leading-relaxed font-light">{church.description}</p>

          {/* Service timetable */}
          <ServiceTimetableBanner
            services={church.services}
            isAdmin={isAdmin}
            onDelete={handleDeleteService}
            onUpdate={handleUpdateService}
            confirmDelId={confirmDelSvc}
            setConfirmDelId={setConfirmDelSvc}
            saving={saving}
          />

          {/* Admin: Add Service form */}
          {isAdmin && (
            <div className="mb-8 -mt-4">
              {showAddService ? (
                <div className="p-3 bg-primary-50 border border-primary-100 rounded-xl space-y-2">
                  <input type="text" placeholder="Title (e.g. Sunday Morning Service)" value={svcTitle}
                    onChange={e => setSvcTitle(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary-400" />
                  <input type="datetime-local" value={svcDateTime}
                    onChange={e => setSvcDateTime(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary-400" />
                  <input type="text" placeholder='Recurring label — optional (e.g. "Every Sunday at 9:30 AM")' value={svcRecurring}
                    onChange={e => setSvcRecurring(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary-400" />
                  <div className="flex gap-2">
                    <button onClick={handleAddService} disabled={saving}
                      className="flex items-center gap-1.5 text-xs px-3 py-1.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 transition-colors cursor-pointer">
                      {saving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Plus className="w-3 h-3" />}
                      Add Service
                    </button>
                    <button onClick={() => { setShowAddService(false); setSvcTitle(''); setSvcDateTime(''); setSvcRecurring(''); }}
                      className="text-xs px-3 py-1.5 text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <button onClick={() => setShowAddService(true)}
                  className="flex items-center gap-1.5 text-xs text-primary-600 hover:text-primary-800 transition-colors cursor-pointer">
                  <Plus className="w-3.5 h-3.5" />
                  Add Service
                </button>
              )}
            </div>
          )}

          <div className="space-y-8">
            {/* Visiting content block */}
            {visitingBlock && (
              <div className="flex items-start space-x-6">
                <div className="bg-primary-50 p-3 rounded-xl shrink-0 transition-transform duration-300 hover:scale-110 cursor-pointer">
                  <Calendar className="w-6 h-6 text-primary-700" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-0.5 mb-1">
                    <h3 className="font-semibold text-gray-900">{visitingBlock.title}</h3>
                    {isAdmin && <ContentBlockEdit block={visitingBlock} onSaved={() => onRefresh?.()} />}
                  </div>
                  <p className="text-gray-500 text-base leading-relaxed whitespace-pre-line">{visitingBlock.content}</p>
                </div>
              </div>
            )}

            {/* Location */}
            <div className="flex items-start space-x-6">
              <div className="bg-primary-50 p-3 rounded-xl shrink-0 transition-transform duration-300 hover:scale-110 cursor-pointer">
                <MapPin className="w-6 h-6 text-primary-700" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Location</h3>
                <p className="text-gray-500 text-base leading-relaxed">{church.address}</p>
              </div>
            </div>
          </div>

          {/* View details link */}
          {getChurchSlug(church.name) && (
            <div className="mt-8 pt-6 border-t border-gray-100">
              <Link
                to={`/churches/${getChurchSlug(church.name)}`}
                className="inline-flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg px-6 py-3 transition-all duration-200 hover:gap-3"
              >
                View Church Details
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Edit Details modal (portal to escape transform stacking context) */}
      {editDetails && (
        <ChurchEditModal
          church={church}
          onClose={() => setEditDetails(false)}
          onSaved={() => { setEditDetails(false); onRefresh?.(); }}
        />
      )}
    </div>
  );
}
