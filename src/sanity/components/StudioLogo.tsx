// StudioLogo.tsx — Logo + wordmark for the Sanity Studio header.
// Rendered in the top-left of the Studio UI in place of the default Sanity logo:
// the church building mark (same image as the site favicon) on a small paper chip,
// next to the church wordmark in the display serif. The mark sits on a light chip
// so the black silhouette always has contrast, whether the Studio chrome is light
// or dark; the wordmark inherits the header's text color for the same reason.
// The font is loaded by StudioLayout; Georgia is a graceful serif fallback.
// Safe to edit by hand. (Vite bundles the PNG import; see src/sanity/global.d.ts.)

import React from 'react';
import churchMark from './church-mark.png';

export default function StudioLogo() {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', whiteSpace: 'nowrap' }}>
      <span
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '30px',
          height: '30px',
          borderRadius: '7px',
          background: '#FBF8F2',
          border: '1px solid rgba(54, 48, 42, 0.12)',
          flex: 'none',
        }}
      >
        <img
          src={churchMark}
          alt=""
          aria-hidden="true"
          style={{ height: '22px', width: 'auto', display: 'block' }}
        />
      </span>
      <span
        style={{
          fontFamily: "'Instrument Serif', Georgia, 'Times New Roman', serif",
          fontSize: '1.15rem',
          fontWeight: 400,
          letterSpacing: '0.01em',
        }}
      >
        First Church
      </span>
    </span>
  );
}
