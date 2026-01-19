import React from 'react';
import { FiEdit2, FiTrash2, FiEye } from 'react-icons/fi';
import './DataTable.scss';

interface Column<T> {
    key: keyof T | string;
    header: string;
    render?: (item: T) => React.ReactNode;
    width?: string;
}

interface DataTableProps<T> {
    columns: Column<T>[];
    data: T[];
    onEdit?: (item: T) => void;
    onDelete?: (item: T) => void;
    onView?: (item: T) => void;
    loading?: boolean;
    emptyMessage?: string;
}

// Helper to get stable string key from id
const getItemKey = (id: any, index: number): string => {
    if (typeof id === 'string') return id;
    if (typeof id === 'number') return String(id);
    if (id?.buffer) {
        const buffer = id.buffer;
        const bytes = Object.values(buffer) as number[];
        return bytes.map((b: number) => b.toString(16).padStart(2, '0')).join('');
    }
    return `item-${index}`;
};

function DataTable<T extends { id: any }>({
    columns,
    data,
    onEdit,
    onDelete,
    onView,
    loading = false,
    emptyMessage = 'Məlumat tapılmadı',
}: DataTableProps<T>) {
    const hasActions = onEdit || onDelete || onView;

    // Ensure data is always an array
    const safeData = Array.isArray(data) ? data : [];

    if (loading) {
        return (
            <div className="data-table-loading">
                <div className="skeleton-row"></div>
                <div className="skeleton-row"></div>
                <div className="skeleton-row"></div>
            </div>
        );
    }

    if (safeData.length === 0) {
        return (
            <div className="data-table-empty">
                <p>{emptyMessage}</p>
            </div>
        );
    }

    return (
        <div className="data-table-wrapper">
            <table className="data-table">
                <thead>
                    <tr>
                        {columns.map((column) => (
                            <th key={String(column.key)} style={{ width: column.width }}>
                                {column.header}
                            </th>
                        ))}
                        {hasActions && <th className="actions-header">Əməliyyatlar</th>}
                    </tr>
                </thead>
                <tbody>
                    {safeData.map((item, index) => (
                        <tr key={getItemKey(item.id, index)}>
                            {columns.map((column) => (
                                <td key={String(column.key)}>
                                    {column.render
                                        ? column.render(item)
                                        : String(item[column.key as keyof T] ?? '')}
                                </td>
                            ))}
                            {hasActions && (
                                <td className="actions-cell">
                                    {onView && (
                                        <button
                                            className="action-btn view"
                                            onClick={() => onView(item)}
                                            title="Bax"
                                        >
                                            <FiEye />
                                        </button>
                                    )}
                                    {onEdit && (
                                        <button
                                            className="action-btn edit"
                                            onClick={() => onEdit(item)}
                                            title="Redaktə"
                                        >
                                            <FiEdit2 />
                                        </button>
                                    )}
                                    {onDelete && (
                                        <button
                                            className="action-btn delete"
                                            onClick={() => onDelete(item)}
                                            title="Sil"
                                        >
                                            <FiTrash2 />
                                        </button>
                                    )}
                                </td>
                            )}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default DataTable;
