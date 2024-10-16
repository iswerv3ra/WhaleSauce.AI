import React from 'react';

interface TableProps {
  children: React.ReactNode;
  className?: string;
}

export const Table: React.FC<TableProps> = ({ children, className }) => {
  return <table className={`w-full border-collapse ${className}`}>{children}</table>;
};

export const TableHead = ({ children }: { children: React.ReactNode }) => <th className="p-2 border-b">{children}</th>;
export const TableRow = ({ children }: { children: React.ReactNode }) => <tr>{children}</tr>;
export const TableCell = ({ children }: { children: React.ReactNode }) => <td className="p-2 border-b">{children}</td>;
export const TableBody = ({ children }: { children: React.ReactNode }) => <tbody>{children}</tbody>;
export const TableHeader = ({ children }: { children: React.ReactNode }) => <thead>{children}</thead>;
