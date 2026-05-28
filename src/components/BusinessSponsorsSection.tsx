import { useEffect, useState } from 'react';
import { Heart } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { ImageWithFallback } from './figma/ImageWithFallback';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from './ui/carousel';

export type BusinessSponsor = {
  id: string;
  name: string;
  website_url: string | null;
  logo_url: string | null;
  sort_order: number;
};

export function BusinessSponsorsSection() {
  const [sponsors, setSponsors] = useState<BusinessSponsor[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const { data, error } = await supabase
          .from('business_sponsors')
          .select('id, name, website_url, logo_url, sort_order')
          .eq('is_active', true)
          .order('sort_order', { ascending: true })
          .order('name', { ascending: true });

        if (error) throw error;
        if (!cancelled) setSponsors(data ?? []);
      } catch (err) {
        console.error('Error fetching business sponsors:', err);
        if (!cancelled) setSponsors([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  if (!loading && sponsors.length === 0) {
    return null;
  }

  const showControls = sponsors.length > 1;

  return (
    <div className="mb-12">
      <div className="flex items-center mb-8">
        <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center mr-3">
          <Heart className="w-5 h-5 text-gray-700" />
        </div>
        <h2>With special thanks to</h2>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600" />
        </div>
      ) : (
        <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm">
          <Carousel
            opts={{ align: 'start', loop: sponsors.length > 3 }}
            className="w-full"
          >
            <CarouselContent className="-ml-4">
              {sponsors.map((sponsor) => (
                <CarouselItem
                  key={sponsor.id}
                  className="pl-4 basis-full sm:basis-1/2 lg:basis-1/3"
                >
                  <SponsorCard sponsor={sponsor} />
                </CarouselItem>
              ))}
            </CarouselContent>
            {showControls && (
              <>
                <CarouselPrevious className="left-1 md:left-3 bg-white/90 hover:bg-white border-gray-300 shadow-sm" />
                <CarouselNext className="right-1 md:right-3 bg-white/90 hover:bg-white border-gray-300 shadow-sm" />
              </>
            )}
          </Carousel>
          {showControls && (
            <p className="text-center text-xs text-gray-500 mt-4">
              Swipe or use arrows to see more supporters
            </p>
          )}
        </div>
      )}
    </div>
  );
}

function SponsorCard({ sponsor }: { sponsor: BusinessSponsor }) {
  const websiteUrl = getSponsorWebsiteUrl(sponsor);
  const content = (
    <div className="flex flex-col items-center justify-center h-44 md:h-48 px-4 py-6 rounded-xl border border-gray-100 bg-gray-50/80 transition-colors hover:bg-gray-50 hover:border-gray-200">
      {sponsor.logo_url ? (
        <ImageWithFallback
          src={sponsor.logo_url}
          alt={sponsor.name}
          className="max-h-32 max-w-full w-auto object-contain"
        />
      ) : (
        <span className="text-center text-lg font-medium text-gray-800">{sponsor.name}</span>
      )}
      {sponsor.logo_url && (
        <span className="sr-only">{sponsor.name}</span>
      )}
    </div>
  );

  if (websiteUrl) {
    return (
      <a
        href={websiteUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="block rounded-xl overflow-hidden focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
      >
        {content}
      </a>
    );
  }

  return content;
}

function getSponsorWebsiteUrl(sponsor: BusinessSponsor) {
  if (sponsor.website_url) return sponsor.website_url;

  const isNovaForma =
    sponsor.name.toLowerCase().includes('nova forma') ||
    sponsor.logo_url?.toLowerCase().includes('nova-forma');

  return isNovaForma ? 'https://novaformadesigns.com' : null;
}
