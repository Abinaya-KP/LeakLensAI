import { useOutletContext } from 'react-router-dom';
import { LayoutContext } from '@/components/layout/MainLayout';
import MetricCard from '@/components/features/MetricCard';
import LeakCard from '@/components/features/LeakCard';
import { formatCurrency, formatCurrencyFull } from '@/lib/utils';
import {
  TrendingUp, TrendingDown, DollarSign, Target, CheckCircle, XCircle, ShoppingCart, Activity, Bot
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, BarChart, Bar, Legend
} from 'recharts';

const CHART_COLORS = ['#06b6d4', '#ef4444', '#f59e0b', '#8b5cf6', '#ec4899'];

function buildTimeData(transactions: { transactionDate: string; amount: number; paymentStatus: string }[]) {
  const map: Record<string, { date: string; revenue: number; leakage: number }> = {};
  transactions.forEach(t => {
    const d = t.transactionDate?.slice(0, 10) || '';
    if (!d) return;
    if (!map[d]) map[d] = { date: d, revenue: 0, leakage: 0 };
    if (t.paymentStatus === 'Success') map[d].revenue += t.amount;
    else map[d].leakage += t.amount;
  });
  return Object.values(map).sort((a, b) => a.date.localeCompare(b.date)).slice(-14);
}

