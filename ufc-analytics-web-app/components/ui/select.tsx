import React from "react";
import styles from "./select.module.css";

interface SelectProps {
  children: React.ReactNode;
  onValueChange: (value: string) => void;
  className?: string;
}

export const Select: React.FC<SelectProps> = ({
  children,
  onValueChange,
  className,
}) => {
  return (
    <select
      onChange={(e) => onValueChange(e.target.value)}
      className={`${styles.select} ${className}`}
    >
      {children}
    </select>
  );
};

interface SelectItemProps {
    children: React.ReactNode;
    value: string;
    className?: string;
}

export const SelectItem: React.FC<SelectItemProps> = ({
  children,
  value,
  className,
}) => {
  return <option value={value} className={`${styles.selectItem} ${className}`}>{children}</option>;
};

interface GenericProps extends React.HTMLAttributes<HTMLElement> {
  children: React.ReactNode;
}

export const SelectTrigger: React.FC<GenericProps> = ({ children, className }) => {
  return <div className={className}>{children}</div>;
};

export const SelectContent: React.FC<GenericProps> = ({ children, className }) => {
    return <div className={`${styles.selectContent} ${className}`}>{children}</div>;
};

export const SelectValue: React.FC<{ placeholder: string; className?: string }> = ({ placeholder, className }) => {   
    return <option value="" className={`${styles.selectValue} ${className}`}>{placeholder}</option>;
};
