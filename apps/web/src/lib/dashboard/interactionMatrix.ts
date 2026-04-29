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
    requiresReview: false,
    notes: 'Spelling challenges reach learner practice space and parent notifications.',
  },
  {
    sourceRole: 'tutor',
    targetRoles: ['parent'],
    contentType: 'manual_resource_or_assignment',
    deliverySurfaceByRole: {
      parent: ['notifications'],
      student: ['library'],
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
    requiresReview: false,
    notes: 'Platform-wide announcements should use the shared notification pipeline.',
  },
];
