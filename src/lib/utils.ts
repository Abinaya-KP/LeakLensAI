import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number): string {
  if (amount >= 100000) {
    return `₹${(amount / 100000).toFixed(1)}L`;
  }
  if (amount >= 1000) {
    return `₹${(amount / 1000).toFixed(1)}K`;
  }
  return `₹${amount.toLocaleString('en-IN')}`;
}

export function formatCurrencyFull(amount: number): string {
  return `₹${amount.toLocaleString('en-IN')}`;
}

export function formatDate(dateStr: string): string {
  if (!dateStr || dateStr === 'N/A') return 'N/A';
  try {
    return new Date(dateStr).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  } catch {
    return dateStr;
  }
}

export function getPriorityColor(priority: string): string {
  switch (priority) {
    case 'CRITICAL': return 'text-red-400 bg-red-500/10 border-red-500/30';
    case 'HIGH': return 'text-orange-400 bg-orange-500/10 border-orange-500/30';
    case 'MEDIUM': return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30';
    case 'LOW': return 'text-green-400 bg-green-500/10 border-green-500/30';
    default: return 'text-gray-400 bg-gray-500/10 border-gray-500/30';
  }
}

export function getStatusColor(status: string): string {
  switch (status) {
    case 'Success': case 'Paid': case 'Active': case 'Completed':
      return 'text-emerald-400 bg-emerald-500/10';
    case 'Failed': case 'Overdue': case 'Expired':
      return 'text-red-400 bg-red-500/10';
    case 'Pending':
      return 'text-yellow-400 bg-yellow-500/10';
    case 'Abandoned': case 'Cancelled':
      return 'text-orange-400 bg-orange-500/10';
    case 'Refunded': case 'Partial Refund':
      return 'text-pink-400 bg-pink-500/10';
    default:
      return 'text-gray-400 bg-gray-500/10';
  }
}
