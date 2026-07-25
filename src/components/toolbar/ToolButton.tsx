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
            ? 'bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-500 text-slate-950 shadow-lg shadow-amber-500/25 border border-amber-300/40 scale-105 font-bold'
            : 'bg-slate-950/70 hover:bg-slate-900 text-slate-400 hover:text-amber-300 border border-amber-500/20 hover:border-amber-500/40'
        }`}
        aria-label={label}
      >
        {icon}
        {badge}
      </button>

      {/* Tooltip on Hover */}
      <div className="absolute left-14 top-1/2 -translate-y-1/2 hidden group-hover:flex items-center gap-2 px-2.5 py-1 rounded-lg bg-[#0e0e12] text-amber-200 text-xs font-medium whitespace-nowrap border border-amber-500/30 shadow-2xl z-50 pointer-events-none">
        <span>{label}</span>
        {shortcut && (
          <span className="px-1.5 py-0.5 rounded bg-slate-900 text-amber-400/80 text-[10px] font-mono border border-amber-500/20">
            {shortcut}
          </span>
        )}
      </div>
    </div>
  );
};
