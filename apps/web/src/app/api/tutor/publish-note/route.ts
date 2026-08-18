import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/utils/supabase/admin';
import { OFFICIAL_CURRICULUM_DATABASE, PRIMARY_1_OFFICIAL_NOTES } from '@/lib/curriculumNotes';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { noteId, isPublished, gradeFilter, targetScope, targetStudentName } = body;

    if (!noteId) {
      return NextResponse.json({ error: 'Missing noteId parameter' }, { status: 400 });
    }

    const selectedGrade = gradeFilter || 'grade_3';
    const allNotes = OFFICIAL_CURRICULUM_DATABASE[selectedGrade] ?? PRIMARY_1_OFFICIAL_NOTES;
    const targetNote = allNotes.find((n) => n.id === noteId);

    const status = isPublished ? 'PUBLISHED' : 'DRAFT';

    if (targetNote) {
      const payload = {
        id: `official_pub_${targetNote.id}`,
        task_type: 'GENERATE_LESSON_NOTE',
        title: targetNote.title,
        subject: targetNote.subjectName,
        topic: targetNote.title,
        grade: targetNote.gradeCode || selectedGrade || 'grade_3',
        status: status,
        content_json: {
          lesson_summary: targetNote.description,
          explanation: targetNote.description,
          key_points: [
            `Complete term-by-term curriculum study note for ${targetNote.subjectName}.`,
            `Covering core learning objectives, key vocabulary, and practice concepts.`,
          ],
          official_file_url: targetNote.fileUrl,
          file_name: targetNote.fileName,
          target_scope: targetScope || 'all_class',
          target_student_name: targetStudentName || '',
        },
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabaseAdmin
        .from('ai_generated_content')
        .upsert(payload);

      if (error) {
        console.error('[PUBLISH NOTE DB ERROR]', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ success: true, status, note: payload });
    }

    // Also handle custom lesson plans created by tutors
    const { data: customNote } = await supabaseAdmin
      .from('ai_generated_content')
      .select('*')
      .eq('id', noteId)
      .maybeSingle();

    if (customNote) {
      const { error } = await supabaseAdmin
        .from('ai_generated_content')
        .update({
          status,
          updated_at: new Date().toISOString(),
        })
        .eq('id', noteId);

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ success: true, status });
    }

    return NextResponse.json({ error: 'Note not found' }, { status: 404 });
  } catch (err) {
    console.error('[PUBLISH NOTE API ERROR]', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Internal server error' },
      { status: 500 },
    );
  }
}
