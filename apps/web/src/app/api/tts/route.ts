import { NextRequest, NextResponse } from 'next/server';

/**
 * Server-side TTS proxy.
 *
 * The browser cannot directly load audio from translate.google.com due to
 * CORS restrictions. This route fetches the TTS audio on the server
 * (where CORS doesn't apply) and streams it back to the client as an
 * audio response that can be played via an HTML <audio> element.
 *
 * Usage: /api/tts?text=Hello+world&lang=en-gb
 */
export async function GET(request: NextRequest) {
  const text = request.nextUrl.searchParams.get('text') ?? '';
  const lang = request.nextUrl.searchParams.get('lang') ?? 'en-gb';

  if (!text.trim()) {
    return NextResponse.json({ error: 'Missing text parameter' }, { status: 400 });
  }

  // Limit text length to prevent abuse
  const safeText = text.slice(0, 500);

  try {
    const ttsUrl = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(safeText)}&tl=${encodeURIComponent(lang)}&client=tw-ob`;

    const response = await fetch(ttsUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Referer': 'https://translate.google.com/',
      },
    });

    if (!response.ok) {
      throw new Error(`TTS upstream returned ${response.status}`);
    }

    const audioBuffer = await response.arrayBuffer();

    return new NextResponse(audioBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'audio/mpeg',
        'Cache-Control': 'public, max-age=86400, s-maxage=86400',
        'Content-Length': String(audioBuffer.byteLength),
      },
    });
  } catch (error) {
    console.error('[TTS Proxy] Failed:', error);
    return NextResponse.json(
      { error: 'TTS generation failed' },
      { status: 502 },
    );
  }
}
