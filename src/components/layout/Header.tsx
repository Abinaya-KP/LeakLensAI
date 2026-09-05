import { Menu, Upload, RotateCcw, LogOut } from 'lucide-react';
import { useRef } from 'react';
import { Transaction } from '@/types';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { logout } from '@/pages/Login';

interface Props {
  onMenuToggle: () => void;
  onLoadTransactions: (txns: Transaction[]) => void;
  onReset: () => void;
  title: string;
}

function parseCSV(text: string): Transaction[] {
  const lines = text.trim().split('\n');
  if (lines.length < 2) return [];
  const headers = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/\s+/g, '_'));
  return lines.slice(1).map((line, idx) => {
    const vals = line.split(',').map(v => v.trim().replace(/^"|"$/g, ''));
    const row: Record<string, string> = {};
    headers.forEach((h, i) => { row[h] = vals[i] || ''; });
    return {
      transactionId: row['transaction_id'] || `TXN${idx + 1}`,
      customerId: row['customer_id'] || `CUST${idx + 1}`,
      customerName: row['customer_name'] || 'Unknown',
      transactionDate: row['transaction_date'] || '',
      amount: parseFloat(row['amount']) || 0,
      paymentMethod: row['payment_method'] || 'Unknown',
      paymentStatus: (row['payment_status'] as Transaction['paymentStatus']) || 'Pending',
      failureReason: row['failure_reason'] || '',
      invoiceStatus: (row['invoice_status'] as Transaction['invoiceStatus']) || 'N/A',
      invoiceDueDate: row['invoice_due_date'] || 'N/A',
      subscriptionStatus: (row['subscription_status'] as Transaction['subscriptionStatus']) || 'N/A',
      refundStatus: (row['refund_status'] as Transaction['refundStatus']) || 'None',
      checkoutStatus: (row['checkout_status'] as Transaction['checkoutStatus']) || 'N/A',
      deviceType: (row['device_type'] as Transaction['deviceType']) || 'Desktop',
      customerLocation: row['customer_location'] || 'Unknown',
    };
  });
}

export default function Header({ onMenuToggle, onLoadTransactions, onReset, title }: Props) {
  const fileRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/login', { replace: true });
  }

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      const txns = parseCSV(text);
      if (txns.length === 0) {
        toast.error('Could not parse CSV. Please check the format.');
        return;
      }
      onLoadTransactions(txns);
      toast.success(`Loaded ${txns.length} transactions. AI analysis complete.`);
    };
    reader.readAsText(file);
    e.target.value = '';
  }

  return (
    <header className="sticky top-0 z-20 flex items-center justify-between px-4 md:px-6 py-3 bg-background/80 backdrop-blur-sm border-b border-border">
      <div className="flex items-center gap-3">
        <button onClick={onMenuToggle} className="lg:hidden p-2 text-muted-foreground hover:text-white">
          <Menu size={20} />
        </button>
        <h1 className="text-base font-semibold text-foreground">{title}</h1>
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          className="hidden sm:flex items-center gap-2 border-border text-muted-foreground hover:text-white text-xs"
          onClick={onReset}
        >
          <RotateCcw size={13} />
          Reset Demo
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="hidden sm:flex items-center gap-2 border-border text-muted-foreground hover:text-red-400 text-xs"
          onClick={handleLogout}
        >
          <LogOut size={13} />
          Logout
        </Button>
        <Button
          size="sm"
          className="flex items-center gap-2 gradient-cyan text-black font-semibold text-xs"
          onClick={() => fileRef.current?.click()}
        >
          <Upload size={13} />
          Upload CSV
        </Button>
        <input ref={fileRef} type="file" accept=".csv" className="hidden" onChange={handleFile} />
      </div>
    </header>
  );
}
