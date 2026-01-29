import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import { Tent, Home, UtensilsCrossed, Landmark, ExternalLink, MapPin, Target } from 'lucide-react';
import perriswoodImg from "../assets/perriswood-archery.png";
import parcLeBreosImg from "../assets/parc-le-breos.png";
import pennardCastleImg from "../assets/pennard-castle.png";
import oxwichHotelImg from "../assets/oxwich-hotel.png";
import oxwichBayImg from "../assets/oxwich-bay.png";
import littleValleyBakeryImg from "../assets/little-valley-bakery.jpg";
import kingArthurHotelImg from "../assets/king-arthur.png";
import gowerInnImg from "../assets/gower-inn.jpg";
import beachHouseImg from "../assets/beach-house.jpg";
import gowerCoastAdventuresImg from "../assets/gower-coast-adventures.png";
import gowerHeritageCentreImg from "../assets/gower-heritage-centre.png";
import threeCliffsBayImg from "../assets/three-cliffs-bay.png";
import threeCliffsBayAerialImg from "../assets/aerial-of-the-campsite-and-three-cliffs-bay.webp";
import threeCliffsBayHolidayParkImg from "../assets/holiday-park.png";
import torBayBeachImg from "../assets/tor-bay-beach.png";
import oxwichCastleImg from "../assets/oxwich-castle.png";

