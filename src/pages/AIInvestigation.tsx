import { useOutletContext, useLocation } from 'react-router-dom';
import { LayoutContext } from '@/components/layout/MainLayout';
import { useState } from 'react';
import PriorityBadge from '@/components/features/PriorityBadge';
import { formatCurrencyFull } from '@/lib/utils';
import { RevenueLeak } from '@/types';
import { Search, Lightbulb, TrendingDown, Users, DollarSign } from 'lucide-react';
import { cn } from '@/lib/utils';

function InvestigationPanel({ leak }: { leak: RevenueLeak }) {
  const steps = [
    { step: 1, label: 'Observe', desc: `Scanning ${leak.affectedTransactions} transactions in "${leak.title}" category`, done: true },
    { step: 2, label: 'Detect', desc: `Identified ₹${leak.totalAmount.toLocaleString('en-IN')} revenue at risk across ${leak.affectedCustomers} customers`, done: true },
    { step: 3, label: 'Investigate', desc: `Root cause: ${leak.mainCause}`, done: true },
    { step: 4, label: 'Estimate', desc: `Recovery potential: ₹${leak.recoverableAmount.toLocaleString('en-IN')} (${Math.round((leak.recoverableAmount / leak.totalAmount) * 100)}% recoverability score)`, done: true },
    { step: 5, label: 'Recommend', desc: 'Recovery action queued in Recovery Center', done: true },
  ];

  return (
    <div className="space-y-6 animate-slide-up">
      {/* Header */}
      <div className="bg-card border border-border rounded-xl p-6">
        <div className="flex items-start gap-4 mb-4">
          <span className="text-3xl">{leak.icon}</span>
          <div className="flex-1">
            <div className="flex items-center gap-3 flex-wrap mb-1">
              <h2 className="text-lg font-bold text-foreground">{leak.title}</h2>
              <PriorityBadge priority={leak.priority} score={leak.priorityScore} />
            </div>
            <p className="text-sm text-muted-foreground">{leak.description}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { icon: DollarSign, label: 'Total Affected', value: formatCurrencyFull(leak.totalAmount), color: 'text-red-400' },
            { icon: TrendingDown, label: 'Recoverable', value: formatCurrencyFull(leak.recoverableAmount), color: 'text-emerald-400' },
            { icon: TrendingDown, label: 'Transactions', value: String(leak.affectedTransactions), color: 'text-cyan-400' },
            { icon: Users, label: 'Customers', value: String(leak.affectedCustomers), color: 'text-purple-400' },
          ].map(({ icon: Icon, label, value, color }) => (
            <div key={label} className="bg-secondary/30 rounded-lg p-3">
              <Icon size={14} className={cn('mb-1', color)} />
              <div className={cn('text-lg font-bold font-mono-data', color)}>{value}</div>
              <div className="text-xs text-muted-foreground">{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Agent workflow steps */}
      <div className="bg-card border border-border rounded-xl p-6">
        <div className="flex items-center gap-2 mb-5">
          <Search size={15} className="text-cyan-400" />
          <h3 className="text-sm font-semibold">AI Agent Investigation Workflow</h3>
        </div>
        <div className="space-y-4">
          {steps.map((s, i) => (
            <div key={s.step} className={cn('agent-step flex items-start gap-4', i < steps.length - 1 ? 'pb-4' : '')}>
              <div className={cn(
                'w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 border',
                s.done ? 'bg-cyan-500/20 border-cyan-500/40 text-cyan-400' : 'bg-secondary border-border text-muted-foreground'
              )}>
                {s.done ? '✓' : s.step}
              </div>
              <div className="flex-1 pt-1">
                <div className="text-xs font-semibold text-foreground mb-0.5">{s.label}</div>
                <div className="text-xs text-muted-foreground">{s.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* AI Explanation */}
      <div className="bg-card border border-cyan-500/20 rounded-xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <Lightbulb size={15} className="text-cyan-400" />
          <h3 className="text-sm font-semibold text-cyan-400">AI Investigation Report</h3>
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed">{leak.aiExplanation}</p>
      </div>

      {/* Patterns */}
      <div className="bg-card border border-border rounded-xl p-6">
        <h3 className="text-sm font-semibold mb-4">Detected Patterns</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {leak.patterns.map((p, i) => (
            <div key={i} className="bg-secondary/30 border border-border rounded-lg p-4">
              <div className="text-xs text-muted-foreground mb-1">{p.label}</div>
              <div className="text-sm font-bold text-foreground mb-1">{p.value}</div>
              <div className="text-xs text-cyan-400">{p.insight}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function AIInvestigation() {
  const { store } = useOutletContext<LayoutContext>();
  const location = useLocation();
  const { leaks } = store;
  const initialId = location.state?.leakId || leaks[0]?.id;
  const [selectedId, setSelectedId] = useState<string>(initialId);
  const selectedLeak = leaks.find(l => l.id === selectedId) || leaks[0];

  return (
    <div className="p-4 md:p-6 animate-fade-in">
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar selector */}
        <div className="lg:w-64 flex-shrink-0">
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <div className="px-4 py-3 border-b border-border">
              <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Select Leak to Investigate</div>
            </div>
            {leaks.map(l => (
              <button
                key={l.id}
                onClick={() => setSelectedId(l.id)}
                className={cn(
                  'w-full flex items-center gap-3 px-4 py-3 text-left transition-colors border-b border-border/50 last:border-0',
                  selectedId === l.id ? 'bg-cyan-500/10 text-foreground' : 'hover:bg-secondary/50 text-muted-foreground'
                )}
              >
                <span>{l.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-medium truncate">{l.title}</div>
                  <PriorityBadge priority={l.priority} size="sm" />
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Main panel */}
        <div className="flex-1 min-w-0">
          {selectedLeak && <InvestigationPanel leak={selectedLeak} />}
        </div>
      </div>
    </div>
  );
}
