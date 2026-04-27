import { useState, FormEvent, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { Users, X, CheckCircle, Loader2, Mail, Quote } from "lucide-react";
import { ChurchCard } from "../components/church/ChurchCard";
import { getChurchesWithRelations } from "../services/churchService";
import { useAuth } from "../context/AuthContext";
import type { Church } from "../types/church";

export function Churches() {
  const { isAdmin } = useAuth();

  const [churches, setChurches] = useState<Church[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState("");

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

          {/* Church cards */}
          {!loading && !fetchError && churches.map((church, index) => (
            <ChurchCard
              key={church.id}
              church={church}
              imageRight={index % 2 !== 0}
              visible={cardsVisible}
              animationDelay={(index + 1) * 200}
              isAdmin={isAdmin}
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

      {/* Join Friends Modal */}
      {showModal && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            onClick={handleCloseModal}
            className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm transition-opacity"
          />

          {/* Modal */}
          <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden transform transition-all scale-100">
            {/* Header */}
            <div className="px-8 py-10 text-center relative bg-[#3a4435] overflow-hidden">
              <div className="absolute inset-0 z-0 bg-gradient-to-tr from-[#111827] via-[#2F3A29] to-[#6b7564] opacity-90 mix-blend-multiply" />
              <div className="absolute top-0 right-0 w-40 h-40 bg-white rounded-full mix-blend-overlay filter blur-[40px] opacity-10" />
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
                      <div className="w-2 h-2 rounded-full bg-red-500 mt-1.5 flex-shrink-0" />
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
                      className="w-full flex items-center justify-center gap-3 bg-[#6b7564] hover:bg-[#5c6555] text-white font-medium rounded-full py-4 mt-2 transition-all transform hover:-translate-y-0.5 hover:shadow-lg disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none"
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
