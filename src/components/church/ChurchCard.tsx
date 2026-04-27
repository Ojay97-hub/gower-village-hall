import { useState } from 'react';
import {
  Clock, Calendar, MapPin, Loader2, Plus, Trash2,
  Settings, Megaphone, ChevronDown, ChevronUp,
} from 'lucide-react';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import type { Church, Service, Announcement } from '../../types/church';
import {
  addService, deleteService,
  addAnnouncement, deleteAnnouncement,
} from '../../services/churchService';

interface ChurchCardProps {
  church: Church;
  imageRight?: boolean;
  visible?: boolean;
  animationDelay?: number;
  isAdmin?: boolean;
  onRefresh?: () => void;
}

function getNextService(services: Service[]): Service | null {
  const now = new Date();
  return services
    .filter(s => new Date(s.date_time) > now)
    .sort((a, b) => new Date(a.date_time).getTime() - new Date(b.date_time).getTime())[0] ?? null;
}

function formatServiceDisplay(service: Service): string {
  if (service.recurring_text) return service.recurring_text;
  const d = new Date(service.date_time);
  return (
    d.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'short' }) +
    ' at ' +
    d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false })
  );
}

function getActiveAnnouncements(announcements: Announcement[]): Announcement[] {
  const now = new Date();
  return announcements.filter(a => new Date(a.expiry_date) > now);
}

