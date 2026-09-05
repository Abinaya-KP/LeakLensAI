import { Transaction } from '@/types';

const locations = ['Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Chennai', 'Pune', 'Kolkata', 'Ahmedabad', 'Jaipur', 'Surat'];
const paymentMethods = ['Credit Card', 'Debit Card', 'UPI', 'Net Banking', 'Wallet', 'BNPL'];
const devices = ['Mobile', 'Desktop', 'Tablet'] as const;
const failureReasons = [
  'Insufficient Funds',
  'Card Expired',
  'Bank Declined',
  'Network Timeout',
  'Invalid CVV',
  'Daily Limit Exceeded',
  'Temporary Payment Failure',
  'Authentication Failed',
  ''
];
const customerNames = [
  'Rahul Sharma', 'Priya Patel', 'Amit Kumar', 'Sunita Singh', 'Vikram Mehta',
  'Anjali Gupta', 'Rohit Joshi', 'Kavya Reddy', 'Suresh Nair', 'Meera Iyer',
  'Deepak Verma', 'Pooja Agarwal', 'Karan Malhotra', 'Nisha Bose', 'Arjun Rao',
  'Sneha Patil', 'Manish Chopra', 'Divya Kapoor', 'Rajesh Dubey', 'Preethi Shetty',
  'Sanjay Bhatt', 'Ritu Saxena', 'Arun Menon', 'Swati Kulkarni', 'Tarun Mishra',
  'Leela Pillai', 'Akash Chandra', 'Neha Rastogi', 'Vivek Trivedi', 'Ananya Das',
  'Gaurav Khanna', 'Puja Pandey', 'Naveen Tiwari', 'Madhuri Jain', 'Hemant Soni',
  'Shruti Bansal', 'Vinod Choudhary', 'Geeta Rao', 'Ritesh Bhatia', 'Farida Khan'
];

function randomFrom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomAmount(min: number, max: number): number {
  return Math.round((Math.random() * (max - min) + min) * 100) / 100;
}

function dateOffset(daysAgo: number): string {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString().split('T')[0];
}

function dueDateOffset(daysAgo: number): string {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString().split('T')[0];
}

let txCounter = 1;
function txId() { return `TXN${String(txCounter++).padStart(5, '0')}`; }
let custCounter = 1;
function custId() { return `CUST${String(Math.floor(Math.random() * 400) + 1).padStart(4, '0')}`; }

const transactions: Transaction[] = [];

// Successful payments (40 transactions)
for (let i = 0; i < 40; i++) {
  transactions.push({
    transactionId: txId(),
    customerId: custId(),
    customerName: randomFrom(customerNames),
    transactionDate: dateOffset(Math.floor(Math.random() * 30)),
    amount: randomAmount(500, 15000),
    paymentMethod: randomFrom(paymentMethods),
    paymentStatus: 'Success',
    failureReason: '',
    invoiceStatus: 'Paid',
    invoiceDueDate: dateOffset(Math.floor(Math.random() * 15) + 5),
    subscriptionStatus: Math.random() > 0.5 ? 'Active' : 'N/A',
    refundStatus: 'None',
    checkoutStatus: 'Completed',
    deviceType: randomFrom(devices),
    customerLocation: randomFrom(locations),
  });
}

// Failed payments (28 transactions)
const failedPaymentReasons = [
  'Temporary Payment Failure', 'Temporary Payment Failure', 'Temporary Payment Failure',
  'Insufficient Funds', 'Insufficient Funds',
  'Card Expired', 'Bank Declined', 'Bank Declined',
  'Network Timeout', 'Authentication Failed', 'Invalid CVV', 'Daily Limit Exceeded'
];
for (let i = 0; i < 28; i++) {
  transactions.push({
    transactionId: txId(),
    customerId: custId(),
    customerName: randomFrom(customerNames),
    transactionDate: dateOffset(Math.floor(Math.random() * 30)),
    amount: randomAmount(800, 18000),
    paymentMethod: randomFrom(['Credit Card', 'Debit Card', 'Net Banking', 'UPI']),
    paymentStatus: 'Failed',
    failureReason: randomFrom(failedPaymentReasons),
    invoiceStatus: 'Pending',
    invoiceDueDate: dateOffset(Math.floor(Math.random() * 10)),
    subscriptionStatus: 'N/A',
    refundStatus: 'None',
    checkoutStatus: 'N/A',
    deviceType: randomFrom(devices),
    customerLocation: randomFrom(locations),
  });
}

