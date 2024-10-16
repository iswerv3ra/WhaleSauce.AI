import React from 'react';

interface SelectProps {
  children: React.ReactNode;
  onValueChange: (value: string) => void;
  className?: string; // Added className prop
}

export const Select: React.FC<SelectProps> = ({ children, onValueChange, className }) => {
  return (
    <select onChange={(e) => onValueChange(e.target.value)} className={`w-full p-2 border rounded ${className}`}>
      {children}
    </select>
  );
};

interface SelectItemProps {
  children: React.ReactNode;
  value: string;
  className?: string; // Added className prop
}

export const SelectItem: React.FC<SelectItemProps> = ({ children, value, className }) => {
  return <option value={value} className={className}>{children}</option>;
};

interface GenericProps extends React.HTMLAttributes<HTMLElement> {
  children: React.ReactNode;
}

export const SelectTrigger: React.FC<GenericProps> = ({ children, className }) => {
  return <div className={className}>{children}</div>;
};

export const SelectContent: React.FC<GenericProps> = ({ children, className }) => {
  return <div className={className}>{children}</div>;
};

export const SelectValue: React.FC<{ placeholder: string; className?: string }> = ({ placeholder, className }) => {
  return <option value="" className={className}>{placeholder}</option>;
};
