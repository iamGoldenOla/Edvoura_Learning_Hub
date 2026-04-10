import {
  addQuizQuestionsSchema,
  submitQuizAttemptSchema,
  type AddQuizQuestionsDto,
  type SubmitQuizAttemptDto,
} from '@edvoura/contracts';
import { Injectable, Logger } from '@nestjs/common';

import { DatabaseService } from '../../common/database/database.service.js';
import { ApplicationError } from '../../common/errors/application-error.js';

@Injectable()
export class QuizAttemptsService {
  private readonly logger = new Logger(QuizAttemptsService.name);

  constructor(private readonly databaseService: DatabaseService) {}

  // ─── Questions management ─────────────────────────────────────────────────

  async addQuestions(quizId: string, _creatorUserId: string, dto: AddQuizQuestionsDto) {
    const parsed = addQuizQuestionsSchema.parse(dto);

    const quiz = await this.databaseService.db
      .selectFrom('quizzes')
      .select('id')
      .where('id', '=', quizId)
      .executeTakeFirst();

    if (!quiz) {
      throw new ApplicationError(404, 'quiz_not_found', 'Quiz not found.');
    }

    // Get current max position
    const maxPos = await this.databaseService.db
      .selectFrom('quiz_questions')
      .select((eb) => eb.fn.max('position').as('maxPosition'))
      .where('quiz_id', '=', quizId)
      .executeTakeFirst();

    let position = (maxPos?.maxPosition as number | null) ?? 0;

    const results = [];
    for (const q of parsed.questions) {
      position += 1;
      const row = await this.databaseService.db
        .insertInto('quiz_questions')
        .values({
          quiz_id: quizId,
          position,
          question_type: q.questionType,
          prompt: q.prompt,
          options_json: q.optionsJson,
          correct_answer_json: q.correctAnswerJson,
          points: String(q.points),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .returning(['id', 'position', 'question_type', 'prompt', 'points'])
        .executeTakeFirstOrThrow();

      results.push(row);
    }

    return results;
  }

  async listQuestions(quizId: string, includeAnswers: boolean = false) {
    const base = this.databaseService.db
      .selectFrom('quiz_questions')
      .where('quiz_id', '=', quizId)
      .orderBy('position', 'asc');

    if (includeAnswers) {
      return base
        .select([
          'id',
          'position',
          'question_type as questionType',
          'prompt',
          'options_json as optionsJson',
          'correct_answer_json as correctAnswerJson',
          'points',
        ])
        .execute();
    }

    // Student view — no correct answers
    return base
      .select([
        'id',
        'position',
        'question_type as questionType',
        'prompt',
        'options_json as optionsJson',
        'points',
      ])
      .execute();
  }

  // ─── Attempt lifecycle ────────────────────────────────────────────────────

  async startAttempt(quizId: string, studentUserId: string) {
    // Verify quiz is published
    const quiz = await this.databaseService.db
      .selectFrom('quizzes')
      .select(['id', 'status', 'time_limit_minutes'])
      .where('id', '=', quizId)
      .executeTakeFirst();

    if (!quiz) {
      throw new ApplicationError(404, 'quiz_not_found', 'Quiz not found.');
    }

    if (quiz.status !== 'published') {
      throw new ApplicationError(400, 'quiz_not_published', 'Quiz is not open for attempts.');
    }

    // Check for existing attempt
    const existing = await this.databaseService.db
      .selectFrom('quiz_attempts')
      .select(['id', 'status'])
      .where('quiz_id', '=', quizId)
      .where('student_user_id', '=', studentUserId)
      .executeTakeFirst();

    if (existing) {
      if (existing.status === 'in_progress') {
        return { attemptId: existing.id, status: existing.status, message: 'Existing attempt resumed.' };
      }
      throw new ApplicationError(400, 'attempt_already_submitted', 'You have already submitted this quiz.');
    }

    const now = new Date().toISOString();
    const attempt = await this.databaseService.db
      .insertInto('quiz_attempts')
      .values({
        quiz_id: quizId,
        student_user_id: studentUserId,
        status: 'in_progress',
        started_at: now,
        submitted_at: null,
        score: null,
        created_at: now,
        updated_at: now,
      })
      .returning(['id', 'status', 'started_at'])
      .executeTakeFirstOrThrow();

    return { attemptId: attempt.id, status: attempt.status, startedAt: attempt.started_at };
  }

  async submitAttempt(attemptId: string, studentUserId: string, dto: SubmitQuizAttemptDto) {
    const parsed = submitQuizAttemptSchema.parse(dto);

    // Verify attempt belongs to student and is in_progress
    const attempt = await this.databaseService.db
      .selectFrom('quiz_attempts')
      .select(['id', 'quiz_id', 'status'])
      .where('id', '=', attemptId)
      .where('student_user_id', '=', studentUserId)
      .executeTakeFirst();

    if (!attempt) {
      throw new ApplicationError(404, 'attempt_not_found', 'Quiz attempt not found.');
    }

    if (attempt.status !== 'in_progress') {
      throw new ApplicationError(400, 'attempt_not_in_progress', 'This attempt has already been submitted.');
    }

    // Fetch all questions for this quiz (with correct answers for auto-scoring)
    const questions = await this.databaseService.db
      .selectFrom('quiz_questions')
      .select(['id', 'correct_answer_json', 'points'])
      .where('quiz_id', '=', attempt.quiz_id)
      .execute();

    const questionMap = new Map(questions.map((q) => [q.id, q]));

    let totalScore = 0;
    const now = new Date().toISOString();

    // Process each response
    for (const response of parsed.responses) {
      const question = questionMap.get(response.questionId);
      if (!question) continue;

      // Auto-score: compare answer_json to correct_answer_json via JSON string equality
      const isCorrect =
        JSON.stringify(response.answerJson) === JSON.stringify(question.correct_answer_json);
      const awardedPoints = isCorrect ? parseFloat(question.points) : 0;
      totalScore += awardedPoints;

      await this.databaseService.db
        .insertInto('quiz_responses')
        .values({
          attempt_id: attemptId,
          question_id: response.questionId,
          answer_json: response.answerJson,
          is_correct: isCorrect,
          awarded_points: String(awardedPoints),
          created_at: now,
          updated_at: now,
        })
        .onConflict((oc) =>
          oc.columns(['attempt_id', 'question_id']).doUpdateSet({
            answer_json: response.answerJson,
            is_correct: isCorrect,
            awarded_points: String(awardedPoints),
            updated_at: now,
          }),
        )
        .execute();
    }

    // Update attempt
    await this.databaseService.db
      .updateTable('quiz_attempts')
      .set({
        status: 'graded',
        submitted_at: now,
        score: String(totalScore),
        updated_at: now,
      })
      .where('id', '=', attemptId)
      .execute();

    this.logger.log(`Quiz attempt ${attemptId} auto-scored: ${totalScore} points`);

    return { attemptId, status: 'graded', score: totalScore, submittedAt: now };
  }

  async getAttemptResult(attemptId: string, studentUserId: string) {
    const attempt = await this.databaseService.db
      .selectFrom('quiz_attempts as qa')
      .innerJoin('quizzes as q', 'q.id', 'qa.quiz_id')
      .select([
        'qa.id as attemptId',
        'qa.quiz_id as quizId',
        'q.title as quizTitle',
        'qa.status',
        'qa.started_at as startedAt',
        'qa.submitted_at as submittedAt',
        'qa.score',
      ])
      .where('qa.id', '=', attemptId)
      .where('qa.student_user_id', '=', studentUserId)
      .executeTakeFirst();

    if (!attempt) {
      throw new ApplicationError(404, 'attempt_not_found', 'Quiz attempt not found.');
    }

    const responses = await this.databaseService.db
      .selectFrom('quiz_responses as qr')
      .innerJoin('quiz_questions as qq', 'qq.id', 'qr.question_id')
      .select([
        'qr.question_id as questionId',
        'qq.prompt',
        'qq.question_type as questionType',
        'qr.answer_json as answerJson',
        'qr.is_correct as isCorrect',
        'qr.awarded_points as awardedPoints',
      ])
      .where('qr.attempt_id', '=', attemptId)
      .orderBy('qq.position', 'asc')
      .execute();

    return { ...attempt, responses };
  }
}
