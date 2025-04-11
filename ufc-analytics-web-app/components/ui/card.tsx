import React from 'react'
import styles from './card.module.css';

interface CardProps {
  children: React.ReactNode
  className?: string 
}

const Card: React.FC<CardProps> = ({ children, className }) => {
  return <div className={`${styles.card} ${className}`}>{children}</div>
}

interface CardHeaderProps {
  children: React.ReactNode
  className?: string 
}

const CardHeader: React.FC<CardHeaderProps> = ({ children, className }) => {
  return <div className={`${styles.cardHeader} ${className}`}>{children}</div>
}

interface CardContentProps {
  children: React.ReactNode
  className?: string 
}

const CardContent: React.FC<CardContentProps> = ({ children, className }) => {
  return <div className={`${styles.cardContent} ${className}`}>{children}</div>
}

interface CardTitleProps {
  children: React.ReactNode
  className?: string 
}

const CardTitle: React.FC<CardTitleProps> = ({ children, className }) => {
  return <h3 className={`${styles.cardTitle} ${className}`}>{children}</h3>
}

interface CardDescriptionProps {
  children: React.ReactNode
  className?: string 
}

const CardDescription: React.FC<CardDescriptionProps> = ({ children, className }) => {
  return <p className={`${styles.cardDescription} ${className}`}>{children}</p>
}

export { Card, CardHeader, CardContent, CardTitle, CardDescription }
