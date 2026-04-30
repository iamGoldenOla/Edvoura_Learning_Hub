import { z } from 'zod';

export const appRoles = [
  'student',
  'parent',
  'tutor',
  'admin',
  'super_admin',
] as const;

export const appRoleSchema = z.enum(appRoles);
export type AppRole = z.infer<typeof appRoleSchema>;

export const gradeBandCodes = ['grades_1_3', 'grades_4_6', 'grades_7_12'] as const;
export const gradeBandCodeSchema = z.enum(gradeBandCodes);
export type GradeBandCode = z.infer<typeof gradeBandCodeSchema>;

export const liveClassProviders = ['zoom', 'google_meet', 'native_later'] as const;
export const liveClassProviderSchema = z.enum(liveClassProviders);
export type LiveClassProvider = z.infer<typeof liveClassProviderSchema>;

export const notificationChannels = ['in_app', 'email'] as const;
export const notificationChannelSchema = z.enum(notificationChannels);
export type NotificationChannel = z.infer<typeof notificationChannelSchema>;

export const notificationKinds = [
  'lesson_reminder',
  'assignment_due',
  'submission_graded',
  'billing_issue',
  'admin_alert',
  'assignment_overdue',
  'tutor_ungraded_reminder',
  'lesson_upcoming_tutor',
] as const;
export const notificationKindSchema = z.enum(notificationKinds);
export type NotificationKind = z.infer<typeof notificationKindSchema>;

export const roleAssignmentSchema = z.object({
  role: appRoleSchema,
  grantedAt: z.string().datetime(),
});

export const profileSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  fullName: z.string().nullable(),
  dateOfBirth: z.string().date().nullable().optional(),
  avatarPath: z.string().nullable(),
});

export const learnerProfileSchema = z.object({
  gradeLevelCode: z.string(),
  gradeLevelName: z.string(),
  gradeBandCode: gradeBandCodeSchema,
  gradeBandName: z.string(),
  schoolName: z.string().nullable(),
  academicGoalNotes: z.string().nullable(),
});

export const currentUserSchema = z.object({
  userId: z.string().uuid(),
  email: z.string().email(),
  roles: z.array(appRoleSchema),
  primaryRole: appRoleSchema,
  profile: profileSchema,
  learnerProfile: learnerProfileSchema.nullable().optional(),
});

export type CurrentUser = z.infer<typeof currentUserSchema>;

// ─── Tutor approval ─────────────────────────────────────────────────────────

export const tutorApprovalStatuses = ['pending', 'approved', 'rejected', 'suspended'] as const;
export const tutorApprovalStatusSchema = z.enum(tutorApprovalStatuses);
export type TutorApprovalStatus = z.infer<typeof tutorApprovalStatusSchema>;

// ─── Guardian relationship ───────────────────────────────────────────────────

export const guardianRelationships = ['mother', 'father', 'guardian', 'sibling', 'other'] as const;
export const guardianRelationshipSchema = z.enum(guardianRelationships);
export type GuardianRelationship = z.infer<typeof guardianRelationshipSchema>;

// ─── Class / Academic statuses ───────────────────────────────────────────────

export const classStatuses = ['draft', 'active', 'completed', 'archived'] as const;
export const classStatusSchema = z.enum(classStatuses);
export type ClassStatus = z.infer<typeof classStatusSchema>;

export const lessonStatuses = ['draft', 'scheduled', 'live', 'completed', 'cancelled'] as const;
export const lessonStatusSchema = z.enum(lessonStatuses);
export type LessonStatus = z.infer<typeof lessonStatusSchema>;

export const assignmentStatuses = ['draft', 'published', 'closed', 'archived'] as const;
export const assignmentStatusSchema = z.enum(assignmentStatuses);
export type AssignmentStatus = z.infer<typeof assignmentStatusSchema>;

export const quizStatuses = ['draft', 'published', 'closed', 'archived'] as const;
export const quizStatusSchema = z.enum(quizStatuses);
export type QuizStatus = z.infer<typeof quizStatusSchema>;

