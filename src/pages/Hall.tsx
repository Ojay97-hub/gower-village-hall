import { useState, useEffect, useCallback, FormEvent } from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import { BookingCalendar } from '../components/hall/BookingCalendar';
import { Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext, type CarouselApi } from '../components/ui/carousel';
import '../components/hall/BookingCalendar.css';
import { Clock, Car, Music, Palette, Coffee, PoundSterling, X, CheckCircle, XCircle, Loader2, Mail, Users, Facebook, Sunrise, Sun, Moon, CalendarDays, ArrowRight, ExternalLink } from 'lucide-react';

const hallGateEntrance = '/images/edited-hall-gate.webp';
const hallSideView = '/images/edited-side-hall.webp';

const hallGallerySlides = [
  {
    src: '/images/hall-in-view.jpeg',
    alt: 'Main hall interior looking towards the stage end, with wooden floor and chairs along both sides',
    label: 'Main Hall',
    isFloorPlan: false,
  },
  {
    src: '/images/hall-out-view.jpeg',
    alt: 'Main hall interior looking back towards the entrance end with vaulted ceiling',
    label: 'Main Hall — Full Length',
    isFloorPlan: false,
  },
  {
    src: '/images/fire-exit.jpeg',
    alt: 'Exit door with views over the Gower countryside and sea',
    label: 'Sea Views',
    isFloorPlan: false,
  },
  {
    src: '/images/kitchen-left.jpeg',
    alt: 'Commercial kitchen with stainless steel island, range cooker, and preparation surfaces',
    label: 'Kitchen',
    isFloorPlan: false,
  },
  {
    src: '/images/kitchen-right.jpeg',
    alt: 'Kitchen with stainless steel surfaces, sink area and storage units',
    label: 'Kitchen Facilities',
    isFloorPlan: false,
  },
  {
    src: '/images/tables.jpeg',
    alt: 'Storage area with folding tables on trolleys and stacked chairs',
    label: 'Tables & Storage',
    isFloorPlan: false,
  },
  {
    src: '/images/entrance-view.jpeg',
    alt: 'Front of the village hall with wheelchair access ramp, defibrillator and sea views behind',
    label: 'Hall Entrance',
    isFloorPlan: false,
  },
  {
    src: '/images/hall-floor-plan.png',
    alt: 'Village Hall Floor Plan showing main hall with max capacity of 80, kitchen, male and female W/C, disabled W/C, south facing lawn, ramp access, and defibrillator location',
    label: 'Floor Plan',
    isFloorPlan: true,
  },
];

