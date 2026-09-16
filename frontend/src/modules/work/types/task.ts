export type TaskStatus =
  | 'CHO_XU_LY'
  | 'DANG_XU_LY'
  | 'CHO_DUYET'
  | 'HOAN_THANH'
  | 'CHUA_HOAN_THANH'
  | 'QUA_HAN';

export type ParticipantRole = 'CHU_TRI' | 'CHI_DAO' | 'THAM_GIA';

export interface TaskCreator {
  id?: number | string;
  username?: string;
  fullName?: string;
  name?: string;
  position?: string;
  role?: string;
}

export interface TaskParticipant {
  id?: number | string;
  userId?: number | string;
  user?: number | string | TaskCreator;
  name?: string;
  fullName?: string;
  position?: string;
  role: ParticipantRole | string;
}

export interface TaskItem {
  id: number | string;
  title: string;
  createdDate?: string;
  created_date?: string;
  dueDate?: string;
  due_date?: string;
  requirement?: string;
  requirements?: string;
  createdBy?: TaskCreator | string;
  created_by?: TaskCreator | string;
  creatorPosition?: string;
  isPublic?: boolean;
  is_public?: boolean;
  status: TaskStatus | string;
  statusLabel?: string;
  participants?: TaskParticipant[];
  leader?: string | { name: string; position?: string };
  members?: Array<string | { name: string; position?: string }>;
}