export function ChurchCard({
  church,
  imageRight = false,
  visible = true,
  animationDelay = 0,
  isAdmin = false,
  onRefresh,
}: ChurchCardProps) {
  const [adminOpen, setAdminOpen] = useState(false);
  const [newSvcTitle, setNewSvcTitle] = useState('');
  const [newSvcDateTime, setNewSvcDateTime] = useState('');
  const [newSvcRecurring, setNewSvcRecurring] = useState('');
  const [newAnnMsg, setNewAnnMsg] = useState('');
  const [newAnnExpiry, setNewAnnExpiry] = useState('');
  const [saving, setSaving] = useState(false);
  const [adminError, setAdminError] = useState('');

  const nextService = getNextService(church.services);
  const activeAnnouncements = getActiveAnnouncements(church.announcements);
  const visitingBlock = church.content_blocks.find(b => b.type === 'visiting');
  const imagePos = church.image_position ?? 'center';
  const sortedServices = [...church.services].sort(
    (a, b) => new Date(a.date_time).getTime() - new Date(b.date_time).getTime(),
  );

  async function handleAddService() {
    if (!newSvcTitle.trim() || !newSvcDateTime) {
      setAdminError('Service title and date/time are required.');
      return;
    }
    setSaving(true);
    setAdminError('');
    try {
      await addService({
        church_id: church.id,
        title: newSvcTitle.trim(),
        date_time: new Date(newSvcDateTime).toISOString(),
        recurring_text: newSvcRecurring.trim() || null,
        description: null,
      });
      setNewSvcTitle('');
      setNewSvcDateTime('');
      setNewSvcRecurring('');
      onRefresh?.();
    } catch (e: any) {
      setAdminError(e.message ?? 'Failed to add service.');
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteService(id: string) {
    setSaving(true);
    setAdminError('');
    try {
      await deleteService(id);
      onRefresh?.();
    } catch (e: any) {
      setAdminError(e.message ?? 'Failed to delete service.');
    } finally {
      setSaving(false);
    }
  }

  async function handleAddAnnouncement() {
    if (!newAnnMsg.trim() || !newAnnExpiry) {
      setAdminError('Message and expiry date are required.');
      return;
    }
    setSaving(true);
    setAdminError('');
    try {
      await addAnnouncement({
        church_id: church.id,
        message: newAnnMsg.trim(),
        expiry_date: new Date(newAnnExpiry).toISOString(),
      });
      setNewAnnMsg('');
      setNewAnnExpiry('');
      onRefresh?.();
    } catch (e: any) {
      setAdminError(e.message ?? 'Failed to add announcement.');
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteAnnouncement(id: string) {
    setSaving(true);
    setAdminError('');
    try {
      await deleteAnnouncement(id);
      onRefresh?.();
    } catch (e: any) {
      setAdminError(e.message ?? 'Failed to delete announcement.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div
      className={`bg-white rounded-3xl border border-gray-100 transition-all duration-500 overflow-hidden transform group ${
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
      }`}
      style={{ transitionDelay: `${animationDelay}ms` }}
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 h-full">

        {/* Image */}
        <div
          className={`${imageRight ? 'order-1 lg:order-2' : ''} overflow-hidden h-80 sm:h-96 lg:h-auto lg:min-h-[500px]`}
        >
          <ImageWithFallback
            src={church.image_url}
            alt={church.name}
            className={`w-full h-full object-cover object-${imagePos} transition-transform duration-700`}
          />
        </div>

        {/* Content */}
        <div className={`${imageRight ? 'order-2 lg:order-1' : ''} p-10 lg:p-16 flex flex-col justify-center`}>

          {/* Active announcement banners */}
          {activeAnnouncements.length > 0 && (
            <div className="mb-6 space-y-2">
              {activeAnnouncements.map(a => (
                <div
                  key={a.id}
                  className="flex items-start gap-3 p-3 bg-amber-50 border border-amber-200 rounded-xl"
                >
                  <Megaphone className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-amber-800 leading-snug">{a.message}</p>
                </div>
              ))}
            </div>
          )}

          <h2 className="text-3xl font-serif font-bold text-gray-900 mb-6 drop-shadow-sm">
            {church.name}
          </h2>
          <p className="text-lg text-gray-600 mb-10 leading-relaxed font-light">
            {church.description}
          </p>

          <div className="space-y-8">

            {/* Next service */}
            <div className="flex items-start space-x-6">
              <div className="bg-primary-50 p-3 rounded-xl flex-shrink-0 transition-transform duration-300 hover:scale-110 cursor-pointer">
                <Clock className="w-6 h-6 text-primary-700" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Service Times</h3>
                {nextService ? (
                  <p className="text-gray-500 text-base leading-relaxed">
                    <span className="text-primary-700 font-medium">{nextService.title}</span>
                    <br />
                    {formatServiceDisplay(nextService)}
                    {nextService.description && (
                      <><br /><span className="text-sm text-gray-400">{nextService.description}</span></>
                    )}
                  </p>
                ) : (
                  <p className="text-gray-400 text-sm italic">No upcoming services scheduled</p>
                )}
              </div>
            </div>

            {/* Visiting content block */}
            {visitingBlock && (
              <div className="flex items-start space-x-6">
                <div className="bg-primary-50 p-3 rounded-xl flex-shrink-0 transition-transform duration-300 hover:scale-110 cursor-pointer">
                  <Calendar className="w-6 h-6 text-primary-700" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">{visitingBlock.title}</h3>
                  <p className="text-gray-500 text-base leading-relaxed whitespace-pre-line">
                    {visitingBlock.content}
                  </p>
                </div>
              </div>
            )}

            {/* Location */}
            <div className="flex items-start space-x-6">
              <div className="bg-primary-50 p-3 rounded-xl flex-shrink-0 transition-transform duration-300 hover:scale-110 cursor-pointer">
                <MapPin className="w-6 h-6 text-primary-700" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Location</h3>
                <p className="text-gray-500 text-base leading-relaxed">{church.address}</p>
              </div>
            </div>
          </div>

          {/* ── Admin panel (visible to admins only) ── */}
          {isAdmin && (
            <div className="mt-8 pt-6 border-t border-dashed border-gray-200">
              <button
                onClick={() => setAdminOpen(o => !o)}
                className="flex items-center gap-2 text-sm text-gray-400 hover:text-gray-600 transition-colors"
              >
                <Settings className="w-4 h-4" />
                {adminOpen ? 'Hide Admin' : 'Manage Church'}
                {adminOpen ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              </button>

              {adminOpen && (
                <div className="mt-6 space-y-8">
                  {adminError && (
                    <p className="text-red-600 text-sm">{adminError}</p>
                  )}

                  {/* Services */}
                  <div>
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-3">
                      Services
                    </h4>
                    <ul className="space-y-2 mb-4">
                      {sortedServices.length === 0 && (
                        <li className="text-sm text-gray-400 italic">No services yet.</li>
                      )}
                      {sortedServices.map(s => (
                        <li
                          key={s.id}
                          className="flex items-center justify-between gap-2 text-sm text-gray-600 bg-gray-50 px-3 py-2 rounded-lg"
                        >
                          <span className="truncate">
                            <strong>{s.title}</strong>
                            {s.recurring_text
                              ? ` — ${s.recurring_text}`
                              : ` — ${new Date(s.date_time).toLocaleDateString('en-GB')}`}
                          </span>
                          <button
                            onClick={() => handleDeleteService(s.id)}
                            disabled={saving}
                            className="text-red-400 hover:text-red-600 flex-shrink-0 disabled:opacity-50"
                            title="Delete service"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </li>
                      ))}
                    </ul>
                    <div className="space-y-2">
                      <input
                        type="text"
                        placeholder="Title (e.g. Sunday Morning Service)"
                        value={newSvcTitle}
                        onChange={e => setNewSvcTitle(e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary-400"
                      />
                      <input
                        type="datetime-local"
                        value={newSvcDateTime}
                        onChange={e => setNewSvcDateTime(e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary-400"
                      />
                      <input
                        type="text"
                        placeholder='Recurring label — optional (e.g. "Every Sunday at 9:30 AM")'
                        value={newSvcRecurring}
                        onChange={e => setNewSvcRecurring(e.target.value)}
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
                  </div>

                  {/* Announcements */}
                  <div>
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-3">
                      Announcements
                    </h4>
                    <ul className="space-y-2 mb-4">
                      {church.announcements.length === 0 && (
                        <li className="text-sm text-gray-400 italic">No announcements.</li>
                      )}
                      {church.announcements.map(a => {
                        const expired = new Date(a.expiry_date) <= new Date();
                        return (
                          <li
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
                            <button
                              onClick={() => handleDeleteAnnouncement(a.id)}
                              disabled={saving}
                              className="text-red-400 hover:text-red-600 flex-shrink-0 mt-0.5 disabled:opacity-50"
                              title="Delete announcement"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                    <div className="space-y-2">
                      <textarea
                        placeholder="Announcement message"
                        value={newAnnMsg}
                        onChange={e => setNewAnnMsg(e.target.value)}
                        rows={2}
                        className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary-400 resize-none"
                      />
                      <input
                        type="date"
                        value={newAnnExpiry}
                        onChange={e => setNewAnnExpiry(e.target.value)}
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
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