export function Businesses() {
  const campsites = [
    {
      name: 'Three Cliffs Bay Holiday Park',
      description: 'Award-winning family-friendly holiday park overlooking Three Cliffs Bay. Offering static caravans, touring pitches, and modern facilities with stunning coastal views.',
      image: threeCliffsBayAerialImg,
      website: 'https://www.threecliffsbay.com/'
    },
    {
      name: 'Nicholaston Farm Campsite',
      description: 'Peaceful working farm campsite set in beautiful Gower countryside. Just a short walk to the beach, offering a tranquil escape with traditional farm camping.',
      image: threeCliffsBayHolidayParkImg,
      website: 'https://www.nicholastonfarm.co.uk/'
    }
  ];

  const accommodation = [
    {
      name: 'Parc Le Breos',
      description: 'Award-winning luxury accommodation set in beautiful countryside. Offering boutique rooms, self-catering lodges, and exceptional hospitality in the heart of Gower.',
      image: parcLeBreosImg,
      website: 'https://parc-le-breos.co.uk/'
    },
    {
      name: 'Oxwich Bay Hotel',
      description: 'Stunning beachfront hotel overlooking Oxwich Bay. Enjoy fine dining, comfortable rooms with sea views, and direct beach access in this idyllic coastal location.',
      image: oxwichHotelImg,
      website: 'https://oxwichbayhotel.co.uk/'
    },
    {
      name: 'King Arthur Hotel',
      description: 'Historic family-run hotel in Reynoldston offering cozy accommodation, home-cooked meals, and a warm Welsh welcome. Perfectly located for exploring Gower.',
      image: kingArthurHotelImg,
      website: 'https://www.kingarthurhotel.co.uk/'
    }
  ];

  const restaurants = [
    {
      name: 'Gower Inn',
      description: 'Traditional village pub in Parkmill serving quality locally-sourced food and real ales. Family-friendly atmosphere with a beer garden and close to local attractions.',
      image: gowerInnImg,
      website: 'https://www.gowerinn.co.uk/'
    },
    {
      name: 'Little Valley Bakery',
      description: 'Award-winning artisan bakery producing handcrafted sourdough, pastries, and cakes using organic flour. A must-visit for freshly baked goods and specialty coffee.',
      image: littleValleyBakeryImg,
      website: 'https://www.littlevalleybakery.com/'
    },
    {
      name: 'The Beach House',
      description: 'Michelin-starred restaurant located right on Oxwich Beach. Experience exceptional cuisine celebrating local Welsh produce with stunning sea views.',
      image: beachHouseImg,
      website: 'https://beachhouseoxwich.co.uk/'
    }
  ];

  const attractions = [
    {
      name: 'Three Cliffs Bay',
      description: "One of Wales' most beautiful beaches",
      image: threeCliffsBayImg,
      website: 'https://www.tripadvisor.co.uk/Search?q=Three+Cliffs+Bay'
    },
    {
      name: 'Oxwich Bay',
      description: 'Beautiful sandy beach perfect for families and water sports',
      image: oxwichBayImg,
      website: 'https://www.tripadvisor.co.uk/Search?q=Oxwich+Bay'
    },
    {
      name: 'Tor Bay Beach',
      description: 'Secluded sandy beach with dramatic cliffs and rock pools',
      image: torBayBeachImg,
      website: 'https://www.visitswanseabay.com/things-to-do/beaches/tor-bay/'
    },
    {
      name: 'Gower Heritage Centre',
      description: 'Explore the history and heritage of the Gower Peninsula',
      image: gowerHeritageCentreImg,
      website: 'https://www.tripadvisor.co.uk/Search?q=Gower+Heritage+Centre'
    }
  ];

  const activities = [
    {
      name: 'Perriswood Archery and Falconry',
      description: 'Unique outdoor experience featuring archery sessions and falconry displays. Get up close with birds of prey and test your skills with traditional archery in beautiful Gower countryside.',
      image: perriswoodImg,
      website: 'https://www.perriswood.com/'
    },
    {
      name: 'Gower Coast Adventures',
      description: 'Luxury glamping pods and camping with outdoor activities. Perfect for adventure seekers with coasteering, kayaking, and surf lessons available.',
      image: gowerCoastAdventuresImg,
      website: 'https://www.gowercoastadventures.co.uk/'
    }
  ];

  const castles = [
    {
      name: 'Pennard Castle',
      description: 'Medieval castle ruins with spectacular views over Three Cliffs Bay',
      image: pennardCastleImg,
      website: 'https://www.tripadvisor.co.uk/Search?q=Pennard+Castle'
    },
    {
      name: 'Oxwich Castle',
      description: 'Impressive Tudor manor house set in the heart of Oxwich village',
      image: oxwichCastleImg,
      website: 'https://www.tripadvisor.co.uk/Search?q=Oxwich+Castle'
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section with Map */}
      <section className="relative bg-primary-300">
        <div className="grid grid-cols-1 lg:grid-cols-2">
          {/* Left side - Text */}
          <div className="flex items-center px-4 sm:px-6 lg:px-12 py-16 lg:py-24">
            <div>
              <h1 className="mb-4">Local Businesses</h1>
              <p className="text-xl text-gray-800">Discover what the Gower has to offer</p>
            </div>
          </div>

          {/* Right side - Map */}
          <div className="h-64 lg:h-auto bg-gray-200 relative">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d9889.724353445883!2d-4.140629!3d51.569167!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x486ef3e8c8c8c8c9%3A0x8c8c8c8c8c8c8c8c!2sPenmaen%2C%20Swansea!5e0!3m2!1sen!2suk!4v1234567890"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="absolute inset-0"
            ></iframe>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16 bg-primary-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Campsites */}
          <div className="mb-20">
            <div className="flex items-center mb-8">
              <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center mr-3">
                <Tent className="w-5 h-5 text-gray-700" />
              </div>
              <h2>Campsites</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {campsites.map((site, index) => (
                <div key={index} className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-shadow">
                  <div className="h-56 overflow-hidden">
                    <ImageWithFallback
                      src={site.image}
                      alt={site.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-8">
                    <h3 className="mb-3">{site.name}</h3>
                    <p className="text-gray-600 text-sm mb-6 leading-relaxed">
                      {site.description}
                    </p>
                    <a
                      href={site.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center w-full px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors text-sm"
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Visit Website
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Places to Stay */}
          <div className="mb-20">
            <div className="flex items-center mb-8">
              <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center mr-3">
                <Home className="w-5 h-5 text-gray-700" />
              </div>
              <h2>Places to Stay</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {accommodation.map((place, index) => (
                <div key={index} className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-shadow">
                  <div className="h-56 overflow-hidden">
                    <ImageWithFallback
                      src={place.image}
                      alt={place.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-8">
                    <h3 className="mb-3">{place.name}</h3>
                    <p className="text-gray-600 text-sm mb-6 leading-relaxed">
                      {place.description}
                    </p>
                    <a
                      href={place.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center w-full px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors text-sm"
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Visit Website
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Places to Eat */}
          <div className="mb-20">
            <div className="flex items-center mb-8">
              <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center mr-3">
                <UtensilsCrossed className="w-5 h-5 text-gray-700" />
              </div>
              <h2>Places to Eat</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {restaurants.map((restaurant, index) => (
                <div key={index} className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-shadow">
                  <div className="h-56 overflow-hidden">
                    <ImageWithFallback
                      src={restaurant.image}
                      alt={restaurant.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-8">
                    <h3 className="mb-3">{restaurant.name}</h3>
                    <p className="text-gray-600 text-sm mb-6 leading-relaxed">
                      {restaurant.description}
                    </p>
                    <a
                      href={restaurant.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center w-full px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors text-sm"
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Visit Website
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Places to Visit */}
          <div className="mb-8">
            <div className="flex items-center mb-8">
              <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center mr-3">
                <MapPin className="w-5 h-5 text-gray-700" />
              </div>
              <h2>Places to Visit</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {attractions.map((attraction, index) => (
                <div key={index} className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-shadow">
                  <div className="h-64 overflow-hidden">
                    <ImageWithFallback
                      src={attraction.image}
                      alt={attraction.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-8">
                    <h3 className="mb-3">{attraction.name}</h3>
                    <p className="text-gray-600 text-sm mb-6 leading-relaxed">
                      {attraction.description}
                    </p>
                    <a
                      href={attraction.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center w-full px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors text-sm"
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Learn More
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Outdoor Activities */}
          <div className="mb-8">
            <div className="flex items-center mb-8">
              <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center mr-3">
                <Target className="w-5 h-5 text-gray-700" />
              </div>
              <h2>Outdoor Activities</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {activities.map((activity, index) => (
                <div key={index} className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-shadow">
                  <div className="h-64 overflow-hidden">
                    <ImageWithFallback
                      src={activity.image}
                      alt={activity.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-8">
                    <h3 className="mb-3">{activity.name}</h3>
                    <p className="text-gray-600 text-sm mb-6 leading-relaxed">
                      {activity.description}
                    </p>
                    <a
                      href={activity.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center w-full px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors text-sm"
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Visit Website
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Castles */}
          <div className="mb-8">
            <div className="flex items-center mb-8">
              <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center mr-3">
                <Landmark className="w-5 h-5 text-gray-700" />
              </div>
              <h2>Castles</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {castles.map((castle, index) => (
                <div key={index} className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-shadow">
                  <div className="h-64 overflow-hidden">
                    <ImageWithFallback
                      src={castle.image}
                      alt={castle.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-8">
                    <h3 className="mb-3">{castle.name}</h3>
                    <p className="text-gray-600 text-sm mb-6 leading-relaxed">
                      {castle.description}
                    </p>
                    <a
                      href={castle.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center w-full px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors text-sm"
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Learn More
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Supporting Local Business Notice */}
          <div className="bg-white rounded-2xl p-8 mt-12">
            <h3 className="mb-4">Supporting Local Businesses</h3>
            <p className="text-gray-700 leading-relaxed">
              These listings are provided as a service to our community and visitors.
              While we strive to keep information current, please verify details directly
              with each business. If you're a local business and would like to be featured,
              please get in touch through our contact page.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}