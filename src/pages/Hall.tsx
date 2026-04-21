import { useState, FormEvent } from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import { Clock, Car, Music, Palette, Coffee, PoundSterling, X, CheckCircle, XCircle, Loader2, Mail, Users, Facebook } from 'lucide-react';

const hallGateEntrance = '/images/edited-hall-gate.webp';
const hallSideView = '/images/edited-side-hall.webp';

export function Hall() {
  // Booking form state
  const [bookingForm, setBookingForm] = useState({
    name: '',
    email: '',
    phone: '',
    date: '',
    endDate: '',
    details: '',
  });
  const [bookingSubmitting, setBookingSubmitting] = useState(false);
  const [bookingStatus, setBookingStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [bookingError, setBookingError] = useState('');

  // Friends form state
  const [showFriendsModal, setShowFriendsModal] = useState(false);
  const [friendsEmail, setFriendsEmail] = useState("");
  const [friendsName, setFriendsName] = useState("");
  const [friendsSubmitting, setFriendsSubmitting] = useState(false);
  const [friendsSubmitted, setFriendsSubmitted] = useState(false);
  const [friendsError, setFriendsError] = useState("");

  const handleFriendsSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setFriendsSubmitting(true);
    setFriendsError("");

    if (!friendsEmail.trim()) {
      setFriendsError("Please enter your email address.");
      setFriendsSubmitting(false);
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
          name: friendsName.trim() || "",
          email: friendsEmail.trim(),
          group: "hall",
        }),
      });

      const data = await response.json();
      if (response.ok && data.success) {
        setFriendsSubmitted(true);
        setFriendsEmail("");
        setFriendsName("");
      } else {
        setFriendsError(data.error || "Something went wrong. Please try again.");
      }
    } catch {
      setFriendsError("Network error. Please check your connection and try again.");
    } finally {
      setFriendsSubmitting(false);
    }
  };

  const handleCloseFriendsModal = () => {
    setShowFriendsModal(false);
    // Reset state after close animation
    setTimeout(() => {
      setFriendsSubmitted(false);
      setFriendsError("");
    }, 300);
  };

  // Booking form handlers
  const handleBookingChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setBookingForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleBookingSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setBookingSubmitting(true);
    setBookingStatus('idle');
    setBookingError('');

    console.log('[BookingForm] Submit triggered');
    console.log('[BookingForm] Form data:', bookingForm);

    // Client-side validation
    if (!bookingForm.name.trim()) {
      console.warn('[BookingForm] Validation failed: name is empty');
      setBookingStatus('error');
      setBookingError('Please enter your name.');
      setBookingSubmitting(false);
      return;
    }
    if (!bookingForm.email.trim()) {
      console.warn('[BookingForm] Validation failed: email is empty');
      setBookingStatus('error');
      setBookingError('Please enter your email address.');
      setBookingSubmitting(false);
      return;
    }
    if (!bookingForm.details.trim()) {
      console.warn('[BookingForm] Validation failed: details is empty');
      setBookingStatus('error');
      setBookingError('Please provide some event details.');
      setBookingSubmitting(false);
      return;
    }
    if (!bookingForm.date) {
      console.warn('[BookingForm] Validation failed: date is empty');
      setBookingStatus('error');
      setBookingError('Please select a preferred date.');
      setBookingSubmitting(false);
      return;
    }

    const payload = {
      name: bookingForm.name.trim(),
      email: bookingForm.email.trim(),
      phone: bookingForm.phone.trim() || '',
      date: bookingForm.date,
      endDate: bookingForm.endDate || '',
      details: bookingForm.details.trim(),
    };

    try {
      const response = await fetch('/api/send-booking', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setBookingStatus('success');
        setBookingForm({ name: '', email: '', phone: '', date: '', endDate: '', details: '' });
      } else {
        setBookingStatus('error');
        setBookingError(data.error || 'Something went wrong. Please try again.');
      }
    } catch (err) {
      console.error('[BookingForm] Network error:', err);
      setBookingStatus('error');
      setBookingError('Network error. Please check your connection and try again.');
    } finally {
      setBookingSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-primary-50">
      {/* Hero Section - Split Design */}
      <section className="relative md:h-[600px] grid grid-cols-1 md:grid-cols-2">
        {/* Left Side - Hall Entrance with Text Overlay */}
        <div className="relative md:h-full" style={{ minHeight: '500px', maxHeight: '900px' }}>
          <ImageWithFallback
            src={hallGateEntrance}
            alt="Village Hall Entrance with Gate"
            className="w-full h-full object-cover"
            style={{ maxHeight: '850px' }}
            fetchPriority="high"
            loading="eager"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-black/40 flex items-center">
            <div className="px-8 md:px-12 lg:px-16 text-white max-w-2xl py-12 md:py-0">
              <h1 className="mb-4 text-white text-4xl md:text-5xl">
                The Hall
              </h1>
              <p className="text-lg md:text-xl mb-8 leading-relaxed">
                Your community space in the heart of the village. Available for events, meetings, and celebrations.
              </p>
              <div className="mt-8 flex flex-wrap gap-4">
                <a
                  href="#booking"
                  className="bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition-colors"
                >
                  Book Now
                </a>
                <Link
                  to="/hall/events"
                  className="bg-white/20 backdrop-blur-sm text-white px-6 py-3 rounded-lg hover:bg-white/30 transition-colors border border-white/40"
                >
                  View Activities
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Hall Side View Image */}
        <div className="relative overflow-hidden h-[300px] md:h-auto" style={{ maxHeight: '850px' }}>
          <ImageWithFallback
            src={hallSideView}
            alt="Village Hall Side View"
            className="w-full h-full object-cover"
            style={{ maxHeight: '850px' }}
            fetchPriority="high"
            loading="eager"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-amber-900/20 to-orange-800/30"></div>
        </div>
      </section>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">

        {/* Book the Hall Section */}
        <div id="booking" className="mb-16 pt-8">
          <div className="text-left max-w-3xl mb-12">
            <h2 className="mb-6">Book the Hall</h2>
            <p className="text-lg text-gray-700 leading-relaxed">
              Our village hall is available for hire for a variety of events including parties,
              meetings, workshops, and celebrations. The hall offers a flexible space with
              kitchen facilities and parking.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Side - Info Cards */}
            <div className="space-y-6 flex flex-col">
              {/* Opening Hours Card */}
              <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <Clock className="w-6 h-6 text-gray-700" />
                </div>
                <h3 className="mb-3">Opening Hours</h3>
                <p className="text-gray-600 text-sm">
                  Available for hire 7 days a week.<br />
                  Sessions can be broken into morning / afternoon / evening.
                </p>
              </div>

              {/* Hire Rates Card */}
              <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <PoundSterling className="w-6 h-6 text-gray-700" />
                </div>
                <h3 className="mb-3">Hire Rates</h3>
                <p className="text-gray-600 text-sm">
                  £40 a session + electricity<br />
                  or £120 a day.
                </p>
              </div>

              {/* Parking Card */}
              <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <Car className="w-6 h-6 text-gray-700" />
                </div>
                <h3 className="mb-3">Parking</h3>
                <p className="text-gray-600 text-sm">
                  £10 parking fee for field council.<br />
                  Parking for up to 20 vehicles.
                </p>
              </div>

              {/* Capacity Card */}
              <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm hover:shadow-md transition-shadow flex-grow">
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <span className="text-2xl text-gray-700 font-semibold">80</span>
                </div>
                <h3 className="mb-3">Capacity</h3>
                <p className="text-gray-600 text-sm">
                  Max capacity: 80
                </p>
              </div>
            </div>

            {/* Right Side - Booking Form */}
            <div className="flex flex-col">
              <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-lg flex-grow">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-2">
                  <h3>Booking Enquiry Form</h3>
                  <a
                    href="https://www.facebook.com/panvillagehall"
                    target="_blank"
                    rel="noopener noreferrer"
                    title="Follow us on Facebook"
                    style={{ color: '#1877F2' }}
                    className="flex-shrink-0 flex items-center gap-2 hover:opacity-80 transition-opacity"
                  >
                    <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                    </svg>
                    <span className="text-sm text-gray-500 font-medium">or contact us on Facebook</span>
                  </a>
                </div>

                {/* Success Message */}
                {bookingStatus === 'success' && (
                  <div className="mb-6 p-4 bg-green-50 border border-green-200 border-l-4 border-l-green-500 rounded-lg flex items-start gap-4">
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-green-800 font-semibold text-sm">Enquiry sent successfully!</p>
                      <p className="text-green-700 text-sm mt-1">We'll get back to you as soon as possible.</p>
                    </div>
                  </div>
                )}

                {/* Error Message */}
                {bookingStatus === 'error' && (
                  <div className="mb-6 p-4 bg-red-50 border border-red-200 border-l-4 border-l-red-500 rounded-lg flex items-start gap-4">
                    <XCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-red-800 font-semibold text-sm">Failed to send enquiry</p>
                      <p className="text-red-700 text-sm mt-1">{bookingError}</p>
                    </div>
                  </div>
                )}

                <form className="space-y-5" onSubmit={handleBookingSubmit}>
                  <div>
                    <label htmlFor="name" className="block text-sm mb-2 text-gray-700 font-medium">
                      Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={bookingForm.name}
                      onChange={handleBookingChange}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                      required
                      disabled={bookingSubmitting}
                    />
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm mb-2 text-gray-700 font-medium">
                      Email <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={bookingForm.email}
                      onChange={handleBookingChange}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                      required
                      disabled={bookingSubmitting}
                    />
                  </div>

                  <div>
                    <label htmlFor="phone" className="block text-sm mb-2 text-gray-700 font-medium">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={bookingForm.phone}
                      onChange={handleBookingChange}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                      disabled={bookingSubmitting}
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="date" className="block text-sm mb-2 text-gray-700 font-medium">
                        Start Date <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="date"
                        id="date"
                        name="date"
                        value={bookingForm.date}
                        onChange={handleBookingChange}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                        required
                        disabled={bookingSubmitting}
                      />
                    </div>
                    <div>
                      <label htmlFor="endDate" className="block text-sm mb-2 text-gray-700 font-medium">
                        End Date <span className="text-gray-500 font-normal">(optional)</span>
                      </label>
                      <input
                        type="date"
                        id="endDate"
                        name="endDate"
                        value={bookingForm.endDate}
                        min={bookingForm.date || undefined}
                        onChange={handleBookingChange}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                        disabled={bookingSubmitting}
                      />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="details" className="block text-sm mb-2 text-gray-700 font-medium">
                      Event Details <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      id="details"
                      name="details"
                      value={bookingForm.details}
                      onChange={handleBookingChange}
                      rows={4}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none transition-all"
                      placeholder="Please tell us about your event, expected number of guests, and any special requirements..."
                      required
                      disabled={bookingSubmitting}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={bookingSubmitting}
                    className="w-full bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition-colors font-medium shadow-sm hover:shadow disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {bookingSubmitting ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      'Submit Enquiry'
                    )}
                  </button>
                </form>
              </div>

              {/* Support Section */}
              <div className="mt-6 bg-white p-6 text-center rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center">
                <p className="text-gray-700 mb-4 font-medium">
                  Help maintain the hall and ensure activities can continue
                </p>
                <button
                  onClick={() => setShowFriendsModal(true)}
                  className="bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium shadow-sm"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    padding: '0.625rem 1.5rem'
                  }}
                >
                  <Mail className="w-4 h-4" />
                  Join as Friends
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Floor Plan Section */}
        <div className="mb-16 pt-8">
          <div className="text-left max-w-3xl mb-8">
            <h2 className="mb-4">Hall Floor Plan</h2>
            <p className="text-lg text-gray-700 leading-relaxed">
              View the layout of our village hall including facilities, access points, and capacity information.
            </p>
          </div>
          <div className="bg-white rounded-2xl p-6 md:p-10 border border-gray-200 shadow-sm">
            <img
              src="/images/hall-floor-plan.png"
              alt="Village Hall Floor Plan showing main hall with max capacity of 80, kitchen, male and female W/C, disabled W/C, south facing lawn, ramp access, and defibrillator location"
              className="w-full h-auto rounded-lg"
              style={{ maxWidth: '800px', margin: '0 auto', display: 'block' }}
              loading="lazy"
            />
          </div>
        </div>

        {/* Activities Section */}
        <div id="activities" className="mb-20 pt-8">
          <div className="flex justify-between items-center mb-12">
            <h2 className="mb-0">Regular Activities</h2>
            <Link
              to="/hall/events"
              className="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700 transition-colors font-sm shadow-sm hover:shadow"
            >
              View Schedule
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all group flex flex-col items-start border border-gray-100 overflow-hidden">
              <div className="w-full bg-gray-50 rounded-full flex items-center justify-center py-2 mb-8 group-hover:bg-primary-50 transition-colors p-2">
                <Coffee className="w-6 h-6 text-gray-700 group-hover:text-primary-600" />
              </div>
              <h3 className="text-xl font-serif mb-4">Village Coffee Mornings</h3>
              <p className="text-gray-600 mb-8 text-sm leading-relaxed text-left">
                Join us for friendly coffee mornings with homemade cakes and good conversation.
              </p>
              <div className="mt-auto">
                <p className="text-sm font-medium text-gray-700 bg-gray-50 px-4 py-2 rounded-full p-2">
                  First Saturday, 10:30 - 12:30
                </p>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all group flex flex-col items-start border border-gray-100 overflow-hidden">
              <div className="w-full bg-gray-50 rounded-full flex items-center justify-center py-2 mb-8 group-hover:bg-primary-50 transition-colors p-2">
                <Palette className="w-6 h-6 text-gray-700 group-hover:text-primary-600" />
              </div>
              <h3 className="text-xl font-serif mb-4">Art Classes</h3>
              <p className="text-gray-600 mb-4 text-sm leading-relaxed text-left">
                Creative art sessions for all skill levels in a welcoming environment.
              </p>
              <p className="text-amber-600 text-xs italic mb-8">
                Coming soon — no sessions currently scheduled, but planned for the near future.
              </p>
              <div className="mt-auto">
                <Link to="/hall/events" className="text-sm font-medium text-gray-700 bg-gray-50 px-6 py-2 rounded-full hover:bg-gray-100 transition-colors p-2">
                  Check schedule
                </Link>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all group flex flex-col items-start border border-gray-100 overflow-hidden">
              <div className="w-full bg-gray-50 rounded-full flex items-center justify-center py-2 mb-8 group-hover:bg-primary-50 transition-colors p-2">
                <Music className="w-6 h-6 text-gray-700 group-hover:text-primary-600" />
              </div>
              <h3 className="text-xl font-serif mb-4">Gower Harmony Choir</h3>
              <p className="text-gray-600 mb-8 text-sm leading-relaxed text-left">
                Beautiful harmonies and community singing led by Kate Davies.
              </p>
              <div className="mt-auto flex flex-col gap-2 w-full">
                <a
                  href="https://katedaviessinging.co.uk"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-base font-medium text-gray-600 hover:text-gray-800 flex items-center group/link transition-colors p-2"
                >
                  katedaviessinging.co.uk <span className="ml-1 transform group-hover/link:translate-x-1 transition-transform">→</span>
                </a>
                <a
                  href="https://www.facebook.com/katedaviessinging"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-600 hover:text-blue-600 transition-colors p-2 flex items-center gap-2"
                  aria-label="Facebook"
                >
                  <Facebook className="w-6 h-6" />
                  <span className="text-base font-medium">View Facebook page</span>
                </a>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Join Friends Email Modal */}
      {
        showFriendsModal && createPortal(
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
              onClick={handleCloseFriendsModal}
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
              {/* Green header strip */}
              <div
                className="text-center"
                style={{
                  padding: '2rem 2rem 1.5rem',
                  background: 'linear-gradient(135deg, #3d5a3e 0%, #5a7d52 100%)',
                }}
              >
                <button
                  onClick={handleCloseFriendsModal}
                  className="rounded-lg"
                  style={{
                    position: 'absolute',
                    top: '0.75rem',
                    right: '0.75rem',
                    padding: '0.375rem',
                    color: 'rgba(255, 255, 255, 0.7)',
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
                  Welcome to Friends of<br />Gower Village Hall
                </h3>
                <p style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '0.875rem', marginTop: '0.5rem' }}>
                  Join our community and stay connected
                </p>
              </div>

              {/* Form area */}
              <div style={{ padding: '1.5rem 2rem' }}>
                {friendsSubmitted ? (
                  <div className="text-center" style={{ padding: '1rem 0' }}>
                    <div
                      className="rounded-full flex items-center justify-center mx-auto mb-4"
                      style={{ width: '3.5rem', height: '3.5rem', backgroundColor: '#dcfce7' }}
                    >
                      <CheckCircle style={{ width: '1.75rem', height: '1.75rem', color: '#16a34a' }} />
                    </div>
                    <h4 style={{ fontSize: '1.125rem', fontWeight: 600, color: '#111827', marginBottom: '0.5rem' }}>
                      Welcome Aboard!
                    </h4>
                    <p className="text-sm leading-relaxed" style={{ color: '#4b5563' }}>
                      Thank you for your interest! We'll be in touch soon with more
                      information about upcoming events and how you can get involved.
                    </p>
                    <button
                      onClick={handleCloseFriendsModal}
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
                      Enter your details below and we'll keep you updated on community news,
                      events, and hall activities.
                    </p>

                    {friendsError && (
                      <div className="rounded-lg" style={{ marginBottom: '1rem', padding: '0.75rem', backgroundColor: '#fef2f2', border: '1px solid #fecaca' }}>
                        <p className="text-sm" style={{ color: '#b91c1c' }}>{friendsError}</p>
                      </div>
                    )}

                    <form
                      onSubmit={handleFriendsSubmit}
                      className="flex flex-col"
                      style={{ marginTop: '1rem', gap: '1rem' }}
                    >
                      <div>
                        <label
                          htmlFor="friends-name"
                          className="block text-sm"
                          style={{ marginBottom: '0.375rem', color: '#374151', fontWeight: 500 }}
                        >
                          Name
                        </label>
                        <input
                          type="text"
                          id="friends-name"
                          value={friendsName}
                          onChange={(e) => setFriendsName(e.target.value)}
                          placeholder="Your name"
                          className="w-full border border-gray-200 rounded-lg text-sm"
                          style={{
                            padding: '0.75rem 1rem',
                            backgroundColor: '#f9fafb',
                            outline: 'none',
                          }}
                          disabled={friendsSubmitting}
                        />
                      </div>
                      <div>
                        <label
                          htmlFor="friends-email"
                          className="block text-sm"
                          style={{ marginBottom: '0.375rem', color: '#374151', fontWeight: 500 }}
                        >
                          Email Address <span style={{ color: '#ef4444' }}>*</span>
                        </label>
                        <input
                          type="email"
                          id="friends-email"
                          value={friendsEmail}
                          onChange={(e) => setFriendsEmail(e.target.value)}
                          placeholder="your@email.com"
                          className="w-full border border-gray-200 rounded-lg text-sm"
                          style={{
                            padding: '0.75rem 1rem',
                            backgroundColor: '#f9fafb',
                            outline: 'none',
                          }}
                          required
                          disabled={friendsSubmitting}
                        />
                      </div>
                      <button
                        type="submit"
                        disabled={friendsSubmitting}
                        className="w-full rounded-lg text-sm flex items-center justify-center gap-4"
                        style={{
                          marginTop: '0.5rem',
                          padding: '0.75rem 1.5rem',
                          backgroundColor: '#3d5a3e',
                          color: 'white',
                          fontWeight: 500,
                          border: 'none',
                          cursor: friendsSubmitting ? 'not-allowed' : 'pointer',
                          opacity: friendsSubmitting ? 0.6 : 1,
                        }}
                        onMouseEnter={(e) => {
                          if (!friendsSubmitting) (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#4a6741';
                        }}
                        onMouseLeave={(e) => {
                          (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#3d5a3e';
                        }}
                      >
                        {friendsSubmitting ? (
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
        )
      }

    </div >
  );
}