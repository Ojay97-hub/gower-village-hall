import { Clock, Mail, MapPin } from "lucide-react";
import { What3WordsMap } from "../components/What3WordsMap";

export function Contact() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative h-64 overflow-hidden bg-primary-600">
        <div className="absolute inset-0 flex items-center">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-white">
            <h1 className="text-white">Contact Us</h1>
            <p className="text-xl mt-2">
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

          {/* What3Words Banner */}
          <div className="mt-6 bg-primary-50 rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-semibold mb-1">What3Words Location</h3>
              <p className="text-gray-600 text-sm">
                For easy navigation, you can find us using What3Words
              </p>
            </div>
            <a
              href="https://what3words.com/listed.wisdom.dividers"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-white border border-primary-200 text-primary-700 font-semibold px-5 py-2.5 rounded-xl hover:bg-primary-100 transition-colors text-sm"
            >
              <span>///</span>listed.wisdom.dividers
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}