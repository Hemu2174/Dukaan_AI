import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';

const Layout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'dark';
    if (savedTheme === 'dark') {
      document.documentElement.classList.add('dark');
      setIsDark(true);
    } else {
      document.documentElement.classList.remove('dark');
      setIsDark(false);
    }
  }, []);

  const toggleTheme = () => {
    const newDark = !isDark;
    setIsDark(newDark);
    if (newDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    navigate('/auth/login');
  };

  const showSidebar = token && role === 'owner';
  const sidebarItems = [
    { to: '/dashboard', label: 'Dashboard', icon: '◉', show: role === 'owner' },
    { to: '/log', label: 'Log', icon: '✎', show: true },
    { to: '/summary', label: 'Summary', icon: '✦', show: role === 'owner' },
    { to: '/chart', label: 'Analytics', icon: '▣', show: role === 'owner' },
    { to: '/alerts', label: 'Alerts', icon: '⟡', show: role === 'owner' },
  ].filter((item) => item.show);

  return (
    <div className="flex min-h-[100dvh] w-full flex-col bg-[#0B0F1A] text-white">
      <header className="sticky top-0 z-[60] w-full border-b border-white/10 bg-[#0B0F1A]/95 backdrop-blur-xl">
        <div className="flex h-[72px] w-full items-center justify-between px-4 md:px-6">
          <Link to={token ? '/dashboard' : '/'} className="flex items-center gap-3">
            <span className="h-2.5 w-2.5 rounded-full bg-cyan-300 shadow-[0_0_14px_rgba(103,232,249,0.5)]" />
            <span className="text-lg font-semibold tracking-tight text-white">DukaanAI</span>
          </Link>

          <nav className="flex items-center gap-4 text-sm font-medium">
            <button
              onClick={toggleTheme}
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] transition-all hover:border-white/20 hover:bg-white/[0.08]"
              title="Toggle Theme"
            >
              {isDark ? '☀️' : '🌙'}
            </button>

            {!token ? (
              <Link to="/auth/login" className="text-sm text-white/55 transition-colors hover:text-white">Login</Link>
            ) : (
              <button onClick={handleLogout} className="text-sm text-white/55 transition-colors hover:text-white">Logout</button>
            )}
          </nav>
        </div>
      </header>

      {showSidebar && (
        <aside className="fixed left-0 top-[72px] z-40 hidden h-[calc(100vh-72px)] w-60 flex-col border-r border-white/10 bg-[#0F172A]/95 px-4 py-5 backdrop-blur-xl md:flex">
          <div className="mb-8 px-2">
            <p className="text-[10px] font-black uppercase tracking-[0.35em] text-white/40">Business Console</p>
            <h2 className="mt-2 text-xl font-semibold tracking-tight text-white">Workspace</h2>
          </div>

          <nav className="space-y-2">
            {sidebarItems.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition-all ${location.pathname === item.to ? 'bg-white/10 text-white shadow-[0_8px_30px_rgba(0,0,0,0.24)]' : 'text-white/60 hover:bg-white/5 hover:text-white'}`}
              >
                <span className="text-lg">{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            ))}
          </nav>

          <div className="mt-auto rounded-3xl border border-white/10 bg-white/[0.04] p-4">
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40">Live Status</p>
            <p className="mt-2 text-sm text-white/75">Desktop navigation stays on the left.</p>
            <div className="mt-4 flex items-center gap-2 text-xs text-emerald-300">
              <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.55)]" />
              Connected
            </div>
          </div>
        </aside>
      )}

      <main className={`flex-1 w-full relative bg-[#0B0F1A] ${showSidebar ? 'md:pl-60' : ''}`}>
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
