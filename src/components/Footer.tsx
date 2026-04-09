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
    <footer className="bg-primary-800 mt-16 sm:mt-24">
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8">

          {/* Brand & Intro */}
          <div className="lg:col-span-2">
            <h3 className="text-xl sm:text-2xl font-bold text-white mb-4 font-serif">
              Penmaen & Nicholaston Village Hall
            </h3>
            <p className="text-white/90 text-sm sm:text-base leading-relaxed max-w-md">
              A community hub serving the villages near Tor Bay
              and 3 Cliffs on the beautiful Gower Peninsula,
              South Wales.
            </p>
          </div>

          {/* Contact Details */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-widest mb-6">
              Contact
            </h4>
            <div className="space-y-4 text-sm text-white/90">
              <div className="flex items-start space-x-3">
                <MapPin className="w-5 h-5 text-white/70 flex-shrink-0" />
                <div>
                  <p>Penmaen Parish Hall</p>
                  <p>Penmaen, Gower</p>
                  <p>South Wales SA3 2HH</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <Mail className="w-5 h-5 text-white/70 flex-shrink-0" />
                <a
                  href="mailto:info@penmaenvillagehall.org"
                  className="hover:text-white transition-colors"
                >
                  info@penmaenvillagehall.org
                </a>
              </div>
            </div>
          </div>

          {/* Charity Information */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-widest mb-6">
              Charity Info
            </h4>
            <div className="space-y-4 text-sm text-white/90 flex flex-col items-start">
              <p>Registered Charity</p>
              <div className="flex items-center space-x-2">
                <span>Charity Number:</span>
                <a
                  href="https://register-of-charities.charitycommission.gov.uk/charity-details/?regid=1081661&subid=0"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors flex items-center font-medium underline underline-offset-4"
                >
                  1081661
                  <ExternalLink className="w-3 h-3 ml-1.5 flex-shrink-0" />
                </a>
              </div>
            </div>
          </div>

        </div>

        {/* Footer Bottom / Copyright */}
        <div className="mt-12 lg:mt-16 pt-8 border-t border-white/20 flex flex-col md:flex-row justify-between items-center text-sm text-white/80 gap-4">
          <p>
            &copy; 2026 Nova Forma Designs Ltd. All rights reserved.
          </p>
          <div className="flex items-center space-x-6">
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors">Terms Conditions</a>
            <a href="#" className="hover:text-white transition-colors">Cookies</a>
          </div>
        </div>
      </div>
    </footer>
  );
}