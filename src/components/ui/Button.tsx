import React from 'react';
import { Loader2 } from 'lucide-react';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive' | 'danger' | 'accent' | 'yellow';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(({
  children,
  className = '',
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  disabled,
  ...props
}, ref) => {
  const baseClasses = "inline-flex items-center justify-center font-bold font-sans transition-colors duration-180 rounded-lg select-none focus:outline-none focus-visible:ring-2 focus-visible:ring-[#416F89] focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]";

  const sizeClasses = {
    sm: "px-3.5 py-1.5 text-xs gap-1.5 min-h-[36px]",
    md: "px-4 py-2 text-xs sm:text-sm gap-2 min-h-[40px]",
    lg: "px-5 py-2.5 text-sm sm:text-base gap-2.5 min-h-[44px]",
  }[size];

  // Standardized 5 core variants (with aliases mapped cleanly to maintain existing workflows)
  const variantClasses: Record<ButtonVariant, string> = {
    primary: "bg-[#416F89] hover:bg-[#315C74] text-white shadow-sm hover:shadow",
    secondary: "bg-[#D5E3EC]/70 hover:bg-[#D5E3EC] text-[#20364A] border border-[#C4D5E0] hover:border-[#8FB3C6]",
    outline: "bg-white hover:bg-[#F4F8FA] text-[#20364A] border border-[#C4D5E0] hover:border-[#416F89] hover:text-[#315C74]",
    ghost: "bg-transparent hover:bg-[#20364A]/5 text-[#4F6576] hover:text-[#20364A]",
    destructive: "bg-[#A94842] hover:bg-[#8F3530] text-white shadow-sm",
    danger: "bg-[#A94842] hover:bg-[#8F3530] text-white shadow-sm",
    accent: "bg-[#20364A] hover:bg-[#172B3D] text-white shadow-sm",
    yellow: "bg-[#F4D77B] hover:bg-[#E9C75D] text-[#20364A] border border-[#D1AF47]/40 shadow-sm font-extrabold",
  };

  return (
    <button
      ref={ref}
      disabled={disabled || isLoading}
      className={`${baseClasses} ${sizeClasses} ${variantClasses[variant]} ${className}`}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin text-current" aria-hidden="true" />
      ) : (
        leftIcon && <span className="inline-flex items-center" aria-hidden="true">{leftIcon}</span>
      )}
      <span>{children}</span>
      {!isLoading && rightIcon && (
        <span className="inline-flex items-center" aria-hidden="true">{rightIcon}</span>
      )}
    </button>
  );
});

Button.displayName = 'Button';
