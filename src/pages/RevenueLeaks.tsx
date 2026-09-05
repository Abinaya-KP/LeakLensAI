import { useOutletContext } from 'react-router-dom';
import { LayoutContext } from '@/components/layout/MainLayout';
import LeakCard from '@/components/features/LeakCard';
import { formatCurrencyFull } from '@/lib/utils';
import { AlertTriangle, TrendingDown } from 'lucide-react';
import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer, Tooltip } from 'recharts';

export default function RevenueLeaks() {
  const { store } = useOutletContext<LayoutContext>();
  const { leaks, metrics } = store;

  const radarData = leaks.map(l => ({
    leak: l.title.split(' ')[0],
    score: l.priorityScore,
    fullMark: 100,
  }));

  const criticalCount = leaks.filter(l => l.priority === 'CRITICAL').length;
  const highCount = leaks.filter(l => l.priority === 'HIGH').length;

  return (
    <div className="p-4 md:p-6 space-y-6 animate-fade-in">
      {/* Summary bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-card border border-red-500/20 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-red-400 font-mono-data">{criticalCount}</div>
          <div className="text-xs text-muted-foreground">Critical Issues</div>
        </div>
        <div className="bg-card border border-orange-500/20 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-orange-400 font-mono-data">{highCount}</div>
          <div className="text-xs text-muted-foreground">High Priority</div>
        </div>
        <div className="bg-card border border-border rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-foreground font-mono-data">{formatCurrencyFull(metrics.estimatedLeakage)}</div>
          <div className="text-xs text-muted-foreground">Total Leakage</div>
        </div>
        <div className="bg-card border border-emerald-500/20 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-emerald-400 font-mono-data">{formatCurrencyFull(metrics.recoverableRevenue)}</div>
          <div className="text-xs text-muted-foreground">Recoverable</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Leaks list */}
        <div className="lg:col-span-2 space-y-3">
          <div className="flex items-center gap-2 mb-2">
            <TrendingDown size={16} className="text-red-400" />
            <h2 className="text-sm font-semibold">All Revenue Leaks — Prioritized by AI</h2>
          </div>
          {leaks.map((leak, i) => <LeakCard key={leak.id} leak={leak} rank={i} />)}
        </div>

        {/* Radar + breakdown */}
        <div className="space-y-4">
          <div className="bg-card border border-border rounded-xl p-5">
            <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
              <AlertTriangle size={14} className="text-amber-400" /> Priority Score Radar
            </h3>
            <ResponsiveContainer width="100%" height={220}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="hsl(222 30% 20%)" />
                <PolarAngleAxis dataKey="leak" tick={{ fontSize: 10, fill: '#64748b' }} />
                <Radar name="Score" dataKey="score" stroke="#06b6d4" fill="#06b6d4" fillOpacity={0.2} strokeWidth={2} />
                <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: 8, fontSize: 12 }} />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          {/* Category breakdown */}
          <div className="bg-card border border-border rounded-xl p-5">
            <h3 className="text-sm font-semibold mb-4">Leakage Breakdown</h3>
            <div className="space-y-3">
              {leaks.map(l => (
                <div key={l.id}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-muted-foreground">{l.icon} {l.title}</span>
                    <span className="text-foreground font-medium">{l.percentageOfLeakage}%</span>
                  </div>
                  <div className="h-1.5 bg-secondary rounded-full">
                    <div className="h-full bg-red-500 rounded-full" style={{ width: `${l.percentageOfLeakage}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
