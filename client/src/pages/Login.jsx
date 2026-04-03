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
    <div className="p-4 h-full flex flex-col justify-center min-h-[calc(100dvh-160px)] w-full">
      <div className="bg-white rounded-xl shadow border border-gray-100 p-5 w-full transition-all">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1">Welcome back</h2>
        <p className="text-gray-400 sm:text-gray-500 mb-6 text-xs sm:text-sm">Sign in to manage your dukaan.</p>
        
        <div className="flex mb-6 bg-gray-100 p-1 rounded-lg">
          <button 
            className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${!isHelper ? 'bg-white shadow-sm text-primary' : 'text-gray-500'}`}
            onClick={() => setIsHelper(false)}
          >
            Owner
          </button>
          <button 
            className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${isHelper ? 'bg-white shadow-sm text-primary' : 'text-gray-500'}`}
            onClick={() => setIsHelper(true)}
          >
            Helper
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isHelper ? (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5" htmlFor="email">Email</label>
              <input 
                type="email" 
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email" 
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm"
                required
              />
            </div>
          ) : (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5" htmlFor="ownerId">Store ID</label>
              <input 
                type="text" 
                id="ownerId"
                value={ownerId}
                onChange={(e) => setOwnerId(e.target.value)}
                placeholder="Enter Store ID" 
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm"
                required
              />
            </div>
          )}
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5" htmlFor="password">
              {!isHelper ? 'Password' : 'PIN'}
            </label>
            <input 
              type="password" 
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••" 
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm"
              required
            />
            {!isHelper && (
              <div className="flex justify-end mt-1.5">
                <a href="#" className="text-xs font-medium text-primary hover:text-primary-dark">Forgot password?</a>
              </div>
            )}
          </div>
          
          <button 
            type="submit" 
            className="w-full bg-primary hover:bg-primary-dark text-white font-semibold py-3.5 rounded-xl shadow-md transition-all mt-4 active:scale-[0.98] focus:ring-2 focus:ring-primary/50 focus:outline-none"
          >
            Sign In
          </button>
        </form>
        
        {!isHelper && (
          <p className="text-center text-sm text-gray-500 mt-8">
            Don't have an account?{' '}
            <Link to="/auth/signup" className="font-semibold text-primary hover:text-primary-dark transition-colors">Sign up</Link>
          </p>
        )}
      </div>
    </div>
  );
};

export default Login;