// ─── Subscription / Billing statuses ────────────────────────────────────────

export const subscriptionStatuses = [
  'trialing',
  'active',
  'past_due',
  'cancelled',
  'incomplete',
  'paused',
] as const;
export const subscriptionStatusSchema = z.enum(subscriptionStatuses);
export type SubscriptionStatus = z.infer<typeof subscriptionStatusSchema>;

export const billingIntervals = ['monthly', 'termly', 'annual'] as const;
export const billingIntervalSchema = z.enum(billingIntervals);
export type BillingInterval = z.infer<typeof billingIntervalSchema>;

export const createBillingPlanSchema = z.object({
  code: z.string().min(2).max(50),
  name: z.string().min(2).max(120),
  description: z.string().max(1000).optional(),
  interval: billingIntervalSchema,
  amountMinor: z.number().int().nonnegative(),
  currencyCode: z.string().min(3).max(3).default('NGN'),
  paystackPlanCode: z.string().max(120).optional(),
  isActive: z.boolean().default(true),
});
export type CreateBillingPlanDto = z.infer<typeof createBillingPlanSchema>;

export const updateBillingPlanSchema = createBillingPlanSchema.partial();
export type UpdateBillingPlanDto = z.infer<typeof updateBillingPlanSchema>;

export const createSubscriptionSchema = z.object({
  planId: z.string().uuid(),
  accountOwnerUserId: z.string().uuid().optional(),
  couponCode: z.string().max(50).optional(),
});
export type CreateSubscriptionDto = z.infer<typeof createSubscriptionSchema>;

// ─── Phase 3: Submission / Quiz / Attendance enums ───────────────────────────

export const submissionStatuses = ['draft', 'submitted', 'late', 'graded', 'returned'] as const;
export const submissionStatusSchema = z.enum(submissionStatuses);
export type SubmissionStatus = z.infer<typeof submissionStatusSchema>;

export const quizAttemptStatuses = ['in_progress', 'submitted', 'graded', 'timed_out'] as const;
export const quizAttemptStatusSchema = z.enum(quizAttemptStatuses);
export type QuizAttemptStatus = z.infer<typeof quizAttemptStatusSchema>;

export const attendanceStatuses = ['present', 'absent', 'late', 'excused'] as const;
export const attendanceStatusSchema = z.enum(attendanceStatuses);
export type AttendanceStatus = z.infer<typeof attendanceStatusSchema>;

// ─── Parent onboarding DTOs ──────────────────────────────────────────────────

export const completeParentProfileSchema = z.object({
  fullName: z.string().min(2).max(120),
  phoneNumber: z.string().min(7).max(20).optional(),
  timezone: z.string().default('Africa/Lagos'),
  preferredContactMethod: z.enum(['email', 'phone', 'whatsapp']).optional(),
});
export type CompleteParentProfileDto = z.infer<typeof completeParentProfileSchema>;

export const onboardChildSchema = z.object({
  fullName: z.string().min(2).max(120),
  email: z.string().email().optional(),
  gradeLevelCode: z.string().min(1),
  schoolName: z.string().max(200).optional(),
  academicGoalNotes: z.string().max(1000).optional(),
  relationship: guardianRelationshipSchema,
  isPrimaryGuardian: z.boolean().default(true),
});
export type OnboardChildDto = z.infer<typeof onboardChildSchema>;

export const linkExistingChildSchema = z.object({
  childEmail: z.string().email(),
  relationship: guardianRelationshipSchema,
  isPrimaryGuardian: z.boolean().default(false),
});
export type LinkExistingChildDto = z.infer<typeof linkExistingChildSchema>;

// ─── Student onboarding DTOs ─────────────────────────────────────────────────

