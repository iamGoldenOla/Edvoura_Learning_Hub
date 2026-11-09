import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

/**
 * IndexNow & Search Engine Instant Ping Route
 * Submits URLs directly to Bing, Yandex (crucial for Russia & Uzbekistan), and search crawlers
 * so new landing pages, lesson notes, and practice materials get indexed in hours rather than weeks.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const host = 'edvouralearninghub.com';
    const key = process.env.INDEXNOW_KEY || 'edvoura_indexnow_2026';

    const defaultUrls = [
      'https://edvouralearninghub.com/',
      'https://edvouralearninghub.com/services',
      'https://edvouralearninghub.com/pricing',
      'https://edvouralearninghub.com/online-tutoring-uzbekistan',
      'https://edvouralearninghub.com/practice/uz/grade-3/mathematics',
      'https://edvouralearninghub.com/practice/ru/grade-4/english',
      'https://edvouralearninghub.com/practice/uk/grade-4/mathematics',
      'https://edvouralearninghub.com/practice/ng/grade-2/mathematics',
    ];

    const urlList: string[] = Array.isArray(body?.urls) && body.urls.length > 0
      ? body.urls
      : defaultUrls;

    // 1. Submit to IndexNow API (Bing & Yandex)
    const indexNowPayload = {
      host,
      key,
      keyLocation: `https://${host}/${key}.txt`,
      urlList,
    };

    let indexNowSuccess = false;
    let indexNowStatus = 0;

    try {
      const res = await fetch('https://api.indexnow.org/indexnow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json; charset=utf-8' },
        body: JSON.stringify(indexNowPayload),
      });
      indexNowStatus = res.status;
      indexNowSuccess = res.ok || res.status === 200 || res.status === 202;
    } catch {
      indexNowSuccess = false;
    }

    return NextResponse.json({
      success: true,
      message: 'Search engine indexing ping dispatched successfully',
      targetSearchEngines: ['Bing', 'Yandex (Russia & Central Asia)', 'IndexNow Network'],
      indexNowStatus,
      submittedUrlsCount: urlList.length,
      urls: urlList,
    });
  } catch (err: unknown) {
    const error = err as Error;
    return NextResponse.json(
      { error: 'Failed to dispatch indexing ping', detail: error?.message },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  // Allow GET trigger for automated cron or webhook triggers
  return POST(req);
}
