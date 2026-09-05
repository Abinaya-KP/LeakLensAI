import { useOutletContext } from 'react-router-dom';
import { LayoutContext } from '@/components/layout/MainLayout';
import { formatCurrencyFull, formatCurrency } from '@/lib/utils';
import { CheckCircle2, Target, Users, AlertTriangle, TrendingUp } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell
} from 'recharts';

export default function RecoveredRevenue() {
  const { store } = useOutletContext<LayoutContext>();
  const { recoveryActions, leaks, metrics } = store;

  const executed = recoveryActions.filter(a => a.status === 'executed');
  const totalTargeted = executed.reduce((s, a) => s + (a.result?.targeted || 0), 0);
  const totalRecovered = executed.reduce((s, a) => s + (a.result?.recovered || 0), 0);
  const totalCustomers = executed.reduce((s, a) => s + (a.result?.customersRecovered || 0), 0);
  const stillAtRisk = executed.reduce((s, a) => s + (a.result?.stillAtRisk || 0), 0);
  const overallRate = totalTargeted > 0 ? Math.round((totalRecovered / totalTargeted) * 100) : 0;

  const chartData = executed.map(a => ({
    name: leaks.find(l => l.id === a.leakType)?.title.split(' ').slice(0, 2).join(' ') || a.leakType,
    targeted: a.result?.targeted || 0,
    recovered: a.result?.recovered || 0,
    rate: a.result?.recoveryRate || 0,
  }));

  if (executed.length === 0) {
    return (
      <div className="p-4 md:p-6 flex flex-col items-center justify-center min-h-[60vh]">
        <TrendingUp size={48} className="text-muted-foreground/30 mb-4" />
        <h2 className="text-lg font-semibold text-muted-foreground mb-2">No Recovery Actions Executed Yet</h2>
        <p className="text-sm text-muted-foreground text-center max-w-md">
          Go to the Recovery Center, approve AI-recommended recovery actions, and track your results here.
        </p>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 space-y-6 animate-fade-in">
      {/* Hero metrics */}
      <div className="bg-gradient-to-r from-emerald-500/10 to-cyan-500/10 border border-emerald-500/20 rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <CheckCircle2 size={18} className="text-emerald-400" />
          <span className="text-sm font-semibold text-emerald-400">Recovery Performance — DEMO</span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <div className="text-xs text-muted-foreground mb-1">Revenue Targeted</div>
            <div className="text-2xl font-bold text-foreground font-mono-data">{formatCurrency(totalTargeted)}</div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground mb-1">Revenue Recovered</div>
            <div className="text-2xl font-bold text-emerald-400 font-mono-data">{formatCurrency(totalRecovered)}</div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground mb-1">Recovery Rate</div>
            <div className="text-2xl font-bold text-cyan-400">{overallRate}%</div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground mb-1">Customers Recovered</div>
            <div className="text-2xl font-bold text-purple-400">{totalCustomers}</div>
          </div>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-card border border-amber-500/20 rounded-xl p-4 flex items-center gap-3">
          <AlertTriangle size={18} className="text-amber-400" />
          <div>
            <div className="text-sm font-bold text-amber-400 font-mono-data">{formatCurrencyFull(stillAtRisk)}</div>
            <div className="text-xs text-muted-foreground">Still at Risk</div>
          </div>
        </div>
        <div className="bg-card border border-emerald-500/20 rounded-xl p-4 flex items-center gap-3">
          <Target size={18} className="text-cyan-400" />
          <div>
            <div className="text-sm font-bold text-cyan-400">{executed.length} actions</div>
            <div className="text-xs text-muted-foreground">Executed in Demo</div>
          </div>
        </div>
      </div>

      {/* Chart */}
      {chartData.length > 0 && (
        <div className="bg-card border border-border rounded-xl p-5">
          <h3 className="text-sm font-semibold mb-4">Recovery by Category</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={chartData} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(222 30% 18%)" />
              <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#64748b' }} />
              <YAxis tick={{ fontSize: 10, fill: '#64748b' }} tickFormatter={v => `₹${(v/1000).toFixed(0)}K`} />
              <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: 8, fontSize: 12 }} formatter={(v: number) => [`₹${v.toLocaleString('en-IN')}`, '']} />
              <Bar dataKey="targeted" name="Targeted" fill="#334155" radius={[3, 3, 0, 0]} />
              <Bar dataKey="recovered" name="Recovered" fill="#10b981" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Individual results */}
      <div>
        <h3 className="text-sm font-semibold mb-4">Detailed Recovery Results</h3>
        <div className="space-y-3">
          {executed.map(action => {
            const leak = leaks.find(l => l.id === action.leakType);
            if (!action.result) return null;
            return (
              <div key={action.id} className="bg-card border border-emerald-500/20 rounded-xl p-5">
                <div className="flex items-center gap-3 mb-4">
                  <span>{leak?.icon}</span>
                  <div>
                    <div className="text-sm font-semibold">{action.title}</div>
                    <div className="text-xs text-muted-foreground">{action.id} • Demo executed</div>
                  </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-xs">
                  <div className="bg-secondary/30 rounded-lg p-3 text-center">
                    <div className="text-muted-foreground mb-1">Targeted</div>
                    <div className="font-bold text-foreground font-mono-data">{formatCurrencyFull(action.result.targeted)}</div>
                  </div>
                  <div className="bg-emerald-500/10 rounded-lg p-3 text-center border border-emerald-500/20">
                    <div className="text-muted-foreground mb-1">Recovered</div>
                    <div className="font-bold text-emerald-400 font-mono-data">{formatCurrencyFull(action.result.recovered)}</div>
                  </div>
                  <div className="bg-cyan-500/10 rounded-lg p-3 text-center border border-cyan-500/20">
                    <div className="text-muted-foreground mb-1">Rate</div>
                    <div className="font-bold text-cyan-400">{action.result.recoveryRate}%</div>
                  </div>
                  <div className="bg-purple-500/10 rounded-lg p-3 text-center">
                    <div className="text-muted-foreground mb-1">Customers</div>
                    <div className="font-bold text-purple-400">{action.result.customersRecovered}</div>
                  </div>
                  <div className="bg-amber-500/10 rounded-lg p-3 text-center">
                    <div className="text-muted-foreground mb-1">At Risk</div>
                    <div className="font-bold text-amber-400 font-mono-data">{formatCurrencyFull(action.result.stillAtRisk)}</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
