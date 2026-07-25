import React from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, icon, className = '', id, ...props }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="w-full flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="text-xs font-medium text-amber-200/90 tracking-wide"
          >
            {label}
          </label>
        )}
        <div className="relative flex items-center w-full">
          {icon && (
            <div className="absolute left-3.5 text-amber-400/70 pointer-events-none flex items-center justify-center">
              {icon}
            </div>
          )}
          <input
            id={inputId}
            ref={ref}
            className={`w-full h-11 bg-slate-950/90 text-slate-100 placeholder-slate-500 text-sm rounded-xl border border-amber-500/30 focus:border-amber-400 focus:ring-1 focus:ring-amber-400/40 outline-none transition-all duration-150 ${
              icon ? 'pl-10 pr-3.5' : 'px-3.5'
            } ${error ? 'border-rose-500 focus:border-rose-500' : ''} ${className}`}
            {...props}
          />
        </div>
        {error && <span className="text-xs text-rose-400 font-medium">{error}</span>}
      </div>
    );
  }
);

Input.displayName = 'Input';
