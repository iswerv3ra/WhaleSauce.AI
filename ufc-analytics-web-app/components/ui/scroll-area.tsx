import React from 'react'
import styles from './scroll-area.module.css'

interface ScrollAreaProps {
  children: React.ReactNode
  className?: string
}

export const ScrollArea: React.FC<ScrollAreaProps> = ({
  children,
  className,
}) => {
  return (
    <div
      className={`${styles.scrollArea} ${className}`}
    >
      {children}
    </div>
  )
}


