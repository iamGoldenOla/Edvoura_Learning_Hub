'use client';

function encodeSvgCursor(svg: string, hotX: number, hotY: number, fallback = 'default'): string {
  const cleanSvg = svg.trim().replace(/\s+/g, ' ');
  const encoded = encodeURIComponent(cleanSvg)
    .replace(/'/g, '%27')
    .replace(/"/g, '%22');
  return `url("data:image/svg+xml;utf8,${encoded}") ${hotX} ${hotY}, ${fallback}`;
}

/**
 * Generates a realistic, high-contrast SVG writing pen / highlighter / eraser / laser cursor
 * whose exact writing tip sits on the pointer hotspot (visible on both light and dark boards).
 * Fallback is ALWAYS 'default', NEVER 'crosshair'!
 */
export function getDrawingCursor(
  tool: 'pen' | 'highlighter' | 'eraser' | 'text' | 'rect' | 'circle' | 'arrow' | 'laser' | 'stamp',
  inkColor = '#DC2626'
): string {
  const safeColor = /^#[0-9a-fA-F]{3,8}$/.test(inkColor) ? inkColor : '#DC2626';

  if (tool === 'pen') {
    // Realistic angled fountain/ballpoint pen — fine writing nib tip precisely at (2, 30)
    // Filter-free standard SVG 1.1 for 100% reliable Chrome/Edge/Firefox rendering
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
      <!-- White background halo for dark chalkboards -->
      <path d="M1 31 L5.5 19.5 L22.5 2.5 C24.5 0.5 27.5 0.5 29.5 2.5 L29.5 2.5 C31.5 4.5 31.5 7.5 29.5 9.5 L12.5 26.5 L1 31 Z" fill="#ffffff"/>
      <!-- Colored pen barrel -->
      <path d="M8 18 L22.5 3.5 C24 2 26.5 2 28 3.5 L28.5 4 C30 5.5 30 8 28.5 9.5 L14 24 Z" fill="${safeColor}" stroke="#060E1C" stroke-width="1.5" stroke-linejoin="round"/>
      <!-- Silver ferrule band -->
      <path d="M19.5 7 L25 12.5" stroke="#F8FAFC" stroke-width="2.5"/>
      <!-- Steel writing nib -->
      <path d="M2 30 L7 19 L13 25 Z" fill="#CBD5E1" stroke="#060E1C" stroke-width="1.5" stroke-linejoin="round"/>
      <!-- Nib slit line down to tip -->
      <path d="M2 30 L8 24" stroke="#060E1C" stroke-width="1.2"/>
      <!-- Breather hole with ink color -->
      <circle cx="8.5" cy="23.5" r="1.3" fill="${safeColor}"/>
      <!-- Fine ink dot at exact tip (2, 30) -->
      <circle cx="2.5" cy="29.5" r="1.2" fill="${safeColor}"/>
    </svg>`;
    return encodeSvgCursor(svg, 2, 30, 'default');
  }

  if (tool === 'highlighter') {
    // Angled chisel-tip highlighter — flat tip precisely at (3, 29)
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
      <!-- White halo -->
      <path d="M1 31 L4.5 21.5 L21 5.5 C23 3.5 26.5 3.5 28.5 5.5 L28.5 5.5 C30.5 7.5 30.5 11 28.5 13 L12 29.5 L1 31 Z" fill="#ffffff"/>
      <!-- Colored barrel -->
      <path d="M7 20 L21 6 C22.5 4.5 25 4.5 26.5 6 L27 6.5 C28.5 8 28.5 10.5 27 12 L13 26 Z" fill="${safeColor}" stroke="#060E1C" stroke-width="1.5" stroke-linejoin="round"/>
      <!-- Neon yellow chisel tip -->
      <path d="M3 29 L5.5 22 L11 27.5 L6 30 Z" fill="#FEF08A" stroke="#060E1C" stroke-width="1.5" stroke-linejoin="round"/>
    </svg>`;
    return encodeSvgCursor(svg, 3, 29, 'default');
  }

  if (tool === 'eraser') {
    // Realistic tilted pink & white classroom eraser — corner at (6, 26)
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
      <path d="M4 25 L16.5 12.5 C18 11 20.5 11 22 12.5 L27 17.5 C28.5 19 28.5 21.5 27 23 L19 31 L8 31 L4 27 C3.2 26.2 3.2 25.8 4 25 Z" fill="#ffffff"/>
      <path d="M12 17 L18 11 C19.3 9.7 21.4 9.7 22.7 11 L27 15.3 C28.3 16.6 28.3 18.7 27 20 L21 26 Z" fill="#F472B6" stroke="#060E1C" stroke-width="1.6" stroke-linejoin="round"/>
      <path d="M5.5 23.5 L12 17 L21 26 L18 29 L9.5 29 L5.5 25 Z" fill="#F8FAFC" stroke="#060E1C" stroke-width="1.6" stroke-linejoin="round"/>
    </svg>`;
    return encodeSvgCursor(svg, 6, 26, 'default');
  }

  if (tool === 'laser') {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
      <circle cx="16" cy="16" r="11" fill="rgba(239,68,68,0.3)" stroke="#EF4444" stroke-width="1.5"/>
      <circle cx="16" cy="16" r="4.5" fill="#EF4444" stroke="#ffffff" stroke-width="1.5"/>
    </svg>`;
    return encodeSvgCursor(svg, 16, 16, 'default');
  }

  if (tool === 'text') return 'text';
  if (tool === 'stamp') return 'copy';
  return 'default';
}
