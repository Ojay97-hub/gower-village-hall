import {
  Clock, Calendar, MapPin, Megaphone, ListOrdered, ArrowRight,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import type { Church, Service } from '../../types/church';

function getChurchSlug(name: string): string | null {
  if (/st[\s.'`-]?john/i.test(name)) return 'st-johns';
  if (/st[\s.'`-]?nicholas/i.test(name)) return 'st-nicholas';
  return null;
}

interface ChurchCardProps {
  church: Church;
  imageRight?: boolean;
  visible?: boolean;
  animationDelay?: number;
}

function getDayAndTime(service: Service): string {
  if (service.recurring_text) return service.recurring_text;
  const d = new Date(service.date_time);
  return (
    d.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'short' }) +
    ' · ' +
    d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: true })
  );
}

function ServiceTimetableBanner({ services }: { services: Service[] }) {
  const now = new Date();
  const sorted = [...services].sort(
    (a, b) => new Date(a.date_time).getTime() - new Date(b.date_time).getTime(),
  );
  const nextId = sorted.find(s => new Date(s.date_time) > now)?.id ?? null;

  if (sorted.length === 0) return null;

  return (
    <div className="mb-8 rounded-2xl overflow-hidden border border-primary-100 shadow-sm">
      <div className="flex items-center gap-2 px-4 sm:px-5 py-3 bg-primary-700">
        <ListOrdered className="w-4 h-4 text-white/80" />
        <span className="text-xs font-bold uppercase tracking-widest text-white/90">
          Service Timetable
        </span>
      </div>
      <div className="divide-y divide-gray-100">
        {sorted.map(s => {
          const isNext = s.id === nextId;
          const isPast = !isNext && new Date(s.date_time) <= now;
          return (
            <div
              key={s.id}
              className={`flex items-start sm:items-center gap-3 sm:gap-4 px-4 sm:px-5 py-3 sm:py-3.5 ${
                isNext
                  ? 'bg-primary-50'
                  : isPast
                  ? 'bg-gray-50'
                  : 'bg-white'
              }`}
            >
              <div className="shrink-0 w-12 sm:w-16 pt-0.5 sm:pt-0">
                {isNext ? (
                  <span className="inline-block text-[0.65rem] sm:text-xs font-bold bg-primary-600 text-white px-2 py-0.5 rounded-full">
                    NEXT
                  </span>
                ) : (
                  <Clock className={`w-4 h-4 ${isPast ? 'text-gray-300' : 'text-primary-300'}`} />
                )}
              </div>
              <div className="flex-1 min-w-0 flex flex-col sm:flex-row sm:items-center sm:gap-3">
                <span
                  className={`text-sm font-semibold ${
                    isNext ? 'text-primary-800' : isPast ? 'text-gray-400' : 'text-gray-700'
                  }`}
                >
                  {s.title}
                </span>
                <span
                  className={`text-xs sm:text-sm sm:ml-auto sm:text-right mt-0.5 sm:mt-0 ${
                    isNext ? 'text-primary-700 font-medium' : isPast ? 'text-gray-400' : 'text-gray-500'
                  }`}
                >
                  {getDayAndTime(s)}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function ChurchCard({
  church,
  imageRight = false,
  visible = true,
  animationDelay = 0,
}: ChurchCardProps) {
  const activeAnnouncements = church.announcements.filter(a => new Date(a.expiry_date) > new Date());
  const visitingBlock = church.content_blocks.find(b => b.type === 'visiting');
  const imagePos = church.image_position ?? 'center';

  return (
    <div
      className={`bg-white rounded-3xl border border-gray-100 transition-all duration-500 overflow-hidden transform group ${
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
      }`}
      style={{ transitionDelay: `${animationDelay}ms` }}
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 h-full">

        {/* Image */}
        <div
          className={`${imageRight ? 'order-1 lg:order-2' : ''} overflow-hidden h-80 sm:h-96 lg:h-auto lg:min-h-[500px]`}
        >
          <ImageWithFallback
            src={church.image_url}
            alt={church.name}
            className={`w-full h-full object-cover object-${imagePos} transition-transform duration-700`}
          />
        </div>

        {/* Content */}
        <div className={`${imageRight ? 'order-2 lg:order-1' : ''} p-10 lg:p-16 flex flex-col justify-center`}>

          {/* Active announcement banners */}
          {activeAnnouncements.length > 0 && (
            <div className="mb-6 space-y-2">
              {activeAnnouncements.map(a => (
                <div
                  key={a.id}
                  className="flex items-start gap-3 p-3 bg-amber-50 border border-amber-200 rounded-xl"
                >
                  <Megaphone className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
                  <p className="text-sm text-amber-800 leading-snug">{a.message}</p>
                </div>
              ))}
            </div>
          )}

          <h2 className="text-3xl font-serif font-bold text-gray-900 mb-6 drop-shadow-sm">
            {church.name}
          </h2>
          <p className="text-lg text-gray-600 mb-8 leading-relaxed font-light">
            {church.description}
          </p>

          <ServiceTimetableBanner services={church.services} />

          <div className="space-y-8">

            {/* Visiting content block */}
            {visitingBlock && (
              <div className="flex items-start space-x-6">
                <div className="bg-primary-50 p-3 rounded-xl shrink-0 transition-transform duration-300 hover:scale-110 cursor-pointer">
                  <Calendar className="w-6 h-6 text-primary-700" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">{visitingBlock.title}</h3>
                  <p className="text-gray-500 text-base leading-relaxed whitespace-pre-line">
                    {visitingBlock.content}
                  </p>
                </div>
              </div>
            )}

            {/* Location */}
            <div className="flex items-start space-x-6">
              <div className="bg-primary-50 p-3 rounded-xl shrink-0 transition-transform duration-300 hover:scale-110 cursor-pointer">
                <MapPin className="w-6 h-6 text-primary-700" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Location</h3>
                <p className="text-gray-500 text-base leading-relaxed">{church.address}</p>
              </div>
            </div>
          </div>

          {/* View details link */}
          {getChurchSlug(church.name) && (
            <div className="mt-8 pt-6 border-t border-gray-100">
              <Link
                to={`/churches/${getChurchSlug(church.name)}`}
                className="inline-flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg px-6 py-3 transition-all duration-200 hover:gap-3"
              >
                View Church Details
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
