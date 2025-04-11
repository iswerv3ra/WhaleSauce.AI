import React from 'react';
import classNames from 'classnames';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'ghost' | 'outline' | 'default';
  size?: 'sm' | 'md' | 'lg';
}

const Button: React.FC<ButtonProps> = ({ variant = 'default', size = 'md', children, ...props }) => {
  const classes = classNames(
    'rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors duration-200',
    {
      'bg-[#4B75B7] hover:bg-[#3c5e94] text-[#333333]': variant === 'default', // Primary Blue, darker on hover, dark text
      'border border-[#4B75B7] text-[#4B75B7] hover:bg-[#A3C4EB] hover:text-white': variant === 'outline', // Primary Blue border and text, Accent hover, white text on hover
      'text-[#333333] hover:text-[#4B75B7]': variant === 'ghost', // Dark text, Primary blue on hover
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
