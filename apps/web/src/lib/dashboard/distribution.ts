import { supabaseAdmin } from '@/utils/supabase/admin';
import { normalizeSubjectName } from '@/lib/ai/lessonNoteBlueprints';

type AiWorkflowNotificationEvent =
  | 'SUBMITTED_FOR_REVIEW'
  | 'APPROVED'
  | 'REJECTED'
  | 'REQUEST_CHANGES';

type AiContentRow = {
  id: string;
  title: string | null;
  subject: string | null;
  topic: string | null;
  grade: string | null;
  content_type: string | null;
  task_type: string | null;
  content_json: Record<string, unknown> | null;
  generated_by_user_id: string | null;
  status: string | null;
};

type PublishOptions = {
  actorUserId: string;
  allowedStatuses?: string[];
};

function canonicalize(value: string | null | undefined) {
  return (value ?? '').trim().toLowerCase().replace(/\s+/g, ' ');
}

function canonicalizeGrade(value: string | null | undefined) {
  const raw = canonicalize(value).replace(/_/g, ' ');
  const match = raw.match(/grade\s*(\d{1,2})|^(\d{1,2})$/i);
  const digit = match?.[1] ?? match?.[2];
  return digit ? `grade ${digit}` : raw;
}

async function insertNotifications(params: {
  actorUserId: string;
  recipientUserIds: string[];
  title: string;
  body: string;
  data: Record<string, unknown>;
}) {
  const recipientUserIds = Array.from(
    new Set(params.recipientUserIds.filter((entry) => typeof entry === 'string' && entry.length > 0)),
  );

  if (recipientUserIds.length === 0) {
    return;
  }

  const notifications = recipientUserIds.map((recipientUserId) => ({
    recipient_user_id: recipientUserId,
    actor_user_id: params.actorUserId,
    kind: 'admin_alert',
    title: params.title,
    body: params.body,
    status: 'unread',
    data: params.data,
  }));

  const { data: createdRows, error } = await supabaseAdmin
    .from('notifications')
    .insert(notifications)
    .select('id');

  if (error || !createdRows) {
    throw new Error(error?.message || 'Failed to create dashboard notifications.');
  }

  await supabaseAdmin.from('notification_deliveries').insert(
    createdRows.map((row) => ({
      notification_id: row.id,
      channel: 'in_app',
      delivery_status: 'queued',
      provider: 'edvoura-dashboard',
      attempted_at: new Date().toISOString(),
    })),
  );
}

async function listSuperAdminIds() {
  const { data, error } = await supabaseAdmin
    .from('user_roles')
    .select('user_id')
    .eq('role', 'super_admin');

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []).map((entry) => entry.user_id);
}

function buildAiContentLabel(content: Pick<AiContentRow, 'subject' | 'topic' | 'title'>) {
  const subject = normalizeSubjectName(content.subject ?? 'General Studies');
  const topic = (content.topic ?? '').trim();
  const title = (content.title ?? '').trim();

  if (subject && topic) {
    return `${subject} - ${topic}`;
  }

  return title || subject || 'AI content';
}

async function resolveGradeLevel(gradeLabel: string | null | undefined) {
  const target = canonicalizeGrade(gradeLabel);
  const { data, error } = await supabaseAdmin
    .from('grade_levels')
    .select('id, code, display_name, band_id');

  if (error) {
    throw new Error(error.message);
  }

  const match = (data ?? []).find(
    (entry) =>
      canonicalizeGrade(entry.display_name) === target || canonicalizeGrade(entry.code) === target,
  );

  if (!match) {
    throw new Error(`Unable to resolve grade level for "${gradeLabel ?? 'unknown grade'}".`);
  }

  return match;
}

