import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Zap, Shield, TrendingUp, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import heroDashboard from '@/assets/hero-dashboard.jpg';

const DEMO_EMAIL = 'demo@leaklens.ai';
const DEMO_PASSWORD = 'LeakLens2024';

export const AUTH_KEY = 'leaklens_auth';

export function isAuthenticated(): boolean {
  try {
    return localStorage.getItem(AUTH_KEY) === 'true';
  } catch {
    return false;
  }
}

export function logout() {
  try {
    localStorage.removeItem(AUTH_KEY);
  } catch {}
}

const features = [
  { icon: Zap, label: 'AI Leak Detection', desc: 'Instantly find hidden revenue losses' },
  { icon: TrendingUp, label: 'Smart Recovery', desc: 'Agentic recovery workflow with one click' },
  { icon: Shield, label: 'Secure Analysis', desc: 'Your data never leaves your browser' },
];

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState(DEMO_EMAIL);
  const [password, setPassword] = useState(DEMO_PASSWORD);
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (!email.trim() || !password.trim()) {
      setError('Please enter your email and password.');
      return;
    }
    setLoading(true);
    setTimeout(() => {
      if (email.trim().toLowerCase() === DEMO_EMAIL && password === DEMO_PASSWORD) {
        localStorage.setItem(AUTH_KEY, 'true');
        navigate('/', { replace: true });
      } else {
        setError('Invalid credentials. Use the demo credentials below.');
        setLoading(false);
      }
    }, 900);
  }

  function fillDemo() {
    setEmail(DEMO_EMAIL);
    setPassword(DEMO_PASSWORD);
    setError('');
  }

  return (
    <div className="min-h-screen flex bg-background overflow-hidden">
      {/* Left panel — branding */}
      <div className="hidden lg:flex lg:w-1/2 xl:w-[55%] relative flex-col">
        {/* Background image */}
        <img
          src={heroDashboard}
          alt="LeakLens AI Dashboard"
          className="absolute inset-0 w-full h-full object-cover opacity-40"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-background via-background/70 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />

        {/* Content */}
        <div className="relative z-10 flex flex-col h-full px-12 py-10">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl gradient-cyan flex items-center justify-center shadow-lg">
              <span className="text-base font-black text-black">L</span>
            </div>
            <div>
              <div className="font-bold text-white text-base leading-none">LeakLens AI</div>
              <div className="text-xs text-muted-foreground mt-0.5">Detect. Recover. Grow.</div>
            </div>
          </div>

          {/* Main headline */}
          <div className="flex-1 flex flex-col justify-center max-w-lg">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-cyan-500/10 border border-cyan-500/20 rounded-full text-xs text-cyan-400 font-medium mb-6 w-fit">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
              AI Revenue Recovery Agent
            </div>
            <h1 className="text-4xl xl:text-5xl font-bold text-white leading-tight mb-4">
              Find your
              <span className="block text-gradient-cyan">hidden revenue.</span>
              Recover it fast.
            </h1>
            <p className="text-muted-foreground text-base leading-relaxed mb-10">
              LeakLens AI automatically detects payment failures, abandoned carts, overdue invoices, and subscription drops — then creates a recovery plan in seconds.
            </p>

            {/* Feature highlights */}
            <div className="space-y-4">
              {features.map(({ icon: Icon, label, desc }) => (
                <div key={label} className="flex items-center gap-4">
                  <div className="w-9 h-9 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center flex-shrink-0">
                    <Icon size={16} className="text-cyan-400" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-white">{label}</div>
                    <div className="text-xs text-muted-foreground">{desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom stat bar */}
          <div className="grid grid-cols-3 gap-4 pb-2">
            {[
              { value: '₹2.4M+', label: 'Revenue Recovered' },
              { value: '1,200+', label: 'Businesses Served' },
              { value: '68%', label: 'Avg Recovery Rate' },
            ].map(({ value, label }) => (
              <div key={label} className="bg-white/5 border border-white/10 rounded-xl p-3 text-center">
                <div className="text-lg font-bold text-gradient-cyan font-mono-data">{value}</div>
                <div className="text-xs text-muted-foreground mt-0.5">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-10 relative">
        {/* Mobile logo */}
        <div className="lg:hidden flex items-center gap-3 mb-10">
          <div className="w-9 h-9 rounded-xl gradient-cyan flex items-center justify-center">
            <span className="text-base font-black text-black">L</span>
          </div>
          <div>
            <div className="font-bold text-white text-base leading-none">LeakLens AI</div>
            <div className="text-xs text-muted-foreground mt-0.5">Detect. Recover. Grow.</div>
          </div>
        </div>

        <div className="w-full max-w-sm animate-slide-up">
          {/* Card */}
          <div className="bg-card border border-border rounded-2xl p-7 shadow-2xl">
            <div className="mb-6">
              <h2 className="text-xl font-bold text-white mb-1">Welcome back</h2>
              <p className="text-sm text-muted-foreground">Sign in to your LeakLens AI account</p>
            </div>

            {/* Demo credentials hint */}
            <button
              type="button"
              onClick={fillDemo}
              className="w-full flex items-center gap-3 px-4 py-3 bg-cyan-500/8 border border-cyan-500/25 rounded-xl mb-5 hover:bg-cyan-500/15 transition-colors group"
            >
              <div className="w-7 h-7 rounded-lg bg-cyan-500/20 flex items-center justify-center flex-shrink-0">
                <Zap size={13} className="text-cyan-400" />
              </div>
              <div className="text-left flex-1">
                <div className="text-xs font-semibold text-cyan-400">Use Demo Credentials</div>
                <div className="text-xs text-muted-foreground">{DEMO_EMAIL}</div>
              </div>
              <span className="text-xs text-muted-foreground group-hover:text-white transition-colors">Fill →</span>
            </button>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground" htmlFor="email">
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={e => { setEmail(e.target.value); setError(''); }}
                  placeholder="you@example.com"
                  autoComplete="email"
                  className={cn(
                    'w-full bg-secondary/60 border rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-muted-foreground/50',
                    'focus:outline-none focus:ring-2 focus:ring-cyan-500/40 focus:border-cyan-500/40 transition-all',
                    error ? 'border-red-500/50' : 'border-border hover:border-border/80'
                  )}
                />
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground" htmlFor="password">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPass ? 'text' : 'password'}
                    value={password}
                    onChange={e => { setPassword(e.target.value); setError(''); }}
                    placeholder="••••••••"
                    autoComplete="current-password"
                    className={cn(
                      'w-full bg-secondary/60 border rounded-xl px-4 py-2.5 pr-10 text-sm text-white placeholder:text-muted-foreground/50',
                      'focus:outline-none focus:ring-2 focus:ring-cyan-500/40 focus:border-cyan-500/40 transition-all',
                      error ? 'border-red-500/50' : 'border-border hover:border-border/80'
                    )}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-white transition-colors p-1"
                    aria-label={showPass ? 'Hide password' : 'Show password'}
                  >
                    {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              </div>

              {/* Error */}
              {error && (
                <div className="flex items-center gap-2 px-3 py-2 bg-red-500/10 border border-red-500/20 rounded-lg">
                  <AlertCircle size={13} className="text-red-400 flex-shrink-0" />
                  <p className="text-xs text-red-400">{error}</p>
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className={cn(
                  'w-full gradient-cyan text-black font-bold text-sm py-2.5 rounded-xl transition-all duration-200 mt-1',
                  'hover:opacity-90 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed',
                  'flex items-center justify-center gap-2'
                )}
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                    </svg>
                    Signing in…
                  </>
                ) : (
                  'Sign In'
                )}
              </button>
            </form>

            {/* Demo credentials display */}
            <div className="mt-5 pt-4 border-t border-border">
              <p className="text-xs text-muted-foreground text-center mb-2">Demo credentials</p>
              <div className="bg-secondary/40 rounded-lg px-3 py-2 space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Email</span>
                  <span className="text-foreground font-mono">{DEMO_EMAIL}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Password</span>
                  <span className="text-foreground font-mono">{DEMO_PASSWORD}</span>
                </div>
              </div>
            </div>
          </div>

          <p className="text-center text-xs text-muted-foreground mt-5">
            All data is processed locally. No real transactions are modified.
          </p>
        </div>
      </div>
    </div>
  );
}
