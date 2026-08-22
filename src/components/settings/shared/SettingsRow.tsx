import React from "react";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface SettingsRowProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon?: React.ReactNode;
  title: string;
  subtitle?: string;
  rightElement?: React.ReactNode;
  variant?: 'default' | 'danger';
  disabled?: boolean;
  comingSoon?: boolean;
}


export function SettingsRow({ 
  icon, 
  title, 
  subtitle, 
  onClick, 
  rightElement, 
  variant = 'default',
  disabled = false,
  comingSoon = false,
  ...props
}: SettingsRowProps) {

  const isClickable = !!onClick && !disabled && !comingSoon;

  return (
    <button 
      onClick={isClickable ? onClick : undefined} 
      disabled={disabled || comingSoon}
      className={cn(
        "w-full flex items-center gap-4 p-5 transition-all press text-left relative overflow-hidden group/row",
        isClickable ? "hover:bg-white/5 active:bg-white/10" : "cursor-default",
        (disabled || comingSoon) && "opacity-50 grayscale-[0.5]",
        variant === 'danger' && "hover:bg-rose-500/10"
      )}
      {...props}
    >

      <div className="absolute inset-0 bg-gradient-to-r from-primary/0 to-primary/0 group-hover/row:from-primary/5 transition-all duration-500 pointer-events-none" />
      
      {icon && (
        <div className={cn(
          "shrink-0 flex items-center justify-center w-8 h-8 rounded-lg bg-white/5 relative z-10 transition-transform duration-300 group-hover/row:scale-110 group-hover/row:bg-white/10",
          variant === 'danger' ? "text-rose-400" : "text-muted-foreground group-hover/row:text-primary"
        )}>
          {icon}
        </div>
      )}

      
      <div className="flex-1 min-w-0 relative z-10">
        <div className="flex items-center gap-2">

          <span className={cn(
            "font-medium text-[15px] transition-colors",
            variant === 'danger' ? "text-rose-400" : "text-foreground"
          )}>
            {title}
          </span>
          {comingSoon && (
            <span className="text-[9px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full uppercase tracking-widest border border-primary/10">
              Soon
            </span>
          )}
        </div>
        {subtitle && (
          <div className="text-[11px] text-muted-foreground mt-0.5 line-clamp-1">
            {subtitle}
          </div>
        )}
      </div>

      <div className="shrink-0 flex items-center gap-2 relative z-10">
        {rightElement}
        {isClickable && !rightElement && (
          <ChevronRight className="w-4 h-4 text-muted-foreground/20 group-hover/row:text-primary/60 group-hover/row:translate-x-0.5 transition-all duration-300" />
        )}
      </div>

    </button>
  );
}