async function resolveSubject(subjectLabel: string | null | undefined) {
  const normalizedSubject = normalizeSubjectName(subjectLabel ?? 'General Studies');

  const { data: existing, error: existingError } = await supabaseAdmin
    .from('subjects')
    .select('id, name')
    .ilike('name', normalizedSubject)
    .maybeSingle();

  if (existingError) {
    throw new Error(existingError.message);
  }

  if (existing) {
    return existing;
  }

  const { data: created, error: createdError } = await supabaseAdmin
    .from('subjects')
    .insert({
      name: normalizedSubject,
      slug: normalizedSubject.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      is_core: true,
      is_active: true,
    })
    .select('id, name')
    .single();

  if (createdError || !created) {
    throw new Error(createdError?.message || 'Unable to create subject for dashboard delivery.');
  }

  return created;
}

async function ensureClassForGradeAudience(params: {
  subjectLabel: string | null | undefined;
  gradeLabel: string | null | undefined;
  primaryTutorUserId: string;
  actorUserId: string;
}) {
  const [subject, gradeLevel] = await Promise.all([
    resolveSubject(params.subjectLabel),
    resolveGradeLevel(params.gradeLabel),
  ]);

  const { data: existingClassroom, error: classLookupError } = await supabaseAdmin
    .from('classes')
    .select('id')
    .eq('primary_tutor_user_id', params.primaryTutorUserId)
    .eq('subject_id', subject.id)
    .eq('grade_level_id', gradeLevel.id)
    .in('status', ['draft', 'active'])
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (classLookupError) {
    throw new Error(classLookupError.message);
  }

  let classroom = existingClassroom;

  if (!classroom) {
    const { data: createdClass, error: createError } = await supabaseAdmin
      .from('classes')
      .insert({
        subject_id: subject.id,
        grade_band_id: gradeLevel.band_id,
        grade_level_id: gradeLevel.id,
        title: `${gradeLevel.display_name} ${subject.name}`,
        status: 'active',
        primary_tutor_user_id: params.primaryTutorUserId,
        created_by_user_id: params.actorUserId,
        starts_on: new Date().toISOString(),
      })
      .select('id')
      .single();

    if (createError || !createdClass) {
      throw new Error(createError?.message || 'Unable to create class for published content.');
    }

    classroom = createdClass;
  }

  const { data: students, error: studentError } = await supabaseAdmin
    .from('student_profiles')
    .select('user_id')
    .eq('grade_level_id', gradeLevel.id);

  if (studentError) {
    throw new Error(studentError.message);
  }

  if ((students ?? []).length > 0) {
    await supabaseAdmin.from('class_enrollments').upsert(
      (students ?? []).map((student) => ({
        class_id: classroom.id,
        student_user_id: student.user_id,
        status: 'active',
      })),
      { onConflict: 'class_id,student_user_id' },
    );
  }

  return {
    classId: classroom.id,
    gradeLevelId: gradeLevel.id,
    subjectId: subject.id,
    subjectName: subject.name,
    gradeDisplayName: gradeLevel.display_name,
  };
}

async function notifyParentsForClassroomItem(params: {
  actorUserId: string;
  classId: string;
  title: string;
  body: string;
  data: Record<string, unknown>;
}) {
  const { data: enrollments, error: enrollmentError } = await supabaseAdmin
    .from('class_enrollments')
    .select('student_user_id')
    .eq('class_id', params.classId)
    .eq('status', 'active');

  if (enrollmentError) {
    throw new Error(enrollmentError.message);
  }

  const studentIds = Array.from(new Set((enrollments ?? []).map((entry) => entry.student_user_id)));
  if (studentIds.length === 0) {
    return;
  }

  const { data: parentLinks, error: parentError } = await supabaseAdmin
    .from('parent_student_links')
    .select('parent_user_id, student_user_id')
    .in('student_user_id', studentIds)
    .eq('is_active', true);

  if (parentError) {
    throw new Error(parentError.message);
  }

  const childIdsByParentId = new Map<string, string[]>();
  for (const link of parentLinks ?? []) {
    const existing = childIdsByParentId.get(link.parent_user_id) ?? [];
    existing.push(link.student_user_id);
    childIdsByParentId.set(link.parent_user_id, existing);
  }

  for (const [parentUserId, relatedStudentIds] of childIdsByParentId.entries()) {
    await insertNotifications({
      actorUserId: params.actorUserId,
      recipientUserIds: [parentUserId],
      title: params.title,
      body: params.body,
      data: {
        ...params.data,
        studentUserIds: Array.from(new Set(relatedStudentIds)),
      },
    });
  }
}

