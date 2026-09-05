import { RecoveryAction, RevenueLeak } from '@/types';
import { formatCurrencyFull } from '@/lib/utils';
import PriorityBadge from './PriorityBadge';
import { CheckCircle2, XCircle, Eye, Zap, Clock, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface Props {
  action: RecoveryAction;
  leak: RevenueLeak | undefined;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
}

export default function AgentCard({ action, leak, onApprove, onReject }: Props) {
  const isExecuted = action.status === 'executed';
  const isRejected = action.status === 'rejected';

  return (
    <div className={cn(
      'bg-card border rounded-xl p-5 transition-all duration-300',
      isExecuted ? 'border-emerald-500/30' : isRejected ? 'border-border/30 opacity-60' : 'border-cyan-500/20 animate-pulse-glow'
    )}>
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-lg">{leak?.icon || '🔧'}</span>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-semibold text-sm text-foreground">{action.title}</h3>
              <span className="text-xs px-2 py-0.5 bg-secondary rounded-md text-muted-foreground border border-border">
                {action.actionType}
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">{action.id}</p>
          </div>
        </div>
        {leak && <PriorityBadge priority={leak.priority} />}
      </div>

      {/* Status banner */}
      {!isExecuted && !isRejected && (
        <div className="flex items-center gap-2 px-3 py-2 bg-red-500/10 border border-red-500/20 rounded-lg mb-4">
          <span className="w-2 h-2 bg-red-400 rounded-full animate-pulse" />
          <span className="text-xs font-medium text-red-400">{leak?.priority || 'HIGH'} PRIORITY — Revenue at risk: {formatCurrencyFull(action.targetedAmount)}</span>
        </div>
      )}

      {/* Investigation */}
      <div className="bg-secondary/30 rounded-lg p-4 mb-4 space-y-1.5">
        <div className="text-xs font-semibold text-cyan-400 mb-2">🔍 AI Investigation</div>
        <p className="text-xs text-muted-foreground leading-relaxed">{leak?.aiExplanation || action.description}</p>
      </div>

      {/* Recommended Action */}
      <div className="bg-secondary/20 rounded-lg p-4 mb-4">
        <div className="text-xs font-semibold text-foreground mb-2">📋 Recommended Action</div>
        <p className="text-xs text-muted-foreground leading-relaxed">{action.description}</p>
        <div className="mt-3 flex items-center gap-4 text-xs">
          <span className="text-muted-foreground">Targeted: <span className="text-foreground font-semibold">{formatCurrencyFull(action.targetedAmount)}</span></span>
          <span className="text-muted-foreground">Est. Recovery: <span className="text-emerald-400 font-semibold">{formatCurrencyFull(action.estimatedRecovery)}</span></span>
          <span className="text-muted-foreground">Customers: <span className="text-foreground font-semibold">{action.affectedCustomers}</span></span>
        </div>
      </div>

      {/* Result */}
      {isExecuted && action.result && (
        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-4 mb-4">
          <div className="flex items-center gap-2 mb-3">
            <CheckCircle2 size={14} className="text-emerald-400" />
            <span className="text-xs font-semibold text-emerald-400">Recovery Action Executed — DEMO Mode</span>
          </div>
          <div className="grid grid-cols-3 gap-3 text-xs">
            <div><div className="text-muted-foreground">Targeted</div><div className="font-bold text-foreground font-mono-data">{formatCurrencyFull(action.result.targeted)}</div></div>
            <div><div className="text-muted-foreground">Recovered</div><div className="font-bold text-emerald-400 font-mono-data">{formatCurrencyFull(action.result.recovered)}</div></div>
            <div><div className="text-muted-foreground">Rate</div><div className="font-bold text-cyan-400">{action.result.recoveryRate}%</div></div>
          </div>
        </div>
      )}

      {/* Actions */}
      {!isExecuted && !isRejected && (
        <div className="flex items-center gap-2 flex-wrap">
          <Button
            size="sm"
            className="flex items-center gap-1.5 gradient-cyan text-black font-semibold text-xs"
            onClick={() => onApprove(action.id)}
          >
            <Check size={12} /> Approve Recovery Action
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-1.5 text-xs border-border text-muted-foreground hover:text-white"
            onClick={() => onReject(action.id)}
          >
            <XCircle size={12} /> Reject
          </Button>
        </div>
      )}

      {isExecuted && (
        <div className="flex items-center gap-2 text-xs text-emerald-400">
          <CheckCircle2 size={14} />
          <span>Executed in DEMO mode • {action.executedAt ? new Date(action.executedAt).toLocaleString() : ''}</span>
        </div>
      )}

      {isRejected && (
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <XCircle size={14} />
          <span>Recovery action rejected</span>
        </div>
      )}
    </div>
  );
}
