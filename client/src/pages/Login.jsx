import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isHelper, setIsHelper] = useState(false);
  const [ownerId, setOwnerId] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const endpoint = isHelper ? '/api/auth/helper-login' : '/api/auth/login';
      const body = isHelper ? { owner_user_id: ownerId, pin: password } : { email, password };
      
      const response = await fetch(`http://localhost:5000${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      
      const data = await response.json();
      
      if (response.ok) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('role', data.role);
        
        if (data.role === 'helper') {
          navigate('/log');
        } else {
          navigate('/dashboard');
        }
      } else {
        alert(data.error || 'Login failed');
      }
    } catch (err) {
      console.error(err);
      alert('Network error');
    }
  };

  return (
    <div className="p-6 h-full flex flex-col justify-center min-h-[calc(100dvh-160px)] w-full bg-dark">
      <div className="bg-card rounded-2xl border border-border p-10 w-full max-w-md mx-auto transition-all shadow-2xl relative overflow-hidden group">
        <div className="absolute top-0 left-0 w-full h-1 bg-neon/10 group-hover:bg-neon transition-all" />
        
        <h2 className="text-3xl font-heading font-medium text-text-primary mb-2 italic">Welcome Back</h2>
        <p className="text-text-secondary mb-10 text-sm leading-relaxed font-sans font-light">Sign in to your DukaanAI dashboard and track your growth trajectory.</p>
        
        <div className="flex mb-10 bg-dark p-1.5 rounded-xl border border-border shadow-inner">
          <button 
            className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${!isHelper ? 'bg-card text-neon shadow-xl border border-border' : 'text-label hover:text-text-primary'}`}
            onClick={() => setIsHelper(false)}
          >
            Store Owner
          </button>
          <button 
            className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${isHelper ? 'bg-card text-neon shadow-xl border border-border' : 'text-label hover:text-text-primary'}`}
            onClick={() => setIsHelper(true)}
          >
            Staff Helper
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {!isHelper ? (
            <div className="focus-within:translate-x-1 transition-transform">
              <label className="block text-[10px] uppercase tracking-widest font-black text-label mb-3" htmlFor="email">Email Address</label>
              <input 
                type="email" 
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com" 
                className="w-full bg-dark px-5 py-4 rounded-xl border border-border focus:outline-none focus:border-neon/50 transition-all text-sm text-text-primary placeholder-label/30"
                required
              />
            </div>
          ) : (
            <div className="focus-within:translate-x-1 transition-transform">
              <label className="block text-[10px] uppercase tracking-widest font-black text-label mb-3" htmlFor="ownerId">Kirana Store ID</label>
              <input 
                type="text" 
                id="ownerId"
                value={ownerId}
                onChange={(e) => setOwnerId(e.target.value)}
                placeholder="STORE-123" 
                className="w-full bg-dark px-5 py-4 rounded-xl border border-border focus:outline-none focus:border-neon/50 transition-all text-sm text-text-primary placeholder-label/30"
                required
              />
            </div>
          )}
          
          <div className="focus-within:translate-x-1 transition-transform">
            <label className="block text-[10px] uppercase tracking-widest font-black text-label mb-3" htmlFor="password">
              {!isHelper ? 'Security Password' : 'Staff PIN'}
            </label>
            <input 
              type="password" 
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••" 
              className="w-full bg-dark px-5 py-4 rounded-xl border border-border focus:outline-none focus:border-neon/50 transition-all text-sm text-text-primary placeholder-label/30"
              required
            />
          </div>
          
          <button 
            type="submit" 
            className="w-full bg-neon text-dark font-black py-4 rounded-xl shadow-xl transition-all mt-6 active:scale-95 hover:bg-white uppercase tracking-widest text-[10px]"
          >
            Access Dashboard
          </button>
        </form>
        
        {!isHelper && (
          <p className="text-center text-xs text-label mt-12 italic">
            Don't have an account?{' '}
            <Link to="/auth/signup" className="font-bold text-neon hover:text-text-primary transition-all underline decoration-neon/30 underline-offset-4">Create one</Link>
          </p>
        )}
      </div>
    </div>


  );
};

export default Login;
