import {
  createAssignmentSchema,
  createClassSchema,
  createLessonSchema,
  createQuizSchema,
  recordAttendanceSchema,
  type CreateAssignmentDto,
  type CreateClassDto,
  type CreateLessonDto,
  type CreateQuizDto,
  type RecordAttendanceDto,
} from '@edvoura/contracts';
import { Injectable } from '@nestjs/common';

import { DatabaseService } from '../../common/database/database.service.js';
import { ApplicationError } from '../../common/errors/application-error.js';
import { LiveSessionService } from './live-session.service.js';

@Injectable()
export class AcademicsService {
  constructor(
    private readonly databaseService: DatabaseService,
    private readonly liveSessionService: LiveSessionService,
  ) {}

  async createClass(creatorUserId: string, dto: CreateClassDto) {
    const parsed = createClassSchema.parse(dto);

    return this.databaseService.db
      .insertInto('classes')
      .values({
        subject_id: parsed.subjectId,
        grade_band_id: parsed.gradeBandId,
        title: parsed.title,
        description: parsed.description ?? null,
        status: 'draft',
        primary_tutor_user_id: null,
        max_students: parsed.maxStudents ?? null,
        starts_on: parsed.startsOn ?? null,
        ends_on: parsed.endsOn ?? null,
        created_by_user_id: creatorUserId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .returning(['id', 'title', 'status', 'created_at'])
      .executeTakeFirstOrThrow();
  }

  async listClasses(options: { userId: string; role: string }) {
    let query = this.databaseService.db
      .selectFrom('classes as c')
      .innerJoin('subjects as s', 's.id', 'c.subject_id')
      .innerJoin('grade_bands as gb', 'gb.id', 'c.grade_band_id')
      .select([
        'c.id',
        'c.title',
        'c.description',
        'c.status',
        'c.primary_tutor_user_id as primaryTutorUserId',
        'c.max_students as maxStudents',
        'c.starts_on as startsOn',
        'c.ends_on as endsOn',
        'c.created_at as createdAt',
        's.name as subjectName',
        's.slug as subjectSlug',
        'gb.code as gradeBandCode',
        'gb.name as gradeBandName',
      ]);

    if (options.role === 'tutor') {
      query = query.where('c.primary_tutor_user_id', '=', options.userId);
    }

    if (options.role === 'student') {
      query = query
        .innerJoin('class_enrollments as ce', 'ce.class_id', 'c.id')
        .where('ce.student_user_id', '=', options.userId)
        .where('ce.status', '=', 'active');
    }

    return query.orderBy('c.created_at', 'desc').execute();
  }

  async getStudentDashboard(studentUserId: string) {
    const profile = await this.databaseService.db
      .selectFrom('profiles as p')
      .innerJoin('student_profiles as sp', 'sp.user_id', 'p.id')
      .innerJoin('grade_levels as gl', 'gl.id', 'sp.grade_level_id')
      .innerJoin('grade_bands as gb', 'gb.id', 'sp.learner_band_id')
      .select([
        'p.id as userId',
        'p.full_name as fullName',
        'p.email',
        'p.avatar_path as avatarPath',
        'gl.code as gradeLevelCode',
        'gl.display_name as gradeLevelName',
        'gb.code as gradeBandCode',
        'gb.name as gradeBandName',
        'sp.school_name as schoolName',
        'sp.academic_goal_notes as academicGoalNotes',
      ])
      .where('p.id', '=', studentUserId)
      .executeTakeFirst();

    if (!profile) {
      throw new ApplicationError(
        404,
        'student_profile_not_found',
        'Student profile not found. Complete onboarding first.',
      );
    }

    const enrollments = await this.databaseService.db
      .selectFrom('class_enrollments as ce')
      .innerJoin('classes as c', 'c.id', 'ce.class_id')
      .innerJoin('subjects as s', 's.id', 'c.subject_id')
      .leftJoin('profiles as tutor', 'tutor.id', 'c.primary_tutor_user_id')
      .select([
        'ce.id',
        'ce.class_id as classId',
        'ce.status',
        'ce.enrolled_at as enrolledAt',
        'c.title as classTitle',
        'c.description as classDescription',
        'c.starts_on as startsOn',
        'c.ends_on as endsOn',
        's.name as subjectName',
        's.slug as subjectSlug',
        'tutor.full_name as tutorName',
      ])
      .where('ce.student_user_id', '=', studentUserId)
      .where('ce.status', '=', 'active')
      .orderBy('ce.enrolled_at', 'desc')
      .execute();

    const upcomingLessons = await this.databaseService.db
      .selectFrom('class_enrollments as ce')
      .innerJoin('classes as c', 'c.id', 'ce.class_id')
      .innerJoin('subjects as s', 's.id', 'c.subject_id')
      .innerJoin('lessons as l', 'l.class_id', 'c.id')
      .leftJoin('private.lesson_live_sessions as lls', 'lls.lesson_id', 'l.id')
      .select([
        'l.id',
        'l.title',
        'l.description',
        'l.provider',
        'l.status',
        'l.scheduled_start_at as scheduledStartAt',
        'l.scheduled_end_at as scheduledEndAt',
        'c.id as classId',
        'c.title as classTitle',
        's.name as subjectName',
        'lls.join_url as joinUrl',
      ])
      .where('ce.student_user_id', '=', studentUserId)
      .where('ce.status', '=', 'active')
      .where('l.scheduled_start_at', '>=', new Date().toISOString())
      .orderBy('l.scheduled_start_at', 'asc')
      .limit(6)
      .execute();

    const assignments = await this.databaseService.db
      .selectFrom('class_enrollments as ce')
      .innerJoin('classes as c', 'c.id', 'ce.class_id')
      .innerJoin('subjects as s', 's.id', 'c.subject_id')
      .innerJoin('assignments as a', 'a.class_id', 'c.id')
      .leftJoin('assignment_submissions as sub', (join) =>
        join.onRef('sub.assignment_id', '=', 'a.id').on('sub.student_user_id', '=', studentUserId),
      )
      .leftJoin('submission_grades as sg', 'sg.submission_id', 'sub.id')
      .select([
        'a.id',
        'a.title',
        'a.instructions',
        'a.status',
        'a.due_at as dueAt',
        'a.points_possible as pointsPossible',
        'c.id as classId',
        'c.title as classTitle',
        's.name as subjectName',
        'sub.id as submissionId',
        'sub.status as submissionStatus',
        'sub.submitted_at as submittedAt',
        'sg.score as score',
        'sg.feedback_text as feedbackText',
        'sg.graded_at as gradedAt',
      ])
      .where('ce.student_user_id', '=', studentUserId)
      .where('ce.status', '=', 'active')
      .orderBy('a.due_at', 'asc')
      .execute();

    const progress = await this.databaseService.db
      .selectFrom('progress_snapshots as ps')
      .leftJoin('subjects as s', 's.id', 'ps.subject_id')
      .select([
        'ps.id',
        'ps.snapshot_date as snapshotDate',
        'ps.attendance_rate as attendanceRate',
        'ps.assignment_completion_rate as assignmentCompletionRate',
        'ps.average_score as averageScore',
        'ps.mastery_notes as masteryNotes',
        's.name as subjectName',
      ])
      .where('ps.student_user_id', '=', studentUserId)
      .orderBy('ps.snapshot_date', 'desc')
      .limit(6)
      .execute();

    const latestProgress = progress[0] ?? null;
    const pendingAssignments = assignments.filter(
      (assignment) =>
        !assignment.submissionStatus ||
        assignment.submissionStatus === 'draft' ||
        assignment.submissionStatus === 'submitted' ||
        assignment.submissionStatus === 'late',
    ).length;
    const completedAssignments = assignments.filter(
      (assignment) =>
        assignment.submissionStatus === 'graded' || assignment.submissionStatus === 'returned',
    ).length;

    return {
      profile,
      stats: {
        activeClasses: enrollments.length,
        pendingAssignments,
        completedAssignments,
        upcomingLessons: upcomingLessons.length,
        averageScore: latestProgress?.averageScore ?? null,
        attendanceRate: latestProgress?.attendanceRate ?? null,
        assignmentCompletionRate: latestProgress?.assignmentCompletionRate ?? null,
      },
      enrollments,
      upcomingLessons,
      assignments,
      progress,
    };
  }

  async createLesson(classId: string, creatorUserId: string, dto: CreateLessonDto) {
    const parsed = createLessonSchema.parse(dto);

    const classRecord = await this.databaseService.db
      .selectFrom('classes')
      .select('id')
      .where('id', '=', classId)
      .executeTakeFirst();

    if (!classRecord) {
      throw new ApplicationError(404, 'class_not_found', 'Class not found.');
    }

    const lesson = await this.databaseService.db
      .insertInto('lessons')
      .values({
        class_id: classId,
        tutor_user_id: parsed.tutorUserId ?? null,
        title: parsed.title,
        description: parsed.description ?? null,
        provider: parsed.provider,
        status: 'draft',
        scheduled_start_at: parsed.scheduledStartAt,
        scheduled_end_at: parsed.scheduledEndAt,
        actual_start_at: null,
        actual_end_at: null,
        meeting_summary: null,
        created_by_user_id: creatorUserId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .returning(['id', 'title', 'status', 'scheduled_start_at', 'scheduled_end_at'])
      .executeTakeFirstOrThrow();

    const session = await this.liveSessionService.provisionSession(
      lesson.id!,
      parsed.provider,
      parsed.scheduledStartAt,
      parsed.scheduledEndAt,
      parsed.title,
    );

    return { ...lesson, liveSession: session };
  }

  async listLessons(classId: string) {
    return this.databaseService.db
      .selectFrom('lessons')
      .select([
        'id',
        'title',
        'description',
        'provider',
        'status',
        'scheduled_start_at as scheduledStartAt',
        'scheduled_end_at as scheduledEndAt',
        'tutor_user_id as tutorUserId',
        'created_at as createdAt',
      ])
      .where('class_id', '=', classId)
      .orderBy('scheduled_start_at', 'asc')
      .execute();
  }

  async createAssignment(classId: string, creatorUserId: string, dto: CreateAssignmentDto) {
    const parsed = createAssignmentSchema.parse(dto);

    const classRecord = await this.databaseService.db
      .selectFrom('classes')
      .select('id')
      .where('id', '=', classId)
      .executeTakeFirst();

    if (!classRecord) {
      throw new ApplicationError(404, 'class_not_found', 'Class not found.');
    }

    return this.databaseService.db
      .insertInto('assignments')
      .values({
        class_id: classId,
        lesson_id: parsed.lessonId ?? null,
        title: parsed.title,
        instructions: parsed.instructions ?? null,
        status: 'draft',
        due_at: parsed.dueAt ?? null,
        points_possible: String(parsed.pointsPossible),
        created_by_user_id: creatorUserId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .returning(['id', 'title', 'status', 'due_at', 'points_possible'])
      .executeTakeFirstOrThrow();
  }

  async listAssignments(classId: string) {
    return this.databaseService.db
      .selectFrom('assignments')
      .select([
        'id',
        'title',
        'instructions',
        'status',
        'due_at as dueAt',
        'points_possible as pointsPossible',
        'lesson_id as lessonId',
        'created_by_user_id as createdByUserId',
        'created_at as createdAt',
      ])
      .where('class_id', '=', classId)
      .orderBy('created_at', 'desc')
      .execute();
  }

  async createQuiz(classId: string, creatorUserId: string, dto: CreateQuizDto) {
    const parsed = createQuizSchema.parse(dto);

    const classRecord = await this.databaseService.db
      .selectFrom('classes')
      .select('id')
      .where('id', '=', classId)
      .executeTakeFirst();

    if (!classRecord) {
      throw new ApplicationError(404, 'class_not_found', 'Class not found.');
    }

    return this.databaseService.db
      .insertInto('quizzes')
      .values({
        class_id: classId,
        lesson_id: parsed.lessonId ?? null,
        title: parsed.title,
        instructions: parsed.instructions ?? null,
        status: 'draft',
        starts_at: parsed.startsAt ?? null,
        ends_at: parsed.endsAt ?? null,
        time_limit_minutes: parsed.timeLimitMinutes ?? null,
        created_by_user_id: creatorUserId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .returning(['id', 'title', 'status', 'starts_at', 'ends_at'])
      .executeTakeFirstOrThrow();
  }

  async recordAttendance(lessonId: string, recorderUserId: string, dto: RecordAttendanceDto) {
    const parsed = recordAttendanceSchema.parse(dto);

    const lessonRecord = await this.databaseService.db
      .selectFrom('lessons')
      .select('id')
      .where('id', '=', lessonId)
      .executeTakeFirst();

    if (!lessonRecord) {
      throw new ApplicationError(404, 'lesson_not_found', 'Lesson not found.');
    }

    const results = [];
    for (const student of parsed.students) {
      const row = await this.databaseService.db
        .insertInto('lesson_attendance')
        .values({
          lesson_id: lessonId,
          student_user_id: student.studentUserId,
          status: student.status,
          joined_at: student.joinedAt ?? null,
          left_at: student.leftAt ?? null,
          recorded_by_user_id: recorderUserId,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .onConflict((oc) =>
          oc.columns(['lesson_id', 'student_user_id']).doUpdateSet({
            status: student.status,
            joined_at: student.joinedAt ?? null,
            left_at: student.leftAt ?? null,
            recorded_by_user_id: recorderUserId,
            updated_at: new Date().toISOString(),
          }),
        )
        .returning(['id', 'student_user_id', 'status'])
        .executeTakeFirstOrThrow();

      results.push(row);
    }

    return results;
  }

  async getAttendance(lessonId: string) {
    return this.databaseService.db
      .selectFrom('lesson_attendance as la')
      .innerJoin('profiles as p', 'p.id', 'la.student_user_id')
      .select([
        'la.id',
        'la.student_user_id as studentUserId',
        'p.full_name as studentName',
        'la.status',
        'la.joined_at as joinedAt',
        'la.left_at as leftAt',
        'la.recorded_by_user_id as recordedByUserId',
        'la.created_at as createdAt',
      ])
      .where('la.lesson_id', '=', lessonId)
      .orderBy('p.full_name', 'asc')
      .execute();
  }
}
