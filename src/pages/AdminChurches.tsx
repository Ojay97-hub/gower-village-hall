import { useState, useCallback, useEffect } from 'react';
import { Plus, Edit2, Trash2, X, Loader2, ChevronDown, ChevronUp } from 'lucide-react';
import {
  getChurchesWithRelations,
  addService, deleteService,
  addAnnouncement, deleteAnnouncement,
  updateChurch, updateContentBlock, addChurch,
} from '../services/churchService';
import type { Church, ContentBlock } from '../types/church';

// ── Edit / Add Church Details Modal ──────────────────────────────────────────

interface DetailsForm {
  name: string;
  description: string;
  address: string;
  image_url: string;
}

function ChurchDetailsModal({
  church,
  onClose,
  onSaved,
}: {
  church: Church | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [form, setForm] = useState<DetailsForm>({
    name: church?.name ?? '',
    description: church?.description ?? '',
    address: church?.address ?? '',
    image_url: church?.image_url ?? '',
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
      if (church) {
        await updateChurch(church.id, {
          name: form.name.trim(),
          description: form.description.trim(),
          address: form.address.trim(),
          image_url: form.image_url.trim(),
        });
      } else {
        await addChurch({
          name: form.name.trim(),
          description: form.description.trim(),
          address: form.address.trim(),
          image_url: form.image_url.trim(),
        });
      }
      onSaved();
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to save.');
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-bold font-serif text-gray-900">
            {church ? 'Edit Church Details' : 'Add Church'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <input
              type="text"
              required
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              required
              rows={3}
              value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none resize-none transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
            <input
              type="text"
              required
              value={form.address}
              onChange={e => setForm(f => ({ ...f, address: e.target.value }))}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
            <input
              type="text"
              value={form.image_url}
              onChange={e => setForm(f => ({ ...f, image_url: e.target.value }))}
              placeholder="https://..."
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
            />
          </div>
          {error && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-3">{error}</p>
          )}
          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-primary-600 rounded-xl hover:bg-primary-700 transition-colors disabled:opacity-70"
            >
              {saving
                ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</>
                : church ? 'Save Changes' : 'Add Church'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Content Block Inline Edit Row ─────────────────────────────────────────────

function ContentBlockRow({ block, onSaved }: { block: ContentBlock; onSaved: () => void }) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ title: block.title, content: block.content });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  function openEdit() {
    setForm({ title: block.title, content: block.content });
    setEditing(true);
  }

  async function handleSave() {
    if (!form.title.trim() || !form.content.trim()) {
      setError('Title and content are required.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      await updateContentBlock(block.id, { title: form.title.trim(), content: form.content.trim() });
      onSaved();
      setEditing(false);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to save.');
    } finally {
      setSaving(false);
    }
  }

  if (!editing) {
    return (
      <div className="flex items-center justify-between gap-2 text-sm bg-gray-50 px-3 py-2 rounded-lg">
        <div className="min-w-0 flex-1">
          <span className="font-medium text-gray-700">{block.title}</span>
          <span className="text-gray-300 mx-2">—</span>
          <span className="text-gray-500">
            {block.content.length > 80 ? `${block.content.slice(0, 80)}…` : block.content}
          </span>
        </div>
        <button
          onClick={openEdit}
          className="text-gray-400 hover:text-primary-600 shrink-0 p-1 rounded hover:bg-primary-50 transition-colors"
          title="Edit"
        >
          <Edit2 className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-2 p-3 bg-primary-50 rounded-lg border border-primary-100">
      <input
        type="text"
        value={form.title}
        onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
        placeholder="Block title"
        className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary-400"
      />
      <textarea
        rows={4}
        value={form.content}
        onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
        placeholder="Content..."
        className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary-400 resize-none"
      />
      {error && <p className="text-xs text-red-600">{error}</p>}
      <div className="flex gap-2">
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-1.5 text-sm px-3 py-1.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 transition-colors"
        >
          {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
          Save
        </button>
        <button
          onClick={() => setEditing(false)}
          className="text-sm px-3 py-1.5 text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

// ── Per-Church Accordion Panel ────────────────────────────────────────────────

function ChurchPanel({ church, onRefresh }: { church: Church; onRefresh: () => void }) {
  const [open, setOpen] = useState(true);
  const [editDetails, setEditDetails] = useState(false);

  const [svcTitle, setSvcTitle] = useState('');
  const [svcDateTime, setSvcDateTime] = useState('');
  const [svcRecurring, setSvcRecurring] = useState('');
  const [confirmDelSvc, setConfirmDelSvc] = useState<string | null>(null);

  const [annMsg, setAnnMsg] = useState('');
  const [annExpiry, setAnnExpiry] = useState('');
  const [confirmDelAnn, setConfirmDelAnn] = useState<string | null>(null);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const sortedServices = [...church.services].sort(
    (a, b) => new Date(a.date_time).getTime() - new Date(b.date_time).getTime(),
  );

  async function handleAddService() {
    if (!svcTitle.trim() || !svcDateTime) {
      setError('Service title and date/time are required.');
      return;
    }
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
      setSvcTitle('');
      setSvcDateTime('');
      setSvcRecurring('');
      onRefresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to add service.');
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteService(id: string) {
    setSaving(true);
    setError('');
    try {
      await deleteService(id);
      onRefresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to delete service.');
    } finally {
      setSaving(false);
      setConfirmDelSvc(null);
    }
  }

  async function handleAddAnnouncement() {
    if (!annMsg.trim() || !annExpiry) {
      setError('Message and expiry date are required.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      await addAnnouncement({
        church_id: church.id,
        message: annMsg.trim(),
        expiry_date: new Date(annExpiry).toISOString(),
      });
      setAnnMsg('');
      setAnnExpiry('');
      onRefresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to add announcement.');
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteAnnouncement(id: string) {
    setSaving(true);
    setError('');
    try {
      await deleteAnnouncement(id);
      onRefresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to delete announcement.');
    } finally {
      setSaving(false);
      setConfirmDelAnn(null);
    }
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">

      {/* Accordion header */}
      <div className="flex items-center justify-between px-6 py-4 bg-gray-50 border-b border-gray-100">
        <button
          onClick={() => setOpen(o => !o)}
          className="flex items-center gap-2 text-left flex-1 min-w-0"
        >
          {open
            ? <ChevronUp className="w-4 h-4 text-gray-400 shrink-0" />
            : <ChevronDown className="w-4 h-4 text-gray-400 shrink-0" />}
          <h2 className="text-lg font-bold font-serif text-gray-900 truncate">{church.name}</h2>
        </button>
        <button
          onClick={() => setEditDetails(true)}
          className="flex items-center gap-1.5 text-sm px-3 py-1.5 text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors ml-4 shrink-0"
        >
          <Edit2 className="w-3.5 h-3.5" />
          Edit Details
        </button>
      </div>

      {open && (
        <div className="p-6 space-y-8">
          {error && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-3">{error}</p>
          )}

          {/* Services */}
          <section>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-3">Services</h3>
            <div className="space-y-2 mb-4">
              {sortedServices.length === 0 && (
                <p className="text-sm text-gray-400 italic">No services yet.</p>
              )}
              {sortedServices.map(s => (
                <div
                  key={s.id}
                  className="flex items-center justify-between gap-2 text-sm text-gray-600 bg-gray-50 px-3 py-2 rounded-lg"
                >
                  <span className="truncate">
                    <strong>{s.title}</strong>
                    {s.recurring_text
                      ? ` — ${s.recurring_text}`
                      : ` — ${new Date(s.date_time).toLocaleDateString('en-GB')}`}
                  </span>
                  {confirmDelSvc === s.id ? (
                    <div className="flex items-center gap-1 shrink-0">
                      <span className="text-xs text-red-600 font-medium">Delete?</span>
                      <button
                        onClick={() => handleDeleteService(s.id)}
                        disabled={saving}
                        className="p-1 text-red-600 hover:bg-red-50 rounded disabled:opacity-50"
                      >
                        {saving
                          ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          : <Trash2 className="w-3.5 h-3.5" />}
                      </button>
                      <button
                        onClick={() => setConfirmDelSvc(null)}
                        className="p-1 text-gray-400 hover:bg-gray-100 rounded"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setConfirmDelSvc(s.id)}
                      disabled={saving}
                      className="text-gray-300 hover:text-red-500 shrink-0 disabled:opacity-50"
                      title="Delete service"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
            <div className="space-y-2">
              <input
                type="text"
                placeholder="Title (e.g. Sunday Morning Service)"
                value={svcTitle}
                onChange={e => setSvcTitle(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary-400"
              />
              <input
                type="datetime-local"
                value={svcDateTime}
                onChange={e => setSvcDateTime(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary-400"
              />
              <input
                type="text"
                placeholder='Recurring label — optional (e.g. "Every Sunday at 9:30 AM")'
                value={svcRecurring}
                onChange={e => setSvcRecurring(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary-400"
              />
              <button
                onClick={handleAddService}
                disabled={saving}
                className="flex items-center gap-2 text-sm px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 transition-colors"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                Add Service
              </button>
            </div>
          </section>

          {/* Announcements */}
          <section>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-3">Announcements</h3>
            <div className="space-y-2 mb-4">
              {church.announcements.length === 0 && (
                <p className="text-sm text-gray-400 italic">No announcements.</p>
              )}
              {church.announcements.map(a => {
                const expired = new Date(a.expiry_date) <= new Date();
                return (
                  <div
                    key={a.id}
                    className={`flex items-start justify-between gap-2 text-sm px-3 py-2 rounded-lg ${
                      expired ? 'bg-gray-50 text-gray-400' : 'bg-amber-50 text-amber-800'
                    }`}
                  >
                    <span className="min-w-0">
                      {a.message}
                      <span className={`ml-2 text-xs ${expired ? 'text-gray-400' : 'text-amber-500'}`}>
                        (expires {new Date(a.expiry_date).toLocaleDateString('en-GB')})
                      </span>
                      {expired && <span className="ml-1 text-xs italic">expired</span>}
                    </span>
                    {confirmDelAnn === a.id ? (
                      <div className="flex items-center gap-1 shrink-0">
                        <span className="text-xs text-red-600 font-medium">Delete?</span>
                        <button
                          onClick={() => handleDeleteAnnouncement(a.id)}
                          disabled={saving}
                          className="p-1 text-red-600 hover:bg-red-50 rounded disabled:opacity-50"
                        >
                          {saving
                            ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            : <Trash2 className="w-3.5 h-3.5" />}
                        </button>
                        <button
                          onClick={() => setConfirmDelAnn(null)}
                          className="p-1 text-gray-400 hover:bg-gray-100 rounded"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setConfirmDelAnn(a.id)}
                        disabled={saving}
                        className="text-gray-300 hover:text-red-500 shrink-0 mt-0.5 disabled:opacity-50"
                        title="Delete announcement"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
            <div className="space-y-2">
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
              <button
                onClick={handleAddAnnouncement}
                disabled={saving}
                className="flex items-center gap-2 text-sm px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 disabled:opacity-50 transition-colors"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                Add Announcement
              </button>
            </div>
          </section>

          {/* Content Blocks */}
          {church.content_blocks.length > 0 && (
            <section>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-3">Content Blocks</h3>
              <div className="space-y-2">
                {church.content_blocks.map(block => (
                  <ContentBlockRow key={block.id} block={block} onSaved={onRefresh} />
                ))}
              </div>
            </section>
          )}
        </div>
      )}

      {editDetails && (
        <ChurchDetailsModal
          church={church}
          onClose={() => setEditDetails(false)}
          onSaved={onRefresh}
        />
      )}
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export function AdminChurches() {
  const [churches, setChurches] = useState<Church[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState('');
  const [addingChurch, setAddingChurch] = useState(false);

  const fetchChurches = useCallback(async () => {
    setFetchError('');
    try {
      const data = await getChurchesWithRelations();
      setChurches(data);
    } catch {
      setFetchError('Failed to load churches. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchChurches();
  }, [fetchChurches]);

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[60vh]">
        <div className="w-12 h-12 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (fetchError) {
    return (
      <div className="p-8 max-w-4xl mx-auto mt-10 bg-red-50 text-red-600 rounded-2xl border border-red-200">
        <h2 className="text-xl font-bold mb-2">Error Loading Churches</h2>
        <p>{fetchError}</p>
        <button onClick={fetchChurches} className="mt-4 text-sm underline">Try again</button>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-8 max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold font-serif text-gray-900">Manage Churches</h1>
          <p className="text-sm text-gray-500 mt-1">
            {churches.length} church{churches.length !== 1 ? 'es' : ''} · changes appear immediately
          </p>
        </div>
        <button
          onClick={() => setAddingChurch(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-primary-600 text-white text-sm font-medium rounded-xl hover:bg-primary-700 transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Add Church
        </button>
      </div>

      <div className="space-y-6">
        {churches.map(church => (
          <ChurchPanel key={church.id} church={church} onRefresh={fetchChurches} />
        ))}
      </div>

      {addingChurch && (
        <ChurchDetailsModal
          church={null}
          onClose={() => setAddingChurch(false)}
          onSaved={fetchChurches}
        />
      )}
    </div>
  );
}
