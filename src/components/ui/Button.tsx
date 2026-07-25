import React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  icon,
  className = '',
  disabled,
  ...props
}) => {
  const baseStyles =
    'inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed select-none active:scale-[0.98] shrink-0';

  const sizeStyles = {
    sm: 'px-3 py-1.5 text-xs gap-1.5 h-9',
    md: 'px-4 py-2 text-sm gap-2 h-11',
    lg: 'px-6 py-3 text-base gap-2.5 h-12',
  };

  const variantStyles = {
    primary:
      'bg-gradient-to-r from-primary-container via-primary to-tertiary hover:from-on-primary-container hover:to-primary text-on-surface shadow-lg shadow-outline-variant/20 border border-on-primary-container/40 font-bold',
    secondary:
      'bg-on-surface/90 hover:bg-surface-variant text-on-surface-variant border border-outline-variant/30 hover:border-primary-container/60 shadow-md',
    outline:
      'bg-transparent hover:bg-primary/10 text-on-primary-container border border-primary/40 hover:border-primary-container',
    ghost:
      'bg-transparent hover:bg-primary/10 text-on-primary-container hover:text-on-surface-variant',
    danger:
      'bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-500/20 border border-rose-400/30',
  };

  return (
    <button
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <svg
          className="animate-spin h-4 w-4 text-current"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      ) : (
        icon
      )}
      <span>{children}</span>
    </button>
  );
};