export const completeStudentProfileSchema = z.object({
  gradeLevelCode: z.string().min(1),
  schoolName: z.string().max(200).optional(),
  academicGoalNotes: z.string().max(1000).optional(),
  timezone: z.string().default('Africa/Lagos'),
});
export type CompleteStudentProfileDto = z.infer<typeof completeStudentProfileSchema>;

// ─── Tutor onboarding DTOs ───────────────────────────────────────────────────

export const completeTutorProfileSchema = z.object({
  fullName: z.string().min(2).max(120),
  phoneNumber: z.string().min(7).max(20).optional(),
  headline: z.string().max(160).optional(),
  bio: z.string().max(2000).optional(),
  expertiseSummary: z.string().max(1000).optional(),
  availabilityNotes: z.string().max(1000).optional(),
  timezone: z.string().default('Africa/Lagos'),
});
export type CompleteTutorProfileDto = z.infer<typeof completeTutorProfileSchema>;

// ─── Admin DTOs ──────────────────────────────────────────────────────────────

export const assignRoleSchema = z.object({
  role: appRoleSchema,
});
export type AssignRoleDto = z.infer<typeof assignRoleSchema>;

export const approveTutorSchema = z.object({
  notes: z.string().max(500).optional(),
});
export type ApproveTutorDto = z.infer<typeof approveTutorSchema>;

export const rejectTutorSchema = z.object({
  reason: z.string().min(5).max(500),
});
export type RejectTutorDto = z.infer<typeof rejectTutorSchema>;

// ─── Academic DTOs ────────────────────────────────────────────────────────────

export const createClassSchema = z.object({
  title: z.string().min(3).max(200),
  description: z.string().max(2000).optional(),
  subjectId: z.string().uuid(),
  gradeBandId: z.string().uuid(),
  maxStudents: z.number().int().positive().optional(),
  startsOn: z.string().date().optional(),
  endsOn: z.string().date().optional(),
});
export type CreateClassDto = z.infer<typeof createClassSchema>;

export const createLessonSchema = z.object({
  title: z.string().min(3).max(200),
  description: z.string().max(2000).optional(),
  scheduledStartAt: z.string().datetime(),
  scheduledEndAt: z.string().datetime(),
  provider: liveClassProviderSchema.default('zoom'),
  tutorUserId: z.string().uuid().optional(),
});
export type CreateLessonDto = z.infer<typeof createLessonSchema>;

export const createAssignmentSchema = z.object({
  title: z.string().min(3).max(200),
  instructions: z.string().max(5000).optional(),
  lessonId: z.string().uuid().optional(),
  dueAt: z.string().datetime().optional(),
  pointsPossible: z.number().positive().default(100),
});
export type CreateAssignmentDto = z.infer<typeof createAssignmentSchema>;

export const createQuizSchema = z.object({
  title: z.string().min(3).max(200),
  instructions: z.string().max(2000).optional(),
  lessonId: z.string().uuid().optional(),
  startsAt: z.string().datetime().optional(),
  endsAt: z.string().datetime().optional(),
  timeLimitMinutes: z.number().int().positive().optional(),
});
export type CreateQuizDto = z.infer<typeof createQuizSchema>;

// ─── Phase 3: Assignment submission DTOs ─────────────────────────────────────

export const submitAssignmentSchema = z.object({
  textResponse: z.string().max(10000).optional(),
});
export type SubmitAssignmentDto = z.infer<typeof submitAssignmentSchema>;

export const gradeSubmissionSchema = z.object({
  score: z.number().min(0),
  feedbackText: z.string().max(5000).optional(),
  rubricJson: z.record(z.unknown()).optional(),
});
export type GradeSubmissionDto = z.infer<typeof gradeSubmissionSchema>;

// ─── Phase 3: Quiz question + attempt DTOs ───────────────────────────────────