// Abandoned checkouts (20 transactions)
for (let i = 0; i < 20; i++) {
  transactions.push({
    transactionId: txId(),
    customerId: custId(),
    customerName: randomFrom(customerNames),
    transactionDate: dateOffset(Math.floor(Math.random() * 30)),
    amount: randomAmount(300, 8000),
    paymentMethod: randomFrom(paymentMethods),
    paymentStatus: 'Cancelled',
    failureReason: '',
    invoiceStatus: 'N/A',
    invoiceDueDate: 'N/A',
    subscriptionStatus: 'N/A',
    refundStatus: 'None',
    checkoutStatus: 'Abandoned',
    deviceType: randomFrom(['Mobile', 'Mobile', 'Desktop', 'Tablet']),
    customerLocation: randomFrom(locations),
  });
}

// Overdue invoices (18 transactions)
for (let i = 0; i < 18; i++) {
  transactions.push({
    transactionId: txId(),
    customerId: custId(),
    customerName: randomFrom(customerNames),
    transactionDate: dateOffset(Math.floor(Math.random() * 45) + 15),
    amount: randomAmount(2000, 25000),
    paymentMethod: 'Net Banking',
    paymentStatus: 'Pending',
    failureReason: '',
    invoiceStatus: randomFrom(['Overdue', 'Overdue', 'Overdue', 'Pending']),
    invoiceDueDate: dueDateOffset(Math.floor(Math.random() * 30) + 5),
    subscriptionStatus: 'N/A',
    refundStatus: 'None',
    checkoutStatus: 'N/A',
    deviceType: randomFrom(devices),
    customerLocation: randomFrom(locations),
  });
}

// Failed subscriptions (15 transactions)
for (let i = 0; i < 15; i++) {
  transactions.push({
    transactionId: txId(),
    customerId: custId(),
    customerName: randomFrom(customerNames),
    transactionDate: dateOffset(Math.floor(Math.random() * 30)),
    amount: randomAmount(499, 4999),
    paymentMethod: randomFrom(['Credit Card', 'Debit Card', 'Wallet']),
    paymentStatus: 'Failed',
    failureReason: randomFrom(['Card Expired', 'Insufficient Funds', 'Bank Declined']),
    invoiceStatus: 'N/A',
    invoiceDueDate: 'N/A',
    subscriptionStatus: randomFrom(['Failed', 'Failed', 'Expired', 'Cancelled']),
    refundStatus: 'None',
    checkoutStatus: 'N/A',
    deviceType: randomFrom(devices),
    customerLocation: randomFrom(locations),
  });
}

// Refunds (12 transactions)
for (let i = 0; i < 12; i++) {
  transactions.push({
    transactionId: txId(),
    customerId: custId(),
    customerName: randomFrom(customerNames),
    transactionDate: dateOffset(Math.floor(Math.random() * 30)),
    amount: randomAmount(400, 12000),
    paymentMethod: randomFrom(paymentMethods),
    paymentStatus: 'Success',
    failureReason: '',
    invoiceStatus: 'Paid',
    invoiceDueDate: dateOffset(Math.floor(Math.random() * 20) + 5),
    subscriptionStatus: 'N/A',
    refundStatus: randomFrom(['Refunded', 'Refunded', 'Partial Refund']),
    checkoutStatus: 'Completed',
    deviceType: randomFrom(devices),
    customerLocation: randomFrom(locations),
  });
}

export const SAMPLE_TRANSACTIONS: Transaction[] = transactions;
