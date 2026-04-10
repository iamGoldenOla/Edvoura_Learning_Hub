import {
  submitAssignmentSchema,
  gradeSubmissionSchema,
  type SubmitAssignmentDto,
  type GradeSubmissionDto,
} from '@edvoura/contracts';
import { Injectable } from '@nestjs/common';

import { DatabaseService } from '../../common/database/database.service.js';
import { NotificationsService } from '../notifications/notifications.service.js';
import { ApplicationError } from '../../common/errors/application-error.js';

@Injectable()
export class SubmissionsService {
  constructor(
    private readonly databaseService: DatabaseService,
    private readonly notificationsService: NotificationsService,
  ) {}

  async submitAssignment(assignmentId: string, studentUserId: string, dto: SubmitAssignmentDto) {
    const parsed = submitAssignmentSchema.parse(dto);

    // Verify assignment exists and is published
    const assignment = await this.databaseService.db
      .selectFrom('assignments')
      .select(['id', 'title', 'status', 'due_at'])
      .where('id', '=', assignmentId)
      .executeTakeFirst();

    if (!assignment) {
      throw new ApplicationError(404, 'assignment_not_found', 'Assignment not found.');
    }

    if (assignment.status !== 'published') {
      throw new ApplicationError(400, 'assignment_not_published', 'Assignment is not open for submissions.');
    }

    // Determine if submission is late
    const now = new Date();
    const isLate = assignment.due_at ? now > new Date(assignment.due_at) : false;

    const submission = await this.databaseService.db
      .insertInto('assignment_submissions')
      .values({
        assignment_id: assignmentId,
        student_user_id: studentUserId,
        status: isLate ? 'late' : 'submitted',
        submitted_at: now.toISOString(),
        text_response: parsed.textResponse ?? null,
        metadata: {},
        created_at: now.toISOString(),
        updated_at: now.toISOString(),
      })
      .onConflict((oc) =>
        oc.columns(['assignment_id', 'student_user_id']).doUpdateSet({
          status: isLate ? 'late' : 'submitted',
          submitted_at: now.toISOString(),
          text_response: parsed.textResponse ?? null,
          updated_at: now.toISOString(),
        }),
      )
      .returning(['id', 'status', 'submitted_at'])
      .executeTakeFirstOrThrow();

    return submission;
  }

  async listSubmissions(assignmentId: string) {
    return this.databaseService.db
      .selectFrom('assignment_submissions as asub')
      .innerJoin('profiles as p', 'p.id', 'asub.student_user_id')
      .leftJoin('submission_grades as sg', 'sg.submission_id', 'asub.id')
      .select([
        'asub.id',
        'asub.student_user_id as studentUserId',
        'p.full_name as studentName',
        'asub.status',
        'asub.submitted_at as submittedAt',
        'asub.text_response as textResponse',
        'sg.score',
        'sg.feedback_text as feedbackText',
        'sg.graded_at as gradedAt',
      ])
      .where('asub.assignment_id', '=', assignmentId)
      .orderBy('asub.submitted_at', 'desc')
      .execute();
  }

  async getMySubmission(assignmentId: string, studentUserId: string) {
    const submission = await this.databaseService.db
      .selectFrom('assignment_submissions as asub')
      .leftJoin('submission_grades as sg', 'sg.submission_id', 'asub.id')
      .select([
        'asub.id',
        'asub.status',
        'asub.submitted_at as submittedAt',
        'asub.text_response as textResponse',
        'sg.score',
        'sg.feedback_text as feedbackText',
        'sg.graded_at as gradedAt',
      ])
      .where('asub.assignment_id', '=', assignmentId)
      .where('asub.student_user_id', '=', studentUserId)
      .executeTakeFirst();

    return submission ?? null;
  }

  async gradeSubmission(submissionId: string, graderUserId: string, dto: GradeSubmissionDto) {
    const parsed = gradeSubmissionSchema.parse(dto);

    // Verify submission exists
    const submission = await this.databaseService.db
      .selectFrom('assignment_submissions as asub')
      .innerJoin('assignments as a', 'a.id', 'asub.assignment_id')
      .select([
        'asub.id',
        'asub.student_user_id',
        'a.title as assignmentTitle',
      ])
      .where('asub.id', '=', submissionId)
      .executeTakeFirst();

    if (!submission) {
      throw new ApplicationError(404, 'submission_not_found', 'Submission not found.');
    }

    const now = new Date().toISOString();

    // Upsert grade
    await this.databaseService.db
      .insertInto('submission_grades')
      .values({
        submission_id: submissionId,
        grader_user_id: graderUserId,
        score: String(parsed.score),
        feedback_text: parsed.feedbackText ?? null,
        rubric_json: parsed.rubricJson ?? {},
        graded_at: now,
        created_at: now,
        updated_at: now,
      })
      .onConflict((oc) =>
        oc.column('submission_id').doUpdateSet({
          grader_user_id: graderUserId,
          score: String(parsed.score),
          feedback_text: parsed.feedbackText ?? null,
          rubric_json: parsed.rubricJson ?? {},
          graded_at: now,
          updated_at: now,
        }),
      )
      .execute();

    // Update submission status to graded
    await this.databaseService.db
      .updateTable('assignment_submissions')
      .set({ status: 'graded', updated_at: now })
      .where('id', '=', submissionId)
      .execute();

    // Notify the student
    await this.notificationsService.create({
      recipientUserId: submission.student_user_id,
      actorUserId: graderUserId,
      kind: 'submission_graded',
      title: 'Assignment Graded',
      body: `Your submission for "${submission.assignmentTitle}" has been graded. Score: ${parsed.score}`,
      data: { submissionId, score: parsed.score },
    });

    return { submissionId, score: parsed.score, gradedAt: now };
  }
}
