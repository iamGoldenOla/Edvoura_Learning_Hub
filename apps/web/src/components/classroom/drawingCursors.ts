'use client';

function encodeSvgCursor(svg: string, hotX: number, hotY: number, fallback: string): string {
  const encoded = encodeURIComponent(svg)
    .replace(/'/g, '%27')
    .replace(/"/g, '%22');
  return `url("data:image/svg+xml,${encoded}") ${hotX} ${hotY}, ${fallback}`;
}

/**
 * Generates a realistic, high-contrast SVG writing pen / highlighter / eraser / laser cursor
 * whose exact writing tip sits on the pointer hotspot (visible on both light and dark boards).
 */
export function getDrawingCursor(
  tool: 'pen' | 'highlighter' | 'eraser' | 'text' | 'rect' | 'circle' | 'arrow' | 'laser' | 'stamp',
  inkColor = '#DC2626'
): string {
  const safeColor = /^#[0-9a-fA-F]{3,8}$/.test(inkColor) ? inkColor : '#DC2626';

  if (tool === 'pen') {
    // Realistic angled fountain/ballpoint pen — writing nib precisely at (2, 30)
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
      <defs>
        <filter id="s" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0.8" dy="1" stdDeviation="0.8" flood-color="#000" flood-opacity="0.45"/>
        </filter>
      </defs>
      <g filter="url(#s)">
        <!-- Outer white halo stroke for crisp contrast on dark chalkboards -->
        <path d="M2 30 L5.5 21.5 L23.5 3.5 C24.8 2.2 26.9 2.2 28.2 3.5 L28.5 3.8 C29.8 5.1 29.8 7.2 28.5 8.5 L10.5 26.5 Z" fill="#ffffff" stroke="#ffffff" stroke-width="2.4" stroke-linejoin="round"/>
        <!-- Colored Pen Barrel -->
        <path d="M8.5 18.5 L23.5 3.5 C24.8 2.2 26.9 2.2 28.2 3.5 L28.5 3.8 C29.8 5.1 29.8 7.2 28.5 8.5 L13.5 23.5 Z" fill="${safeColor}" stroke="#060E1C" stroke-width="1.5" stroke-linejoin="round"/>
        <!-- Metallic Ferrule Band -->
        <path d="M20.5 6.5 L25.5 11.5" stroke="#F8FAFC" stroke-width="2.2"/>
        <!-- Tapered Pen Cone -->
        <path d="M5.5 21.5 L8.5 18.5 L13.5 23.5 L10.5 26.5 Z" fill="#E2E8F0" stroke="#060E1C" stroke-width="1.4" stroke-linejoin="round"/>
        <!-- Fine Writing Nib Tip at (2, 30) -->
        <path d="M2 30 L5.5 21.5 L10.5 26.5 Z" fill="#060E1C" stroke="#060E1C" stroke-width="1" stroke-linejoin="round"/>
        <!-- Ink Dot at exact tip -->
        <circle cx="2.6" cy="29.4" r="1.4" fill="${safeColor}"/>
      </g>
    </svg>`;
    return encodeSvgCursor(svg, 2, 30, 'auto');
  }

  if (tool === 'highlighter') {
    // Angled chisel-tip highlighter — flat tip precisely at (3, 29)
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
      <path d="M2 30 L5 23 L21 7 L26 12 L10 28 Z" fill="#ffffff" stroke="#ffffff" stroke-width="2.5" stroke-linejoin="round"/>
      <path d="M8 20 L21 7 C22.5 5.5 24.5 5.5 26 7 L26.5 7.5 C28 9 28 11 26.5 12.5 L13.5 25.5 Z" fill="${safeColor}" stroke="#060E1C" stroke-width="1.6" stroke-linejoin="round"/>
      <path d="M3 29 L5.5 22.5 L10.5 27.5 L6 29.5 Z" fill="#FEF08A" stroke="#060E1C" stroke-width="1.4" stroke-linejoin="round"/>
    </svg>`;
    return encodeSvgCursor(svg, 3, 29, 'auto');
  }

  if (tool === 'eraser') {
    // Realistic tilted pink & white classroom eraser — bottom corner at (6, 26)
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
      <path d="M5 24 L17 12 C18.5 10.5 20.8 10.5 22.3 12 L27 16.7 C28.5 18.2 28.5 20.5 27 22 L19 30 L9 30 L5 26 C4.2 25.2 4.2 24.6 5 24 Z" fill="#ffffff" stroke="#ffffff" stroke-width="2.2" stroke-linejoin="round"/>
      <path d="M12 17 L18 11 C19.3 9.7 21.4 9.7 22.7 11 L27 15.3 C28.3 16.6 28.3 18.7 27 20 L21 26 Z" fill="#F472B6" stroke="#060E1C" stroke-width="1.6" stroke-linejoin="round"/>
      <path d="M5.5 23.5 L12 17 L21 26 L18 29 L9.5 29 L5.5 25 Z" fill="#F8FAFC" stroke="#060E1C" stroke-width="1.6" stroke-linejoin="round"/>
    </svg>`;
    return encodeSvgCursor(svg, 6, 26, 'cell');
  }

  if (tool === 'laser') {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
      <circle cx="16" cy="16" r="10" fill="rgba(239,68,68,0.28)" stroke="#EF4444" stroke-width="1.5"/>
      <circle cx="16" cy="16" r="4.5" fill="#EF4444" stroke="#ffffff" stroke-width="1.5"/>
    </svg>`;
    return encodeSvgCursor(svg, 16, 16, 'pointer');
  }

  if (tool === 'text') return 'text';
  if (tool === 'stamp') return 'copy';
  return 'crosshair';
}
