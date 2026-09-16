import React from 'react';
import { TaskParticipant } from '../types/task';

export interface AssigneePerson {
  name: string;
  position?: string;
}

export interface TaskAssigneeCellProps {
  leader?: string | AssigneePerson;
  members?: Array<string | AssigneePerson>;
  participants?: TaskParticipant[];
}

export const TaskAssigneeCell: React.FC<TaskAssigneeCellProps> = ({
  leader: directLeader,
  members: directMembers,
  participants,
}) => {
  // Trích xuất tên từ chuỗi hoặc đối tượng
  const extractName = (person?: string | AssigneePerson | TaskParticipant | null): string => {
    if (!person) return '';
    if (typeof person === 'string') return person.trim();
    if ('fullName' in person && person.fullName) return person.fullName;
    if ('name' in person && person.name) return person.name;
    if ('user' in person && person.user && typeof person.user === 'object') {
      const u = person.user as { fullName?: string; name?: string; username?: string };
      return u.fullName || u.name || u.username || '';
    }
    return '';
  };

  let leaderName = '';
  let memberNames: string[] = [];

  if (participants && participants.length > 0) {
    const leaderParticipant = participants.find((p) => p.role === 'CHU_TRI');
    if (leaderParticipant) {
      leaderName = extractName(leaderParticipant);
    }

    memberNames = participants
      .filter((p) => p.role === 'THAM_GIA')
      .map((p) => extractName(p))
      .filter(Boolean);
  }

  // Nếu truyền trực tiếp leader hoặc members thì ưu tiên sử dụng
  if (directLeader) {
    leaderName = extractName(directLeader);
  }

  if (directMembers && directMembers.length > 0) {
    memberNames = directMembers.map((m) => extractName(m)).filter(Boolean);
  }

  if (!leaderName && memberNames.length === 0) {
    return <span style={{ color: 'var(--text-muted)', fontStyle: 'italic', fontSize: '0.85rem' }}>—</span>;
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '4px',
        fontSize: '0.84rem',
        lineHeight: '1.45',
        textAlign: 'left',
      }}
    >
      {leaderName && (
        <div style={{ color: 'var(--text-main)' }}>
          <span style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>Chủ trì: </span>
          <span style={{ fontWeight: 500 }}>{leaderName}</span>
        </div>
      )}

      {memberNames.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
          <span style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>Cán bộ thực hiện:</span>
          <div style={{ paddingLeft: '4px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
            {memberNames.map((name, index) => (
              <div
                key={`${name}-${index}`}
                style={{
                  color: 'var(--text-main)',
                  display: 'flex',
                  alignItems: 'baseline',
                  gap: '4px',
                }}
              >
                <span style={{ color: 'var(--text-muted)' }}>-</span>
                <span>{name}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskAssigneeCell;
