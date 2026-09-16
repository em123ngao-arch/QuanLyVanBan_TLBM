import React from 'react';
import { TaskItem, TaskCreator } from '../types/task';
import TaskAssigneeCell from './TaskAssigneeCell';
import TaskStatusBadge from './TaskStatusBadge';

export interface TaskTableProps {
  tasks: TaskItem[];
  onOpenTask: (taskId: number | string) => void;
  onEditTask?: (task: TaskItem) => void;
  onDeleteTask?: (taskId: number | string) => void;
  onApproveTask?: (taskId: number | string) => void;
  startIndex?: number;
  isLoading?: boolean;
}

/**
 * Định dạng ngày theo chuẩn dd/mm/yyyy
 */
const formatDateVN = (dateStr?: string | null): string => {
  if (!dateStr) return '—';
  try {
    const raw = dateStr.trim();
    // Nếu chuỗi dạng YYYY-MM-DD hoặc YYYY-MM-DDTHH:mm:ss
    const datePart = raw.split('T')[0];
    const parts = datePart.split('-');
    if (parts.length === 3) {
      const [year, month, day] = parts;
      if (year.length === 4) {
        return `${day.padStart(2, '0')}/${month.padStart(2, '0')}/${year}`;
      }
    }
    const d = new Date(raw);
    if (!isNaN(d.getTime())) {
      const day = String(d.getDate()).padStart(2, '0');
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const year = d.getFullYear();
      return `${day}/${month}/${year}`;
    }
    return raw;
  } catch {
    return dateStr;
  }
};

/**
 * Trích xuất tên người giao và chức vụ
 */
const getCreatorInfo = (
  createdBy?: TaskCreator | string,
  defaultPosition?: string
): { name: string; position: string } => {
  if (!createdBy) {
    return { name: '—', position: '' };
  }
  if (typeof createdBy === 'string') {
    return { name: createdBy, position: defaultPosition || '' };
  }
  const name = createdBy.fullName || createdBy.name || createdBy.username || '—';
  const position = createdBy.position || createdBy.role || defaultPosition || '';
  return { name, position };
};

