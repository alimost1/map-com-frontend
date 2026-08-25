import { forwardRef } from 'react';

export const Table = forwardRef(function Table({ 
  className = '', 
  columns = [], 
  data = [], 
  keyField = 'id',
  emptyMessage = 'No data available',
  loading = false,
  onRowClick,
  ...props 
}, ref) {
  return (
    <div className={`table-container ${className}`} {...props}>
      {loading ? (
        <div className="p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-2" />
          <p className="text-dark-500">Loading...</p>
        </div>
      ) : data.length === 0 ? (
        <div className="p-8 text-center text-dark-500">
          {emptyMessage}
        </div>
      ) : (
        <table className="table" role="table">
          <thead>
            <tr>
              {columns.map((column) => (
                <th key={column.key} style={{ width: column.width }}>
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row) => (
              <tr 
                key={row[keyField]} 
                className={onRowClick ? 'cursor-pointer' : ''}
                onClick={() => onRowClick?.(row)}
              >
                {columns.map((column) => (
                  <td key={column.key} data-label={column.header}>
                    {column.render ? column.render(row[column.key], row) : row[column.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
});

Table.displayName = 'Table';