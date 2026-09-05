import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import { Transaction } from '@/types';
import { useAppStore } from '@/hooks/useAppStore';

const pageTitles: Record<string, string> = {
  '/': 'Dashboard',
  '/leaks': 'Revenue Leaks',
  '/investigation': 'AI Investigation',
  '/recovery': 'Recovery Center',
  '/recovered': 'Recovered Revenue',
  '/transactions': 'Transactions',
  '/assistant': 'AI Assistant',
  '/reports': 'Reports',
};

interface LayoutContext {
  store: ReturnType<typeof useAppStore>;
}

export { type LayoutContext };

export default function MainLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const store = useAppStore();
  const title = pageTitles[location.pathname] || 'LeakLens AI';

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header
          onMenuToggle={() => setSidebarOpen(o => !o)}
          onLoadTransactions={(txns: Transaction[]) => store.loadTransactions(txns)}
          onReset={store.resetToSample}
          title={title}
        />
        <main className="flex-1 overflow-y-auto">
          <Outlet context={{ store }} />
        </main>
      </div>
    </div>
  );
}
