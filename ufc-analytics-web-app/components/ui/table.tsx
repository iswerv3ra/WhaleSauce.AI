import React from "react";

interface TableProps {
  children: React.ReactNode;
  className?: string;
}

export const Table: React.FC<TableProps> = ({ children, className }) => {
  return (
    <table className={`w-full border-collapse ${className}`}>
      {children}
    </table>
  );
};

export const TableHead = ({ children }: { children: React.ReactNode }) => (
  <th className="p-2 border-b-2 border-[#4B75B7] bg-[#77A1D3] text-[#333333]">{children}</th>
);
export const TableRow = ({ children }: { children: React.ReactNode }) => (
  <tr className="hover:bg-[#A3C4EB]/20">{children}</tr>
);
export const TableCell = ({ children }: { children: React.ReactNode }) => (
  <td className="p-2 border-b border-gray-300 text-[#333333]">
    {children}
  </td>
);
export const TableBody = ({ children }: { children: React.ReactNode }) => (
  <tbody>{children}</tbody>
);
export const TableHeader = ({ children }: { children: React.ReactNode }) => (
  <thead>{children}</thead>
);
