const Table = ({
  columns,
  renderRow,
  data,
}: {
  columns: { header: string; accessor: string; className?: string }[];
  renderRow: (item: any) => React.ReactNode;
  data: any[];
}) => {
  return (
    <div className="w-full overflow-x-auto mt-4 rounded-md border border-gray-200">
      <table className="min-w-full table-auto">
        <thead>
          <tr className="text-left text-gray-500 text-sm bg-gray-50">
            {columns.map((col) => (
              <th
                key={col.accessor}
                className={`px-4 py-2 whitespace-nowrap ${col.className}`}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {data.map((item) => renderRow(item))}
        </tbody>
      </table>
    </div>

  );
};

export default Table;
