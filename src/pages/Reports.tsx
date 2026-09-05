import { useOutletContext } from 'react-router-dom';
import { LayoutContext } from '@/components/layout/MainLayout';
import { useState } from 'react';
import { formatCurrencyFull } from '@/lib/utils';
import PriorityBadge from '@/components/features/PriorityBadge';
import { FileBarChart2, Download, Sparkles, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ReportData {
  generatedAt: string;
  healthScore: number;
  summary: string;
}

export default function Reports() {
  const { store } = useOutletContext<LayoutContext>();
  const { metrics, leaks, transactions, recoveryActions } = store;
  const [report, setReport] = useState<ReportData | null>(null);
  const [generating, setGenerating] = useState(false);

  const executedActions = recoveryActions.filter(a => a.status === 'executed');
  const totalRecovered = executedActions.reduce((s, a) => s + (a.result?.recovered || 0), 0);

  function generateReport() {
    setGenerating(true);
    setTimeout(() => {
      const healthScore = Math.round(
        (metrics.actualRevenue / metrics.totalPotentialRevenue) * 60 +
        (totalRecovered / Math.max(metrics.recoverableRevenue, 1)) * 40
      );
      setReport({
        generatedAt: new Date().toLocaleString(),
        healthScore,
        summary: healthScore >= 70
          ? 'Revenue health is moderate. Key recovery actions have been taken.'
          : 'Revenue health needs attention. Multiple high-priority leaks identified.',
      });
      setGenerating(false);
    }, 1500);
  }

  function printReport() {
    window.print();
  }

  return (
    <div className="p-4 md:p-6 space-y-6 animate-fade-in">
      {/* Generate button */}
      {!report ? (
        <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
          <div className="w-16 h-16 rounded-2xl gradient-cyan flex items-center justify-center animate-pulse-glow">
            <FileBarChart2 size={28} className="text-black" />
          </div>
          <h2 className="text-xl font-bold text-foreground">Generate AI Revenue Report</h2>
          <p className="text-sm text-muted-foreground text-center max-w-md">
            Get a comprehensive AI-powered analysis of your revenue health, leaks, root causes, and recovery recommendations.
          </p>
          <Button
            size="lg"
            className="gradient-cyan text-black font-semibold flex items-center gap-2"
            onClick={generateReport}
            disabled={generating}
          >
            <Sparkles size={16} />
            {generating ? 'Generating Report...' : 'Generate AI Report'}
          </Button>
          {generating && (
            <div className="flex items-center gap-2 text-sm text-cyan-400 animate-fade-in">
              <span className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" />
              AI is analyzing {transactions.length} transactions...
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-6 animate-slide-up" id="report">
          {/* Report header */}
          <div className="bg-gradient-to-r from-slate-900 to-slate-800 border border-cyan-500/20 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl gradient-cyan flex items-center justify-center">
                  <FileBarChart2 size={18} className="text-black" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">LeakLens AI Revenue Report</h2>
                  <p className="text-xs text-muted-foreground">Generated: {report.generatedAt}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="text-xs border-border" onClick={generateReport}>
                  <Sparkles size={12} className="mr-1" /> Regenerate
                </Button>
                <Button size="sm" className="gradient-cyan text-black text-xs font-semibold" onClick={printReport}>
                  <Download size={12} className="mr-1" /> Export
                </Button>
              </div>
            </div>

            {/* Health score */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-black/30 rounded-xl p-4 text-center">
                <div className="text-3xl font-bold font-mono-data" style={{ color: report.healthScore >= 70 ? '#10b981' : report.healthScore >= 50 ? '#f59e0b' : '#ef4444' }}>
                  {report.healthScore}/100
                </div>
                <div className="text-xs text-muted-foreground mt-1">Revenue Health Score</div>
                <div className="text-xs mt-1" style={{ color: report.healthScore >= 70 ? '#10b981' : '#f59e0b' }}>{report.summary}</div>
              </div>
              <div className="bg-black/30 rounded-xl p-4 text-center">
                <div className="text-2xl font-bold text-emerald-400 font-mono-data">{formatCurrencyFull(metrics.actualRevenue)}</div>
                <div className="text-xs text-muted-foreground mt-1">Actual Revenue</div>
                <div className="text-xs text-muted-foreground">vs {formatCurrencyFull(metrics.totalPotentialRevenue)} potential</div>
              </div>
              <div className="bg-black/30 rounded-xl p-4 text-center">
                <div className="text-2xl font-bold text-red-400 font-mono-data">{formatCurrencyFull(metrics.estimatedLeakage)}</div>
                <div className="text-xs text-muted-foreground mt-1">Revenue Leakage</div>
                <div className="text-xs text-emerald-400">{formatCurrencyFull(metrics.recoverableRevenue)} recoverable</div>
              </div>
            </div>
          </div>

          {/* Executive summary */}
          <div className="bg-card border border-border rounded-xl p-6">
            <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <Sparkles size={14} className="text-cyan-400" /> Executive Summary
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Analysis of <strong className="text-foreground">{transactions.length} transactions</strong> identified{' '}
              <strong className="text-red-400">{formatCurrencyFull(metrics.estimatedLeakage)}</strong> in revenue leakage across{' '}
              <strong className="text-foreground">{leaks.length} categories</strong>. The primary driver is{' '}
              <strong className="text-foreground">{leaks[0]?.title}</strong> at{' '}
              <strong className="text-red-400">{formatCurrencyFull(leaks[0]?.totalAmount || 0)}</strong> ({leaks[0]?.percentageOfLeakage}% of leakage).{' '}
              With targeted recovery actions, an estimated{' '}
              <strong className="text-emerald-400">{formatCurrencyFull(metrics.recoverableRevenue)}</strong> is recoverable,
              representing a <strong className="text-cyan-400">{Math.round((metrics.recoverableRevenue / metrics.estimatedLeakage) * 100)}%</strong> recovery rate potential.
              {totalRecovered > 0 && ` Demo recovery actions have already recovered ${formatCurrencyFull(totalRecovered)}.`}
            </p>
          </div>

          {/* Revenue overview table */}
          <div className="bg-card border border-border rounded-xl p-6">
            <h3 className="text-sm font-semibold mb-4">Revenue Overview</h3>
            <div className="space-y-3">
              {[
                { label: 'Total Potential Revenue', value: formatCurrencyFull(metrics.totalPotentialRevenue), color: 'text-cyan-400' },
                { label: 'Actual Revenue Collected', value: formatCurrencyFull(metrics.actualRevenue), color: 'text-emerald-400' },
                { label: 'Estimated Revenue Leakage', value: formatCurrencyFull(metrics.estimatedLeakage), color: 'text-red-400' },
                { label: 'Estimated Recoverable Revenue', value: formatCurrencyFull(metrics.recoverableRevenue), color: 'text-amber-400' },
                { label: 'Revenue Recovered (Demo)', value: formatCurrencyFull(totalRecovered), color: 'text-emerald-400' },
              ].map(row => (
                <div key={row.label} className="flex items-center justify-between py-2 border-b border-border/50">
                  <span className="text-sm text-muted-foreground">{row.label}</span>
                  <span className={`text-sm font-bold font-mono-data ${row.color}`}>{row.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Top leaks */}
          <div className="bg-card border border-border rounded-xl p-6">
            <h3 className="text-sm font-semibold mb-4">Top Revenue Leaks — Root Cause Analysis</h3>
            <div className="space-y-4">
              {leaks.map((leak, i) => (
                <div key={leak.id} className="border border-border/50 rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-3 flex-wrap">
                    <span className="text-lg">{leak.icon}</span>
                    <span className="text-sm font-semibold">#{i + 1} {leak.title}</span>
                    <PriorityBadge priority={leak.priority} score={leak.priorityScore} />
                  </div>
                  <div className="grid grid-cols-3 gap-3 text-xs mb-3">
                    <div><span className="text-muted-foreground">Affected: </span><span className="text-red-400 font-semibold">{formatCurrencyFull(leak.totalAmount)}</span></div>
                    <div><span className="text-muted-foreground">Recoverable: </span><span className="text-emerald-400 font-semibold">{formatCurrencyFull(leak.recoverableAmount)}</span></div>
                    <div><span className="text-muted-foreground">% of Leakage: </span><span className="text-foreground font-semibold">{leak.percentageOfLeakage}%</span></div>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">{leak.aiExplanation}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Recovery actions */}
          <div className="bg-card border border-border rounded-xl p-6">
            <h3 className="text-sm font-semibold mb-4">Recommended Recovery Actions — Priority Order</h3>
            <div className="space-y-3">
              {recoveryActions.map((action, i) => {
                const leak = leaks.find(l => l.id === action.leakType);
                return (
                  <div key={action.id} className="flex items-start gap-4 py-3 border-b border-border/50">
                    <div className="w-6 h-6 rounded-full bg-secondary flex items-center justify-center text-xs font-bold text-muted-foreground flex-shrink-0">{i + 1}</div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="text-sm font-medium">{action.title}</span>
                        {action.status === 'executed' && <CheckCircle2 size={13} className="text-emerald-400" />}
                        {leak && <PriorityBadge priority={leak.priority} size="sm" />}
                      </div>
                      <div className="text-xs text-muted-foreground">{action.description}</div>
                      <div className="text-xs text-emerald-400 mt-1">Expected Recovery: {formatCurrencyFull(action.estimatedRecovery)}</div>
                    </div>
                    <div className="text-xs font-semibold text-foreground flex-shrink-0">
                      {action.status === 'executed' ? <span className="text-emerald-400">Executed</span> :
                       action.status === 'rejected' ? <span className="text-muted-foreground">Rejected</span> :
                       <span className="text-amber-400">Pending</span>}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
