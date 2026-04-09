import type { AppRole, NotificationKind } from '@edvoura/contracts';

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
  id: string;
  user_id: string;
  role: AppRole;
  granted_by_user_id: string | null;
  granted_at: string;
  revoked_at: string | null;
}

export interface NotificationsTable {
  id: string;
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

export interface Database {
  profiles: ProfilesTable;
  user_roles: UserRolesTable;
  notifications: NotificationsTable;
}
