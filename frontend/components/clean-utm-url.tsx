'use client';
import { useEffect } from 'react';

export default function CleanUtmUrl() {
  useEffect(() => {
    const url = new URL(window.location.href);
    const utmParams = [
      'utm_source',
      'utm_medium',
      'utm_campaign',
      'utm_content',
      'utm_term',
    ];
    let changed = false;

    utmParams.forEach((param) => {
      if (url.searchParams.has(param)) {
        url.searchParams.delete(param);
        changed = true;
      }
    });

    if (changed) {
      window.history.replaceState({}, '', url.pathname + url.search);
    }
  }, []);

  return null;
}
