import { useState, FormEvent } from "react";
import { createPortal } from "react-dom";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import { Clock, MapPin, Calendar, Users, X, CheckCircle, Loader2, Mail } from "lucide-react";
import stJohnsChurchImg from "../assets/st-johns-church.png";
import stNicholastonChurchImg from "../assets/st-nicholas-church.png";

export function Churches() {
  const [showModal, setShowModal] = useState(false);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleJoinSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    if (!email.trim()) {
      setError("Please enter your email address.");
      setSubmitting(false);
      return;
    }

    const web3formsKey = import.meta.env.VITE_WEB3FORMS_KEY;
    if (!web3formsKey) {
      setError("Form is not configured yet. Please try again later.");
      setSubmitting(false);
      return;
    }

    try {
      const response = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          access_key: web3formsKey,
          subject: `Friends of St. John's & St. Nicholas - New Member Interest`,
          name: name.trim() || "Not provided",
          email: email.trim(),
          message: `${name.trim() || "Someone"} would like to join Friends of St. John's & St. Nicholas.`,
        }),
      });

      const data = await response.json();
      if (data.success) {
        setSubmitted(true);
        setEmail("");
        setName("");
      } else {
        setError(data.message || "Something went wrong. Please try again.");
      }
    } catch {
      setError("Network error. Please check your connection and try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    // Reset state after close animation
    setTimeout(() => {
      setSubmitted(false);
      setError("");
    }, 300);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative bg-primary-300">
        <div className="flex items-center px-4 sm:px-6 lg:px-12 py-16 lg:py-24">
          <div className="max-w-7xl mx-auto">
            <h1>Our Churches</h1>
            <p className="text-xl text-gray-800 mt-2">
              Historic places of worship serving our community
            </p>
          </div>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* St Johns Church */}
          <div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
              <div>
                <h2 className="mb-4 font-bold">
                  St Johns Church, Penmaen
                </h2>
                <p className="text-lg text-gray-700 mb-6 leading-relaxed">
                  A beautiful historic church serving the
                  Penmaen community for centuries. St Johns
                  welcomes all visitors and continues to be a
                  place of worship, reflection, and community
                  gathering.
                </p>

                <div className="space-y-4 mb-6">
                  <div className="flex items-start space-x-3">
                    <Clock className="w-6 h-6 text-primary-600 flex-shrink-0 mt-1" />
                    <div>
                      <h3 className="mb-1">Service Times</h3>
                      <p className="text-gray-600 text-sm">
                        Sunday services at 9:30 AM
                        <br />
                        Special services for festivals and
                        occasions
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <Calendar className="w-6 h-6 text-primary-600 flex-shrink-0 mt-1" />
                    <div>
                      <h3 className="mb-1">Visiting</h3>
                      <p className="text-gray-600 text-sm">
                        The church welcomes visitors throughout
                        the year. Please contact us to arrange a
                        visit or for more information about the
                        church history.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <MapPin className="w-6 h-6 text-primary-600 flex-shrink-0 mt-1" />
                    <div>
                      <h3 className="mb-1">Location</h3>
                      <p className="text-gray-600 text-sm">
                        Penmaen, Gower, Swansea SA3 2HH
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl overflow-hidden shadow-lg h-full">
                <ImageWithFallback
                  src={stJohnsChurchImg}
                  alt="St Johns Church, Penmaen"
                  className="w-full h-full object-cover min-h-[350px]"
                />
              </div>
            </div>
          </div>

          {/* Join Friends CTA Banner */}
          <div
            className="relative shadow-[0_8px_30px_rgb(0,0,0,0.04)] sm:shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100/50"
            style={{
              marginTop: '40px',
              marginBottom: '40px',
              backgroundColor: '#ffffff',
              borderRadius: '1.5rem',
              overflow: 'hidden'
            }}
          >
            {/* Subtle soft gradient blur in the background */}
            <div
              className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 rounded-full opacity-20 filter blur-[60px]"
              style={{ background: 'linear-gradient(135deg, #b7c6ad, #6b7564)' }}
            />
            <div
              className="absolute bottom-0 left-0 -ml-20 -mb-20 w-64 h-64 rounded-full opacity-[0.15] filter blur-[60px]"
              style={{ background: 'linear-gradient(135deg, #6b7564, #ccdcc1)' }}
            />

            <div className="relative px-8 sm:px-12 py-20 md:py-24 text-center z-10">
              <div className="flex justify-center mb-10">
                <div
                  className="rounded-full flex items-center justify-center shadow-sm"
                  style={{ backgroundColor: '#f5f5f0', width: '80px', height: '80px', border: '1px solid #e8e8dd' }}
                >
                  <Users className="w-10 h-10" style={{ color: '#6b7564' }} />
                </div>
              </div>
              <h2
                className="mb-6 font-serif tracking-tight"
                style={{ fontSize: '2.5rem', lineHeight: 1.2, color: '#111827' }}
              >
                Join Friends of St. John's &amp; St. Nicholas
              </h2>
              <p
                className="max-w-xl mx-auto mt-2 mb-12 leading-relaxed"
                style={{ color: '#4b5563', fontSize: '1.1rem' }}
              >
                Become part of our community dedicated to preserving these beautiful
                historic churches. Stay informed about events, services, and ways
                to support our churches.
              </p>
              <button
                onClick={() => setShowModal(true)}
                id="join-friends-cta"
                className="inline-flex items-center gap-3 font-medium rounded-xl transition-all duration-300 shadow-[0_4px_14px_0_rgba(107,117,100,0.39)] hover:shadow-[0_6px_20px_rgba(107,117,100,0.23)] transform hover:-translate-y-0.5"
                style={{
                  backgroundColor: '#6b7564', // primary-600
                  color: 'white',
                  padding: '16px 40px',
                  fontSize: '1.05rem',
                  letterSpacing: '0.01em',
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#5c6555'; // primary-700
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#6b7564'; // primary-600
                }}
              >
                <Mail className="w-5 h-5" />
                Join Us Today
              </button>
            </div>
          </div>

          {/* St Nicholaston Church */}
          <div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
              <div className="order-2 md:order-1 rounded-2xl overflow-hidden shadow-lg h-full">
                <ImageWithFallback
                  src={stNicholastonChurchImg}
                  alt="St Nicholaston Church"
                  className="w-full h-full object-cover min-h-[350px]"
                />
              </div>

              <div className="order-1 md:order-2">
                <h2 className="mb-4 font-bold">St Nicholas Church</h2>
                <p className="text-lg text-gray-700 mb-6 leading-relaxed">
                  Set in the picturesque village of Nicholaston,
                  this historic church has served the local
                  community for generations. The church features
                  beautiful architecture and a peaceful
                  atmosphere for worship and contemplation.
                </p>

                <div className="space-y-4 mb-6">
                  <div className="flex items-start space-x-3">
                    <Clock className="w-6 h-6 text-primary-600 flex-shrink-0 mt-1" />
                    <div>
                      <h3 className="mb-1">Service Times</h3>
                      <p className="text-gray-600 text-sm">
                        Sunday services at 11:00 AM
                        <br />
                        Evening prayer on Wednesdays at 6:00 PM
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <Calendar className="w-6 h-6 text-primary-600 flex-shrink-0 mt-1" />
                    <div>
                      <h3 className="mb-1">Visiting</h3>
                      <p className="text-gray-600 text-sm">
                        Visitors are always welcome. The church
                        is typically open during daylight hours,
                        and guided tours can be arranged by
                        appointment.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <MapPin className="w-6 h-6 text-primary-600 flex-shrink-0 mt-1" />
                    <div>
                      <h3 className="mb-1">Location</h3>
                      <p className="text-gray-600 text-sm">
                        Nicholaston, Gower, Swansea SA3 2HL
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Community Notice */}
          <div className="mt-16 bg-primary-50 rounded-2xl p-8">
            <h3 className="mb-4">Community Worship</h3>
            <p className="text-gray-700 leading-relaxed">
              Both churches are part of the wider Gower
              community and work together to serve local
              residents and visitors. All are welcome to attend
              services, events, and community activities. For
              more information about either church, please visit
              during service times or contact us through the
              details provided.
            </p>
          </div>
        </div>
      </section>

      {/* Join Friends Email Modal */}
      {showModal && createPortal(
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem',
          }}
        >
          {/* Backdrop */}
          <div
            onClick={handleCloseModal}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.6)',
              backdropFilter: 'blur(4px)',
            }}
          />

          {/* Modal */}
          <div
            className="relative rounded-2xl mx-auto overflow-hidden"
            style={{
              width: '100%',
              maxWidth: '28rem',
              backgroundColor: 'white',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            }}
          >
            {/* Header strip */}
            <div
              className="text-center"
              style={{
                padding: '2rem 2rem 1.5rem',
                background: 'linear-gradient(135deg, #6b7564 0%, #5c6555 100%)', // primary gradient
              }}
            >
              <button
                onClick={handleCloseModal}
                className="rounded-lg transition-colors hover:bg-white/10"
                style={{
                  position: 'absolute',
                  top: '0.75rem',
                  right: '0.75rem',
                  padding: '0.375rem',
                  color: 'rgba(255, 255, 255, 0.9)',
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                <X className="w-5 h-5" />
              </button>

              <div
                className="rounded-full flex items-center justify-center mx-auto"
                style={{ width: '3.5rem', height: '3.5rem', backgroundColor: 'rgba(255, 255, 255, 0.15)', marginBottom: '1rem' }}
              >
                <Users style={{ width: '1.75rem', height: '1.75rem', color: 'white' }} />
              </div>
              <h3
                style={{
                  fontSize: '1.25rem',
                  fontFamily: 'var(--font-family-serif)',
                  color: 'white',
                  marginBottom: '0.25rem',
                }}
              >
                Welcome to Friends of<br />St. John's & St. Nicholas
              </h3>
              <p style={{ color: 'rgba(255, 255, 255, 0.85)', fontSize: '0.875rem', marginTop: '0.5rem' }}>
                Join our community and stay connected
              </p>
            </div>

            {/* Form area */}
            <div style={{ padding: '1.5rem 2rem' }}>
              {submitted ? (
                <div className="text-center" style={{ padding: '1rem 0' }}>
                  <div
                    className="rounded-full flex items-center justify-center mx-auto mb-4"
                    style={{ width: '3.5rem', height: '3.5rem', backgroundColor: '#e8e8dd' }}
                  >
                    <CheckCircle style={{ width: '1.75rem', height: '1.75rem', color: '#6b7564' }} />
                  </div>
                  <h4 style={{ fontSize: '1.125rem', fontWeight: 600, color: '#111827', marginBottom: '0.5rem' }}>
                    Welcome Aboard!
                  </h4>
                  <p className="text-sm leading-relaxed" style={{ color: '#4b5563' }}>
                    Thank you for your interest! We'll be in touch soon with more
                    information about upcoming events and how you can get involved.
                  </p>
                  <button
                    onClick={handleCloseModal}
                    className="rounded-lg text-sm"
                    style={{
                      marginTop: '1.5rem',
                      padding: '0.625rem 1.5rem',
                      backgroundColor: 'var(--color-primary-600)',
                      color: 'white',
                      border: 'none',
                      cursor: 'pointer',
                      fontWeight: 500,
                    }}
                  >
                    Close
                  </button>
                </div>
              ) : (
                <>
                  <p className="text-sm text-center leading-relaxed" style={{ color: '#4b5563', marginBottom: '1.25rem' }}>
                    Enter your details below and we'll keep you updated on services,
                    events, and community news.
                  </p>

                  {error && (
                    <div className="rounded-lg" style={{ marginBottom: '1rem', padding: '0.75rem', backgroundColor: '#fef2f2', border: '1px solid #fecaca' }}>
                      <p className="text-sm" style={{ color: '#b91c1c' }}>{error}</p>
                    </div>
                  )}

                  <form
                    onSubmit={handleJoinSubmit}
                    className="flex flex-col"
                    style={{ marginTop: '1rem', gap: '1rem' }}
                  >
                    <div>
                      <label
                        htmlFor="join-name"
                        className="block text-sm"
                        style={{ marginBottom: '0.375rem', color: '#374151', fontWeight: 500 }}
                      >
                        Name
                      </label>
                      <input
                        type="text"
                        id="join-name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Your name"
                        className="w-full border border-gray-200 rounded-lg text-sm"
                        style={{
                          padding: '0.75rem 1rem',
                          backgroundColor: '#f9fafb',
                          outline: 'none',
                        }}
                        disabled={submitting}
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="join-email"
                        className="block text-sm"
                        style={{ marginBottom: '0.375rem', color: '#374151', fontWeight: 500 }}
                      >
                        Email Address <span style={{ color: '#ef4444' }}>*</span>
                      </label>
                      <input
                        type="email"
                        id="join-email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="your@email.com"
                        className="w-full border border-gray-200 rounded-lg text-sm"
                        style={{
                          padding: '0.75rem 1rem',
                          backgroundColor: '#f9fafb',
                          outline: 'none',
                        }}
                        required
                        disabled={submitting}
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="w-full rounded-lg text-sm flex items-center justify-center gap-3 transition-colors"
                      style={{
                        marginTop: '0.5rem',
                        padding: '0.75rem 1.5rem',
                        backgroundColor: '#6b7564', // primary-600
                        color: 'white',
                        fontWeight: 500,
                        border: 'none',
                        cursor: submitting ? 'not-allowed' : 'pointer',
                        opacity: submitting ? 0.6 : 1,
                      }}
                      onMouseEnter={(e) => {
                        if (!submitting) (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#5c6555'; // primary-700
                      }}
                      onMouseLeave={(e) => {
                        (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#6b7564'; // primary-600
                      }}
                    >
                      {submitting ? (
                        <>
                          <Loader2 className="w-4 h-4" style={{ animation: 'spin 1s linear infinite' }} />
                          Joining...
                        </>
                      ) : (
                        <>
                          <Mail className="w-4 h-4" />
                          Join Friends
                        </>
                      )}
                    </button>
                  </form>

                  <p className="text-center mt-4" style={{ fontSize: '0.75rem', color: '#9ca3af' }}>
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