import ParentMonitorClient from '@/components/dashboards/ParentMonitorClient';
import { getParentDashboardData, requireAppViewer } from '@/lib/app-context';
import { createClient } from '@/utils/supabase/server';

export default async function MonitorPage() {
  await requireAppViewer();
  const parentData = await getParentDashboardData();
  const supabase = await createClient();

  const childIds = parentData.children.map((c) => c.userId);

  // Fetch real lessons for all linked children's classes
  let lessons: Array<{
    id: string;
    title: string;
    scheduledStartAt: string;
    scheduledEndAt: string;
    status: string;
    classTitle: string;
    subjectName: string;
    tutorName: string;
    childUserId: string;
  }> = [];

  let attendance: Array<{
    id: string;
    lessonTitle: string;
    classTitle: string;
    scheduledAt: string;
    status: string;
    childUserId: string;
  }> = [];

  if (childIds.length > 0) {
    // Get class enrollments for all children
    const { data: enrollmentsData = [] } = await supabase
      .from('class_enrollments')
      .select('class_id, student_user_id')
      .in('student_user_id', childIds)
      .eq('status', 'active');

    const normalizedEnrollments = enrollmentsData ?? [];
    const classIds = [...new Set(normalizedEnrollments.map((e) => e.class_id))];

    if (classIds.length > 0) {
      // Fetch classes + subjects + tutors
      const { data: classesData = [] } = await supabase
        .from('classes')
        .select('id, title, subject_id, primary_tutor_user_id')
        .in('id', classIds);

      const normalizedClasses = classesData ?? [];
      const subjectIds = [...new Set(normalizedClasses.map((c) => c.subject_id).filter(Boolean))];
      const tutorIds = [...new Set(normalizedClasses.map((c) => c.primary_tutor_user_id).filter(Boolean))];

      const [{ data: subjectsData = [] }, { data: tutorsData = [] }] = await Promise.all([
        subjectIds.length
          ? supabase.from('subjects').select('id, name').in('id', subjectIds)
          : Promise.resolve({ data: [] as Array<{ id: string; name: string }> }),
        tutorIds.length
          ? supabase.from('profiles').select('id, full_name').in('id', tutorIds)
          : Promise.resolve({ data: [] as Array<{ id: string; full_name: string | null }> }),
      ]);

      const subjectById = new Map((subjectsData ?? []).map((s) => [s.id, s.name]));
      const tutorById = new Map((tutorsData ?? []).map((t) => [t.id, t.full_name ?? 'Tutor']));
      const classById = new Map(normalizedClasses.map((c) => [c.id, c]));

      // Map class_id → child_user_ids
      const childByClassId = new Map<string, string[]>();
      normalizedEnrollments.forEach((e) => {
        const current = childByClassId.get(e.class_id) ?? [];
        current.push(e.student_user_id);
        childByClassId.set(e.class_id, current);
      });

      // Fetch upcoming lessons
      const { data: lessonsData = [] } = await supabase
        .from('lessons')
        .select('id, class_id, title, scheduled_start_at, scheduled_end_at, status')
        .in('class_id', classIds)
        .order('scheduled_start_at', { ascending: true })
        .limit(20);

      const normalizedLessons = lessonsData ?? [];

      lessons = normalizedLessons.flatMap((lesson) => {
        const relatedClass = classById.get(lesson.class_id);
        const childUserIds = childByClassId.get(lesson.class_id) ?? [];
        return childUserIds.map((childUserId) => ({
          id: `${lesson.id}-${childUserId}`,
          title: lesson.title,
          scheduledStartAt: lesson.scheduled_start_at,
          scheduledEndAt: lesson.scheduled_end_at,
          status: lesson.status,
          classTitle: relatedClass?.title ?? 'Class',
          subjectName: relatedClass ? subjectById.get(relatedClass.subject_id) ?? 'General' : 'General',
          tutorName: relatedClass?.primary_tutor_user_id ? tutorById.get(relatedClass.primary_tutor_user_id) ?? 'Tutor' : 'Tutor',
          childUserId,
        }));
      });

      // Fetch attendance records
      const { data: attendanceData = [] } = await supabase
        .from('lesson_attendance')
        .select('id, lesson_id, student_user_id, status')
        .in('student_user_id', childIds)
        .order('created_at', { ascending: false })
        .limit(30);

      const normalizedAttendance = attendanceData ?? [];
      const attendanceLessonIds = [...new Set(normalizedAttendance.map((a) => a.lesson_id))];

      const { data: attendanceLessonsData = [] } = attendanceLessonIds.length
        ? await supabase.from('lessons').select('id, class_id, title, scheduled_start_at').in('id', attendanceLessonIds)
        : { data: [] as Array<{ id: string; class_id: string; title: string; scheduled_start_at: string }> };

      const attendanceLessonById = new Map((attendanceLessonsData ?? []).map((l) => [l.id, l]));

      attendance = normalizedAttendance.map((a) => {
        const lesson = attendanceLessonById.get(a.lesson_id);
        const relatedClass = lesson ? classById.get(lesson.class_id) : null;
        return {
          id: a.id,
          lessonTitle: lesson?.title ?? 'Lesson',
          classTitle: relatedClass?.title ?? 'Class',
          scheduledAt: lesson?.scheduled_start_at ?? '',
          status: a.status ?? 'absent',
          childUserId: a.student_user_id,
        };
      });
    }
  }

  return (
    <ParentMonitorClient
      linkedChildren={parentData.children}
      lessons={lessons}
      attendance={attendance}
    />
  );
}
