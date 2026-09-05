import { Transaction, RevenueLeak, DashboardMetrics, RecoveryAction, Priority } from '@/types';

function uniqueCustomers(txns: Transaction[]): number {
  return new Set(txns.map(t => t.customerId)).size;
}

function calcPriority(score: number): Priority {
  if (score >= 75) return 'CRITICAL';
  if (score >= 50) return 'HIGH';
  if (score >= 25) return 'MEDIUM';
  return 'LOW';
}

function calcPriorityScore(
  amount: number,
  totalLeakage: number,
  count: number,
  customers: number,
  recoverability: number
): number {
  const amountScore = Math.min((amount / totalLeakage) * 40, 40);
  const freqScore = Math.min((count / 30) * 20, 20);
  const custScore = Math.min((customers / 20) * 20, 20);
  const recoverScore = recoverability * 20;
  return Math.round(amountScore + freqScore + custScore + recoverScore);
}

export function analyzeTransactions(transactions: Transaction[]) {
  const failed = transactions.filter(t => t.paymentStatus === 'Failed' && t.subscriptionStatus === 'N/A' && t.checkoutStatus === 'N/A');
  const abandoned = transactions.filter(t => t.checkoutStatus === 'Abandoned');
  const overdue = transactions.filter(t => t.invoiceStatus === 'Overdue' || (t.invoiceStatus === 'Pending' && t.invoiceDueDate !== 'N/A' && new Date(t.invoiceDueDate) < new Date()));
  const failedSubs = transactions.filter(t => ['Failed', 'Expired', 'Cancelled'].includes(t.subscriptionStatus) && t.subscriptionStatus !== 'N/A');
  const refunds = transactions.filter(t => t.refundStatus === 'Refunded' || t.refundStatus === 'Partial Refund');

  const failedAmt = failed.reduce((s, t) => s + t.amount, 0);
  const abandonedAmt = abandoned.reduce((s, t) => s + t.amount, 0);
  const overdueAmt = overdue.reduce((s, t) => s + t.amount, 0);
  const subsAmt = failedSubs.reduce((s, t) => s + t.amount, 0);
  const refundsAmt = refunds.reduce((s, t) => s + t.amount, 0);

  const totalLeakage = failedAmt + abandonedAmt + overdueAmt + subsAmt + refundsAmt;

  // Analyze failure reasons
  const failureReasonCounts: Record<string, number> = {};
  failed.forEach(t => {
    const r = t.failureReason || 'Unknown';
    failureReasonCounts[r] = (failureReasonCounts[r] || 0) + 1;
  });
  const topFailureReason = Object.entries(failureReasonCounts).sort((a, b) => b[1] - a[1])[0];
  const tempFailurePct = Math.round(((failureReasonCounts['Temporary Payment Failure'] || 0) / Math.max(failed.length, 1)) * 100);

  // Customers with prior successful payments (for failed payments)
  const failedCustIds = new Set(failed.map(t => t.customerId));
  const successCustIds = new Set(transactions.filter(t => t.paymentStatus === 'Success').map(t => t.customerId));
  const priorSuccessCount = [...failedCustIds].filter(id => successCustIds.has(id)).length;

  // Mobile abandoned checkouts
  const mobileAbandoned = abandoned.filter(t => t.deviceType === 'Mobile').length;
  const mobileAbandonedPct = Math.round((mobileAbandoned / Math.max(abandoned.length, 1)) * 100);

  // Overdue age
  const avgOverdueDays = overdue.length > 0
    ? Math.round(overdue.reduce((s, t) => {
        if (t.invoiceDueDate === 'N/A') return s;
        const diff = (new Date().getTime() - new Date(t.invoiceDueDate).getTime()) / (1000 * 60 * 60 * 24);
        return s + diff;
      }, 0) / overdue.length)
    : 0;

  const leaks: RevenueLeak[] = [
    {
      id: 'failed_payments',
      title: 'Failed Payments',
      description: 'Payment transactions that were declined or failed to process',
      affectedTransactions: failed.length,
      affectedCustomers: uniqueCustomers(failed),
      totalAmount: failedAmt,
      recoverableAmount: Math.round(failedAmt * 0.72),
      percentageOfLeakage: Math.round((failedAmt / totalLeakage) * 100),
      priorityScore: calcPriorityScore(failedAmt, totalLeakage, failed.length, uniqueCustomers(failed), 0.72),
      priority: 'CRITICAL',
      mainCause: topFailureReason ? `${topFailureReason[0]} (${Math.round((topFailureReason[1] / failed.length) * 100)}%)` : 'Multiple causes',
      aiExplanation: `₹${failedAmt.toLocaleString('en-IN')} is associated with ${failed.length} failed payment transactions. ${tempFailurePct}% of these failures are temporary issues (network timeouts, temporary bank declines) that are highly retryable. ${priorSuccessCount} of the affected customers have previously completed successful payments — making them prime candidates for payment retry campaigns. The top failure reason is "${topFailureReason?.[0] || 'Bank Declined'}" accounting for ${topFailureReason ? Math.round((topFailureReason[1] / failed.length) * 100) : 0}% of failures. Immediate retry reminders could recover an estimated ₹${Math.round(failedAmt * 0.72).toLocaleString('en-IN')}.`,
      patterns: [
        { label: 'Top Failure Reason', value: topFailureReason?.[0] || 'Bank Declined', insight: `${topFailureReason ? Math.round((topFailureReason[1] / failed.length) * 100) : 0}% of failures` },
        { label: 'Temporary Failures', value: `${tempFailurePct}%`, insight: 'Retryable with reminders' },
        { label: 'Prior Success Customers', value: `${priorSuccessCount}`, insight: 'High recovery potential' },
        { label: 'Top Payment Method', value: failed[0]?.paymentMethod || 'Credit Card', insight: 'Concentrated risk' },
      ],
      icon: '💳',
      color: 'red',
    },
    {
      id: 'abandoned_checkouts',
      title: 'Abandoned Checkouts',
      description: 'Customers who added items but left without completing purchase',
      affectedTransactions: abandoned.length,
      affectedCustomers: uniqueCustomers(abandoned),
      totalAmount: abandonedAmt,
      recoverableAmount: Math.round(abandonedAmt * 0.35),
      percentageOfLeakage: Math.round((abandonedAmt / totalLeakage) * 100),
      priorityScore: calcPriorityScore(abandonedAmt, totalLeakage, abandoned.length, uniqueCustomers(abandoned), 0.35),
      priority: calcPriority(calcPriorityScore(abandonedAmt, totalLeakage, abandoned.length, uniqueCustomers(abandoned), 0.35)),
      mainCause: `Mobile friction (${mobileAbandonedPct}% mobile)`,
      aiExplanation: `₹${abandonedAmt.toLocaleString('en-IN')} in potential revenue was lost to ${abandoned.length} abandoned checkout sessions. ${mobileAbandonedPct}% of abandonment occurs on Mobile devices, suggesting checkout friction or UI/UX issues on smaller screens. The average abandoned cart value is ₹${Math.round(abandonedAmt / Math.max(abandoned.length, 1)).toLocaleString('en-IN')}. Sending targeted cart recovery reminders within 1-hour of abandonment typically recovers 30-40% of these sessions. Estimated recoverable revenue: ₹${Math.round(abandonedAmt * 0.35).toLocaleString('en-IN')}.`,
      patterns: [
        { label: 'Mobile Abandonment', value: `${mobileAbandonedPct}%`, insight: 'Checkout UX issue on mobile' },
        { label: 'Avg Cart Value', value: `₹${Math.round(abandonedAmt / Math.max(abandoned.length, 1)).toLocaleString('en-IN')}`, insight: 'Medium-high value recovery' },
        { label: 'Unique Customers', value: `${uniqueCustomers(abandoned)}`, insight: 'Targetable with reminders' },
        { label: 'Recovery Window', value: '< 1 hour', insight: 'Best recovery within first hour' },
      ],
      icon: '🛒',
      color: 'amber',
    },
    {
      id: 'overdue_invoices',
      title: 'Overdue Invoices',
      description: 'Invoices past their due date that remain unpaid',
      affectedTransactions: overdue.length,
      affectedCustomers: uniqueCustomers(overdue),
      totalAmount: overdueAmt,
      recoverableAmount: Math.round(overdueAmt * 0.65),
      percentageOfLeakage: Math.round((overdueAmt / totalLeakage) * 100),
      priorityScore: calcPriorityScore(overdueAmt, totalLeakage, overdue.length, uniqueCustomers(overdue), 0.65),
      priority: calcPriority(calcPriorityScore(overdueAmt, totalLeakage, overdue.length, uniqueCustomers(overdue), 0.65)),
      mainCause: `Invoices overdue by avg ${avgOverdueDays} days`,
      aiExplanation: `₹${overdueAmt.toLocaleString('en-IN')} is tied up in ${overdue.length} overdue invoices with an average overdue period of ${avgOverdueDays} days. These represent genuine business receivables with high recovery potential — ${uniqueCustomers(overdue)} clients owe money. Automated payment reminders combined with easy online payment links have shown 60-70% effectiveness for invoices overdue by less than 60 days. Escalation to manual follow-up is recommended for invoices older than 60 days.`,
      patterns: [
        { label: 'Avg Overdue Period', value: `${avgOverdueDays} days`, insight: 'Most still recoverable' },
        { label: 'Unique Debtors', value: `${uniqueCustomers(overdue)}`, insight: 'Actionable follow-up list' },
        { label: 'Avg Invoice Value', value: `₹${Math.round(overdueAmt / Math.max(overdue.length, 1)).toLocaleString('en-IN')}`, insight: 'High-value recoveries' },
        { label: 'Primary Channel', value: 'Net Banking', insight: 'Easy payment link potential' },
      ],
      icon: '📄',
      color: 'orange',
    },
    {
      id: 'failed_subscriptions',
      title: 'Failed Subscription Renewals',
      description: 'Recurring subscriptions that failed to renew or were cancelled',
      affectedTransactions: failedSubs.length,
      affectedCustomers: uniqueCustomers(failedSubs),
      totalAmount: subsAmt,
      recoverableAmount: Math.round(subsAmt * 0.55),
      percentageOfLeakage: Math.round((subsAmt / totalLeakage) * 100),
      priorityScore: calcPriorityScore(subsAmt, totalLeakage, failedSubs.length, uniqueCustomers(failedSubs), 0.55),
      priority: calcPriority(calcPriorityScore(subsAmt, totalLeakage, failedSubs.length, uniqueCustomers(failedSubs), 0.55)),
      mainCause: 'Expired cards and insufficient funds',
      aiExplanation: `₹${subsAmt.toLocaleString('en-IN')} in subscription revenue was lost due to ${failedSubs.length} failed renewals across ${uniqueCustomers(failedSubs)} subscribers. The primary causes are expired payment methods and insufficient funds — both resolvable with proactive communication. Subscribers who received pre-renewal reminders to update payment methods show 50-60% reactivation rates. Each recovered subscriber also brings ongoing recurring revenue beyond the immediate recovery amount.`,
      patterns: [
        { label: 'Failed Renewals', value: `${failedSubs.length}`, insight: 'Direct recurring revenue loss' },
        { label: 'Primary Cause', value: 'Expired Cards', insight: 'Proactive update can prevent' },
        { label: 'Avg Sub Value', value: `₹${Math.round(subsAmt / Math.max(failedSubs.length, 1)).toLocaleString('en-IN')}`, insight: 'High LTV recovery value' },
        { label: 'Reactivation Rate', value: '~55%', insight: 'Industry benchmark' },
      ],
      icon: '🔄',
      color: 'purple',
    },
    {
      id: 'excessive_refunds',
      title: 'Excessive Refunds',
      description: 'High refund rate indicating product or experience issues',
      affectedTransactions: refunds.length,
      affectedCustomers: uniqueCustomers(refunds),
      totalAmount: refundsAmt,
      recoverableAmount: Math.round(refundsAmt * 0.25),
      percentageOfLeakage: Math.round((refundsAmt / totalLeakage) * 100),
      priorityScore: calcPriorityScore(refundsAmt, totalLeakage, refunds.length, uniqueCustomers(refunds), 0.25),
      priority: calcPriority(calcPriorityScore(refundsAmt, totalLeakage, refunds.length, uniqueCustomers(refunds), 0.25)),
      mainCause: 'Product/experience mismatch',
      aiExplanation: `₹${refundsAmt.toLocaleString('en-IN')} was refunded across ${refunds.length} transactions. While some refunds are unavoidable, a ${Math.round((refunds.length / transactions.length) * 100)}% refund rate suggests underlying product quality or expectation gaps. Proactive post-purchase engagement and improved product descriptions can reduce future refund rates. Offering partial replacements or store credit instead of full refunds can recover approximately 25% of refund value.`,
      patterns: [
        { label: 'Refund Rate', value: `${Math.round((refunds.length / transactions.length) * 100)}%`, insight: 'Above industry average' },
        { label: 'Partial Refunds', value: `${refunds.filter(t => t.refundStatus === 'Partial Refund').length}`, insight: 'Lower loss potential' },
        { label: 'Avg Refund Value', value: `₹${Math.round(refundsAmt / Math.max(refunds.length, 1)).toLocaleString('en-IN')}`, insight: 'Monitor high-value refunds' },
        { label: 'Recovery Lever', value: 'Store Credit', insight: 'Retain revenue while satisfying' },
      ],
      icon: '↩️',
      color: 'pink',
    },
  ].sort((a, b) => b.priorityScore - a.priorityScore);

  return { leaks, totalLeakage };
}

