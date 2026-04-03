import { useRef, useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

const LandingPage = () => {
  const navigate = useNavigate();
  const videoRef = useRef(null);
  const [isVideoVisible, setIsVideoVisible] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    let fadeTimeout;

    const handleVideoLoop = () => {
      // Manual loop with fades
      const duration = video.duration;
      
      const checkFade = () => {
        if (!video) return;
        const currentTime = video.currentTime;

        // Fade in first 0.5s
        if (currentTime < 0.5) {
          video.style.opacity = currentTime / 0.5;
        } 
        // Fade out last 0.5s
        else if (currentTime > duration - 0.5) {
          video.style.opacity = (duration - currentTime) / 0.5;
        } 
        else {
          video.style.opacity = 1;
        }

        if (currentTime >= duration - 0.05) {
          video.style.opacity = 0;
          setTimeout(() => {
            if (video) {
              video.currentTime = 0;
              video.play();
            }
          }, 100);
          return;
        }

        fadeTimeout = requestAnimationFrame(checkFade);
      };

      fadeTimeout = requestAnimationFrame(checkFade);
    };

    video.addEventListener('loadedmetadata', handleVideoLoop);
    setIsVideoVisible(true);

    return () => {
      cancelAnimationFrame(fadeTimeout);
      video.removeEventListener('loadedmetadata', handleVideoLoop);
    };
  }, []);

  return (
    <div className="bg-dark text-white selection:bg-neon selection:text-dark">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 w-full z-[100] px-6 py-5 flex justify-between items-center glass-card border-none rounded-none backdrop-blur-md">
        <div className="text-2xl font-heading font-bold tracking-tight neon-glow">DukaanAI®</div>
        
        <div className="hidden md:flex gap-8 items-center text-sm font-medium">
          <a href="#" className="hover:text-neon transition-colors">Home</a>
          <a href="#features" className="text-gray-400 hover:text-white transition-colors">Features</a>
          <a href="#about" className="text-gray-400 hover:text-white transition-colors">About</a>
          <a href="#contact" className="text-gray-400 hover:text-white transition-colors">Contact</a>
        </div>

        <div className="flex gap-4 items-center">
          <Link to="/auth/login" className="hidden sm:block text-sm font-medium text-gray-400 hover:text-white transition-colors">Login</Link>
          <button 
            onClick={() => navigate('/auth/signup')}
            className="bg-neon text-dark px-5 py-2 rounded-full font-bold text-sm hover:scale-105 active:scale-95 transition-all shadow-[0_0_20px_rgba(163,255,18,0.2)]"
          >
            Start Free
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative h-screen w-full overflow-hidden flex items-center justify-center pt-20">
        {/* Cinematic Video Background */}
        <div className="absolute inset-0 z-0">
          <video
            ref={videoRef}
            muted
            playsInline
            autoPlay
            className="w-full h-full object-cover grayscale opacity-0 transition-opacity duration-1000"
            style={{ filter: 'brightness(0.4) contrast(1.2)' }}
          >
            <source src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260328_083109_283f3553-e28f-428b-a723-d639c617eb2b.mp4" type="video/mp4" />
          </video>
          {/* Gradients */}
          <div className="absolute inset-0 bg-gradient-to-b from-dark via-transparent to-dark" />
          <div className="absolute inset-0 bg-gradient-to-r from-dark/60 via-transparent to-dark/60" />
        </div>

        <div className="relative z-10 container mx-auto px-6 grid md:grid-cols-2 gap-12 items-center">
          <div className="text-center md:text-left flex flex-col items-center md:items-start">
            <h1 className="text-5xl md:text-8xl font-heading font-medium leading-[1.1] mb-6 animate-fade-rise">
              Let AI Run Your <br />
              <span className="text-neon neon-glow italic">Shop Smartly</span>
            </h1>
            <p className="text-lg md:text-xl text-gray-400 max-w-lg mb-10 animate-fade-rise-delay leading-relaxed">
              Track Sales, Profit & Stock — <span className="text-white font-semibold">Just By Speaking</span>. No typing. No accounting. Just speak in your language.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 animate-fade-rise-delay-2">
              <button 
                onClick={() => navigate('/auth/signup')}
                className="bg-neon text-dark px-8 py-4 rounded-full font-bold text-lg hover:scale-105 active:scale-95 transition-all shadow-[0_0_30px_rgba(163,255,18,0.3)]"
              >
                Start Free
              </button>
              <button className="border border-white/20 hover:bg-white/5 px-8 py-4 rounded-full font-bold text-lg transition-all backdrop-blur-sm">
                Watch Demo
              </button>
            </div>
          </div>

          {/* Mobile Mockup UI */}
          <div className="hidden md:flex justify-center animate-fade-rise-delay-2">
            <div className="w-[300px] h-[600px] bg-[#151515] rounded-[3rem] border-[8px] border-[#222] shadow-2xl relative overflow-hidden">
               {/* Mock UI Content */}
               <div className="p-6 h-full flex flex-col">
                  <div className="flex justify-between items-center mb-10">
                    <div className="w-10 h-10 bg-neon rounded-full flex items-center justify-center text-dark font-bold">A</div>
                    <div className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">DukaanAI Dashboard</div>
                  </div>
                  
                  <div className="bg-[#222] p-4 rounded-2xl mb-4 border border-white/5">
                    <p className="text-[10px] text-gray-500 uppercase font-bold mb-1">Total Sales Today</p>
                    <p className="text-2xl font-bold font-heading text-neutral-200">₹12,450</p>
                  </div>

                  <div className="bg-[#222] p-4 rounded-2xl mb-6 border border-white/5">
                    <p className="text-[10px] text-neon uppercase font-bold mb-1">Real-time Profit</p>
                    <p className="text-2xl font-bold font-heading text-neon">+ ₹2,840</p>
                  </div>

                  <div className="mt-auto items-center flex flex-col pb-10">
                    <div className="w-16 h-16 bg-neon rounded-full flex items-center justify-center shadow-[0_0_40px_rgba(163,255,18,0.4)] animate-pulse mb-4">
                      <span className="text-2xl">🎤</span>
                    </div>
                    <p className="text-xs text-neon font-bold">Listening...</p>
                    <p className="text-[10px] text-gray-400 mt-2 italic text-center">"Amul milk 2 packets sell cash"</p>
                  </div>
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-32 px-6">
        <div className="container mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-6xl font-heading mb-4 italic">Built for Kirana Growth</h2>
            <p className="text-gray-400">The first AI assistant that understands your shop's heartbeat.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-8">
            <div className="glass-card p-10 rounded-[2.5rem] group hover:bg-white/[0.05] transition-all duration-500">
               <div className="w-12 h-12 bg-neon/10 rounded-2xl flex items-center justify-center text-neon text-2xl mb-6 group-hover:scale-110 transition-transform">🎤</div>
               <h3 className="text-3xl font-heading mb-4 capitalize">Voice-Based Tracking</h3>
               <p className="text-gray-400 leading-relaxed">Stop writing in notebooks. Just speak your transactions in Telugu, Hindi or English. AI logs everything automatically — no typing required.</p>
            </div>
            
            <div className="glass-card p-10 rounded-[2.5rem] group hover:bg-white/[0.05] transition-all duration-500">
               <div className="w-12 h-12 bg-neon/10 rounded-2xl flex items-center justify-center text-neon text-2xl mb-6 group-hover:scale-110 transition-transform">📊</div>
               <h3 className="text-3xl font-heading mb-4 capitalize">AI Business Insights</h3>
               <p className="text-gray-400 leading-relaxed">Get daily profit summaries, weekly performance charts, and low-stock alerts. Transition from guessing to knowing exactly how your business is doing.</p>
            </div>
          </div>

          {/* Core Value */}
          <div className="mt-32 text-center max-w-4xl mx-auto">
            <h2 className="text-4xl md:text-6xl font-heading mb-8 italic">From Guessing to <span className="text-neon neon-glow">Knowing</span></h2>
            <div className="grid md:grid-cols-2 gap-12 mt-16 text-left items-center">
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center font-bold">✕</div>
                  <div>
                    <p className="font-bold text-white">Before: Confusion</p>
                    <p className="text-sm text-gray-500">How much did I sell? Is the milk expiring? Whose credit is pending? You never know until it's too late.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-neon/10 text-neon flex items-center justify-center font-bold">✓</div>
                  <div>
                    <p className="font-bold text-white">After: Total Clarity</p>
                    <p className="text-sm text-gray-400">Live profit tracking. Stock prediction. Distributor reordering. You are 100% in control of every rupee.</p>
                  </div>
                </div>
              </div>
              <div className="glass-card p-8 rounded-[2rem] border-neon/20 shadow-[0_0_50px_rgba(163,255,18,0.05)]">
                <h4 className="text-2xl font-heading mb-4">Stock Prediction</h4>
                <div className="space-y-4">
                  <div className="flex justify-between items-center text-xs">
                    <span>Sugar</span>
                    <span className="text-neon">3 Days Left</span>
                  </div>
                  <div className="w-full h-1 bg-[#222] rounded-full overflow-hidden">
                    <div className="w-[30%] h-full bg-neon" />
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span>Cooking Oil</span>
                    <span className="text-orange-500">7 Days Left</span>
                  </div>
                  <div className="w-full h-1 bg-[#222] rounded-full overflow-hidden">
                    <div className="w-[70%] h-full bg-orange-500" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-32 bg-white/[0.02] border-y border-white/5">
        <div className="container mx-auto px-6">
          <h2 className="text-4xl md:text-6xl font-heading text-center mb-20 italic">How it Works</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center group">
              <div className="w-16 h-16 rounded-full bg-[#111] border border-white/10 flex items-center justify-center text-2xl mb-6 mx-auto group-hover:border-neon transition-colors">1</div>
              <h4 className="font-bold mb-2">Speak</h4>
              <p className="text-xs text-gray-500">Tell AI your transaction</p>
            </div>
            <div className="text-center group">
              <div className="w-16 h-16 rounded-full bg-[#111] border border-white/10 flex items-center justify-center text-2xl mb-6 mx-auto group-hover:border-neon transition-colors">2</div>
              <h4 className="font-bold mb-2">Analyze</h4>
              <p className="text-xs text-gray-500">AI logs & categorizes</p>
            </div>
            <div className="text-center group">
              <div className="w-16 h-16 rounded-full bg-[#111] border border-white/10 flex items-center justify-center text-2xl mb-6 mx-auto group-hover:border-neon transition-colors">3</div>
              <h4 className="font-bold mb-2">Summary</h4>
              <p className="text-xs text-gray-500">Get daily profit reports</p>
            </div>
            <div className="text-center group">
              <div className="w-16 h-16 rounded-full bg-[#111] border border-white/10 flex items-center justify-center text-2xl mb-6 mx-auto group-hover:border-neon transition-colors">4</div>
              <h4 className="font-bold mb-2">Alerts</h4>
              <p className="text-xs text-gray-500">Get stock & habit alerts</p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-32 px-6">
        <div className="container mx-auto max-w-5xl">
          <div className="grid md:grid-cols-2 gap-8 font-heading italic text-4xl">
             <div className="flex flex-col gap-8">
                <blockquote className="glass-card p-10 rounded-[2.5rem]">
                   “Now I know my daily profit without touching a calculator. Amazing.”
                   <cite className="block font-sans not-italic text-sm text-gray-500 mt-6">— Rajesh, Kirana Owner</cite>
                </blockquote>
             </div>
             <div className="flex flex-col gap-8 pt-20">
                <blockquote className="glass-card p-10 rounded-[2.5rem]">
                   “I just speak what I sell, no more writing in old books. My shop feels modern.”
                   <cite className="block font-sans not-italic text-sm text-gray-500 mt-6">— Venkatesh G.</cite>
                </blockquote>
             </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-32 px-6">
        <div className="container mx-auto max-w-4xl glass-card p-16 rounded-[4rem] text-center bg-gradient-to-br from-neon/10 to-transparent">
           <h2 className="text-5xl md:text-7xl font-heading mb-6 tracking-tight italic leading-none">Ready to Understand <br/> Your Business?</h2>
           <p className="text-gray-400 mb-10 text-lg">No training. No accounting skills needed. Just speak.</p>
           <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button 
                onClick={() => navigate('/auth/signup')}
                className="bg-neon text-dark px-10 py-5 rounded-full font-bold text-xl hover:scale-105 active:scale-95 transition-all"
              >
                Start Free
              </button>
              <button 
                onClick={() => navigate('/auth/login')}
                className="bg-white/5 border border-white/10 hover:bg-white/10 px-10 py-5 rounded-full font-bold text-xl transition-all"
              >
                Try Demo
              </button>
           </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-20 px-6 border-t border-white/5">
        <div className="container mx-auto grid grid-cols-2 md:grid-cols-4 gap-12 mb-20">
           <div>
             <h5 className="font-heading text-xl mb-6 neon-glow">DukaanAI®</h5>
             <p className="text-sm text-gray-500">AI assistant for India's heart — the kirana store.</p>
           </div>
           <div>
             <h6 className="font-bold text-sm uppercase tracking-widest text-neutral-300 mb-6 font-sans">Product</h6>
             <ul className="space-y-4 text-sm text-gray-500 font-sans">
               <li><a href="#" className="hover:text-white transition-colors">Pricing</a></li>
               <li><a href="#" className="hover:text-white transition-colors">Features</a></li>
               <li><a href="#" className="hover:text-white transition-colors">Security</a></li>
             </ul>
           </div>
           <div>
             <h6 className="font-bold text-sm uppercase tracking-widest text-neutral-300 mb-6 font-sans">Company</h6>
             <ul className="space-y-4 text-sm text-gray-500 font-sans">
               <li><a href="#" className="hover:text-white transition-colors">About Us</a></li>
               <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
               <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
             </ul>
           </div>
           <div>
             <h6 className="font-bold text-sm uppercase tracking-widest text-neutral-300 mb-6 font-sans">Social</h6>
             <ul className="space-y-4 text-sm text-gray-500 font-sans">
               <li><a href="#" className="hover:text-white transition-colors">Twitter</a></li>
               <li><a href="#" className="hover:text-white transition-colors">LinkedIn</a></li>
               <li><a href="#" className="hover:text-white transition-colors">Instagram</a></li>
             </ul>
           </div>
        </div>
        <div className="container mx-auto flex flex-col md:flex-row justify-between items-center text-[10px] text-gray-600 uppercase tracking-[0.2em] font-sans">
           <p>© 2026 DukaanAI Technologies Pvt Ltd.</p>
           <div className="flex gap-8 mt-4 md:mt-0">
             <a href="#">Privacy Policy</a>
             <a href="#">Terms of Service</a>
           </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