function getPublishInstructions(content: AiContentRow) {
  const payload = content.content_json ?? {};
  const summary =
    typeof payload.lesson_summary === 'string'
      ? payload.lesson_summary
      : typeof payload.summary === 'string'
        ? payload.summary
        : typeof payload.explanation === 'string'
          ? payload.explanation
          : typeof payload.description === 'string'
            ? payload.description
            : `Study the published ${content.content_type ?? 'learning resource'} carefully.`;

  return summary;
}

export async function notifyAiWorkflowEvent(params: {
  event: AiWorkflowNotificationEvent;
  contentId: string;
  actorUserId: string;
  reviewNote?: string | null;
}) {
  const { data: content, error } = await supabaseAdmin
    .from('ai_generated_content')
    .select('id,title,subject,topic,grade,generated_by_user_id')
    .eq('id', params.contentId)
    .single();

  if (error || !content) {
    throw new Error(error?.message || 'Unable to load AI content for workflow notifications.');
  }

  const label = buildAiContentLabel(content);
  const reviewSuffix = params.reviewNote ? ` Note: ${params.reviewNote}` : '';

  if (params.event === 'SUBMITTED_FOR_REVIEW') {
    await insertNotifications({
      actorUserId: params.actorUserId,
      recipientUserIds: await listSuperAdminIds(),
      title: 'AI content submitted for review',
      body: `${label} is waiting for super admin review.${reviewSuffix}`,
      data: {
        contentId: content.id,
        event: params.event,
        route: '/dash/admin/ai',
      },
    });
    return;
  }

  if (!content.generated_by_user_id) {
    return;
  }

  const messageByEvent: Record<Exclude<AiWorkflowNotificationEvent, 'SUBMITTED_FOR_REVIEW'>, string> = {
    APPROVED: `${label} was approved and is ready for publishing.${reviewSuffix}`,
    REJECTED: `${label} was rejected during review.${reviewSuffix}`,
    REQUEST_CHANGES: `${label} needs changes before it can move forward.${reviewSuffix}`,
  };

  await insertNotifications({
    actorUserId: params.actorUserId,
    recipientUserIds: [content.generated_by_user_id],
    title: `AI content ${params.event.toLowerCase().replace('_', ' ')}`,
    body: messageByEvent[params.event],
    data: {
      contentId: content.id,
      event: params.event,
      route: '/dash/tutor/ai',
    },
  });
}

