import { useState, FormEvent, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { Users, X, CheckCircle, Loader2, Mail, Quote, Plus } from "lucide-react";
import { ChurchCard } from "../components/church/ChurchCard";
import { getChurchesWithRelations, addChurch } from "../services/churchService";
import type { Church } from "../types/church";
import { useAuth } from "../context/AuthContext";

export function Churches() {
  const { hasRole } = useAuth();
  const isChurchAdmin = hasRole("churches");

  const [churches, setChurches] = useState<Church[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState("");

  // Add Church modal state
  const [showAddChurch, setShowAddChurch] = useState(false);
  const [addForm, setAddForm] = useState({ name: "", description: "", address: "", image_url: "" });
  const [addSaving, setAddSaving] = useState(false);
  const [addError, setAddError] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [isLoaded, setIsLoaded] = useState(false);
  const [cardsVisible, setCardsVisible] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  const fetchChurches = useCallback(async () => {
    setFetchError("");
    try {
      const data = await getChurchesWithRelations();
      setChurches(data);
      setCardsVisible(true);
    } catch {
      setFetchError("Unable to load church information. Please try again later.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchChurches();
  }, [fetchChurches]);

  async function handleAddChurch(e: FormEvent) {
    e.preventDefault();
    if (!addForm.name.trim() || !addForm.description.trim() || !addForm.address.trim()) {
      setAddError("Name, description, and address are required.");
      return;
    }
    setAddSaving(true);
    setAddError("");
    try {
      await addChurch({
        name: addForm.name.trim(),
        description: addForm.description.trim(),
        address: addForm.address.trim(),
        image_url: addForm.image_url.trim(),
      });
      setAddForm({ name: "", description: "", address: "", image_url: "" });
      setShowAddChurch(false);
      fetchChurches();
    } catch (err: unknown) {
      setAddError(err instanceof Error ? err.message : "Failed to add church.");
    } finally {
      setAddSaving(false);
    }
  }

  const handleJoinSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    if (!email.trim()) {
      setError("Please enter your email address.");
      setSubmitting(false);
      return;
    }

    try {
      const response = await fetch("/api/send-newsletter", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          name: name.trim() || "",
          email: email.trim(),
          group: "churches",
        }),
      });

      const data = await response.json();
      if (response.ok && data.success) {
        setSubmitted(true);
        setEmail("");
        setName("");
      } else {
        setError(data.error || "Something went wrong. Please try again.");
      }
    } catch {
      setError("Network error. Please check your connection and try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setTimeout(() => {
      setSubmitted(false);
      setError("");
    }, 300);
  };

  return (
    <div className="min-h-screen bg-primary-50 flex flex-col font-sans">

      {/* Immersive Hero Section */}
      <section className="relative overflow-hidden w-full bg-primary-800">
        <div
          className={`relative z-10 flex min-h-[40vh] items-center px-4 sm:px-6 lg:px-12 py-20 lg:py-32 transition-all duration-1000 transform ${
            isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <div className="max-w-7xl mx-auto w-full text-center md:text-left flex flex-col items-center md:items-start pl-4">
            <h1 className="text-5xl md:text-6xl font-serif text-white mb-6 drop-shadow-md">
              Our Churches
            </h1>
            <p className="text-xl md:text-2xl text-blue-50/90 max-w-2xl font-light leading-relaxed mb-10">
              Historic places of worship serving our community through generations
            </p>
            <button
              onClick={() => setShowModal(true)}
              className="inline-flex items-center gap-3 font-medium rounded-lg transition-all duration-300 transform hover:scale-105 active:scale-95 bg-white text-gray-900 hover:bg-gray-50 px-8 py-3 text-lg shadow-lg"
            >
              <Users className="w-5 h-5 text-primary-600" />
              Join Friends
            </button>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <section className="py-24 flex-1 relative z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-24">

          {/* Loading state */}
          {loading && (
            <div className="flex flex-col items-center justify-center py-32 gap-4 text-gray-400">
              <Loader2 className="w-10 h-10 animate-spin text-primary-600" />
              <p className="text-base font-light">Loading churches...</p>
            </div>
          )}

          {/* Error state */}
          {!loading && fetchError && (
            <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
              <p className="text-gray-500 text-lg font-light">{fetchError}</p>
              <button
                onClick={fetchChurches}
                className="text-sm text-primary-600 hover:underline"
              >
                Try again
              </button>
            </div>
          )}

          {/* Admin: Add Church button */}
          {isChurchAdmin && !loading && !fetchError && (
            <div className="flex justify-end -mb-16">
              <button
                onClick={() => setShowAddChurch(true)}
                className="flex items-center gap-2 px-5 py-2.5 bg-primary-600 text-white text-sm font-medium rounded-xl hover:bg-primary-700 transition-colors shadow-sm cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                Add Church
              </button>
            </div>
          )}

          {/* Church cards */}
          {!loading && !fetchError && churches.map((church, index) => (
            <ChurchCard
              key={church.id}
              church={church}
              imageRight={index % 2 !== 0}
              visible={cardsVisible}
              animationDelay={(index + 1) * 200}
              isAdmin={isChurchAdmin}
              onRefresh={fetchChurches}
            />
          ))}

          {/* Empty state */}
          {!loading && !fetchError && churches.length === 0 && (
            <div className="text-center py-24 text-gray-400">
              <p className="text-lg font-light">No churches found.</p>
            </div>
          )}

          {/* Bottom Callouts: Join Friends & Community Worship */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-16 my-24 items-stretch">

            {/* Join Friends card */}
            <div className="bg-white border border-gray-100 rounded-3xl p-10 lg:p-12 text-center relative mt-8 md:mt-0 flex flex-col justify-between">
              <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-white p-2 rounded-full shadow-md transition-transform duration-300 hover:scale-110 hover:-translate-y-1 cursor-pointer">
                <div className="bg-primary-50 text-primary-700 rounded-full w-14 h-14 flex items-center justify-center">
                  <Users className="w-6 h-6 fill-current opacity-60" />
                </div>
              </div>
              <div>
                <h3 className="text-2xl font-serif text-gray-900 mb-6 mt-4 leading-tight">
                  Join Friends of<br />St. John's & St. Nicholas
                </h3>
                <p className="text-lg text-gray-600 leading-relaxed font-light mx-auto">
                  Become part of our dedicated community. Stay informed about events, services, and meaningful ways to offer your support to our historic churches.
                </p>
              </div>
              <div className="mt-10">
                <button
                  onClick={() => setShowModal(true)}
                  className="inline-flex items-center gap-3 font-medium rounded-lg transition-all duration-300 transform hover:scale-105 active:scale-95 active:shadow-inner hover:shadow-lg bg-primary-600 text-white hover:bg-primary-700 px-8 py-3 text-lg shadow-md"
                >
                  <Mail className="w-5 h-5 text-white" />
                  Join Our Community
                </button>
              </div>
            </div>

            {/* Community notice card */}
            <div className="bg-white border border-gray-100 rounded-3xl p-10 lg:p-12 text-center relative mt-8 md:mt-0 flex flex-col justify-between">
              <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-white p-2 rounded-full shadow-md transition-transform duration-300 hover:scale-110 hover:-translate-y-1 cursor-pointer">
                <div className="bg-primary-50 text-primary-700 rounded-full w-14 h-14 flex items-center justify-center">
                  <Quote className="w-6 h-6 fill-current opacity-60" />
                </div>
              </div>
              <div>
                <h3 className="text-2xl font-serif text-gray-900 mb-6 mt-4">Community Worship</h3>
                <p className="text-lg text-gray-600 leading-relaxed font-light mx-auto">
                  Both churches are part of the wider Gower community and work together to serve local residents and visitors. All are welcome to attend services, events, and community activities. For more information about either church, please visit during service times.
                </p>
              </div>
              <div className="mt-10" />
            </div>

          </div>
        </div>
      </section>

      {/* Add Church Modal */}
      {showAddChurch && createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="text-lg font-bold font-serif text-gray-900">Add Church</h2>
              <button onClick={() => setShowAddChurch(false)} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleAddChurch} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input type="text" required value={addForm.name}
                  onChange={e => setAddForm(f => ({ ...f, name: e.target.value }))}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea required rows={3} value={addForm.description}
                  onChange={e => setAddForm(f => ({ ...f, description: e.target.value }))}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none resize-none transition-all" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                <input type="text" required value={addForm.address}
                  onChange={e => setAddForm(f => ({ ...f, address: e.target.value }))}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
                <input type="text" value={addForm.image_url}
                  onChange={e => setAddForm(f => ({ ...f, image_url: e.target.value }))}
                  placeholder="https://..."
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all" />
              </div>
              {addError && <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-3">{addError}</p>}
              <div className="flex gap-3 pt-1">
                <button type="button" onClick={() => setShowAddChurch(false)} disabled={addSaving}
                  className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer">
                  Cancel
                </button>
                <button type="submit" disabled={addSaving}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-primary-600 rounded-xl hover:bg-primary-700 transition-colors disabled:opacity-70 cursor-pointer">
                  {addSaving ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</> : 'Add Church'}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body,
      )}

      {/* Join Friends Modal */}
      {showModal && createPortal(
        <div className="fixed inset-0 z-9999 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            onClick={handleCloseModal}
            className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm transition-opacity"
          />

          {/* Modal */}
          <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden transform transition-all scale-100">
            {/* Header */}
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
                Welcome to Friends of<br />St. John's & St. Nicholas
              </h3>
              <p className="relative z-10 text-blue-50/80 text-sm font-light">
                Join our community and stay connected
              </p>
            </div>

            {/* Form */}
            <div className="px-8 py-10 bg-white">
              {submitted ? (
                <div className="text-center py-4">
                  <div className="w-20 h-20 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-6">
                    <CheckCircle className="w-10 h-10 text-green-600" />
                  </div>
                  <h4 className="text-2xl font-serif text-gray-900 mb-3">Welcome Aboard!</h4>
                  <p className="text-gray-600 leading-relaxed font-light mb-8">
                    Thank you for your interest! We'll be in touch soon with more information about upcoming events and how you can get involved.
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
                    Enter your details below and we'll keep you updated on services, events, and community news.
                  </p>

                  {error && (
                    <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-100 flex items-start gap-3">
                      <div className="w-2 h-2 rounded-full bg-red-500 mt-1.5 shrink-0" />
                      <p className="text-red-700 text-sm font-medium">{error}</p>
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
