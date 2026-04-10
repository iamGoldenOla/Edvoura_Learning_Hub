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
  avatarPath: z.string().nullable(),
});

export const currentUserSchema = z.object({
  userId: z.string().uuid(),
  email: z.string().email(),
  roles: z.array(appRoleSchema),
  profile: profileSchema,
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
