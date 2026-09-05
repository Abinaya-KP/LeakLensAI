export interface Transaction {
  transactionId: string;
  customerId: string;
  customerName: string;
  transactionDate: string;
  amount: number;
  paymentMethod: string;
  paymentStatus: 'Success' | 'Failed' | 'Pending' | 'Cancelled';
  failureReason: string;
  invoiceStatus: 'Paid' | 'Overdue' | 'Pending' | 'Cancelled' | 'N/A';
  invoiceDueDate: string;
  subscriptionStatus: 'Active' | 'Failed' | 'Cancelled' | 'Expired' | 'N/A';
  refundStatus: 'None' | 'Refunded' | 'Partial Refund' | 'Pending';
  checkoutStatus: 'Completed' | 'Abandoned' | 'Pending' | 'N/A';
  deviceType: 'Mobile' | 'Desktop' | 'Tablet';
  customerLocation: string;
}

export type LeakType =
  | 'failed_payments'
  | 'abandoned_checkouts'
  | 'overdue_invoices'
  | 'failed_subscriptions'
  | 'excessive_refunds';

export type Priority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface RevenueLeak {
  id: LeakType;
  title: string;
  description: string;
  affectedTransactions: number;
  affectedCustomers: number;
  totalAmount: number;
  recoverableAmount: number;
  percentageOfLeakage: number;
  priorityScore: number;
  priority: Priority;
  mainCause: string;
  aiExplanation: string;
  patterns: Pattern[];
  icon: string;
  color: string;
}

export interface Pattern {
  label: string;
  value: string;
  insight: string;
}

export interface RecoveryAction {
  id: string;
  leakType: LeakType;
  title: string;
  description: string;
  targetedAmount: number;
  estimatedRecovery: number;
  affectedCustomers: number;
  actionType: string;
  status: 'pending' | 'approved' | 'rejected' | 'executed';
  executedAt?: string;
  result?: RecoveryResult;
}

export interface RecoveryResult {
  targeted: number;
  recovered: number;
  recoveryRate: number;
  customersRecovered: number;
  stillAtRisk: number;
  executedAt: string;
}

export interface DashboardMetrics {
  totalPotentialRevenue: number;
  actualRevenue: number;
  estimatedLeakage: number;
  recoverableRevenue: number;
  successfulPayments: number;
  failedPayments: number;
  abandonedCheckouts: number;
  totalTransactions: number;
  recoveredRevenue: number;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface AppState {
  transactions: Transaction[];
  leaks: RevenueLeak[];
  recoveryActions: RecoveryAction[];
  metrics: DashboardMetrics;
  isLoaded: boolean;
}
