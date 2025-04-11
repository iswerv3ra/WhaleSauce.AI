import React from 'react';
import styles from './Tabs.module.css';

interface TabsContentProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string;
  isActive?: boolean; // Marking this as optional
  children: React.ReactNode;
}

export const TabsContent: React.FC<TabsContentProps> = ({ children, isActive = false, className, ...props }) => {
  return isActive ? <div className={`${styles.tabsContent} ${className}`} {...props}>{children}</div> : null;
};
