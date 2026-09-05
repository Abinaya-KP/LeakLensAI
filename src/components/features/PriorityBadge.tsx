import { getPriorityColor } from '@/lib/utils';
import { cn } from '@/lib/utils';

interface Props {
  priority: string;
  score?: number;
  size?: 'sm' | 'md';
}

export default function PriorityBadge({ priority, score, size = 'md' }: Props) {
  return (
    <span className={cn(
      'inline-flex items-center gap-1.5 font-semibold border rounded-full',
      getPriorityColor(priority),
      size === 'sm' ? 'text-xs px-2 py-0.5' : 'text-xs px-3 py-1'
    )}>
      <span className={cn(
        'w-1.5 h-1.5 rounded-full',
        priority === 'CRITICAL' ? 'bg-red-400' :
        priority === 'HIGH' ? 'bg-orange-400' :
        priority === 'MEDIUM' ? 'bg-yellow-400' : 'bg-green-400'
      )} />
      {priority}
      {score !== undefined && <span className="opacity-70">· {score}</span>}
    </span>
  );
}
