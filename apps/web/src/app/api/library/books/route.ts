import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/utils/supabase/admin';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const gradeBand = searchParams.get('gradeBand');
    const language = searchParams.get('language');
    const genre = searchParams.get('genre');
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '12', 10);

    const from = (page - 1) * limit;
    const to = from + limit - 1;

    let query = supabaseAdmin
      .from('storybooks')
      .select('*', { count: 'exact' })
      .eq('status', 'approved')
      .order('created_at', { ascending: false })
      .range(from, to);

    if (gradeBand && gradeBand !== 'all') {
      query = query.eq('grade_band', gradeBand);
    }
    if (language && language !== 'all') {
      query = query.eq('language', language);
    }
    if (genre && genre !== 'all') {
      query = query.eq('genre', genre);
    }

    const { data, error, count } = await query;

    if (error) {
      console.error('Error fetching storybooks:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      data,
      count,
      page,
      limit,
      totalPages: count ? Math.ceil(count / limit) : 0,
    });
  } catch (error: any) {
    console.error('Error in GET /api/library/books:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