export async function publishAiContentAndDistribute(contentId: string, options: PublishOptions) {
  const { data: content, error } = await supabaseAdmin
    .from('ai_generated_content')
    .select(
      'id,title,subject,topic,grade,content_type,task_type,content_json,generated_by_user_id,status',
    )
    .eq('id', contentId)
    .single<AiContentRow>();

  if (error || !content) {
    throw new Error(error?.message || 'Content not found.');
  }

  const normalizedStatus = String(content.status ?? '').toUpperCase();
  if (
    Array.isArray(options.allowedStatuses) &&
    options.allowedStatuses.length > 0 &&
    !options.allowedStatuses.includes(normalizedStatus)
  ) {
    throw new Error(`Content must be in ${options.allowedStatuses.join(', ')} before publishing.`);
  }

  if (!content.generated_by_user_id) {
    throw new Error('Published content is missing a generating tutor.');
  }

  const classroom = await ensureClassForGradeAudience({
    subjectLabel: content.subject,
    gradeLabel: content.grade,
    primaryTutorUserId: content.generated_by_user_id,
    actorUserId: options.actorUserId,
  });

  const existingEvent = await supabaseAdmin
    .from('learning_activity_events')
    .select('id')
    .eq('class_id', classroom.classId)
    .contains('payload', { ai_content_id: content.id })
    .limit(1)
    .maybeSingle();

  if (existingEvent.error) {
    throw new Error(existingEvent.error.message);
  }

  const label = buildAiContentLabel(content);
  const instructions = getPublishInstructions(content);

  if (!existingEvent.data) {
    if (content.content_type === 'quiz' || content.content_type === 'spelling_bee') {
      const assignmentTitle =
        content.content_type === 'spelling_bee' ? `Spelling Bee: ${label}` : label;

      const { data: assignment, error: assignmentError } = await supabaseAdmin
        .from('assignments')
        .insert({
          class_id: classroom.classId,
          title: assignmentTitle,
          instructions,
          status: 'published',
          points_possible: 100,
          created_by_user_id: options.actorUserId,
          due_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        })
        .select('id, title')
        .single();

      if (assignmentError || !assignment) {
        throw new Error(assignmentError?.message || 'Unable to publish assignment payload.');
      }

      await supabaseAdmin.from('learning_activity_events').insert({
        event_type: content.content_type === 'spelling_bee' ? 'spelling_bee_created' : 'lesson_resource_uploaded',
        actor_user_id: options.actorUserId,
        class_id: classroom.classId,
        payload: {
          assignment_id: assignment.id,
          title: assignment.title,
          description: instructions,
          ai_content_id: content.id,
        },
      });
    } else {
      await supabaseAdmin.from('learning_activity_events').insert({
        event_type: 'lesson_resource_uploaded',
        actor_user_id: options.actorUserId,
        class_id: classroom.classId,
        payload: {
          title: label,
          description: instructions,
          ai_content_id: content.id,
          content_type: content.content_type ?? 'lesson_note',
        },
      });
    }
  }

  const now = new Date().toISOString();
  const { data: updated, error: updateError } = await supabaseAdmin
    .from('ai_generated_content')
    .update({
      status: 'PUBLISHED',
      reviewed_by_user_id: options.actorUserId,
      published_at: now,
    })
    .eq('id', content.id)
    .select('id,status')
    .single();

  if (updateError || !updated) {
    throw new Error(updateError?.message || 'Unable to mark content as published.');
  }

  await notifyParentsForClassroomItem({
    actorUserId: options.actorUserId,
    classId: classroom.classId,
    title: 'New learning content published',
    body: `${label} is now available on your child dashboard.`,
    data: {
      contentId: content.id,
      route:
        content.content_type === 'spelling_bee'
          ? '/dash/student/spelling-bee'
          : content.content_type === 'quiz'
            ? '/dash/student/quiz'
            : '/dash/student/notes',
      classId: classroom.classId,
    },
  });

  await insertNotifications({
    actorUserId: options.actorUserId,
    recipientUserIds: [content.generated_by_user_id],
    title: 'AI content published',
    body: `${label} is now live on the learner dashboards.`,
    data: {
      contentId: content.id,
      event: 'PUBLISHED',
      route: '/dash/tutor/ai',
    },
  });

  return {
    record: updated,
    classId: classroom.classId,
    gradeLevelId: classroom.gradeLevelId,
    subjectId: classroom.subjectId,
  };
}

export async function notifyParentsOfClassroomPublication(params: {
  actorUserId: string;
  classId: string;
  title: string;
  body: string;
  data?: Record<string, unknown>;
}) {
  await notifyParentsForClassroomItem({
    actorUserId: params.actorUserId,
    classId: params.classId,
    title: params.title,
    body: params.body,
    data: params.data ?? {},
  });
}
