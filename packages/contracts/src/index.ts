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