export const TaskTable: React.FC<TaskTableProps> = ({
  tasks,
  onOpenTask,
  onEditTask,
  onDeleteTask,
  onApproveTask,
  startIndex = 0,
  isLoading = false,
}) => {
  return (
    <div
      style={{
        width: '100%',
        overflowX: 'auto',
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--border-subtle)',
        backgroundColor: 'var(--bg-surface)',
        boxShadow: 'var(--shadow-sm)',
        WebkitOverflowScrolling: 'touch',
      }}
    >
      <table
        style={{
          width: '100%',
          minWidth: '1080px',
          borderCollapse: 'collapse',
          textAlign: 'left',
          fontSize: '0.86rem',
        }}
      >
        <thead>
          <tr
            style={{
              backgroundColor: 'var(--bg-surface-elevated)',
              borderBottom: '2px solid var(--border-subtle)',
              color: 'var(--text-secondary)',
              fontSize: '0.8rem',
              fontWeight: 700,
              letterSpacing: '0.3px',
              userSelect: 'none',
            }}
          >
            <th style={{ width: '45px', padding: '12px 10px', textAlign: 'center' }}>TT</th>
            <th style={{ width: '220px', padding: '12px 12px' }}>Nội dung công việc</th>
            <th style={{ width: '150px', padding: '12px 12px' }}>Người giao</th>
            <th style={{ width: '170px', padding: '12px 12px' }}>Yêu cầu xử lý</th>
            <th style={{ width: '190px', padding: '12px 12px' }}>Người thực hiện</th>
            <th style={{ width: '105px', padding: '12px 10px', textAlign: 'center' }}>Ngày giao</th>
            <th style={{ width: '105px', padding: '12px 10px', textAlign: 'center' }}>Hạn xử lý</th>
            <th style={{ width: '125px', padding: '12px 10px', textAlign: 'center' }}>Trạng thái</th>
            <th style={{ width: '125px', padding: '12px 12px', textAlign: 'center' }}>Tác vụ</th>
          </tr>
        </thead>
        <tbody>
          {isLoading ? (
            <tr>
              <td colSpan={9} style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
                Đang tải danh sách công việc...
              </td>
            </tr>
          ) : tasks.length === 0 ? (
            <tr>
              <td colSpan={9} style={{ padding: '48px 16px', textAlign: 'center', color: 'var(--text-muted)' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '2rem' }}>📋</span>
                  <span style={{ fontSize: '0.95rem', fontWeight: 500, color: 'var(--text-secondary)' }}>
                    Không có công việc nào
                  </span>
                </div>
              </td>
            </tr>
          ) : (
            tasks.map((task, index) => {
              const isHidden = task.isPublic === false || task.is_public === false;
              const creator = getCreatorInfo(
                task.createdBy || task.created_by,
                task.creatorPosition
              );
              const createdDate = formatDateVN(task.createdDate || task.created_date);
              const dueDate = formatDateVN(task.dueDate || task.due_date);
              const requirementText = task.requirement || task.requirements || '—';

              return (
                <tr
                  key={task.id}
                  style={{
                    borderBottom: '1px solid var(--border-subtle)',
                    backgroundColor: isHidden
                      ? 'rgba(239, 68, 68, 0.05)'
                      : index % 2 === 1
                      ? 'rgba(255, 255, 255, 0.015)'
                      : 'transparent',
                    transition: 'background-color var(--transition-fast)',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = isHidden
                      ? 'rgba(239, 68, 68, 0.09)'
                      : 'var(--bg-surface-hover)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = isHidden
                      ? 'rgba(239, 68, 68, 0.05)'
                      : index % 2 === 1
                      ? 'rgba(255, 255, 255, 0.015)'
                      : 'transparent';
                  }}
                >
                  {/* 1. Cột TT */}
                  <td
                    style={{
                      padding: '12px 10px',
                      textAlign: 'center',
                      color: 'var(--text-secondary)',
                      fontWeight: 600,
                    }}
                  >
                    {startIndex + index + 1}
                  </td>

                  {/* 2. Cột Nội dung công việc */}
                  <td style={{ padding: '12px 12px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <button
                        type="button"
                        onClick={() => onOpenTask(task.id)}
                        style={{
                          background: 'none',
                          border: 'none',
                          padding: 0,
                          textAlign: 'left',
                          color: 'var(--text-main)',
                          fontSize: '0.88rem',
                          fontWeight: 600,
                          cursor: 'pointer',
                          lineHeight: 1.4,
                          textDecoration: 'none',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.color = 'var(--color-primary)';
                          e.currentTarget.style.textDecoration = 'underline';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.color = 'var(--text-main)';
                          e.currentTarget.style.textDecoration = 'none';
                        }}
                      >
                        {task.title}
                      </button>

                      {/* Nhãn "Đang ẩn" nếu isPublic = false */}
                      {isHidden && (
                        <span
                          style={{
                            alignSelf: 'flex-start',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            padding: '2px 8px',
                            borderRadius: 'var(--radius-xs)',
                            fontSize: '0.72rem',
                            fontWeight: 700,
                            backgroundColor: 'rgba(239, 68, 68, 0.15)',
                            color: 'var(--color-danger)',
                            border: '1px solid var(--color-danger-border)',
                          }}
                        >
                          🔒 Đang ẩn
                        </span>
                      )}
                    </div>
                  </td>

                  {/* 3. Cột Người giao */}
                  <td style={{ padding: '12px 12px', verticalAlign: 'top' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                      <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>
                        {creator.name}
                      </span>
                      {creator.position && (
                        <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
                          ({creator.position})
                        </span>
                      )}
                    </div>
                  </td>

                  {/* 4. Cột Yêu cầu xử lý */}
                  <td
                    style={{
                      padding: '12px 12px',
                      verticalAlign: 'top',
                      color: 'var(--text-secondary)',
                      lineHeight: 1.45,
                    }}
                  >
                    {requirementText}
                  </td>

                  {/* 5. Cột Người thực hiện */}
                  <td style={{ padding: '12px 12px', verticalAlign: 'top' }}>
                    <TaskAssigneeCell
                      participants={task.participants}
                      leader={task.leader}
                      members={task.members}
                    />
                  </td>

                  {/* 6. Cột Ngày giao */}
                  <td
                    style={{
                      padding: '12px 10px',
                      textAlign: 'center',
                      verticalAlign: 'middle',
                      color: 'var(--text-main)',
                      fontWeight: 500,
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {createdDate}
                  </td>

                  {/* 7. Cột Hạn xử lý */}
                  <td
                    style={{
                      padding: '12px 10px',
                      textAlign: 'center',
                      verticalAlign: 'middle',
                      color: 'var(--text-main)',
                      fontWeight: 500,
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {dueDate}
                  </td>

                  {/* 8. Cột Trạng thái */}
                  <td
                    style={{
                      padding: '12px 10px',
                      textAlign: 'center',
                      verticalAlign: 'middle',
                    }}
                  >
                    <TaskStatusBadge status={task.status} label={task.statusLabel} />
                  </td>

                  {/* 9. Cột Tác vụ */}
                  <td
                    style={{
                      padding: '12px 12px',
                      textAlign: 'center',
                      verticalAlign: 'middle',
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                        flexWrap: 'wrap',
                      }}
                    >
                      {/* Nút Sửa */}
                      {onEditTask && (
                        <button
                          type="button"
                          onClick={() => onEditTask(task)}
                          title="Sửa công việc"
                          style={{
                            padding: '4px 8px',
                            borderRadius: 'var(--radius-xs)',
                            border: '1px solid var(--border-subtle)',
                            backgroundColor: 'var(--bg-surface-elevated)',
                            color: 'var(--color-primary)',
                            fontSize: '0.76rem',
                            fontWeight: 600,
                            cursor: 'pointer',
                            transition: 'all var(--transition-fast)',
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = 'var(--color-primary-subtle)';
                            e.currentTarget.style.borderColor = 'var(--color-primary-border)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = 'var(--bg-surface-elevated)';
                            e.currentTarget.style.borderColor = 'var(--border-subtle)';
                          }}
                        >
                          Sửa
                        </button>
                      )}

                      {/* Nút Duyệt */}
                      {onApproveTask && (
                        <button
                          type="button"
                          onClick={() => onApproveTask(task.id)}
                          title="Duyệt công việc"
                          style={{
                            padding: '4px 8px',
                            borderRadius: 'var(--radius-xs)',
                            border: '1px solid var(--border-subtle)',
                            backgroundColor: 'var(--bg-surface-elevated)',
                            color: 'var(--color-success)',
                            fontSize: '0.76rem',
                            fontWeight: 600,
                            cursor: 'pointer',
                            transition: 'all var(--transition-fast)',
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = 'var(--color-success-subtle)';
                            e.currentTarget.style.borderColor = 'var(--color-success-border)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = 'var(--bg-surface-elevated)';
                            e.currentTarget.style.borderColor = 'var(--border-subtle)';
                          }}
                        >
                          Duyệt
                        </button>
                      )}

                      {/* Nút Xóa */}
                      {onDeleteTask && (
                        <button
                          type="button"
                          onClick={() => onDeleteTask(task.id)}
                          title="Xóa công việc"
                          style={{
                            padding: '4px 8px',
                            borderRadius: 'var(--radius-xs)',
                            border: '1px solid var(--border-subtle)',
                            backgroundColor: 'var(--bg-surface-elevated)',
                            color: 'var(--color-danger)',
                            fontSize: '0.76rem',
                            fontWeight: 600,
                            cursor: 'pointer',
                            transition: 'all var(--transition-fast)',
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = 'var(--color-danger-subtle)';
                            e.currentTarget.style.borderColor = 'var(--color-danger-border)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = 'var(--bg-surface-elevated)';
                            e.currentTarget.style.borderColor = 'var(--border-subtle)';
                          }}
                        >
                          Xóa
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
};

export default TaskTable;