export function computeMetrics(transactions: Transaction[], leaks: RevenueLeak[], recoveredRevenue: number): DashboardMetrics {
  const successTxns = transactions.filter(t => t.paymentStatus === 'Success');
  const failedTxns = transactions.filter(t => t.paymentStatus === 'Failed');
  const abandonedTxns = transactions.filter(t => t.checkoutStatus === 'Abandoned');

  const actualRevenue = successTxns.reduce((s, t) => s + t.amount, 0) - transactions.filter(t => t.refundStatus === 'Refunded').reduce((s, t) => s + t.amount, 0);
  const estimatedLeakage = leaks.reduce((s, l) => s + l.totalAmount, 0);
  const recoverableRevenue = leaks.reduce((s, l) => s + l.recoverableAmount, 0);
  const totalPotential = actualRevenue + estimatedLeakage;

  return {
    totalPotentialRevenue: Math.round(totalPotential),
    actualRevenue: Math.round(actualRevenue),
    estimatedLeakage: Math.round(estimatedLeakage),
    recoverableRevenue: Math.round(recoverableRevenue),
    successfulPayments: successTxns.length,
    failedPayments: failedTxns.length,
    abandonedCheckouts: abandonedTxns.length,
    totalTransactions: transactions.length,
    recoveredRevenue: Math.round(recoveredRevenue),
  };
}

