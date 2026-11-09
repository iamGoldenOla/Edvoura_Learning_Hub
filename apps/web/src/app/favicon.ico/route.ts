import { NextResponse } from 'next/server';
import fs from 'node:fs';
import path from 'node:path';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const svgPath = path.join(process.cwd(), 'public', 'favicon.svg');
    if (fs.existsSync(svgPath)) {
      const svg = fs.readFileSync(svgPath, 'utf8');
      return new NextResponse(svg, {
        status: 200,
        headers: {
          'Content-Type': 'image/svg+xml; charset=utf-8',
          'Cache-Control': 'public, max-age=86400, s-maxage=31536000, immutable',
        },
      });
    }
  } catch {
    // fallback redirect
  }

  return NextResponse.redirect('https://edvouralearninghub.com/favicon.svg', 307);
}
