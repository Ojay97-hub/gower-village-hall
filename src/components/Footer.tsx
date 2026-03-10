import { MapPin, Mail, ExternalLink } from "lucide-react";

// Illustration Components (SVG Icons)
const CliffIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 120 50" className={className} fill="currentColor" preserveAspectRatio="none">
    <path d="M0 50 L20 15 L35 30 L55 5 L80 35 L95 20 L120 50 Z" />
  </svg>
);

const TreeIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 40 60" className={className} fill="currentColor">
    <path d="M20 0 L40 25 L30 25 L40 45 L0 45 L10 25 L0 25 Z" />
    <rect x="16" y="45" width="8" height="15" />
  </svg>
);

const ThreeCliffsIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 200 60" className={className} fill="currentColor">
    <path d="M0 60 L30 15 L50 40 L80 5 L110 40 L140 20 L200 60 Z" />
  </svg>
);

const BirdIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 30 20" className={className} fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 12 Q 8 2, 15 12 Q 22 2, 28 12" />
  </svg>
);

export function Footer() {
  return (
    <footer className="bg-white">
      {/* Seamless Transition Illustration Area */}
      <div className="w-full overflow-hidden relative pt-16 mt-16 sm:mt-24">
        {/* Baseline */}
        <div className="absolute bottom-0 left-0 w-full h-1 sm:h-1.5 bg-primary-800 z-0" />

        {/* Symbols */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-end justify-between relative z-10 text-primary-800 h-24">
          {/* Left side scene */}
          <div className="flex items-end flex-shrink-0 -mb-[1px]">
            <TreeIcon className="w-5 sm:w-8 h-10 sm:h-14" />
            <TreeIcon className="w-4 sm:w-6 h-8 sm:h-10 ml-1 sm:ml-2" />
            <CliffIcon className="w-20 sm:w-32 h-8 sm:h-12 ml-4 sm:ml-8" />
          </div>

          {/* Center / Sky - Birds */}
          <div className="hidden sm:flex absolute left-1/2 top-4 -translate-x-1/2 space-x-12 opacity-80">
            <div className="mt-8">
              <BirdIcon className="w-6 h-4 text-primary-700" />
            </div>
            <div className="mt-2">
              <BirdIcon className="w-8 h-5 text-primary-600" />
            </div>
            <div className="mt-6">
              <BirdIcon className="w-5 h-3 text-primary-700" />
            </div>
          </div>

          {/* Right side scene (Three Cliffs bay metaphor) */}
          <div className="flex items-end flex-shrink-0 -mb-[1px]">
            <ThreeCliffsIcon className="w-24 sm:w-48 h-12 sm:h-20" />
            <TreeIcon className="w-6 sm:w-10 h-10 sm:h-16 ml-4 sm:ml-6" />
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8">

          {/* Brand & Intro */}
          <div className="lg:col-span-2">
            <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 font-serif">
              Penmaen & Nicholaston Village Hall
            </h3>
            <p className="text-gray-600 text-sm sm:text-base leading-relaxed max-w-md">
              A community hub serving the villages near Tor Bay
              and 3 Cliffs on the beautiful Gower Peninsula,
              South Wales.
            </p>
          </div>

          {/* Contact Details */}
          <div>
            <h4 className="text-xs font-bold text-gray-900 uppercase tracking-widest mb-6">
              Contact
            </h4>
            <div className="space-y-4 text-sm text-gray-600">
              <div className="flex items-start space-x-3">
                <MapPin className="w-5 h-5 text-primary-600 flex-shrink-0" />
                <div>
                  <p>Penmaen Parish Hall</p>
                  <p>Penmaen, Gower</p>
                  <p>South Wales SA3 2HH</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <Mail className="w-5 h-5 text-primary-600 flex-shrink-0" />
                <a
                  href="mailto:info@penmaenvillagehall.org"
                  className="hover:text-primary-600 transition-colors"
                >
                  info@penmaenvillagehall.org
                </a>
              </div>
            </div>
          </div>

          {/* Charity Information */}
          <div>
            <h4 className="text-xs font-bold text-gray-900 uppercase tracking-widest mb-6">
              Charity Info
            </h4>
            <div className="space-y-4 text-sm text-gray-600 flex flex-col items-start">
              <p>Registered Charity</p>
              <div className="flex items-center space-x-2">
                <span>Charity Number:</span>
                <a
                  href="https://register-of-charities.charitycommission.gov.uk/charity-details/?regid=1081661&subid=0"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-primary-600 transition-colors flex items-center font-medium underline underline-offset-4"
                >
                  1081661
                  <ExternalLink className="w-3 h-3 ml-1.5 flex-shrink-0" />
                </a>
              </div>
            </div>
          </div>

        </div>

        {/* Footer Bottom / Copyright */}
        <div className="mt-12 lg:mt-16 pt-8 border-t border-gray-200 flex flex-col md:flex-row justify-between items-center text-sm text-gray-500 gap-4">
          <p>
            &copy; 2026 Nova Forma Designs Ltd. All rights reserved.
          </p>
          <div className="flex items-center space-x-6">
            <a href="#" className="hover:text-gray-900 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-gray-900 transition-colors">Terms Conditions</a>
            <a href="#" className="hover:text-gray-900 transition-colors">Cookies</a>
          </div>
        </div>
      </div>
    </footer>
  );
}