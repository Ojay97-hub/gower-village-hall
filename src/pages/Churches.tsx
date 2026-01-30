import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import { Clock, MapPin, Heart, Calendar } from "lucide-react";
import stJohnsChurchImg from "../assets/st-johns-church.png";
import stNicholastonChurchImg from "../assets/st-nicholas-church.png";

export function Churches() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative h-64 overflow-hidden bg-primary-500">
        <div className="absolute inset-0 flex items-center">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-white">
            <h1 className="text-white">Our Churches</h1>
            <p className="text-xl mt-2">
              Historic places of worship serving our community
            </p>
          </div>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* St Johns Church */}
          <div className="mb-16">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
              <div>
                <h2 className="mb-4">
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
                      <h4 className="mb-1">Service Times</h4>
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
                      <h4 className="mb-1">Visiting</h4>
                      <p className="text-gray-600 text-sm">
                        The church welcomes visitors throughout
                        the year. Please contact us to arrange a
                        visit or for more information about the
                        church history.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <Heart className="w-6 h-6 text-primary-600 flex-shrink-0 mt-1" />
                    <div>
                      <h4 className="mb-1">How to Donate</h4>
                      <p className="text-gray-600 text-sm mb-3">
                        Donations help maintain this historic
                        building and support our community
                        activities.
                      </p>
                      <button className="bg-primary-600 text-white px-5 py-2 rounded-lg text-sm hover:bg-primary-700 transition-colors">
                        Donate Now
                      </button>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <MapPin className="w-6 h-6 text-primary-600 flex-shrink-0 mt-1" />
                    <div>
                      <h4 className="mb-1">Location</h4>
                      <p className="text-gray-600 text-sm">
                        Penmaen, Gower, Swansea SA3 2HH
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl overflow-hidden shadow-lg">
                <ImageWithFallback
                  src={stJohnsChurchImg}
                  alt="St Johns Church, Penmaen"
                  className="w-full h-96 object-cover"
                />
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-gray-200 my-16"></div>

          {/* St Nicholaston Church */}
          <div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
              <div className="order-2 md:order-1 rounded-2xl overflow-hidden shadow-lg">
                <ImageWithFallback
                  src={stNicholastonChurchImg}
                  alt="St Nicholaston Church"
                  className="w-full h-96 object-cover"
                />
              </div>

              <div className="order-1 md:order-2">
                <h2 className="mb-4">St Nicholas Church</h2>
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
                      <h4 className="mb-1">Service Times</h4>
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
                      <h4 className="mb-1">Visiting</h4>
                      <p className="text-gray-600 text-sm">
                        Visitors are always welcome. The church
                        is typically open during daylight hours,
                        and guided tours can be arranged by
                        appointment.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <Heart className="w-6 h-6 text-primary-600 flex-shrink-0 mt-1" />
                    <div>
                      <h4 className="mb-1">How to Donate</h4>
                      <p className="text-gray-600 text-sm mb-3">
                        Your donations help preserve this
                        historic building and support our
                        community outreach programs.
                      </p>
                      <button className="bg-primary-600 text-white px-5 py-2 rounded-lg text-sm hover:bg-primary-700 transition-colors">
                        Donate Now
                      </button>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <MapPin className="w-6 h-6 text-primary-600 flex-shrink-0 mt-1" />
                    <div>
                      <h4 className="mb-1">Location</h4>
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
    </div>
  );
}