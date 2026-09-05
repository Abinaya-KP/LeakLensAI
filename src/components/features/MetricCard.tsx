import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface Props {
  label: string;
  value: string;
  subValue?: string;
  icon: LucideIcon;
  iconColor?: string;
  trend?: { value: string; up: boolean };
  highlight?: boolean;
  className?: string;
}

export default function MetricCard({ label, value, subValue, icon: Icon, iconColor = 'text-cyan-400', trend, highlight, className }: Props) {
  return (
    <div className={cn(
      'rounded-xl border p-4 md:p-5 transition-all duration-200 hover:border-border/80',
      highlight ? 'bg-card border-cyan-500/30 glow-cyan' : 'bg-card border-border',
      className
    )}>
      <div className="flex items-start justify-between mb-3">
        <div className={cn('p-2 rounded-lg bg-secondary/50', iconColor.replace('text-', 'text-').replace('400', '500/15'))}>
          <Icon size={16} className={iconColor} />
        </div>
        {trend && (
          <span className={cn(
            'text-xs font-medium px-2 py-0.5 rounded-full',
            trend.up ? 'text-emerald-400 bg-emerald-500/10' : 'text-red-400 bg-red-500/10'
          )}>
            {trend.up ? '↑' : '↓'} {trend.value}
          </span>
        )}
      </div>
      <div className="space-y-0.5">
        <div className={cn('text-xl md:text-2xl font-bold font-mono-data', highlight ? 'text-gradient-cyan' : 'text-foreground')}>
          {value}
        </div>
        <div className="text-xs text-muted-foreground font-medium">{label}</div>
        {subValue && <div className="text-xs text-muted-foreground/70">{subValue}</div>}
      </div>
    </div>
  );
}
