import type { DashboardRole, DashboardSurface } from '@/lib/dashboard/interactionMatrix';

export type DashboardFeedRule = {
  role: DashboardRole;
  feedKey: string;
  label: string;
  description: string;
  route: string;
  surfaces: DashboardSurface[];
  priority: 'primary' | 'secondary';
};

export const DASHBOARD_FEED_RULES: DashboardFeedRule[] = [
  {
    role: 'student',
    feedKey: 'learning_content',
    label: 'Learning Content',
    description: 'Published lesson notes and guided learning materials for the enrolled grade and subject.',
    route: '/dash/student/notes',
    surfaces: ['notes', 'subjects'],
    priority: 'primary',
  },
  {
    role: 'student',
    feedKey: 'practice_and_assessment',
    label: 'Practice and Assessment',
    description: 'Quizzes, spelling activities, and other practice items assigned to the learner.',
    route: '/dash/student/quiz',
    surfaces: ['quiz', 'spelling_bee', 'subjects'],
    priority: 'primary',
  },
  {
    role: 'student',
    feedKey: 'classroom_resources',
    label: 'Classroom Resources',
    description: 'Manual resources, attachments, and classroom materials published by tutors.',
    route: '/dash/student/subjects',
    surfaces: ['library', 'subjects'],
    priority: 'secondary',
  },
  {
    role: 'student',
    feedKey: 'platform_announcements',
    label: 'Platform Announcements',
    description: 'System-wide notices and important updates pushed by platform administrators.',
    route: '/dash/student',
    surfaces: ['notifications'],
    priority: 'secondary',
  },
  {
    role: 'parent',
    feedKey: 'child_progress_alerts',
    label: 'Child Progress Alerts',
    description: 'Notifications about published content, progress concerns, and classroom changes for linked children.',
    route: '/dash/parent/notifications',
    surfaces: ['notifications'],
    priority: 'primary',
  },
  {
    role: 'parent',
    feedKey: 'family_communication',
    label: 'Family Communication',
    description: 'Tutor-to-parent updates and direct family support communication threads.',
    route: '/dash/parent/messages',
    surfaces: ['messages', 'notifications'],
    priority: 'primary',
  },
  {
    role: 'parent',
    feedKey: 'platform_announcements',
    label: 'Platform Announcements',
    description: 'Administrative reminders, maintenance notices, and parent-wide broadcasts.',
    route: '/dash/parent/notifications',
    surfaces: ['notifications'],
    priority: 'secondary',
  },
  {
    role: 'tutor',
    feedKey: 'ai_review_queue',
    label: 'AI Review Queue',
    description: 'Tutor-generated AI content currently waiting for super admin review.',
    route: '/dash/tutor/ai',
    surfaces: ['ai_workspace'],
    priority: 'primary',
  },
  {
    role: 'tutor',
    feedKey: 'review_feedback',
    label: 'Review Feedback',
    description: 'Approval, rejection, and change-request responses coming back from super admin.',
    route: '/dash/tutor/ai',
    surfaces: ['ai_workspace', 'notifications'],
    priority: 'primary',
  },
  {
    role: 'tutor',
    feedKey: 'family_communication',
    label: 'Family Communication',
    description: 'Messages and support requests coming from parents and older students.',
    route: '/dash/tutor/messages',
    surfaces: ['messages', 'notifications'],
    priority: 'primary',
  },
  {
    role: 'tutor',
    feedKey: 'workflow_alerts',
    label: 'Workflow Alerts',
    description: 'Operational alerts covering scheduling, review, moderation, and publishing workflow updates.',
    route: '/dash/tutor',
    surfaces: ['notifications', 'ai_workspace'],
    priority: 'secondary',
  },
  {
    role: 'admin',
    feedKey: 'platform_announcements',
    label: 'Platform Announcements',
    description: 'Broadcast notices and role-wide administrative updates.',
    route: '/dash/admin/notifications',
    surfaces: ['notifications'],
    priority: 'primary',
  },
  {
    role: 'super_admin',
    feedKey: 'ai_review_queue',
    label: 'AI Review Queue',
    description: 'Submitted tutor AI content waiting for review and publication decisions.',
    route: '/dash/admin/ai',
    surfaces: ['review_queue', 'ai_workspace'],
    priority: 'primary',
  },
  {
    role: 'super_admin',
    feedKey: 'platform_announcements',
    label: 'Platform Announcements',
    description: 'Broadcast operations, delivery health, and role-targeted system-wide notices.',
    route: '/dash/admin/notifications',
    surfaces: ['notifications'],
    priority: 'secondary',
  },
];

export function getFeedRulesForRole(role: DashboardRole) {
  return DASHBOARD_FEED_RULES.filter((rule) => rule.role === role);
}

export function buildFeedCountMapFromNotificationData(
  notifications: Array<{ data?: unknown }>,
  fallbackFeedKey = 'workflow_alerts',
) {
  const counts = new Map<string, number>();

  for (const notification of notifications) {
    const payload =
      notification.data && typeof notification.data === 'object' && !Array.isArray(notification.data)
        ? (notification.data as { feedKeys?: unknown })
        : {};

    const feedKeys = Array.isArray(payload.feedKeys)
      ? payload.feedKeys.filter((entry): entry is string => typeof entry === 'string' && entry.length > 0)
      : [fallbackFeedKey];

    for (const feedKey of feedKeys) {
      counts.set(feedKey, (counts.get(feedKey) ?? 0) + 1);
    }
  }

  return counts;
}
