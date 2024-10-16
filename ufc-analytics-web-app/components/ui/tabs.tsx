import React, { useState } from 'react';

interface TabsProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  defaultValue: string;
}

export const Tabs: React.FC<TabsProps> = ({ children, className, ...props }) => {
  return <div className={`tabs-container ${className}`} {...props}>{children}</div>;
};

interface TabsListProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export const TabsList: React.FC<TabsListProps> = ({ children, className, ...props }) => {
  return <div className={`tabs-list ${className}`} {...props}>{children}</div>;
};

interface TabsTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  value: string;
  children: React.ReactNode;
  isActive?: boolean;
}

export const TabsTrigger: React.FC<TabsTriggerProps> = ({ children, isActive, className, ...props }) => {
  return <button className={`tabs-trigger ${isActive ? 'active' : ''} ${className}`} {...props}>{children}</button>;
};

interface TabsContentProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string;
  isActive: boolean;
  children: React.ReactNode;
}

export const TabsContent: React.FC<TabsContentProps> = ({ children, isActive, className, ...props }) => {
  return isActive ? <div className={`tabs-content ${className}`} {...props}>{children}</div> : null;
};