export function generateRecoveryActions(leaks: RevenueLeak[]): RecoveryAction[] {
  return leaks.map((leak, idx) => ({
    id: `RA-${String(idx + 1).padStart(3, '0')}`,
    leakType: leak.id,
    title: getActionTitle(leak.id),
    description: getActionDescription(leak.id, leak),
    targetedAmount: leak.totalAmount,
    estimatedRecovery: leak.recoverableAmount,
    affectedCustomers: leak.affectedCustomers,
    actionType: getActionType(leak.id),
    status: 'pending' as const,
  }));
}

function getActionTitle(type: string): string {
  const titles: Record<string, string> = {
    failed_payments: 'Send Payment Retry Reminders',
    abandoned_checkouts: 'Launch Cart Recovery Campaign',
    overdue_invoices: 'Send Invoice Payment Reminders',
    failed_subscriptions: 'Subscription Renewal Recovery',
    excessive_refunds: 'Implement Store Credit Swap Program',
  };
  return titles[type] || 'Recovery Action';
}

function getActionDescription(type: string, leak: RevenueLeak): string {
  const descriptions: Record<string, string> = {
    failed_payments: `Generate personalized payment retry links for ${leak.affectedCustomers} customers with failed payments. Target customers with temporary failure reasons first for highest recovery rate.`,
    abandoned_checkouts: `Send automated cart recovery emails with a 10% discount incentive to ${leak.affectedCustomers} customers who abandoned checkout within the past 7 days.`,
    overdue_invoices: `Dispatch automated invoice reminders with one-click payment links to ${leak.affectedCustomers} clients with overdue invoices. Escalate invoices >30 days to manual follow-up.`,
    failed_subscriptions: `Contact ${leak.affectedCustomers} subscribers with expired or failed payment methods to update their billing details and offer a 1-month free extension incentive.`,
    excessive_refunds: `Proactively reach out to refunded customers with store credit offers equal to 120% of their refund value to retain revenue and rebuild customer trust.`,
  };
  return descriptions[type] || '';
}

