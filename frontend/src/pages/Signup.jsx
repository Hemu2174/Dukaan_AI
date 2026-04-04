import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const Signup = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(`${API_URL}/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('role', data.role);
        navigate('/dashboard');
      } else {
        alert(data.error || 'Signup failed');
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
        
        <h2 className="text-3xl font-heading font-medium text-text-primary mb-2 italic">Power Up Your Shop</h2>
        <p className="text-text-secondary mb-10 text-sm leading-relaxed font-sans font-light">Join DukaanAI and track your grocery empire with just your voice.</p>
        
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="focus-within:translate-x-1 transition-transform">
            <label className="block text-[10px] uppercase tracking-widest font-black text-label mb-3" htmlFor="name">Full Name</label>
            <input 
              type="text" 
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Bhargav Kumar" 
              className="w-full bg-dark px-5 py-4 rounded-xl border border-border focus:outline-none focus:border-neon/50 transition-all text-sm text-text-primary placeholder-label/30"
              required
            />
          </div>
          
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
          
          <div className="focus-within:translate-x-1 transition-transform">
            <label className="block text-[10px] uppercase tracking-widest font-black text-label mb-3" htmlFor="password">Security Password</label>
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
            Create My Account
          </button>
        </form>
        
        <p className="text-center text-xs text-label mt-12 italic">
          Already have an account?{' '}
          <Link to="/auth/login" className="font-bold text-neon hover:text-text-primary transition-all underline decoration-neon/30 underline-offset-4">Sign in</Link>
        </p>
      </div>
    </div>


  );
};

export default Signup;
