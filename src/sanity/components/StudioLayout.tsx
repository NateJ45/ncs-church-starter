// Studio layout wrapper. Its only job is to load the church's brand web fonts
// (Instrument Serif for display, Newsreader for body) into the Studio document
// so the font families set on the theme in sanity.config.ts actually resolve.
// Sanity doesn't load custom fonts for you, so we inject a Google Fonts <link>
// once on mount, then render the default Studio layout untouched.
//
// Safe to edit by hand. Swap the font families here + in sanity.config.ts when
// reusing the template for another brand.

import { useEffect } from 'react';
import type { LayoutProps } from 'sanity';

const FONT_LINK_ID = 'brand-fonts';
const FONT_HREF =
  'https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Newsreader:ital,wght@0,400;0,500;0,600;1,400&display=swap';

export default function StudioLayout(props: LayoutProps) {
  useEffect(() => {
    if (typeof document === 'undefined') return;
    if (document.getElementById(FONT_LINK_ID)) return;

    // Preconnect to Google's font hosts so the stylesheet + woff2 files start
    // fetching without an extra round-trip of latency.
    const preconnects = [
      { href: 'https://fonts.googleapis.com' },
      { href: 'https://fonts.gstatic.com', crossOrigin: 'anonymous' },
    ];
    for (const pc of preconnects) {
      const link = document.createElement('link');
      link.rel = 'preconnect';
      link.href = pc.href;
      if (pc.crossOrigin) link.crossOrigin = pc.crossOrigin;
      document.head.appendChild(link);
    }

    const stylesheet = document.createElement('link');
    stylesheet.id = FONT_LINK_ID;
    stylesheet.rel = 'stylesheet';
    stylesheet.href = FONT_HREF;
    document.head.appendChild(stylesheet);
  }, []);

  return props.renderDefault(props);
}
