import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const BASE_URL = 'https://gower-village-hall-real.vercel.app';

export function CanonicalUrl() {
  const { pathname } = useLocation();

  useEffect(() => {
    const canonical = `${BASE_URL}${pathname}`;
    let link = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!link) {
      link = document.createElement('link');
      link.rel = 'canonical';
      document.head.appendChild(link);
    }
    link.href = canonical;
  }, [pathname]);

  return null;
}
