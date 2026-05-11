import { useState, FormEvent, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { useParams, Navigate } from "react-router-dom";
import {
  Users, X, CheckCircle, Loader2, Mail,
  MapPin, Calendar, Plus, Trash2, Edit2,
} from "lucide-react";
import {
  getChurchesWithRelations,
  addService, updateService, deleteService,
  addAnnouncement, deleteAnnouncement,
  addChurchEvent, updateChurchEvent, deleteChurchEvent,
} from "../services/churchService";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import { useAuth } from "../context/AuthContext";
import type { Church, ChurchEvent, Service } from "../types/church";

const SLUG_TO_PATTERN: Record<string, RegExp> = {
  "st-johns": /st[\s.'`-]?john/i,
  "st-nicholas": /st[\s.'`-]?nicholas/i,
};

const SLUG_TO_MAP: Record<string, string> = {
  "st-johns":
    "https://www.google.com/maps?q=St+John+the+Baptist+Penmaen+Swansea+SA3+2HQ&output=embed&z=16",
  "st-nicholas":
    "https://www.google.com/maps?q=St+Nicholas+Church+Nicholaston+Swansea+SA3+2HL&output=embed&z=16",
};

function toDateTimeLocal(value: string) {
  const date = new Date(value);
  const offsetDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return offsetDate.toISOString().slice(0, 16);
}

export function ChurchPage() {
  const { slug } = useParams<{ slug: string }>();
  const { hasRole } = useAuth();
  const isChurchAdmin = hasRole("churches");

  const [church, setChurch] = useState<Church | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  // Join Friends modal
  const [showModal, setShowModal] = useState(false);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formError, setFormError] = useState("");

  // Admin: service form
  const [showAddService, setShowAddService] = useState(false);
  const [svcTitle, setSvcTitle] = useState("");
  const [svcDateTime, setSvcDateTime] = useState("");
  const [svcRecurring, setSvcRecurring] = useState("");
  const [svcDescription, setSvcDescription] = useState("");
  const [editingServiceId, setEditingServiceId] = useState<string | null>(null);
  const [confirmDelSvc, setConfirmDelSvc] = useState<string | null>(null);

  // Admin: notice/event form
  const [showAddNotice, setShowAddNotice] = useState(false);
  const [noticeMsg, setNoticeMsg] = useState("");
  const [noticeExpiry, setNoticeExpiry] = useState("");
  const [confirmDelAnn, setConfirmDelAnn] = useState<string | null>(null);

  // Admin: event form
  const [showAddEvent, setShowAddEvent] = useState(false);
  const [eventTitle, setEventTitle] = useState("");
  const [eventDateTime, setEventDateTime] = useState("");
  const [eventDescription, setEventDescription] = useState("");
  const [eventLocation, setEventLocation] = useState("");
  const [editingEventId, setEditingEventId] = useState<string | null>(null);
  const [confirmDelEvent, setConfirmDelEvent] = useState<string | null>(null);

  // Admin: shared saving / error state
  const [adminSaving, setAdminSaving] = useState(false);
  const [adminError, setAdminError] = useState("");

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  const fetchChurch = useCallback(async () => {
    if (!slug || !SLUG_TO_PATTERN[slug]) {
      setNotFound(true);
      setLoading(false);
      return;
    }
    try {
      const all = await getChurchesWithRelations();
      const pattern = SLUG_TO_PATTERN[slug];
      const match = all.find((c) => pattern.test(c.name));
      if (match) {
        setChurch(match);
      } else {
        setNotFound(true);
      }
    } catch {
      setNotFound(true);
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    fetchChurch();
  }, [fetchChurch]);

  // ── Admin handlers ──────────────────────────────────────────────────────────

  const resetServiceForm = () => {
    setSvcTitle("");
    setSvcDateTime("");
    setSvcRecurring("");
    setSvcDescription("");
    setEditingServiceId(null);
  };

  const startEditService = (service: Service) => {
    setSvcTitle(service.title);
    setSvcDateTime(toDateTimeLocal(service.date_time));
    setSvcRecurring(service.recurring_text ?? "");
    setSvcDescription(service.description ?? "");
    setEditingServiceId(service.id);
    setShowAddService(true);
    setAdminError("");
  };

  const handleSaveService = async () => {
    if (!church || !svcTitle.trim() || !svcDateTime) {
      setAdminError("Service title and date/time are required.");
      return;
    }
    setAdminSaving(true);
    setAdminError("");
    try {
      const payload = {
        church_id: church.id,
        title: svcTitle.trim(),
        date_time: new Date(svcDateTime).toISOString(),
        recurring_text: svcRecurring.trim() || null,
        description: svcDescription.trim() || null,
      };
      if (editingServiceId) {
        await updateService(editingServiceId, payload);
      } else {
        await addService(payload);
      }
      resetServiceForm();
      setShowAddService(false);
      await fetchChurch();
    } catch (err: unknown) {
      setAdminError(err instanceof Error ? err.message : "Failed to save service.");
    } finally {
      setAdminSaving(false);
    }
  };

  const handleDeleteService = async (id: string) => {
    setAdminSaving(true);
    setAdminError("");
    try {
      await deleteService(id);
      setConfirmDelSvc(null);
      await fetchChurch();
    } catch (err: unknown) {
      setAdminError(err instanceof Error ? err.message : "Failed to delete service.");
    } finally {
      setAdminSaving(false);
    }
  };

  const resetEventForm = () => {
    setEventTitle("");
    setEventDateTime("");
    setEventDescription("");
    setEventLocation("");
    setEditingEventId(null);
  };

  const startEditEvent = (event: ChurchEvent) => {
    setEventTitle(event.title);
    setEventDateTime(toDateTimeLocal(event.event_date));
    setEventDescription(event.description ?? "");
    setEventLocation(event.location ?? "");
    setEditingEventId(event.id);
    setShowAddEvent(true);
    setAdminError("");
  };

  const handleSaveEvent = async () => {
    if (!church || !eventTitle.trim() || !eventDateTime) {
      setAdminError("Event title and date/time are required.");
      return;
    }
    setAdminSaving(true);
    setAdminError("");
    try {
      const payload = {
        church_id: church.id,
        title: eventTitle.trim(),
        event_date: new Date(eventDateTime).toISOString(),
        description: eventDescription.trim() || null,
        location: eventLocation.trim() || null,
      };
      if (editingEventId) {
        await updateChurchEvent(editingEventId, payload);
      } else {
        await addChurchEvent(payload);
      }
      resetEventForm();
      setShowAddEvent(false);
      await fetchChurch();
    } catch (err: unknown) {
      setAdminError(err instanceof Error ? err.message : "Failed to save event.");
    } finally {
      setAdminSaving(false);
    }
  };

  const handleDeleteEvent = async (id: string) => {
    setAdminSaving(true);
    setAdminError("");
    try {
      await deleteChurchEvent(id);
      setConfirmDelEvent(null);
      await fetchChurch();
    } catch (err: unknown) {
      setAdminError(err instanceof Error ? err.message : "Failed to delete event.");
    } finally {
      setAdminSaving(false);
    }
  };

  const handleAddNotice = async () => {
    if (!church || !noticeMsg.trim() || !noticeExpiry) {
      setAdminError("Message and expiry date are required.");
      return;
    }
    setAdminSaving(true);
    setAdminError("");
    try {
      await addAnnouncement({
        church_id: church.id,
        message: noticeMsg.trim(),
        expiry_date: new Date(noticeExpiry).toISOString(),
      });
      setNoticeMsg(""); setNoticeExpiry("");
      setShowAddNotice(false);
      await fetchChurch();
    } catch (err: unknown) {
      setAdminError(err instanceof Error ? err.message : "Failed to add notice.");
    } finally {
      setAdminSaving(false);
    }
  };

  const handleDeleteAnn = async (id: string) => {
    setAdminSaving(true);
    setAdminError("");
    try {
      await deleteAnnouncement(id);
      setConfirmDelAnn(null);
      await fetchChurch();
    } catch (err: unknown) {
      setAdminError(err instanceof Error ? err.message : "Failed to delete notice.");
    } finally {
      setAdminSaving(false);
    }
  };

  // ── Join Friends submit ─────────────────────────────────────────────────────

  const handleJoinSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setFormError("");

    if (!email.trim()) {
      setFormError("Please enter your email address.");
      setSubmitting(false);
      return;
    }

    try {
      const response = await fetch("/api/send-newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ name: name.trim() || "", email: email.trim(), group: "churches" }),
      });
      const data = await response.json();
      if (response.ok && data.success) {
        setSubmitted(true);
        setEmail("");
        setName("");
      } else {
        setFormError(data.error || "Something went wrong. Please try again.");
      }
    } catch {
      setFormError("Network error. Please check your connection and try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setTimeout(() => {
      setSubmitted(false);
      setFormError("");
    }, 300);
  };

  if (!loading && (notFound || !slug || !SLUG_TO_PATTERN[slug])) {
    return <Navigate to="/churches/st-johns" replace />;
  }

  const aboutBlock = church?.content_blocks.find((b) => b.type === "about");
  const visitingBlock = church?.content_blocks.find((b) => b.type === "visiting");
  const activeAnnouncements = church?.announcements.filter(
    (a) => new Date(a.expiry_date) > new Date()
  ) ?? [];
  const upcomingEvents = [...(church?.events ?? [])]
    .filter((event) => new Date(event.event_date) >= new Date())
    .sort((a, b) => new Date(a.event_date).getTime() - new Date(b.event_date).getTime());
  const imagePos = church?.image_position ?? "center";

  return (
    <div className="min-h-screen bg-white font-sans">

      {/* ── HERO ── */}
      <section className="hidden">
        <div
          className={`relative z-10 flex min-h-[40vh] items-center px-4 sm:px-6 lg:px-12 py-20 lg:py-32 transition-all duration-1000 transform ${
            isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          <div className="max-w-7xl mx-auto w-full text-center md:text-left flex flex-col items-center md:items-start pl-4">
            {loading ? (
              <div className="flex items-center gap-3 text-white/60">
                <Loader2 className="w-6 h-6 animate-spin" />
                <span className="text-lg font-light">Loading…</span>
              </div>
            ) : (
              <>
                <h1 className="text-5xl md:text-6xl font-serif text-white mb-6 drop-shadow-md">
                  {church?.name}
                </h1>
                <p className="text-xl md:text-2xl text-blue-50/90 max-w-2xl font-light leading-relaxed mb-10">
                  {church?.description}
                </p>
              </>
            )}
          </div>
        </div>
      </section>

      {church && (
        <>

          {/* ── FEATURE SECTION ── reference: "Prayer of the Day" 2-col ── */}
          <section className="bg-white py-16 lg:py-24">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">

                {/* Text side */}
                <div>
                  <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black uppercase leading-none tracking-tight text-gray-900 mb-8">
                    {church.name.replace(/^(St\.?\s)/i, "St.\n").split("\n").map((part, i) => (
                      <span key={i} className="block">{part}</span>
                    ))}
                  </h2>
                  {(aboutBlock || church.description) && (
                    <div className="border-l-4 border-gray-900 pl-5 mb-6">
                      <p className="text-base text-gray-700 leading-relaxed">
                        {aboutBlock?.content || church.description}
                      </p>
                    </div>
                  )}
                  <p className="text-right text-sm text-gray-500 italic">
                    {church.address}
                  </p>
                </div>

                {/* Image side */}
                <div className="h-80 sm:h-96 lg:h-[480px] rounded-2xl overflow-hidden shadow-lg">
                  <ImageWithFallback
                    src={church.image_url}
                    alt={church.name}
                    className={`w-full h-full object-cover object-${imagePos}`}
                  />
                </div>
              </div>
            </div>
          </section>

          {/* ── NOTICE BOARD ── */}
          <section className="py-16 lg:py-20"
            style={{ background: "linear-gradient(135deg, #f5f0e8 0%, #ede8dc 100%)" }}
          >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

              {/* Header */}
              <div className="flex items-center justify-between gap-3 mb-10">
                <div className="flex items-center gap-3">
                  <div className="relative w-8 h-8 shrink-0">
                    <div className="w-5 h-5 rounded-full bg-red-500 shadow-md absolute top-0 left-1/2 -translate-x-1/2 border-2 border-red-700" />
                    <div className="w-0.5 h-4 bg-red-400 absolute top-3 left-1/2 -translate-x-1/2" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">Notice Board</h2>
                </div>
                {isChurchAdmin && (
                  <button
                    onClick={() => { setShowAddNotice(v => !v); setAdminError(""); }}
                    className="flex items-center gap-1.5 text-sm px-3 py-1.5 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors shadow-sm"
                  >
                    <Plus className="w-4 h-4" />
                    Add Notice
                  </button>
                )}
              </div>

              {/* Admin error */}
              {isChurchAdmin && adminError && (
                <p className="mb-6 text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-3">{adminError}</p>
              )}

              {/* Admin add form */}
              {isChurchAdmin && showAddNotice && (
                <div className="bg-white rounded-2xl border border-amber-200 p-6 mb-8 shadow-sm space-y-3">
                  <h3 className="text-sm font-semibold text-gray-700">Pin a new notice</h3>
                  <textarea
                    rows={3}
                    placeholder="Notice message…"
                    value={noticeMsg}
                    onChange={e => setNoticeMsg(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary-400 resize-none"
                  />
                  <div className="flex flex-col sm:flex-row gap-3">
                    <div className="flex-1">
                      <label className="block text-xs text-gray-500 mb-1">Remove after (expiry date)</label>
                      <input
                        type="date"
                        value={noticeExpiry}
                        onChange={e => setNoticeExpiry(e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary-400"
                      />
                    </div>
                    <div className="flex items-end gap-2">
                      <button
                        onClick={handleAddNotice}
                        disabled={adminSaving}
                        className="flex items-center gap-1.5 text-sm px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 transition-colors"
                      >
                        {adminSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                        Pin Notice
                      </button>
                      <button
                        onClick={() => setShowAddNotice(false)}
                        className="text-sm px-3 py-2 text-gray-500 bg-white border border-gray-200 rounded-lg hover:bg-gray-50"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {activeAnnouncements.length === 0 ? (
                <div className="bg-white/60 border border-amber-200 rounded-2xl py-16 text-center">
                  <div className="relative w-8 h-8 mx-auto mb-4">
                    <div className="w-5 h-5 rounded-full bg-gray-300 shadow-sm absolute top-0 left-1/2 -translate-x-1/2 border-2 border-gray-400" />
                    <div className="w-0.5 h-4 bg-gray-300 absolute top-3 left-1/2 -translate-x-1/2" />
                  </div>
                  <p className="text-gray-400 font-light">No notices currently pinned.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                  {activeAnnouncements.map((ann) => (
                    <div key={ann.id} className="relative pt-4">
                      <div className="absolute top-0 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center">
                        <div className="w-6 h-6 rounded-full bg-red-500 border-2 border-red-700 shadow-md" />
                        <div className="w-0.5 h-3 bg-red-400" />
                      </div>
                      <div className="bg-white rounded-xl shadow-lg p-6 pt-7 border border-amber-100 min-h-[140px] flex flex-col justify-between relative">
                        {/* Admin delete */}
                        {isChurchAdmin && (
                          <div className="absolute top-3 right-3">
                            {confirmDelAnn === ann.id ? (
                              <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-lg px-2 py-1 shadow-sm">
                                <span className="text-xs text-red-600 font-medium">Remove?</span>
                                <button
                                  onClick={() => handleDeleteAnn(ann.id)}
                                  disabled={adminSaving}
                                  className="p-0.5 text-red-600 hover:bg-red-50 rounded"
                                >
                                  {adminSaving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Trash2 className="w-3 h-3" />}
                                </button>
                                <button onClick={() => setConfirmDelAnn(null)} className="p-0.5 text-gray-400 hover:bg-gray-100 rounded">
                                  <X className="w-3 h-3" />
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => setConfirmDelAnn(ann.id)}
                                className="p-1 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                                title="Remove notice"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        )}
                        <p className="text-gray-800 leading-relaxed text-sm">{ann.message}</p>
                        <p className="text-xs text-gray-400 mt-4 pt-3 border-t border-gray-100">
                          Posted until{" "}
                          {new Date(ann.expiry_date).toLocaleDateString("en-GB", {
                            day: "numeric", month: "long", year: "numeric",
                          })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>

          {/* ── SERVICE TIMES + UPCOMING EVENTS (side by side) ── */}
          <section className="bg-stone-100 py-16 lg:py-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">

                {/* ── Left: Service Times (dark, reference style) ── */}
                <div className="lg:col-span-3">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-gray-900">Service Times</h2>
                    {isChurchAdmin && (
                      <button
                        onClick={() => {
                          if (showAddService) resetServiceForm();
                          setShowAddService(v => !v);
                          setAdminError("");
                        }}
                        className="flex items-center gap-1.5 text-sm px-3 py-1.5 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors shadow-sm"
                      >
                        <Plus className="w-4 h-4" />
                        Add Service
                      </button>
                    )}
                  </div>

                  {/* Admin add service form */}
                  {isChurchAdmin && showAddService && (
                    <div className="bg-white rounded-2xl border border-gray-200 p-5 mb-5 shadow-sm space-y-3">
                      <h3 className="text-sm font-semibold text-gray-700">
                        {editingServiceId ? "Edit service" : "Add a service"}
                      </h3>
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
                        placeholder='Recurring label — e.g. "Every Sunday at 9:30 AM"'
                        value={svcRecurring}
                        onChange={e => setSvcRecurring(e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary-400"
                      />
                      <input
                        type="text"
                        placeholder="Notes (optional)"
                        value={svcDescription}
                        onChange={e => setSvcDescription(e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary-400"
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={handleSaveService}
                          disabled={adminSaving}
                          className="flex items-center gap-1.5 text-sm px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 transition-colors"
                        >
                          {adminSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : editingServiceId ? <Edit2 className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                          {editingServiceId ? "Save Service" : "Add Service"}
                        </button>
                        <button
                          onClick={() => {
                            resetServiceForm();
                            setShowAddService(false);
                          }}
                          className="text-sm px-3 py-2 text-gray-500 bg-white border border-gray-200 rounded-lg hover:bg-gray-50"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}

                  {church.services.length === 0 ? (
                    <div className="bg-primary-800 rounded-2xl px-6 py-10 text-center text-white/40 text-sm">
                      No services listed yet.
                    </div>
                  ) : (
                    <div className="bg-primary-800 rounded-2xl overflow-hidden">
                      {church.services.map((service, idx) => (
                        <div
                          key={service.id}
                          className={`flex items-stretch group ${idx > 0 ? "border-t border-primary-700" : ""}`}
                        >
                          {/* Cross icon */}
                          <div className="shrink-0 w-14 flex items-center justify-center py-5">
                            <div className="relative w-5 h-5 flex items-center justify-center">
                              <div className="absolute w-1 h-5 bg-white/50 rounded-full" />
                              <div className="absolute w-5 h-1 bg-white/50 rounded-full" />
                            </div>
                          </div>
                          {/* Vertical amber accent line */}
                          <div className="w-0.5 bg-amber-400 shrink-0 self-stretch" />
                          {/* Content */}
                          <div className="flex-1 px-5 py-4 min-w-0">
                            <p className="font-bold text-white text-base leading-snug">
                              {service.title}
                            </p>
                            <p className="text-amber-400 text-sm font-medium mt-1 leading-snug">
                              {service.recurring_text ??
                                new Date(service.date_time).toLocaleDateString("en-GB", {
                                  weekday: "long", day: "numeric", month: "long",
                                })}
                            </p>
                            {service.description && (
                              <p className="text-white/50 text-xs mt-1.5 leading-snug">
                                {service.description}
                              </p>
                            )}
                          </div>
                          {/* Admin delete */}
                          {isChurchAdmin && (
                            <div className="flex items-center gap-2 pr-4 shrink-0">
                              {confirmDelSvc === service.id ? (
                                <div className="flex items-center gap-1 bg-white/10 rounded-lg px-2 py-1">
                                  <span className="text-xs text-red-300 font-medium">Delete?</span>
                                  <button
                                    onClick={() => handleDeleteService(service.id)}
                                    disabled={adminSaving}
                                    className="p-0.5 text-red-400 hover:text-red-300 rounded"
                                  >
                                    {adminSaving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Trash2 className="w-3 h-3" />}
                                  </button>
                                  <button onClick={() => setConfirmDelSvc(null)} className="p-0.5 text-white/40 hover:text-white/70 rounded">
                                    <X className="w-3 h-3" />
                                  </button>
                                </div>
                              ) : (
                                <>
                                  <button
                                    onClick={() => startEditService(service)}
                                    className="p-1.5 text-white/30 hover:text-white hover:bg-white/10 rounded transition-colors opacity-0 group-hover:opacity-100"
                                    title="Edit service"
                                  >
                                    <Edit2 className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => setConfirmDelSvc(service.id)}
                                    className="p-1.5 text-white/20 hover:text-red-400 hover:bg-white/10 rounded transition-colors opacity-0 group-hover:opacity-100"
                                    title="Delete service"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </>
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* ── Right: Upcoming Events ── */}
                <div className="lg:col-span-2">
                  <div className="flex items-center justify-between gap-3 mb-6">
                    <h2 className="text-2xl font-bold text-gray-900">Upcoming Events</h2>
                    {isChurchAdmin && (
                      <button
                        onClick={() => {
                          if (showAddEvent) resetEventForm();
                          setShowAddEvent(v => !v);
                          setAdminError("");
                        }}
                        className="flex items-center gap-1.5 text-sm px-3 py-1.5 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors shadow-sm"
                      >
                        <Plus className="w-4 h-4" />
                        Add Event
                      </button>
                    )}
                  </div>

                  {isChurchAdmin && showAddEvent && (
                    <div className="bg-white rounded-2xl border border-gray-200 p-5 mb-5 shadow-sm space-y-3">
                      <h3 className="text-sm font-semibold text-gray-700">
                        {editingEventId ? "Edit event" : "Add an event"}
                      </h3>
                      <input
                        type="text"
                        placeholder="Event title"
                        value={eventTitle}
                        onChange={e => setEventTitle(e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary-400"
                      />
                      <input
                        type="datetime-local"
                        value={eventDateTime}
                        onChange={e => setEventDateTime(e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary-400"
                      />
                      <input
                        type="text"
                        placeholder="Location (optional)"
                        value={eventLocation}
                        onChange={e => setEventLocation(e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary-400"
                      />
                      <textarea
                        rows={3}
                        placeholder="Description (optional)"
                        value={eventDescription}
                        onChange={e => setEventDescription(e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary-400 resize-none"
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={handleSaveEvent}
                          disabled={adminSaving}
                          className="flex items-center gap-1.5 text-sm px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 transition-colors"
                        >
                          {adminSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : editingEventId ? <Edit2 className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                          {editingEventId ? "Save Event" : "Add Event"}
                        </button>
                        <button
                          onClick={() => {
                            resetEventForm();
                            setShowAddEvent(false);
                          }}
                          className="text-sm px-3 py-2 text-gray-500 bg-white border border-gray-200 rounded-lg hover:bg-gray-50"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                  <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                    {upcomingEvents.length === 0 ? (
                      <div className="px-6 py-10 text-center">
                        <Calendar className="w-8 h-8 text-gray-300 mx-auto mb-3" />
                        <p className="text-gray-400 text-sm font-light">No upcoming events.</p>
                        {isChurchAdmin && (
                          <p className="text-xs text-gray-400 mt-1">Add a church event to show it here.</p>
                        )}
                      </div>
                    ) : (
                      <div className="divide-y divide-gray-100">
                        {upcomingEvents.map((event) => {
                          const d = new Date(event.event_date);
                          const day = d.toLocaleDateString("en-GB", { day: "numeric" });
                          const month = d.toLocaleDateString("en-GB", { month: "short" }).toUpperCase();
                          const year = d.getFullYear();
                          const time = d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
                          return (
                            <div key={event.id} className="flex items-start gap-4 px-5 py-4 group">
                              {/* Date badge */}
                              <div className="shrink-0 w-12 text-center bg-primary-50 border border-primary-100 rounded-xl py-2 px-1">
                                <p className="text-xs font-bold text-primary-600 uppercase leading-none">{month}</p>
                                <p className="text-xl font-black text-primary-800 leading-tight">{day}</p>
                                <p className="text-xs text-primary-400 leading-none">{year}</p>
                              </div>
                              {/* Message */}
                              <div className="flex-1 min-w-0 pt-1">
                                <p className="text-sm font-semibold text-gray-900 leading-snug">{event.title}</p>
                                <p className="text-xs text-primary-600 mt-1">{time}</p>
                                {event.location && (
                                  <p className="text-xs text-gray-500 mt-1">{event.location}</p>
                                )}
                                {event.description && (
                                  <p className="text-sm text-gray-600 leading-snug mt-2">{event.description}</p>
                                )}
                              </div>
                              {/* Admin delete */}
                              {isChurchAdmin && (
                                <div className="shrink-0 pt-1 flex items-center gap-1">
                                  {confirmDelEvent === event.id ? (
                                    <div className="flex items-center gap-1 bg-gray-50 border border-gray-200 rounded-lg px-2 py-1">
                                      <span className="text-xs text-red-600 font-medium">Remove?</span>
                                      <button
                                        onClick={() => handleDeleteEvent(event.id)}
                                        disabled={adminSaving}
                                        className="p-0.5 text-red-600 hover:bg-red-50 rounded"
                                      >
                                        {adminSaving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Trash2 className="w-3 h-3" />}
                                      </button>
                                      <button onClick={() => setConfirmDelEvent(null)} className="p-0.5 text-gray-400 rounded">
                                        <X className="w-3 h-3" />
                                      </button>
                                    </div>
                                  ) : (
                                    <>
                                      <button
                                        onClick={() => startEditEvent(event)}
                                        className="p-1 text-gray-300 hover:text-primary-600 hover:bg-primary-50 rounded transition-colors opacity-0 group-hover:opacity-100"
                                        title="Edit event"
                                      >
                                        <Edit2 className="w-3.5 h-3.5" />
                                      </button>
                                      <button
                                        onClick={() => setConfirmDelEvent(event.id)}
                                        className="p-1 text-gray-200 hover:text-red-500 hover:bg-red-50 rounded transition-colors opacity-0 group-hover:opacity-100"
                                        title="Remove event"
                                      >
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
                    )}
                  </div>
                </div>

              </div>
            </div>
          </section>

          {/* ── FIND US: Visiting info + Map ── */}
          <section className="bg-primary-50 py-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-center gap-3 mb-8">
                <MapPin className="w-6 h-6 text-primary-700" />
                <h2 className="text-2xl font-bold text-gray-900">Find Us</h2>
              </div>

              <div className={`grid grid-cols-1 ${visitingBlock ? "lg:grid-cols-2" : ""} gap-8 items-start`}>

                {/* Visiting info */}
                {visitingBlock && (
                  <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 flex flex-col gap-4 h-full">
                    <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center shrink-0">
                      <Calendar className="w-6 h-6 text-primary-700" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">{visitingBlock.title}</h3>
                    <p className="text-gray-600 leading-relaxed whitespace-pre-line">{visitingBlock.content}</p>
                    <p className="text-sm text-gray-400 pt-2 border-t border-gray-100">{church.address}</p>
                  </div>
                )}

                {/* Map */}
                {slug && SLUG_TO_MAP[slug] && (
                  <div className="rounded-2xl overflow-hidden shadow-md border border-gray-200 h-80 sm:h-96 lg:h-[420px]">
                    <iframe
                      title={`Map of ${church.name}`}
                      src={SLUG_TO_MAP[slug]}
                      width="100%"
                      height="100%"
                      style={{ border: 0 }}
                      allowFullScreen
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                    />
                  </div>
                )}

              </div>
            </div>
          </section>

          {/* ── JOIN FRIENDS CTA (card) ── */}
        </>
      )}

      {/* ── JOIN FRIENDS MODAL ── */}
      {showModal && createPortal(
        <div className="fixed inset-0 z-9999 flex items-center justify-center p-4">
          <div
            onClick={handleCloseModal}
            className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm transition-opacity"
          />
          <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden">
            <div className="px-8 py-10 text-center relative bg-[#3a4435] overflow-hidden">
              <div className="absolute inset-0 z-0 bg-linear-to-tr from-[#111827] via-[#2F3A29] to-[#6b7564] opacity-90 mix-blend-multiply" />
              <div className="absolute top-0 right-0 w-40 h-40 bg-white rounded-full mix-blend-overlay filter blur-2xl opacity-10" />
              <button
                onClick={handleCloseModal}
                className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/10 transition-colors z-10"
              >
                <X className="w-5 h-5 text-white/80 hover:text-white" />
              </button>
              <div className="relative z-10 w-16 h-16 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center mx-auto mb-6 shadow-inner">
                <Users className="w-7 h-7 text-white" />
              </div>
              <h3 className="relative z-10 text-2xl font-serif text-white mb-2 leading-tight">
                Welcome to Friends of<br />{church?.name}
              </h3>
              <p className="relative z-10 text-blue-50/80 text-sm font-light">
                Join our community and stay connected
              </p>
            </div>

            <div className="px-8 py-10 bg-white">
              {submitted ? (
                <div className="text-center py-4">
                  <div className="w-20 h-20 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-6">
                    <CheckCircle className="w-10 h-10 text-green-600" />
                  </div>
                  <h4 className="text-2xl font-serif text-gray-900 mb-3">Welcome Aboard!</h4>
                  <p className="text-gray-600 leading-relaxed font-light mb-8">
                    Thank you for your interest! We'll be in touch soon with more information about upcoming events.
                  </p>
                  <button
                    onClick={handleCloseModal}
                    className="w-full bg-gray-900 text-white font-medium rounded-full py-4 transition-transform transform hover:-translate-y-0.5 hover:shadow-lg"
                  >
                    Close Window
                  </button>
                </div>
              ) : (
                <>
                  <p className="text-center text-gray-600 font-light leading-relaxed mb-8">
                    Enter your details and we'll keep you updated on services, events, and community news.
                  </p>
                  {formError && (
                    <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-100 flex items-start gap-3">
                      <div className="w-2 h-2 rounded-full bg-red-500 mt-1.5 shrink-0" />
                      <p className="text-red-700 text-sm font-medium">{formError}</p>
                    </div>
                  )}
                  <form onSubmit={handleJoinSubmit} className="space-y-6">
                    <div>
                      <label htmlFor="join-name" className="block text-sm font-medium text-gray-700 mb-2 ml-1">
                        Full Name
                      </label>
                      <input
                        type="text"
                        id="join-name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="John Doe"
                        className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all"
                        disabled={submitting}
                      />
                    </div>
                    <div>
                      <label htmlFor="join-email" className="block text-sm font-medium text-gray-700 mb-2 ml-1">
                        Email Address <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="email"
                        id="join-email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="john@example.com"
                        className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all"
                        required
                        disabled={submitting}
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="w-full flex items-center justify-center gap-3 bg-[#6b7564] hover:bg-primary-700 text-white font-medium rounded-full py-4 mt-2 transition-all transform hover:-translate-y-0.5 hover:shadow-lg disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none"
                    >
                      {submitting ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <Mail className="w-5 h-5" />
                          Join Friends Community
                        </>
                      )}
                    </button>
                  </form>
                  <p className="text-center mt-6 text-xs text-gray-400">
                    We respect your privacy. Unsubscribe at any time.
                  </p>
                </>
              )}
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
