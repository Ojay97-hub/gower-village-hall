import { Clock, Mail, MapPin } from "lucide-react";
import { What3WordsMap } from "../components/What3WordsMap";

export function Contact() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-primary-300">
        <div className="flex items-center px-4 sm:px-6 lg:px-12 py-16 lg:py-24">
          <div className="max-w-7xl mx-auto">
            <h1>Contact Us</h1>
            <p className="text-xl text-gray-800 mt-2">
              Get in touch with the village hall
            </p>
          </div>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Full-width Map */}
          <div className="overflow-hidden shadow-lg mb-14" style={{ height: "550px" }}>
            <What3WordsMap />
          </div>

          {/* Detail Cards - 3 Column Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8">
            {/* Address Card */}
            <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-primary-600" />
                </div>
                <h3 className="text-lg font-semibold">Address</h3>
              </div>
              <p className="text-gray-600 text-sm leading-relaxed">
                Penmaen Parish Hall
                <br />
                Penmaen
                <br />
                Gower, Swansea
                <br />
                SA3 2HH
              </p>
            </div>

            {/* Contact Details Card */}
            <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
                  <Mail className="w-5 h-5 text-primary-600" />
                </div>
                <h3 className="text-lg font-semibold">Get In Touch</h3>
              </div>
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Email</p>
                  <a
                    href="mailto:info@penmaenvillagehall.org"
                    className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                  >
                    info@penmaenvillagehall.org
                  </a>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Phone</p>
                  <a
                    href="tel:01792123456"
                    className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                  >
                    01792 123 456
                  </a>
                </div>
              </div>
            </div>

            {/* Office Hours Card */}
            <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
                  <Clock className="w-5 h-5 text-primary-600" />
                </div>
                <h3 className="text-lg font-semibold">Office Hours</h3>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-gray-700">
                  <span>Monday – Friday</span>
                  <span className="font-medium">9:00 AM – 5:00 PM</span>
                </div>
                <div className="flex justify-between text-gray-700">
                  <span>Saturday</span>
                  <span className="font-medium">10:00 AM – 2:00 PM</span>
                </div>
                <div className="flex justify-between text-gray-700">
                  <span>Sunday</span>
                  <span className="font-medium">Closed</span>
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-4">
                * Hall bookings available outside these hours
              </p>
            </div>
          </div>

          {/* Directions / Navigation Banner */}
          <div className="mt-8 relative overflow-hidden bg-white border border-gray-200 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
            {/* Background design elements */}
            <div className="absolute top-0 right-0 -mt-16 -mr-16 w-64 h-64 bg-primary-50 rounded-full blur-3xl opacity-60 pointer-events-none"></div>

            <div className="relative z-10 p-6 sm:p-8 md:p-10 flex flex-col xl:flex-row items-center xl:items-stretch justify-between gap-8 xl:gap-12">

              {/* Left Column: Information & what3words */}
              <div className="w-full xl:w-5/12 flex flex-col justify-center text-center xl:text-left">
                <h3 className="text-2xl font-bold text-gray-900 mb-3">Find Us Easily</h3>
                <p className="text-gray-600 mb-6 max-w-lg mx-auto xl:mx-0">
                  We use what3words to mark our exact location. Click below to view on the what3words map, or navigate using your preferred app.
                </p>
                <div className="flex justify-center xl:justify-start">
                  <a
                    href="https://what3words.com/listed.wisdom.dividers"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-3 bg-[#E11C2B]/10 border border-[#E11C2B]/20 px-6 py-4 rounded-2xl hover:bg-[#E11C2B] hover:text-white transition-all duration-300 group"
                  >
                    <span className="text-[#E11C2B] group-hover:text-white font-bold text-xl tracking-wider">///</span>
                    <span className="font-semibold text-[#E11C2B] group-hover:text-white">listed.wisdom.dividers</span>
                  </a>
                </div>
              </div>

              {/* Divider for xl screens */}
              <div className="hidden xl:block w-px bg-gray-200 my-4"></div>

              {/* Right Column: Navigation Apps */}
              <div className="w-full xl:w-7/12 flex flex-col justify-center">
                <p className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-4 text-center xl:text-left">
                  Open in Maps
                </p>
                <div className="flex flex-row flex-wrap justify-center xl:justify-start gap-4">
                  {/* Google Maps */}
                  <a
                    href="https://www.google.com/maps/dir/?api=1&destination=51.575396,-4.129141"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex flex-row items-center gap-3 bg-white border border-gray-200 text-gray-800 font-semibold px-6 py-4 rounded-xl shadow-sm hover:border-blue-300 hover:text-blue-600 hover:shadow-md hover:-translate-y-0.5 transition-all"
                  >
                    <svg className="w-6 h-6 flex-shrink-0" viewBox="0 0 92 92" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M46 10c-14.36 0-26 11.64-26 26 0 6.5 2.38 12.45 6.32 17.02L46 82l19.68-28.98A25.88 25.88 0 0072 36c0-14.36-11.64-26-26-26z" fill="#4285F4" />
                      <path d="M46 10v72l19.68-28.98A25.88 25.88 0 0072 36c0-14.36-11.64-26-26-26z" fill="#34A853" />
                      <path d="M20 36c0-6.5 2.38-12.45 6.32-17.02L46 10 26.32 53.02A25.88 25.88 0 0120 36z" fill="#FBBC04" />
                      <path d="M26.32 18.98A25.88 25.88 0 0146 10L26.32 53.02 20 36c0-6.5 2.38-12.45 6.32-17.02z" fill="#EA4335" />
                      <circle cx="46" cy="36" r="9" fill="white" />
                    </svg>
                    <span>Google Maps</span>
                  </a>

                  {/* Apple Maps */}
                  <a
                    href="https://maps.apple.com/?daddr=51.575396,-4.129141&dirflg=d"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex flex-row items-center gap-3 bg-white border border-gray-200 text-gray-800 font-semibold px-6 py-4 rounded-xl shadow-sm hover:border-gray-400 hover:shadow-md hover:-translate-y-0.5 transition-all"
                  >
                    <svg className="w-6 h-6 flex-shrink-0" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 2C7.58 2 4 5.58 4 10c0 5.5 8 12 8 12s8-6.5 8-12c0-4.42-3.58-8-8-8z" fill="#28CD41" />
                      <path d="M12 2v20s8-6.5 8-12c0-4.42-3.58-8-8-8z" fill="#00A818" />
                      <circle cx="12" cy="10" r="3.5" fill="white" />
                      <path d="M12 7.5l1.5 2.5H10.5L12 7.5z" fill="#28CD41" />
                    </svg>
                    <span>Apple Maps</span>
                  </a>

                  {/* Waze */}
                  <a
                    href="https://www.waze.com/ul?ll=51.575396,-4.129141&navigate=yes"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex flex-row items-center gap-3 bg-white border border-gray-200 text-gray-800 font-semibold px-6 py-4 rounded-xl shadow-sm hover:border-sky-300 hover:text-sky-600 hover:shadow-md hover:-translate-y-0.5 transition-all"
                  >
                    <svg className="w-6 h-6 flex-shrink-0" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 2C7 2 3 6 3 11c0 2.5 1 4.8 2.6 6.4.4.4.4 1.2 0 1.6-.8.8-.2 2 1 2h10.8c1.2 0 1.8-1.2 1-2-.4-.4-.4-1.2 0-1.6C20 15.8 21 13.5 21 11c0-5-4-9-9-9z" fill="#33CCFF" />
                      <circle cx="9" cy="10" r="1.5" fill="#333" />
                      <circle cx="15" cy="10" r="1.5" fill="#333" />
                      <path d="M9 14c0 0 1.5 2 3 2s3-2 3-2" stroke="#333" strokeWidth="1.5" strokeLinecap="round" fill="none" />
                    </svg>
                    <span>Waze</span>
                  </a>
                </div>
              </div>

            </div>
          </div>
        </div>
      </section>
    </div>
  );
}