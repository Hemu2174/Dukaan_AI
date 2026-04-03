import { Outlet, Link, useNavigate } from 'react-router-dom';

const Layout = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    navigate('/auth/login');
  };

  return (
    <div className="flex flex-col min-h-[100dvh] w-full bg-slate-50 relative">
      {/* Header */}
      <header className="bg-primary text-white p-4 sticky top-0 z-50 shadow-sm w-full">
        <div className="flex justify-between items-center w-full">
          <Link to="/" className="text-xl font-bold tracking-tight">🛒 DukaanAI</Link>
          <nav className="flex gap-4 text-sm font-medium">
            {!token ? (
              <Link to="/auth/login" className="hover:text-blue-200 transition-colors">Login</Link>
            ) : (
              <button onClick={handleLogout} className="hover:text-blue-200 transition-colors">Logout</button>
            )}
          </nav>
        </div>
      </header>
      
      {/* Main Content */}
      <main className="flex-1 w-full bg-slate-50 relative pb-20">
        <Outlet />
      </main>
      
      {/* Bottom Navigation */}
      <footer className="bg-white border-t border-gray-200 fixed bottom-0 left-0 w-full flex justify-around py-3 z-50 pb-[calc(0.75rem+env(safe-area-inset-bottom))]">
        {(role === 'owner' || !role) && (
          <Link to={token ? "/dashboard" : "/"} className="flex flex-col items-center text-gray-500 hover:text-primary transition-colors">
            <span className="text-xl">🏠</span>
            <span className="text-xs mt-1 font-medium">{token ? "Dashboard" : "Home"}</span>
          </Link>
        )}
        
        {token && (
          <Link to="/log" className="flex flex-col items-center text-gray-500 hover:text-primary transition-colors">
            <span className="text-xl">📝</span>
            <span className="text-xs mt-1 font-medium">Log</span>
          </Link>
        )}

        {role === 'owner' && (
          <Link to="/summary" className="flex flex-col items-center text-gray-500 hover:text-primary transition-colors">
            <span className="text-xl">✨</span>
            <span className="text-xs mt-1 font-medium">Summary</span>
          </Link>
        )}

        {role === 'owner' && (
          <Link to="/chart" className="flex flex-col items-center text-gray-500 hover:text-primary transition-colors">
            <span className="text-xl">📊</span>
            <span className="text-xs mt-1 font-medium">Chart</span>
          </Link>
        )}

        {!token && (
          <Link to="/auth/login" className="flex flex-col items-center text-gray-500 hover:text-primary transition-colors">
            <span className="text-xl">👤</span>
            <span className="text-xs mt-1 font-medium">Profile</span>
          </Link>
        )}
      </footer>
    </div>
  );
};

export default Layout;