export function Hall() {
  // Gallery carousel state
  const [carouselApi, setCarouselApi] = useState<CarouselApi>();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [slideCount, setSlideCount] = useState(0);

  useEffect(() => {
    if (!carouselApi) return;
    setSlideCount(carouselApi.scrollSnapList().length);
    setCurrentSlide(carouselApi.selectedScrollSnap());
    carouselApi.on('select', () => {
      setCurrentSlide(carouselApi.selectedScrollSnap());
    });
  }, [carouselApi]);

  // Booking form state
  const [bookingForm, setBookingForm] = useState({
    name: '',
    email: '',
    phone: '',
    date: '',
    endDate: '',
    sessions: [] as ('morning' | 'afternoon' | 'evening' | 'allday')[],
    details: '',
  });
  const [bookedSessions, setBookedSessions] = useState<Set<string>>(new Set());

  const handleBookedSessionsChange = useCallback((sessions: Set<string>) => {
    setBookedSessions(sessions);
  }, []);

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
    if (bookingForm.sessions.length === 0) {
      console.warn('[BookingForm] Validation failed: no session selected');
      setBookingStatus('error');
      setBookingError('Please select at least one session time.');
      setBookingSubmitting(false);
      return;
    }

    const SESSION_LABELS: Record<string, string> = {
      morning: 'Morning',
      afternoon: 'Afternoon',
      evening: 'Evening',
      allday: 'All Day',
    };
    const conflicts = bookingForm.sessions.filter(s => bookedSessions.has(s));
    if (conflicts.length > 0) {
      console.warn('[BookingForm] Validation failed: session conflicts:', conflicts);
      setBookingStatus('error');
      const conflictLabels = conflicts.map(c => SESSION_LABELS[c]).join(', ');
      setBookingError(
        conflicts.length > 1
          ? `These sessions are already booked on your selected date(s): ${conflictLabels}. Please choose different sessions.`
          : `The ${conflictLabels} session is already booked on your selected date(s). Please choose a different session.`
      );
      setBookingSubmitting(false);
      return;
    }

    const payload = {
      name: bookingForm.name.trim(),
      email: bookingForm.email.trim(),
      phone: bookingForm.phone.trim() || '',
      date: bookingForm.date,
      endDate: bookingForm.endDate || '',
      session: bookingForm.sessions.join(', '),
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

      let data: { success?: boolean; error?: string } = {};
      try {
        data = await response.json();
      } catch {
        // response body was empty or non-JSON
      }

      if (response.ok && data.success) {
        setBookingStatus('success');
        setBookingForm({ name: '', email: '', phone: '', date: '', endDate: '', sessions: [], details: '' });
      } else {
        setBookingStatus('error');
        setBookingError(data.error || 'Something went wrong. Please try again.');
      }
    } catch (err) {
      console.error('[BookingForm] Network error:', err);
      setBookingStatus('error');
      setBookingError('Something went wrong sending your enquiry. Please try again or contact us directly.');
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

        {/* ===== SECTION 1: Floor Plan + Booking Info ===== */}
        <div className="mb-16 pt-8">
          {/* Gallery Carousel: Interior + Floor Plan */}
          <div className="mb-10">
            <div className="text-left max-w-3xl mb-8">
              <h2 className="mb-4">Hall Interior and Floor Plan</h2>
              <p className="text-lg text-gray-700 leading-relaxed">
                Explore the interior of our village hall and view the floor plan including facilities, access points, and capacity information.
              </p>
            </div>
            <div className="bg-white rounded-2xl p-6 md:p-8 border border-gray-200 shadow-sm">
              <Carousel
                setApi={setCarouselApi}
                opts={{ loop: true }}
                className="w-full"
              >
                <CarouselContent>
                  {hallGallerySlides.map((slide, index) => (
                    <CarouselItem key={index}>
                      <div className="relative overflow-hidden rounded-lg">
                        <img
                          src={slide.src}
                          alt={slide.alt}
                          className={`w-full rounded-lg ${
                            slide.isFloorPlan
                              ? 'h-auto object-contain bg-gray-50'
                              : 'h-[340px] sm:h-[480px] object-cover'
                          }`}
                          style={slide.isFloorPlan ? { maxWidth: '800px', margin: '0 auto', display: 'block' } : {}}
                          loading="lazy"
                        />
                        <span className="absolute bottom-3 left-3 bg-black/50 text-white text-xs font-medium px-3 py-1 rounded-full backdrop-blur-sm">
                          {slide.label}
                        </span>
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <CarouselPrevious className="left-3 bg-white/80 hover:bg-white border-gray-300 shadow-sm" />
                <CarouselNext className="right-3 bg-white/80 hover:bg-white border-gray-300 shadow-sm" />
              </Carousel>
              {slideCount > 1 && (
                <div className="flex justify-center gap-2 mt-4">
                  {Array.from({ length: slideCount }).map((_, i) => (
                    <button
                      key={i}
                      onClick={() => carouselApi?.scrollTo(i)}
                      className={`w-2 h-2 rounded-full transition-colors ${
                        i === currentSlide ? 'bg-gray-700' : 'bg-gray-300'
                      }`}
                      aria-label={`Go to slide ${i + 1}`}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Booking Info Cards - Underneath Floor Plan */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Opening Hours Card */}
            <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
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
            <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
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
            <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
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
            <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <span className="text-2xl text-gray-700 font-semibold">80</span>
              </div>
              <h3 className="mb-3">Capacity</h3>
              <p className="text-gray-600 text-sm">
                Max capacity: 80
              </p>
            </div>
          </div>
        </div>

        {/* ===== SECTION 2: Booking Calendar + Booking Form ===== */}
        <div id="booking" className="mb-16 pt-8">
          <div className="text-left max-w-3xl mb-12">
            <h2 className="mb-6">Book the Hall</h2>
            <p className="text-lg text-gray-700 leading-relaxed">
              Our village hall is available for hire for a variety of events including parties,
              meetings, workshops, and celebrations. Check availability below and submit your enquiry.
            </p>
          </div>

          <div className="flex flex-col gap-6">
            {/* Combined booking card */}
            <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-lg">
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

              <form className="space-y-5" onSubmit={handleBookingSubmit} noValidate>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
                </div>

                {/* Selected Date(s) — calendar embedded inline */}
                <div>
                  <label className="block text-sm mb-2 text-gray-700 font-medium">
                    Selected Date(s) <span className="text-red-500">*</span>
                  </label>
                  <BookingCalendar
                    selectedDate={bookingForm.date}
                    selectedEndDate={bookingForm.endDate}
                    onDateSelect={(date, endDate) => setBookingForm(prev => ({ ...prev, date, endDate }))}
                    onBookedSessionsChange={handleBookedSessionsChange}
                  />
                </div>

                {/* Session Time Selector */}
                <div>
                  <label className="block text-sm mb-2 text-gray-700 font-medium">
                    Session Time <span className="text-red-500">*</span>
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {[
                      { value: 'morning', label: 'Morning', Icon: Sunrise, desc: '8am – 12pm' },
                      { value: 'afternoon', label: 'Afternoon', Icon: Sun, desc: '12pm – 5pm' },
                      { value: 'evening', label: 'Evening', Icon: Moon, desc: '5pm – 10pm' },
                      { value: 'allday', label: 'All Day', Icon: CalendarDays, desc: 'Full day' },
                    ].map(opt => {
                      const isTaken = bookedSessions.has(opt.value);
                      const isSelected = bookingForm.sessions.includes(opt.value as 'morning' | 'afternoon' | 'evening' | 'allday');
                      return (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => {
                            if (isTaken) return;
                            setBookingForm(prev => {
                              const val = opt.value as 'morning' | 'afternoon' | 'evening' | 'allday';
                              if (val === 'allday') {
                                return { ...prev, sessions: prev.sessions.includes('allday') ? [] : ['allday'] };
                              }
                              const without = prev.sessions.filter(s => s !== 'allday');
                              return {
                                ...prev,
                                sessions: without.includes(val) ? without.filter(s => s !== val) : [...without, val],
                              };
                            });
                          }}
                          disabled={bookingSubmitting || isTaken}
                          className={`flex flex-col items-center gap-1 px-3 py-3 rounded-lg border-2 transition-all text-center ${
                            isTaken
                              ? 'border-gray-200 bg-gray-50 text-gray-300 cursor-not-allowed'
                              : isSelected
                                ? 'border-primary-500 bg-primary-50 text-primary-800 shadow-sm cursor-pointer'
                                : 'border-gray-200 bg-gray-50 text-gray-600 hover:border-gray-300 hover:bg-white cursor-pointer'
                          } disabled:opacity-100`}
                        >
                          <opt.Icon className="w-5 h-5" />
                          <span className="text-xs font-semibold">{opt.label}</span>
                          <span className="text-[0.65rem] opacity-70">{isTaken ? 'Unavailable' : opt.desc}</span>
                        </button>
                      );
                    })}
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

                {/* Booking summary confirmation */}
                {(bookingForm.date || bookingForm.sessions.length > 0) && (
                  <div className="text-xs text-gray-500 bg-gray-50 border border-gray-100 rounded-lg px-4 py-3 space-y-1">
                    <p className="font-medium text-gray-600 mb-1">You're enquiring about:</p>
                    {bookingForm.date && (
                      <p>
                        <span className="text-gray-400">Date: </span>
                        {new Date(bookingForm.date + 'T00:00:00').toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'long', year: 'numeric' })}
                        {bookingForm.endDate && (
                          <> → {new Date(bookingForm.endDate + 'T00:00:00').toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'long', year: 'numeric' })}</>
                        )}
                      </p>
                    )}
                    {bookingForm.sessions.length > 0 && (
                      <p>
                        <span className="text-gray-400">Session: </span>
                        {bookingForm.sessions.map(s => ({
                          morning: 'Morning (8am – 12pm)',
                          afternoon: 'Afternoon (12pm – 5pm)',
                          evening: 'Evening (5pm – 10pm)',
                          allday: 'All Day',
                        }[s])).join(' + ')}
                      </p>
                    )}
                  </div>
                )}

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
            <div className="bg-white p-6 text-center rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center">
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

        {/* Activities Section */}
        <div id="activities" className="mb-20 pt-6">
          <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div className="max-w-2xl">
              <h2 className="mb-2">Regular Activities</h2>
              <p className="text-sm leading-6 text-gray-600">
                Friendly monthly meetups, creative sessions, and community singing at the hall.
              </p>
            </div>
            <Link
              to="/hall/events"
              className="inline-flex items-center gap-2 self-start rounded-lg bg-primary-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-primary-700"
            >
              <CalendarDays className="h-4 w-4" />
              View Schedule
            </Link>
          </div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <div className="group flex h-full flex-col rounded-2xl border border-gray-200 bg-white p-7 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md">
              <div className="mb-6 inline-flex h-11 w-11 items-center justify-center rounded-full bg-primary-50 text-primary-700 transition-colors group-hover:bg-primary-100">
                <Coffee className="h-5 w-5" />
              </div>
              <div className="flex flex-1 flex-col">
                <h3 className="mb-3 font-serif text-lg font-semibold text-gray-800">Village Coffee Mornings</h3>
                <p className="mb-6 text-sm leading-6 text-gray-600">
                  Join us for friendly coffee mornings with homemade cakes and good conversation.
                </p>
                <div className="mt-auto flex flex-col items-start gap-4">
                  <p className="rounded-full bg-primary-50 px-4 py-2 text-sm font-medium text-primary-800">
                    First Saturday, 10:30 - 12:30
                  </p>
                  <Link
                    to="/hall/coffee-morning"
                    className="inline-flex items-center gap-2 text-sm font-medium text-primary-700 transition-colors hover:text-primary-800"
                  >
                    Find out more
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            </div>

            <div className="group flex h-full flex-col rounded-2xl border border-gray-200 bg-white p-7 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md">
              <div className="mb-6 flex items-start justify-between gap-4">
                <div className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-primary-50 text-primary-700 transition-colors group-hover:bg-primary-100">
                  <Palette className="h-5 w-5" />
                </div>
                <p className="inline-flex w-fit rounded-full bg-amber-50 px-3 py-1.5 text-xs font-medium text-amber-800">
                  Coming soon
                </p>
              </div>
              <div className="flex flex-1 flex-col">
                <h3 className="mb-3 font-serif text-lg font-semibold text-gray-800">Art Classes</h3>
                <p className="mb-5 text-sm leading-6 text-gray-600">
                  Creative art sessions for all skill levels in a welcoming environment.
                </p>
                <p className="mb-6 text-sm leading-6 text-gray-500">
                  No sessions are currently scheduled, but new dates are being planned.
                </p>
                <div className="mt-auto">
                  <Link to="/hall/events" className="inline-flex items-center gap-2 text-sm font-medium text-primary-700 transition-colors hover:text-primary-800">
                    Check schedule
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            </div>

            <div className="group flex h-full flex-col rounded-2xl border border-gray-200 bg-white p-7 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md">
              <div className="mb-6 inline-flex h-11 w-11 items-center justify-center rounded-full bg-primary-50 text-primary-700 transition-colors group-hover:bg-primary-100">
                <Music className="h-5 w-5" />
              </div>
              <div className="flex flex-1 flex-col">
                <h3 className="mb-3 font-serif text-lg font-semibold text-gray-800">Gower Harmony Choir</h3>
                <p className="mb-6 text-sm leading-6 text-gray-600">
                  Beautiful harmonies and community singing led by Kate Davies.
                </p>
                <div className="mt-auto flex flex-col gap-3">
                  <a
                    href="https://katedaviessinging.co.uk"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-sm font-medium text-primary-700 transition-colors hover:text-primary-800"
                  >
                    Visit website
                    <ExternalLink className="h-4 w-4" />
                  </a>
                  <a
                    href="https://www.facebook.com/katedaviessinging"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 transition-colors hover:text-blue-700"
                    aria-label="Facebook"
                  >
                    <Facebook className="h-4 w-4" />
                    View Facebook page
                  </a>
                </div>
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
                  Welcome to Friends of<br />Penmaen and Nicholaston VH
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
