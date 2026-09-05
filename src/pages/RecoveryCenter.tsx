import { useOutletContext } from 'react-router-dom';
import { LayoutContext } from '@/components/layout/MainLayout';
import AgentCard from '@/components/features/AgentCard';
import { formatCurrencyFull } from '@/lib/utils';
import { Zap, CheckCircle2, Clock, XCircle } from 'lucide-react';

export default function RecoveryCenter() {
  const { store } = useOutletContext<LayoutContext>();
  const { recoveryActions, leaks, approveRecoveryAction, rejectRecoveryAction } = store;

  const pending = recoveryActions.filter(a => a.status === 'pending');
  const executed = recoveryActions.filter(a => a.status === 'executed');
  const rejected = recoveryActions.filter(a => a.status === 'rejected');
  const totalTargeted = recoveryActions.reduce((s, a) => s + a.targetedAmount, 0);
  const totalRecovered = executed.reduce((s, a) => s + (a.result?.recovered || 0), 0);

  return (
    <div className="p-4 md:p-6 space-y-6 animate-fade-in">
      {/* Status summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-card border border-amber-500/20 rounded-xl p-4 flex items-center gap-3">
          <Clock size={20} className="text-amber-400 flex-shrink-0" />
          <div>
            <div className="text-xl font-bold text-amber-400">{pending.length}</div>
            <div className="text-xs text-muted-foreground">Awaiting Approval</div>
          </div>
        </div>
        <div className="bg-card border border-emerald-500/20 rounded-xl p-4 flex items-center gap-3">
          <CheckCircle2 size={20} className="text-emerald-400 flex-shrink-0" />
          <div>
            <div className="text-xl font-bold text-emerald-400">{executed.length}</div>
            <div className="text-xs text-muted-foreground">Executed (Demo)</div>
          </div>
        </div>
        <div className="bg-card border border-border rounded-xl p-4 flex items-center gap-3">
          <Zap size={20} className="text-cyan-400 flex-shrink-0" />
          <div>
            <div className="text-xl font-bold text-cyan-400 font-mono-data">{formatCurrencyFull(totalTargeted)}</div>
            <div className="text-xs text-muted-foreground">Total Targeted</div>
          </div>
        </div>
        <div className="bg-card border border-emerald-500/20 rounded-xl p-4 flex items-center gap-3">
          <CheckCircle2 size={20} className="text-emerald-400 flex-shrink-0" />
          <div>
            <div className="text-xl font-bold text-emerald-400 font-mono-data">{formatCurrencyFull(totalRecovered)}</div>
            <div className="text-xs text-muted-foreground">Demo Recovered</div>
          </div>
        </div>
      </div>

      {/* Demo notice */}
      <div className="flex items-center gap-3 px-4 py-3 bg-amber-500/10 border border-amber-500/20 rounded-xl">
        <span className="text-amber-400 text-lg">⚠️</span>
        <div className="text-xs text-amber-400">
          <span className="font-semibold">DEMO MODE ACTIVE:</span> All recovery actions are simulated. No real payments, messages, or refunds are processed.
        </div>
      </div>

      {/* Pending actions */}
      {pending.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Clock size={15} className="text-amber-400" />
            <h2 className="text-sm font-semibold">Pending Approval ({pending.length})</h2>
          </div>
          <div className="space-y-4">
            {pending.map(action => (
              <AgentCard
                key={action.id}
                action={action}
                leak={leaks.find(l => l.id === action.leakType)}
                onApprove={approveRecoveryAction}
                onReject={rejectRecoveryAction}
              />
            ))}
          </div>
        </div>
      )}

      {/* Executed actions */}
      {executed.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <CheckCircle2 size={15} className="text-emerald-400" />
            <h2 className="text-sm font-semibold">Executed Actions ({executed.length})</h2>
          </div>
          <div className="space-y-4">
            {executed.map(action => (
              <AgentCard
                key={action.id}
                action={action}
                leak={leaks.find(l => l.id === action.leakType)}
                onApprove={approveRecoveryAction}
                onReject={rejectRecoveryAction}
              />
            ))}
          </div>
        </div>
      )}

      {/* Rejected */}
      {rejected.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <XCircle size={15} className="text-muted-foreground" />
            <h2 className="text-sm font-semibold text-muted-foreground">Rejected ({rejected.length})</h2>
          </div>
          <div className="space-y-4">
            {rejected.map(action => (
              <AgentCard
                key={action.id}
                action={action}
                leak={leaks.find(l => l.id === action.leakType)}
                onApprove={approveRecoveryAction}
                onReject={rejectRecoveryAction}
              />
            ))}
          </div>
        </div>
      )}

      {pending.length === 0 && executed.length === 0 && (
        <div className="text-center py-16 text-muted-foreground">
          <Zap size={40} className="mx-auto mb-3 opacity-30" />
          <p className="text-sm">No recovery actions available. Upload transaction data to generate AI recommendations.</p>
        </div>
      )}
    </div>
  );
}
