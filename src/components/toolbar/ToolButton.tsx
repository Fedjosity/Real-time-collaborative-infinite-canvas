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
            ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30 border border-indigo-400/40 scale-105'
            : 'bg-slate-900/60 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800'
        }`}
        aria-label={label}
      >
        {icon}
        {badge}
      </button>

      {/* Tooltip on Hover */}
      <div className="absolute left-14 top-1/2 -translate-y-1/2 hidden group-hover:flex items-center gap-2 px-2.5 py-1 rounded-lg bg-slate-900 text-slate-100 text-xs font-medium whitespace-nowrap border border-slate-800 shadow-xl z-50 pointer-events-none">
        <span>{label}</span>
        {shortcut && (
          <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 text-[10px] font-mono border border-slate-700">
            {shortcut}
          </span>
        )}
      </div>
    </div>
  );
};
