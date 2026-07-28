import type {
  AppRole,
  NotificationKind,
  TutorApprovalStatus,
  GuardianRelationship,
  ClassStatus,
  LessonStatus,
  AssignmentStatus,
  QuizStatus,
  SubscriptionStatus,
  LiveClassProvider,
  SubmissionStatus,
  QuizAttemptStatus,
  AttendanceStatus,
} from '@edvoura/contracts';

// ΓöÇΓöÇΓöÇ Core identity ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ

export interface ProfilesTable {
  id: string;
  email: string;
  full_name: string | null;
  phone_number: string | null;
  avatar_path: string | null;
  timezone: string;
  created_at: string;
  updated_at: string;
}

export interface UserRolesTable {
  id?: string;
  user_id: string;
  role: AppRole;
  granted_by_user_id: string | null;
  granted_at: string;
  revoked_at: string | null;
}

// ΓöÇΓöÇΓöÇ Domain profiles ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ

export interface ParentProfilesTable {
  user_id: string;
  preferred_contact_method: string | null;
  paystack_customer_code: string | null;
  created_at: string;
  updated_at: string;
}

export interface StudentProfilesTable {
  user_id: string;
  grade_level_id: string;
  learner_band_id: string;
  school_name: string | null;
  academic_goal_notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface TutorProfilesTable {
  user_id: string;
  approval_status: TutorApprovalStatus;
  headline: string | null;
  bio: string | null;
  expertise_summary: string | null;
  availability_notes: string | null;
  approved_by_user_id: string | null;
  approved_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface AdminProfilesTable {
  user_id: string;
  title: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface ParentStudentLinksTable {
  id?: string;
  parent_user_id: string;
  student_user_id: string;
  relationship: GuardianRelationship;
  is_primary_guardian: boolean;
  can_view_billing: boolean;
  can_view_progress: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// ΓöÇΓöÇΓöÇ Grade taxonomy ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ

export interface GradeBandsTable {
  id: string;
  code: string;
  name: string;
  min_grade: number;
  max_grade: number;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface GradeLevelsTable {
  id: string;
  code: string;
  display_name: string;
  numeric_level: number;
  band_id: string;
  created_at: string;
  updated_at: string;
}

export interface SubjectsTable {
  id: string;
  slug: string;
  name: string;
  is_core: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// ΓöÇΓöÇΓöÇ Academic entities ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ

export interface ClassesTable {
  id?: string;
  subject_id: string;
  grade_band_id: string;
  title: string;
  description: string | null;
  status: ClassStatus;
  primary_tutor_user_id: string | null;
  max_students: number | null;
  starts_on: string | null;
  ends_on: string | null;
  created_by_user_id: string;
  created_at: string;
  updated_at: string;
}

export interface ClassEnrollmentsTable {
  id?: string;
  class_id: string;
  student_user_id: string;
  status: 'active' | 'paused' | 'completed' | 'withdrawn';
  enrolled_at: string;
  created_at: string;
  updated_at: string;
}

export interface LessonsTable {
  id?: string;
  class_id: string;
  tutor_user_id: string | null;
  title: string;
  description: string | null;
  provider: LiveClassProvider;
  status: LessonStatus;
  scheduled_start_at: string;
  scheduled_end_at: string;
  actual_start_at: string | null;
  actual_end_at: string | null;
  meeting_summary: string | null;
  created_by_user_id: string;
  created_at: string;
  updated_at: string;
}

export interface LessonLiveSessionsTable {
  lesson_id: string;
  provider: LiveClassProvider;
  external_meeting_id: string | null;
  join_url: string | null;
  host_url: string | null;
  passcode: string | null;
  raw_payload: unknown;
  created_at: string;
  updated_at: string;
}

export interface LessonAttendanceTable {
  id?: string;
  lesson_id: string;
  student_user_id: string;
  status: AttendanceStatus;
  joined_at: string | null;
  left_at: string | null;
  recorded_by_user_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface AssignmentsTable {
  id?: string;
  class_id: string;
  lesson_id: string | null;
  title: string;
  instructions: string | null;
  status: AssignmentStatus;
  due_at: string | null;
  points_possible: string; // numeric => string in pg driver
  created_by_user_id: string;
  created_at: string;
  updated_at: string;
}

export interface AssignmentSubmissionsTable {
  id?: string;
  assignment_id: string;
  student_user_id: string;
  status: SubmissionStatus;
  submitted_at: string | null;
  text_response: string | null;
  metadata: unknown;
  created_at: string;
  updated_at: string;
}

export interface SubmissionFilesTable {
  id?: string;
  submission_id: string;
  bucket_id: string;
  object_path: string;
  uploaded_by_user_id: string;
  created_at: string;
}

export interface SubmissionGradesTable {
  id?: string;
  submission_id: string;
  grader_user_id: string;
  score: string | null; // numeric => string
  feedback_text: string | null;
  rubric_json: unknown;
  graded_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface QuizzesTable {
  id?: string;
  class_id: string;
  lesson_id: string | null;
  title: string;
  instructions: string | null;
  status: QuizStatus;
  starts_at: string | null;
  ends_at: string | null;
  time_limit_minutes: number | null;
  created_by_user_id: string;
  created_at: string;
  updated_at: string;
}

export interface QuizQuestionsTable {
  id?: string;
  quiz_id: string;
  position: number;
  question_type: string;
  prompt: string;
  options_json: unknown;
  correct_answer_json: unknown;
  points: string;
  created_at: string;
  updated_at: string;
}

export interface QuizAttemptsTable {
  id?: string;
  quiz_id: string;
  student_user_id: string;
  status: QuizAttemptStatus;
  started_at: string;
  submitted_at: string | null;
  score: string | null; // numeric => string
  created_at: string;
  updated_at: string;
}

export interface QuizResponsesTable {
  id?: string;
  attempt_id: string;
  question_id: string;
  answer_json: unknown;
  is_correct: boolean | null;
  awarded_points: string | null; // numeric => string
  created_at: string;
  updated_at: string;
}

export interface ProgressSnapshotsTable {
  id?: string;
  student_user_id: string;
  subject_id: string | null;
  snapshot_date: string;
  attendance_rate: string | null; // numeric => string
  assignment_completion_rate: string | null;
  average_score: string | null;
  mastery_notes: string | null;
  created_at: string;
}

// ΓöÇΓöÇΓöÇ Notifications ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ

export interface NotificationsTable {
  id?: string;
  recipient_user_id: string;
  actor_user_id: string | null;
  kind: NotificationKind;
  title: string;
  body: string;
  status: 'unread' | 'read' | 'archived';
  data: Record<string, unknown>;
  read_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface NotificationDeliveriesTable {
  id?: string;
  notification_id: string;
  channel: 'in_app' | 'email';
  delivery_status: 'queued' | 'sent' | 'delivered' | 'failed';
  provider: string | null;
  external_delivery_id: string | null;
  attempted_at: string | null;
  delivered_at: string | null;
  error_message: string | null;
  created_at: string;
  updated_at: string;
}

// ΓöÇΓöÇΓöÇ Billing (billing schema) ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ

export interface TutorLiveContentPostsTable {
  id?: string;
  tutor_user_id: string;
  headline: string;
  agenda: string;
  explanation: string | null;
  class_task: string;
  homework: string | null;
  resource_url: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface DashboardChatMessagesTable {
  id?: string;
  channel_id: 'tutor-parent' | 'tutor-student-7-12' | 'parent-student-7-12';
  sender_user_id: string;
  sender_role: 'student' | 'parent' | 'tutor';
  sender_name: string;
  text: string;
  created_at: string;
}

export interface LearningActivityEventsTable {
  id?: string;
  event_type: string;
  actor_user_id: string | null;
  class_id: string | null;
  lesson_id: string | null;
  assignment_id: string | null;
  payload: Record<string, unknown>;
  created_at: string;
}

export interface BillingPlansTable {
  id?: string;
  code: string;
  name: string;
  description: string | null;
  interval: 'monthly' | 'termly' | 'annual';
  amount_minor: number;
  currency_code: string;
  paystack_plan_code: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface BillingSubscriptionsTable {
  id?: string;
  account_owner_user_id: string;
  plan_id: string | null;
  paystack_customer_code: string | null;
  paystack_subscription_code: string | null;
  status: SubscriptionStatus;
  current_period_start: string | null;
  current_period_end: string | null;
  cancel_at_period_end: boolean;
  created_at: string;
  updated_at: string;
}

export interface BillingInvoicesTable {
  id?: string;
  subscription_id: string | null;
  paystack_reference: string | null;
  status: 'draft' | 'open' | 'paid' | 'void' | 'uncollectible';
  amount_due_minor: number;
  amount_paid_minor: number;
  currency_code: string;
  due_at: string | null;
  paid_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface BillingPaymentsTable {
  id?: string;
  invoice_id: string | null;
  paystack_payment_reference: string | null;
  status: 'pending' | 'succeeded' | 'failed' | 'refunded' | 'partially_refunded';
  amount_minor: number;
  currency_code: string;
  paid_at: string | null;
  failure_reason: string | null;
  created_at: string;
  updated_at: string;
}

// ΓöÇΓöÇΓöÇ Audit ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ

export interface AuditLogsTable {
  id?: string;
  actor_user_id: string | null;
  action: string;
  entity_table: string;
  entity_id: string | null;
  request_id: string | null;
  ip_address: string | null;
  user_agent: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
}

// ΓöÇΓöÇΓöÇ Kysely Database interface ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ

export interface Database {
  // public schema (default)
  profiles: ProfilesTable;
  user_roles: UserRolesTable;
  parent_profiles: ParentProfilesTable;
  student_profiles: StudentProfilesTable;
  tutor_profiles: TutorProfilesTable;
  admin_profiles: AdminProfilesTable;
  parent_student_links: ParentStudentLinksTable;
  grade_bands: GradeBandsTable;
  grade_levels: GradeLevelsTable;
  subjects: SubjectsTable;
  classes: ClassesTable;
  class_enrollments: ClassEnrollmentsTable;
  lessons: LessonsTable;
  lesson_attendance: LessonAttendanceTable;
  assignments: AssignmentsTable;
  assignment_submissions: AssignmentSubmissionsTable;
  submission_files: SubmissionFilesTable;
  submission_grades: SubmissionGradesTable;
  quizzes: QuizzesTable;
  quiz_questions: QuizQuestionsTable;
  quiz_attempts: QuizAttemptsTable;
  quiz_responses: QuizResponsesTable;
  progress_snapshots: ProgressSnapshotsTable;
  notifications: NotificationsTable;
  notification_deliveries: NotificationDeliveriesTable;
  tutor_live_content_posts: TutorLiveContentPostsTable;
  dashboard_chat_messages: DashboardChatMessagesTable;
  learning_activity_events: LearningActivityEventsTable;
  // private schema
  'private.lesson_live_sessions': LessonLiveSessionsTable;
  // billing schema ΓÇö Kysely needs schema-qualified names
  'billing.plans': BillingPlansTable;
  'billing.subscriptions': BillingSubscriptionsTable;
  'billing.invoices': BillingInvoicesTable;
  'billing.payments': BillingPaymentsTable;
  // audit schema
  'audit.audit_logs': AuditLogsTable;
}
