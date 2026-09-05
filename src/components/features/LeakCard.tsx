import { RevenueLeak } from '@/types';
import { formatCurrencyFull, formatCurrency } from '@/lib/utils';
import PriorityBadge from './PriorityBadge';
import { ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Props {
  leak: RevenueLeak;
  rank: number;
}

const colorMap: Record<string, { bar: string; glow: string; border: string }> = {
  red: { bar: 'bg-red-500', glow: 'glow-red', border: 'border-red-500/20' },
  amber: { bar: 'bg-amber-500', glow: '', border: 'border-amber-500/20' },
  orange: { bar: 'bg-orange-500', glow: '', border: 'border-orange-500/20' },
  purple: { bar: 'bg-purple-500', glow: '', border: 'border-purple-500/20' },
  pink: { bar: 'bg-pink-500', glow: '', border: 'border-pink-500/20' },
};

export default function LeakCard({ leak, rank }: Props) {
  const nav = useNavigate();
  const colors = colorMap[leak.color] || colorMap.red;

  return (
    <div
      className={`bg-card border ${colors.border} rounded-xl p-5 hover:bg-card/80 transition-all cursor-pointer group animate-slide-up`}
      style={{ animationDelay: `${rank * 80}ms` }}
      onClick={() => nav('/investigation', { state: { leakId: leak.id } })}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{leak.icon}</span>
          <div>
            <h3 className="font-semibold text-foreground text-sm">{leak.title}</h3>
            <p className="text-xs text-muted-foreground mt-0.5">{leak.mainCause}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <PriorityBadge priority={leak.priority} score={leak.priorityScore} />
          <ChevronRight size={14} className="text-muted-foreground group-hover:text-white transition-colors" />
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        <div>
          <div className="text-xs text-muted-foreground mb-0.5">Affected</div>
          <div className="text-sm font-bold text-foreground font-mono-data">{formatCurrencyFull(leak.totalAmount)}</div>
        </div>
        <div>
          <div className="text-xs text-muted-foreground mb-0.5">Recoverable</div>
          <div className="text-sm font-bold text-emerald-400 font-mono-data">{formatCurrency(leak.recoverableAmount)}</div>
        </div>
        <div>
          <div className="text-xs text-muted-foreground mb-0.5">Transactions</div>
          <div className="text-sm font-bold text-foreground">{leak.affectedTransactions}</div>
        </div>
        <div>
          <div className="text-xs text-muted-foreground mb-0.5">Customers</div>
          <div className="text-sm font-bold text-foreground">{leak.affectedCustomers}</div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="space-y-1.5">
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>{leak.percentageOfLeakage}% of total leakage</span>
          <span>{Math.round((leak.recoverableAmount / leak.totalAmount) * 100)}% recoverable</span>
        </div>
        <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
          <div className={`h-full ${colors.bar} rounded-full`} style={{ width: `${leak.percentageOfLeakage}%` }} />
        </div>
      </div>
    </div>
  );
}