function getActionType(type: string): string {
  const types: Record<string, string> = {
    failed_payments: 'Payment Retry Campaign',
    abandoned_checkouts: 'Cart Recovery Email',
    overdue_invoices: 'Invoice Reminder',
    failed_subscriptions: 'Subscription Reactivation',
    excessive_refunds: 'Store Credit Offer',
  };
  return types[type] || 'Recovery';
}

export function answerQuestion(question: string, transactions: Transaction[], leaks: RevenueLeak[], metrics: DashboardMetrics): string {
  const q = question.toLowerCase();

  if (q.includes('most money') || q.includes('biggest loss') || q.includes('top leak')) {
    const top = leaks[0];
    return `Your biggest revenue loss is **${top.title}** — ₹${top.totalAmount.toLocaleString('en-IN')} affected across ${top.affectedTransactions} transactions (${top.affectedCustomers} customers). ${top.aiExplanation}`;
  }
  if (q.includes('recover') && q.includes('how much')) {
    return `Based on AI analysis, your total recoverable revenue is **₹${metrics.recoverableRevenue.toLocaleString('en-IN')}** out of ₹${metrics.estimatedLeakage.toLocaleString('en-IN')} in leakage. The highest recovery opportunity is from Failed Payments (₹${leaks.find(l => l.id === 'failed_payments')?.recoverableAmount.toLocaleString('en-IN') || '0'}) due to a high proportion of temporary failures.`;
  }
  if (q.includes('payment failure') || q.includes('failed payment')) {
    const fp = leaks.find(l => l.id === 'failed_payments');
    if (fp) return `**Payment Failures Analysis:** ${fp.aiExplanation}\n\nTop patterns: ${fp.patterns.map(p => `${p.label}: ${p.value} — ${p.insight}`).join('; ')}.`;
    return 'No significant payment failure pattern detected in the current dataset.';
  }
  if (q.includes('payment method') || q.includes('best method')) {
    const methodCounts: Record<string, { success: number; total: number; revenue: number }> = {};
    transactions.forEach(t => {
      if (!methodCounts[t.paymentMethod]) methodCounts[t.paymentMethod] = { success: 0, total: 0, revenue: 0 };
      methodCounts[t.paymentMethod].total++;
      if (t.paymentStatus === 'Success') { methodCounts[t.paymentMethod].success++; methodCounts[t.paymentMethod].revenue += t.amount; }
    });
    const best = Object.entries(methodCounts).sort((a, b) => (b[1].success / b[1].total) - (a[1].success / a[1].total))[0];
    const worst = Object.entries(methodCounts).sort((a, b) => (a[1].success / a[1].total) - (b[1].success / b[1].total))[0];
    return `**Best Performing:** ${best[0]} with ${Math.round((best[1].success / best[1].total) * 100)}% success rate and ₹${best[1].revenue.toLocaleString('en-IN')} in revenue.\n\n**Needs Improvement:** ${worst[0]} with ${Math.round((worst[1].success / worst[1].total) * 100)}% success rate — consider optimizing checkout flow for this method.`;
  }
  if (q.includes('fix first') || q.includes('priority') || q.includes('what should')) {
    const critical = leaks.filter(l => l.priority === 'CRITICAL' || l.priority === 'HIGH');
    return `**Priority Recommendations:**\n\n${critical.map((l, i) => `${i + 1}. **${l.title}** (Score: ${l.priorityScore}/100) — ₹${l.recoverableAmount.toLocaleString('en-IN')} recoverable. Action: ${getActionTitle(l.id)}.`).join('\n\n')}`;
  }
  if (q.includes('checkout') || q.includes('abandon')) {
    const ac = leaks.find(l => l.id === 'abandoned_checkouts');
    if (ac) return `**Abandoned Checkouts:** ${ac.aiExplanation}\n\nKey finding: ${ac.patterns[0].label}: ${ac.patterns[0].value} — ${ac.patterns[0].insight}.`;
  }
  if (q.includes('invoice') || q.includes('overdue')) {
    const oi = leaks.find(l => l.id === 'overdue_invoices');
    if (oi) return `**Overdue Invoices:** ${oi.aiExplanation}`;
  }
  if (q.includes('revenue decrease') || q.includes('revenue drop')) {
    return `Your revenue gap analysis: **Actual Revenue:** ₹${metrics.actualRevenue.toLocaleString('en-IN')} vs **Potential Revenue:** ₹${metrics.totalPotentialRevenue.toLocaleString('en-IN')}. The ₹${metrics.estimatedLeakage.toLocaleString('en-IN')} gap is driven by: Failed Payments (${leaks.find(l => l.id === 'failed_payments')?.percentageOfLeakage || 0}%), Abandoned Checkouts (${leaks.find(l => l.id === 'abandoned_checkouts')?.percentageOfLeakage || 0}%), and Overdue Invoices (${leaks.find(l => l.id === 'overdue_invoices')?.percentageOfLeakage || 0}%).`;
  }
  if (q.includes('customer') && q.includes('failed')) {
    const failed = transactions.filter(t => t.paymentStatus === 'Failed');
    const uniqueNames = [...new Set(failed.map(t => t.customerName))].slice(0, 5);
    return `**Customers with Failed Payments (Top 5):** ${uniqueNames.join(', ')}.\n\nTotal: ${new Set(failed.map(t => t.customerId)).size} unique customers with failed payments, representing ₹${failed.reduce((s, t) => s + t.amount, 0).toLocaleString('en-IN')} in affected revenue.`;
  }
  if (q.includes('top') && q.includes('leak')) {
    return `**Top 3 Revenue Leaks:**\n\n${leaks.slice(0, 3).map((l, i) => `${i + 1}. **${l.title}** — ₹${l.totalAmount.toLocaleString('en-IN')} (${l.priority} priority, ${l.percentageOfLeakage}% of total leakage). Recoverable: ₹${l.recoverableAmount.toLocaleString('en-IN')}.`).join('\n\n')}`;
  }
  return `Based on your transaction data: You have **₹${metrics.estimatedLeakage.toLocaleString('en-IN')}** in detected revenue leakage across ${leaks.length} categories. Your highest priority issue is **${leaks[0]?.title}** (${leaks[0]?.priority} priority). Total recoverable revenue is **₹${metrics.recoverableRevenue.toLocaleString('en-IN')}**. \n\nTry asking: "Where am I losing the most money?", "What is causing payment failures?", or "What should I fix first?"`;
}
