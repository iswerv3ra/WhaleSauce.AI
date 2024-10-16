import React from 'react';
import classNames from 'classnames';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'ghost' | 'outline' | 'default';
  size?: 'sm' | 'md' | 'lg';
}

const Button: React.FC<ButtonProps> = ({ variant = 'default', size = 'md', children, ...props }) => {
  const classes = classNames(
    'rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2',
    {
      'bg-red-600 hover:bg-red-700 text-white': variant === 'default',
      'border border-white text-white hover:bg-red-700': variant === 'outline',
      'text-white hover:text-red-300': variant === 'ghost',
      'py-1 px-3 text-sm': size === 'sm',
      'py-2 px-4 text-md': size === 'md',
      'py-3 px-5 text-lg': size === 'lg',
    }
  );
  return (
    <button className={classes} {...props}>
      {children}
    </button>
  );
};

export { Button };
