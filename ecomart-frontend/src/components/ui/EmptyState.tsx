import React from 'react';
import { LucideIcon, Package } from 'lucide-react';

export interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
  variant?: 'default' | 'autumn' | 'primary';
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon = Package,
  title,
  description,
  action,
  variant = 'default',
  className = '',
}) => {
  const variantStyles = {
    default:
      'bg-surface border-2 border-dashed border-border text-softdark',
    primary:
      'bg-gradient-to-b from-primary-50/90 via-surface-soft to-surface border-2 border-dashed border-primary-300 text-softdark',
    autumn:
      'bg-gradient-to-b from-autumn-50/80 via-surface-warm to-surface border-2 border-dashed border-autumn-400/90 text-softdark',
  };

  const iconStyles = {
    default: 'bg-primary-100/70 text-primary-700 border-primary-200/80',
    primary: 'bg-primary-100 text-primary-800 border-primary-300/80',
    autumn: 'bg-autumn-100 text-autumn-900 border-autumn-300/90',
  };

  return (
    <div
      className={`p-12 sm:p-14 text-center rounded-[2rem] space-y-4 shadow-sm relative overflow-hidden ${variantStyles[variant]} ${className}`}
    >
      <div
        className={`w-16 h-16 mx-auto rounded-2xl flex items-center justify-center border shadow-xs ${iconStyles[variant]}`}
      >
        <Icon className="w-8 h-8 stroke-[1.75]" />
      </div>
      <div className="space-y-1.5 max-w-md mx-auto">
        <h4 className="font-extrabold text-base sm:text-lg text-primary-950">{title}</h4>
        {description && (
          <p className="text-xs text-softdark-muted leading-relaxed">{description}</p>
        )}
      </div>
      {action && <div className="pt-1">{action}</div>}
    </div>
  );
};

export default EmptyState;
