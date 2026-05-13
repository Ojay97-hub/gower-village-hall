import { useState, useRef } from 'react';
import {
  Clock, Calendar, MapPin, Megaphone, ListOrdered, ArrowRight,
  Edit2, Plus, Trash2, X, Loader2, ImagePlus, Check,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import type { Church, Service, ContentBlock } from '../../types/church';
import {
  addService, deleteService, updateService,
  addAnnouncement, deleteAnnouncement, updateAnnouncement,
  updateContentBlock, updateChurch, uploadChurchImage,
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

function dateInputToStartOfDayISO(value: string): string {
  const [y, m, d] = value.split('-').map(Number);
  return new Date(y, m - 1, d, 0, 0, 0, 0).toISOString();
}

function isoToDateInput(iso: string): string {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '';
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function formatAnnDates(a: { start_date?: string | null; expiry_date?: string | null }): string | null {
  const fmt = (iso: string) =>
    new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  if (a.start_date && a.expiry_date) return `${fmt(a.start_date)} – ${fmt(a.expiry_date)}`;
  if (a.start_date) return `From ${fmt(a.start_date)}`;
  if (a.expiry_date) return fmt(a.expiry_date);
  return null;
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
  const activeAnnouncements = church.announcements.filter(a => !a.expiry_date || new Date(a.expiry_date) > new Date());
  const visitingBlock = church.content_blocks.find((b: ContentBlock) => b.type === 'visiting');

  // Admin: inline church details edit
  const [editingDetails, setEditingDetails] = useState(false);
  const [detailsName, setDetailsName] = useState(church.name);
  const [detailsDesc, setDetailsDesc] = useState(church.description);

  // Admin: inline visiting block edit
  const [editingVisiting, setEditingVisiting] = useState(false);
  const [visitingTitle, setVisitingTitle] = useState(visitingBlock?.title ?? '');
  const [visitingContent, setVisitingContent] = useState(visitingBlock?.content ?? '');

  // Admin: image upload
  const imageInputRef = useRef<HTMLInputElement>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);

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
  const [annStart, setAnnStart] = useState('');
  const [annExpiry, setAnnExpiry] = useState('');

  // Admin: edit existing announcement
  const [editAnnId, setEditAnnId] = useState<string | null>(null);
  const [editAnnMsg, setEditAnnMsg] = useState('');
  const [editAnnStart, setEditAnnStart] = useState('');
  const [editAnnExpiry, setEditAnnExpiry] = useState('');

  // Shared saving / error
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  async function handleSaveDetails() {
    if (!detailsName.trim() || !detailsDesc.trim()) { setError('Name and description are required.'); return; }
    setSaving(true);
    setError('');
    try {
      await updateChurch(church.id, { name: detailsName.trim(), description: detailsDesc.trim() });
      setEditingDetails(false);
      onRefresh?.();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to save.');
    } finally {
      setSaving(false);
    }
  }

  function cancelDetails() {
    setEditingDetails(false);
    setDetailsName(church.name);
    setDetailsDesc(church.description);
    setError('');
  }

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result as string);
    reader.readAsDataURL(file);
  }

  async function handleSaveImage() {
    if (!imageFile) return;
    setUploadingImage(true);
    setError('');
    try {
      const url = await uploadChurchImage(imageFile);
      await updateChurch(church.id, {
        image_url: url,
        previous_image_url: church.image_url,
      });
      setImageFile(null);
      setImagePreview(null);
      onRefresh?.();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to upload image.');
    } finally {
      setUploadingImage(false);
    }
  }

  async function handleRevertImage() {
    if (!church.previous_image_url) return;
    setUploadingImage(true);
    setError('');
    try {
      await updateChurch(church.id, {
        image_url: church.previous_image_url,
        previous_image_url: church.image_url,
      });
      onRefresh?.();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to revert image.');
    } finally {
      setUploadingImage(false);
    }
  }

  function cancelImageUpload() {
    setImageFile(null);
    setImagePreview(null);
    if (imageInputRef.current) imageInputRef.current.value = '';
  }

  async function handleSaveVisiting() {
    if (!visitingBlock) return;
    if (!visitingTitle.trim() || !visitingContent.trim()) { setError('Title and content are required.'); return; }
    setSaving(true);
    setError('');
    try {
      await updateContentBlock(visitingBlock.id, { title: visitingTitle.trim(), content: visitingContent.trim() });
      setEditingVisiting(false);
      onRefresh?.();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to save.');
    } finally {
      setSaving(false);
    }
  }

  function cancelVisiting() {
    setEditingVisiting(false);
    setVisitingTitle(visitingBlock?.title ?? '');
    setVisitingContent(visitingBlock?.content ?? '');
    setError('');
  }

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
    if (!annMsg.trim() || !annExpiry) { setError('Message and end date are required.'); return; }
    setSaving(true);
    setError('');
    try {
      await addAnnouncement({
        church_id: church.id,
        message: annMsg.trim(),
        start_date: annStart ? dateInputToStartOfDayISO(annStart) : null,
        expiry_date: dateInputToEndOfDayISO(annExpiry),
      });
      setAnnMsg(''); setAnnStart(''); setAnnExpiry('');
      setShowAddAnn(false);
      onRefresh?.();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to add announcement.');
    } finally {
      setSaving(false);
    }
  }

  function startEditAnn(a: { id: string; message: string; start_date?: string | null; expiry_date: string }) {
    setEditAnnId(a.id);
    setEditAnnMsg(a.message);
    setEditAnnStart(a.start_date ? isoToDateInput(a.start_date) : '');
    setEditAnnExpiry(isoToDateInput(a.expiry_date));
    setConfirmDelAnn(null);
    setError('');
  }

  async function handleSaveAnnouncement() {
    if (!editAnnId || !editAnnMsg.trim() || !editAnnExpiry) { setError('Message and end date are required.'); return; }
    setSaving(true);
    setError('');
    try {
      await updateAnnouncement(editAnnId, {
        message: editAnnMsg.trim(),
        start_date: editAnnStart ? dateInputToStartOfDayISO(editAnnStart) : null,
        expiry_date: dateInputToEndOfDayISO(editAnnExpiry),
      });
      setEditAnnId(null);
      onRefresh?.();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to save announcement.');
    } finally {
      setSaving(false);
    }
  }

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
        <div className={`${imageRight ? 'order-1 lg:order-2' : ''} relative overflow-hidden h-80 sm:h-96 lg:h-auto lg:min-h-[500px]`}>
          <ImageWithFallback
            src={imagePreview ?? church.image_url}
            alt={church.name}
            className="w-full h-full object-cover transition-transform duration-700"
          />
          {isAdmin && (
            <>
              <input
                ref={imageInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageChange}
              />
              {imagePreview ? (
                <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2 px-4">
                  <button
                    onClick={handleSaveImage}
                    disabled={uploadingImage}
                    className="flex items-center gap-1.5 text-xs px-3 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 shadow-lg transition-colors cursor-pointer"
                  >
                    {uploadingImage ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}
                    Save Photo
                  </button>
                  <button
                    onClick={cancelImageUpload}
                    className="text-xs px-3 py-2 text-gray-700 bg-white rounded-lg hover:bg-gray-50 shadow-lg border border-gray-200 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <div className="absolute bottom-4 right-4 flex flex-col items-end gap-2">
                  {church.previous_image_url && (
                    <button
                      onClick={handleRevertImage}
                      disabled={uploadingImage}
                      className="flex items-center gap-1.5 text-xs px-3 py-2 bg-white/90 backdrop-blur-sm text-gray-600 rounded-lg hover:bg-white shadow-lg border border-gray-200 transition-colors cursor-pointer disabled:opacity-50"
                      title="Revert to previous photo"
                    >
                      {uploadingImage ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : (
                        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                          <path d="M3 3v5h5" />
                        </svg>
                      )}
                      Revert Photo
                    </button>
                  )}
                  <button
                    onClick={() => imageInputRef.current?.click()}
                    className="flex items-center gap-1.5 text-xs px-3 py-2 bg-white/90 backdrop-blur-sm text-gray-700 rounded-lg hover:bg-white shadow-lg border border-gray-200 transition-colors cursor-pointer"
                  >
                    <ImagePlus className="w-3.5 h-3.5" />
                    Change Photo
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        {/* Content */}
        <div className={`${imageRight ? 'order-2 lg:order-1' : ''} p-10 lg:p-16 flex flex-col justify-center`}>

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
                const now = new Date();
                const expired = !!a.expiry_date && new Date(a.expiry_date) <= now;
                const isEditingAnn = editAnnId === a.id;

                if (isEditingAnn) {
                  return (
                    <div key={a.id} className="p-3 bg-amber-50 border border-amber-200 rounded-xl space-y-2">
                      <textarea
                        value={editAnnMsg}
                        onChange={e => setEditAnnMsg(e.target.value)}
                        rows={2}
                        placeholder="Announcement message"
                        className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary-400 resize-none"
                      />
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-xs text-gray-500 mb-1">Start date (optional)</label>
                          <input type="date" value={editAnnStart}
                            onChange={e => setEditAnnStart(e.target.value)}
                            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary-400" />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-500 mb-1">End date</label>
                          <input type="date" value={editAnnExpiry}
                            onChange={e => setEditAnnExpiry(e.target.value)}
                            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary-400" />
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={handleSaveAnnouncement} disabled={saving}
                          className="flex items-center gap-1.5 text-xs px-3 py-1.5 bg-amber-600 text-white rounded-lg hover:bg-amber-700 disabled:opacity-50 transition-colors cursor-pointer">
                          {saving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}
                          Save
                        </button>
                        <button onClick={() => setEditAnnId(null)} disabled={saving}
                          className="text-xs px-3 py-1.5 text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
                          Cancel
                        </button>
                      </div>
                    </div>
                  );
                }

                return (
                  <div
                    key={a.id}
                    className={`flex items-start gap-3 p-3 rounded-xl border ${
                      expired ? 'bg-gray-50 border-gray-200' : 'bg-amber-50 border-amber-200'
                    }`}
                  >
                    <Megaphone className={`w-4 h-4 mt-0.5 shrink-0 ${expired ? 'text-gray-400' : 'text-amber-600'}`} />
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm leading-snug ${expired ? 'text-gray-400' : 'text-amber-800'}`}>
                        {a.message}
                      </p>
                      {(expired || formatAnnDates(a)) && (
                        <p className={`text-xs mt-0.5 ${expired ? 'text-gray-400 italic' : 'text-amber-600'}`}>
                          {expired ? 'Expired' : ''}{expired && formatAnnDates(a) ? ' ' : ''}{formatAnnDates(a)}
                        </p>
                      )}
                    </div>
                    {isAdmin && (
                      confirmDelAnn === a.id ? (
                        <div className="flex items-center gap-1 shrink-0">
                          <span className="text-xs text-red-600 font-medium">Delete?</span>
                          <button onClick={() => handleDeleteAnnouncement(a.id)} disabled={saving}
                            className="p-1 text-red-600 hover:bg-red-100 rounded disabled:opacity-50 cursor-pointer">
                            {saving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Trash2 className="w-3 h-3" />}
                          </button>
                          <button onClick={() => setConfirmDelAnn(null)} className="p-1 text-gray-400 hover:bg-gray-100 rounded cursor-pointer">
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1 shrink-0">
                          <button onClick={() => startEditAnn(a)}
                            className={`p-1 rounded transition-colors cursor-pointer ${expired ? 'text-gray-300 hover:text-gray-500' : 'text-amber-300 hover:text-amber-600'}`}
                            title="Edit announcement">
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button onClick={() => setConfirmDelAnn(a.id)}
                            className={`p-1 rounded transition-colors cursor-pointer ${expired ? 'text-gray-300 hover:text-red-400' : 'text-amber-300 hover:text-red-500'}`}
                            title="Delete announcement">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
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
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Start date (optional)</label>
                        <input type="date" value={annStart}
                          onChange={e => setAnnStart(e.target.value)}
                          className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary-400" />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">End date</label>
                        <input type="date" value={annExpiry}
                          onChange={e => setAnnExpiry(e.target.value)}
                          className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary-400" />
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={handleAddAnnouncement} disabled={saving}
                        className="flex items-center gap-1.5 text-xs px-3 py-1.5 bg-amber-600 text-white rounded-lg hover:bg-amber-700 disabled:opacity-50 transition-colors cursor-pointer">
                        {saving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Plus className="w-3 h-3" />}
                        Add
                      </button>
                      <button onClick={() => { setShowAddAnn(false); setAnnMsg(''); setAnnStart(''); setAnnExpiry(''); }}
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

          {/* Church name + description — inline editable */}
          {editingDetails ? (
            <div className="mb-8 space-y-3">
              <input
                type="text"
                value={detailsName}
                onChange={e => setDetailsName(e.target.value)}
                className="w-full text-3xl font-serif font-bold text-gray-900 border-b-2 border-primary-300 focus:border-primary-500 outline-none bg-transparent pb-1"
              />
              <textarea
                rows={4}
                value={detailsDesc}
                onChange={e => setDetailsDesc(e.target.value)}
                className="w-full text-base text-gray-600 leading-relaxed border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-300 resize-none"
              />
              <div className="flex gap-2">
                <button
                  onClick={handleSaveDetails}
                  disabled={saving}
                  className="flex items-center gap-1.5 text-xs px-3 py-1.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 transition-colors cursor-pointer"
                >
                  {saving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}
                  Save
                </button>
                <button
                  onClick={cancelDetails}
                  disabled={saving}
                  className="text-xs px-3 py-1.5 text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="mb-8">
              <div className="flex items-start gap-2 mb-6">
                <h2 className="text-3xl font-serif font-bold text-gray-900 drop-shadow-sm">{church.name}</h2>
                {isAdmin && (
                  <button
                    onClick={() => setEditingDetails(true)}
                    className="mt-1.5 text-gray-300 hover:text-primary-600 p-1 rounded hover:bg-primary-50 transition-colors shrink-0 cursor-pointer"
                    title="Edit name & description"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                )}
              </div>
              <p className="text-lg text-gray-600 leading-relaxed font-light">{church.description}</p>
            </div>
          )}

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
            {/* Visiting content block — inline editable */}
            {visitingBlock && (
              <div className="flex items-start space-x-6">
                <div className="bg-primary-50 p-3 rounded-xl shrink-0 transition-transform duration-300 hover:scale-110 cursor-pointer">
                  <Calendar className="w-6 h-6 text-primary-700" />
                </div>
                <div className="flex-1">
                  {editingVisiting ? (
                    <div className="space-y-2">
                      <input
                        type="text"
                        value={visitingTitle}
                        onChange={e => setVisitingTitle(e.target.value)}
                        className="w-full text-sm font-semibold text-gray-900 border-b border-primary-300 focus:border-primary-500 outline-none bg-transparent pb-0.5"
                      />
                      <textarea
                        rows={4}
                        value={visitingContent}
                        onChange={e => setVisitingContent(e.target.value)}
                        className="w-full text-sm text-gray-500 border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-1 focus:ring-primary-300 resize-none leading-relaxed"
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={handleSaveVisiting}
                          disabled={saving}
                          className="flex items-center gap-1.5 text-xs px-3 py-1.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 transition-colors cursor-pointer"
                        >
                          {saving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}
                          Save
                        </button>
                        <button
                          onClick={cancelVisiting}
                          disabled={saving}
                          className="text-xs px-3 py-1.5 text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center gap-0.5 mb-1">
                        <h3 className="font-semibold text-gray-900">{visitingBlock.title}</h3>
                        {isAdmin && (
                          <button
                            onClick={() => setEditingVisiting(true)}
                            className="ml-1.5 text-gray-400 hover:text-primary-600 p-1 rounded hover:bg-primary-50 transition-colors cursor-pointer"
                            title="Edit visiting info"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                      <p className="text-gray-500 text-base leading-relaxed whitespace-pre-line">{visitingBlock.content}</p>
                    </>
                  )}
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
    </div>
  );
}