export const addQuizQuestionSchema = z.object({
  questionType: z.string().min(1).max(50),
  prompt: z.string().min(1).max(5000),
  optionsJson: z.unknown().default([]),
  correctAnswerJson: z.unknown().default({}),
  points: z.number().positive().default(1),
});
export const addQuizQuestionsSchema = z.object({
  questions: z.array(addQuizQuestionSchema).min(1).max(200),
});
export type AddQuizQuestionsDto = z.infer<typeof addQuizQuestionsSchema>;

export const startQuizAttemptSchema = z.object({});
export type StartQuizAttemptDto = z.infer<typeof startQuizAttemptSchema>;

export const quizResponseInputSchema = z.object({
  questionId: z.string().uuid(),
  answerJson: z.unknown().default({}),
});
export const submitQuizAttemptSchema = z.object({
  responses: z.array(quizResponseInputSchema).min(1),
});
export type SubmitQuizAttemptDto = z.infer<typeof submitQuizAttemptSchema>;

// ─── Phase 3: Attendance DTOs ────────────────────────────────────────────────

export const attendanceRecordSchema = z.object({
  studentUserId: z.string().uuid(),
  status: attendanceStatusSchema,
  joinedAt: z.string().datetime().optional(),
  leftAt: z.string().datetime().optional(),
});
export const recordAttendanceSchema = z.object({
  students: z.array(attendanceRecordSchema).min(1),
});
export type RecordAttendanceDto = z.infer<typeof recordAttendanceSchema>;

// Communications DTOs
export const dashboardChatChannelSchema = z.enum([
  'tutor-parent',
  'tutor-student-7-12',
  'parent-student-7-12',
]);
export type DashboardChatChannel = z.infer<typeof dashboardChatChannelSchema>;

export const publishLiveContentSchema = z.object({
  headline: z.string().min(2).max(200),
  agenda: z.string().min(2).max(3000),
  explanation: z.string().max(4000).optional().default(''),
  classTask: z.string().min(2).max(4000),
  homework: z.string().max(4000).optional().default(''),
  resourceUrl: z.string().url().max(2000).optional().or(z.literal('')).default(''),
});
export type PublishLiveContentDto = z.infer<typeof publishLiveContentSchema>;

export const postDashboardChatMessageSchema = z.object({
  channelId: dashboardChatChannelSchema,
  text: z.string().min(1).max(4000),
});
export type PostDashboardChatMessageDto = z.infer<typeof postDashboardChatMessageSchema>;

export const listDashboardChatMessagesQuerySchema = z.object({
  channelId: dashboardChatChannelSchema,
  limit: z
    .coerce
    .number()
    .int()
    .min(1)
    .max(200)
    .optional()
    .default(100),
});
export type ListDashboardChatMessagesQueryDto = z.infer<typeof listDashboardChatMessagesQuerySchema>;

// Dashboard UI action logs
export const recordDashboardUiActionSchema = z.object({
  actionKey: z.string().min(2).max(120),
  label: z.string().min(2).max(200),
  scope: z.string().min(2).max(60),
  nextPath: z.string().max(300).optional(),
  metadata: z.record(z.unknown()).optional(),
});
export type RecordDashboardUiActionDto = z.infer<typeof recordDashboardUiActionSchema>;

export const listDashboardUiActionsQuerySchema = z.object({
  scope: z.string().max(60).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
});
export type ListDashboardUiActionsQueryDto = z.infer<typeof listDashboardUiActionsQuerySchema>;

export const runAdminOperationSchema = z.object({
  actionKey: z.string().min(2).max(120),
  context: z.record(z.unknown()).optional(),
});
export type RunAdminOperationDto = z.infer<typeof runAdminOperationSchema>;

export const runTutorOperationSchema = z.object({
  actionKey: z.string().min(2).max(120),
  context: z.record(z.unknown()).optional(),
});
export type RunTutorOperationDto = z.infer<typeof runTutorOperationSchema>;

export const runParentOperationSchema = z.object({
  actionKey: z.string().min(2).max(120),
  context: z.record(z.unknown()).optional(),
});
export type RunParentOperationDto = z.infer<typeof runParentOperationSchema>;
