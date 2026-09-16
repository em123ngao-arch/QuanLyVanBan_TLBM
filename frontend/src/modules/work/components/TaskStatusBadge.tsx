import React from 'react';
import { TaskStatus } from '../types/task';

export interface TaskStatusBadgeProps {
  status: TaskStatus | string;
  label?: string;
}

interface StatusConfig {
  label: string;
  color: string;
  backgroundColor: string;
  borderColor: string;
  dotColor: string;
}

const TASK_STATUS_CONFIG: Record<string, StatusConfig> = {
  CHO_XU_LY: {
    label: 'Chờ xử lý',
    color: 'var(--text-secondary)',
    backgroundColor: 'rgba(148, 163, 184, 0.15)',
    borderColor: 'rgba(148, 163, 184, 0.3)',
    dotColor: '#94a3b8',
  },
  DANG_XU_LY: {
    label: 'Đang xử lý',
    color: 'var(--color-primary)',
    backgroundColor: 'var(--color-primary-subtle)',
    borderColor: 'var(--color-primary-border)',
    dotColor: 'var(--color-primary)',
  },
  CHO_DUYET: {
    label: 'Chờ duyệt',
    color: 'var(--color-warning-text)',
    backgroundColor: 'var(--color-warning-subtle)',
    borderColor: 'var(--color-warning-border)',
    dotColor: 'var(--color-warning)',
  },
  HOAN_THANH: {
    label: 'Hoàn thành',
    color: 'var(--color-success)',
    backgroundColor: 'var(--color-success-subtle)',
    borderColor: 'var(--color-success-border)',
    dotColor: 'var(--color-success)',
  },
  CHUA_HOAN_THANH: {
    label: 'Chưa hoàn thành',
    color: '#ea580c',
    backgroundColor: 'rgba(234, 88, 12, 0.15)',
    borderColor: 'rgba(234, 88, 12, 0.35)',
    dotColor: '#ea580c',
  },
  QUA_HAN: {
    label: 'Quá hạn',
    color: 'var(--color-danger)',
    backgroundColor: 'var(--color-danger-subtle)',
    borderColor: 'var(--color-danger-border)',
    dotColor: 'var(--color-danger)',
  },
};

export const TaskStatusBadge: React.FC<TaskStatusBadgeProps> = ({ status, label }) => {
  // Chuẩn hóa trạng thái nếu truyền vào text tiếng Việt hoặc key
  const normalizedKey =
    Object.keys(TASK_STATUS_CONFIG).find(
      (key) =>
        key.toUpperCase() === status.toUpperCase() ||
        TASK_STATUS_CONFIG[key].label.toLowerCase() === status.toLowerCase()
    ) || 'CHO_XU_LY';

  const config = TASK_STATUS_CONFIG[normalizedKey];
  const displayLabel = label || config.label;

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        padding: '3px 10px',
        borderRadius: 'var(--radius-full)',
        fontSize: '0.78rem',
        fontWeight: 600,
        lineHeight: 1.4,
        color: config.color,
        backgroundColor: config.backgroundColor,
        border: `1px solid ${config.borderColor}`,
        whiteSpace: 'nowrap',
        transition: 'all var(--transition-fast)',
      }}
    >
      <span
        style={{
          width: '6px',
          height: '6px',
          borderRadius: '50%',
          backgroundColor: config.dotColor,
          display: 'inline-block',
          flexShrink: 0,
        }}
      />
      {displayLabel}
    </span>
  );
};

export default TaskStatusBadge;
