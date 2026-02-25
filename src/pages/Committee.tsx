import {
  Users,
  Calendar,
  FileText,
  ExternalLink,
} from "lucide-react";
import { Link } from "react-router-dom";

export function Committee() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-primary-300">
        <div className="flex items-center px-4 sm:px-6 lg:px-12 py-16 lg:py-24">
          <div className="max-w-7xl mx-auto">
            <h1>Committee & Trustees</h1>
            <p className="text-xl text-gray-800 mt-2">
              Dedicated volunteers managing our village hall
            </p>
          </div>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Introduction */}
          <div className="max-w-3xl mx-auto text-center mb-16">
            <p className="text-lg text-gray-700 leading-relaxed">
              Penmaen and Nicholaston Village Hall is managed by
              a dedicated committee of trustees who volunteer
              their time to ensure the hall remains a vital
              resource for our community. The hall operates as a
              registered charity serving the local area.
            </p>
          </div>

          {/* Trustees Section */}
          <div className="mb-16">
            <div className="flex items-center mb-8">
              <Users className="w-8 h-8 text-primary-600 mr-3" />
              <h2>Our Trustees</h2>
            </div>
            <div className="bg-white border border-gray-200 rounded-2xl p-8 mb-8">
              <p className="text-gray-700 mb-4 leading-relaxed">
                The hall is managed by the Board of Trustees for
                the Penmaen and Nicholaston Village Hall
                Charity. All of the Trustees are members of the
                local community and share a commitment to the
                sustainability of this much valued resource.
              </p>
              <p className="text-gray-700 leading-relaxed">
                The committee raise funds by organising events
                during holiday and festival periods, and a
                coffee morning held in the hall on the first
                Saturday of every month from 10:30 - 12:30.
              </p>
            </div>

            {/* Current Members Section */}
            <div>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {/* Registered Charity Card */}
                <div className="bg-white border-2 border-primary-200 rounded-2xl p-6 md:col-span-2 flex flex-col">
                  <div className="flex items-start mb-3">
                    <FileText className="w-8 h-8 text-primary-600 mr-3 flex-shrink-0" />
                    <div>
                      <h4 className="mb-2">
                        Registered Charity
                      </h4>
                    </div>
                  </div>
                  <p className="text-sm text-gray-700 mb-3 leading-relaxed">
                    Penmaen and Nicholaston Village Hall is a
                    registered charity committed to serving the
                    local community and providing facilities for
                    public benefit.
                  </p>
                  <div className="flex items-center space-x-2 mt-auto">
                    <span className="text-sm text-gray-600">
                      Charity Number:
                    </span>
                    <a
                      href="https://register-of-charities.charitycommission.gov.uk/charity-details/?regid=1081661&subid=0"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-primary-600 hover:text-primary-700 flex items-center underline"
                    >
                      1081661
                      <ExternalLink className="w-3 h-3 ml-1" />
                    </a>
                  </div>
                </div>

                {/* Chair - spans 2 columns for prominence */}
                <div className="bg-primary-50 rounded-2xl p-6 md:col-span-2">
                  <h4 className="mb-2">Dale Ponting</h4>
                  <p className="text-sm text-gray-600">Chair</p>
                </div>

                <div className="bg-primary-50 rounded-2xl p-6">
                  <h4 className="mb-2">Claire Marson</h4>
                  <p className="text-sm text-gray-600">
                    Trustee
                  </p>
                </div>

                <div className="bg-primary-50 rounded-2xl p-6">
                  <h4 className="mb-2">Cody Bates</h4>
                  <p className="text-sm text-gray-600">
                    Trustee
                  </p>
                </div>

                <div className="bg-primary-50 rounded-2xl p-6">
                  <h4 className="mb-2">Claire Cotter</h4>
                  <p className="text-sm text-gray-600">
                    Trustee
                  </p>
                </div>

                <div className="bg-primary-50 rounded-2xl p-6">
                  <h4 className="mb-2">Brian Martin</h4>
                  <p className="text-sm text-gray-600">
                    Trustee
                  </p>
                </div>

                <div className="bg-primary-50 rounded-2xl p-6">
                  <h4 className="mb-2">Annzella Gregg</h4>
                  <p className="text-sm text-gray-600">
                    Trustee
                  </p>
                </div>

                <div className="bg-primary-50 rounded-2xl p-6">
                  <h4 className="mb-2">Jacquelyn Ponting</h4>
                  <p className="text-sm text-gray-600">
                    Trustee
                  </p>
                </div>

                {/* Spans 2 columns for visual interest */}
                <div className="bg-primary-50 rounded-2xl p-6 md:col-span-2">
                  <h4 className="mb-2">Dr Sophie Henson</h4>
                  <p className="text-sm text-gray-600">
                    Trustee
                  </p>
                </div>

                <div className="bg-primary-50 rounded-2xl p-6">
                  <h4 className="mb-2">Catherine Patton</h4>
                  <p className="text-sm text-gray-600">
                    Trustee
                  </p>
                </div>

                <div className="bg-primary-50 rounded-2xl p-6">
                  <h4 className="mb-2">Peter Burgess</h4>
                  <p className="text-sm text-gray-600">
                    Trustee
                  </p>
                </div>

                {/* Spans 2 columns to fill the row nicely */}
                <div className="bg-primary-50 rounded-2xl p-6 md:col-span-2">
                  <h4 className="mb-2">Dr Jerry Kingham</h4>
                  <p className="text-sm text-gray-600">
                    Trustee
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Meetings and Events */}
          <div className="mb-16">
            <div className="flex items-center mb-8">
              <Calendar className="w-8 h-8 text-primary-600 mr-3" />
              <h2>Meetings and Events</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-primary-50 rounded-2xl p-8">
                <h3 className="mb-3">Committee Meetings</h3>
                <p className="text-gray-700 mb-4 text-sm leading-relaxed">
                  The committee holds regular meetings to
                  discuss hall business, approve bookings, and
                  plan community events.
                </p>
                <p className="text-sm text-gray-600">
                  Meetings are typically held quarterly. Contact
                  us for the next meeting date.
                </p>
              </div>

              <div className="bg-primary-50 rounded-2xl p-8">
                <h3 className="mb-3">Annual General Meeting</h3>
                <p className="text-gray-700 mb-4 text-sm leading-relaxed">
                  Our AGM is open to all community members and
                  provides an opportunity to hear about hall
                  activities and future plans.
                </p>
                <p className="text-sm text-gray-600">
                  The next AGM will be announced on this page
                  and via local notices.
                </p>
              </div>
            </div>
          </div>

          {/* Get Involved */}
          <div className="bg-gradient-to-r from-primary-600 to-primary-500 rounded-2xl p-10 text-white">
            <h2 className="mb-4 text-white">Get Involved</h2>
            <p className="text-lg mb-6 leading-relaxed">
              We're always looking for enthusiastic community
              members to join our committee or help with hall
              activities. Whether you have a few hours to spare
              or want to take on a more active role, there are
              many ways to contribute.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                to="/contact"
                className="bg-white text-primary-600 px-8 py-3 rounded-lg hover:bg-gray-100 transition-colors inline-block"
              >
                Contact Us
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}