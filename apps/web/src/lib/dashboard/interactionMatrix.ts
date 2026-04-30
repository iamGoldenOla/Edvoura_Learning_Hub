export type DashboardRole =
  | 'student'
  | 'parent'
  | 'tutor'
  | 'admin'
  | 'super_admin';

export type DashboardSurface =
  | 'notes'
  | 'subjects'
  | 'quiz'
  | 'spelling_bee'
  | 'notifications'
  | 'review_queue'
  | 'ai_workspace'
  | 'library'
  | 'messages';

export type InteractionRule = {
  sourceRole: DashboardRole;
  targetRoles: DashboardRole[];
  contentType: string;
  deliverySurfaceByRole: Partial<Record<DashboardRole, DashboardSurface[]>>;
  feedKeysByRole?: Partial<Record<DashboardRole, string[]>>;
  requiresReview: boolean;
  notes: string;
};

export function getInteractionRule(sourceRole: DashboardRole, contentType: string) {
  return DASHBOARD_INTERACTION_MATRIX.find(
    (rule) => rule.sourceRole === sourceRole && rule.contentType === contentType,
  );
}

export function getDeliverySurfacesForRole(sourceRole: DashboardRole, contentType: string, role: DashboardRole) {
  return getInteractionRule(sourceRole, contentType)?.deliverySurfaceByRole[role] ?? [];
}

export function getFeedKeysForRole(sourceRole: DashboardRole, contentType: string, role: DashboardRole) {
  return getInteractionRule(sourceRole, contentType)?.feedKeysByRole?.[role] ?? [];
}

export const DASHBOARD_INTERACTION_MATRIX: InteractionRule[] = [
  {
    sourceRole: 'tutor',
    targetRoles: ['student', 'parent', 'super_admin'],
    contentType: 'ai_lesson_note',
    deliverySurfaceByRole: {
      student: ['subjects', 'notes'],
      parent: ['notifications'],
      super_admin: ['review_queue'],
    },
    feedKeysByRole: {
      student: ['learning_content', 'subject_updates'],
      parent: ['child_progress_alerts'],
      super_admin: ['ai_review_queue'],
    },
    requiresReview: false,
    notes: 'Tutor may publish directly; parent receives awareness notification; super admin sees review traffic when submitted.',
  },
  {
    sourceRole: 'tutor',
    targetRoles: ['student', 'parent', 'super_admin'],
    contentType: 'ai_quiz',
    deliverySurfaceByRole: {
      student: ['subjects', 'quiz'],
      parent: ['notifications'],
      super_admin: ['review_queue'],
    },
    feedKeysByRole: {
      student: ['practice_and_assessment', 'subject_updates'],
      parent: ['child_progress_alerts'],
      super_admin: ['ai_review_queue'],
    },
    requiresReview: false,
    notes: 'Quiz content appears on student challenge surfaces and parent gets a publish notification.',
  },
  {
    sourceRole: 'tutor',
    targetRoles: ['student', 'parent', 'super_admin'],
    contentType: 'ai_spelling_bee',
    deliverySurfaceByRole: {
      student: ['subjects', 'spelling_bee'],
      parent: ['notifications'],
      super_admin: ['review_queue'],
    },
    feedKeysByRole: {
      student: ['practice_and_assessment', 'subject_updates'],
      parent: ['child_progress_alerts'],
      super_admin: ['ai_review_queue'],
    },
    requiresReview: false,
    notes: 'Spelling challenges reach learner practice space and parent notifications.',
  },
  {
    sourceRole: 'tutor',
    targetRoles: ['student', 'parent'],
    contentType: 'manual_resource_or_assignment',
    deliverySurfaceByRole: {
      parent: ['notifications'],
      student: ['library'],
    },
    feedKeysByRole: {
      student: ['classroom_resources'],
      parent: ['child_progress_alerts'],
    },
    requiresReview: false,
    notes: 'Manual tutor publishing should create student-facing class artifacts and parent awareness alerts.',
  },
  {
    sourceRole: 'super_admin',
    targetRoles: ['tutor'],
    contentType: 'review_decision',
    deliverySurfaceByRole: {
      tutor: ['ai_workspace', 'notifications'],
    },
    feedKeysByRole: {
      tutor: ['review_feedback', 'workflow_alerts'],
    },
    requiresReview: false,
    notes: 'Approval, rejection, and request-changes decisions must flow back to the generating tutor.',
  },
  {
    sourceRole: 'super_admin',
    targetRoles: ['parent', 'student', 'tutor', 'admin'],
    contentType: 'broadcast_announcement',
    deliverySurfaceByRole: {
      parent: ['notifications'],
      student: ['notifications'],
      tutor: ['notifications'],
      admin: ['notifications'],
    },
    feedKeysByRole: {
      parent: ['platform_announcements'],
      student: ['platform_announcements'],
      tutor: ['platform_announcements'],
      admin: ['platform_announcements'],
    },
    requiresReview: false,
    notes: 'Platform-wide announcements should use the shared notification pipeline.',
  },
  {
    sourceRole: 'parent',
    targetRoles: ['tutor'],
    contentType: 'parent_support_request',
    deliverySurfaceByRole: {
      tutor: ['messages', 'notifications'],
    },
    feedKeysByRole: {
      tutor: ['family_communication', 'workflow_alerts'],
    },
    requiresReview: false,
    notes: 'Parent escalation or support requests should be visible in tutor communication surfaces.',
  },
  {
    sourceRole: 'tutor',
    targetRoles: ['parent'],
    contentType: 'tutor_parent_update',
    deliverySurfaceByRole: {
      parent: ['messages', 'notifications'],
    },
    feedKeysByRole: {
      parent: ['family_communication', 'child_progress_alerts'],
    },
    requiresReview: false,
    notes: 'Tutor-originated family updates should appear in parent communication and alert surfaces.',
  },
];
