import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import { Clock, Car, Music, Palette, Coffee, PoundSterling } from 'lucide-react';
import hallGateEntrance from '../assets/edited-hall-gate.png';
import hallSideView from '../assets/edited-side-hall.png';

export function Hall() {
  return (
    <div className="min-h-screen bg-primary-50">
      {/* Header Section */}
      <section className="relative h-64 overflow-hidden bg-primary-500">
        <div className="absolute inset-0 flex items-center">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-white">
            <h1 className="text-white">The Hall</h1>
            <p className="text-xl mt-2">
              Your community space in the heart of the village
            </p>
          </div>
        </div>
      </section>

      {/* Hero Image Section */}
      <div className="relative px-8 sm:px-12 lg:px-16 py-16 bg-white mb-20">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Primary Image - Rotated Left */}
            <div className="transform lg:-rotate-2 transition-all duration-700 hover:rotate-0 hover:scale-[1.02]">
              <div className="bg-white p-4 rounded-2xl shadow-[0_25px_50px_-12px_rgba(0,0,0,0.4)] border border-gray-100 overflow-hidden">
                <div className="aspect-[3/2] overflow-hidden rounded-xl">
                  <ImageWithFallback
                    src={hallGateEntrance}
                    alt="Village Hall Entrance with Gate"
                    className="w-full h-full object-cover transform transition-transform duration-700 group-hover:scale-110"
                  />
                </div>
                <div className="mt-4 text-gray-400 font-serif italic text-xs text-center">Main Entrance & Gateway</div>
              </div>
            </div>

            {/* Secondary Image - Rotated Right */}
            <div className="transform lg:rotate-2 transition-all duration-700 hover:rotate-0 hover:scale-[1.02] mt-8 lg:mt-12">
              <div className="bg-white p-4 rounded-2xl shadow-[0_25px_50px_-12px_rgba(0,0,0,0.4)] border border-gray-100 overflow-hidden">
                <div className="aspect-[3/2] overflow-hidden rounded-xl">
                  <ImageWithFallback
                    src={hallSideView}
                    alt="Village Hall Side View"
                    className="w-full h-full object-cover transform transition-transform duration-700 group-hover:scale-110"
                  />
                </div>
                <div className="mt-4 text-gray-400 font-serif italic text-xs text-center">Side View & Surroundings</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">

        {/* Book the Hall Section */}
        <div className="mb-16">
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
                  Available for hire 7 days a week,<br />
                  9am - 11pm
                </p>
              </div>

              {/* Hire Rates Card */}
              <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <PoundSterling className="w-6 h-6 text-gray-700" />
                </div>
                <h3 className="mb-3">Hire Rates</h3>
                <p className="text-gray-600 text-sm">
                  £15/hour or £100/day. Discounts<br />
                  for regular bookings.
                </p>
              </div>

              {/* Parking Card */}
              <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <Car className="w-6 h-6 text-gray-700" />
                </div>
                <h3 className="mb-3">Parking</h3>
                <p className="text-gray-600 text-sm">
                  Free parking available for up to 20<br />
                  vehicles
                </p>
              </div>

              {/* Capacity Card */}
              <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm hover:shadow-md transition-shadow flex-grow">
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <span className="text-2xl text-gray-700 font-semibold">50</span>
                </div>
                <h3 className="mb-3">Capacity</h3>
                <p className="text-gray-600 text-sm">
                  Up to 50 people seated, 75<br />
                  standing
                </p>
              </div>
            </div>

            {/* Right Side - Booking Form */}
            <div className="flex flex-col">
              <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-lg flex-grow">
                <h3 className="mb-6">Booking Enquiry Form</h3>
                <form className="space-y-5">
                  <div>
                    <label htmlFor="name" className="block text-sm mb-2 text-gray-700 font-medium">
                      Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="name"
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm mb-2 text-gray-700 font-medium">
                      Email <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      id="email"
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="phone" className="block text-sm mb-2 text-gray-700 font-medium">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                    />
                  </div>

                  <div>
                    <label htmlFor="date" className="block text-sm mb-2 text-gray-700 font-medium">
                      Preferred Date
                    </label>
                    <input
                      type="text"
                      id="date"
                      placeholder="dd/mm/yyyy"
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                    />
                  </div>
                  <div>
                    <label htmlFor="details" className="block text-sm mb-2 text-gray-700 font-medium">
                      Event Details <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      id="details"
                      rows={4}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none transition-all"
                      placeholder="Please tell us about your event, expected number of guests, and any special requirements..."
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition-colors font-medium shadow-sm hover:shadow"
                  >
                    Submit Enquiry
                  </button>
                </form>
              </div>

              {/* Donate Section */}
              <div className="mt-6 bg-white p-6 text-center rounded-2xl shadow-sm border border-gray-100">
                <p className="text-gray-700 mb-4 font-medium">
                  Help maintain the hall and ensure activities can continue
                </p>
                <button className="bg-primary-600 text-white px-6 p-2 rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium shadow-sm">
                  Donate Now
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Activities Section */}
        <div className="mb-20">
          <h2 className="mb-12 text-center">Regular Activities</h2>
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
              <p className="text-gray-600 mb-8 text-sm leading-relaxed text-left">
                Creative art sessions for all skill levels in a welcoming environment.
              </p>
              <div className="mt-auto">
                <button className="text-sm font-medium text-gray-700 bg-gray-50 px-6 py-2 rounded-full hover:bg-gray-100 transition-colors p-2">
                  Check schedule
                </button>
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
              <div className="mt-auto">
                <a
                  href="https://www.gowerharmony.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-medium text-gray-500 hover:text-gray-700 flex items-center group/link transition-colors p-2"
                >
                  Learn more <span className="ml-1 transform group-hover/link:translate-x-1 transition-transform">→</span>
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Cake Gallery Section */}
        <div className="mb-12">
          <div className="text-center md:text-left mb-8">
            <h2 className="mb-2">Gallery</h2>
            <p className="text-gray-600 text-lg">Delicious homemade cakes by our local bakers</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                image: 'https://images.unsplash.com/photo-1559630854-e3615c5f4e46?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx2aWN0b3JpYSUyMHNwb25nZSUyMGNha2V8ZW58MXx8fHwxNzY0NjA2MjAwfDA&ixlib=rb-4.1.0&q=80&w=1080',
                label: 'Victoria sponge'
              },
              {
                image: 'https://images.unsplash.com/photo-1692324161119-9df5ca75973f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsZW1vbiUyMGRyaXp6bGUlMjBjYWtlfGVufDF8fHx8MTc2NDYwNjIwMHww&ixlib=rb-4.1.0&q=80&w=1080',
                label: 'Lemon drizzle'
              },
              {
                image: 'https://images.unsplash.com/photo-1703876086193-5d29f099205c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjaG9jb2xhdGUlMjBmdWRnZSUyMGNha2V8ZW58MXx8fHwxNzY0NjA2MjAxfDA&ixlib=rb-4.1.0&q=80&w=1080',
                label: 'Chocolate fudge'
              },
              {
                image: 'https://images.unsplash.com/photo-1622926421334-6829deee4b4b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjYXJyb3QlMjBjYWtlfGVufDF8fHx8MTc2NDYwNjIwMXww&ixlib=rb-4.1.0&q=80&w=1080',
                label: 'Carrot cake'
              },
              {
                image: 'https://images.unsplash.com/photo-1681711092882-b1b2ac383705?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb2ZmZWUlMjB3YWxudXQlMjBjYWtlfGVufDF8fHx8MTc2NDYwNjIwMXww&ixlib=rb-4.1.0&q=80&w=1080',
                label: 'Coffee & walnut'
              },
              {
                image: 'https://images.unsplash.com/photo-1590869173972-7868b37913ab?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3ZWxzaCUyMGJhcmElMjBicml0aCUyMGNha2V8ZW58MXx8fHwxNzY0NjA2MjAyfDA&ixlib=rb-4.1.0&q=80&w=1080',
                label: 'Welsh bara brith'
              }
            ].map((cake, index) => (
              <div key={index} className="group cursor-pointer">
                <h3 className="text-black font-medium mb-2 text-lg text-left">{cake.label}</h3>
                <div className="relative overflow-hidden rounded-xl shadow-md">
                  <ImageWithFallback
                    src={cake.image}
                    alt={cake.label}
                    className="w-full h-64 object-cover transform transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}