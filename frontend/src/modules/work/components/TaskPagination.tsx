import React from 'react';

export interface TaskPaginationProps {
  currentPage: number;
  totalPages: number;
  pageSize: number;
  totalItems?: number;
  pageSizeOptions?: number[];
  onPageChange: (newPage: number) => void;
  onPageSizeChange: (newPageSize: number) => void;
}

export const TaskPagination: React.FC<TaskPaginationProps> = ({
  currentPage,
  totalPages,
  pageSize,
  totalItems,
  pageSizeOptions = [10, 20, 50],
  onPageChange,
  onPageSizeChange,
}) => {
  const safeTotalPages = Math.max(1, totalPages);
  const isPrevDisabled = currentPage <= 1;
  const isNextDisabled = currentPage >= safeTotalPages;

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '12px',
        padding: '12px 16px',
        borderTop: '1px solid var(--border-subtle)',
        backgroundColor: 'var(--bg-surface)',
        fontSize: '0.86rem',
        color: 'var(--text-secondary)',
      }}
    >
      {/* Thông tin số lượng bản ghi & chọn pageSize */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span>Hiển thị:</span>
          <select
            value={pageSize}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
            style={{
              padding: '4px 8px',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border-subtle)',
              backgroundColor: 'var(--bg-surface-elevated)',
              color: 'var(--text-main)',
              fontSize: '0.84rem',
              cursor: 'pointer',
              outline: 'none',
              transition: 'border-color var(--transition-fast)',
            }}
          >
            {pageSizeOptions.map((opt) => (
              <option key={opt} value={opt}>
                {opt} dòng / trang
              </option>
            ))}
          </select>
        </div>

        {totalItems !== undefined && (
          <span style={{ color: 'var(--text-muted)' }}>
            (Tổng số: <strong style={{ color: 'var(--text-main)' }}>{totalItems}</strong> công việc)
          </span>
        )}
      </div>

      {/* Điều khiển chuyển trang */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <button
          type="button"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={isPrevDisabled}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            padding: '6px 14px',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--border-subtle)',
            backgroundColor: isPrevDisabled ? 'transparent' : 'var(--bg-surface-elevated)',
            color: isPrevDisabled ? 'var(--text-muted)' : 'var(--text-main)',
            fontSize: '0.84rem',
            fontWeight: 500,
            cursor: isPrevDisabled ? 'not-allowed' : 'pointer',
            opacity: isPrevDisabled ? 0.5 : 1,
            transition: 'all var(--transition-fast)',
          }}
        >
          ← Trang trước
        </button>

        <span style={{ fontWeight: 600, color: 'var(--text-main)', minWidth: '85px', textAlign: 'center' }}>
          Trang {currentPage} / {safeTotalPages}
        </span>

        <button
          type="button"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={isNextDisabled}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            padding: '6px 14px',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--border-subtle)',
            backgroundColor: isNextDisabled ? 'transparent' : 'var(--bg-surface-elevated)',
            color: isNextDisabled ? 'var(--text-muted)' : 'var(--text-main)',
            fontSize: '0.84rem',
            fontWeight: 500,
            cursor: isNextDisabled ? 'not-allowed' : 'pointer',
            opacity: isNextDisabled ? 0.5 : 1,
            transition: 'all var(--transition-fast)',
          }}
        >
          Trang sau →
        </button>
      </div>
    </div>
  );
};

export default TaskPagination;
