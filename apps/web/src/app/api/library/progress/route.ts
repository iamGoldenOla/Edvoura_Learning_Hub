import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/utils/supabase/admin';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get('studentId');

    if (!studentId) {
      return NextResponse.json({ error: 'studentId is required' }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from('storybook_reading_progress')
      .select('*, storybooks(title, cover_image_url)')
      .eq('student_id', studentId);

    if (error) {
      console.error('Error fetching progress:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data });
  } catch (error: any) {
    console.error('Error in GET /api/library/progress:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { studentId, storybookId, pagesRead, totalPages, status } = body;

    if (!studentId || !storybookId) {
      return NextResponse.json({ error: 'studentId and storybookId are required' }, { status: 400 });
    }

    const isCompleted = status === 'completed' || pagesRead >= totalPages;
    const updateData: any = {
      pages_read: pagesRead,
      total_pages: totalPages,
      status: isCompleted ? 'completed' : 'started',
    };

    if (isCompleted) {
      updateData.completed_at = new Date().toISOString();
    }

    const { data, error } = await supabaseAdmin
      .from('storybook_reading_progress')
      .upsert({
        student_id: studentId,
        storybook_id: storybookId,
        ...updateData,
      }, { onConflict: 'student_id, storybook_id' })
      .select()
      .single();

    if (error) {
      console.error('Error updating progress:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    console.error('Error in POST /api/library/progress:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
