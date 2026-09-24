import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/utils/supabase/admin';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, author, content_body, rights_attestation, uploaded_by, language, grade_band } = body;

    if (!title || !author || !content_body || rights_attestation !== true) {
      return NextResponse.json({ error: 'Missing required fields or invalid attestation' }, { status: 400 });
    }

    const { data: storybook, error: insertError } = await supabaseAdmin
      .from('storybooks')
      .insert({
        title,
        author,
        content_body,
        rights_attestation,
        uploaded_by,
        language: language || 'English',
        grade_band: grade_band || '1-3',
        status: 'pending_review',
        source: 'educator-upload'
      })
      .select()
      .single();

    if (insertError) {
      console.error('Error inserting storybook:', insertError);
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }

    const { error: queueError } = await supabaseAdmin
      .from('educator_review_queue')
      .insert({
        item_id: storybook.id,
        item_type: 'storybook',
        status: 'pending',
        submitted_by: uploaded_by,
        notes: 'content_type: storybook',
      });

    if (queueError) {
      console.error('Error adding to review queue:', queueError);
      // We might not want to fail the whole request if queue fails, but it's safe to report it.
      // Alternatively, we could rollback the storybook insert.
    }

    return NextResponse.json({ success: true, storybook });
  } catch (error: any) {
    console.error('Error in POST /api/library/books/upload:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
