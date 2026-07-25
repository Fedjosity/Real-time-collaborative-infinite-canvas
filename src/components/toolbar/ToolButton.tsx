import React from 'react';

export interface ToolButtonProps {
  label: string;
  icon: React.ReactNode;
  isActive?: boolean;
  shortcut?: string;
  onClick: () => void;
  badge?: React.ReactNode;
}

export const ToolButton: React.FC<ToolButtonProps> = ({
  label,
  icon,
  isActive = false,
  shortcut,
  onClick,
  badge,
}) => {
  return (
    <div className="relative group">
      <button
        type="button"
        onClick={onClick}
        className={`relative w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-150 cursor-pointer select-none ${
          isActive
            ? 'bg-gradient-to-r from-primary-container via-primary to-yellow-500 text-on-surface shadow-lg shadow-primary/25 border border-on-primary-container/40 scale-105 font-bold'
            : 'bg-on-surface/70 hover:bg-on-surface text-outline-variant hover:text-on-primary-container border border-outline-variant/20 hover:border-primary/40'
        }`}
        aria-label={label}
      >
        {icon}
        {badge}
      </button>

      {/* Tooltip on Hover */}
      <div className="absolute left-14 top-1/2 -translate-y-1/2 hidden group-hover:flex items-center gap-2 px-2.5 py-1 rounded-lg bg-[#ffffff] text-on-surface-variant text-xs font-medium whitespace-nowrap border border-outline-variant/30 shadow-2xl z-50 pointer-events-none">
        <span>{label}</span>
        {shortcut && (
          <span className="px-1.5 py-0.5 rounded bg-on-surface text-primary-container/80 text-[10px] font-mono border border-outline-variant/20">
            {shortcut}
          </span>
        )}
      </div>
    </div>
  );
};
