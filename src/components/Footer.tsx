import { MapPin, Mail, ExternalLink } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-primary-600 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="mb-4 text-white">
              Penmaen & Nicholaston Village Hall
            </h3>
            <p className="text-primary-100 text-sm leading-relaxed">
              A community hub serving the villages near Tor Bay
              and 3 Cliffs on the beautiful Gower Peninsula,
              South Wales.
            </p>
          </div>

          <div>
            <h4 className="mb-4 text-white">Contact</h4>
            <div className="space-y-3 text-sm">
              <div className="flex items-start space-x-2">
                <MapPin className="w-4 h-4 mt-1 flex-shrink-0" />
                <div>
                  <p className="text-primary-100">
                    Penmaen Parish Hall
                  </p>
                  <p className="text-primary-100">
                    Penmaen, Gower
                  </p>
                  <p className="text-primary-100">
                    South Wales SA3 2HH
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-2">
                <Mail className="w-4 h-4 mt-1 flex-shrink-0" />
                <a
                  href="mailto:info@penmaenvillagehall.org"
                  className="text-primary-100 hover:text-white"
                >
                  info@penmaenvillagehall.org
                </a>
              </div>
            </div>
          </div>

          <div>
            <h4 className="mb-4 text-white">
              Charity Information
            </h4>
            <p className="text-primary-100 text-sm mb-2">
              Registered Charity
            </p>
            <div className="flex items-center space-x-2 mt-auto">
              <span className="text-sm text-primary-100">
                Charity Number:
              </span>
              <a
                href="https://register-of-charities.charitycommission.gov.uk/charity-details/?regid=1081661&subid=0"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-primary-100 hover:text-white flex items-center underline"
              >
                1081661
                <ExternalLink className="w-3 h-3 ml-1" />
              </a>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-primary-500 text-center text-primary-100 text-sm">
          <p className="mb-1">
            &copy; 2026 Nova Forma Designs Ltd. All rights
            reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}