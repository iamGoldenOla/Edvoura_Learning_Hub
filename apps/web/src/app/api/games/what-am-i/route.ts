import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/utils/supabase/admin';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const gradeBand = searchParams.get('gradeBand') || '1-3';

  try {
    const { data, error } = await supabaseAdmin
      .from('riddle_sequences')
      .select('*')
      .eq('status', 'approved')
      .eq('grade_band', gradeBand);

    if (error) {
      console.error('Error fetching what-am-i riddles:', error);
      return NextResponse.json({ error: 'Failed to fetch riddles' }, { status: 500 });
    }

    if (!data || data.length === 0) {
      return NextResponse.json({ riddles: [] });
    }

    const shuffled = data.sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, 8);

    return NextResponse.json({ riddles: selected });
  } catch (err: any) {
    console.error('Unexpected error fetching riddles:', err);
    return NextResponse.json({ error: 'Unexpected error' }, { status: 500 });
  }
}
