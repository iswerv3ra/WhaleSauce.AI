import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string; // Added className prop
}

const Card: React.FC<CardProps> = ({ children, className }) => {
  return <div className={`p-4 rounded-lg shadow-md ${className}`}>{children}</div>;
};

interface CardHeaderProps {
  children: React.ReactNode;
  className?: string; // Added className prop
}

const CardHeader: React.FC<CardHeaderProps> = ({ children, className }) => {
  return <div className={`mb-4 ${className}`}>{children}</div>;
};

interface CardContentProps {
  children: React.ReactNode;
  className?: string; // Added className prop
}

const CardContent: React.FC<CardContentProps> = ({ children, className }) => {
  return <div className={className}>{children}</div>;
};

interface CardTitleProps {
  children: React.ReactNode;
  className?: string; // Added className prop
}

const CardTitle: React.FC<CardTitleProps> = ({ children, className }) => {
  return <h3 className={`text-lg font-bold ${className}`}>{children}</h3>;
};

interface CardDescriptionProps {
  children: React.ReactNode;
  className?: string; // Added className prop
}

const CardDescription: React.FC<CardDescriptionProps> = ({ children, className }) => {
  return <p className={`text-sm ${className}`}>{children}</p>;
};

export { Card, CardHeader, CardContent, CardTitle, CardDescription };
