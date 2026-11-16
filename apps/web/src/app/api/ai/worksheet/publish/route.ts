import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // 1. Authenticate user
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json().catch(() => null);
    if (!body || !body.worksheet) {
      return NextResponse.json({ error: 'Missing worksheet data' }, { status: 400 });
    }

    const { worksheet, lessonId, pupilName } = body;

    // 2. Resolve Target Student User ID
    let targetStudentId: string | null = null;
    let targetClassId: string | null = null;

    if (lessonId && lessonId.startsWith('1on1-')) {
      targetStudentId = lessonId.replace('1on1-', '');
    } else if (lessonId) {
      // Check lesson record
      const { data: lessonData } = await supabase
        .from('lessons')
        .select('id, class_id')
        .eq('id', lessonId)
        .maybeSingle();

      if (lessonData?.class_id) {
        targetClassId = lessonData.class_id;
      }
    }

    // If pupil name is provided (e.g. Titomi Lawson) and no targetStudentId yet, search profile
    if (!targetStudentId && pupilName) {
      const { data: matchedUser } = await supabase
        .from('profiles')
        .select('id')
        .ilike('full_name', `%${pupilName}%`)
        .maybeSingle();

      if (matchedUser?.id) {
        targetStudentId = matchedUser.id;
      }
    }

    // 3. Publish to learning_activity_events (Instantly reflects in student library & notes, and tutor builder)
    const eventPayload = {
      title: worksheet.title,
      description: `Curriculum worksheet on ${worksheet.title} with ${worksheet.questions?.length || 0} exercises`,
      subject: worksheet.subject,
      grade: worksheet.grade,
      target_student_id: targetStudentId,
      student_name: pupilName || 'Pupil',
      worksheet_data: worksheet,
      resource_type: 'worksheet',
      is_ai_worksheet: true,
      created_at: new Date().toISOString(),
    };

    const { error: eventError } = await supabase.from('learning_activity_events').insert({
      event_type: 'lesson_resource_uploaded',
      actor_user_id: user.id,
      class_id: targetClassId,
      payload: eventPayload,
    });

    if (eventError) {
      console.warn('Error inserting activity event:', eventError);
    }

    // 4. Also insert into resources table so it reflects in general resources list
    try {
      await supabase.from('resources').insert({
        title: worksheet.title,
        file_path: '',
        description: JSON.stringify(worksheet),
      });
    } catch (_) {}

    return NextResponse.json({
      success: true,
      message: `Worksheet "${worksheet.title}" has been published to the Tutor Dashboard and pushed to ${pupilName || 'the student'}'s Library & Notes!`,
      targetStudentId,
    });
  } catch (error: any) {
    console.error('Worksheet publish error:', error);
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}
