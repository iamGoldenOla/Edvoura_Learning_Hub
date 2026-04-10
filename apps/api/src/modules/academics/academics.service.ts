import {
  createClassSchema,
  createLessonSchema,
  createAssignmentSchema,
  createQuizSchema,
  recordAttendanceSchema,
  type CreateClassDto,
  type CreateLessonDto,
  type CreateAssignmentDto,
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

  // ─── Classes ──────────────────────────────────────────────────────────────

  async createClass(creatorUserId: string, dto: CreateClassDto) {
    const parsed = createClassSchema.parse(dto);

    const inserted = await this.databaseService.db
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

    return inserted;
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

    // Tutors see only classes they are assigned to
    if (options.role === 'tutor') {
      query = query.where('c.primary_tutor_user_id', '=', options.userId);
    }

    // Students see only classes they are enrolled in
    if (options.role === 'student') {
      query = query
        .innerJoin('class_enrollments as ce', 'ce.class_id', 'c.id')
        .where('ce.student_user_id', '=', options.userId)
        .where('ce.status', '=', 'active');
    }

    return query.orderBy('c.created_at', 'desc').execute();
  }

  // ─── Lessons ──────────────────────────────────────────────────────────────

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

    // Provision live session (Zoom / Google Meet / stub)
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

  // ─── Assignments ──────────────────────────────────────────────────────────

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

  // ─── Quizzes ──────────────────────────────────────────────────────────────

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

  // ─── Attendance ───────────────────────────────────────────────────────────

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
