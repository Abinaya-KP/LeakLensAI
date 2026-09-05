import { useOutletContext } from 'react-router-dom';
import { LayoutContext } from '@/components/layout/MainLayout';
import { useState, useMemo } from 'react';
import { getStatusColor, formatDate } from '@/lib/utils';
import { Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

const PAGE_SIZE = 20;

export default function Transactions() {
  const { store } = useOutletContext<LayoutContext>();
  const { transactions } = store;
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('All');
  const [page, setPage] = useState(1);

  const filters = ['All', 'Success', 'Failed', 'Abandoned', 'Overdue', 'Refunded'];

  const filtered = useMemo(() => {
    return transactions.filter(t => {
      const matchSearch = !search || [t.customerName, t.transactionId, t.customerId, t.paymentMethod, t.customerLocation]
        .some(v => v.toLowerCase().includes(search.toLowerCase()));
      const matchFilter = filter === 'All' ||
        (filter === 'Success' && t.paymentStatus === 'Success') ||
        (filter === 'Failed' && t.paymentStatus === 'Failed') ||
        (filter === 'Abandoned' && t.checkoutStatus === 'Abandoned') ||
        (filter === 'Overdue' && t.invoiceStatus === 'Overdue') ||
        (filter === 'Refunded' && (t.refundStatus === 'Refunded' || t.refundStatus === 'Partial Refund'));
      return matchSearch && matchFilter;
    });
  }, [transactions, search, filter]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  function getRowStatus(t: typeof transactions[0]) {
    if (t.checkoutStatus === 'Abandoned') return { label: 'Abandoned', color: getStatusColor('Abandoned') };
    if (t.invoiceStatus === 'Overdue') return { label: 'Overdue', color: getStatusColor('Overdue') };
    if (t.refundStatus === 'Refunded') return { label: 'Refunded', color: getStatusColor('Refunded') };
    if (t.refundStatus === 'Partial Refund') return { label: 'Partial Refund', color: getStatusColor('Partial Refund') };
    return { label: t.paymentStatus, color: getStatusColor(t.paymentStatus) };
  }

  return (
    <div className="p-4 md:p-6 space-y-4 animate-fade-in">
      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by customer, ID, method, location..."
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            className="w-full pl-9 pr-4 py-2 text-sm bg-card border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-cyan-500/50"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {filters.map(f => (
            <button
              key={f}
              onClick={() => { setFilter(f); setPage(1); }}
              className={cn(
                'px-3 py-2 text-xs rounded-lg border font-medium transition-all',
                filter === f ? 'bg-cyan-500/20 border-cyan-500/40 text-cyan-400' : 'bg-card border-border text-muted-foreground hover:text-foreground'
              )}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border bg-secondary/30">
                {['Tx ID', 'Customer', 'Date', 'Amount', 'Method', 'Status', 'Device', 'Location', 'Failure Reason'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-muted-foreground font-medium whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paged.map((t, i) => {
                const status = getRowStatus(t);
                return (
                  <tr key={t.transactionId} className={cn('border-b border-border/50 hover:bg-secondary/20 transition-colors', i % 2 === 0 ? '' : 'bg-secondary/10')}>
                    <td className="px-4 py-3 font-mono-data text-cyan-400/80 whitespace-nowrap">{t.transactionId}</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="text-foreground font-medium">{t.customerName}</div>
                      <div className="text-muted-foreground">{t.customerId}</div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">{formatDate(t.transactionDate)}</td>
                    <td className="px-4 py-3 font-mono-data font-semibold whitespace-nowrap">₹{t.amount.toLocaleString('en-IN')}</td>
                    <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">{t.paymentMethod}</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className={cn('px-2 py-0.5 rounded-full text-xs font-medium', status.color)}>{status.label}</span>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">{t.deviceType}</td>
                    <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">{t.customerLocation}</td>
                    <td className="px-4 py-3 text-muted-foreground whitespace-nowrap max-w-[150px] truncate">{t.failureReason || '—'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-border">
          <span className="text-xs text-muted-foreground">
            Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length} transactions
          </span>
          <div className="flex items-center gap-2">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
              className="p-1.5 rounded-lg border border-border text-muted-foreground hover:text-white disabled:opacity-30 disabled:cursor-not-allowed">
              <ChevronLeft size={14} />
            </button>
            <span className="text-xs text-muted-foreground">{page} / {totalPages}</span>
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
              className="p-1.5 rounded-lg border border-border text-muted-foreground hover:text-white disabled:opacity-30 disabled:cursor-not-allowed">
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
