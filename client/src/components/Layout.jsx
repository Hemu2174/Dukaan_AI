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

  return (
    <div className="flex flex-col min-h-[100dvh] w-full bg-dark text-[var(--text-primary)] relative">
      {/* Header */}
      <header className="p-4 sticky top-0 z-[60] border-b border-border shadow-sm w-full bg-dark">
        <div className="flex justify-between items-center w-full max-w-7xl mx-auto">
          <Link to="/" className="text-xl font-heading font-bold tracking-tight text-neon">DukaanAI®</Link>
          
          <nav className="flex items-center gap-4 text-sm font-medium">
            <button 
              onClick={toggleTheme}
              className="w-10 h-10 flex items-center justify-center bg-section rounded-xl border border-border hover:border-neon transition-all"
              title="Toggle Theme"
            >
              {isDark ? '☀️' : '🌙'}
            </button>
            
            {!token ? (
              <Link to="/auth/login" className="text-label hover:text-neon transition-colors">Login</Link>
            ) : (
              <button onClick={handleLogout} className="text-label hover:text-neon transition-colors">Logout</button>
            )}
          </nav>
        </div>
      </header>
      
      {/* Main Content */}
      <main className="flex-1 w-full relative pb-24 bg-dark">
        <Outlet />
      </main>
      
      {/* Bottom Navigation */}
      <footer className="bg-dark border-t border-[var(--border)] fixed bottom-0 left-0 w-full flex justify-around py-4 z-50 pb-[calc(1rem+env(safe-area-inset-bottom))] shadow-2xl">
        {(role === 'owner' || !role) && (
          <Link to={token ? "/dashboard" : "/"} className={`flex flex-col items-center transition-colors ${location.pathname === '/dashboard' || location.pathname === '/' ? 'text-neon' : 'text-label'}`}>
            <span className="text-xl">🏠</span>
            <span className="text-[10px] mt-1 font-bold uppercase tracking-widest">{token ? "Dashboard" : "Home"}</span>
          </Link>
        )}
        
        {token && (
          <Link to="/log" className={`flex flex-col items-center transition-colors ${location.pathname === '/log' ? 'text-neon' : 'text-label'}`}>
            <span className="text-xl">📝</span>
            <span className="text-[10px] mt-1 font-bold uppercase tracking-widest">Log</span>
          </Link>
        )}

        {role === 'owner' && (
          <Link to="/summary" className={`flex flex-col items-center transition-colors ${location.pathname === '/summary' ? 'text-neon' : 'text-label'}`}>
            <span className="text-xl">✨</span>
            <span className="text-[10px] mt-1 font-bold uppercase tracking-widest">Summary</span>
          </Link>
        )}

        {role === 'owner' && (
          <Link to="/chart" className={`flex flex-col items-center transition-colors ${location.pathname === '/chart' ? 'text-neon' : 'text-label'}`}>
            <span className="text-xl">📊</span>
            <span className="text-[10px] mt-1 font-bold uppercase tracking-widest">Analytics</span>
          </Link>
        )}

        {role === 'owner' && (
          <Link to="/alerts" className={`flex flex-col items-center transition-colors ${location.pathname === '/alerts' ? 'text-neon' : 'text-label'}`}>
            <span className="text-xl">🔔</span>
            <span className="text-[10px] mt-1 font-bold uppercase tracking-widest">Alerts</span>
          </Link>
        )}
      </footer>
    </div>
  );
};

export default Layout;
