// frontend/src/components/common/Table.js
import React from 'react';
import { Table as BootstrapTable, Spinner } from 'react-bootstrap';

const CustomTable = ({ columns, data, isLoading, onRowClick, striped = true, bordered = true, hover = true, responsive = true }) => {
  if (isLoading) {
    return <div className="text-center p-5"><Spinner animation="border" /> Loading data...</div>;
  }

  if (!data || data.length === 0) {
    return <p className="text-center p-3">No data available.</p>;
  }

  return (
    <BootstrapTable striped={striped} bordered={bordered} hover={hover} responsive={responsive} className="mt-3">
      <thead>
        <tr>
          {columns.map((col) => (
            <th key={col.key || col.header}>{col.header}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data.map((row, rowIndex) => (
          <tr key={row._id || rowIndex} onClick={() => onRowClick && onRowClick(row)} style={onRowClick ? {cursor: 'pointer'} : {}}>
            {columns.map((col) => (
              <td key={`${row._id || rowIndex}-${col.key || col.header}`}>
                {col.render ? col.render(row) : row[col.key]}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </BootstrapTable>
  );
};

export default CustomTable;