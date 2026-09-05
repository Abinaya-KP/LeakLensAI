import { NavLink } from 'react-router-dom';
import { LayoutDashboard, TrendingDown, Search, Zap, TrendingUp, Table2, MessageSquareText, FileBarChart2, X } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/leaks', icon: TrendingDown, label: 'Revenue Leaks' },
  { to: '/investigation', icon: Search, label: 'AI Investigation' },
  { to: '/recovery', icon: Zap, label: 'Recovery Center' },
  { to: '/recovered', icon: TrendingUp, label: 'Recovered Revenue' },
  { to: '/transactions', icon: Table2, label: 'Transactions' },
  { to: '/assistant', icon: MessageSquareText, label: 'AI Assistant' },
  { to: '/reports', icon: FileBarChart2, label: 'Reports' },
];

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function Sidebar({ open, onClose }: Props) {
  return (
    <>
      {open && (
        <div className="fixed inset-0 bg-black/50 z-30 lg:hidden" onClick={onClose} />
      )}
      <aside className={cn(
        'fixed top-0 left-0 h-full z-40 w-64 transition-transform duration-300 lg:translate-x-0 lg:static lg:z-auto',
        'flex flex-col',
        'bg-sidebar border-r border-sidebar-border',
        open ? 'translate-x-0' : '-translate-x-full'
      )}>
        {/* Logo */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-sidebar-border">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg gradient-cyan flex items-center justify-center">
              <span className="text-sm font-bold text-black">L</span>
            </div>
            <div>
              <div className="font-bold text-white text-sm leading-none">LeakLens AI</div>
              <div className="text-xs text-muted-foreground mt-0.5">Detect. Recover. Grow.</div>
            </div>
          </div>
          <button onClick={onClose} className="lg:hidden text-muted-foreground hover:text-white p-1">
            <X size={16} />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              onClick={() => window.innerWidth < 1024 && onClose()}
              className={({ isActive }) => cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200',
                isActive
                  ? 'bg-sidebar-accent text-sidebar-primary border border-sidebar-primary/20'
                  : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
              )}
            >
              <Icon size={16} />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Footer */}
        <div className="px-4 py-4 border-t border-sidebar-border">
          <div className="text-xs text-muted-foreground text-center">
            AI Agent v1.0 • Demo Mode
          </div>
        </div>
      </aside>
    </>
  );
}
