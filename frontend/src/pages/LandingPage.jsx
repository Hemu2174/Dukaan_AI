import { useRef, useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import HeroVideo from '../components/HeroVideo';

const LandingPage = () => {
  const navigate = useNavigate();
  const bgVideoRef = useRef(null);
  const [isDarkMode, setIsDarkMode] = useState(true);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'dark';
    if (savedTheme === 'dark') {
      document.documentElement.classList.add('dark');
      setIsDarkMode(true);
    } else {
      document.documentElement.classList.remove('dark');
      setIsDarkMode(false);
    }
  }, []);

  const toggleTheme = () => {
    const newDark = !isDarkMode;
    setIsDarkMode(newDark);
    if (newDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  useEffect(() => {
    const video = bgVideoRef.current;
    if (!video) return;

    const handleLoop = () => {
      video.style.opacity = 1;
    };

    video.addEventListener('loadeddata', handleLoop);
    
    return () => {
      video.removeEventListener('loadeddata', handleLoop);
    };
  }, []);

  return (
    <div className="bg-dark text-text-primary selection:bg-neon selection:text-dark">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 w-full z-[100] px-6 py-5 flex justify-between items-center bg-dark/80 border-b border-border backdrop-blur-md">
        <div className="text-2xl font-heading font-bold tracking-tight text-accent">DukaanAI®</div>
        
        <div className="hidden md:flex gap-8 items-center text-sm font-medium">
          <a href="#" className="hover:text-neon transition-colors">Home</a>
          <a href="#features" className="text-text-secondary hover:text-text-primary transition-colors">Features</a>
          <a href="#about" className="text-text-secondary hover:text-text-primary transition-colors">About</a>
          <a href="#contact" className="text-text-secondary hover:text-text-primary transition-colors">Contact</a>
        </div>

        <div className="flex gap-4 items-center">
          <button 
            onClick={toggleTheme}
            className="w-10 h-10 flex items-center justify-center bg-section rounded-xl border border-border hover:border-neon transition-all mr-2"
            title="Toggle Theme"
          >
            {isDarkMode ? '☀️' : '🌙'}
          </button>
          
          <Link to="/auth/login" className="hidden sm:block text-sm font-medium text-text-secondary hover:text-text-primary transition-colors">Login</Link>
          <button 
            onClick={() => navigate('/auth/signup')}
            className="bg-accent text-dark px-5 py-2 rounded-full font-bold text-sm hover:scale-105 active:scale-95 transition-all shadow-xl"
          >
            Start Free
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative h-screen w-full overflow-hidden flex items-center justify-center pt-20">
        <div className="absolute inset-0 z-0">
          <video
            ref={bgVideoRef}
            muted
            playsInline
            autoPlay
            loop
            className="w-full h-full object-cover grayscale opacity-30 transition-opacity duration-1000 hero-video-bg"
            src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260328_083109_283f3553-e28f-428b-a723-d639c617eb2b.mp4"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-dark via-transparent to-dark" />
          <div className="absolute inset-0 bg-gradient-to-r from-dark/60 via-transparent to-dark/60" />
        </div>

        <div className="relative z-10 container mx-auto px-6 grid md:grid-cols-2 gap-12 items-center">
          <div className="text-center md:text-left flex flex-col items-center md:items-start text-text-primary">
            <h1 className="text-5xl md:text-8xl font-heading font-medium leading-[1.1] mb-6 animate-fade-rise">
              Let AI Run Your <br />
              <span className="text-accent italic">Shop Smartly</span>
            </h1>
            <p className="text-lg md:text-xl text-text-secondary max-w-lg mb-10 animate-fade-rise-delay leading-relaxed">
              Track Sales, Profit & Stock — <span className="text-text-primary font-semibold">Just By Speaking</span>. No typing. No accounting. Just speak in your language.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 animate-fade-rise-delay-2">
              <button 
                onClick={() => navigate('/auth/signup')}
                className="bg-accent text-dark px-8 py-4 rounded-full font-bold text-lg hover:scale-105 active:scale-95 transition-all shadow-xl"
              >
                Start Free
              </button>
              <button className="border border-border hover:bg-section px-8 py-4 rounded-full font-bold text-lg transition-all backdrop-blur-sm text-text-primary">
                Watch Demo
              </button>
            </div>
          </div>

          {/* Animated Hero Video Column */}
          <div className="hidden md:flex justify-center animate-fade-rise-delay-2">
            <HeroVideo />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-32 px-6 bg-dark">
        <div className="container mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-6xl font-heading mb-4 italic text-text-primary">Built for Kirana Growth</h2>
            <p className="text-text-secondary">The first AI assistant that understands your shop's heartbeat.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-8">
            <div className="bg-card p-10 rounded-[2.5rem] group hover:bg-section transition-all duration-500 border border-border">
               <div className="w-12 h-12 bg-neon/10 rounded-2xl flex items-center justify-center text-accent text-2xl mb-6 group-hover:scale-110 transition-transform">🎤</div>
               <h3 className="text-3xl font-heading mb-4 capitalize text-text-primary">Voice-Based Tracking</h3>
               <p className="text-text-secondary leading-relaxed font-sans">Stop writing in notebooks. Just speak your transactions in Telugu, Hindi or English. AI logs everything automatically — no typing required.</p>
            </div>
            
            <div className="bg-card p-10 rounded-[2.5rem] group hover:bg-section transition-all duration-500 border border-border">
               <div className="w-12 h-12 bg-neon/10 rounded-2xl flex items-center justify-center text-accent text-2xl mb-6 group-hover:scale-110 transition-transform">📊</div>
               <h3 className="text-3xl font-heading mb-4 capitalize text-text-primary">AI Business Insights</h3>
               <p className="text-text-secondary leading-relaxed font-sans">Get daily profit summaries, weekly performance charts, and low-stock alerts. Transition from guessing to knowing exactly how your business is doing.</p>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-32 bg-section border-y border-border">
        <div className="container mx-auto px-6">
          <h2 className="text-4xl md:text-6xl font-heading text-center mb-20 italic text-text-primary">How it Works</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { num: 1, title: 'Speak', sub: 'Tell AI your transaction' },
              { num: 2, title: 'Analyze', sub: 'AI logs & categorizes' },
              { num: 3, title: 'Summary', sub: 'Get daily profit reports' },
              { num: 4, title: 'Alerts', sub: 'Get stock & habit alerts' }
            ].map(item => (
              <div key={item.num} className="text-center group">
                <div className="w-16 h-16 rounded-full bg-card border border-border flex items-center justify-center text-2xl mb-6 mx-auto group-hover:border-neon transition-colors font-heading italic text-text-primary">{item.num}</div>
                <h4 className="font-bold mb-2 font-sans text-text-primary">{item.title}</h4>
                <p className="text-xs text-text-secondary font-sans">{item.sub}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-32 px-6 bg-dark">
        <div className="container mx-auto max-w-5xl">
          <div className="grid md:grid-cols-2 gap-8 font-heading italic text-4xl">
             <blockquote className="bg-card p-10 rounded-[2.5rem] border border-border text-text-primary">
                “Now I know my daily profit without touching a calculator. Amazing.”
                <cite className="block font-sans not-italic text-sm text-text-secondary mt-6 font-bold">— Rajesh, Kirana Owner</cite>
             </blockquote>
             <blockquote className="bg-card p-10 rounded-[2.5rem] border border-border text-text-primary mt-20">
                “I just speak what I sell, no more writing in old books. My shop feels modern.”
                <cite className="block font-sans not-italic text-sm text-text-secondary mt-6 font-bold">— Venkatesh G.</cite>
             </blockquote>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-32 px-6 bg-dark">
        <div className="container mx-auto max-w-4xl bg-section p-16 rounded-[4rem] text-center border border-border bg-gradient-to-br from-accent/5 to-transparent">
           <h2 className="text-5xl md:text-7xl font-heading mb-6 tracking-tight italic leading-tight text-text-primary">Ready to Understand <br/> Your Business?</h2>
           <p className="text-text-secondary mb-10 text-lg font-sans">No training. No accounting skills needed. Just speak.</p>
           <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button 
                onClick={() => navigate('/auth/signup')}
                className="bg-accent text-dark px-10 py-5 rounded-full font-bold text-xl hover:scale-105 active:scale-95 transition-all shadow-xl"
              >
                Start Free
              </button>
              <button 
                onClick={() => navigate('/auth/login')}
                className="bg-section border border-border hover:bg-dark px-10 py-5 rounded-full font-bold text-xl transition-all text-text-primary"
              >
                Try Demo
              </button>
           </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-20 px-6 border-t border-border bg-dark">
        <div className="container mx-auto grid grid-cols-2 md:grid-cols-4 gap-12 mb-20">
           <div>
             <h5 className="font-heading text-xl mb-6 text-accent">DukaanAI®</h5>
             <p className="text-sm text-text-secondary">AI assistant for India's heart — the kirana store.</p>
           </div>
           <div>
             <h6 className="font-bold text-xs uppercase tracking-widest text-text-primary mb-6 font-sans">Product</h6>
             <ul className="space-y-4 text-sm text-text-secondary font-sans">
               <li><a href="#" className="hover:text-accent transition-colors">Pricing</a></li>
               <li><a href="#" className="hover:text-accent transition-colors">Features</a></li>
             </ul>
           </div>
           <div>
             <h6 className="font-bold text-xs uppercase tracking-widest text-text-primary mb-6 font-sans">Social</h6>
             <ul className="space-y-4 text-sm text-text-secondary font-sans">
               <li><a href="#" className="hover:text-accent transition-colors">Twitter</a></li>
               <li><a href="#" className="hover:text-accent transition-colors">Instagram</a></li>
             </ul>
           </div>
        </div>
        <div className="container mx-auto flex flex-col md:flex-row justify-between items-center text-[10px] text-text-secondary uppercase tracking-[0.2em] font-sans border-t border-border pt-10">
           <p>© 2026 DukaanAI Technologies Pvt Ltd.</p>
           <div className="flex gap-8">
             <a href="#" className="hover:text-accent transition-colors">Privacy</a>
             <a href="#" className="hover:text-accent transition-colors">Terms</a>
           </div>
        </div>
      </footer>
    </div>

  );
};

export default LandingPage;