export default function Dashboard() {
  const { store } = useOutletContext<LayoutContext>();
  const { metrics, leaks, transactions, recoveryActions } = store;

  const timeData = buildTimeData(transactions);
  const pieData = leaks.slice(0, 5).map((l, i) => ({ name: l.title.replace(' ', '\n'), value: l.totalAmount, color: CHART_COLORS[i] }));
  const pmData = (() => {
    const map: Record<string, { method: string; success: number; failed: number }> = {};
    transactions.forEach(t => {
      if (!map[t.paymentMethod]) map[t.paymentMethod] = { method: t.paymentMethod, success: 0, failed: 0 };
      if (t.paymentStatus === 'Success') map[t.paymentMethod].success += t.amount;
      else map[t.paymentMethod].failed += t.amount;
    });
    return Object.values(map);
  })();

  const executedActions = recoveryActions.filter(a => a.status === 'executed');
  const totalRecovered = executedActions.reduce((s, a) => s + (a.result?.recovered || 0), 0);

  return (
    <div className="p-4 md:p-6 space-y-6 animate-fade-in">
      {/* Hero banner */}
      <div className="relative rounded-2xl overflow-hidden bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border border-cyan-500/20 p-6 md:p-8">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, #06b6d4 0%, transparent 60%), radial-gradient(circle at 80% 50%, #8b5cf6 0%, transparent 60%)' }} />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Bot size={18} className="text-cyan-400" />
              <span className="text-xs font-medium text-cyan-400 uppercase tracking-wider">AI Revenue Agent Active</span>
            </div>
            <h2 className="text-xl md:text-2xl font-bold text-white leading-tight">
              Your AI agent for finding and<br className="hidden md:block" /> recovering lost revenue.
            </h2>
            <p className="text-sm text-muted-foreground mt-2">
              Detected <span className="text-red-400 font-semibold">{formatCurrencyFull(metrics.estimatedLeakage)}</span> in revenue leakage across{' '}
              <span className="text-white font-semibold">{leaks.length}</span> categories
            </p>
          </div>
          <div className="bg-black/30 border border-emerald-500/30 rounded-xl px-6 py-4 text-center min-w-[160px]">
            <div className="text-xs text-muted-foreground mb-1">Potential Revenue Recovered</div>
            <div className="text-2xl font-bold text-emerald-400 font-mono-data">{formatCurrency(totalRecovered || metrics.recoverableRevenue)}</div>
            <div className="text-xs text-muted-foreground mt-1">{totalRecovered > 0 ? 'via demo recovery' : 'recoverable estimate'}</div>
          </div>
        </div>
      </div>

      {/* Metrics grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        <MetricCard label="Total Potential Revenue" value={formatCurrency(metrics.totalPotentialRevenue)} icon={DollarSign} iconColor="text-cyan-400" highlight />
        <MetricCard label="Actual Revenue" value={formatCurrency(metrics.actualRevenue)} icon={TrendingUp} iconColor="text-emerald-400" subValue={`${metrics.successfulPayments} transactions`} />
        <MetricCard label="Revenue Leakage" value={formatCurrency(metrics.estimatedLeakage)} icon={TrendingDown} iconColor="text-red-400" subValue={`${Math.round((metrics.estimatedLeakage / metrics.totalPotentialRevenue) * 100)}% of potential`} />
        <MetricCard label="Recoverable Revenue" value={formatCurrency(metrics.recoverableRevenue)} icon={Target} iconColor="text-amber-400" subValue="AI estimated" />
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
        <MetricCard label="Successful Payments" value={String(metrics.successfulPayments)} icon={CheckCircle} iconColor="text-emerald-400" />
        <MetricCard label="Failed Payments" value={String(metrics.failedPayments)} icon={XCircle} iconColor="text-red-400" />
        <MetricCard label="Abandoned Checkouts" value={String(metrics.abandonedCheckouts)} icon={ShoppingCart} iconColor="text-amber-400" />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        {/* Revenue vs Leakage over time */}
        <div className="bg-card border border-border rounded-xl p-5">
          <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
            <Activity size={14} className="text-cyan-400" /> Revenue vs Leakage Over Time
          </h3>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={timeData}>
              <defs>
                <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="leak" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(222 30% 18%)" />
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#64748b' }} tickFormatter={v => v.slice(5)} />
              <YAxis tick={{ fontSize: 10, fill: '#64748b' }} tickFormatter={v => `₹${(v/1000).toFixed(0)}K`} />
              <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: 8, fontSize: 12 }} formatter={(v: number) => [`₹${v.toLocaleString('en-IN')}`, '']} />
              <Area type="monotone" dataKey="revenue" stroke="#10b981" fill="url(#rev)" strokeWidth={2} name="Revenue" />
              <Area type="monotone" dataKey="leakage" stroke="#ef4444" fill="url(#leak)" strokeWidth={2} name="Leakage" />
              <Legend wrapperStyle={{ fontSize: 11 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Leakage by category */}
        <div className="bg-card border border-border rounded-xl p-5">
          <h3 className="text-sm font-semibold text-foreground mb-4">Leakage by Category</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`} labelLine={false} fontSize={10}>
                {pieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
              </Pie>
              <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: 8, fontSize: 12 }} formatter={(v: number) => [`₹${v.toLocaleString('en-IN')}`, '']} />
              <Legend formatter={(v) => v} wrapperStyle={{ fontSize: 10 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Payment method performance */}
        <div className="bg-card border border-border rounded-xl p-5 lg:col-span-2">
          <h3 className="text-sm font-semibold text-foreground mb-4">Leakage by Payment Method</h3>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={pmData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(222 30% 18%)" />
              <XAxis dataKey="method" tick={{ fontSize: 10, fill: '#64748b' }} />
              <YAxis tick={{ fontSize: 10, fill: '#64748b' }} tickFormatter={v => `₹${(v/1000).toFixed(0)}K`} />
              <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: 8, fontSize: 12 }} formatter={(v: number) => [`₹${v.toLocaleString('en-IN')}`, '']} />
              <Bar dataKey="success" name="Revenue" fill="#10b981" radius={[3, 3, 0, 0]} />
              <Bar dataKey="failed" name="Leakage" fill="#ef4444" radius={[3, 3, 0, 0]} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top Leaks */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-foreground">Top Revenue Leaks Detected</h3>
          <span className="text-xs text-muted-foreground">{leaks.length} issues found</span>
        </div>
        <div className="space-y-3">
          {leaks.slice(0, 3).map((leak, i) => <LeakCard key={leak.id} leak={leak} rank={i} />)}
        </div>
      </div>
    </div>
  );
}
